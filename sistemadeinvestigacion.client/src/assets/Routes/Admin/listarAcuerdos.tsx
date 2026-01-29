import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    LayoutGrid,
    Calendar,
    Building2,
    ChevronRight,
    CircleDot
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const PDI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF7ZHFE9xX50BEWjSmAriqYIdJwxiPAMD1cA&s";

// Función idéntica a Panel.tsx para consistencia de imágenes
export function resolveBackendUrl(path?: string | null) {
    if (!path) return null;
    const s = String(path).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    const normalized = s.startsWith('/') ? s : `/${s}`;
    return `${API_BASE}${normalized}`;
}

export default function ListarAcuerdos() {
    const [acuerdos, setAcuerdos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchAcuerdos = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/api/Acuerdos`, {
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                });
                const data = await res.json();
                setAcuerdos(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Error cargando acuerdos:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAcuerdos();
    }, []);

    const filtered = useMemo(() => {
        return acuerdos.filter(a =>
            a.titulo?.toLowerCase().includes(search.toLowerCase()) ||
            a.categoria?.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, acuerdos]);

    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />

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
                            <LayoutGrid className="text-white" size={24} />
                        </div>

                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">
                            Lista de <br />
                            <span className="text-blue-400">Acuerdos</span>
                        </h2>
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            {filtered.length} Registros activos
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className={labelStyle}><Search size={12} /> Filtrar Catálogo</label>
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

                    {/* LISTADO DERECHA */}
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
                                            <motion.div
                                                key={a.idAcuerdo || a.id}
                                                initial={{ opacity: 0, x: 15 }} // Reducimos el x para que el recorrido sea más corto y rápido
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    // Delay más agresivo para que no parezca que "espera" tanto
                                                    delay: idx * 0.02,
                                                    duration: 0.4,
                                                    // Usamos el mismo easing que tienes en el main container del formulario
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                                whileHover={{ x: 8 }}
                                                className="group bg-white border border-slate-200 p-5 flex items-center gap-6 cursor-pointer hover:shadow-xl hover:shadow-blue-900/5 transition-all relative"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

                                                {/* Contenedor de Imagen con resolveBackendUrl */}
                                                <div className="w-24 h-24 bg-slate-100 rounded flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                                                    <img
                                                        src={resolveBackendUrl(a.imagenUrl) || PDI_LOGO_URL}
                                                        alt={a.titulo}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = PDI_LOGO_URL }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[9px] font-black bg-[#002855] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                                                            {a.categoria || 'Institucional'}
                                                        </span>
                                                        
                                                    </div>

                                                    <h3 className="text-xl font-black text-[#002855] uppercase tracking-tighter truncate">
                                                        {a.titulo}
                                                    </h3>

                                                    <p className="text-slate-500 text-sm font-medium line-clamp-1 italic mb-3">
                                                        {a.descripcion}
                                                    </p>

                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <Building2 size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight">Empresa ID: {a.idEmpresa}</span>
                                                        </div>
                                                        {a.fechaVencimiento && (
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Calendar size={12} />
                                                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                                                    Vence: {new Date(a.fechaVencimiento).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-[#002855] group-hover:bg-[#002855] group-hover:text-white transition-all shadow-sm shrink-0">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </motion.div>
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
                .custom-list-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}