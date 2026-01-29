import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import {
    Building,
    Globe,
    Phone,
    Mail,
    MapPin,
    Image as ImageIcon,
    Search,
    ChevronRight
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';

/** * LISTADO INSTITUCIONES V5.0 - PDI Intranet 2026
 * Fix: Virtualización total, eliminación de paginación lenta y renderizado ultra-rápido.
 */

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

// 1. Helpers estáticos fuera para evitar recreación de punteros
const mapInstitucionFromApi = (x: any) => ({
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
});

const safeUrl = (url?: string | null) => {
    if (!url) return null;
    try { return new URL(url).toString(); } catch {
        try { return new URL(`https://${url}`).toString(); } catch { return null; }
    }
};

export default function InstitucionList() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    // 2. Limpieza de Body y AbortController
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            abortControllerRef.current?.abort();
        };
    }, []);

    const fetchInstituciones = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Empresa`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                signal: abortControllerRef.current.signal
            });
            const data = await res.json();

            let arr: any[] = [];
            if (Array.isArray(data)) arr = data;
            else if (Array.isArray(data?.items)) arr = data.items;
            else if (Array.isArray(data?.$values)) arr = data.$values;

            setItems(arr.map(mapInstitucionFromApi).filter(x => x?.id != null));
        } catch (err: any) {
            if (err.name !== 'AbortError') console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInstituciones(); }, [fetchInstituciones]);

    const filteredItems = useMemo(() => {
        const q = search.toLowerCase();
        return items.filter(it =>
            it.nombre.toLowerCase().includes(q) ||
            it.descripcion.toLowerCase().includes(q)
        );
    }, [items, search]);

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
                    className="w-full max-w-7xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm"
                >
                    {/* SIDEBAR */}
                    <div className="hidden md:flex w-80 bg-[#002855] p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <Building className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">
                            Catálogo de <br /> <span className="text-blue-400">Empresas</span>
                        </h2>
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            {filteredItems.length} Entidades registradas
                        </p>
                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                <Search size={12} /> Buscar
                            </label>
                            <input
                                type="text" value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nombre o descripción..."
                                className="w-full bg-white/5 border-b border-white/10 text-white px-4 py-3 outline-none focus:border-blue-400 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* LISTADO VIRTUALIZADO (Eliminamos Paginación) */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                        <div className="flex-1 bg-slate-50/50 relative">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em]">Consultando...</span>
                                </div>
                            ) : (
                                <Virtuoso
                                    style={{ height: '100%' }}
                                    data={filteredItems}
                                    increaseViewportBy={400}
                                    className="custom-list-scroll"
                                    itemContent={(_, inst) => (
                                        <div className="p-4 px-8">
                                            <InstitucionItem inst={inst} />
                                        </div>
                                    )}
                                    components={{ Footer: () => <div className="h-10" /> }}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

// 3. Sub-componente memoizado para renderizado ultra-rápido
const InstitucionItem = memo(({ inst }: { inst: any }) => {
    const siteFixed = safeUrl(inst.sitioWeb);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="group bg-white border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-md transition-all relative overflow-hidden"
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
                        <img src={inst.logoUrl} className="w-full h-full object-contain p-2" loading="eager" alt="" />
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
});