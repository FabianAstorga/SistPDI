import React, { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sliders,
    RotateCw,
    RefreshCcw,
    FlipHorizontal,
    Copy,
    MousePointer2,
    Layout,
    ChevronRight,
    Layers // Cambiado de 'Stack' a 'Layers'
} from 'lucide-react';

import { LayersPanel } from './LayersPanel';

type Props = {
    model: any;
};

// Estilos unificados con Administración de Identidad
const LABEL_STYLE = "text-[10px] font-black text-blue-300/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2";
const INPUT_DARK_STYLE = "w-full bg-white/5 border-b border-white/10 text-white px-3 py-2.5 outline-none focus:border-blue-400 transition-all duration-300 font-bold text-xs uppercase tracking-widest disabled:opacity-30";

export const RightPanel: React.FC<Props> = memo(({ model }) => {
    const {
        canvasSize,
        setCanvasSize,
        presetsLienzo,
        elementos,
        seleccionado,
        seleccionadoId,
        seleccionadosIds,
        manejarCambioColor,
        actualizarAtributo,
        clonarElemento,
        eliminarElemento,
        seleccionarElementoDesdeCapas,
        moverCapa,
        moverCapaExtremo,
        tiposConSaturacion,
        fontsDisponibles,
        modoPuntos,
        setModoPuntos,
        canEditPoints,
        setHerramientaActiva,
        setSeleccionadosIds
    } = model;

    const [menuPresetsOpen, setMenuPresetsOpen] = useState(false);

    const handleToggleModoPuntos = useCallback(() => {
        if (!canEditPoints) return;
        setModoPuntos((v: boolean) => !v);
        setHerramientaActiva(null);
        if (seleccionadoId) setSeleccionadosIds([seleccionadoId]);
    }, [canEditPoints, seleccionadoId, setModoPuntos, setHerramientaActiva, setSeleccionadosIds]);

    if (!canvasSize) return null;

    return (
        <aside className="w-80 bg-[#001a35]/40 backdrop-blur-xl border-l border-white/5 flex flex-col shadow-2xl h-full overflow-hidden text-white">

            {/* Contenedor Único de Scroll */}
            <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-list-scroll">

                {/* 1. SECCIÓN DE CAPAS: Prioridad superior con límite de altura */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className={LABEL_STYLE}>
                            <Layers size={12} className="text-blue-400/40" /> Capas del Proyecto
                        </label>
                        <span className="text-[9px] font-black text-blue-500/50 bg-blue-500/10 px-2 py-0.5 rounded">
                            {elementos.length} TOTAL
                        </span>
                    </div>

                    {/* Contenedor de capas con scroll interno limitado */}
                    <div className="max-h-[260px] overflow-y-auto pr-1 custom-list-scroll border-b border-white/5 pb-4">
                        <LayersPanel
                            elementos={elementos}
                            seleccionadosIds={seleccionadosIds}
                            onSelectFromLayers={seleccionarElementoDesdeCapas}
                            moverCapa={moverCapa}
                            moverCapaExtremo={moverCapaExtremo}
                            eliminarElemento={eliminarElemento}
                            controlLabel={LABEL_STYLE}
                        />
                    </div>
                </section>

                {/* 2. FORMATO: Solo Presets mediante Menú */}
                <section className="space-y-4 relative">
                    <label className={LABEL_STYLE}><Layout size={12} /> Formato del Lienzo</label>

                    <button
                        onClick={() => setMenuPresetsOpen(!menuPresetsOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                    >
                        <span className="text-[10px] font-black tracking-[0.2em] text-blue-400">
                            {canvasSize.w} PX <span className="text-white/20 mx-1">/</span> {canvasSize.h} PX
                        </span>
                        <ChevronRight size={14} className={`text-white/30 transition-transform duration-300 ${menuPresetsOpen ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {menuPresetsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute left-0 right-0 mt-2 bg-[#001a35] border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden backdrop-blur-2xl p-1"
                            >
                                {presetsLienzo.map((p: any) => (
                                    <button
                                        key={`${p.w}x${p.h}`}
                                        onClick={() => {
                                            setCanvasSize({ w: p.w, h: p.h });
                                            setMenuPresetsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all group"
                                    >
                                        <span>{p.label || 'Preset'} {p.w}x{p.h}</span>
                                        {canvasSize.w === p.w && canvasSize.h === p.h && (
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* 3. PROPIEDADES DINÁMICAS */}
                <AnimatePresence mode="wait">
                    {seleccionado ? (
                        <motion.section
                            key="config-active"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6 pt-6 border-t border-white/5"
                        >
                            {/* Color */}
                            <div>
                                <label className={LABEL_STYLE}>Apariencia</label>
                                <div className="flex gap-3 items-center">
                                    <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-lg">
                                        <input
                                            type="color"
                                            value={seleccionado.fill || '#000000'}
                                            onChange={(e) => manejarCambioColor(e.target.value)}
                                            className="absolute inset-0 w-[200%] h-[200%] cursor-pointer -translate-x-1/4 -translate-y-1/4"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={seleccionado.fill || '#000000'}
                                        onChange={(e) => manejarCambioColor(e.target.value)}
                                        className={`${INPUT_DARK_STYLE} font-mono`}
                                    />
                                </div>
                            </div>

                            {/* Saturación */}
                            {tiposConSaturacion?.has?.(seleccionado.type) && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className={LABEL_STYLE}>Saturación</label>
                                        <span className="text-[10px] font-black text-blue-400">{Math.round((seleccionado.saturation || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min={0} max={3} step={0.05}
                                        value={seleccionado.saturation ?? 1}
                                        onChange={(e) => actualizarAtributo(seleccionado.id, { saturation: +e.target.value })}
                                        className="w-full accent-blue-500 opacity-60 hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            )}

                            {/* Edición de Nodos */}
                            <button
                                disabled={!canEditPoints}
                                onClick={handleToggleModoPuntos}
                                className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl text-[10px] font-black tracking-widest transition-all
                                    ${modoPuntos
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-white/5 text-blue-400 border border-blue-400/20 hover:bg-blue-400/10 hover:border-blue-400'
                                    } disabled:opacity-20`}
                            >
                                <Sliders size={14} /> {modoPuntos ? 'SOLTAR NODOS' : 'EDITAR NODOS'}
                            </button>

                            {/* Transformaciones Rápidas */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { icon: RotateCw, label: "+45°", action: () => actualizarAtributo(seleccionado.id, { rotation: ((seleccionado.rotation || 0) + 45) % 360 }) },
                                    { icon: RefreshCcw, label: "0°", action: () => actualizarAtributo(seleccionado.id, { rotation: 0 }) },
                                    { icon: FlipHorizontal, label: "FLIP", action: () => actualizarAtributo(seleccionado.id, { flipX: !seleccionado.flipX }) }
                                ].map((btn, idx) => (
                                    <button
                                        key={idx} onClick={btn.action} disabled={modoPuntos}
                                        className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all disabled:opacity-5"
                                    >
                                        <btn.icon size={14} />
                                        <span className="text-[8px] font-black uppercase tracking-tighter">{btn.label}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={clonarElemento}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
                            >
                                <Copy size={14} /> CLONAR
                            </button>

                            {/* Configuración de Texto */}
                            {seleccionado.type === 'texto' && (
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className={LABEL_STYLE}>Contenido</label>
                                    <textarea
                                        value={seleccionado.text || ''}
                                        onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })}
                                        className={`${INPUT_DARK_STYLE} h-24 resize-none lowercase`}
                                    />
                                    <div className="grid grid-cols-1 gap-3">
                                        <select
                                            value={seleccionado.fontFamily || 'Arial'}
                                            onChange={(e) => actualizarAtributo(seleccionado.id, { fontFamily: e.target.value })}
                                            className={INPUT_DARK_STYLE}
                                        >
                                            {fontsDisponibles.map((f: string) => <option key={f} value={f} className="bg-[#001a35]">{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    ) : (
                        <motion.div
                            key="config-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="h-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5"
                        >
                            <MousePointer2 className="text-white/10 mb-2" size={24} />
                            <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.3em] text-center">
                                Sin Selección
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
});