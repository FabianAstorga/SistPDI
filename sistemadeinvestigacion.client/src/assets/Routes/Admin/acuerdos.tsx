import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Navbar } from '../../components/Navbar';
import { Settings2, ArrowRight, Building2, Calendar, FileText, Info } from 'lucide-react';

/** * GESTIÓN DE ACUERDOS V6.5 - PDI Intranet 2026
 * Fix: Eliminación de creación de empresas. Flujo de selección pura de entidades habilitadas.
 */

const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-4 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-semibold text-sm";

const getOneYearFromNow = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 16);
};

export default function Acuerdos() {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        detallesDescripcion: '',
        fechaVencimiento: getOneYearFromNow(),
        idEmpresa: '' as string | number,
    });

    // Fetch de empresas habilitadas}
    const fetchEmpresas = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Empresa`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                signal: abortControllerRef.current.signal
            });
            const data = await res.json();

            const list = Array.isArray(data) ? data : (data?.$values || []);
            setEmpresas(list);

            // Seleccionamos la primera empresa por defecto si hay disponibles
            if (list.length > 0 && formData.idEmpresa === '') {
                const firstId = list[0].idEmpresa ?? list[0].id;
                setFormData(p => ({ ...p, idEmpresa: firstId }));
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Fetch Empresas Error:", e);
        } finally {
            setLoading(false);
        }
    }, [formData.idEmpresa]);

    useEffect(() => {
        fetchEmpresas();
        return () => abortControllerRef.current?.abort();
    }, [fetchEmpresas]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, idEmpresa: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('temp_acuerdo', JSON.stringify({ ...formData, estado: 'ACTIVO' }));

        const modoLienzo = {
            tipo: 1,
            nombre: "Modo creacion"
        };
        localStorage.setItem('modo', JSON.stringify(modoLienzo));
        navigate('/lienzo');
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-6xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden"
                >
                    {/* SIDEBAR IZQUIERDO */}
                    <div className="hidden md:flex w-72 bg-[#002855] p-10 flex-col justify-start border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <Settings2 size={24} />
                        </div>
                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-4">
                            Nuevo <br /> <span className="text-blue-400"> Acuerdo</span>
                        </h2>
                        <div className="w-8 h-1 bg-blue-500 mb-6" />
                        <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Complete los datos para generar un nuevo acuerdo institucional con una entidad autorizada.
                        </p>
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col bg-white border-y border-r border-white/10 overflow-hidden relative">
                        <div className="flex-1 p-10 md:p-14 overflow-y-auto custom-list-scroll text-slate-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}>Título del Acuerdo</label>
                                    <input
                                        value={formData.titulo}
                                        onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))}
                                        className={INPUT_STYLE}
                                        placeholder="Ej: Convenio de Cooperación 2026"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={LABEL_STYLE}><Building2 size={12} /> Entidad Colaboradora</label>
                                    <select
                                        value={formData.idEmpresa}
                                        onChange={handleSelectChange}
                                        className={`${INPUT_STYLE} cursor-pointer`}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="" disabled>
                                            {loading ? 'Cargando entidades...' : 'Seleccione una institución'}
                                        </option>
                                        {empresas.map(e => (
                                            <option key={`emp-${e.idEmpresa ?? e.id}`} value={e.idEmpresa ?? e.id}>
                                                {e.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className={LABEL_STYLE}><Calendar size={12} /> Fecha de Expiración</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.fechaVencimiento}
                                        onChange={e => setFormData(p => ({ ...p, fechaVencimiento: e.target.value }))}
                                        className={INPUT_STYLE}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}><FileText size={12} /> Resumen Ejecutivo</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))}
                                        className={`${INPUT_STYLE} h-24 resize-none`}
                                        placeholder="Breve descripción del propósito del acuerdo..."
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}><Info size={12} /> Términos y Condiciones</label>
                                    <textarea
                                        value={formData.detallesDescripcion}
                                        onChange={e => setFormData(p => ({ ...p, detallesDescripcion: e.target.value }))}
                                        className={`${INPUT_STYLE} h-40 resize-none text-xs`}
                                        placeholder="Detalle aquí las cláusulas o información relevante adicional..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ACCIÓN PRINCIPAL */}
                        <div className="absolute bottom-10 right-10">
                            <button
                                type="submit"
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all duration-300 group disabled:bg-slate-300 disabled:scale-100"
                                disabled={loading || !formData.idEmpresa}
                            >
                                <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}