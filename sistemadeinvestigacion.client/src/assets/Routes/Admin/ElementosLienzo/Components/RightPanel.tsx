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
    Settings
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

    // Obtención de datos de contexto del LocalStorage
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

    const handleToggleModoPuntos = useCallback(() => {
        if (!canEditPoints) return;
        setModoPuntos((v: boolean) => !v);
        setHerramientaActiva(null);
        if (seleccionadoId) setSeleccionadosIds([seleccionadoId]);
    }, [canEditPoints, seleccionadoId, setModoPuntos, setHerramientaActiva, setSeleccionadosIds]);

    if (!canvasSize) return null;

    return (
        <aside className="w-80 bg-[#001a35]/40 backdrop-blur-xl border-l border-white/5 flex flex-col shadow-2xl h-full overflow-hidden text-white">

            {/* CABECERA DE CONTEXTO */}
            <div className="p-6 pb-2 border-b border-white/5">
                <h2 className="text-lg font-black tracking-tighter truncate uppercase text-blue-400">
                    {contextData.titulo}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {contextData.modoNombre}
                    </span>
                </div>

                {/* TABS DE NAVEGACIÓN */}
                <div className="flex gap-1 mt-6 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('opciones')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all ${activeTab === 'opciones' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                    >
                        <Settings size={12} /> OPCIONES
                    </button>
                    <button
                        onClick={() => setActiveTab('capas')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all ${activeTab === 'capas' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                    >
                        <Layers size={12} /> CAPAS
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-list-scroll">
                <AnimatePresence mode="wait">
                    {activeTab === 'capas' ? (
                        <motion.div
                            key="capas-panel"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="p-6 space-y-4"
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
                            className="p-6"
                        >
                            {/* PROPIEDADES DEL ELEMENTO (SIN GRUPOS SEPARADOS, UNO DEBAJO DE OTRO) */}
                            <AnimatePresence mode="wait">
                                {seleccionado ? (
                                    <motion.section
                                        key="config-active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="space-y-8"
                                    >
                                        {/* NOMBRE DE CAPA */}
                                        <div className="space-y-1">
                                            <label className={LABEL_STYLE}>Nombre capa</label>
                                            <input
                                                type="text"
                                                value={seleccionado.name || ''}
                                                onChange={(e) => actualizarAtributo(seleccionado.id, { name: e.target.value })}
                                                placeholder="Ej: Rectangulo_Fondo"
                                                className={INPUT_DARK_STYLE}
                                            />
                                        </div>

                                        {/* LLAVE DE PLANTILLA */}
                                            <div className="space-y-1">
                                                <label className={LABEL_STYLE}>
                                                    <Database size={12} /> Llave de Plantilla
                                                </label>
                                                <select
                                                    value={seleccionado.templateKey || ''}
                                                    onChange={(e) => actualizarAtributo(seleccionado.id, { templateKey: e.target.value })}
                                                    className={`${INPUT_DARK_STYLE} text-blue-300 cursor-pointer`}
                                                >
                                                    <option value="" className="bg-[#001a35] text-white/30">Sin asignar</option>
                                                    <option value="titulo" className="bg-[#001a35] text-white">Título</option>cd 
                                                    <option value="descripcion" className="bg-[#001a35] text-white">Descripción</option>
                                                    <option value="detallesDescripcion" className="bg-[#001a35] text-white">Detalles </option>
                                                </select>
                                                <p className="text-[7px] text-white/20 mt-1 uppercase tracking-widest">
                                                    Vincula este objeto con un dato automático del acuerdo
                                                </p>
                                            </div>

                                        {/* COLOR Y SATURACIÓN */}
                                        <div className="space-y-4">
                                            <label className={LABEL_STYLE}>Color</label>
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
                                                    type="text" value={seleccionado.fill || '#000000'}
                                                    onChange={(e) => manejarCambioColor(e.target.value)}
                                                    className={`${INPUT_DARK_STYLE} font-mono uppercase`}
                                                />
                                            </div>

                                            {tiposConSaturacion?.has?.(seleccionado.type) && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-black text-blue-400">
                                                        <span>SATURACIÓN</span>
                                                        <span>{Math.round((seleccionado.saturation || 1) * 100)}%</span>
                                                    </div>
                                                    <input
                                                        type="range" min={0} max={2} step={0.05}
                                                        value={seleccionado.saturation ?? 1}
                                                        onChange={(e) => actualizarAtributo(seleccionado.id, { saturation: +e.target.value })}
                                                        className="w-full accent-blue-500 opacity-60 hover:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* ACCIONES DE EDICIÓN Y ROTACIÓN */}
                                        <div className="space-y-4">
                                            <label className={LABEL_STYLE}>Transformaciones</label>
                                            <button
                                                disabled={!canEditPoints} onClick={handleToggleModoPuntos}
                                                className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl text-[10px] font-black tracking-widest transition-all
                                                    ${modoPuntos ? 'bg-blue-600 text-white' : 'bg-white/5 text-blue-400 border border-blue-400/20 hover:border-blue-400'}`}
                                            >
                                                <Sliders size={14} /> {modoPuntos ? 'CONGELAR NODOS' : 'EDITAR PUNTOS'}
                                            </button>

                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { icon: RotateCw, label: "+45°", action: () => actualizarAtributo(seleccionado.id, { rotation: ((seleccionado.rotation || 0) + 45) % 360 }) },
                                                    { icon: RefreshCcw, label: "RESET", action: () => actualizarAtributo(seleccionado.id, { rotation: 0 }) },
                                                    { icon: FlipHorizontal, label: "FLIP", action: () => actualizarAtributo(seleccionado.id, { flipX: !seleccionado.flipX }) }
                                                ].map((btn, idx) => (
                                                    <button
                                                        key={idx} onClick={btn.action} disabled={modoPuntos}
                                                        className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all disabled:opacity-10"
                                                    >
                                                        <btn.icon size={14} />
                                                        <span className="text-[8px] font-black">{btn.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={clonarElemento}
                                                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-black tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Copy size={14} /> DUPLICAR GRUPO
                                            </button>
                                        </div>

                                        {/* CONFIGURACIÓN ESPECÍFICA DE TEXTO */}
                                            {seleccionado.type === 'texto' && (
                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    {/* Contenido del Texto */}
                                                    <div className="space-y-1">
                                                        <label className={LABEL_STYLE}>Contenido del texto</label>
                                                        <textarea
                                                            value={seleccionado.text || ''}
                                                            onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })}
                                                            className={`${INPUT_DARK_STYLE} h-24 resize-none`}
                                                            placeholder="Escribe el contenido del texto"
                                                        />
                                                    </div>

                                                    {/* Tamaño de Fuente Dinámico */}
                                                    <div className="space-y-1">
                                                        <label className={LABEL_STYLE}>Tamaño de fuente (px)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="500"
                                                            value={seleccionado.fontSize || 16}
                                                            onChange={(e) => actualizarAtributo(seleccionado.id, { fontSize: Number(e.target.value) })}
                                                            className={INPUT_DARK_STYLE}
                                                        />
                                                    </div>

                                                    {/* Selector de Familia de Fuente */}
                                                    <div className="space-y-1">
                                                        <label className={LABEL_STYLE}>Familia de fuente</label>
                                                        <select
                                                            value={seleccionado.fontFamily || 'Arial'}
                                                            onChange={(e) => actualizarAtributo(seleccionado.id, { fontFamily: e.target.value })}
                                                            className={INPUT_DARK_STYLE}
                                                        >
                                                            {fontsDisponibles.map((f: string) => (
                                                                <option key={f} value={f} className="bg-[#001a35]">
                                                                    {f}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                        <button
                                            onClick={() => eliminarElemento(seleccionado.id)}
                                            className="w-full py-4 text-red-400/40 hover:text-red-400 text-[9px] font-black tracking-[0.3em] transition-all border-t border-white/5"
                                        >
                                            <Trash2 size={12} className="inline mr-2" /> Quitar objeto
                                        </button>
                                    </motion.section>
                                ) : (
                                    <motion.div
                                        key="config-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5"
                                    >
                                        
                                        
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
});