import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from '../../components/Navbar';
import { ArrowRight, CheckCircle2, Search, AlertCircle } from 'lucide-react';

export default function EditarSvg() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Nuevo estado para errores
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/Svg/obtenerTemplates`;

        console.log("🚀 Iniciando fetch a:", apiUrl);

        try {
            const resTemp = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("📡 Status de la respuesta:", resTemp.status);

            if (!resTemp.ok) {
                throw new Error(`Error HTTP: ${resTemp.status} - ${resTemp.statusText}`);
            }

            const dataTemp = await resTemp.json();
            console.log("📦 Datos brutos recibidos de la API:", dataTemp);

            // Manejo de la estructura (ajustado a lo que vimos en acuerdos.tsx)
            let listTemp = [];
            if (Array.isArray(dataTemp)) {
                listTemp = dataTemp;
            } else if (dataTemp && dataTemp.$values) {
                listTemp = dataTemp.$values;
            } else {
                console.warn("⚠️ La API no devolvió un array ni un objeto con $values. Estructura recibida:", dataTemp);
            }

            console.log("✅ Plantillas procesadas para el estado:", listTemp);
            setTemplates(listTemp);

        } catch (e: any) {
            console.error("❌ Error fatal en fetchTemplates:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleProceedToEdit = () => {
        const selected = templates.find(t => t.id === selectedTemplateId);

        if (selected) {
            console.log("🛠️ Preparando Modo Edición SVG (Tipo 4) con ID:", selected.id);

            // 1. Guardamos el SVG en el archivo temporal solicitado
            localStorage.setItem('template_svg_edit', selected.svgOriginal);

            // 2. Seteamos el modo de operación incluyendo el ID del SVG
            const modoEdicion = {
                nombre: "Modo Edicion SVG",
                tipo: 4,
                id: selected.id // <--- El ID ahora viaja dentro del objeto modo
            };

            localStorage.setItem('modo', JSON.stringify(modoEdicion));

            // Opcional: Limpiamos posibles residuos de ediciones anteriores
            localStorage.removeItem('editing_template_id');

            navigate('/lienzo');
        }
    };

    const filteredTemplates = templates.filter(t =>
        (t.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-[#002855] uppercase tracking-tight">
                        Editor de Plantillas
                    </h1>
                </header>

                {/* Feedback de Error en pantalla */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <div>
                            <p className="font-bold">Error al cargar plantillas</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar plantilla..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002855]"></div>
                        <p className="text-slate-500 animate-pulse">Consultando al servidor...</p>
                    </div>
                ) : (
                    <>
                        {filteredTemplates.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">No se encontraron plantillas o la lista está vacía.</p>
                                <button onClick={fetchTemplates} className="mt-4 text-[#002855] font-bold underline">Reintentar</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((temp) => (
                                    <motion.div
                                        key={temp.id}
                                        whileHover={{ y: -5 }}
                                        className={`relative bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${selectedTemplateId === temp.id ? 'border-[#002855] shadow-xl' : 'border-slate-100'
                                            }`}
                                        onClick={() => setSelectedTemplateId(temp.id)}
                                    >
                                        <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
                                            {temp.svgOriginal ? (
                                                <div
                                                    className="w-full h-full transform scale-75 origin-center pointer-events-none"
                                                    dangerouslySetInnerHTML={{ __html: temp.svgOriginal }}
                                                />
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">SVG sin contenido</p>
                                            )}
                                        </div>
                                        <div className="p-4 flex justify-between items-center bg-white border-t border-slate-50">
                                            <div className="flex flex-col truncate">
                                                <span className="font-bold text-slate-700 truncate">{temp.nombre || 'ID: ' + temp.id}</span>
                                                <span className="text-[10px] text-slate-400">ID: {temp.id}</span>
                                            </div>
                                            {selectedTemplateId === temp.id && <CheckCircle2 size={24} className="text-[#002855]" />}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Botón Flotante */}
            <AnimatePresence>
                {selectedTemplateId && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-10 right-10 flex flex-col items-center gap-2"
                    >
                        <span className="text-[10px] font-black text-[#002855] uppercase tracking-widest">Editar Seleccionado</span>
                        <button
                            onClick={handleProceedToEdit}
                            className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-700 hover:scale-110 shadow-2xl transition-all"
                        >
                            <ArrowRight size={32} strokeWidth={3} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}