import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';
import {
    ShieldCheck,
    RefreshCw,
    ShieldAlert,
    User,
    UserCheck,
    Mail,
    Hash,
    X,
    Save,
    Fingerprint,
    Info,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    LockIcon,
    Plus,
    Boxes,
    Building2
    
} from 'lucide-react';

const FAST_TRANSITION = { type: "spring", stiffness: 400, damping: 30 };
const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const cleanRut = (r: string) => String(r || "").replace(/[^0-9kK]/g, '').toLowerCase();
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed";

export default function AdministracionIdentidad() {
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [unidades, setUnidades] = useState<any[]>([]);
    const [selectedFunc, setSelectedFunc] = useState<any | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const currentUserId = useMemo(() => {
        const userJson = localStorage.getItem('user');
        if (!userJson) return null;
        try {
            const userObj = JSON.parse(userJson);
            return userObj.idUsuario || userObj.idPersona;
        } catch (e) { return null; }
    }, []);

    const currentUserRole = useMemo(() => {
        const token = localStorage.getItem('token');
        if (!token) return 2;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
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
            const [resFunc, resUsr, resUni] = await Promise.all([
                fetch(`${API_BASE}/api/Funcionarios`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Users`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Unidad`, { headers, signal: abortControllerRef.current.signal }) // Nueva API
            ]);
            const dataFunc = await resFunc.json();
            const dataUsr = await resUsr.json();
            const dataUni = await resUni.json();
            setFuncionarios(Array.isArray(dataFunc) ? dataFunc : []);
            setUsuarios(Array.isArray(dataUsr) ? dataUsr : []);
            const listUni = Array.isArray(dataUni) ? dataUni : (dataUni?.$values || []);
            setUnidades(listUni);
        } catch (e: any) { if (e.name !== 'AbortError') console.error("Sync Error:", e); }
        finally { setLoading(false); }
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
        // 1. Mapa de usuarios para búsqueda rápida por RUT
        const userMap = new Map();
        usuarios.forEach(u => userMap.set(cleanRut(u.rut), u));

        // 2. Mapa de unidades para búsqueda rápida por ID
        // Esto es lo que permite "cruzar" los datos localmente
        const unidadMap = new Map();
        unidades.forEach(uni => {
            const id = uni.idUnidad ?? uni.id;
            if (id) unidadMap.set(Number(id), uni);
        });

        const base = funcionarios.map(f => {
            // Buscamos la unidad en nuestro mapa usando el idUnidad del funcionario
            const unidadEncontrada = unidadMap.get(Number(f.idUnidad));

            return {
                funcionario: {
                    ...f,
                    // Si el backend no trajo 'unidad', le ponemos la que encontramos nosotros
                    unidad: f.unidad || unidadEncontrada
                },
                usuario: userMap.get(cleanRut(f.rut)) || null
            };
        })
            .filter(item => {
                if (!currentUserId) return true;
                return item.usuario?.idPersona !== currentUserId;
            });

        if (!search) return base;
        const q = search.toLowerCase();
        return base.filter(item =>
            item.funcionario.rut.toLowerCase().includes(q) ||
            item.funcionario.nombreCompleto?.toLowerCase().includes(q) ||
            // Ahora también puedes buscar por el nombre de la unidad cruzada
            item.funcionario.unidad?.nombre?.toLowerCase().includes(q)
        );
        // IMPORTANTE: Agregamos 'unidades' a las dependencias para que se refresque al cargar
    }, [funcionarios, usuarios, unidades, search, currentUserId]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col relative">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-5" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover' }} />

            <main className="relative z-10 flex-1 p-6 pt-28 mb-4 flex justify-center overflow-hidden">
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-7xl h-full flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#002855] relative">
                    <div className="hidden md:flex w-72 p-10 flex-col border-y border-l border-white/10 shrink-0 relative">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10"><ShieldCheck size={24} /></div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 leading-none text-white">Control de <br /><span className="text-blue-400">Funcionarios</span></h2>
                        <div className="w-8 h-1 bg-blue-500 mb-6" />
                    </div>
                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative text-slate-900">
                        <div className="grid grid-cols-2 bg-slate-200 border-b border-slate-300 px-10 py-3 text-[10px] font-black text-[#002855] uppercase tracking-[0.2em] z-10 shadow-sm">
                            <div>Apartado Funcionario</div>
                            <div className="pl-10">Apartado Usuario</div>
                        </div>

                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-200 z-0 hidden lg:block" />

                        <div className="flex-1 relative z-10 bg-white">
                            {loading ? (
                                <div className="h-full flex items-center justify-center"><span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Cargando Registros...</span></div>
                            ) : (
                                <Virtuoso data={unifiedData} className="custom-list-scroll" itemContent={(_, row) => (
                                    <IdentityRow data={row} onSelect={currentUserRole === 1 ? setSelectedFunc : null} isRestricted={currentUserRole !== 1} />
                                )} />
                            )}
                        </div>

                        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 z-50">
                            <button
                                onClick={() => setSelectedFunc({ funcionario: { rut: '', nombreCompleto: '', correoElectronico: '' }, usuario: null })}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-[0_10px_30px_rgba(0,40,85,0.4)] transition-all active:scale-95 border-2 border-white/20"
                            >
                                <Plus size={32} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <AnimatePresence>
                {selectedFunc && <ModalGestionFuncionario item={selectedFunc} unidades={unidades} onClose={() => setSelectedFunc(null)} onRefresh={fetchData} isAdmin={currentUserRole === 1} />}
            </AnimatePresence>
        </div>
    );
}

const IdentityRow = memo(({ data, onSelect, isRestricted }: any) => {
    const isLinked = !!data.usuario;
    const infoStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5";
    return (
        <div className="px-6 py-2 bg-transparent">
            <motion.div
                whileHover={onSelect ? { y: -3 } : {}}
                whileTap={onSelect ? { scale: 0.995 } : {}}
                transition={FAST_TRANSITION}
                onClick={() => onSelect && onSelect(data)}
                className={`group bg-white border p-6 flex items-center justify-between gap-6 hover:shadow-xl transition-all duration-150 relative overflow-hidden will-change-transform cursor-pointer
                    ${!isLinked ? 'grayscale border-slate-200 opacity-90' : 'border-slate-200'} 
                    ${!onSelect ? 'cursor-default' : 'cursor-pointer'}`}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-transform duration-150 origin-top 
                    ${isLinked ? 'bg-blue-600' : 'bg-amber-500'} 
                    scale-y-0 group-hover:scale-y-100`}
                />
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={`w-14 h-14 rounded-sm flex items-center justify-center shrink-0 shadow-inner transition-colors
                        ${isLinked ? 'bg-slate-100 text-[#002855] group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {isLinked ? <UserCheck size={26} /> : <User size={26} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className={`text-lg font-black uppercase tracking-tighter truncate transition-colors duration-150 
                                ${isLinked ? 'text-[#002855] group-hover:text-blue-600' : 'text-slate-500'}`}>
                                {data.funcionario.nombreCompleto}
                            </h3>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter 
                                ${isLinked ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                {isLinked ? 'En Sistema' : 'Sin Usuario'}
                            </span>
                        </div>
                        <span className={infoStyle}>
                            {data.funcionario.rut}
                        </span>
                        {data.funcionario.unidad?.nombre && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
                                    <Boxes size={10} className="text-emerald-600" />
                                    <span className="text-[12px] font-black text-emerald-700 uppercase tracking-tighter whitespace-nowrap">
                                        {data.funcionario.unidad.nombre}
                                    </span>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                    {isRestricted ? (
                        <div className="flex items-center gap-2 text-slate-300 italic">
                            <LockIcon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Protegido</span>
                        </div>
                    ) : isLinked ? (
                        <div className="flex items-center gap-10 border-l border-slate-100 pl-8">
                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                                <span className={infoStyle} title={data.funcionario.correoElectronico}>
                                    {data.funcionario.correoElectronico}
                                </span>
                                <span className={infoStyle}>
                                    ID: {data.usuario.idPersona}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5 min-w-[120px]">
                                <span className={`${infoStyle} ${data.usuario.rol === 1 ? 'text-blue-700' : 'text-slate-500'}`}>
                                    {data.usuario.rol === 1 ? 'Administrador' : 'Funcionario'}
                                </span>
                                <span className={infoStyle}>
                                    {new Date(data.usuario.fechaCreacion).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border border-amber-100 rounded-sm">
                            <ShieldAlert size={20} className="text-amber-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-amber-700 uppercase leading-none">Acceso Pendiente</span>
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter mt-1">Requiere Alta de Usuario</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
});

const ModalGestionFuncionario = ({ item, onClose, onRefresh, isAdmin, unidades }: any) => {
    const isNew = !item.funcionario.rut;
    const isLinked = !!item.usuario;

    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nombre, setNombre] = useState('');
    const [rut, setRut] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState<number | null>(null);
    const [password, setPassword] = useState('');
    const [idUnidad, setIdUnidad] = useState<number | string>('');

    // Sincronizar estados iniciales
    useEffect(() => {
        if (unidades && unidades.length > 0) {
            if (isNew) {
                const ultima = unidades[unidades.length - 1];
                setIdUnidad(ultima.idUnidad ?? ultima.id);
            } else {
                // Al editar, cargamos la unidad que ya tiene el funcionario
                setIdUnidad(item.funcionario.idUnidad || '');
            }
        }
    }, [unidades, isNew, item]);

    const canSubmit = useMemo(() => {
        if (isNew) return !!(nombre.trim() && rut.trim() && email.trim() && idUnidad && (isAdmin ? password.trim() : true));
        return true;
    }, [nombre, rut, email, password, idUnidad, isNew, isAdmin]);

    const handleSave = async () => {
        if (!canSubmit) return;
        setSaving(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        const finalNombre = nombre.trim() || item.funcionario.nombreCompleto;
        const finalRut = rut.trim() || item.funcionario.rut;
        const finalEmail = email.trim() || item.funcionario.correoElectronico;
        const finalRol = rol !== null ? rol : (item.usuario?.rol || 2);

        // CORRECCIÓN: Usamos el estado idUnidad que cambió el usuario
        const finalUnidad = Number(idUnidad);

        try {
            if (isNew) {
                const bodyCrearFunc = {
                    rut: finalRut,
                    correoElectronico: finalEmail,
                    nombreCompleto: finalNombre,
                    idUnidad: finalUnidad
                };
                const resF = await fetch(`${API_BASE}/api/Funcionarios/crear`, { method: 'POST', headers, body: JSON.stringify(bodyCrearFunc) });
                if (!resF.ok) throw new Error(await resF.text() || "Error al registrar funcionario");

                if (isAdmin && password.trim()) {
                    const fd = new FormData();
                    fd.append('Rut', finalRut);
                    fd.append('Rol', String(finalRol));
                    fd.append('Contrasena', password);
                    await fetch(`${API_BASE}/api/Users`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
                }
            } else if (isAdmin) {
                // Si ya existe (isLinked) o es solo alta de acceso
                const bodyFunc = {
                    rut: item.funcionario.rut,
                    correoElectronico: finalEmail,
                    nombreCompleto: finalNombre,
                    idUnidad: finalUnidad // <-- Ahora enviará el cambio correctamente
                };

                if (isLinked) {
                    const bodyUser = {
                        idPersona: Number(item.usuario.idPersona),
                        contrasena: password || "",
                        rol: Number(finalRol),
                        rut: item.funcionario.rut
                    };
                    await Promise.all([
                        fetch(`${API_BASE}/api/Funcionarios/editar`, { method: 'PATCH', headers, body: JSON.stringify(bodyFunc) }),
                        fetch(`${API_BASE}/api/Users`, { method: 'PATCH', headers, body: JSON.stringify(bodyUser) })
                    ]);
                } else {
                    // Alta de acceso para funcionario existente
                    const fd = new FormData();
                    fd.append('Rut', item.funcionario.rut);
                    fd.append('Rol', String(finalRol));
                    fd.append('Contrasena', password);

                    // Actualizamos unidad primero y luego creamos usuario
                    await fetch(`${API_BASE}/api/Funcionarios/editar`, { method: 'PATCH', headers, body: JSON.stringify(bodyFunc) });
                    const resU = await fetch(`${API_BASE}/api/Users`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
                    if (!resU.ok) throw new Error("Error al asignar cuenta.");
                }
            }
            onRefresh();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001a35]/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-5xl h-[80vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#002855]">
                <div className="hidden md:flex w-72 p-10 flex-col border-y border-l border-white/10 shrink-0 text-white relative">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10"><Fingerprint size={24} /></div>
                    <h2 className="text-3xl font-black uppercase mb-2 leading-none">{isNew ? 'Registrar' : isLinked ? 'Editar' : 'Alta de'}<br /><span className="text-blue-400">{isNew ? 'Personal' : isLinked ? 'Usuario' : 'Acceso'}</span></h2>
                    <div className="w-8 h-1 bg-blue-500 mb-6" />
                </div>
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative text-slate-900">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-[#002855] transition-colors z-20"><X size={24} /></button>
                    <div className="flex-1 overflow-y-auto p-10 md:p-14 pt-20 custom-list-scroll">
                        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-3"><AlertCircle size={16} />{error}</div>}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 pb-2"><h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Ficha del Funcionario</h3></div>

                                <div>
                                    <label className={LABEL_STYLE}><User size={12} /> Nombre Completo *</label>
                                    <input
                                        className={INPUT_STYLE}
                                        value={nombre}
                                        placeholder={item.funcionario.nombreCompleto || "EJ: JUAN PEREZ"}
                                        onChange={e => setNombre(e.target.value)}
                                        disabled={!isAdmin && !isNew}
                                    />
                                </div>

                                <div>
                                    <label className={LABEL_STYLE}><Hash size={12} /> RUT *</label>
                                    <input
                                        className={INPUT_STYLE}
                                        value={rut}
                                        placeholder={item.funcionario.rut || "12.345.678-9"}
                                        onChange={e => setRut(e.target.value)}
                                        disabled={!isNew}
                                    />
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className={LABEL_STYLE}><Mail size={12} /> Correo *</label>
                                        <input
                                            className={INPUT_STYLE}
                                            value={email}
                                            placeholder={item.funcionario.correoElectronico || "correo@institucion.cl"}
                                            onChange={e => setEmail(e.target.value)}
                                            disabled={!isNew && !isAdmin}
                                        />
                                    </div>
                                    <div>
                                        <label className={LABEL_STYLE}><Building2 size={12} /> Unidad Institucional *</label>
                                        <select
                                            className={INPUT_STYLE}
                                            value={idUnidad}
                                            onChange={e => setIdUnidad(e.target.value)}
                                            disabled={!isAdmin && !isNew}
                                        >
                                            <option value="" disabled>Seleccione una unidad operativa</option>
                                            {unidades.map((u: any) => (
                                                <option key={u.idUnidad ?? u.id} value={u.idUnidad ?? u.id}>
                                                    {u.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={`space-y-8 ${(isNew && !isAdmin) ? 'opacity-30 pointer-events-none' : ''}`}>
                                <div className="border-b border-slate-100 pb-2"><h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Seguridad y Rol</h3></div>

                                <div className="relative">
                                    <label className={LABEL_STYLE}><Lock size={12} /> {isLinked ? 'Cambiar Contraseña' : 'Contraseña de Acceso *'}</label>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        className={INPUT_STYLE}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        placeholder={isLinked ? "DEJAR VACÍO PARA MANTENER ACTUAL" : "MÍNIMO 4 CARACTERES"}
                                        disabled={!isAdmin && !isNew}
                                    />
                                    {isAdmin && <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-9 text-slate-400 hover:text-blue-600 transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                                </div>

                                <div>
                                    <label className={LABEL_STYLE}> Rol de Sistema</label>
                                    <select
                                        className={INPUT_STYLE}
                                        value={rol !== null ? rol : (item.usuario?.rol || 2)}
                                        onChange={e => setRol(Number(e.target.value))}
                                        disabled={!isAdmin}
                                    >
                                        <option value={1}>Administrador</option>
                                        <option value={2}>Funcionario</option>
                                    </select>
                                </div>
                                <div className={`p-4 rounded-sm border ${isLinked ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex gap-3">
                                        <Info size={16} className="text-[#002855] shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-slate-700 font-extrabold uppercase tracking-tight leading-relaxed">
                                            {isNew ? "La unidad por defecto es la última creada." : "Solo los campos que escriba serán actualizados."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(isAdmin || isNew) && (
                        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 z-50">
                            <span className="text-[10px] font-black text-[#002855] uppercase tracking-widest opacity-40">
                                {saving ? 'Procesando...' : isNew ? 'Registrar Personal' : 'Confirmar Cambios'}
                            </span>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !canSubmit}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-[0_10px_30px_rgba(0,40,85,0.4)] transition-all active:scale-95 disabled:bg-slate-200 border-2 border-white/20"
                            >
                                {saving ? <RefreshCw className="animate-spin" size={28} /> : <Save size={28} />}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};