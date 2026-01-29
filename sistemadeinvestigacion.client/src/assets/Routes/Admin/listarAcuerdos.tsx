import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    LayoutGrid,
    Calendar,
    Building2,
    ChevronRight
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

/** * LISTAR ACUERDOS V4.5 OPTIMIZADO - PDI Intranet 2026
 * Fix: Memory Leak prevention mediante AbortController y memoización de items.
 */

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const PDI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF7ZHFE9xX50BEWjSmAriqYIdJwxiPAMD1cA&s";

// 1. Utilidades y estilos constantes fuera del componente para liberar el Heap
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";

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

    // 2. Fetch con AbortController para evitar fugas de memoria por promesas "zombis"
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
        return () => abortControllerRef.current?.abort(); // Limpieza al desmontar
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
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                            {filtered.length} Registros activos
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className={LABEL_STYLE}><Search size={12} /> Filtrar Catálogo</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar convenio..."
                                    className="w-full bg-white/5 border-b border-white/10 text-white px-4 py-3 outline-none focus:border-blue-400 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LISTADO */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-8 custom-list-scroll bg-slate-50/50">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Cargando base de datos...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 pb-10">
                                    <AnimatePresence mode='popLayout'>
                                        {filtered.map((a, idx) => (
                                            <AcuerdoItem key={a.idAcuerdo || a.id} acuerdo={a} index={idx} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>

            <style>{`
                .custom-list-scroll::-webkit-scrollbar { width: 4px; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}

// 3. Sub-componente memoizado para evitar fugas por recreación masiva de nodos Motion
const AcuerdoItem = React.memo(({ acuerdo, index }: { acuerdo: any, index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                delay: index * 0.02,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1]
            }}
            whileHover={{ x: 8 }}
            className="group bg-white border border-slate-200 p-5 flex items-center gap-6 cursor-pointer hover:shadow-xl transition-all relative"
        >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

            <div className="w-24 h-24 bg-slate-100 rounded flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                <img
                    src={resolveBackendUrl(acuerdo.imagenUrl) || PDI_LOGO_URL}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = PDI_LOGO_URL }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black bg-[#002855] text-white px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                    {acuerdo.categoria || 'Institucional'}
                </span>
                <h3 className="text-xl font-black text-[#002855] uppercase tracking-tighter truncate">
                    {acuerdo.titulo}
                </h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-1 italic mb-3">
                    {acuerdo.descripcion}
                </p>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Building2 size={12} />
                        <span className="text-[10px] font-bold uppercase">Empresa ID: {acuerdo.idEmpresa}</span>
                    </div>
                    {acuerdo.fechaVencimiento && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase">
                                Vence: {new Date(acuerdo.fechaVencimiento).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-[#002855] group-hover:bg-[#002855] group-hover:text-white transition-all shrink-0">
                <ChevronRight size={20} />
            </div>
        </motion.div>
    );
});