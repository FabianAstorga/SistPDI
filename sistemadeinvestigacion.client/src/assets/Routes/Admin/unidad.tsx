import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion } from "framer-motion";
import {
    Boxes,
    Save,
    Loader2,
    Trash2
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';
const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-150 font-semibold text-sm placeholder:text-slate-400/60 placeholder:italic placeholder:font-normal";
const mapUnidadFromApi = (x: any) => ({
    id: x?.idUnidad ?? x?.id,
    nombre: x?.nombre ?? '',
});

export default function UnidadList() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search] = useState("");
    const [newUnidadName, setNewUnidadName] = useState("");
    const [creating, setCreating] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchUnidades = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Unidad`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                signal: abortControllerRef.current.signal
            });
            const data = await res.json();
            let arr = Array.isArray(data) ? data : (data?.items || data?.$values || []);
            setItems(arr.map(mapUnidadFromApi).filter((x: any) => x?.id != null));
        } catch (err: any) {
            if (err.name !== 'AbortError') console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUnidadName.trim() || creating) return;
        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('Nombre', newUnidadName.trim());

            const res = await fetch(`${API_BASE}/api/Unidad`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: fd
            });
            if (res.ok) {
                setNewUnidadName("");
                fetchUnidades();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = useCallback(async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();

        const backupItems = [...items];
        setItems(prev => prev.filter(item => item.id !== id));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/Unidad/borrar/${id}`, {
                method: 'DELETE',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });

            if (!res.ok) {
                alert("No se puede borrar, la unidad pertenece a un funcionario");
                throw new Error("Error de integridad");
            }
        } catch (err) {
            setItems(backupItems);
            fetchUnidades();
        }
    }, [fetchUnidades, items]);

    useEffect(() => { fetchUnidades(); }, [fetchUnidades]);

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
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10 rounded-sm">
                            <Boxes className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2">Gestión de <br /> <span className="text-blue-400">Unidades</span></h2>
                        
                    </div>

                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative border-y border-r border-white/10">
                        <div className="p-6 bg-slate-50 border-b border-slate-100">
                            <form onSubmit={handleCreate} className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <label className={LABEL_STYLE}>Nueva Unidad</label>
                                    <input
                                        type="text"
                                        className={INPUT_STYLE}
                                        placeholder="Nombre de la unidad a agregar"
                                        value={newUnidadName}
                                        onChange={(e) => setNewUnidadName(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newUnidadName.trim() || creating}
                                    className="w-12 h-12 mt-6 shrink-0 bg-[#002855] text-white rounded-full hover:bg-blue-600 transition-all flex items-center justify-center shadow-lg disabled:bg-slate-300"
                                >
                                    {creating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 bg-slate-50/50 relative">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Cargando...</span>
                                </div>
                            ) : (
                                <Virtuoso
                                    style={{ height: '100%' }}
                                    data={filteredItems}
                                    itemContent={(_, unidad) => (
                                        <div className="p-3 px-8">
                                            <UnidadItem unidad={unidad} onDelete={(e) => handleDelete(e, unidad.id)} />
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

const UnidadItem = memo(({ unidad, onDelete }: { unidad: any, onDelete: (e: React.MouseEvent) => void }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="group bg-white border border-slate-200 p-6 flex items-center justify-between hover:shadow-xl transition-all duration-150 relative overflow-hidden"
    >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 transition-transform duration-150 origin-top scale-y-0 group-hover:scale-y-100" />
        <div className="flex-1">
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 block">ID {unidad.id}</span>
            <h3 className="text-lg font-black uppercase tracking-tighter text-[#002855] group-hover:text-blue-600 transition-colors">{unidad.nombre}</h3>
        </div>
        <button
            onClick={onDelete}
            className="p-3 rounded-full text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
        >
            <Trash2 size={20} />
        </button>
    </motion.div>
));