import React, { useMemo, useState } from 'react';
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

const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

export default function Institucion() {
    const navigate = useNavigate();

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [sitioWeb, setSitioWeb] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
    const inputStyle = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-semibold text-sm";

    const canSubmit = useMemo(() => {
        return nombre.trim() && descripcion.trim() && sitioWeb.trim() && direccion.trim() && !!logoFile;
    }, [nombre, descripcion, sitioWeb, direccion, logoFile]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setLogoFile(file);
        setOkMsg(null);
        setErrorMsg(null);
        if (file) setLogoPreview(URL.createObjectURL(file));
        else setLogoPreview(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMsg(null);
        setOkMsg(null);

        if (!canSubmit) {
            setErrorMsg('Faltan campos obligatorios: nombre, descripción, sitio web, dirección y logo.');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('nombre', nombre.trim());
            fd.append('descripcion', descripcion.trim());
            fd.append('sitioWeb', sitioWeb.trim());
            fd.append('direccion', direccion.trim());
            if (email.trim()) fd.append('email', email.trim());
            if (telefono.trim()) fd.append('telefono', telefono.trim());
            if (logoFile) fd.append('logo', logoFile);

            const res = await fetch('http://localhost:5091/api/Empresa/crear', {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: fd,
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(text || `Error HTTP ${res.status}`);
            }

            setOkMsg('Institución registrada en el sistema exitosamente.');
            setNombre(''); setDescripcion(''); setSitioWeb(''); setEmail('');
            setTelefono(''); setDireccion(''); setLogoFile(null); setLogoPreview(null);
        } catch (err: any) {
            setErrorMsg(err?.message || 'Error al procesar el registro.');
        } finally {
            setSaving(false);
        }
    };

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
                    className="w-full max-w-6xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm"
                >
                    {/* SIDEBAR IZQUIERDO */}
                    <div className="hidden md:flex w-72 bg-[#002855] p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <Building className="text-white" size={24} />
                        </div>

                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">
                            Nueva <br />
                            <span className="text-blue-400">Institución</span>
                        </h2>
                        <div className="w-8 h-1 bg-blue-500 mb-6" />
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em]">
                            Registro centralizado de <br /> entidades colaboradoras
                        </p>
                    </div>

                    {/* ÁREA DE FORMULARIO DERECHA */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                        <div className="flex-1 overflow-y-auto p-10 md:p-14 pt-20 custom-list-scroll">

                            <AnimatePresence>
                                {okMsg && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex items-center gap-3 text-emerald-800">
                                        <CheckCircle2 size={18} /> <span className="text-xs font-bold uppercase tracking-tight">{okMsg}</span>
                                    </motion.div>
                                )}
                                {errorMsg && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-800">
                                        <AlertCircle size={18} /> <span className="text-xs font-bold uppercase tracking-tight">{errorMsg}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
                                {/* COLUMNA 1 */}
                                <div className="space-y-8">
                                    <div className="border-b border-slate-100 pb-2">
                                        <h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Identificación y Contacto</h3>
                                    </div>

                                    <div>
                                        <label className={labelStyle}>Nombre de la Organización *</label>
                                        <input type="text" className={inputStyle} placeholder="Nombre oficial..." value={nombre} onChange={(e) => setNombre(e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelStyle}><Mail size={12} /> Email</label>
                                            <input type="email" className={inputStyle} placeholder="ejemplo@dominio.cl" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}><Phone size={12} /> Teléfono</label>
                                            <input type="text" className={inputStyle} placeholder="+56..." value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelStyle}><MapPin size={12} /> Dirección Física *</label>
                                        <input type="text" className={inputStyle} placeholder="Calle, Número, Comuna" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                                    </div>

                                    <div>
                                        <label className={labelStyle}><FileText size={12} /> Reseña Institucional *</label>
                                        <textarea className={`${inputStyle} h-32 resize-none`} placeholder="Breve descripción..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                                    </div>
                                </div>

                                {/* COLUMNA 2 */}
                                <div className="space-y-8">
                                    <div className="border-b border-slate-100 pb-2">
                                        <h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Plataforma y Branding</h3>
                                    </div>

                                    <div>
                                        <label className={labelStyle}><Globe size={12} /> Sitio Web Oficial *</label>
                                        <input type="url" className={inputStyle} placeholder="https://www.ejemplo.cl" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} />
                                    </div>

                                    <div>
                                        <label className={labelStyle}><ImageIcon size={12} /> Logotipo Empresarial *</label>
                                        <div className="mt-4 relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                                            />
                                            <div className="h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center transition-all group-hover:bg-slate-100 group-hover:border-blue-400 overflow-hidden">
                                                {logoPreview ? (
                                                    <motion.img
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                        src={logoPreview} className="h-full w-full object-contain p-4"
                                                    />
                                                ) : (
                                                    <>
                                                        <ImageIcon size={40} className="text-slate-300 mb-4" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subir Imagen</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* BOTÓN FLOTANTE GUARDAR */}
                        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-[#002855] uppercase tracking-widest opacity-40">Guardar</span>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit || saving}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all duration-300 group active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100"
                            >
                                <Save size={28} className={saving ? "animate-pulse" : "group-hover:rotate-12 transition-transform"} />
                            </button>
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