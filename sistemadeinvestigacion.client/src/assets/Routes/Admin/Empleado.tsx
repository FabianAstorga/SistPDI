import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion } from "framer-motion";
import { Navbar } from '../../components/Navbar';
import {
    Search,
    User,
    Key,
    ShieldCheck,
    Fingerprint,
    UserPlus,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

// Función de limpieza fuera del componente para evitar recreación
const cleanRut = (r: string) => String(r).replace(/[^0-9kK]/g, '').toLowerCase();

export default function AdministracionIdentidad() {
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // AbortController para limpiar peticiones pendientes
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            };

            const [resEmp, resUsr] = await Promise.all([
                fetch(`${API_BASE}/api/Empleados`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Users`, { headers, signal: abortControllerRef.current.signal })
            ]);

            if (!resEmp.ok || !resUsr.ok) throw new Error("Error en servidor");

            const dataEmp = await resEmp.json();
            const dataUsr = await resUsr.json();

            // Ordenamiento optimizado
            const sortFn = (a: any, b: any) => cleanRut(a.rut).localeCompare(cleanRut(b.rut));

            setFuncionarios((Array.isArray(dataEmp) ? dataEmp : []).sort(sortFn));
            setUsuarios((Array.isArray(dataUsr) ? dataUsr : []).sort(sortFn));
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                setError("No se pudo sincronizar con el servidor.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        return () => abortControllerRef.current?.abort(); // Cleanup al desmontar
    }, [fetchData]);

    // Filter function estable
    const filterFn = useCallback((item: any) => {
        const val = search.toLowerCase();
        if (!val) return true;
        return (
            item.rut.toLowerCase().includes(val) ||
            (item.nombreCompleto && item.nombreCompleto.toLowerCase().includes(val))
        );
    }, [search]);

    const filteredFunc = useMemo(() => funcionarios.filter(filterFn), [funcionarios, filterFn]);
    const filteredUsers = useMemo(() => usuarios.filter(filterFn), [usuarios, filterFn]);

    // Mapeo de Ruts de usuarios para búsqueda O(1) en lugar de O(N) dentro del render
    const userRutsMap = useMemo(() => {
        const set = new Set();
        usuarios.forEach(u => set.add(cleanRut(u.rut)));
        return set;
    }, [usuarios]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855] via-transparent to-[#002855]" />
            </div>

            <main className="relative z-10 flex-1 p-4 pt-28 mb-4 flex justify-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-[1600px] h-full grid grid-cols-2 grid-rows-[auto_1fr] gap-3 overflow-hidden"
                >
                    {/* Header bar */}
                    <div className="col-span-2 bg-[#002855]/80 backdrop-blur-md px-8 py-4 border border-white/10 rounded-sm flex justify-between items-center shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center border border-white/10 shrink-0">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Consola de <span className="text-blue-400">Administración</span></h2>
                                <p className="text-blue-200/40 text-[9px] font-black uppercase tracking-[0.2em]">{loading ? 'Sincronizando...' : 'Sistemas en línea'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {error && <div className="text-red-400 text-[10px] font-black uppercase flex items-center gap-2 animate-pulse"><AlertCircle size={14} /> {error}</div>}
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50" size={14} />
                                <input
                                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="FILTRAR POR RUT O NOMBRE..."
                                    className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2 outline-none focus:border-blue-400 font-bold text-[10px] tracking-widest uppercase"
                                />
                            </div>
                            <button onClick={fetchData} className="p-2 hover:bg-white/10 rounded-full transition-all text-blue-400">
                                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>

                    {/* Lista Funcionarios */}
                    <div className="flex flex-col bg-white rounded-sm overflow-hidden border border-white/10 shadow-xl">
                        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between">
                            <span className="text-[10px] font-black text-[#002855] uppercase flex items-center gap-2"><User size={14} /> Registro de Funcionarios</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 custom-list-scroll">
                            {filteredFunc.map((f) => (
                                <div key={f.rut} className="bg-white border border-slate-200 p-3 flex items-center gap-4 group hover:border-blue-400 transition-all shadow-sm">
                                    <div className={`w-1.5 h-8 rounded-full ${userRutsMap.has(cleanRut(f.rut)) ? 'bg-emerald-500' : 'bg-slate-200 opacity-50'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-[#002855] uppercase truncate">{f.nombreCompleto}</p>
                                        <span className="text-[9px] font-bold text-slate-500 tracking-widest">{f.rut}</span>
                                    </div>
                                    {!userRutsMap.has(cleanRut(f.rut)) && (
                                        <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-sm border border-blue-100">
                                            <UserPlus size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lista Cuentas (Simétrica) */}
                    <div className="flex flex-col bg-white rounded-sm overflow-hidden border border-white/10 shadow-xl">
                        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between">
                            <span className="text-[10px] font-black text-[#002855] uppercase flex items-center gap-2"><Fingerprint size={14} /> Cuentas de Acceso</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 custom-list-scroll">
                            {filteredUsers.map((u) => (
                                <div key={u.id} className="bg-white border border-slate-200 p-3 flex items-center gap-4 group hover:border-[#002855] transition-all shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] border border-blue-100">{u.rol}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-[#002855] tracking-tight">{u.rut}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Acceso: {u.rol === 1 ? 'ADMIN' : 'GESTOR'}</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-all rounded-full"><Key size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
            <style>{`
                .custom-list-scroll::-webkit-scrollbar { width: 4px; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}