import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Mail, Lock, Shield, Save, Camera,
    RefreshCw, Hash, Briefcase, ShieldCheck,
    AlertCircle, Eye, EyeOff, Info
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const LABEL_STYLE = "text-[9px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2";
const INPUT_STYLE_LIGHT = "w-full bg-slate-50 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-bold text-sm placeholder:text-slate-300";
const transitionConfig = { type: "spring", stiffness: 300, damping: 30 };
export default function ConfiguracionPersonal() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const abortControllerRef = useRef<AbortController | null>(null);

    const [formData, setFormData] = useState({
        nombre: "", rut: "", email: "", idUnidad: 1, unidad: "",
        idPersona: 0, rol: 0, password: "", confirmPassword: "",
        fechaCreacion: "", fechaActualizacion: ""
    });

    const initials = useMemo(() => {
        if (!formData.nombre) return "??";
        const parts = formData.nombre.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        if (parts.length === 2) return (parts[0].substring(0, 2) + parts[1].substring(0, 2)).toUpperCase();
        return parts.map(p => p[0]).join('').toUpperCase();
    }, [formData.nombre]);

    useEffect(() => {
        const fetchDatos = async () => {
            const token = localStorage.getItem('token');
            const userStorage = localStorage.getItem('user');
            if (!token || !userStorage) { setLoading(false); return; }

            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            try {
                const userLocal = JSON.parse(userStorage);
                const idParaGet = userLocal.idUsuario;
                const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

                const resUser = await fetch(`${API_BASE}/api/Users/${idParaGet}`, { headers, signal: abortControllerRef.current.signal });
                const userData = await resUser.json();

                const resFunc = await fetch(`${API_BASE}/api/Funcionarios/${userData.idPersona}`, { headers, signal: abortControllerRef.current.signal });
                const funcData = await resFunc.json();

                setFormData({
                    nombre: funcData.nombre || funcData.nombreCompleto || "",
                    rut: funcData.rut || "",
                    email: funcData.correo || funcData.correoElectronico || "",
                    idUnidad: funcData.idUnidad || 1,
                    unidad: funcData.unidad?.nombreUnidad || "Unidad Activa",
                    idPersona: userData.idPersona,
                    rol: userData.rol,
                    password: "",
                    confirmPassword: "",
                    fechaCreacion: userData.fechaCreacion,
                    fechaActualizacion: new Date().toISOString()
                });
            } catch (e: any) {
                if (e.name !== 'AbortError') setStatus({ type: 'error', msg: e.message });
            } finally {
                setLoading(false);
            }
        };

        fetchDatos();
        return () => abortControllerRef.current?.abort();
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            setLogoPreview(URL.createObjectURL(file));
        }
    }, [logoPreview]);
    const passError = useMemo(() => {
        if (formData.password.length === 0) return null;
        if (formData.password.length < 4) return "Mínimo 4 caracteres";
        if (formData.password !== formData.confirmPassword) return "Las claves no coinciden";
        return null;
    }, [formData.password, formData.confirmPassword]);

    const canSave = useMemo(() => {
        if (formData.password.length > 0) {
            return passError === null;
        }
        return formData.nombre.trim() !== "" && formData.email.trim() !== "";
    }, [formData.password, passError, formData.nombre, formData.email]);

    const handleSave = async () => {
        if (!canSave || saving) return;
        setSaving(true);
        setStatus({ type: '', msg: '' });
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        try {
            await Promise.all([
                fetch(`${API_BASE}/api/Funcionarios/editar`, {
                    method: 'PATCH', headers,
                    body: JSON.stringify({ rut: formData.rut, correoElectronico: formData.email.trim(), nombreCompleto: formData.nombre.trim(), idUnidad: formData.idUnidad })
                }),
                fetch(`${API_BASE}/api/Users`, {
                    method: 'PATCH', headers,
                    body: JSON.stringify({ idPersona: formData.idPersona, contrasena: formData.password.trim() || null, rol: formData.rol, rut: formData.rut, idEstado: 1 })
                })
            ]);
            setStatus({ type: 'ok', msg: 'Cambios sincronizados correctamente.' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '', fechaActualizacion: new Date().toISOString() }));
        } catch (e: any) {
            setStatus({ type: 'error', msg: "Fallo al impactar cambios." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-screen bg-[#002855] flex flex-col items-center justify-center gap-4 text-white">
            <RefreshCw className="animate-spin text-blue-400" size={32} />
            <span className="font-black text-[10px] uppercase tracking-[0.4em]">Iniciando Protocolos...</span>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#002855] font-sans text-white flex flex-col relative">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover' }} />

            <main className="relative z-10 flex-1 p-8 pt-32 max-w-7xl mx-auto w-full overflow-x-hidden">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center lg:text-left">
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-white">Configuración <span className="text-blue-400">Personal</span></h1>
                </motion.div>

                <div className="grid grid-cols-12 gap-8 pb-20">

                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ ...transitionConfig, delay: 0.1 }} className="col-span-12 lg:col-span-4 bg-[#001a35]/40 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl flex flex-col h-fit overflow-hidden">
                        <div className="h-1 bg-blue-500 w-full" />
                        <div className="p-10 flex flex-col items-center border-b border-white/5">
                            <div className="relative w-44 h-44 mb-8 group">
                                <div className="w-full h-full rounded-sm border border-white/20 p-2 bg-white/5 transition-colors group-hover:border-blue-400 flex items-center justify-center">
                                    <div className="w-full h-full rounded-sm bg-slate-900 overflow-hidden relative shadow-inner flex items-center justify-center">
                                        {logoPreview ? <img src={logoPreview} alt="Perfil" className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-blue-400 tracking-tighter select-none">{initials}</span>}
                                        <label className="absolute inset-0 bg-[#002855]/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer p-4">
                                            
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-center leading-none text-white">{formData.nombre}</h2>
                            <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-blue-600 rounded-sm shadow-lg">
                                <ShieldCheck size={14} className="text-white" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{formData.rol === 1 ? 'ADMINISTRADOR' : 'FUNCIONARIO'}</span>
                            </div>
                        </div>
                        <div className="p-8 space-y-6 bg-black/20 text-white">
                            <div className="flex items-center gap-5 text-left">
                                <div className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-sm text-blue-400 border border-white/10 shadow-inner"><Hash size={18} /></div>
                                <div className="flex-1"><p className={`${LABEL_STYLE} text-blue-300/40 mb-0`}>RUT </p><p className="text-sm font-bold tracking-[0.1em]">{formData.rut}</p></div>
                            </div>
                            <div className="flex items-center gap-5 text-left">
                                <div className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-sm text-blue-400 border border-white/10 shadow-inner"><Briefcase size={18} /></div>
                                <div className="flex-1"><p className={`${LABEL_STYLE} text-blue-300/40 mb-0`}>Unidad</p><p className="text-sm font-bold uppercase truncate max-w-[180px]">{formData.unidad}</p></div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ ...transitionConfig, delay: 0.2 }} className="bg-white/95 backdrop-blur-md p-10 rounded-sm shadow-2xl text-slate-900 relative">
                            <AnimatePresence mode="wait">
                                {status.msg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className={`mb-6 p-4 text-[10px] font-black uppercase flex items-center gap-3 border-l-4 overflow-hidden ${status.type === 'ok' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'}`}
                                    >
                                        <AlertCircle size={14} className="shrink-0" /> {status.msg}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
                                <div className="w-8 h-8 bg-[#002855] text-white flex items-center justify-center rounded-sm shadow-lg"><Mail size={16} /></div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#002855]">Datos de contacto</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div><label className={`${LABEL_STYLE} text-slate-400`}>Nombre completo</label><input name="nombre" className={INPUT_STYLE_LIGHT} value={formData.nombre} onChange={handleChange} /></div>
                                <div><label className={`${LABEL_STYLE} text-slate-400`}>Correo electrónico</label><input name="email" className={INPUT_STYLE_LIGHT} value={formData.email} onChange={handleChange} /></div>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ ...transitionConfig, delay: 0.3 }} className="bg-white/95 backdrop-blur-md rounded-sm shadow-2xl text-slate-900 h-fit">
                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2 border-b border-slate-100 pb-4">
                                        <div className="w-8 h-8 bg-[#002855] text-white flex items-center justify-center rounded-sm shadow-lg"><Lock size={16} /></div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#002855]">Seguridad</h3>
                                    </div>
                                    <div className="relative">
                                        <label className={`${LABEL_STYLE} text-slate-400`}>Nueva clave</label>
                                        <input name="password" type={showPass ? "text" : "password"} className={INPUT_STYLE_LIGHT} value={formData.password} onChange={handleChange} placeholder="MÍN. 4 CARACTERES" />
                                        <button onClick={() => setShowPass(!showPass)} className="absolute right-3 bottom-3 text-slate-300 hover:text-[#002855] transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                    </div>
                                    <div>
                                        <label className={`${LABEL_STYLE} text-slate-400`}>Confirmar clave</label>
                                        <input name="confirmPassword" type="password" className={INPUT_STYLE_LIGHT} value={formData.confirmPassword} onChange={handleChange} />
                                    </div>
                                    {passError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{passError}</p>}
                                </div>
                                <div className="flex flex-col justify-between h-full min-h-[220px]">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-[#002855] border-b border-slate-100 pb-4"><Info size={18} /><h3 className="text-xs font-black uppercase tracking-[0.2em]">Metadatos</h3></div>
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3 shadow-inner">
                                            <div className="flex justify-between items-center"><span className="text-[8px] font-black text-slate-400 uppercase">ID Persona</span><span className="text-[10px] font-bold text-[#002855]">#{formData.idPersona}</span></div>
                                            <div className="flex justify-between items-center"><span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Fecha Creacion</span><span className="text-[10px] font-bold text-slate-600">{formData.fechaCreacion ? new Date(formData.fechaCreacion).toLocaleDateString() : '---'}</span></div>
                                            <div className="flex justify-between items-center"><span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Ultima actualizacion</span><span className="text-[10px] font-bold text-slate-600">{new Date(formData.fechaActualizacion).toLocaleTimeString()}</span></div>
                                        </div>
                                    </div>
                                    <button onClick={handleSave} disabled={saving || !canSave} className="mt-8 w-full py-5 bg-[#002855] text-white font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-95 shadow-xl disabled:bg-slate-300 rounded-full shrink-0">
                                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Guardar cambios
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}