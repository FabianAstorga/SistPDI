import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { LoginDrawer } from "./LoginDrawer";
import { X, RefreshCw, Send, MessageSquare, AlertCircle, Hash, Calendar } from 'lucide-react';

/** * PANEL UNIFICADO V4.9 - PDI Intranet 2026
 * Optimizaciones: Grid estructural 4x6 en Modal, Feedback funcional y Estética Industrial.
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
                                    <span className="text-blue-500">{isLoggedIn ? 'ADMINISTADOR' : currentYear}</span>
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

                <section ref={carouselRef} className="snap-start w-full h-screen flex flex-col justify-center bg-slate-200 relative overflow-hidden transition-colors duration-500">
                    <div className="max-w-7xl mx-auto w-full px-6 mb-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-[#002855] uppercase tracking-tighter">Acuerdos Destacados</h2>
                        <div className="w-16 h-1.5 bg-[#002855] mx-auto mt-2" />
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
                    <CarouselDots snaps={scrollSnaps} selectedIndex={selectedIndex} onDotClick={scrollTo} />
                </section>

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

            <AnimatePresence>
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

const ModalDetalle = React.memo(({ data, onClose }: any) => {
    const [comentarios, setComentarios] = useState<any[]>([]);
    const [loadingComentarios, setLoadingComentarios] = useState(true);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [nombreInput, setNombreInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const fetchComentarios = useCallback(async () => {
        try {
            setLoadingComentarios(true);
            const res = await fetch(`${API_BASE}/api/Comentarios/${data.id}`);
            if (res.ok) {
                const json = await res.json();
                setComentarios(Array.isArray(json) ? json : []);
            }
        } catch (e) {
            console.error("Error al cargar comentarios", e);
        } finally {
            setLoadingComentarios(false);
        }
    }, [data.id]);

    useEffect(() => {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                if (user.nombre) setNombreInput(user.nombre);
            } catch (e) { console.error("Error parsing user", e); }
        }
        fetchComentarios();
    }, [fetchComentarios]);

    const handleSendComentario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoComentario.trim() || isSending) return;

        setIsSending(true);
        const formData = new FormData();
        formData.append('idAcuerdo', String(data.id));
        formData.append('Comentario', nuevoComentario.trim());
        formData.append('NombreUsuario', nombreInput.trim() || "Anónimo");

        try {
            const res = await fetch(`${API_BASE}/api/Comentarios/crear`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setNuevoComentario("");
                await fetchComentarios();
            }
        } catch (e) {
            console.error("Error al enviar", e);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-6xl rounded-none overflow-hidden relative z-10 shadow-2xl h-[90vh] md:h-[80vh]">
                <div className="grid grid-cols-4 grid-rows-6 gap-0 h-full">

                    {/* 1: IMAGEN */}
                    <div className="col-span-2 row-span-3 bg-slate-200 relative overflow-hidden border-b border-r border-slate-100">
                        <img src={resolveBackendUrl(data.imagenUrl) || PDI_LOGO_URL} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    </div>

                    {/* 2: COMENTARIOS */}
                    <div className="col-span-2 row-span-6 col-start-3 bg-slate-50 flex flex-col border-l border-slate-200 overflow-hidden">
                        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#002855] flex items-center gap-2">
                                <MessageSquare size={14} className="text-blue-500" /> Feedback Institucional
                            </h4>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-list-scroll bg-slate-50">
                            {loadingComentarios ? (
                                <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-slate-300" /></div>
                            ) : comentarios.length > 0 ? (
                                comentarios.map((c, idx) => (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={idx} className="bg-white p-4 shadow-sm border-l-4 border-blue-600">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter block mb-1">{c.nombreUsuario || "Anónimo"}</span>
                                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{c.comentario}</p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 italic text-slate-400 text-xs font-bold uppercase tracking-widest">Sin comentarios registrados</div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSendComentario} className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text" placeholder="Nombre (Opcional)" value={nombreInput}
                                        onChange={(e) => setNombreInput(e.target.value)}
                                        className="w-1/3 bg-slate-50 border-b-2 border-slate-200 px-3 py-2 text-[10px] font-black outline-none focus:border-blue-500 transition-all uppercase"
                                    />
                                    <input
                                        type="text" placeholder="Escribir feedback..." value={nuevoComentario}
                                        onChange={(e) => setNuevoComentario(e.target.value)}
                                        className="flex-1 bg-slate-50 border-b-2 border-slate-200 px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <button
                                    disabled={!nuevoComentario.trim() || isSending}
                                    className="w-full bg-[#002855] text-white py-2.5 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:bg-slate-300 shadow-lg"
                                >
                                    {isSending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />} {isSending ? "Publicando..." : "Publicar Feedback"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* 4: INFORMACIÓN TÍTULO */}
                    <div className="col-span-2 row-start-4 bg-white p-8 border-r border-slate-100 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">{data.categoria}</span>
                            <span className="text-green-600 text-[9px] font-black uppercase tracking-tighter border border-green-200 px-2 py-0.5">{data.estado || 'Activo'}</span>
                        </div>
                        <h3 className="text-3xl font-black text-[#002855] uppercase leading-none truncate">{data.titulo}</h3>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1"><Hash size={12} /> ID: 2026-{(data.id || 0).toString().padStart(4, '0')}</span>
                            {data.fechaVencimiento && <span className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> VENCE: {new Date(data.fechaVencimiento).toLocaleDateString()}</span>}
                        </div>
                    </div>

                    {/* 5: DESCRIPCIÓN */}
                    <div className="col-span-2 row-span-2 row-start-5 bg-white p-8 pt-0 border-r border-slate-100 overflow-y-auto custom-list-scroll">
                        <div className="w-12 h-1 bg-[#002855] mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Memoria Descriptiva</p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                            {data.detallesDescripcion || data.descripcion || "Información en proceso de validación institucional."}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

const CarouselItem = React.memo(({ item, isActive, onClick }: any) => (
    <div className="embla__slide flex-[0_0_90%] md:flex-[0_0_42%] px-4">
        <motion.div
            onClick={isActive ? onClick : undefined}
            animate={{ scale: isActive ? 1.02 : 0.9, opacity: isActive ? 1 : 0.6 }}
            className={`relative bg-white rounded-none overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex flex-col border-none ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                <img src={resolveBackendUrl(item.imagenUrl) || PDI_LOGO_URL} className="absolute inset-0 w-full h-full object-cover" alt="" />
            </div>
            <div className="bg-[#002855] px-6 py-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-black text-white uppercase leading-none truncate flex-1">{item.titulo}</h3>
                <span className="shrink-0 text-[10px] font-black bg-blue-500 text-white px-2 py-1 uppercase tracking-tighter">{item.categoria}</span>
            </div>
            <div className="p-6 bg-white min-h-[100px] flex items-center">
                <p className="text-slate-600 text-sm font-bold italic line-clamp-2 leading-tight">{item.descripcion}</p>
            </div>
        </motion.div>
    </div>
));