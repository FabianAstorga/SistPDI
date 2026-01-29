import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion } from "framer-motion";
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';
import {
    Search,
    User,
    ShieldCheck,
    UserPlus,
    RefreshCw,
    AlertCircle,
    UserCheck,
    Mail,
    Clock,
    ShieldAlert
} from 'lucide-react';

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

const cleanRut = (r: string) => String(r || "").replace(/[^0-9kK]/g, '').toLowerCase();

export default function AdministracionIdentidad() {
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            abortControllerRef.current?.abort();
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

            const [resFunc, resUsr] = await Promise.all([
                fetch(`${API_BASE}/api/Funcionarios`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Users`, { headers, signal: abortControllerRef.current.signal })
            ]);

            if (!resFunc.ok || !resUsr.ok) throw new Error("Error sync");

            const dataFunc = await resFunc.json();
            const dataUsr = await resUsr.json();

            setFuncionarios(Array.isArray(dataFunc) ? dataFunc : []);
            setUsuarios(Array.isArray(dataUsr) ? dataUsr : []);
        } catch (e: any) {
            if (e.name !== 'AbortError') setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const unifiedData = useMemo(() => {
        const userMap = new Map();
        usuarios.forEach(u => userMap.set(cleanRut(u.rut), u));

        const base = funcionarios.map(f => ({
            funcionario: f,
            usuario: userMap.get(cleanRut(f.rut)) || null
        }));

        if (!search) return base;
        const q = search.toLowerCase();
        return base.filter(item =>
            item.funcionario.rut.toLowerCase().includes(q) ||
            item.funcionario.nombreCompleto?.toLowerCase().includes(q)
        );
    }, [funcionarios, usuarios, search]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855] via-transparent to-[#002855]" />
            </div>

            <main className="relative z-10 flex-1 p-6 pt-28 mb-4 flex flex-col items-center overflow-hidden">
                <div className="w-full max-w-[1500px] flex flex-col h-full gap-4">

                    {/* TOOLBAR */}
                    <div className="bg-[#001a35]/90 backdrop-blur-xl px-8 py-5 border border-white/10 rounded-sm flex justify-between items-center shadow-2xl shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center shadow-lg shrink-0 rounded-sm">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Control de <span className="text-blue-400">Funcionarios</span></h2>
                                <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Directorio de identidades y privilegios</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/50" size={16} />
                                <input
                                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="BUSCAR FUNCIONARIO..."
                                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 rounded-lg outline-none focus:border-blue-400 font-bold text-xs uppercase tracking-widest transition-all"
                                />
                            </div>
                            <button onClick={fetchData} className="p-3 hover:bg-white/10 rounded-full transition-all text-blue-400">
                                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>

                    {/* GRILLA UNIFICADA */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden rounded-sm shadow-2xl relative">
                        {/* Línea divisoria de fondo (estática) */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-200 z-0 hidden lg:block" />

                        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 px-10 py-3 text-[10px] font-black text-[#002855] uppercase tracking-[0.2em] z-10">
                            <div>Datos del Funcionario</div>
                            <div className="pl-10">Estado de Credenciales</div>
                        </div>

                        <div className="flex-1 relative z-10">
                            {loading ? (
                                <div className="h-full flex items-center justify-center bg-white">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Cargando Directorio...</span>
                                </div>
                            ) : (
                                <Virtuoso
                                    data={unifiedData}
                                    className="custom-list-scroll"
                                    itemContent={(_, row) => (
                                        <IdentityRow data={row} />
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- FILA DE IDENTIDAD UNIFICADA ---

const IdentityRow = memo(({ data }: { data: any }) => {
    const isLinked = !!data.usuario;

    return (
        <div className="px-6 py-1.5 bg-white">
            <div
                onClick={() => console.log("Ver detalle:", data.funcionario.rut)}
                className={`grid grid-cols-2 border transition-all duration-200 cursor-pointer ${isLinked
                        ? 'border-slate-300 bg-slate-100 hover:border-blue-400'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
            >
                {/* SECCIÓN FUNCIONARIO */}
                <div className="flex items-center gap-5 p-5 pr-10">
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 transition-colors ${isLinked ? 'bg-[#002855] text-white' : 'bg-slate-300 text-slate-500'}`}>
                        {isLinked ? <UserCheck size={22} /> : <User size={22} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black uppercase truncate ${isLinked ? 'text-[#002855]' : 'text-slate-500'}`}>
                            {data.funcionario.nombreCompleto}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest">{data.funcionario.rut}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase ${isLinked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                {isLinked ? 'Verificado' : 'Sin Acceso'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN CREDENCIALES */}
                <div className="flex items-center gap-5 p-5 pl-10">
                    {isLinked ? (
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-[#002855] uppercase tracking-tighter leading-none mb-1">Acceso Activo</p>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Mail size={12} className="shrink-0" />
                                    <span className="text-[10px] font-bold truncate lowercase">{data.usuario.email || 'correo@pdi.cl'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center border-l border-slate-200 pl-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock size={11} />
                                    <span className="text-[9px] font-bold uppercase">U. Conexión: {data.usuario.lastLogin ? new Date(data.usuario.lastLogin).toLocaleDateString() : 'Pendiente'}</span>
                                </div>
                                <span className={`text-[8px] font-black uppercase mt-1 ${data.usuario.rol === 1 ? 'text-blue-600' : 'text-slate-600'}`}>
                                    Privilegios: {data.usuario.rol === 1 ? 'Nivel Admin' : 'Nivel Gestor'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-3">
                                <ShieldAlert size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Credenciales no asignadas</p>
                                    <p className="text-[9px] text-slate-400 uppercase mt-1 italic">Requiere registro manual</p>
                                </div>
                            </div>
                            <UserPlus size={18} className="text-slate-300" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});