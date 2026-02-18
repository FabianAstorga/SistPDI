import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Building,
    Globe,
    Phone,
    Mail,
    MapPin,
    Image as ImageIcon,
    Search,
    X,
    Save,
    FileText,
    Loader2,
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';

const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "/i_region_cuartel_investigaciones_arica.png";

const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-150 font-semibold text-sm placeholder:text-slate-400/60 placeholder:italic placeholder:font-normal";

const FAST_TRANSITION = { type: "spring", stiffness: 400, damping: 30 };

const mapInstitucionFromApi = (x: any) => ({
    id: x?.idEmpresa ?? x?.id ?? x?.empresaID ?? x?.ID,
    nombre: x?.nombre ?? '',
    descripcion: x?.descripcion ?? '',
    sitioWeb: x?.sitioWeb ?? '',
    email: x?.email ?? '',
    telefono: x?.telefono ?? '',
    direccion: x?.direccion ?? '',
    idEstado: x?.idEstado ?? 1,
    habilitado: x?.idEstado === 1,
    logoUrl: x?.logo
        ? String(x.logo).startsWith('http')
            ? String(x.logo)
            : `${API_BASE}/${String(x.logo).replace(/^\//, '')}`
        : null,
});

export default function InstitucionList() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedInst, setSelectedInst] = useState<any | null>(null);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            abortControllerRef.current?.abort();
        };
    }, []);

    const fetchInstituciones = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Empresa/listado`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                signal: abortControllerRef.current.signal
            });
            const data = await res.json();
            let arr = Array.isArray(data) ? data : (data?.items || data?.$values || []);
            setItems(arr.map(mapInstitucionFromApi).filter((x: any) => x?.id != null));
        } catch (err: any) {
            if (err.name !== 'AbortError') console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleToggleEstado = useCallback(async (e: React.MouseEvent, idEmpresa: number | string) => {
        e.stopPropagation();
        setItems(prev => prev.map(item =>
            item.id === idEmpresa ? { ...item, habilitado: !item.habilitado, idEstado: item.idEstado === 1 ? 2 : 1 } : item
        ));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Empresa/alternar/${idEmpresa}`, {
                method: 'PATCH',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            fetchInstituciones(); 
        }
    }, [fetchInstituciones]);

    const handleSelectInstitucion = async (idEmpresa: number | string) => {
        setFetchingDetail(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Empresa/${idEmpresa}`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setSelectedInst(mapInstitucionFromApi(data));
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingDetail(false);
        }
    };

    useEffect(() => { fetchInstituciones(); }, [fetchInstituciones]);

    const filteredItems = useMemo(() => {
        const q = search.toLowerCase();
        return items.filter(it =>
            it.nombre.toLowerCase().includes(q) ||
            it.descripcion.toLowerCase().includes(q)
        );
    }, [items, search]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${HERO_BG})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#002855] via-transparent to-[#002855]" />
            </div>

            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-7xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm bg-[#002855]"
                >
                    <div className="hidden md:flex w-80 bg-[#002855] p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <Building className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">Catálogo de <br /> <span className="text-blue-400">Empresas</span></h2>
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{filteredItems.length} Entidades registradas</p>
                        <div className="space-y-6">
                            <label className={LABEL_STYLE}><Search size={12} /> Filtro Rápido</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nombre o descripción..."
                                className="w-full bg-white/5 border-b border-white/10 text-white px-4 py-3 outline-none focus:border-blue-400 transition-colors duration-150 text-sm placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative border-y border-r border-white/10">
                        {fetchingDetail && (
                            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <Loader2 className="animate-spin text-[#002855]" size={32} />
                            </div>
                        )}
                        <div className="flex-1 bg-slate-50/50 relative">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Cargando...</span>
                                </div>
                            ) : (
                                <Virtuoso
                                    style={{ height: '100%' }}
                                    data={filteredItems}
                                    overscan={800} 
                                    increaseViewportBy={400}
                                    itemContent={(_, inst) => (
                                        <div className="p-4 px-8">
                                            <div onClick={() => handleSelectInstitucion(inst.id)}>
                                                <InstitucionItem inst={inst} onToggle={(e) => handleToggleEstado(e, inst.id)} />
                                            </div>
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
            <AnimatePresence>
                {selectedInst && <EditInstitucionModal inst={selectedInst} onClose={() => setSelectedInst(null)} onUpdate={fetchInstituciones} />}
            </AnimatePresence>
        </div>
    );
}

const InstitucionItem = memo(({ inst, onToggle }: { inst: any, onToggle: (e: React.MouseEvent) => void }) => (
    <motion.div
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.995 }}
        transition={FAST_TRANSITION}
        className={`group bg-white border p-8 flex flex-col gap-4 hover:shadow-xl transition-all duration-150 relative overflow-hidden will-change-transform ${!inst.habilitado ? 'grayscale border-slate-200 opacity-80' : 'border-slate-200'}`}
    >
        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-transform duration-150 origin-top ${inst.habilitado ? 'bg-blue-600' : 'bg-slate-400'} scale-y-0 group-hover:scale-y-100`} />
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-xl font-black uppercase tracking-tighter truncate transition-colors duration-150 ${inst.habilitado ? 'text-[#002855] group-hover:text-blue-600' : 'text-slate-500'}`}>{inst.nombre}</h3>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${inst.habilitado ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>{inst.habilitado ? 'Activo' : 'Inactivo'}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium line-clamp-2 italic h-8">{inst.descripcion || 'Sin descripción.'}</p>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(e); }}
                    className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-150 border ${inst.habilitado ? "bg-blue-600 text-white border-blue-600 hover:bg-[#001d3d]" : "bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300"}`}
                >
                    {inst.habilitado ? "Desactivar" : "Activar"}
                </button>
            </div>
            <div className="w-20 h-20 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:border-blue-200 transition-colors duration-150">
                {inst.logoUrl ? <img src={inst.logoUrl} className="w-full h-full object-contain p-2" alt="" /> : <ImageIcon size={24} className="text-slate-300" />}
            </div>
        </div>
    </motion.div>
));

const EditInstitucionModal = ({ inst, onClose, onUpdate }: { inst: any, onClose: () => void, onUpdate: () => void }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        sitioWeb: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(inst.logoUrl);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canSubmit = useMemo(() => {
        return Object.values(formData).some(val => val.trim() !== '') || logoFile !== null;
    }, [formData, logoFile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            const getValidValue = (val: string) => (val.trim() === '' ? null : val);

            if (getValidValue(formData.nombre)) params.append('nombre', formData.nombre);
            if (getValidValue(formData.descripcion)) params.append('descripcion', formData.descripcion);
            if (getValidValue(formData.sitioWeb)) params.append('sitioWeb', formData.sitioWeb);
            if (getValidValue(formData.email)) params.append('email', formData.email);
            if (getValidValue(formData.direccion)) params.append('direccion', formData.direccion);

            if (getValidValue(formData.telefono)) {
                const telInt = parseInt(formData.telefono, 10);
                params.append('telefono', isNaN(telInt) ? "0" : String(telInt));
            }

            const fd = new FormData();
            if (logoFile) fd.append('logo', logoFile);

            const queryString = params.toString();
            const finalUrl = `${API_BASE}/api/Empresa/editar/${inst.id}${queryString ? `?${queryString}` : ''}`;

            const res = await fetch(finalUrl, {
                method: 'PATCH',
                headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                body: fd
            });

            if (res.ok) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002855]/95 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={FAST_TRANSITION}
                className="bg-[#002855] w-full max-w-5xl h-auto max-h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-white/5"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[60] p-2 text-slate-400 hover:text-[#002855] hover:bg-slate-100 rounded-full transition-colors duration-150"
                >
                    <X size={24} />
                </button>

                <div className="w-full md:w-72 bg-[#002855] p-10 text-white flex flex-col shrink-0 relative z-10">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-6 shadow-lg border border-white/10 rounded-sm">
                        <Building size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
                        Modificar <br />
                        <span className="text-blue-400">Empresa</span>
                    </h2>
                    <div className="w-10 h-1 bg-blue-500 my-6" />
                    <p className="text-[10px] text-blue-200/50 uppercase font-black tracking-[0.2em]">ID: {inst.id}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-white relative z-20 rounded-r-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Datos Maestros
                            </h3>
                            <div>
                                <label className={LABEL_STYLE}>Nombre Institucional</label>
                                <input name="nombre" className={INPUT_STYLE} value={formData.nombre} onChange={handleInputChange} placeholder={inst.nombre} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL_STYLE}><Mail size={12} /> Email</label>
                                    <input name="email" type="email" className={INPUT_STYLE} value={formData.email} onChange={handleInputChange} placeholder={inst.email} />
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}><Phone size={12} /> Teléfono</label>
                                    <input name="telefono" type="number" className={INPUT_STYLE} value={formData.telefono} onChange={handleInputChange} placeholder={inst.telefono} />
                                </div>
                            </div>
                            <div>
                                <label className={LABEL_STYLE}><MapPin size={12} /> Dirección</label>
                                <input name="direccion" className={INPUT_STYLE} value={formData.direccion} onChange={handleInputChange} placeholder={inst.direccion} />
                            </div>
                            <div>
                                <label className={LABEL_STYLE}><FileText size={12} /> Descripción</label>
                                <textarea name="descripcion" className={`${INPUT_STYLE} h-28 resize-none`} value={formData.descripcion} onChange={handleInputChange} placeholder={inst.descripcion} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Archivo Corporativo
                            </h3>
                            <div>
                                <label className={LABEL_STYLE}><Globe size={12} /> Sitio Web</label>
                                <input name="sitioWeb" className={INPUT_STYLE} value={formData.sitioWeb} onChange={handleInputChange} placeholder={inst.sitioWeb} />
                            </div>
                            <div>
                                <label className={LABEL_STYLE}><ImageIcon size={12} /> Logotipo</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-all duration-150 group relative"
                                >
                                    {logoPreview ? (
                                        <>
                                            <img src={logoPreview} className="h-full w-full object-contain p-4" alt="Preview" />
                                            <div className="absolute inset-0 bg-[#002855]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150">
                                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Cambiar Logotipo</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="text-slate-300 mx-auto mb-2" size={32} />
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">Cargar Imagen</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 right-0 flex justify-end mt-10 pointer-events-none pb-2">
                        <button
                            onClick={handleSave}
                            disabled={!canSubmit || saving}
                            className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-[0_10px_30px_rgba(0,40,85,0.3)] transition-all duration-150 pointer-events-auto disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                        >
                            {saving ? <Loader2 size={28} className="animate-spin" /> : <Save size={28} />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};