import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from '../../components/Navbar';
import { Settings2, ArrowRight, Building2, Calendar, FileText, Info, X } from 'lucide-react';

const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

export default function Acuerdos() {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getOneYearFromNow = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        detallesDescripcion: '',
        fechaVencimiento: getOneYearFromNow(),
        idEmpresa: '' as string | number,
    });

    const fetchEmpresas = async (selectNewest = false) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5091/api/Empresa', {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setEmpresas(list);

            if (list.length > 0 && (formData.idEmpresa === '' || selectNewest)) {
                const targetId = selectNewest ? list[list.length - 1].idEmpresa : list[0].idEmpresa;
                setFormData(p => ({ ...p, idEmpresa: targetId }));
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchEmpresas(); }, []);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === "NEW_COMPANY") {
            setIsModalOpen(true);
        } else {
            setFormData({ ...formData, idEmpresa: val });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('temp_acuerdo', JSON.stringify({ ...formData, estado: 'ACTIVO' }));
        navigate('/lienzo');
    };

    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
    const inputStyle = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-4 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-semibold text-sm";

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />

            <ModalNuevaEmpresa
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => fetchEmpresas(true)}
            />

            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855] via-transparent to-[#002855]" />
            </div>

            <main className="relative z-10 flex-1 flex items-center justify-center p-6 mt-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-6xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden"
                >
                    {/* Sidebar Izquierda */}
                    <div className="hidden md:flex w-72 bg-[#002855] p-10 flex-col justify-start border-y border-l border-white/10 shrink-0">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                                <Settings2 className="text-white" size={24} />
                            </div>
                            <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-4">
                                Nuevo <br />
                                <span className="text-blue-400"> Acuerdo</span>
                            </h2>
                            <div className="w-8 h-1 bg-blue-500 mb-6" />
                            {/* Texto solicitado debajo de la franja */}
                            <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Ingresa un nuevo acuerdo con fecha de vencimiento calculada para un año
                            </p>
                        </div>
                    </div>

                    {/* Formulario Derecha */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col bg-white border-y border-r border-white/10 overflow-hidden relative">
                        <div className="flex-1 p-10 md:p-14 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="md:col-span-2">
                                    <label className={labelStyle}>Título del Acuerdo</label>
                                    <input value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className={inputStyle} placeholder="Nombre del acuerdo..." required />
                                </div>

                                <div className="space-y-1">
                                    <label className={labelStyle}><Building2 size={12} /> Empresa </label>
                                    <select
                                        value={formData.idEmpresa}
                                        onChange={handleSelectChange}
                                        className={inputStyle}
                                        required
                                    >
                                        <option value="" disabled>Seleccione una empresa</option>
                                        {empresas.map(e => <option key={e.idEmpresa} value={e.idEmpresa}>{e.nombre}</option>)}
                                        {/* Opción al final con estilo estándar */}
                                        <option value="NEW_COMPANY">+ Empresa</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className={labelStyle}><Calendar size={12} /> Fecha Término</label>
                                    <input type="datetime-local" value={formData.fechaVencimiento} onChange={e => setFormData({ ...formData, fechaVencimiento: e.target.value })} className={inputStyle} required />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelStyle}><FileText size={12} /> Descripción breve</label>
                                    <textarea value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className={`${inputStyle} h-24 resize-none`} required />
                                </div>
                                <div className="md:col-span-2 text-slate-900">
                                    <label className={labelStyle}><Info size={12} /> Descripción detallada</label>
                                    <textarea value={formData.detallesDescripcion} onChange={e => setFormData({ ...formData, detallesDescripcion: e.target.value })} className={`${inputStyle} h-40 resize-none text-xs`} required />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 right-10">
                            <button type="submit" className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all duration-300 group active:scale-95">
                                <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}

function ModalNuevaEmpresa({ isOpen, onClose, onCreated }: { isOpen: boolean, onClose: () => void, onCreated: () => void }) {
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!nombre) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5091/api/Empresa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ nombre })
            });
            if (res.ok) { onCreated(); onClose(); setNombre(''); }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002855]/60 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white w-full max-w-md p-10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-slate-900 font-black uppercase tracking-tighter text-2xl leading-none">Nueva <br /><span className="text-blue-600">Empresa</span></h3>
                                <div className="w-6 h-1 bg-blue-500 mt-2" />
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 block">Nombre de la Organización</label>
                                <input
                                    autoFocus
                                    placeholder="Ej: Constructora S.A."
                                    className="w-full bg-slate-50 border-b-2 border-slate-100 text-slate-900 px-0 py-4 outline-none focus:border-blue-600 transition-all font-semibold text-sm"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={loading || !nombre}
                                className="w-full bg-[#002855] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-900/20 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {loading ? 'Procesando...' : 'Confirmar Registro'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}