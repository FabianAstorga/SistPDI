/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { memo, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sliders,
    RotateCw,
    RefreshCcw,
    FlipHorizontal,
    Copy,
    MousePointer2,
    Layers,
    Tag,
    Database,
    Box,
    Trash2,
    Settings,
    Palette,
    Droplets,
    Type,
    Zap
} from 'lucide-react';

import { LayersPanel } from './LayersPanel';
import { safeJson } from '../Utils/lienzo.storage';

type Props = {
    model: any;
};

const LABEL_STYLE = "text-[10px] font-black text-blue-300/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2";
const INPUT_DARK_STYLE = "w-full bg-white/5 border-b border-white/10 text-white px-3 py-2 outline-none focus:border-blue-400 transition-all duration-300 font-bold text-xs tracking-widest disabled:opacity-30";

export const RightPanel: React.FC<Props> = memo(({ model }) => {
    const {
        canvasSize,
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
        setSeleccionadosIds,
        redimensionarElemento
    } = model;

    const [activeTab, setActiveTab] = useState<'opciones' | 'capas'>('opciones');

    const contextData = useMemo(() => {
        const acuerdoRaw = localStorage.getItem('temp_acuerdo');
        const modoRaw = localStorage.getItem('modo');

        const acuerdo = safeJson(acuerdoRaw);
        const modo = safeJson(modoRaw);

        return {
            titulo: acuerdo?.titulo || 'Sin Acuerdo Activo',
            modoNombre: modo?.nombre || 'Sin Modo Definido'
        };
    }, []);
    const [showSaturation, setShowSaturation] = useState(false);
    const [menuSaturacionOpen, setMenuSaturacionOpen] = useState(false);
    const handleToggleModoPuntos = useCallback(() => {
        if (!canEditPoints) return;
        setModoPuntos((v: boolean) => !v);
        setHerramientaActiva(null);
        if (seleccionadoId) setSeleccionadosIds([seleccionadoId]);
    }, [canEditPoints, seleccionadoId, setModoPuntos, setHerramientaActiva, setSeleccionadosIds]);

    if (!canvasSize) return null;

    return (
        <aside className="w-80 bg-[#001a35]/40 backdrop-blur-xl border-l border-white/5 flex flex-col shadow-2xl h-full overflow-hidden text-white">

            {/* PESTAÑAS MOVIDAS ARRIBA */}
            <div className="pb-1 border-b border-white/5">
                <div className="flex w-full gap-1 mt-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('opciones')}
                        className={`
                flex-1 flex items-center justify-center gap-3 
                py-4 rounded-lg          /* Altura aumentada */
                text-[11px] font-black   /* Fuente aumentada */
                tracking-widest transition-all uppercase
                ${activeTab === 'opciones'
                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-[1.02]'
                                : 'text-white/30 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <Settings size={16} /> {/* Icono aumentado */}
                        OPCIONES
                    </button>

                    <button
                        onClick={() => setActiveTab('capas')}
                        className={`
                flex-1 flex items-center justify-center gap-3 
                py-4 rounded-lg          /* Altura aumentada */
                text-[11px] font-black   /* Fuente aumentada */
                tracking-widest transition-all uppercase
                ${activeTab === 'capas'
                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-[1.02]'
                                : 'text-white/30 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <Layers size={16} /> {/* Icono aumentado */}
                        CAPAS
                    </button>
                </div>
            </div>

            {/* CONTENEDOR PRINCIPAL MODIFICADO PARA NO TENER SCROLL EXTERNO */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'capas' ? (
                        <motion.div
                            key="capas-panel"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="absolute inset-0 p-6 flex flex-col overflow-y-auto custom-list-scroll" // Scroll aplicado directamente aquí
                        >
                            <LayersPanel
                                elementos={elementos}
                                seleccionadosIds={seleccionadosIds}
                                onSelectFromLayers={seleccionarElementoDesdeCapas}
                                moverCapa={moverCapa}
                                moverCapaExtremo={moverCapaExtremo}
                                eliminarElemento={eliminarElemento}
                                controlLabel={LABEL_STYLE}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="opciones-panel"
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                            className="absolute inset-0 p-1  custom-list-scroll" // Se añadió absolute inset-0 y overflow
                        >
                            <AnimatePresence mode="wait">
                                <motion.section
                                    className="bg-slate-200 rounded-2xl p-5 space-y-6 border border-slate-300 shadow-sm"
                                >

                                    <div className="flex flex-col -space-y-1">
                                        <h2 className="text-lg font-black px-2 tracking-tighter truncate uppercase text-blue-600">
                                            {contextData.titulo}
                                        </h2>
                                        <span className="text-[10px] font-bold px-2 text-slate-600 uppercase tracking-widest leading-none">
                                            {contextData.modoNombre}
                                        </span>
                                    </div>

                                    <div className="space-y-3">

                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { title: "Girar 45°", icon: <RotateCw size={14} />, onClick: () => seleccionado && actualizarAtributo(seleccionado.id, { rotation: ((seleccionado.rotation || 0) + 45) % 360 }) },
                                                { title: "Resetear", icon: <RefreshCcw size={14} />, onClick: () => seleccionado && actualizarAtributo(seleccionado.id, { rotation: 0 }) },
                                                { title: "Reflejar", icon: <FlipHorizontal size={14} />, onClick: () => seleccionado && actualizarAtributo(seleccionado.id, { flipX: !seleccionado.flipX }) },
                                                {
                                                    title: modoPuntos ? 'Congelar Nodos' : 'Editar Puntos',
                                                    icon: <MousePointer2 size={14} />,
                                                    onClick: handleToggleModoPuntos,
                                                    active: modoPuntos,
                                                    disabled: !canEditPoints
                                                },
                                                { title: "Clonar", icon: <Copy size={14} />, onClick: clonarElemento },
                                                { title: "Eliminar", icon: <Trash2 size={14} />, onClick: () => seleccionado && eliminarElemento(seleccionado.id), danger: true },
                                            ].map((btn, i) => (
                                                <button
                                                    key={i}
                                                    title={btn.title}
                                                    onClick={btn.onClick}
                                                    disabled={btn.disabled || !seleccionado}
                                                    className={`
                                h-9 flex items-center justify-center rounded-lg transition-all border shadow-sm
                                ${btn.danger
                                                            ? 'bg-red-100 border-red-200 text-red-600 hover:bg-red-500 hover:text-white'
                                                            : btn.active
                                                                ? 'bg-blue-600 border-blue-700 text-white'
                                                                : 'bg-white border-white text-slate-700 hover:border-blue-400 hover:text-blue-600'
                                                        }
                                ${(!seleccionado) ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer active:scale-95'}
                            `}
                                                >
                                                    {btn.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Nombre</label>
                                            <input
                                                type="text"
                                                disabled={!seleccionado}
                                                value={seleccionado?.name || ''}
                                                onChange={(e) => seleccionado && actualizarAtributo(seleccionado.id, { name: e.target.value })}
                                                className="w-full bg-white border text-black border-white rounded-lg px-2 py-1.5 text-[11px] outline-none shadow-sm transition-all focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Data ID</label>
                                            <select
                                                disabled={!seleccionado}
                                                value={seleccionado?.templateKey || ''}
                                                onChange={(e) => seleccionado && actualizarAtributo(seleccionado.id, { templateKey: e.target.value })}
                                                className="w-full bg-white border border-white rounded-lg px-1 py-1.5 text-[11px] text-black font-bold outline-none shadow-sm cursor-pointer"
                                            >
                                                <option value="">Ninguno</option>
                                                <option value="titulo">Título</option>
                                                <option value="descripcion">Desc.</option>
                                                <option value="detallesDescripcion">Detalles</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-3">
                                            <div className="flex flex-row-reverse gap-2">
                                                <div className={`relative flex-1 h-9 rounded-lg overflow-hidden border border-white shadow-sm transition-all ${!seleccionado ? 'opacity-50' : ''}`}>
                                                    <input
                                                        type="color"
                                                        disabled={!seleccionado}
                                                        value={seleccionado?.fill || '#d1d5db'}
                                                        onChange={(e) => manejarCambioColor(e.target.value)}
                                                        className="absolute inset-0 w-[200%] h-[200%] cursor-pointer -translate-x-1/4 -translate-y-1/4"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setMenuSaturacionOpen(!menuSaturacionOpen)}
                                                    disabled={!seleccionado || !tiposConSaturacion?.has?.(seleccionado.type)}
                                                    className={`w-10 h-9 flex items-center justify-center rounded-lg border shadow-sm transition-all
                                            ${menuSaturacionOpen ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-white text-slate-700 hover:text-blue-600'}
                                            disabled:opacity-30
                                        `}
                                                    title="Ajustar Saturación"
                                                >
                                                    <Droplets size={16} />
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {menuSaturacionOpen && seleccionado && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-white border border-white rounded-xl p-3 shadow-sm space-y-2">
                                                            <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                                <span>Saturación</span>
                                                                <span className="text-blue-600">{Math.round((seleccionado.saturation || 1) * 100)}%</span>
                                                            </div>
                                                            <input
                                                                type="range" min={0} max={2} step={0.05}
                                                                value={seleccionado?.saturation ?? 1}
                                                                onChange={(e) => actualizarAtributo(seleccionado.id, { saturation: +e.target.value })}
                                                                className="w-full accent-blue-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {seleccionado?.type === 'texto' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-3 pt-4 border-t border-slate-300 overflow-hidden"
                                            >
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                                    <Type size={12} /> Contenido
                                                </label>
                                                <textarea
                                                    value={seleccionado.text || ''}
                                                    onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })}
                                                    className="w-full bg-white border border-white rounded-lg p-3 text-xs text-slate-800 h-20 resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="number"
                                                        value={seleccionado.fontSize || 16}
                                                        onChange={(e) => actualizarAtributo(seleccionado.id, { fontSize: Number(e.target.value) })}
                                                        className="w-full bg-white text-black border border-white rounded-lg px-2 py-1.5 text-[11px] shadow-sm"
                                                    />
                                                    <select
                                                        value={seleccionado.fontFamily || 'Arial'}
                                                        onChange={(e) => actualizarAtributo(seleccionado.id, { fontFamily: e.target.value })}
                                                        className="w-full bg-white border text-black border-white rounded-lg px-2 py-1.5 text-[11px] shadow-sm cursor-pointer"
                                                    >
                                                        {fontsDisponibles?.map((f: string) => (
                                                            <option key={f} value={f}>{f}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.section>
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </aside>
    );
});