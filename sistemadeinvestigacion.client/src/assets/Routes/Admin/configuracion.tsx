//Este apartado es para poder realizar los ajustes personales, pero actualmente como algunas apis del backend estan protegidas por rol
//solo los administradores pueden editar sus datos personales, los funcionarios no, por ende ellos no pueden entrar aqui.
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Mail, Lock, Save, RefreshCw,
    ShieldCheck, AlertCircle, Eye, EyeOff, Info
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "/i_region_cuartel_investigaciones_arica.png";
const LABEL_STYLE = "text-[9px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2";
const INPUT_STYLE_LIGHT = "w-full bg-slate-50 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-bold text-sm placeholder:text-slate-300";
const transitionConfig = { type: "spring", stiffness: 300, damping: 30 };

export default function ConfiguracionPersonal() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const abortControllerRef = useRef<AbortController | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        rut: "",
        email: "",
        idPersona: 0,
        rol: 0,
        password: "",
        confirmPassword: "",
        fechaCreacion: "",
        fechaActualizacion: new Date().toISOString()
    });

    useEffect(() => {
        const fetchDatos = async () => {
            const token = localStorage.getItem('token');
            const userStorage = localStorage.getItem('user');
            if (!token || !userStorage) { setLoading(false); return; }

            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            try {
                const userLocal = JSON.parse(userStorage);
                const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

                const resUser = await fetch(`${API_BASE}/api/Users/${userLocal.idUsuario}`, { headers, signal: abortControllerRef.current.signal });
                const userData = await resUser.json();

                const resFunc = await fetch(`${API_BASE}/api/Funcionarios/${userData.idPersona}`, { headers, signal: abortControllerRef.current.signal });
                const funcData = await resFunc.json();

                setFormData({
                    nombre: funcData.nombreCompleto || funcData.nombre || "",
                    rut: funcData.rut || "",
                    email: funcData.correoElectronico || funcData.correo || "",
                    idPersona: userData.idPersona,
                    rol: userData.rol,
                    password: "",
                    confirmPassword: "",
                    fechaCreacion: userData.fechaCreacion,
                    fechaActualizacion: new Date().toISOString()
                });
            } catch (e: any) {
                if (e.name !== 'AbortError') setStatus({ type: 'error', msg: "Error al sincronizar datos de usuario." });
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

    const passError = useMemo(() => {
        if (formData.password.length === 0) return null;
        if (formData.password.length < 4) return "Mínimo 4 caracteres";
        if (formData.password !== formData.confirmPassword) return "Las claves no coinciden";
        return null;
    }, [formData.password, formData.confirmPassword]);

    const canSave = useMemo(() => {
        const basicInfo = formData.nombre.trim() !== "" && formData.email.trim() !== "";
        if (formData.password.length > 0) return basicInfo && passError === null;
        return basicInfo;
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
                    body: JSON.stringify({
                        rut: formData.rut,
                        correoElectronico: formData.email.trim(),
                        nombreCompleto: formData.nombre.trim()
                    })
                }),
                fetch(`${API_BASE}/api/Users`, {
                    method: 'PATCH', headers,
                    body: JSON.stringify({
                        idPersona: formData.idPersona,
                        contrasena: formData.password.trim() || null,
                        rol: formData.rol,
                        rut: formData.rut,
                        idEstado: 1
                    })
                })
            ]);
            setStatus({ type: 'ok', msg: 'Cambios sincronizados correctamente.' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '', fechaActualizacion: new Date().toISOString() }));
        } catch (e: any) {
            setStatus({ type: 'error', msg: "Fallo al impactar cambios en el servidor." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-screen bg-[#002855] flex flex-col items-center justify-center gap-4 text-white font-black uppercase text-[10px] tracking-[0.4em]">
            <RefreshCw className="animate-spin text-blue-400" size={32} />
            Iniciando Protocolos...
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#002855] font-sans text-white flex flex-col relative">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover' }} />

            <main className="relative z-10 flex-1 p-8 pt-32 max-w-7xl mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Configuración <span className="text-blue-400">Personal</span></h1>
                </motion.div>

                <div className="grid grid-cols-12 gap-8 pb-20">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={transitionConfig} className="col-span-12 lg:col-span-4 bg-[#001a35]/40 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl overflow-hidden h-fit">
                        <div className="h-1 bg-blue-500 w-full" />
                        <div className="p-10 flex flex-col items-center border-b border-white/5">
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl border-4 border-white/10">
                                <User size={40} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-center leading-none mb-4">{formData.nombre}</h2>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded-sm shadow-lg">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{formData.rol === 1 ? 'ADMINISTRADOR' : 'FUNCIONARIO'}</span>
                            </div>
                        </div>
                        <div className="p-8 bg-black/20 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-blue-300/40 uppercase tracking-widest">RUT </span>
                                <span className="text-sm font-bold">{formData.rut}</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-white/95 backdrop-blur-md p-10 rounded-sm shadow-2xl text-slate-900">
                            <AnimatePresence mode="wait">
                                {status.msg && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className={`mb-6 p-4 text-[10px] font-black uppercase flex items-center gap-3 border-l-4 ${status.type === 'ok' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                                        <AlertCircle size={14} className="shrink-0" /> {status.msg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4 text-[#002855]">
                                <Mail size={16} />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Datos de la Cuenta</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={`${LABEL_STYLE} text-slate-400`}>Nombre completo</label>
                                    <input name="nombre" className={INPUT_STYLE_LIGHT} value={formData.nombre} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={`${LABEL_STYLE} text-slate-400`}>Correo electrónico</label>
                                    <input name="email" className={INPUT_STYLE_LIGHT} value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/95 backdrop-blur-md p-10 rounded-sm shadow-2xl text-slate-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2 border-b border-slate-100 pb-4 text-[#002855]">
                                        <Lock size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em]">Seguridad</h3>
                                    </div>
                                    <div className="relative">
                                        <label className={`${LABEL_STYLE} text-slate-400`}>Nueva clave</label>
                                        <input name="password" type={showPass ? "text" : "password"} className={INPUT_STYLE_LIGHT} value={formData.password} onChange={handleChange} placeholder="RELLENAR PARA CAMBIAR" />
                                        <button onClick={() => setShowPass(!showPass)} className="absolute right-3 bottom-3 text-slate-300 hover:text-[#002855] transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                    </div>
                                    <div>
                                        <label className={`${LABEL_STYLE} text-slate-400`}>Confirmar clave</label>
                                        <input name="confirmPassword" type="password" className={INPUT_STYLE_LIGHT} value={formData.confirmPassword} onChange={handleChange} />
                                    </div>
                                    {passError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{passError}</p>}
                                </div>

                                <div className="flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-[#002855] border-b border-slate-100 pb-4">
                                            <Info size={18} />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Metadatos</h3>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3 shadow-inner text-[10px] font-bold text-slate-600">
                                            <div className="flex justify-between uppercase"><span className="text-slate-400">ID Usuario</span><span className="text-[#002855]">#{formData.idPersona}</span></div>
                                            <div className="flex justify-between uppercase"><span className="text-slate-400">Actualización</span><span>{new Date(formData.fechaActualizacion).toLocaleTimeString()}</span></div>
                                        </div>
                                    </div>
                                    <button onClick={handleSave} disabled={saving || !canSave} className="mt-8 w-full py-5 bg-[#002855] text-white font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-95 shadow-xl disabled:bg-slate-300 rounded-full">
                                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
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