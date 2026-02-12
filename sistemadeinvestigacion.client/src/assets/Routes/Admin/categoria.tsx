import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Tags,
    X,
    Save,
    Loader2,
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';
const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-150 font-semibold text-sm placeholder:text-slate-400/60 placeholder:italic placeholder:font-normal";
const FAST_TRANSITION = { type: "spring", stiffness: 400, damping: 30 };
const mapCategoriaFromApi = (x: any) => ({
    id: x?.idCategoria ?? x?.id,
    nombre: x?.tipoCategoria ?? x?.detalleCategoria ?? '',
    idEstado: x?.idEstado ?? 1,
    habilitado: x?.idEstado === 1,
});
export default function CategoriaList() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search] = useState("");
    const [selectedCat, setSelectedCat] = useState<any | null>(null);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creating, setCreating] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const fetchCategorias = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Categoria/lista`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                signal: abortControllerRef.current.signal
            });
            const data = await res.json();
            let arr = Array.isArray(data) ? data : (data?.items || data?.$values || []);
            setItems(arr.map(mapCategoriaFromApi).filter((x: any) => x?.id != null));
        } catch (err: any) {
            if (err.name !== 'AbortError') console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim() || creating) return;
        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('DetalleCategoria', newCategoryName.trim());

            const res = await fetch(`${API_BASE}/api/Categoria/crear`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: fd
            });
            if (res.ok) {
                setNewCategoryName("");
                fetchCategorias();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };
    const handleToggleEstado = useCallback(async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, habilitado: !item.habilitado, idEstado: item.idEstado === 1 ? 2 : 1 } : item
        ));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Categoria/alternar/${id}`, {
                method: 'PATCH',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            fetchCategorias();
        }
    }, [fetchCategorias]);
    const handleSelectCategoria = async (id: number) => {
        setFetchingDetail(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Categoria/categoria/${id}`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setSelectedCat(mapCategoriaFromApi(data));
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingDetail(false);
        }
    };
    useEffect(() => { fetchCategorias(); }, [fetchCategorias]);
    const filteredItems = useMemo(() => {
        const q = search.toLowerCase();
        return items.filter(it => it.nombre.toLowerCase().includes(q));
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
                    className="w-full max-w-6xl h-[85vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm bg-[#002855]"
                >
                    <div className="hidden md:flex w-80 bg-[#002855] p-10 flex-col border-y border-l border-white/10 shrink-0">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10">
                            <Tags className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">Gestión de <br /> <span className="text-blue-400">Categorías</span></h2>
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{filteredItems.length} Registros</p>

                        
                    </div>
                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative border-y border-r border-white/10">
                        <div className="p-6 bg-slate-50 border-b border-slate-100">
                            <form onSubmit={handleCreate} className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <label className={LABEL_STYLE}> Ingresar nueva categoría</label>
                                    <input
                                        type="text"
                                        className={INPUT_STYLE}
                                        placeholder="Escriba el nombre de la nueva categoria"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newCategoryName.trim() || creating}
                                    className="w-12 h-12 mt-6 shrink-0 bg-[#002855] text-white rounded-full hover:bg-blue-600 transition-all flex items-center justify-center shadow-lg disabled:bg-slate-300 active:scale-95"
                                >
                                    {creating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                </button>
                            </form>
                        </div>
                        {fetchingDetail && (
                            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <Loader2 className="animate-spin text-[#002855]" size={32} />
                            </div>
                        )}
                        <div className="flex-1 bg-slate-50/50 relative">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Sincronizando...</span>
                                </div>
                            ) : (
                                <Virtuoso
                                    style={{ height: '100%' }}
                                    data={filteredItems}
                                    itemContent={(_, cat) => (
                                        <div className="p-3 px-8">
                                            <div onClick={() => handleSelectCategoria(cat.id)}>
                                                <CategoriaItem cat={cat} onToggle={(e) => handleToggleEstado(e, cat.id)} />
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
                {selectedCat && (
                    <EditCategoriaModal
                        cat={selectedCat}
                        onClose={() => setSelectedCat(null)}
                        onUpdate={fetchCategorias}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const CategoriaItem = memo(({ cat, onToggle }: { cat: any, onToggle: (e: React.MouseEvent) => void }) => (
    <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        className={`group bg-white border p-6 flex items-center justify-between hover:shadow-xl transition-all duration-150 relative overflow-hidden cursor-pointer ${!cat.habilitado ? 'grayscale border-slate-200 opacity-80' : 'border-slate-200'}`}
    >
        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-transform duration-150 origin-top ${cat.habilitado ? 'bg-blue-600' : 'bg-slate-400'} scale-y-0 group-hover:scale-y-100`} />
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">ID #{cat.id}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${cat.habilitado ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>{cat.habilitado ? 'Activo' : 'Inactivo'}</span>
            </div>
            <h3 className={`text-lg font-black uppercase tracking-tighter transition-colors ${cat.habilitado ? 'text-[#002855] group-hover:text-blue-600' : 'text-slate-500'}`}>{cat.nombre}</h3>
        </div>
        <button
            onClick={(e) => { e.stopPropagation(); onToggle(e); }}
            className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${cat.habilitado ? "bg-blue-600 text-white border-blue-600 hover:bg-[#001d3d]" : "bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300"}`}
        >
            {cat.habilitado ? "Desactivar" : "Activar"}
        </button>
    </motion.div>
));
const EditCategoriaModal = ({ cat, onClose, onUpdate }: { cat: any, onClose: () => void, onUpdate: () => void }) => {
    const [nombre, setNombre] = useState("");
    const [saving, setSaving] = useState(false);
    const handleSave = async () => {
        const valorAEnviar = nombre.trim() || cat.nombre;
        if (saving) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Categoria/modificar/${cat.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ detalleCategoria: valorAEnviar })
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002855]/95 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={FAST_TRANSITION}
                className="bg-[#002855] w-full max-w-4xl h-auto max-h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-white/10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[60] p-2 text-slate-400 hover:text-[#002855] hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="w-full md:w-72 bg-[#002855] p-10 text-white flex flex-col shrink-0 relative z-10">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-6 shadow-lg border border-white/10 rounded-sm">
                        <Tags size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
                        Modificar <br />
                        <span className="text-blue-400">Categoría</span>
                    </h2>
                    <div className="w-10 h-1 bg-blue-500 my-6" />
                    <p className="text-[10px] text-blue-200/50 uppercase font-black tracking-[0.2em]">ID: {cat.id}</p>
                </div>
                <div className="flex-1 p-10 md:p-14 bg-white relative z-20 rounded-r-sm md:rounded-l-none">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Nombre de la categoría
                            </h3>
                        </div>

                        <div>
                            <input
                                className={INPUT_STYLE}
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder={cat.nombre}
                                autoFocus
                            />
                        </div>
                        <div className="pt-4 flex justify-end items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-[#002855] uppercase tracking-widest opacity-40">
                                    {saving ? 'Guardando' : 'Guardar'}
                                </span>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-xl transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {saving ? <Loader2 size={28} className="animate-spin" /> : <Save size={28} />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};