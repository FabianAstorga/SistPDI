import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import {
    Building,
    Globe,
    Phone,
    Mail,
    MapPin,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    LayoutGrid
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

type ApiInstitucion = any;

type InstitucionVM = {
    id: number | string;
    nombre: string;
    descripcion: string;
    sitioWeb?: string | null;
    email?: string | null;
    telefono?: string | number | null;
    direccion?: string | null;
    logoUrl?: string | null;
};

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const PAGE_SIZE = 4;

// Helpers de mapeo y limpieza
function mapInstitucionFromApi(x: ApiInstitucion): InstitucionVM {
    return {
        id: x?.idEmpresa ?? x?.id ?? x?.empresaID ?? x?.ID,
        nombre: x?.nombre ?? '',
        descripcion: x?.descripcion ?? '',
        sitioWeb: x?.sitioWeb ?? null,
        email: x?.email ?? null,
        telefono: x?.telefono ?? null,
        direccion: x?.direccion ?? null,
        logoUrl: x?.logo
            ? String(x.logo).startsWith('http')
                ? String(x.logo)
                : `${API_BASE}/${String(x.logo).replace(/^\//, '')}`
            : null,
    };
}

function safeUrl(url?: string | null) {
    if (!url) return null;
    try { return new URL(url).toString(); } catch {
        try { return new URL(`https://${url}`).toString(); } catch { return null; }
    }
}

function getPageItems(current: number, total: number): Array<number | '...'> {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const windowStart = Math.max(2, current - 1);
    const windowEnd = Math.min(total - 1, current + 1);
    const pages: Array<number | '...'> = [1];
    if (windowStart > 2) pages.push('...');
    for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
    if (windowEnd < total - 1) pages.push('...');
    pages.push(total);
    return pages;
}

export default function InstitucionList() {
    const navigate = useNavigate();
    const [items, setItems] = useState<InstitucionVM[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchInstituciones = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Empresa`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            const data = await res.json();

            // Manejo flexible de diferentes estructuras de respuesta
            let arr: any[] = [];
            if (Array.isArray(data)) arr = data;
            else if (Array.isArray(data?.items)) arr = data.items;
            else if (Array.isArray(data?.$values)) arr = data.$values;

            const mapped = arr.map(mapInstitucionFromApi).filter((x) => x?.id != null);
            setItems(mapped);
        } catch (err) {
            console.error('Error al cargar instituciones:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInstituciones(); }, []);

    // Filtrado por búsqueda
    const filteredItems = useMemo(() => {
        return items.filter(it =>
            it.nombre.toLowerCase().includes(search.toLowerCase()) ||
            it.descripcion.toLowerCase().includes(search.toLowerCase())
        );
    }, [items, search]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE)), [filteredItems]);

    const pagedItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, page]);

    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
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
                    {/* SIDEBAR IZQUIERDO */}
                    <div className="hidden md:flex w-80 bg-[#002855] p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <Building className="text-white" size={24} />
                        </div>

                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">
                            Catálogo de <br />
                            <span className="text-blue-400">Empresas</span>
                        </h2>
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            {filteredItems.length} Entidades registradas
                        </p>

                        <div className="space-y-6 flex-1">
                            <div>
                                <label className={labelStyle}><Search size={12} /> Buscar Entidad</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Nombre o descripción..."
                                    className="w-full bg-white/5 border-b border-white/10 text-white px-4 py-3 outline-none focus:border-blue-400 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        
                    </div>

                    {/* LISTADO DERECHA */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                        <div className="flex-1 overflow-y-auto p-8 custom-list-scroll bg-slate-50/50">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Consultando registros...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                                    <AnimatePresence mode='popLayout'>
                                        {pagedItems.map((inst, idx) => {
                                            const siteFixed = safeUrl(inst.sitioWeb);
                                            return (
                                                <motion.div
                                                    key={inst.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                                    className="group bg-white border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-xl hover:shadow-blue-900/5 transition-all relative"
                                                >
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-xl font-black text-[#002855] uppercase tracking-tighter truncate mb-1">
                                                                {inst.nombre}
                                                            </h3>
                                                            <p className="text-slate-500 text-xs font-medium line-clamp-2 italic h-8">
                                                                {inst.descripcion}
                                                            </p>
                                                        </div>
                                                        <div className="w-16 h-16 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {inst.logoUrl ? (
                                                                <img src={inst.logoUrl} alt="logo" className="w-full h-full object-contain p-2" />
                                                            ) : (
                                                                <ImageIcon size={20} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-50">
                                                        {siteFixed && (
                                                            <a href={siteFixed} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                                                                <Globe size={12} />
                                                                <span className="text-[10px] font-bold uppercase truncate">{inst.sitioWeb}</span>
                                                            </a>
                                                        )}
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                            {inst.email && (
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <Mail size={12} />
                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{inst.email}</span>
                                                                </div>
                                                            )}
                                                            {inst.telefono && (
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <Phone size={12} />
                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{inst.telefono}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {inst.direccion && (
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <MapPin size={12} />
                                                                <span className="text-[10px] font-bold uppercase tracking-tight truncate">{inst.direccion}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* PAGINACIÓN ESTILO PDI */}
                        {totalPages > 1 && (
                            <div className="bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => page > 1 && setPage(p => p - 1)}
                                    disabled={page === 1}
                                    className="p-2 text-[#002855] disabled:text-slate-300 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex gap-1">
                                    {getPageItems(page, totalPages).map((p, i) => (
                                        p === '...' ? (
                                            <span key={`sep-${i}`} className="px-2 text-slate-300">...</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p as number)}
                                                className={`w-8 h-8 text-[10px] font-black rounded-sm transition-all ${page === p
                                                        ? 'bg-[#002855] text-white shadow-lg'
                                                        : 'text-[#002855] hover:bg-slate-100'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button
                                    onClick={() => page < totalPages && setPage(p => p + 1)}
                                    disabled={page === totalPages}
                                    className="p-2 text-[#002855] disabled:text-slate-300 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>

            <style>{`
                .custom-list-scroll::-webkit-scrollbar { width: 4px; }
                .custom-list-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}