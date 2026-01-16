// Admin/ElementosLienzo/Components/RightPanel.tsx
import React from 'react';
import {
    Settings2,
    Sliders,
    RotateCw,
    RefreshCcw,
    FlipHorizontal,
    Copy
} from 'lucide-react';

import { LayersPanel } from './LayersPanel';

type Props = {
    model: any;
};

export const RightPanel: React.FC<Props> = ({ model }) => {
    const {
        // canvas
        canvasSize,
        setCanvasSize,
        presetsLienzo,

        // selection + elements
        elementos,
        seleccionado,
        seleccionadoId,
        seleccionadosIds,

        // UI helpers
        controlLabel,
        inputStyle,

        // actions
        manejarCambioColor,
        actualizarAtributo,
        clonarElemento,
        eliminarElemento,
        seleccionarElementoDesdeCapas,
        moverCapa,
        moverCapaExtremo,

        // features
        tiposConSaturacion,
        fontsDisponibles,

        // point edit
        modoPuntos,
        setModoPuntos,
        canEditPoints,
        setHerramientaActiva,
        setSeleccionadosIds
    } = model;

    if (!canvasSize) {
        console.error('RightPanel: canvasSize llegó undefined. model recibido:', model);
        return null;
    }

    return (
        <aside className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <span className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-tight">
                    <Settings2 size={16} className="mr-2 text-blue-600" /> Configuración
                </span>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto flex-1">
                {/* Tamaño lienzo */}
                <section>
                    <label className={controlLabel}>Tamaño del Lienzo</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="relative">
                            <span className="absolute left-2 top-2 text-[10px] text-gray-400">W</span>
                            <input
                                type="number"
                                value={canvasSize.w || 800}
                                onChange={(e) => setCanvasSize({ ...canvasSize, w: +e.target.value })}
                                className={`${inputStyle} pl-6`}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-2 top-2 text-[10px] text-gray-400">H</span>
                            <input
                                type="number"
                                value={canvasSize.h || 600}
                                onChange={(e) => setCanvasSize({ ...canvasSize, h: +e.target.value })}
                                className={`${inputStyle} pl-6`}
                            />
                        </div>
                    </div>

                    <label className={controlLabel}>Presets</label>
                    <select
                        className={inputStyle}
                        value={`${canvasSize.w}x${canvasSize.h}`}
                        onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            if (Number.isFinite(w) && Number.isFinite(h)) setCanvasSize({ w, h });
                        }}
                    >
                        {presetsLienzo.map((p: any) => (
                            <option key={`${p.w}x${p.h}`} value={`${p.w}x${p.h}`}>
                                {p.w}x{p.h}
                            </option>
                        ))}
                    </select>
                </section>

                {/* Config seleccionado */}
                {seleccionado ? (
                    <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                        {/* Color */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className={controlLabel}>Estética</label>
                            <input
                                type="color"
                                value={seleccionado.fill || '#000000'}
                                onChange={(e) => manejarCambioColor(e.target.value)}
                                className="w-full h-10 rounded-lg cursor-pointer border-none p-1 bg-gray-100 shadow-inner"
                            />
                        </div>

                        {/* Saturación */}
                        {tiposConSaturacion?.has?.(seleccionado.type) && (
                            <div className="pt-2">
                                <label className={controlLabel}>Saturación</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => actualizarAtributo(seleccionado.id, { saturation: 1 })}
                                        className="flex items-center justify-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-[10px] font-bold text-gray-600 transition-colors"
                                    >
                                        100
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={3}
                                        step={0.05}
                                        value={Number.isFinite(Number(seleccionado.saturation)) ? Number(seleccionado.saturation) : 1}
                                        onChange={(e) => actualizarAtributo(seleccionado.id, { saturation: +e.target.value })}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Point mode toggle */}
                        <div className="pt-2">
                            <label className={controlLabel}>Edición avanzada</label>

                            <button
                                disabled={!canEditPoints}
                                onClick={() => {
                                    if (!canEditPoints) return;
                                    setModoPuntos((v: boolean) => !v);
                                    setHerramientaActiva(null);
                                    if (seleccionadoId) setSeleccionadosIds([seleccionadoId]);
                                }}
                                className={`w-full flex items-center justify-center p-2 border rounded-lg text-xs font-bold transition-all ${canEditPoints
                                        ? modoPuntos
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }`}
                                title={canEditPoints ? 'Editar vértices (estirar partes)' : 'Selecciona un polígono editable'}
                            >
                                <Sliders size={14} className="mr-2" />
                                {modoPuntos ? 'Salir de Editar Puntos' : 'Editar Puntos (Vértices)'}
                            </button>

                            {modoPuntos && (
                                <div className="mt-2 text-[11px] text-gray-500 leading-snug">
                                    
                                </div>
                            )}
                        </div>

                        {/* Transform */}
                        <div>
                            <label className={controlLabel}>Transformación</label>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <button
                                    onClick={() => actualizarAtributo(seleccionado.id, { rotation: ((seleccionado.rotation || 0) + 45) % 360 })}
                                    className="flex items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-[10px] font-medium text-gray-600 transition-colors"
                                    disabled={modoPuntos}
                                    title={modoPuntos ? 'Sal de editar puntos para rotar' : 'Rotar +45°'}
                                >
                                    <RotateCw size={14} className="mr-1" /> +45°
                                </button>

                                <button
                                    onClick={() => actualizarAtributo(seleccionado.id, { rotation: 0 })}
                                    className="flex items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-[10px] font-medium text-gray-600 transition-colors"
                                    disabled={modoPuntos}
                                    title={modoPuntos ? 'Sal de editar puntos para resetear rotación' : 'Reset rotación'}
                                >
                                    <RefreshCcw size={14} className="mr-1" /> 0°
                                </button>

                                <button
                                    onClick={() => actualizarAtributo(seleccionado.id, { flipX: !seleccionado.flipX })}
                                    className="flex items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-[10px] font-medium text-gray-600 transition-colors"
                                    disabled={modoPuntos}
                                    title={modoPuntos ? 'Sal de editar puntos para espejar' : 'Espejo horizontal'}
                                >
                                    <FlipHorizontal size={14} className="mr-1" /> Espejo
                                </button>
                            </div>

                            <div className="mt-3">
                                <label className={controlLabel}>Rotación: {Math.round(seleccionado.rotation || 0)}°</label>
                                <input
                                    type="range"
                                    min={-180}
                                    max={180}
                                    value={Number.isFinite(seleccionado.rotation) ? seleccionado.rotation : 0}
                                    onChange={(e) => actualizarAtributo(seleccionado.id, { rotation: +e.target.value })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    disabled={modoPuntos}
                                />
                            </div>

                            <button
                                onClick={clonarElemento}
                                className="w-full mt-4 flex items-center justify-center p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 text-xs font-bold transition-all"
                            >
                                <Copy size={14} className="mr-2" /> Clonar Objeto
                            </button>
                        </div>

                        {/* Text config */}
                        {seleccionado.type === 'texto' && (
                            <div className="space-y-3">
                                <label className={controlLabel}>Texto</label>
                                <textarea
                                    value={seleccionado.text || ''}
                                    onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })}
                                    className={`${inputStyle} h-16 resize-none`}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={seleccionado.fontFamily || 'Arial'}
                                        onChange={(e) => actualizarAtributo(seleccionado.id, { fontFamily: e.target.value })}
                                        className={inputStyle}
                                    >
                                        {fontsDisponibles.map((f: string) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-[10px] text-gray-400">PX</span>
                                        <input
                                            type="number"
                                            min={6}
                                            max={300}
                                            value={Number.isFinite(Number(seleccionado.fontSize)) ? Number(seleccionado.fontSize) : 16}
                                            onChange={(e) => actualizarAtributo(seleccionado.id, { fontSize: +e.target.value })}
                                            className={`${inputStyle} pl-8`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                ) : null}

                {/* LayersPanel (tu componente) */}
                <LayersPanel
                    elementos={elementos}
                    seleccionadosIds={seleccionadosIds}
                    onSelectFromLayers={seleccionarElementoDesdeCapas}
                    moverCapa={moverCapa}
                    moverCapaExtremo={moverCapaExtremo}
                    eliminarElemento={eliminarElemento}
                    controlLabel={controlLabel}
                />
            </div>
        </aside>
    );
};
