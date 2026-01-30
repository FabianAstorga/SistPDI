import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';
import {
    Search,
    ShieldCheck,
    RefreshCw,
    ShieldAlert,
    User,
    UserCheck,
    Mail,
    Calendar,
    Hash,
    Shield,
    X,
    Save,
    Fingerprint,
    Info,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Smartphone,
    LockIcon
} from 'lucide-react';

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

const cleanRut = (r: string) => String(r || "").replace(/[^0-9kK]/g, '').toLowerCase();

const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed";

export default function AdministracionIdentidad() {
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedFunc, setSelectedFunc] = useState<any | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Identificar rol del usuario actual desde el Token
    const currentUserRole = useMemo(() => {
        const token = localStorage.getItem('token');
        if (!token) return 2;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            // Buscamos el claim de rol estándar de ASP.NET Core o uno personalizado
            return parseInt(payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"] || "2");
        } catch (e) { return 2; }
    }, []);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

            const [resFunc, resUsr] = await Promise.all([
                fetch(`${API_BASE}/api/Funcionarios`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Users`, { headers, signal: abortControllerRef.current.signal })
            ]);

            const dataFunc = await resFunc.json();
            const dataUsr = await resUsr.json();

            setFuncionarios(Array.isArray(dataFunc) ? dataFunc : []);
            setUsuarios(Array.isArray(dataUsr) ? dataUsr : []);
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Sync Error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        fetchData();
        return () => {
            document.body.style.overflow = 'unset';
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

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
            <div className="fixed inset-0 z-0 pointer-events-none opacity-5" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover' }} />

            <main className="relative z-10 flex-1 p-6 pt-28 mb-4 flex justify-center overflow-hidden">
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-7xl h-full flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#002855]">
                    <div className="hidden md:flex w-72 p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10"><ShieldCheck size={24} /></div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 leading-none text-white">Control de <br /><span className="text-blue-400">Personal</span></h2>
                        <div className="w-8 h-1 bg-blue-500 mb-6" />
                        <div className="space-y-6 flex-1">
                            <div>
                                <label className={LABEL_STYLE}><Search size={12} /> Buscar</label>
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border-b border-white/10 text-white px-2 py-3 outline-none focus:border-blue-400 transition-all text-xs font-bold uppercase tracking-widest" placeholder="RUT O NOMBRE..." />
                            </div>
                            <div className="p-3 bg-blue-900/30 border border-blue-400/20 rounded-sm">

                                <p className="text-xs font-bold text-white uppercase mt-1">{currentUserRole === 1 ? ' Administrador' : ' Funcionario '}</p>
                            </div>
                        </div>
                        <button onClick={fetchData} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white transition-colors">
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sincronizar Base
                        </button>
                    </div>

                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                        <div className="grid grid-cols-2 bg-slate-200 border-b border-slate-300 px-10 py-3 text-[10px] font-black text-[#002855] uppercase tracking-[0.2em] z-10 shadow-sm">
                            <div>Datos del Funcionario</div>
                            <div className="pl-10">Credenciales de Acceso</div>
                        </div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-200 z-0 hidden lg:block" />
                        <div className="flex-1 relative z-10 bg-white">
                            {loading ? (
                                <div className="h-full flex items-center justify-center"><span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Cargando Registros...</span></div>
                            ) : (
                                <Virtuoso data={unifiedData} className="custom-list-scroll" itemContent={(_, row) => (
                                    <IdentityRow
                                        data={row}
                                        onSelect={currentUserRole === 1 ? setSelectedFunc : null}
                                        isRestricted={currentUserRole !== 1}
                                    />
                                )} />
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>

            <AnimatePresence>
                {selectedFunc && <ModalGestionFuncionario item={selectedFunc} onClose={() => setSelectedFunc(null)} onRefresh={fetchData} />}
            </AnimatePresence>
        </div>
    );
}

const IdentityRow = memo(({ data, onSelect, isRestricted }: any) => {
    const isLinked = !!data.usuario;
    const infoStyle = "text-[11px] font-extrabold text-slate-700 uppercase tracking-tight flex items-center gap-2";

    return (
        <div className="px-6 py-1.5 bg-white">
            <div
                onClick={() => onSelect && onSelect(data)}
                className={`group grid grid-cols-2 border transition-all duration-200 relative overflow-hidden ${!onSelect ? 'cursor-default' : 'cursor-pointer'
                    } ${isLinked ? 'border-slate-300 bg-slate-100/50 hover:border-blue-400' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
                {onSelect && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top z-20" />}

                <div className="flex items-center gap-5 p-5 pr-10">
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 transition-colors ${isLinked ? 'bg-[#002855] text-white' : 'bg-slate-300 text-slate-600'}`}>
                        {isLinked ? <UserCheck size={22} /> : <User size={22} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black uppercase truncate ${isLinked ? 'text-[#002855]' : 'text-slate-600'}`}>{data.funcionario.nombreCompleto}</p>
                        <span className={infoStyle}><Hash size={12} className="text-slate-900" /> RUT: {data.funcionario.rut}</span>
                    </div>
                </div>

                <div className={`flex items-center gap-5 p-5 pl-10 relative ${isLinked ? '' : 'border-l border-slate-100 opacity-60'}`}>
                    {isRestricted ? (
                        <div className="flex-1 flex items-center gap-3 text-slate-400">
                            <LockIcon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Información Protegida</span>
                        </div>
                    ) : isLinked ? (
                        <div className="flex-1 grid grid-cols-2 gap-4 text-slate-700">
                            <div className="flex flex-col justify-center gap-1.5">
                                <span className={infoStyle}><Hash size={12} className="text-slate-900" /> ID: {data.usuario.idPersona}</span>
                                <span className={infoStyle}><Mail size={12} className="text-slate-900" /> {data.funcionario.correoElectronico}</span>
                            </div>
                            <div className="flex flex-col justify-center gap-1.5 border-l border-slate-300 pl-6">
                                <span className={infoStyle}><Calendar size={12} className="text-slate-900" /> {new Date(data.usuario.fechaCreacion).toLocaleDateString()}</span>
                                <span className={`${infoStyle} ${data.usuario.rol === 1 ? 'text-blue-700' : 'text-slate-800'}`}>
                                    <Shield size={12} className="text-slate-900" /> {data.usuario.rol === 1 ? 'ADMINISTRADOR' : 'FUNCIONARIO'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 font-extrabold italic uppercase text-[10px] text-slate-400"><ShieldAlert size={18} /> Acceso Pendiente</div>
                    )}
                </div>
            </div>
        </div>
    );
});

const ModalGestionFuncionario = ({ item, onClose, onRefresh }: any) => {
    const isLinked = !!item.usuario;
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nombre, setNombre] = useState(item.funcionario.nombreCompleto || '');
    const [email, setEmail] = useState(item.funcionario.correoElectronico || '');
    const [rol, setRol] = useState(item.usuario?.rol || 2);
    const [password, setPassword] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        try {
            if (isLinked) {
                const bodyFunc = { rut: item.funcionario.rut, correoElectronico: email.trim(), nombreCompleto: nombre.trim(), idUnidad: Number(item.funcionario.idUnidad) || 1 };
                const bodyUser = { idPersona: Number(item.usuario.idPersona), contrasena: password || "", rol: Number(rol), rut: item.funcionario.rut };

                const responses = await Promise.all([
                    fetch(`${API_BASE}/api/Funcionarios/editar`, { method: 'PATCH', headers, body: JSON.stringify(bodyFunc) }),
                    fetch(`${API_BASE}/api/Users`, { method: 'PATCH', headers, body: JSON.stringify(bodyUser) })
                ]);
                if (responses.some(r => !r.ok)) throw new Error("Error al actualizar datos.");
            } else {
                const fd = new FormData();
                fd.append('Rut', item.funcionario.rut);
                fd.append('Rol', String(rol));
                fd.append('Contrasena', password);
                const res = await fetch(`${API_BASE}/api/Users`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
                if (!res.ok) throw new Error("Error al crear la cuenta.");
            }
            onRefresh();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001a35]/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-5xl h-[80vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#002855]">
                <div className="hidden md:flex w-72 p-10 flex-col border-y border-l border-white/10 shrink-0 text-white">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10"><Fingerprint size={24} /></div>
                    <h2 className="text-3xl font-black uppercase mb-2 leading-none">{isLinked ? 'Editar' : 'Alta de'}<br /><span className="text-blue-400">{isLinked ? 'Usuario' : 'Acceso'}</span></h2>
                    <div className="w-8 h-1 bg-blue-500 mb-6" />
                    <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Gestión de identidad digital bajo protocolos de seguridad PDI.</p>
                </div>

                <div className="flex-1 bg-white flex flex-col overflow-hidden relative text-slate-900">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-[#002855] transition-colors"><X size={24} /></button>
                    <div className="flex-1 overflow-y-auto p-10 md:p-14 pt-20 custom-list-scroll">
                        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-3"><AlertCircle size={16} />{error}</div>}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 pb-2"><h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Ficha del Funcionario</h3></div>
                                <div><label className={LABEL_STYLE}><User size={12} /> Nombre Completo</label><input className={INPUT_STYLE} value={nombre} onChange={e => setNombre(e.target.value)} /></div>
                                <div><label className={LABEL_STYLE}><Hash size={12} /> RUT (Inmutable)</label><input className={INPUT_STYLE} value={item.funcionario.rut} disabled /></div>
                                <div><label className={LABEL_STYLE}><Mail size={12} /> Correo</label><input className={INPUT_STYLE} value={email} onChange={e => setEmail(e.target.value)} disabled={!isLinked} /></div>
                            </div>
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 pb-2"><h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Seguridad y Rol</h3></div>
                                <div className="relative">
                                    <label className={LABEL_STYLE}><Lock size={12} /> {isLinked ? 'Cambiar Contraseña' : 'Contraseña de Acceso *'}</label>
                                    <input type={showPass ? "text" : "password"} className={INPUT_STYLE} value={password} onChange={e => setPassword(e.target.value)} placeholder={isLinked ? "DEJAR VACÍO PARA NO CAMBIAR" : "MÍNIMO 8 CARACTERES"} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-9 text-slate-400 hover:text-blue-600 transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}><Shield size={12} /> Rol</label>
                                    <select className={INPUT_STYLE} value={rol} onChange={e => setRol(Number(e.target.value))}>
                                        <option value={1}>1 - ADMINISTRADOR</option>
                                        <option value={2}>2 - FUNCIONARIO</option>
                                    </select>
                                </div>
                                <div className={`p-4 rounded-sm border ${isLinked ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'}`}><div className="flex gap-3"><Info size={16} className="text-[#002855] shrink-0 mt-0.5" /><p className="text-[10px] text-slate-700 font-extrabold uppercase tracking-tight leading-relaxed">{isLinked ? "Cambio de privilegios inmediato." : "Heredando RUT. Requiere contraseña para el primer ingreso."}</p></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-[#002855] uppercase tracking-widest opacity-40">{saving ? 'Guardando...' : 'Confirmar'}</span>
                        <button type="button" onClick={handleSave} disabled={saving || (!isLinked && !password)} className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all active:scale-95 disabled:bg-slate-200">{saving ? <RefreshCw className="animate-spin" size={28} /> : <Save size={28} />}</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};