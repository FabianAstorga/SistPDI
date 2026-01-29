import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { LoginDrawer } from "./LoginDrawer";

/** * PANEL UNIFICADO V4.8 - PDI Intranet 2026
 * Optimizaciones: Memoización de cierres (onClose), indicadores estables y limpieza de basura en Modal.
 */

const API_BASE = 'http://localhost:5091';
const PDI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF7ZHFE9xX50BEWjSmAriqYIdJwxiPAMD1cA&s";
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

const resolveBackendUrl = (path?: string | null) => {
    if (!path) return null;
    const s = String(path).trim();
    if (!s || /^https?:\/\//i.test(s)) return s || null;
    return `${API_BASE}${s.startsWith('/') ? s : `/${s}`}`;
};

const normalizeAcuerdo = (a: any) => ({
    id: Number(a?.idAcuerdo ?? a?.id ?? 0),
    titulo: String(a?.titulo ?? ''),
    descripcion: String(a?.descripcion ?? ''),
    detallesDescripcion: String(a?.detallesDescripcion ?? a?.descripcion ?? ''),
    imagenUrl: a?.imagenUrl,
    categoria: a?.categoria || "Institucional",
    fechaVencimiento: a?.fechaVencimiento,
    estado: a?.estado || "Activo",
    idEmpresa: a?.idEmpresa
});

const FADE_VARIANT = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
};

export default function Panel() {
    const navigate = useNavigate();
    const location = useLocation();
    const carouselRef = useRef<HTMLElement | null>(null);
    const listSectionRef = useRef<HTMLElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [mejores, setMejores] = useState<any[]>([]);
    const [acuerdos, setAcuerdos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState<any | null>(null);
    const [inputSearch, setInputSearch] = useState("");
    const currentYear = useMemo(() => new Date().getFullYear(), []);

    // 1. Memoización de funciones de cierre para evitar basura en el Heap
    const handleCloseModal = useCallback(() => setModalData(null), []);
    const handleOpenModal = useCallback((item: any) => setModalData(item), []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { 'accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
            const [resMejores, resAll] = await Promise.all([
                fetch(`${API_BASE}/api/Acuerdos/mejores`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Acuerdos`, { headers, signal: abortControllerRef.current.signal })
            ]);
            const mejoresData = resMejores.ok ? await resMejores.json() : [];
            const allData = resAll.ok ? await resAll.json() : [];
            setMejores(Array.isArray(mejoresData) ? mejoresData.map(normalizeAcuerdo) : []);
            setAcuerdos(Array.isArray(allData) ? allData.map(normalizeAcuerdo) : []);
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkSession = useCallback(() => {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        if (token && userJson) {
            setIsLoggedIn(true);
            try {
                const userObj = JSON.parse(userJson);
                setUserName(userObj.nombre ? userObj.nombre.split(' ')[0] : "Funcionario");
                if (location.pathname === "/") navigate("/panel", { replace: true });
            } catch (e) { console.error("Session parse error", e); }
        } else {
            setIsLoggedIn(false);
            setUserName("");
        }
        fetchData();
    }, [location.pathname, navigate, fetchData]);

    useEffect(() => {
        checkSession();
        return () => { abortControllerRef.current?.abort(); };
    }, [checkSession]);

    // 2. Configuración de Carrusel con funciones estables
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "center", duration: 25 },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect).on("reInit", onSelect);
        if (mejores.length > 0) emblaApi.reInit();
        return () => {
            emblaApi.off("select", onSelect).off("reInit", onSelect);
        };
    }, [emblaApi, mejores, onSelect]);

    const filtered = useMemo(() => {
        const q = inputSearch.toLowerCase();
        return acuerdos.filter(a => a.titulo.toLowerCase().includes(q));
    }, [inputSearch, acuerdos]);

    return (
        <div className="fixed inset-0 overflow-hidden bg-white font-sans text-slate-900 selection:bg-[#002855] selection:text-white">
            <AnimatePresence>
                {isLoggedIn && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-[100] relative">
                        <Navbar />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth overflow-x-hidden custom-list-scroll">
                {/* SECCIÓN 1: HERO */}
                <section className={`snap-start w-full h-screen flex flex-col items-center justify-center px-6 relative bg-[#002855] transition-all duration-700 ${isLoggedIn ? 'pt-16' : ''}`}>
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 animate-pulse-slow pointer-events-none" style={{ backgroundImage: `url(${HERO_BG})` }} />
                    <div className="max-w-5xl mx-auto text-center z-10">
                        <AnimatePresence mode="wait">
                            <motion.div key={isLoggedIn ? 'login' : 'logout'} {...FADE_VARIANT}>
                                <h2 className="text-blue-400 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base">
                                    {isLoggedIn ? `Bienvenido, ${userName}` : 'Portal Institucional'}
                                </h2>
                                <h1 className="text-5xl md:text-8xl font-black text-white uppercase leading-none mb-6">
                                    {isLoggedIn ? 'PANEL ' : 'ACUERDOS '}
                                    <span className="text-blue-500">{isLoggedIn ? 'INTERNO' : currentYear}</span>
                                </h1>
                                <p className="text-lg text-white/70 font-medium mb-10 max-w-2xl mx-auto">
                                    {isLoggedIn ? 'Gestiona y revisa todos los convenios vigentes.' : 'Accede a los convenios y beneficios exclusivos.'}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button onClick={() => carouselRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-white text-[#002855] rounded-xl font-black text-lg hover:shadow-2xl transition-all active:scale-95 uppercase">Ver Destacados</button>
                            {isLoggedIn ? (
                                <button onClick={() => listSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-transparent border-2 border-white/20 text-white rounded-xl font-black text-lg hover:bg-white/10 transition-all uppercase">Catálogo Completo</button>
                            ) : (
                                <button onClick={() => setIsLoginOpen(true)} className="px-10 py-5 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl uppercase">Ingreso Funcionarios</button>
                            )}
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 2: CARRUSEL */}
                <section ref={carouselRef} className="snap-start w-full h-screen flex flex-col justify-center bg-slate-50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto w-full px-6 mb-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-[#002855] uppercase tracking-tighter">Acuerdos Destacados</h2>
                    </div>
                    <div className="w-full relative px-4 overflow-visible">
                        <div className="embla overflow-visible" ref={emblaRef}>
                            <div className="embla__container flex items-center">
                                {(mejores.length > 0 ? mejores : acuerdos.slice(0, 6)).map((a, idx) => (
                                    <CarouselItem key={`car-${a.id}`} item={a} isActive={idx === selectedIndex} onClick={() => handleOpenModal(a)} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Indicadores memoizados */}
                    <CarouselDots snaps={scrollSnaps} selectedIndex={selectedIndex} onDotClick={scrollTo} />
                </section>

                {/* SECCIÓN 3: LISTADO */}
                <section ref={listSectionRef} className="snap-start w-full h-screen bg-[#002855] text-white py-12 px-6 flex items-center overflow-hidden">
                    <div className="max-w-6xl mx-auto w-full flex flex-col h-[80vh]">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Catálogo General</h2>
                                <p className="text-blue-300/60 font-bold mt-2 uppercase text-xs">{filtered.length} Convenios registrados</p>
                            </div>
                            <input
                                type="text" placeholder="Filtrar convenios..." value={inputSearch}
                                onChange={(e) => setInputSearch(e.target.value)}
                                className="bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl outline-none font-bold w-full md:w-80 focus:bg-white focus:text-[#002855] transition-all shadow-2xl"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-list-scroll pb-10">
                            {loading ? (
                                <div className="text-center py-20 animate-spin text-blue-300 font-black uppercase text-xs">Cargando...</div>
                            ) : filtered.map((a) => (
                                <ListItem key={`list-${a.id}`} item={a} onOpen={() => handleOpenModal(a)} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* MODAL DETALLE CON CIERRE MEMOIZADO */}
            <AnimatePresence onExitComplete={() => window.scrollTo(0, window.scrollY)}>
                {modalData && (
                    <ModalDetalle data={modalData} onClose={handleCloseModal} />
                )}
            </AnimatePresence>

            <LoginDrawer isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={checkSession} />

            <style>{`
                .custom-list-scroll::-webkit-scrollbar { width: 5px; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
                @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

// --- SUBCOMPONENTES MEMOIZADOS (Prevención de Memory Leaks) ---

const CarouselDots = React.memo(({ snaps, selectedIndex, onDotClick }: any) => (
    <div className="flex justify-center gap-3 mt-8">
        {snaps.map((_: any, i: number) => (
            <button
                key={i}
                onClick={() => onDotClick(i)}
                className={`h-2 rounded-full transition-all ${i === selectedIndex ? 'w-10 bg-[#002855]' : 'w-2 bg-slate-300'}`}
            />
        ))}
    </div>
));

const ListItem = React.memo(({ item, onOpen }: any) => (
    <div onClick={onOpen} className="group flex items-center gap-6 bg-white p-4 rounded-xl cursor-pointer shadow-xl text-slate-900 hover:translate-x-2 transition-transform">
        <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
            <img loading="lazy" src={resolveBackendUrl(item.imagenUrl) || PDI_LOGO_URL} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1">
            <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase mb-1 inline-block">{item.categoria}</span>
            <h4 className="text-lg md:text-xl font-black text-[#002855] uppercase leading-tight">{item.titulo}</h4>
            <p className="text-slate-500 text-xs italic line-clamp-1">{item.descripcion}</p>
        </div>
        <div className="bg-[#002855] text-white p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </div>
    </div>
));

const ModalDetalle = React.memo(({ data, onClose }: any) => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 h-[90vh] md:h-[75vh]">
            <div className="bg-slate-100 border-b border-r border-slate-200 relative aspect-[16/9] md:aspect-auto">
                <img src={resolveBackendUrl(data.imagenUrl) || PDI_LOGO_URL} className="absolute inset-0 w-full h-full object-cover" alt="" />
            </div>
            <div className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-200 flex flex-col justify-center">
                <div className="space-y-4">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Categoría</p><p className="text-lg font-bold text-[#002855] uppercase">{data.categoria}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Estado</p><p className="text-lg font-bold text-green-600 uppercase">{data.estado || 'Activo'}</p></div>
                    {data.fechaVencimiento && (<div><p className="text-[10px] font-black text-slate-400 uppercase">Vencimiento</p><p className="text-lg font-bold text-[#002855] uppercase">{new Date(data.fechaVencimiento).toLocaleDateString()}</p></div>)}
                </div>
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center border-r border-slate-200 bg-white">
                <h3 className="text-2xl md:text-3xl font-black text-[#002855] uppercase leading-none mb-3 truncate">{data.titulo}</h3>
                <p className="text-base md:text-lg text-slate-500 font-medium italic line-clamp-3">"{data.descripcion}"</p>
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-between bg-white overflow-y-auto">
                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-3">Detalles</p><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.detallesDescripcion || "No hay detalles."}</p></div>
                <button onClick={onClose} className="mt-6 py-4 bg-[#002855] text-white rounded-xl font-black uppercase shadow-lg">Cerrar</button>
            </div>
        </motion.div>
    </div>
));

const CarouselItem = React.memo(({ item, isActive, onClick }: any) => (
    <div className="embla__slide flex-[0_0_90%] md:flex-[0_0_42%] px-3">
        <motion.div
            onClick={isActive ? onClick : undefined}
            animate={{ scale: isActive ? 1.02 : 0.9, opacity: isActive ? 1 : 0.4 }}
            className={`relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                <img src={resolveBackendUrl(item.imagenUrl) || PDI_LOGO_URL} className="absolute inset-0 w-full h-full object-cover" alt="" />
            </div>
            <div className="p-6 md:p-8 bg-white border-t border-slate-100 min-h-[140px] flex flex-col justify-center">
                <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-1 block">{item.categoria}</span>
                <h3 className="text-xl md:text-2xl font-black text-[#002855] uppercase leading-tight mb-2 truncate">{item.titulo}</h3>
                <p className="text-slate-500 text-xs md:text-sm font-medium italic line-clamp-2">{item.descripcion}</p>
            </div>
        </motion.div>
    </div>
));