//Este es el apartado de creacion de empresa, antes llamados institucion, por lo que todas las apis y refencias internas tienen este nombre
//Es el relleno de un formulario y la llamada de una api, nada mas.
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
    Building,
    Globe,
    Image as ImageIcon,
    Save,
    Mail,
    Phone,
    MapPin,
    FileText,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const HERO_BG = "/i_region_cuartel_investigaciones_arica.png";
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-semibold text-sm";

export default function Institucion() {
    const navigate = useNavigate();
    const abortControllerRef = useRef<AbortController | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        sitioWeb: '',
        email: '',
        telefono: '',
        direccion: ''
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'ok' | 'error' | null, msg: string | null }>({ type: null, msg: null });

    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            abortControllerRef.current?.abort();
        };
    }, [logoPreview]);

    const canSubmit = useMemo(() => {
        return formData.nombre.trim() &&
            formData.descripcion.trim() &&
            formData.sitioWeb.trim() &&
            formData.direccion.trim() &&
            !!logoFile;
    }, [formData, logoFile]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoFile(file);
        setStatus({ type: null, msg: null });
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(null);
        }
    }, [logoPreview]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!canSubmit || saving) return;

        setStatus({ type: null, msg: null });
        setSaving(true);

        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();

            Object.entries(formData).forEach(([key, val]) => {
                if (key === 'telefono') {
                    const cleanPhone = val.replace(/\D/g, '');
                    fd.append(key, cleanPhone);
                } else {
                    fd.append(key, val.trim());
                }
            });

            if (logoFile) fd.append('logo', logoFile);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Empresa/crear`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: fd,
                signal: abortControllerRef.current.signal
            });

            if (!res.ok) throw new Error(await res.text() || 'Error en el servidor');

            setStatus({ type: 'ok', msg: 'Empresa registrada exitosamente.' });
            setFormData({ nombre: '', descripcion: '', sitioWeb: '', email: '', telefono: '', direccion: '' });
            setLogoFile(null);
            setLogoPreview(null);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setStatus({ type: 'error', msg: err.message || 'Error al procesar el registro.' });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855] via-transparent to-[#002855]" />
            </div>
            <main className="relative z-10 flex-1 flex items-center justify-center p-6 mt-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-6xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#002855]"
                >
                    <div className="hidden md:flex w-72 p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg">
                            <Building size={24} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Nueva <br /><span className="text-blue-400">Empresa</span></h2>
                        <div className="w-8 h-1 bg-blue-500 mb-6" />
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em]">Rellene el formulario para ingresar una nueva empresa en sistema.</p>
                    </div>
                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                        <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-list-scroll">
                            <AnimatePresence mode="wait">
                                {status.msg && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mb-8 p-4 border-l-4 flex items-center gap-3 ${status.type === 'ok' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-red-50 border-red-500 text-red-800'}`}
                                    >
                                        {status.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        <span className="text-xs font-bold uppercase tracking-tight">{status.msg}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <form className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
                                <div className="space-y-8">
                                    <div className="border-b border-slate-100 pb-2">
                                        <h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Identificación</h3>
                                    </div>
                                    <div>
                                        <label className={LABEL_STYLE}>Nombre de la empresa</label>
                                        <input name="nombre" type="text" className={INPUT_STYLE} value={formData.nombre} onChange={handleInputChange} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className={LABEL_STYLE}><Mail size={12} /> Email</label>
                                            <input name="email" type="email" className={INPUT_STYLE} value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label className={LABEL_STYLE}><Phone size={12} /> Teléfono</label>
                                            <input
                                                name="telefono"
                                                type="text"
                                                inputMode="numeric"
                                                className={INPUT_STYLE}
                                                value={formData.telefono}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^[0-9\b]+$/.test(val)) {
                                                        handleInputChange(e);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={LABEL_STYLE}><MapPin size={12} /> Dirección</label>
                                        <input name="direccion" type="text" className={INPUT_STYLE} value={formData.direccion} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <label className={LABEL_STYLE}><FileText size={12} /> Descripción de la empresa</label>
                                        <textarea name="descripcion" className={`${INPUT_STYLE} h-32 resize-none`} value={formData.descripcion} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="border-b border-slate-100 pb-2">
                                        <h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Link y Logo</h3>
                                    </div>
                                    <div>
                                        <label className={LABEL_STYLE}><Globe size={12} /> Link del sitio web</label>
                                        <input name="sitioWeb" type="url" className={INPUT_STYLE} value={formData.sitioWeb} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <label className={LABEL_STYLE}><ImageIcon size={12} /> Imagen del logotipo png/jpg</label>
                                        <div className="mt-4 relative group h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-blue-400">
                                            <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                                            {logoPreview ? (
                                                <img src={logoPreview} className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105" alt="Preview" />
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <ImageIcon size={40} className="text-slate-300 mb-4" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subir Imagen</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-[#002855] uppercase tracking-widest opacity-40">Registrar</span>
                            <button
                                onClick={() => handleSubmit()}
                                disabled={!canSubmit || saving}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                <Save size={28} className={saving ? "animate-pulse" : ""} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}