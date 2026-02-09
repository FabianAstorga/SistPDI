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
    FileText
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Navbar } from '../../components/Navbar';
import { useSignalR } from '../../../context/SignalRContext';

/** * LISTAR ACUERDOS V12.0 - PDI Intranet 2026
 * Fix: Implementación de PATCH con FormData (Multipart) + SignalR Real-time
 */

const API_BASE = 'http://localhost:5091';
const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";
const PLACEHOLDER_IMG = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-4 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-semibold text-sm";

const resolveBackendUrl = (path?: string | null) => {
    if (!path) return null;
    const s = String(path).trim();
    if (!s || /^https?:\/\//i.test(s)) return s || null;
    return `${API_BASE}${s.startsWith('/') ? s : `/${s}`}`;
};

export default function ListarAcuerdos() {
    const [acuerdos, setAcuerdos] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // --- INTEGRACIÓN SIGNALR ---
    const { connection } = useSignalR();

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const token = localStorage.getItem('token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        try {
            const [resAcuerdos, resEmpresas] = await Promise.all([
                fetch(`${API_BASE}/api/Acuerdos`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Empresa`, { headers, signal: abortControllerRef.current.signal })
            ]);
            setAcuerdos(await resAcuerdos.json());
            setEmpresas(await resEmpresas.json());
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Error fetchData:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        return () => abortControllerRef.current?.abort();
    }, [fetchData]);

    // --- LISTENER DE SIGNALR ---
    useEffect(() => {
        if (connection) {
            const handleUpdate = () => {
                console.log("⚡ SignalR: Recibida actualización de acuerdos. Recargando...");
                fetchData();
            };

            connection.on("RecibirActualizacionAcuerdos", handleUpdate);

            return () => {
                connection.off("RecibirActualizacionAcuerdos", handleUpdate);
            };
        }
    }, [connection, fetchData]);

    const rows = useMemo(() => {
        const query = search.toLowerCase();
        const filtered = (Array.isArray(acuerdos) ? acuerdos : []).filter(a =>
            a.titulo?.toLowerCase().includes(query) ||
            a.categoria?.toLowerCase().includes(query)
        );
        const result = [];
        for (let i = 0; i < filtered.length; i += 2) {
            result.push(filtered.slice(i, i + 2));
        }
        return result;
    }, [search, acuerdos]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover' }} />

            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-7xl h-[85vh] flex shadow-2xl overflow-hidden rounded-sm bg-[#002855] border border-white/10">
                    <div className="hidden md:flex w-80 p-10 flex-col shrink-0 border-r border-white/10">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8"><LayoutGrid size={24} /></div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">Lista de <br /><span className="text-blue-400">Acuerdos</span></h2>
                        <div className="space-y-4 mt-8">
                            <label className={LABEL_STYLE}><Search size={12} /> Filtro</label>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border-b border-white/10 p-3 outline-none focus:border-blue-400 transition-all text-sm" />
                        </div>
                    </div>

                    <div className="flex-1 bg-white overflow-hidden">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-[#002855] font-black uppercase text-xs">Cargando...</div>
                        ) : (
                            <Virtuoso
                                style={{ height: '100%' }}
                                data={rows}
                                itemContent={(_, pair) => (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-8">
                                        {pair.map((a: any) => (
                                            <AcuerdoItem key={a.idAcuerdo} acuerdo={a} onOpen={() => setSelectedId(a.idAcuerdo)} />
                                        ))}
                                    </div>
                                )}
                            />
                        )}
                    </div>
                </motion.div>
            </main>

            <AnimatePresence>
                {selectedId && (
                    <ModalConfiguracion
                        id={selectedId}
                        empresas={empresas}
                        onClose={() => setSelectedId(null)}
                        onSuccess={() => { setSelectedId(null); fetchData(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const AcuerdoItem = memo(({ acuerdo, onOpen }: { acuerdo: any, onOpen: () => void }) => (
    <div className="group bg-white border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-lg transition-all relative">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black bg-[#002855] text-white px-2 py-0.5 rounded uppercase mb-2 inline-block italic">{acuerdo.categoria || 'PDI'}</span>
                <h3 className="text-lg font-black text-[#002855] uppercase tracking-tighter truncate leading-none mb-2">{acuerdo.titulo}</h3>
                <p className="text-slate-600 text-[11px] line-clamp-2 italic">{acuerdo.descripcion}</p>
            </div>
            <img src={resolveBackendUrl(acuerdo.imagenUrl) || PLACEHOLDER_IMG} className="w-14 h-14 object-contain opacity-80" alt="" />
        </div>
        <button onClick={onOpen} className="mt-auto flex items-center justify-center gap-2 bg-[#002855] text-white py-2.5 text-[10px] font-black uppercase hover:bg-blue-600 transition-all">
            <Settings size={12} /> Gestionar
        </button>
    </div>
));

const ModalConfiguracion = ({ id, empresas, onClose, onSuccess }: { id: number, empresas: any[], onClose: () => void, onSuccess: () => void }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchById = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/api/Acuerdos/${id}`, {
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchById();
    }, [id]);

    const handleUpdate = async () => {
        if (!data) return;
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const url = `${API_BASE}/api/Acuerdos/editar/${id}`;
            const formData = new FormData();

            formData.append('titulo', data.titulo || '');
            formData.append('descripcion', data.descripcion || '');
            formData.append('detallesDescripcion', data.detallesDescripcion || '');
            formData.append('idCategoria', String(data.idCategoria || 1));
            formData.append('svg_editado', data.svg_editado || '');

            if (data.fechaVencimiento) {
                const dateObj = new Date(data.fechaVencimiento);
                const isoDate = dateObj.toISOString();
                formData.append('fechaVencimiento', isoDate);
            }

            const res = await fetch(url, {
                method: 'PATCH',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    'Accept': '*/*'
                },
                body: formData
            });

            if (res.ok) {
                onSuccess();
            } else {
                const errText = await res.text();
                console.error("Detalle del error:", errText);
                alert("Error al actualizar.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[110] bg-[#001a35]/95 flex items-center justify-center">
            <span className="text-white font-black uppercase tracking-[0.5em] text-xs animate-pulse">Abriendo Expediente...</span>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001a35]/95 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-5xl h-[90vh] flex rounded-sm overflow-hidden shadow-2xl">

                <div className="w-72 bg-[#002855] p-10 flex flex-col shrink-0 border-r border-white/10">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg text-white"><Settings size={24} /></div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Editor <br /><span className="text-blue-400">PATCH</span></h2>
                    <div className="mt-auto">
                        {data?.imagenUrl && <img src={resolveBackendUrl(data.imagenUrl)} className="w-full aspect-square object-contain bg-white/5 p-4 mb-4" alt="" />}
                        <p className="text-blue-200/40 text-[9px] font-bold uppercase tracking-widest">REGISTRO #{id}</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    <header className="px-10 py-6 border-b flex justify-between items-center">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Ajuste de Parámetros Multipart</span>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-14 custom-list-scroll">
                        <div className="grid grid-cols-2 gap-8 text-slate-900">
                            <div className="col-span-2">
                                <label className={LABEL_STYLE}>Título del Acuerdo</label>
                                <input type="text" value={data.titulo || ''} onChange={e => setData({ ...data, titulo: e.target.value })} className={INPUT_STYLE} />
                            </div>
                            <div className="space-y-1">
                                <label className={LABEL_STYLE}><Building2 size={12} /> Empresa Asociada</label>
                                <select value={data.idEmpresa || ''} onChange={e => setData({ ...data, idEmpresa: e.target.value })} className={INPUT_STYLE}>
                                    {empresas.map((e: any) => <option key={e.idEmpresa} value={e.idEmpresa}>{e.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className={LABEL_STYLE}><Calendar size={12} /> Vencimiento</label>
                                <input
                                    type="datetime-local"
                                    value={data.fechaVencimiento ? data.fechaVencimiento.slice(0, 16) : ''}
                                    onChange={e => setData({ ...data, fechaVencimiento: e.target.value })}
                                    className={INPUT_STYLE}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className={LABEL_STYLE}><FileText size={12} /> Resumen</label>
                                <textarea rows={3} value={data.descripcion || ''} onChange={e => setData({ ...data, descripcion: e.target.value })} className={`${INPUT_STYLE} h-24 resize-none`} />
                            </div>
                            <div className="col-span-2">
                                <label className={LABEL_STYLE}><Info size={12} /> Detalle Técnico</label>
                                <textarea rows={4} value={data.detallesDescripcion || ''} onChange={e => setData({ ...data, detallesDescripcion: e.target.value })} className={`${INPUT_STYLE} h-32 resize-none text-xs leading-relaxed`} />
                            </div>
                        </div>
                    </div>

                    <footer className="p-10 bg-slate-50/50 border-t flex justify-between items-center">
                        <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 tracking-widest transition-colors">Cancelar</button>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-[#002855] uppercase">{saving ? 'Enviando...' : 'Aplicar Cambios'}</span>
                            <button
                                onClick={handleUpdate}
                                disabled={saving}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-2xl transition-all group disabled:bg-slate-300"
                            >
                                <Save size={28} className={saving ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
                            </button>
                        </div>
                    </footer>
                </div>
            </motion.div>
        </motion.div>
    );
};