/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { memo } from 'react';
import { Maximize2 } from 'lucide-react';
import { DraggableItem } from './DraggableItem';
import { SvgTextBox } from './SvgTextBox';
import type { Pt } from '../types/lienzo.types';
import {
    isEditablePolygon,
    isStrokeType,
    buildStrokePathD,
    ptsToString
} from '../Utils/lienzo.geometry';

type Props = {
    model: any;
    svgId?: string;
};

const SvgFilters = memo(({ elementos, tiposConSaturacion }: { elementos: any[], tiposConSaturacion: Set<string> }) => {
    return (
        <defs>
            {elementos
                .filter((el) => {
                    const sat = Number(el.saturation);
                    return tiposConSaturacion?.has?.(el.type) && Number.isFinite(sat) && sat !== 1;
                })
                .map((el) => (
                    <filter key={`sat-${el.id}`} id={`sat-${el.id}`}>
                        <feColorMatrix type="saturate" values={`${el.saturation}`} />
                    </filter>
                ))}
            <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
            >
                <path d="M 0 0 L 9 3 L 0 6 z" fill="currentColor" />
            </marker>
        </defs>
    );
});

export const CanvasStage: React.FC<Props> = memo(({ model, svgId = 'lienzo-svg' }) => {
    const {
        elementos,
        canvasSize,
        setCanvasSize,
        herramientaActiva,
        modoPuntos,
        limpiarSeleccion,
        svgRef,
        manejarClickLienzo,
        iniciarDibujo,
        onSvgMouseMove,
        onSvgMouseUp,
        seleccionarElementoCanvas,
        alArrastrando,
        actualizarAtributo,
        redimensionarElemento,
        startDragPoint,
        seleccionadoId,
        seleccionadosIds,
        tiposConSaturacion,
        modoSeleccionActivo
    } = model;

    const handleCanvasResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        const startX = e.clientX, startY = e.clientY;
        const startW = canvasSize.w, startH = canvasSize.h;

        const onMove = (m: MouseEvent) => {
            setCanvasSize({
                w: Math.max(100, startW + (m.clientX - startX)),
                h: Math.max(100, startH + (m.clientY - startY))
            });
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    if (!canvasSize) return null;

    return (
        <main
            className="flex-1 overflow-auto bg-transparent flex items-center justify-center p-12"
            onClick={(e) => e.target === e.currentTarget && limpiarSeleccion()}
        >
            <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300">
                <div
                    id="canvas-white-sheet"
                    className="bg-white rounded-sm overflow-hidden"
                    style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }}
                    onClick={(e) => e.target === e.currentTarget && limpiarSeleccion()}
                >
                    <svg
                        id={svgId}
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !herramientaActiva && !modoPuntos) {
                                limpiarSeleccion();
                            }
                            manejarClickLienzo(e);
                        }}
                        onMouseDown={iniciarDibujo}
                        onMouseMove={onSvgMouseMove}
                        onMouseUp={onSvgMouseUp}
                        onMouseLeave={onSvgMouseUp}
                        className={herramientaActiva ? 'cursor-crosshair' : 'cursor-default'}
                    >
                        <SvgFilters elementos={elementos} tiposConSaturacion={tiposConSaturacion} />

                        {elementos.map((el: any) => {
                            const isSelected = seleccionadosIds.includes(el.id);
                            const satFilter = (tiposConSaturacion?.has?.(el.type) && Number(el.saturation) !== 1) ? `url(#sat-${el.id})` : undefined;

                            return (
                                <DraggableItem
                                    key={el.id}
                                    el={el}
                                    estaSeleccionado={isSelected}
                                    alSeleccionarCanvas={seleccionarElementoCanvas}
                                    alArrastrando={alArrastrando}
                                    alTerminarArrastre={(id, x, y) => actualizarAtributo(id, { x, y })}
                                    alRedimensionar={(id, w, h) => redimensionarElemento(id, w, h)}
                                    puedeInteractuar={modoSeleccionActivo}
                                >
                                    {isEditablePolygon(el.type) && el.pointsArr && (
                                        <>
                                            <polygon
                                                points={ptsToString(el.pointsArr)}
                                                fill={el.fill || '#000'}
                                                filter={satFilter}
                                            />
                                            {modoPuntos && seleccionadoId === el.id && (
                                                <g data-editor="1">
                                                    {el.pointsArr.map((p: Pt, idx: number) => (
                                                        <g key={`${el.id}-p-${idx}`}>
                                                            <circle
                                                                cx={p.x} cy={p.y} r={9}
                                                                fill="white" stroke="#2563eb" strokeWidth={2}
                                                                className="cursor-grab"
                                                                onMouseDown={(ev) => startDragPoint(ev, el.id, idx)}
                                                            />
                                                            <circle cx={p.x} cy={p.y} r={3} fill="#2563eb" pointerEvents="none" />
                                                        </g>
                                                    ))}
                                                </g>
                                            )}
                                        </>
                                    )}

                                    {isStrokeType(el.type) && (
                                        <path
                                            d={buildStrokePathD(el)}
                                            stroke={el.stroke || el.fill || '#000'}
                                            strokeWidth={el.strokeWidth || 3}
                                            fill="none"
                                            strokeLinecap="round"
                                            markerEnd={el.type === 'flecha' ? 'url(#arrowhead)' : undefined}
                                        />
                                    )}

                                    {el.type === 'imagen' && (
                                        <image
                                            href={el.url}
                                            width={el.width}
                                            height={el.height}
                                            preserveAspectRatio="none"
                                            filter={satFilter}
                                        />
                                    )}

                                    {el.type === 'texto' && <SvgTextBox el={el} svgId={svgId} />}
                                </DraggableItem>
                            );
                        })}
                    </svg>
                </div>

                <div
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize flex items-center justify-center text-blue-500 shadow-md z-10"
                    onMouseDown={handleCanvasResize}
                >
                    <Maximize2 size={12} />
                </div>
            </div>
        </main>
    );
});