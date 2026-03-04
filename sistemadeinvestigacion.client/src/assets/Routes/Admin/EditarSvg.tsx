import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from '../../components/Navbar';
import { ui } from "./../../../utils/SwalService";
import {
    ArrowRight,
    Search,
    AlertCircle,
    LayoutGrid,
    CheckCircle2,
    RefreshCw,
    Trash2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "/i_region_cuartel_investigaciones_arica.png";

export default function EditarSvg() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const resTemp = await fetch(`${API_BASE}/api/Svg/obtenerTemplates`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!resTemp.ok) throw new Error(`Error HTTP: ${resTemp.status}`);
            const dataTemp = await resTemp.json();
            const listTemp = Array.isArray(dataTemp) ? dataTemp : (dataTemp?.$values || []);
            setTemplates(listTemp);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const handleProceedToEdit = () => {
        const selected = templates.find(t => t.id === selectedTemplateId);
        if (selected) {
            localStorage.setItem('template_svg_edit', selected.svgOriginal);
            localStorage.setItem('modo', JSON.stringify({ nombre: "Modo Edicion SVG", tipo: 4, id: selected.id }));
            navigate('/lienzo');
        }
    };

    const handleDeleteTemplate = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();

        const seguro = await ui.confirmar(
            "¿Eliminar Plantilla?",
            "Esta acción eliminará el diseño SVG permanentemente del sistema."
        );

        if (seguro) {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_BASE}/api/Svg/borrarTemplate/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    setTemplates(prev => prev.filter(t => t.id !== id));
                    if (selectedTemplateId === id) setSelectedTemplateId(null);
                } else {
                    alert("Error al intentar borrar el template");
                }
            } catch (err) {
                console.error(err);
                alert("Error de red al intentar borrar");
            }
        }
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => (t.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()));
    }, [templates, searchTerm]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col">
            <Navbar />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${HERO_BG})` }} />
            </div>

            <main className="relative z-10 flex-1 flex flex-col p-6 overflow-hidden max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6 shrink-0 px-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="BUSCAR PLANTILLA..."
                            className="w-full bg-white/5 border border-white/10 rounded-full px-10 py-2.5 outline-none focus:bg-white/10 focus:border-blue-400 transition-all text-[10px] font-black tracking-[0.2em]"
                        />
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-t-2xl shadow-2xl overflow-hidden flex flex-col relative border-x border-t border-white/10">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="animate-spin text-blue-600" size={32} />
                                <span className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">Cargando Visuales</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                                {filteredTemplates.map(temp => (
                                    <TemplateCard
                                        key={temp.id}
                                        temp={temp}
                                        isSelected={selectedTemplateId === temp.id}
                                        onSelect={() => setSelectedTemplateId(temp.id)}
                                        onDelete={(e: any) => handleDeleteTemplate(e, temp.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {selectedTemplateId && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                className="absolute bottom-10 right-10 flex flex-col items-center gap-2 z-50"
                            >
                                <button
                                    onClick={handleProceedToEdit}
                                    className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-[0_10px_30px_rgba(0,40,85,0.4)] transition-all active:scale-95 border-2 border-white/20"
                                >
                                    <ArrowRight size={32} strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

const TemplateCard = memo(({ temp, isSelected, onSelect, onDelete }: any) => {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`relative aspect-square rounded-xl cursor-pointer transition-all duration-300 border-2 flex flex-col items-center justify-center p-8
                ${isSelected
                    ? 'border-blue-500 bg-white shadow-[0_10px_30_rgba(59,130,246,0.2)] scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl'}`}
        >
            <div className={`absolute top-4 left-4 px-2 py-0.5 rounded text-[9px] font-black tracking-tighter uppercase
                ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                #{temp.id}
            </div>

            <button
                onClick={onDelete}
                className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20"
                title="Eliminar plantilla"
            >
                <Trash2 size={16} />
            </button>

            {temp.svgOriginal ? (
                <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{
                        __html: temp.svgOriginal.replace('<svg', '<svg style="width:100%; height:100%; object-fit:contain;"')
                    }}
                />
            ) : (
                <LayoutGrid size={48} className="text-slate-100" />
            )}

            {isSelected && (
                <div className="absolute bottom-4 right-4 text-blue-600">
                    <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                </div>
            )}
        </motion.div>
    );
});