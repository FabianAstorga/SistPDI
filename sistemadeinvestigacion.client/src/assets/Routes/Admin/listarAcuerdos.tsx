//Aqui se maneja la lista de los acuerdos para su edicion
//Todos los acuerods pueden desactivarse/activarse y como estan ligados al socket, se vera reflejado de forma automatica en el panel
//Aqui podemos realizar tanto cambios directos a los metadatos como a la edicion de la imange, si se escoge lo segundo,
//los metadatos se guardaran en localstorage y se navegara a la ruta del lienzo
import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    LayoutGrid,
    Calendar,
    Building2,
    X,
    Settings,
    Save,
    Info,
    FileText,
    Loader2,
    ArrowRight,
    Layout 
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useSignalR } from '../../../context/SignalRContext';

const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "/i_region_cuartel_investigaciones_arica.png";
const PLACEHOLDER_IMG = "/elementor-placeholder-image.png";

const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-4 outline-none focus:border-[#002855] focus:bg-white transition-all duration-150 font-semibold text-sm";

const FAST_SPRING = { type: "spring", stiffness: 500, damping: 35 };

const resolveBackendUrl = (path?: string | null) => {
    if (!path) return null;
    const s = String(path).trim();
    if (!s || /^https?:\/\//i.test(s)) return s || null;
    return `${API_BASE}${s.startsWith('/') ? s : `/${s}`}`;
};

export default function ListarAcuerdos() {
    const [items, setItems] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const { connection } = useSignalR();

    const sortAcuerdos = (arr: any[]) => {
        return [...arr].sort((a, b) => {
            if (a.idEstado !== b.idEstado) return a.idEstado - b.idEstado;
            return b.id - a.id;
        });
    };

    const fetchAcuerdos = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        setLoading(true);

        const token = localStorage.getItem('token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        try {
            const [resAcuerdos, resEmpresas] = await Promise.all([
                fetch(`${API_BASE}/api/Acuerdos/listado`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Empresa/listado`, { headers, signal: abortControllerRef.current.signal })
            ]);

            const dataA = await resAcuerdos.json();
            const dataE = await resEmpresas.json();
            const rawArr = Array.isArray(dataA) ? dataA : (dataA?.items || dataA?.$values || []);

            const mapped = rawArr.map((a: any) => ({
                ...a,
                id: a.idAcuerdo,
                habilitado: a.idEstado === 1
            }));

            setItems(sortAcuerdos(mapped));
            setEmpresas(Array.isArray(dataE) ? dataE : (dataE?.items || dataE?.$values || []));
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Error fetchData:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAcuerdos();
        return () => abortControllerRef.current?.abort();
    }, [fetchAcuerdos]);

    const handleToggleEstado = useCallback(async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');

        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, habilitado: !item.habilitado, idEstado: item.idEstado === 1 ? 2 : 1 }
                : item
        ));

        try {
            await fetch(`${API_BASE}/api/Acuerdos/alternar/${id}`, {
                method: 'PATCH',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
        } catch (err) {
            fetchAcuerdos();
        }
    }, [fetchAcuerdos]);

    useEffect(() => {
        if (connection) {
            const handleUpdate = () => fetchAcuerdos();
            connection.on("RecibirActualizacionAcuerdos", handleUpdate);
            return () => { connection.off("RecibirActualizacionAcuerdos", handleUpdate); };
        }
    }, [connection, fetchAcuerdos]);

    const filteredItems = useMemo(() => {
        const query = search.toLowerCase();
        return items.filter(a =>
            a.titulo?.toLowerCase().includes(query) ||
            a.categoria?.toLowerCase().includes(query)
        );
    }, [items, search]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${HERO_BG})` }} />
            </div>

            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-7xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm bg-[#002855]"
                >
                    <div className="hidden md:flex w-80 bg-[#002855] p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <LayoutGrid className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2 text-white">Lista de <br /><span className="text-blue-400">Acuerdos</span></h2>
                        <div className="space-y-6">
                            <label className={LABEL_STYLE}><Search size={12} /> Filtro Rápido</label>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Nombre o categoría..."
                                className="w-full bg-white/5 border-b border-white/10 text-white px-4 py-3 outline-none focus:border-blue-400 transition-colors duration-150 text-sm placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative border-y border-r border-white/10">
                        <div className="flex-1 bg-slate-50/50 relative">
                            {loading && items.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Sincronizando...</span>
                                </div>
                            ) : (
                                <Virtuoso
                                    style={{ height: '100%' }}
                                    data={filteredItems}
                                    overscan={800}
                                    itemContent={(_, inst) => (
                                        <div className="p-4 px-8">
                                            <AcuerdoItem
                                                acuerdo={inst}
                                                onOpen={() => setSelectedId(inst.id)}
                                                onToggle={(e) => handleToggleEstado(e, inst.id)}
                                            />
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>

            <AnimatePresence>
                {selectedId && (
                    <ModalConfiguracion
                        id={selectedId}
                        empresas={empresas}
                        onClose={() => setSelectedId(null)}
                        onSuccess={() => { setSelectedId(null); fetchAcuerdos(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const AcuerdoItem = memo(({ acuerdo, onOpen, onToggle }: {
    acuerdo: any,
    onOpen: () => void,
    onToggle: (e: React.MouseEvent) => void
}) => {
    const isHabilitado = acuerdo.habilitado !== false;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.995 }}
            transition={FAST_SPRING}
            onClick={onOpen}
            className={`group bg-white border p-6 flex flex-col gap-4 hover:shadow-xl transition-all duration-150 relative overflow-hidden h-64 cursor-pointer will-change-transform
                ${!isHabilitado ? 'grayscale border-slate-200 opacity-80' : 'border-slate-200 shadow-sm'}`}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-transform duration-150 origin-top
                ${isHabilitado ? 'bg-blue-600' : 'bg-slate-400'} 
                scale-y-0 group-hover:scale-y-100`}
            />

            <div className="flex items-start justify-between gap-4 h-full">
                <div className="flex-1 min-w-0 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter 
                            ${isHabilitado ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                            {acuerdo.categoria || 'Convenio'}
                        </span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter 
                            ${isHabilitado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {isHabilitado ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest ml-auto">ID #{acuerdo.id}</span>
                    </div>

                    <h3 className={`text-xl font-black uppercase tracking-tighter truncate leading-tight mb-2 transition-colors duration-150
                        ${isHabilitado ? 'text-[#002855] group-hover:text-blue-600' : 'text-slate-500'}`}>
                        {acuerdo.titulo}
                    </h3>

                    <p className="text-slate-500 text-xs font-medium line-clamp-3 italic mb-4 leading-relaxed">
                        {acuerdo.descripcion || 'Sin descripción disponible.'}
                    </p>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(e);
                        }}
                        className={`mt-auto flex items-center rounded-sm justify-center gap-2 w-fit px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-150 border
                            ${isHabilitado
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-[#001d3d]"
                                : "bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300"
                            }`}
                    >
                        {isHabilitado ? "Desactivar" : "Activar"}
                    </button>
                </div>

                <div className="w-24 h-24 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:border-blue-200 transition-colors duration-150">
                    <img
                        src={resolveBackendUrl(acuerdo.imagenUrl) || PLACEHOLDER_IMG}
                        className="w-full h-full object-contain p-2"
                        alt=""
                    />
                </div>
            </div>
        </motion.div>
    );
});

const ModalConfiguracion = ({ id, empresas, onClose, onSuccess }: { id: number, empresas: any[], onClose: () => void, onSuccess: () => void }) => {
    const [data, setData] = useState<any>(null);
    const [formChanges, setFormChanges] = useState<any>({});
    const [categorias, setCategorias] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDataModal = async () => {
            const token = localStorage.getItem('token');
            const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

            try {
                const [resAcuerdo, resCat] = await Promise.all([
                    fetch(`${API_BASE}/api/Acuerdos/${id}`, { headers }),
                    fetch(`${API_BASE}/api/Categoria/categorias`, { headers })
                ]);

                if (resAcuerdo.ok) {
                    const result = await resAcuerdo.json();
                    setData(result);
                    const info = result.datosAcuerdo;
                    setFormChanges({
                        titulo: info?.titulo || '',
                        descripcion: info?.descripcion || '',
                        detallesDescripcion: info?.detallesDescripcion || '',
                        idEmpresa: info?.idEmpresa || '',
                        idCategoria: info?.idCategoria || '', 
                        fechaVencimiento: info?.fechaVencimiento ? info.fechaVencimiento.slice(0, 16) : ''
                    });
                }

                if (resCat.ok) {
                    const dataCat = await resCat.json();
                    setCategorias(Array.isArray(dataCat) ? dataCat : (dataCat?.$values || []));
                }
            } catch (error) {
                console.error("Error cargando datos del modal:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDataModal();
    }, [id]);

    const handlePatchUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const formData = new FormData();
        const infoOriginal = data?.datosAcuerdo;

        let hasChanges = false;

        const appendIfChanged = (key: string, newValue: any, oldValue: any) => {
            const normalizedNew = String(newValue || '').trim();
            const normalizedOld = String(oldValue || '').trim();

            if (normalizedNew !== normalizedOld) {
                formData.append(key, normalizedNew);
                hasChanges = true;
            }
        };

        appendIfChanged('titulo', formChanges.titulo, infoOriginal?.titulo);
        appendIfChanged('descripcion', formChanges.descripcion, infoOriginal?.descripcion);
        appendIfChanged('detallesDescripcion', formChanges.detallesDescripcion, infoOriginal?.detallesDescripcion);
        appendIfChanged('idEmpresa', formChanges.idEmpresa, infoOriginal?.idEmpresa);
        appendIfChanged('idCategoria', formChanges.idCategoria, infoOriginal?.idCategoria); 

        if (formChanges.fechaVencimiento) {
            const newDate = new Date(formChanges.fechaVencimiento).toISOString();
            const oldDate = infoOriginal?.fechaVencimiento ? new Date(infoOriginal.fechaVencimiento).toISOString() : '';

            if (newDate !== oldDate) {
                formData.append('fechaVencimiento', newDate);
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            onClose();
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/Acuerdos/editar/${id}`, {
                method: 'PATCH',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: formData
            });

            if (res.ok) {
                onSuccess();
            } else {
                const errData = await res.json();
                console.error("Error en PATCH:", errData);
            }
        } catch (error) {
            console.error("Error de red:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleIrAlEditor = async () => {
        setSaving(true);
        const token = localStorage.getItem('token');

        if (Object.keys(formChanges).length > 0) {
            localStorage.setItem('temp_cambio', JSON.stringify(formChanges));
        } else {
            localStorage.removeItem('temp_cambio');
        }

        try {
            const res = await fetch(`${API_BASE}/api/Svg/svgAcuerdo/${id}`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });

            if (res.ok) {
                const svgData = await res.json();
                localStorage.setItem('template_svg', svgData.svg_editado);
                const modoLienzo = { tipo: 3, id: id, nombre: "Modo Edición" };
                localStorage.setItem('modo', JSON.stringify(modoLienzo));
                navigate('/lienzo');
            } else {
                console.error("Error al obtener el SVG del acuerdo");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[110] bg-[#001a35]/95 flex items-center justify-center">
            <span className="text-white font-black uppercase tracking-[0.5em] text-xs animate-pulse">Consultando estado actual...</span>
        </div>
    );

    const infoOriginal = data?.datosAcuerdo;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002855]/95 backdrop-blur-md p-6"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-6xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-white relative"
            >
                <button onClick={onClose} className="absolute top-6 right-6 z-[60] p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={28} />
                </button>

                <div className="hidden md:flex w-72 bg-[#002855] p-10 flex-col justify-start border-y border-l border-white/10 shrink-0 text-white">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                        <Settings size={24} />
                    </div>
                    <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-4">
                        Modificar <br /> <span className="text-blue-400"> Registro</span>
                    </h2>
                    <div className="w-8 h-1 bg-blue-500 mb-6" />
                    <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Edición parcial activa. Solo los campos con texto serán actualizados en la base de datos de la Intranet.
                    </p>
                </div>

                <form onSubmit={handlePatchUpdate} className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <div className="flex-1 p-10 md:p-14 overflow-y-auto text-slate-900">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                            <div className="md:col-span-2">
                                <label className={LABEL_STYLE}>Nuevo Título (Actual: {infoOriginal?.titulo})</label>
                                <input
                                    type="text"
                                    placeholder={infoOriginal?.titulo}
                                    value={formChanges.titulo || ''}
                                    onChange={e => setFormChanges({ ...formChanges, titulo: e.target.value })}
                                    className={INPUT_STYLE}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className={LABEL_STYLE}><Building2 size={12} /> Cambiar Empresa</label>
                                <select
                                    value={formChanges.idEmpresa || ''}
                                    onChange={e => setFormChanges({ ...formChanges, idEmpresa: e.target.value })}
                                    className={`${INPUT_STYLE} cursor-pointer`}
                                >
                                    <option value="">No cambiar empresa</option>
                                    {empresas.map((e: any) => (
                                        <option key={e.idEmpresa ?? e.id} value={e.idEmpresa ?? e.id}>
                                            {e.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className={LABEL_STYLE}><Layout size={12} /> Cambiar Categoría</label>
                                <select
                                    value={formChanges.idCategoria || ''}
                                    onChange={e => setFormChanges({ ...formChanges, idCategoria: e.target.value })}
                                    className={`${INPUT_STYLE} cursor-pointer`}
                                >
                                    <option value="">No cambiar categoría</option>
                                    {categorias.map((c: any) => (
                                        <option key={c.idCategoria ?? c.id} value={c.idCategoria ?? c.id}>
                                            {c.tipoCategoria}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className={LABEL_STYLE}><Calendar size={12} /> Nueva Fecha de Vencimiento</label>
                                <input
                                    type="datetime-local"
                                    value={formChanges.fechaVencimiento || ''}
                                    onChange={e => setFormChanges({ ...formChanges, fechaVencimiento: e.target.value })}
                                    className={INPUT_STYLE}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={LABEL_STYLE}><FileText size={12} /> Nueva Descripción</label>
                                <textarea
                                    placeholder={infoOriginal?.descripcion}
                                    value={formChanges.descripcion || ''}
                                    onChange={e => setFormChanges({ ...formChanges, descripcion: e.target.value })}
                                    className={`${INPUT_STYLE} h-24 resize-none`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={LABEL_STYLE}><Info size={12} /> Nuevos Detalles</label>
                                <textarea
                                    placeholder={infoOriginal?.detallesDescripcion}
                                    value={formChanges.detallesDescripcion || ''}
                                    onChange={e => setFormChanges({ ...formChanges, detallesDescripcion: e.target.value })}
                                    className={`${INPUT_STYLE} h-40 resize-none text-xs`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex justify-between">
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-green-600 hover:scale-110 shadow-2xl transition-all duration-300 group disabled:bg-slate-300 pointer-events-auto"
                        >
                            {saving ? (
                                <Loader2 size={28} className="animate-spin" />
                            ) : (
                                <Save size={28} className="group-hover:rotate-6 transition-transform" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleIrAlEditor}
                            disabled={saving}
                            className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all duration-300 group disabled:bg-slate-300 pointer-events-auto"
                        >
                            {saving ? (
                                <Loader2 size={28} className="animate-spin" />
                            ) : (
                                <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};