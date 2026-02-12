import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { LoginDrawer } from "./LoginDrawer";
import { X, RefreshCw, Send, MessageSquare, Trash2, Search } from 'lucide-react';
import { useSignalR } from "../../../context/SignalRContext";

/** * PANEL PRINCIPAL V14.0 - PDI Intranet 2026
 * Fix: Sección 3 con Grid de Cards, Snap Scrolling y Scrollbar a la Izquierda.
 */

const API_BASE = import.meta.env.VITE_API_URL;
const PDI_LOGO_URL = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

const resolveBackendUrl = (path?: string | null) => {
    if (!path) return null;
    const s = String(path).trim();
    if (!s || /^http?:\/\//i.test(s)) return s || null;
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

    const { connection } = useSignalR();
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

    useEffect(() => {
        if (connection) {
            const handleRefresh = () => fetchData();
            connection.on("RecibirActualizacionAcuerdos", handleRefresh);
            return () => { connection.off("RecibirActualizacionAcuerdos", handleRefresh); };
        }
    }, [connection, fetchData]);

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
        return () => { emblaApi.off("select", onSelect).off("reInit", onSelect); };
    }, [emblaApi, onSelect]);

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
                                    <span className="text-blue-500">{isLoggedIn ? 'ADMINISTRADOR' : currentYear}</span>
                                </h1>
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
                <section ref={carouselRef} className="snap-start w-full h-screen flex flex-col justify-center bg-slate-200 relative overflow-hidden transition-colors duration-500">
                    <div className="max-w-7xl mx-auto w-full px-6 mb-2 text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-[#002855] uppercase tracking-tighter">Ultimos Acuerdos</h2>
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

                {/* SECCIÓN 3: CATÁLOGO (Grid con Scroll a la Izquierda) */}
                <section ref={listSectionRef} className="snap-start w-full h-screen bg-[#002855] text-white py-12 px-6 flex flex-col items-center overflow-hidden">
                    <div className="max-w-7xl mx-auto w-full flex flex-col h-full">

                        {/* Cabecera */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Catálogo General</h2>
                                <p className="text-blue-300/60 font-bold mt-2 uppercase text-xs tracking-widest">{filtered.length} Convenios registrados</p>
                            </div>
                            <div className="relative group w-full md:w-96">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="text" placeholder="Filtrar convenios..." value={inputSearch}
                                    onChange={(e) => setInputSearch(e.target.value)}
                                    className="bg-white/10 border-2 border-white/10 text-white pl-16 pr-8 py-4 rounded-2xl outline-none font-bold w-full focus:bg-white focus:text-[#002855] transition-all shadow-2xl"
                                />
                            </div>
                        </div>

                        {/* Contenedor con Scroll a la Izquierda (RTL trick) */}
                        <div className="flex-1 overflow-y-auto custom-list-scroll pr-2" style={{ direction: 'rtl' }}>
                            {/* Revertimos la dirección para el contenido */}
                            <div style={{ direction: 'ltr' }} className="pl-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-40">
                                        <RefreshCw className="animate-spin text-blue-400 mb-4" size={48} />
                                        <span className="font-black uppercase text-xs tracking-[0.3em]">Cargando...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                                        {filtered.map((a) => (
                                            <CardItem key={`list-${a.id}`} item={a} onOpen={() => handleOpenModal(a)} />
                                        ))}
                                    </div>
                                )}

                                {!loading && filtered.length === 0 && (
                                    <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
                                        <p className="text-white/40 font-bold uppercase italic">Sin resultados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Modales */}
            <AnimatePresence>
                {modalData && <ModalDetalle data={modalData} onClose={handleCloseModal} />}
            </AnimatePresence>
            <LoginDrawer isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={checkSession} />

            <style>{`
                .custom-list-scroll::-webkit-scrollbar { width: 6px; }
                .custom-list-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
                @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

// --- ITEM DE TARJETA REDISEÑADO ---
const CardItem = memo(({ item, onOpen }: any) => (
    <motion.div
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpen}
        className="group bg-white border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer h-full min-h-[250px] rounded-sm"
    >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />

        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase mb-2 inline-block italic tracking-widest">
                    {item.categoria}
                </span>
                <h4 className="text-lg font-black text-[#002855] uppercase leading-tight tracking-tighter line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.titulo}
                </h4>
            </div>
            <div className="w-16 h-16 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:bg-white transition-colors">
                <img loading="lazy" src={resolveBackendUrl(item.imagenUrl) || PDI_LOGO_URL} className="w-full h-full object-contain p-2" alt="" />
            </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
            <p className="text-slate-500 text-[11px] font-medium italic line-clamp-3 leading-relaxed">
                {item.descripcion}
            </p>
        </div>
    </motion.div>
));

// --- RESTO DE COMPONENTES IGUALES ---
const CarouselDots = memo(({ snaps, selectedIndex, onDotClick }: any) => (
    <div className="flex justify-center gap-3 mt-8">
        {snaps.map((_: any, i: number) => (
            <button key={i} onClick={() => onDotClick(i)} className={`h-2 rounded-full transition-all ${i === selectedIndex ? 'w-10 bg-[#002855]' : 'w-2 bg-slate-300'}`} />
        ))}
    </div>
));

const CarouselItem = memo(({ item, isActive, onClick }: any) => (
    <div className="embla__slide flex-[0_0_90%] md:flex-[0_0_42%] px-4">
        <motion.div
            onClick={isActive ? onClick : undefined}
            animate={{ scale: isActive ? 0.9 : 0.9, opacity: isActive ? 1 : 0.6 }}
            className={`relative bg-white rounded-none overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex flex-col border-none h-full ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden flex items-center justify-center">
                <img
                    src={resolveBackendUrl(item.imagenUrl) || PDI_LOGO_URL}
                    className="w-full h-full object-contain p-4"
                    alt=""
                />
            </div>

            {/* Ajuste en el contenedor del título */}
            <div className="bg-white px-8 py-5 flex items-start justify-between gap-4 border-b border-slate-50">
                <h3 className="text-xl md:text-2xl font-black text-black uppercase leading-tight flex-1 min-w-0 line-clamp-2">
                    {item.titulo}
                </h3>
                <span className="shrink-0 text-[10px] font-black bg-blue-500 text-white px-2 py-1 uppercase tracking-tighter mt-1">
                    {item.categoria}
                </span>
            </div>

            <div className="p-6 bg-white flex-1 flex items-center">
                <p className="text-slate-600 text-sm font-bold italic line-clamp-2 leading-tight">
                    {item.descripcion}
                </p>
            </div>
        </motion.div>
    </div>
));

const ModalDetalle = memo(({ data, onClose }: any) => {
    const [comentarios, setComentarios] = useState<any[]>([]);
    const [loadingComentarios, setLoadingComentarios] = useState(true);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [nombreInput, setNombreInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = Number(userObj.rol) === 1;

    const handleDelete = async (idComentario: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este comentario?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/Comentarios/eliminar/${idComentario}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setComentarios(prev => prev.filter(c => (c.idComentario ?? c.id) !== idComentario));
        } catch (e) { console.error("Error deleting comment:", e); }
    };

    const fetchComentarios = useCallback(async () => {
        try {
            setLoadingComentarios(true);
            const res = await fetch(`${API_BASE}/api/Comentarios/${data.id}`);
            if (res.ok) {
                const json = await res.json();
                setComentarios(Array.isArray(json) ? [...json].reverse() : []);
            }
        } catch (e) { console.error("Error al cargar comentarios", e); }
        finally { setLoadingComentarios(false); }
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
            const res = await fetch(`${API_BASE}/api/Comentarios/crear`, { method: 'POST', body: formData });
            if (res.ok) {
                setNuevoComentario("");
                await fetchComentarios();
            }
        } catch (e) { console.error("Error al enviar", e); }
        finally { setIsSending(false); }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex justify-center p-0 md:p-10 overflow-y-auto bg-[#001a35]/90 backdrop-blur-sm custom-list-scroll">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[-1]" />
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 20 }} className="bg-white w-full max-w-7xl h-fit rounded-none shadow-2xl relative mb-10 overflow-hidden">
                <header className="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                    <div className="flex-1 min-w-0 pr-6">
                        <h2 className="text-2xl md:text-5xl font-black text-[#002855] uppercase leading-none truncate tracking-tighter">{data.titulo}</h2>
                    </div>
                    <div className="flex items-center gap-8 shrink-0">
                        <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"><X size={32} /></button>
                    </div>
                </header>
                <main className="bg-white">
                    <div className="flex flex-col md:flex-row items-stretch">
                        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-4 border-r border-slate-200">
                            <img src={resolveBackendUrl(data.imagenUrl) || PDI_LOGO_URL} className="max-w-full max-h-[550px] object-contain" alt={data.titulo} />
                        </div>
                        <div className="w-full md:w-1/2 bg-slate-50 flex flex-col max-h-[600px]">
                            <div className="p-8 md:p-20 overflow-y-auto custom-list-scroll">
                                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-blue-600 mb-6 border-b-4 border-blue-600 w-fit pb-2">Detalles de acuerdo</h4>
                                <p className="text-2xl text-[#002855] font-black italic leading-tight mb-8">"{data.descripcion}"</p>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{data.detallesDescripcion || "Información institucional en proceso de actualización."}</p>
                            </div>
                        </div>
                    </div>
                    <section className="bg-white p-8 md:p-24 border-t border-slate-100">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-4 mb-16">
                                <MessageSquare size={32} className="text-[#002855]" />
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#002855]">Comentarios</h3>
                                <div className="h-1 flex-1 bg-slate-100 ml-4" />
                            </div>
                            <form onSubmit={handleSendComentario} className="bg-slate-50 p-10 border border-slate-200 shadow-xl mb-24 relative">
                                <div className="absolute -top-4 left-10 bg-[#002855] text-white text-[10px] font-black px-6 py-2 uppercase tracking-widest shadow-lg">Agregar comentario</div>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-1/3">
                                        <input type="text" placeholder="NOMBRE" value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} className="w-full bg-white border-2 border-slate-100 px-4 py-4 text-xs font-bold outline-none focus:border-[#002855] transition-all uppercase" />
                                    </div>
                                    <div className="flex-1 relative">
                                        <input type="text" placeholder="Escriba su opinión..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} className="w-full bg-white border-2 border-slate-100 pl-6 pr-16 py-4 text-xs font-bold outline-none focus:border-[#002855] transition-all" />
                                        <button disabled={!nuevoComentario.trim() || isSending} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-[#002855] hover:text-blue-600 disabled:opacity-20 transition-all">
                                            {isSending ? <RefreshCw className="animate-spin" /> : <Send />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="divide-y divide-slate-100">
                                {loadingComentarios ? <div className="flex justify-center py-24"><RefreshCw className="animate-spin text-blue-600" size={40} /></div> : comentarios.map((c, idx) => (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={idx} className="py-12 flex gap-10 items-start group">
                                        <div className="shrink-0 w-14 h-14 bg-[#002855] text-white flex items-center justify-center text-lg font-black uppercase shadow-lg">{(c.nombreUsuario || "A")[0].toUpperCase()}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="text-sm font-black text-[#002855] uppercase tracking-wide">{c.nombreUsuario || "Anónimo"}</span>
                                                {isAdmin && <button onClick={() => handleDelete(c.idComentario ?? c.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-all"><Trash2 size={18} /></button>}
                                            </div>
                                            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">{c.comentario}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
                <footer className="p-12 bg-slate-50 flex justify-center border-t border-slate-100">
                    <button onClick={onClose} className="px-16 py-5 bg-[#002855] text-white font-black uppercase tracking-[0.3em] text-sm hover:bg-blue-800 transition-all shadow-2xl active:scale-95">cerrar acuerdo</button>
                </footer>
            </motion.div>
        </div>
    );
});