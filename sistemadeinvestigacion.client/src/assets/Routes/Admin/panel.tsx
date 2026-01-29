import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { EmblaCarouselType } from "embla-carousel";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { LoginDrawer } from "./LoginDrawer";

/** * PANEL UNIFICADO V4.5 - PDI Intranet 2026
 * Fix: Transiciones fluidas, validación de sesión optimizada y limpieza de código.
 */

const API_BASE = 'http://localhost:5091';
const PDI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF7ZHFE9xX50BEWjSmAriqYIdJwxiPAMD1cA&s";
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

export type AcuerdoApi = {
    id: number;
    titulo: string;
    descripcion: string;
    detallesDescripcion?: string;
    categoria?: string;
    imagenUrl?: string | null;
    fechaVencimiento?: string;
    estado?: string;
    idEmpresa?: number;
};

export function resolveBackendUrl(path?: string | null) {
    if (!path) return null;
    const s = String(path).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    const normalized = s.startsWith('/') ? s : `/${s}`;
    return `${API_BASE}${normalized}`;
}

function normalizeAcuerdo(a: any): AcuerdoApi {
    return {
        id: Number(a?.idAcuerdo ?? a?.id ?? 0),
        titulo: String(a?.titulo ?? ''),
        descripcion: String(a?.descripcion ?? ''),
        detallesDescripcion: String(a?.detallesDescripcion ?? a?.descripcion ?? ''),
        imagenUrl: a?.imagenUrl,
        categoria: a?.categoria || "Institucional",
        fechaVencimiento: a?.fechaVencimiento,
        estado: a?.estado || "Activo",
        idEmpresa: a?.idEmpresa
    };
}

export default function Panel() {
    const navigate = useNavigate();
    const location = useLocation();
    const carouselRef = useRef<HTMLElement | null>(null);
    const listSectionRef = useRef<HTMLElement | null>(null);

    // Estados de Autenticación y UI
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [userName, setUserName] = useState("");

    // Estados de Datos
    const [mejores, setMejores] = useState<AcuerdoApi[]>([]);
    const [acuerdos, setAcuerdos] = useState<AcuerdoApi[]>([]);
    const [loading, setLoading] = useState(true);
    const currentYear = useMemo(() => new Date().getFullYear(), []);

    const [modalData, setModalData] = useState<AcuerdoApi | null>(null);
    const [inputSearch, setInputSearch] = useState("");

    // Función unificada para validar sesión
    const checkSession = useCallback(() => {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');

        if (token && userJson) {
            setIsLoggedIn(true);
            try {
                const userObj = JSON.parse(userJson);
                setUserName(userObj.nombre ? userObj.nombre.split(' ')[0] : "Funcionario");

                // Si el usuario está logueado pero la URL es la raíz, redirigimos a /panel
                if (location.pathname === "/") {
                    navigate("/panel", { replace: true });
                }
            } catch (e) {
                console.error("Error parsing user", e);
            }
        } else {
            setIsLoggedIn(false);
            setUserName("");
        }
        fetchData();
    }, [location.pathname, navigate]); // Añadimos dependencias clave

    useEffect(() => {
        checkSession();
    }, [location, checkSession]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = {
                accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            const [resMejores, resAll] = await Promise.all([
                fetch(`${API_BASE}/api/Acuerdos/mejores`, { headers }),
                fetch(`${API_BASE}/api/Acuerdos`, { headers })
            ]);
            const mejoresData = resMejores.ok ? await resMejores.json() : [];
            const allData = resAll.ok ? await resAll.json() : [];
            setMejores(Array.isArray(mejoresData) ? mejoresData.map(normalizeAcuerdo) : []);
            setAcuerdos(Array.isArray(allData) ? allData.map(normalizeAcuerdo) : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "center", skipSnaps: false, duration: 25 },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        if (mejores.length > 0) emblaApi.reInit();
    }, [emblaApi, mejores]);

    const filtered = useMemo(() => {
        return acuerdos.filter(a => a.titulo.toLowerCase().includes(inputSearch.toLowerCase()));
    }, [inputSearch, acuerdos]);

    const fadeVariant = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -15 }
    };

    return (
        <div className="fixed inset-0 overflow-hidden bg-white font-sans text-slate-900 selection:bg-[#002855] selection:text-white">

            {/* Navbar reactiva */}
            <AnimatePresence>
                {isLoggedIn && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="z-[100] relative"
                    >
                        <Navbar />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth overflow-x-hidden">

                {/* SECCIÓN 1: HERO */}
                <section className={`snap-start w-full h-screen flex flex-col items-center justify-center px-6 relative bg-[#002855] transition-all duration-700 ${isLoggedIn ? 'pt-16' : 'pt-0'}`}>
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 animate-pulse-slow pointer-events-none" style={{ backgroundImage: `url(${HERO_BG})` }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#002855]/90 via-[#002855]/60 to-[#002855] pointer-events-none" />

                    <div className="max-w-5xl mx-auto text-center z-10">
                        <AnimatePresence mode="wait">
                            {isLoggedIn ? (
                                <motion.div key="logged-in" {...fadeVariant} transition={{ duration: 0.5 }}>
                                    <h2 className="text-blue-400 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base">Bienvenido, {userName}</h2>
                                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 text-white uppercase leading-none">PANEL <span className="text-blue-500">INTERNO</span></h1>
                                    <p className="text-lg text-white/70 font-medium mb-10 max-w-2xl mx-auto">Gestiona y revisa todos los convenios vigentes para el personal institucional.</p>
                                </motion.div>
                            ) : (
                                <motion.div key="logged-out" {...fadeVariant} transition={{ duration: 0.5 }}>
                                    <h2 className="text-blue-400 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base">Portal Institucional</h2>
                                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 text-white uppercase leading-none">ACUERDOS <span className="text-blue-500">{currentYear}</span></h1>
                                    <p className="text-lg text-white/70 font-medium mb-10 max-w-2xl mx-auto">Accede a los convenios y beneficios exclusivos de la institución.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button onClick={() => carouselRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-white text-[#002855] rounded-xl font-black text-lg hover:shadow-2xl transition-all active:scale-95 uppercase tracking-tighter">
                                Ver Destacados
                            </button>

                            <AnimatePresence mode="wait">
                                {isLoggedIn ? (
                                    <motion.button
                                        key="btn-cat"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => listSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                        className="px-10 py-5 bg-transparent border-2 border-white/20 text-white rounded-xl font-black text-lg hover:bg-white/10 transition-all uppercase tracking-tighter"
                                    >
                                        Catálogo Completo
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        key="btn-login"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => setIsLoginOpen(true)}
                                        className="px-10 py-5 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl active:scale-95 uppercase tracking-tighter"
                                    >
                                        Ingreso Funcionarios
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 2: CARRUSEL */}
                <section ref={carouselRef} className={`snap-start w-full h-screen flex flex-col justify-center bg-slate-50 relative overflow-hidden ${isLoggedIn ? 'pt-16' : 'pt-0'}`}>
                    <div className="max-w-7xl mx-auto w-full px-6 mb-2 text-center shrink-0">
                        <h2 className="text-3xl md:text-4xl font-black text-[#002855] tracking-tighter uppercase">Acuerdos Destacados</h2>
                    </div>

                    <div className="w-full relative px-4 py-4 overflow-visible">
                        <div className="embla overflow-visible" ref={emblaRef} key={`${mejores.length}-${isLoggedIn}`}>
                            <div className="embla__container flex items-center">
                                {(mejores.length > 0 ? mejores : acuerdos.slice(0, 6)).map((a, index) => {
                                    const isActive = index === selectedIndex;
                                    return (
                                        <div key={`destacado-${a.id}-${index}`} className="embla__slide flex-[0_0_90%] md:flex-[0_0_55%] lg:flex-[0_0_42%] px-3">
                                            <motion.div
                                                onClick={() => isActive && setModalData(a)}
                                                animate={{ scale: isActive ? 1.02 : 0.9, opacity: isActive ? 1 : 0.4 }}
                                                className={`relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col transition-shadow duration-500 ${isActive ? 'cursor-pointer shadow-blue-900/10' : 'cursor-default'}`}
                                            >
                                                <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                                                    <img src={resolveBackendUrl(a.imagenUrl) || PDI_LOGO_URL} className="absolute inset-0 w-full h-full object-fill" alt={a.titulo} />
                                                </div>
                                                <div className="p-6 md:p-8 bg-white border-t border-slate-100 min-h-[140px] flex flex-col justify-center">
                                                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1 block">{a.categoria}</span>
                                                    <h3 className="text-xl md:text-2xl font-black text-[#002855] uppercase leading-tight mb-2 truncate">{a.titulo}</h3>
                                                    <p className="text-slate-500 text-xs md:text-sm font-medium italic line-clamp-2">{a.descripcion}</p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3 mt-6 mb-4">
                        {scrollSnaps.map((_, i) => (
                            <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`h-2 transition-all rounded-full ${i === selectedIndex ? 'w-10 bg-[#002855]' : 'w-2 bg-slate-300'}`} aria-label={`Ir a slide ${i + 1}`} />
                        ))}
                    </div>
                </section>

                {/* SECCIÓN 3: LISTADO */}
                <section ref={listSectionRef} className={`snap-start w-full h-screen bg-[#002855] text-white py-12 px-6 flex items-center overflow-hidden ${isLoggedIn ? 'pt-16' : 'pt-0'}`}>
                    <div className="max-w-6xl mx-auto w-full flex flex-col h-[80vh]">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Catálogo General</h2>
                                <p className="text-blue-300/60 font-bold mt-2 uppercase tracking-widest text-xs">{filtered.length} Convenios registrados</p>
                            </div>
                            <input
                                type="text"
                                placeholder="Filtrar convenios..."
                                value={inputSearch}
                                onChange={(e) => setInputSearch(e.target.value)}
                                className="bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl outline-none font-bold w-full md:w-80 text-base focus:bg-white focus:text-[#002855] transition-all shadow-2xl"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-list-scroll pb-10">
                            {loading ? (
                                <div className="text-center py-20 animate-spin text-blue-300 uppercase tracking-widest text-xs font-black">Cargando datos...</div>
                            ) : filtered.map((a) => (
                                <motion.div key={`list-${a.id}`} whileHover={{ x: 8 }} onClick={() => setModalData(a)} className="group flex items-center gap-6 bg-white p-4 rounded-xl cursor-pointer shadow-xl text-slate-900">
                                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                                        <img src={resolveBackendUrl(a.imagenUrl) || PDI_LOGO_URL} className="w-full h-full object-cover" alt="Logo" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase mb-1 inline-block">{a.categoria}</span>
                                        <h4 className="text-lg md:text-xl font-black text-[#002855] uppercase leading-tight">{a.titulo}</h4>
                                        <p className="text-slate-500 text-xs italic line-clamp-1">{a.descripcion}</p>
                                    </div>
                                    <div className="bg-[#002855] text-white p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* MODAL DETALLE */}
            <AnimatePresence>
                {modalData && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalData(null)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 h-[90vh] md:h-[75vh]">
                            <div className="bg-slate-100 border-b border-r border-slate-200 overflow-hidden relative aspect-[4/3] md:aspect-auto">
                                <img src={resolveBackendUrl(modalData.imagenUrl) || PDI_LOGO_URL} className="absolute inset-0 w-full h-full object-fill" alt="Logo" />
                            </div>
                            <div className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-200 flex flex-col justify-center">
                                <div className="space-y-4">
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Categoría</p><p className="text-lg font-bold text-[#002855] uppercase">{modalData.categoria}</p></div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Estado</p><p className="text-lg font-bold text-green-600 uppercase">{modalData.estado || 'Activo'}</p></div>
                                    {modalData.fechaVencimiento && (<div><p className="text-[10px] font-black text-slate-400 uppercase">Vencimiento</p><p className="text-lg font-bold text-[#002855] uppercase">{new Date(modalData.fechaVencimiento).toLocaleDateString()}</p></div>)}
                                </div>
                            </div>
                            <div className="p-8 md:p-10 flex flex-col justify-center border-r border-slate-200 bg-white overflow-hidden">
                                <h3 className="text-2xl md:text-3xl font-black text-[#002855] uppercase leading-none mb-3 truncate">{modalData.titulo}</h3>
                                <p className="text-base md:text-lg text-slate-500 font-medium italic line-clamp-3">"{modalData.descripcion}"</p>
                            </div>
                            <div className="p-8 md:p-10 flex flex-col justify-between bg-white overflow-y-auto">
                                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-3">Detalles Técnicos</p><p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{modalData.detallesDescripcion || "No hay detalles registrados."}</p></div>
                                <button onClick={() => setModalData(null)} className="mt-6 py-4 bg-[#002855] text-white rounded-xl font-black hover:bg-blue-800 transition-all uppercase tracking-widest shadow-lg">Cerrar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LOGIN DRAWER */}
            <LoginDrawer
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onLoginSuccess={checkSession}
            />

            <style>{`
                body { overflow: hidden; }
                .custom-list-scroll::-webkit-scrollbar { width: 5px; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
                @keyframes pulse-slow { 0%, 100% { transform: scale(1.05); } 50% { transform: scale(1.07); } }
                .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
            `}</style>
        </div>
    );
}