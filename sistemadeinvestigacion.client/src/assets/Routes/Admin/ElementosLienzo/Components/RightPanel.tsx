import React, { memo, useCallback } from 'react';
import {
    Settings2,
    Sliders,
    RotateCw,
    RefreshCcw,
    FlipHorizontal,
    Copy,
    MousePointer2
} from 'lucide-react';

import { LayersPanel } from './LayersPanel';

type Props = {
    model: any;
};

// 1. Envolvemos el panel en memo para que no se re-renderice por movimientos en el lienzo 
// si las propiedades de interés no han cambiado.
export const RightPanel: React.FC<Props> = memo(({ model }) => {
    const {
        canvasSize,
        setCanvasSize,
        presetsLienzo,
        elementos,
        seleccionado,
        seleccionadoId,
        seleccionadosIds,
        controlLabel,
        inputStyle,
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

    // 2. Optimizamos los handlers para que no se re-creen innecesariamente
    const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCanvasSize({ ...canvasSize, w: Number(e.target.value) });
    }, [canvasSize, setCanvasSize]);

    const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCanvasSize({ ...canvasSize, h: Number(e.target.value) });
    }, [canvasSize, setCanvasSize]);

    const handleToggleModoPuntos = useCallback(() => {
        if (!canEditPoints) return;
        setModoPuntos((v: boolean) => !v);
        setHerramientaActiva(null);
        if (seleccionadoId) setSeleccionadosIds([seleccionadoId]);
    }, [canEditPoints, seleccionadoId, setModoPuntos, setHerramientaActiva, setSeleccionadosIds]);

    if (!canvasSize) return null;

    return (
        <aside className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-sm h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                <span className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-tight">
                    <Settings2 size={16} className="mr-2 text-blue-600" /> Configuración
                </span>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                {/* Tamaño lienzo */}
                <section className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <label className={`${controlLabel} mb-2 block`}>Dimensión del Lienzo</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="relative">
                            <span className="absolute left-2 top-2 text-[10px] text-gray-400 font-bold">W</span>
                            <input
                                type="number"
                                value={canvasSize.w || 800}
                                onChange={handleWidthChange}
                                className={`${inputStyle} pl-7`}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-2 top-2 text-[10px] text-gray-400 font-bold">H</span>
                            <input
                                type="number"
                                value={canvasSize.h || 600}
                                onChange={handleHeightChange}
                                className={`${inputStyle} pl-7`}
                            />
                        </div>
                    </div>

                    <select
                        className={inputStyle}
                        value={`${canvasSize.w}x${canvasSize.h}`}
                        onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            if (w && h) setCanvasSize({ w, h });
                        }}
                    >
                        {presetsLienzo.map((p: any) => (
                            <option key={`${p.w}x${p.h}`} value={`${p.w}x${p.h}`}>
                                Preset: {p.w} x {p.h}
                            </option>
                        ))}
                    </select>
                </section>

                {/* Config seleccionado */}
                {seleccionado ? (
                    <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                        {/* Color */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className={controlLabel}>Color y Estética</label>
                            <div className="flex gap-2 items-center mt-1">
                                <input
                                    type="color"
                                    value={seleccionado.fill || '#000000'}
                                    onChange={(e) => manejarCambioColor(e.target.value)}
                                    className="w-12 h-10 rounded-lg cursor-pointer border-none p-1 bg-white shadow-sm"
                                />
                                <input
                                    type="text"
                                    value={seleccionado.fill || '#000000'}
                                    onChange={(e) => manejarCambioColor(e.target.value)}
                                    className={`${inputStyle} flex-1 uppercase font-mono text-xs`}
                                />
                            </div>
                        </div>

                        {/* Saturación */}
                        {tiposConSaturacion?.has?.(seleccionado.type) && (
                            <div className="pt-2">
                                <label className={controlLabel}>Saturación ({Math.round((seleccionado.saturation || 1) * 100)}%)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range" min={0} max={3} step={0.05}
                                        value={seleccionado.saturation ?? 1}
                                        onChange={(e) => actualizarAtributo(seleccionado.id, { saturation: +e.target.value })}
                                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <button
                                        onClick={() => actualizarAtributo(seleccionado.id, { saturation: 1 })}
                                        className="text-[10px] font-bold text-blue-600 hover:underline"
                                    >Reset</button>
                                </div>
                            </div>
                        )}

                        {/* Point mode */}
                        <div className="pt-2">
                            <label className={controlLabel}>Nodos y Vértices</label>
                            <button
                                disabled={!canEditPoints}
                                onClick={handleToggleModoPuntos}
                                className={`w-full flex items-center justify-center p-2.5 border rounded-xl text-xs font-black transition-all ${canEditPoints
                                        ? modoPuntos
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                            : 'bg-white text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                                        : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                                    }`}
                            >
                                <Sliders size={14} className="mr-2" />
                                {modoPuntos ? 'FINALIZAR EDICIÓN' : 'EDITAR PUNTOS'}
                            </button>
                        </div>

                        {/* Transformación */}
                        <div className="pt-2 border-t border-gray-50">
                            <label className={controlLabel}>Transformación</label>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <button
                                    onClick={() => actualizarAtributo(seleccionado.id, { rotation: ((seleccionado.rotation || 0) + 45) % 360 })}
                                    className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-[9px] font-bold text-gray-500"
                                    disabled={modoPuntos}
                                >
                                    <RotateCw size={14} className="mb-1 text-gray-400" /> +45°
                                </button>
                                <button
                                    onClick={() => actualizarAtributo(seleccionado.id, { rotation: 0 })}
                                    className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-[9px] font-bold text-gray-500"
                                    disabled={modoPuntos}
                                >
                                    <RefreshCcw size={14} className="mb-1 text-gray-400" /> 0°
                                </button>
                                <button
                                    onClick={() => actualizarAtributo(seleccionado.id, { flipX: !seleccionado.flipX })}
                                    className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-[9px] font-bold text-gray-500"
                                    disabled={modoPuntos}
                                >
                                    <FlipHorizontal size={14} className="mb-1 text-gray-400" /> ESPEJO
                                </button>
                            </div>

                            <input
                                type="range" min={-180} max={180}
                                value={seleccionado.rotation || 0}
                                onChange={(e) => actualizarAtributo(seleccionado.id, { rotation: +e.target.value })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                disabled={modoPuntos}
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                                <span>-180°</span>
                                <span className="text-blue-600 font-bold">{Math.round(seleccionado.rotation || 0)}°</span>
                                <span>180°</span>
                            </div>
                        </div>

                        {/* Clonar */}
                        <button
                            onClick={clonarElemento}
                            className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black transition-all shadow-md shadow-blue-100"
                        >
                            <Copy size={14} className="mr-2" /> CLONAR ELEMENTO
                        </button>

                        {/* Text config */}
                        {seleccionado.type === 'texto' && (
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <label className={controlLabel}>Contenido del Texto</label>
                                <textarea
                                    value={seleccionado.text || ''}
                                    onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })}
                                    className={`${inputStyle} h-20 resize-none text-sm p-3`}
                                    placeholder="Escribe aquí..."
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={seleccionado.fontFamily || 'Arial'}
                                        onChange={(e) => actualizarAtributo(seleccionado.id, { fontFamily: e.target.value })}
                                        className={inputStyle}
                                    >
                                        {fontsDisponibles.map((f: string) => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>

                                    <div className="relative">
                                        <span className="absolute left-2 top-2.5 text-[10px] text-gray-400 font-bold">SIZE</span>
                                        <input
                                            type="number"
                                            value={seleccionado.fontSize || 16}
                                            onChange={(e) => actualizarAtributo(seleccionado.id, { fontSize: +e.target.value })}
                                            className={`${inputStyle} pl-9`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                        <MousePointer2 className="text-gray-200 mb-2" size={32} />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selecciona un objeto</p>
                    </div>
                )}

                {/* LayersPanel se mantiene memoizado internamente */}
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
});