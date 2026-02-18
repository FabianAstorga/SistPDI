import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from '../../components/Navbar';
import { Settings2, ArrowRight, Building2, Calendar, FileText, Info, Layout, X, CheckCircle2 } from 'lucide-react';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-4 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-semibold text-sm";
const FORM_DRAFT_KEY = 'acuerdos_form_draft';
const getOneYearFromNow = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 16);
};
export default function Acuerdos() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [isUnidadesModalOpen, setIsUnidadesModalOpen] = useState(false);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        detallesDescripcion: '',
        fechaVencimiento: getOneYearFromNow(),
        idEmpresa: '' as string | number,
        idCategoria: '' as string | number,
        templateSvg: '',
        idsUnidades: [] as number[]
    });
    useEffect(() => {
        const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData(prev => ({
                    ...prev,
                    ...parsed,
                    idsUnidades: parsed.idsUnidades || []
                }));
            } catch (e) {
                console.error("Error al restaurar borrador", e);
            }
        }
    }, []);
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(formData));
        }
    }, [formData, loading]);
    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        try {
            const resEmp = await fetch(`${import.meta.env.VITE_API_URL}/api/Empresa`, {
                headers,
                signal: abortControllerRef.current.signal
            });
            const dataEmp = await resEmp.json();
            const listEmp = Array.isArray(dataEmp) ? dataEmp : (dataEmp?.$values || []);
            setEmpresas(listEmp);
            if (listEmp.length > 0 && formData.idEmpresa === '') {
                const firstId = listEmp[0].idEmpresa ?? listEmp[0].id;
                setFormData(p => ({ ...p, idEmpresa: firstId }));
            }
            const resCat = await fetch(`${import.meta.env.VITE_API_URL}/api/Categoria/categorias`, {
                headers,
                signal: abortControllerRef.current.signal
            });
            const dataCat = await resCat.json();
            const listCat = Array.isArray(dataCat) ? dataCat : (dataCat?.$values || []);
            setCategorias(listCat);
            if (listCat.length > 0 && formData.idCategoria === '') {
                const firstCatId = listCat[0].idCategoria ?? listCat[0].id;
                setFormData(p => ({ ...p, idCategoria: firstCatId }));
            }
            const resTemp = await fetch(`${import.meta.env.VITE_API_URL}/api/Svg/obtenerTemplates`, {
                headers,
                signal: abortControllerRef.current.signal
            });
            const dataTemp = await resTemp.json();
            const listTemp = Array.isArray(dataTemp) ? dataTemp : (dataTemp?.$values || []);
            setTemplates(listTemp);

            const resUni = await fetch(`${import.meta.env.VITE_API_URL}/api/Unidad`, {
                headers,
                signal: abortControllerRef.current.signal
            });
            const dataUni = await resUni.json();
            const listUni = Array.isArray(dataUni) ? dataUni : (dataUni?.$values || []);
            setUnidades(listUni);

        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Fetch Data Error:", e);
        } finally {
            setLoading(false);
        }
    }, [formData.idEmpresa, formData.idCategoria]);
    useEffect(() => {
        fetchData();
        return () => abortControllerRef.current?.abort();
    }, [fetchData]);
    const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "CREATE_NEW_ENTITY") {
            localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(formData));
            navigate('/institucion');
            return;
        }
        setFormData(prev => ({ ...prev, idEmpresa: value }));
    };

    const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "CREATE_NEW_ENTITY") {
            localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(formData));
            navigate('/Categorias');
            return;
        }
        setFormData(p => ({ ...p, idCategoria: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUnidadesModalOpen(true);
    };

    const finalSubmitToLienzo = () => {
        const payload = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            detallesDescripcion: formData.detallesDescripcion,
            fechaVencimiento: formData.fechaVencimiento,
            idEmpresa: Number(formData.idEmpresa),
            idCategoria: Number(formData.idCategoria),
            idsUnidades: formData.idsUnidades
        };

        localStorage.setItem('temp_acuerdo', JSON.stringify(payload));

        if (formData.templateSvg) {
            localStorage.setItem('template_svg', formData.templateSvg);
        } else {
            localStorage.removeItem('template_svg');
        }

        const modoLienzo = { tipo: 1, nombre: "Modo creacion" };
        localStorage.setItem('modo', JSON.stringify(modoLienzo));
        localStorage.removeItem(FORM_DRAFT_KEY);

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
                    <div className="hidden md:flex w-72 bg-[#002855] p-10 flex-col justify-start border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <Settings2 size={24} />
                        </div>
                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-4">
                            Nuevo <br /> <span className="text-blue-400"> Acuerdo</span>
                        </h2>
                        <div className="w-8 h-1 bg-blue-500 mb-6" />
                        <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Complete la informacion para generar un nuevo acuerdo en sistema. Una vez termine haga click en la flecha para pasar al editor svg
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col bg-white border-y border-r border-white/10 overflow-hidden relative">
                        <div className="flex-1 p-10 md:p-14 overflow-y-auto custom-list-scroll text-slate-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}>Título</label>
                                    <input
                                        value={formData.titulo}
                                        onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))}
                                        className={INPUT_STYLE}
                                        placeholder="Titulo del acuerdo"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={LABEL_STYLE}><Building2 size={12} /> Empresas</label>
                                    <select
                                        value={formData.idEmpresa}
                                        onChange={handleEmpresaChange}
                                        className={`${INPUT_STYLE} cursor-pointer`}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="" disabled>
                                            {loading ? 'Cargando empresas' : 'Seleccione una empresa'}
                                        </option>
                                        {empresas.map(e => (
                                            <option key={`emp-${e.idEmpresa ?? e.id}`} value={e.idEmpresa ?? e.id}>
                                                {e.nombre}
                                            </option>
                                        ))}
                                        <option value="CREATE_NEW_ENTITY" className="font-bold text-blue-600 bg-blue-50">
                                            Nueva empresa
                                        </option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className={LABEL_STYLE}><Calendar size={12} /> Fecha de vencimiento</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.fechaVencimiento}
                                        onChange={e => setFormData(p => ({ ...p, fechaVencimiento: e.target.value }))}
                                        className={INPUT_STYLE}
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={LABEL_STYLE}><Layout size={12} /> Categoría</label>
                                    <select
                                        value={formData.idCategoria}
                                        onChange={handleCategoriaChange}
                                        className={`${INPUT_STYLE} cursor-pointer`}
                                        required
                                    >
                                        {categorias.length > 0 ? (
                                            categorias.map(c => (
                                                <option key={`cat-${c.idCategoria ?? c.id}`} value={c.idCategoria ?? c.id}>
                                                    {c.tipoCategoria}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">Sin Categorías</option>
                                        )}
                                        <option value="CREATE_NEW_ENTITY" className="font-bold text-blue-600 bg-blue-50">
                                            Nueva categoria
                                        </option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className={LABEL_STYLE}><Layout size={12} /> Plantilla de Diseño</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full flex items-center justify-between bg-slate-100 border-b border-slate-200 px-4 py-1 hover:bg-slate-200 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white border border-slate-300 rounded overflow-hidden flex items-center justify-center">
                                                {formData.templateSvg ? (
                                                    <div className="w-full h-full scale-75" dangerouslySetInnerHTML={{ __html: formData.templateSvg }} />
                                                ) : (
                                                    <Layout size={18} className="text-slate-400" />
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">
                                                {formData.templateSvg ? "Plantilla Seleccionada" : "Lienzo en blanco"}
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}><FileText size={12} /> Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))}
                                        className={`${INPUT_STYLE} h-24 resize-none`}
                                        placeholder="Descripcíon breve del acuerdo"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}><Info size={12} /> Detalles</label>
                                    <textarea
                                        value={formData.detallesDescripcion}
                                        onChange={e => setFormData(p => ({ ...p, detallesDescripcion: e.target.value }))}
                                        className={`${INPUT_STYLE} h-40 resize-none text-xs`}
                                        placeholder="Información detallada del acuerdo"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 right-10">
                            <button
                                type="submit"
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all duration-300 group disabled:bg-slate-300 disabled:scale-100"
                                disabled={loading || !formData.idEmpresa || !formData.idCategoria}
                            >
                                <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#002855]/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-6xl bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div>
                                    <h3 className="text-xl font-black text-[#002855] uppercase tracking-tighter">Catálogo de Plantillas</h3>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-list-scroll">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                    <div
                                        onClick={() => { setFormData(p => ({ ...p, templateSvg: '' })); setIsModalOpen(false); }}
                                        className={`group cursor-pointer border-2 rounded-lg p-6 h-80 flex flex-col items-center justify-center transition-all ${formData.templateSvg === '' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-blue-300'}`}
                                    >
                                        <span className="mt-4 text-sm font-black uppercase text-slate-600">Lienzo en Blanco</span>
                                    </div>

                                    {templates.map(t => (
                                        <div
                                            key={`modal-temp-${t.id}`}
                                            onClick={() => { setFormData(p => ({ ...p, templateSvg: t.svgOriginal })); setIsModalOpen(false); }}
                                            className={`group cursor-pointer border-2 rounded-lg h-80 overflow-hidden transition-all flex flex-col bg-white ${formData.templateSvg === t.svgOriginal ? 'border-blue-600 ring-4 ring-blue-600/10' : 'border-slate-100 hover:border-blue-300 shadow-sm'}`}
                                        >
                                            <div className="flex-1 flex items-center justify-center bg-white pointer-events-none overflow-hidden relative p-1">
                                                <div className="w-full h-full transform scale-90 origin-center transition-transform group-hover:scale-100" dangerouslySetInnerHTML={{ __html: t.svgOriginal }} />
                                                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                                            </div>
                                            <div className={`p-4 text-xs font-black text-center uppercase tracking-widest ${formData.templateSvg === t.svgOriginal ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 border-t border-slate-100'}`}>
                                                Plantilla {t.id}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isUnidadesModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsUnidadesModalOpen(false)}
                            className="absolute inset-0 bg-[#001a35]/95 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="relative w-full max-w-4xl bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
                        >
                            {/* CABECERA CON TÍTULO EMAIL (BLANCO) DE UNIDADES (AZUL) */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#002855]">
                                <h3 className="text-xl font-black uppercase tracking-tighter">
                                    <span className="text-white">Email</span> <span className="text-blue-400">de unidades</span>
                                </h3>
                                <button onClick={() => setIsUnidadesModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-list-scroll relative flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                    {/* OPCIÓN INTEGRADA: NO AÑADIR UNIDADES */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, idsUnidades: [] }))}
                                        className={`flex items-center justify-between p-3 border rounded-sm transition-all ${(formData.idsUnidades || []).length === 0
                                                ? 'border-emerald-500 bg-emerald-50 shadow-inner'
                                                : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 text-slate-900 min-w-0">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${(formData.idsUnidades || []).length === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                <Info size={14} />
                                            </div>
                                            <span className="text-[11px] font-black uppercase truncate">Sin destinatarios</span>
                                        </div>
                                        {(formData.idsUnidades || []).length === 0 && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                                    </button>

                                    {/* LISTADO DE UNIDADES API */}
                                    {unidades.map(u => {
                                        const id = u.idUnidad ?? u.id;
                                        const isSelected = (formData.idsUnidades || []).includes(id);
                                        return (
                                            <button
                                                key={`uni-${id}`}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(p => ({
                                                        ...p,
                                                        idsUnidades: isSelected
                                                            ? (p.idsUnidades || []).filter(item => item !== id)
                                                            : [...(p.idsUnidades || []), id]
                                                    }));
                                                }}
                                                className={`flex items-center justify-between p-3 border rounded-sm transition-all ${isSelected ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 text-slate-900 min-w-0">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                        <Building2 size={14} />
                                                    </div>
                                                    <span className="text-[11px] font-bold uppercase truncate">{u.nombre}</span>
                                                </div>
                                                {isSelected && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* BOTÓN FLOTANTE ORIGINAL (FLECHA) */}
                            <div className="absolute bottom-6 right-6 z-50 flex flex-col items-center gap-2">
                                <span className="text-[9px] font-black text-[#002855] uppercase tracking-widest opacity-40">Continuar</span>
                                <button
                                    onClick={finalSubmitToLienzo}
                                    className="h-14 w-14 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-[0_10px_30px_rgba(0,40,85,0.3)] transition-all active:scale-95"
                                >
                                    <ArrowRight size={24} strokeWidth={3} />
                                </button>
                            </div>

                            {/* Espaciador inferior para que el grid no quede debajo del botón flotante */}
                            <div className="h-20 bg-transparent pointer-events-none" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}