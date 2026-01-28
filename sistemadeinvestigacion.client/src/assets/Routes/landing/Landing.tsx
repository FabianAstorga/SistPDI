import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { EmblaCarouselType } from "embla-carousel";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Landing.tsx - PDI Intranet: Plana Mayor 2026
 * Versión: Información en párrafos y solo centro clickeable.
 */

const API_BASE = 'http://localhost:5091';
const PDI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF7ZHFE9xX50BEWjSmAriqYIdJwxiPAMD1cA&s";
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

type Categoria = "Salud" | "Deporte" | "Educación" | "Comercial" | "Investigación";

export type AcuerdoApi = {
    id: number;
    titulo: string;
    descripcion: string;
    detallesDescripcion?: string;
    categoria?: Categoria;
    isNuevo?: boolean;
    imagenUrl?: string | null;
};

export function resolveBackendUrl(path?: string | null) {
    if (!path) return null;
    const s = String(path).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    const normalized = s.startsWith('/') ? s : `/${s}`;
    return `${API_BASE}${normalized}`;
}

export default function Landing() {
    const [acuerdos] = useState<AcuerdoApi[]>([
        { id: 1, titulo: "Gimnasio UrbanFit", descripcion: "25% descuento plan anual.", categoria: "Deporte", detallesDescripcion: "Válido con credencial física o digital en todas las sedes nacionales.", isNuevo: true },
        { id: 2, titulo: "Clínica Dental Santa Apolonia", descripcion: "Limpieza gratis + 20% tratamiento.", categoria: "Salud", detallesDescripcion: "Sujeto a evaluación previa. Incluye radiografía inicial sin costo." },
        { id: 3, titulo: "Cursos TechPro", descripcion: "30% beca automática en diplomados.", categoria: "Educación", detallesDescripcion: "Aplica a toda la oferta académica online para funcionarios y cargas.", isNuevo: true },
        { id: 4, titulo: "Ópticas Visión", descripcion: "Marcos gratis por compra de cristales.", categoria: "Salud", detallesDescripcion: "Válido para marcos seleccionados de la colección actual." },
        { id: 5, titulo: "Agua Suprema", descripcion: "Precio preferencial en bidones de 20L.", categoria: "Comercial", detallesDescripcion: "Despacho gratuito a domicilio institucional." },
    ]);

    const [modalData, setModalData] = useState<AcuerdoApi | null>(null);
    const [inputSearch, setInputSearch] = useState("");
    const carouselRef = useRef<HTMLElement | null>(null);
    const listSectionRef = useRef<HTMLElement | null>(null);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "center", skipSnaps: false },
        [Autoplay({ delay: 4000, stopOnInteraction: false })]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(api => api.scrollSnapList());
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    const filtered = useMemo(() => {
        return acuerdos.filter(a => a.titulo.toLowerCase().includes(inputSearch.toLowerCase()));
    }, [inputSearch, acuerdos]);

    const quickTransition = { duration: 0.2, ease: "easeOut" };

    return (
        <div className="w-full bg-white font-sans text-slate-900 selection:bg-[#002855] selection:text-white">

            {/* SECCIÓN 1: HERO */}
            <section className="w-screen h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#002855]">
                <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 z-1 bg-gradient-to-b from-[#002855]/90 via-[#002855]/60 to-[#002855]" />
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: -50 }} transition={quickTransition} className="max-w-4xl mx-auto text-center z-10">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white uppercase leading-none">Plana mayor 2026</h1>
                    <div className="space-y-1 mb-10 text-white">
                        <p className="text-lg md:text-xl font-bold uppercase tracking-[0.2em]">Listado de acuerdos institucionales</p>
                        <p className="text-blue-200/60 font-medium italic">Periodo: Primer Semestre</p>
                    </div>
                    <button onClick={() => carouselRef.current?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-4 bg-white text-[#002855] rounded-full font-black text-lg hover:shadow-2xl transition-all active:scale-95">Ingreso funcionarios</button>
                </motion.div>
            </section>

            {/* SECCIÓN 2: CARRUSEL */}
            <section ref={carouselRef} className="w-screen h-screen flex flex-col justify-start bg-slate-50 relative overflow-hidden pt-20">
                <div className="max-w-7xl mx-auto w-full px-6 mb-12 text-center shrink-0">
                    <h2 className="text-3xl font-black text-[#002855] tracking-tight mb-2 uppercase">Últimos Acuerdos</h2>
                    <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full" />
                </div>

                <div className="w-full relative px-4">
                    <div className="embla overflow-visible" ref={emblaRef}>
                        <div className="embla__container flex">
                            {acuerdos.map((a, index) => {
                                const isActive = index === selectedIndex;
                                return (
                                    <div key={a.id} className="embla__slide flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_35%] px-4">
                                        <motion.div
                                            // ✅ SOLO LA CENTRAL ES CLICKEABLE
                                            onClick={() => isActive && setModalData(a)}
                                            animate={{ scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.6 }}
                                            whileHover={isActive ? { scale: 1.05 } : {}}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className={`relative aspect-[4/3] bg-white rounded-[32px] overflow-hidden shadow-2xl group border border-slate-200 flex flex-col ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            {a.isNuevo && isActive && (
                                                <div className="absolute top-6 left-6 z-20">
                                                    <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> NUEVO
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex-1 w-full h-full flex items-center justify-center bg-gray-50 p-4">
                                                <img
                                                    src={resolveBackendUrl(a.imagenUrl) || PDI_LOGO_URL}
                                                    className="max-w-full max-h-full object-contain pointer-events-none"
                                                    alt={a.titulo}
                                                />
                                            </div>

                                            {/* INFO EN PÁRRAFOS (Sin Pills) */}
                                            <div className="absolute inset-x-0 bottom-0 p-6 bg-white/95 backdrop-blur-sm border-t border-slate-100">
                                                <h3 className="text-xl md:text-2xl font-black text-[#002855] leading-tight mb-1 uppercase tracking-tighter truncate">
                                                    {a.categoria} - {a.titulo}
                                                </h3>
                                                <p className="text-slate-600 font-medium text-xs line-clamp-1 italic">{a.descripcion}</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-2 mt-12">
                    {scrollSnaps.map((_, i) => (
                        <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`h-1.5 transition-all rounded-full ${i === selectedIndex ? 'w-8 bg-[#002855]' : 'w-2 bg-slate-300'}`} />
                    ))}
                </div>
            </section>

            {/* SECCIÓN 3: LISTADO CON SCROLL INTERNO */}
            <section ref={listSectionRef} className="w-screen h-screen bg-[#002855] text-white py-12 px-6 flex items-center overflow-hidden">
                <div className="max-w-4xl mx-auto w-full flex flex-col h-[75vh]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Catálogo</h2>
                        <input type="text" placeholder="Filtrar por nombre..." value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} className="bg-white text-[#002855] px-6 py-3 rounded-xl outline-none font-bold placeholder:text-slate-400 w-full md:w-56 text-sm shadow-xl" />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-list-scroll">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((a) => (
                                <motion.div key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setModalData(a)} className="group flex items-center gap-5 bg-white p-4 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors w-full shadow-lg text-slate-900">
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-2">
                                        <img src={resolveBackendUrl(a.imagenUrl) || PDI_LOGO_URL} className="max-h-full object-contain" alt="Logo" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-base font-bold text-[#002855] uppercase">
                                            {a.categoria} - {a.titulo}
                                        </h4>
                                        <p className="text-slate-500 text-[10px] line-clamp-1 italic">{a.descripcion}</p>
                                    </div>
                                    <div className="text-[#002855] opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* MODAL */}
            <AnimatePresence>
                {modalData && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalData(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={quickTransition} className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden relative z-10 shadow-2xl">
                            <div className="h-48 bg-slate-50 flex items-center justify-center p-12 border-b">
                                <img src={resolveBackendUrl(modalData.imagenUrl) || PDI_LOGO_URL} className="max-h-full object-contain" alt="Logo" />
                            </div>
                            <div className="p-10">
                                <h3 className="text-3xl font-black text-[#002855] mb-4 leading-none uppercase tracking-tighter text-center">
                                    {modalData.categoria} - {modalData.titulo}
                                </h3>
                                <p className="text-base text-slate-600 leading-relaxed mb-8 text-center">
                                    {modalData.detallesDescripcion || modalData.descripcion}
                                </p>
                                <button onClick={() => setModalData(null)} className="w-full py-4 bg-[#002855] text-white rounded-2xl font-bold hover:bg-blue-900 transition-colors uppercase tracking-widest shadow-lg">Cerrar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-list-scroll::-webkit-scrollbar { width: 4px; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-list-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
}