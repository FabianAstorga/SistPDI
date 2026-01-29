import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from '../../components/Navbar';
import {
    Users,
    Search,
    User,
    Phone,
    IdCard,
    Mail,
    Briefcase,
    Shield,
    ChevronRight
} from 'lucide-react';

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

type EmpleadoApiRaw = {
    rut?: string;
    correoElectronico?: string;
    nombreCompleto?: string;
    id?: number;
    nombre?: string;
    mail?: string | null;
    brigada?: string;
    cargo?: string;
    telefono?: number | string;
};

type EmpleadoUi = {
    key: string;
    id?: number;
    rut: string;
    correo: string;
    nombre: string;
    brigada?: string;
    cargo?: string;
    telefono?: number | string;
};

export default function Empleado() {
    const [empleados, setEmpleados] = useState<EmpleadoUi[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [inputSearch, setInputSearch] = useState('');

    const searchResult = useMemo(() => {
        const q = inputSearch.trim().toLowerCase();
        if (!q) return empleados;
        return empleados.filter((e) =>
            e.nombre.toLowerCase().includes(q) ||
            e.rut.toLowerCase().includes(q)
        );
    }, [empleados, inputSearch]);

    const normalizeEmpleado = (raw: EmpleadoApiRaw, index: number): EmpleadoUi => {
        const nombreUi = (raw.nombreCompleto ?? raw.nombre ?? '').trim();
        const rutUi = (raw.rut ?? '').trim();
        const correoUi = (raw.correoElectronico ?? raw.mail ?? '').trim();
        const id = typeof raw.id === 'number' ? raw.id : undefined;

        return {
            key: id != null ? String(id) : `${rutUi || 'no-rut'}-${index}`,
            id,
            nombre: nombreUi || '(SIN NOMBRE)',
            rut: rutUi || '(SIN RUT)',
            correo: correoUi || '(SIN CORREO)',
            brigada: raw.brigada || 'N/A',
            cargo: raw.cargo || 'FUNCIONARIO',
            telefono: raw.telefono || 'S/N',
        };
    };

    const fetchEmpleados = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Empleados`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error('Formato de datos inválido');
            setEmpleados(data.map((x, i) => normalizeEmpleado(x, i)));
        } catch (err: any) {
            setLoadError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmpleados(); }, []);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855] via-transparent to-[#002855]" />
            </div>

            {/* Ajuste: pt-28 para alejar de la Navbar y mb-4 para acercar al piso */}
            <main className="relative z-10 flex-1 flex items-start justify-center p-4 pt-28 mb-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-7xl h-full max-h-[82vh] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm border border-white/5"
                >
                    {/* DIV 1: CABECERA AZUL (SUPERIOR) */}
                    <div className="bg-[#002855] p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-blue-600 flex items-center justify-center shadow-lg border border-white/10">
                                <Users className="text-white" size={28} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black leading-none uppercase tracking-tighter">
                                    Funcionarios en sistema <br />
                                </h2>
                                <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                    {searchResult.length} Registros identificados
                                </p>
                            </div>
                        </div>

                        {/* BUSCADOR INTEGRADO EN EL ÁREA AZUL */}
                        <div className="w-full md:w-96 relative group">
                            <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 block opacity-60">Filtrar por Nombre o RUT</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/50" size={16} />
                                <input
                                    type="text"
                                    value={inputSearch}
                                    onChange={(e) => setInputSearch(e.target.value)}
                                    placeholder="BUSCAR FUNCIONARIO..."
                                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 outline-none focus:bg-white/10 focus:border-blue-400 transition-all font-bold text-xs uppercase tracking-widest"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DIV 2: LISTADO BLANCO (INFERIOR) */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-list-scroll bg-slate-50/30">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[#002855] font-black text-[10px] uppercase tracking-[0.3em]">Sincronizando Sistema...</span>
                                </div>
                            ) : loadError ? (
                                <div className="h-full flex items-center justify-center text-red-500 font-black uppercase text-xs tracking-widest">{loadError}</div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence mode='popLayout'>
                                        {searchResult.map((emp, idx) => (
                                            <motion.div
                                                key={emp.key}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                                                whileHover={{ x: 10 }}
                                                className="group bg-white border border-slate-200 p-4 flex items-center gap-8 relative cursor-pointer hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                                                    <User size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                                                </div>

                                                <div className="w-72 shrink-0">
                                                    <h3 className="text-sm font-black text-[#002855] uppercase tracking-tighter truncate">{emp.nombre}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <IdCard size={12} className="text-slate-300" />
                                                        <span className="text-[10px] font-bold text-slate-500 tracking-widest">{emp.rut}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 hidden lg:grid grid-cols-2 gap-4 border-l border-slate-100 pl-8">
                                                    <div className="flex items-center gap-3">
                                                        <Shield size={14} className="text-blue-500/40" />
                                                        <div>
                                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter">Brigada / Unidad</span>
                                                            <span className="text-[10px] font-bold text-slate-700 uppercase">{emp.brigada}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Briefcase size={14} className="text-blue-500/40" />
                                                        <div>
                                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter">Cargo Asignado</span>
                                                            <span className="text-[10px] font-bold text-slate-700 uppercase">{emp.cargo}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden xl:flex items-center gap-10 border-l border-slate-100 pl-8 w-96">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} className="text-slate-300" />
                                                        <span className="text-[10px] font-medium text-slate-500 lowercase truncate max-w-[150px]">{emp.correo}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={14} className="text-slate-300" />
                                                        <span className="text-[10px] font-bold text-slate-500">{emp.telefono}</span>
                                                    </div>
                                                </div>

                                                <div className="ml-auto p-2 rounded-full border border-slate-100 text-slate-300 group-hover:bg-[#002855] group-hover:text-white group-hover:border-[#002855] transition-all shadow-sm shrink-0">
                                                    <ChevronRight size={18} />
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
                .custom-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}