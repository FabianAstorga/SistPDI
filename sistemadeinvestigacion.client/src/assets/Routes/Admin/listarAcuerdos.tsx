import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { motion } from "framer-motion";
import {
    Search,
    LayoutGrid,
    Calendar,
    Building2,
    ChevronRight
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';

/** * LISTAR ACUERDOS V5.2 ULTRA-FAST - PDI Intranet 2026
 * Fix: High-speed rendering, zero-latency animations, and priority asset loading.
 */

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const PDI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF7ZHFE9xX50BEWjSmAriqYIdJwxiPAMD1cA&s";

const resolveBackendUrl = (path?: string | null) => {
    if (!path) return null;
    const s = String(path).trim();
    if (!s || /^https?:\/\//i.test(s)) return s || null;
    return `${API_BASE}${s.startsWith('/') ? s : `/${s}`}`;
};

export default function ListarAcuerdos() {
    const [acuerdos, setAcuerdos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const fetchAcuerdos = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Acuerdos`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                signal: abortControllerRef.current.signal
            });
            const data = await res.json();
            setAcuerdos(Array.isArray(data) ? data : []);
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Error cargando acuerdos:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAcuerdos();
        return () => abortControllerRef.current?.abort();
    }, [fetchAcuerdos]);

    const filtered = useMemo(() => {
        const query = search.toLowerCase();
        return acuerdos.filter(a =>
            a.titulo?.toLowerCase().includes(query) ||
            a.categoria?.toLowerCase().includes(query)
        );
    }, [search, acuerdos]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855] via-transparent to-[#002855]" />
            </div>

            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-7xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm"
                >
                    {/* SIDEBAR */}
                    <div className="hidden md:flex w-80 bg-[#002855] p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <LayoutGrid className="text-white" size={24} />
                        </div>

                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">
                            Lista de <br /> <span className="text-blue-400">Acuerdos</span>
                        </h2>
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            {filtered.length} Registros
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                                    <Search size={12} /> Filtrar
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full bg-white/5 border-b border-white/10 text-white px-4 py-3 outline-none focus:border-blue-400 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LISTADO VIRTUALIZADO ULTRA RÁPIDO */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                        <div className="flex-1 bg-slate-50/50 relative">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em]">Cargando...</span>
                                </div>
                            ) : (
                                <Virtuoso
                                    style={{ height: '100%' }}
                                    data={filtered}
                                    increaseViewportBy={300} // Pre-renderiza elementos antes de que aparezcan
                                    className="custom-list-scroll"
                                    itemContent={(_, a) => (
                                        <div className="px-8 pt-4 pb-2">
                                            <AcuerdoItem acuerdo={a} />
                                        </div>
                                    )}
                                    components={{
                                        Footer: () => <div className="h-10" />
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

const AcuerdoItem = memo(({ acuerdo }: { acuerdo: any }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }} // Velocidad de reacción instantánea
            whileHover={{ scale: 1.005 }}
            className="group bg-white border border-slate-200 p-5 flex items-center gap-6 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
        >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

            <div className="w-20 h-20 bg-slate-100 rounded flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                <img
                    key={`img-ac-${acuerdo.idAcuerdo || acuerdo.id}`}
                    src={resolveBackendUrl(acuerdo.imagenUrl) || PDI_LOGO_URL}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager" // Carga inmediata para evitar cuadros vacíos
                    onError={(e) => { (e.target as HTMLImageElement).src = PDI_LOGO_URL }}
                />
            </div>

            <div className="flex-1 min-w-0 text-slate-900">
                <span className="text-[9px] font-black bg-[#002855] text-white px-2 py-0.5 rounded uppercase mb-1 inline-block">
                    {acuerdo.categoria || 'Institucional'}
                </span>
                <h3 className="text-lg font-black text-[#002855] uppercase tracking-tighter truncate leading-none">
                    {acuerdo.titulo}
                </h3>
                <p className="text-slate-500 text-xs font-medium line-clamp-1 italic mt-1">
                    {acuerdo.descripcion}
                </p>
                <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Building2 size={11} />
                        <span className="text-[9px] font-bold uppercase">{acuerdo.idEmpresa}</span>
                    </div>
                    {acuerdo.fechaVencimiento && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={11} />
                            <span className="text-[9px] font-bold uppercase">
                                {new Date(acuerdo.fechaVencimiento).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-[#002855] group-hover:bg-[#002855] group-hover:text-white transition-all shrink-0">
                <ChevronRight size={18} />
            </div>
        </motion.div>
    );
});