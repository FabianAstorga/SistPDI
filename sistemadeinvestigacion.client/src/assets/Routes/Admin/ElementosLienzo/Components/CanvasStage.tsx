import React from 'react';
import { Maximize2 } from 'lucide-react';
import { DraggableItem } from './DraggableItem';
import type { Pt } from '../types/lienzo.types';
import {
    getBasePolygonPoints,
    isEditablePolygon,
    isStrokeType,
    buildStrokePathD,
    ptsToString
} from '../Utils/lienzo.geometry';

type Props = {
    model: any;
    svgId?: string;
};

export const CanvasStage: React.FC<Props> = ({ model, svgId = 'lienzo-svg' }) => {
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

    if (!canvasSize) {
        console.error('CanvasStage: canvasSize llegó undefined. model recibido:', model);
        return null;
    }

    return (
        <main
            className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-12"
            onClick={() => {
                if (herramientaActiva === null && !modoPuntos) limpiarSeleccion();
            }}
        >
            <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300">
                <div
                    id="canvas-white-sheet"
                    className="bg-white rounded-sm overflow-hidden"
                    style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg
                        id={svgId}
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
                        onClick={manejarClickLienzo}
                        onMouseDown={iniciarDibujo}
                        onMouseMove={onSvgMouseMove}
                        onMouseUp={onSvgMouseUp}
                        onMouseLeave={onSvgMouseUp}
                        className={herramientaActiva ? 'cursor-crosshair' : 'cursor-default'}
                    >
                        <defs>
                            {elementos
                                .filter((el: any) => {
                                    const sat = Number(el.saturation);
                                    return tiposConSaturacion?.has?.(el.type) && Number.isFinite(sat) && sat !== 1;
                                })
                                .map((el: any) => {
                                    const sat = Number(el.saturation);
                                    return (
                                        <filter key={`sat-${el.id}`} id={`sat-${el.id}`}>
                                            <feColorMatrix type="saturate" values={`${sat}`} />
                                        </filter>
                                    );
                                })}

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

                        {elementos.map((el: any) => {
                            const isSelected = seleccionadosIds.includes(el.id);

                            const sat = Number(el.saturation);
                            const aplicaSat = tiposConSaturacion?.has?.(el.type) && Number.isFinite(sat) && sat !== 1;
                            const satFilter = aplicaSat ? `url(#sat-${el.id})` : undefined;

                            const polygonPts: Pt[] =
                                Array.isArray(el.pointsArr) && el.pointsArr.length >= 3
                                    ? el.pointsArr
                                    : isEditablePolygon(el.type)
                                        ? getBasePolygonPoints(el.type, el.width || 120, el.height || 120)
                                        : [];

                            const strokePts: Pt[] = Array.isArray(el.pointsArr) && el.pointsArr.length >= 2 ? el.pointsArr : [];

                            return (
                                <DraggableItem
                                    key={el.id}
                                    el={el}
                                    estaSeleccionado={isSelected}
                                    alSeleccionarCanvas={seleccionarElementoCanvas}
                                    alArrastrando={alArrastrando}
                                    alTerminarArrastre={(id: number, x: number, y: number) => actualizarAtributo(id, { x, y })}
                                    alRedimensionar={(id: number, width: number, height: number) => redimensionarElemento(id, width, height)}
                                    puedeInteractuar={modoSeleccionActivo}
                                >
                                    {isEditablePolygon(el.type) && polygonPts.length >= 3 && (
                                        <>
                                            <polygon
                                                data-elid={el.id}
                                                points={ptsToString(polygonPts)}
                                                fill={el.fill || '#000'}
                                                filter={satFilter}
                                            />

                                            {modoPuntos && seleccionadoId === el.id && (
                                                // ✅ editor-only overlay (se borra al exportar)
                                                <g data-editor="1">
                                                    {(Array.isArray(el.pointsArr) ? el.pointsArr : polygonPts).map((p: Pt, idx: number) => (
                                                        <g key={`${el.id}-h-${idx}`} data-editor="1">
                                                            <circle
                                                                cx={p.x}
                                                                cy={p.y}
                                                                r={9}
                                                                fill="white"
                                                                stroke="#2563eb"
                                                                strokeWidth={2}
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

                                    {el.type === 'rectangulo' && (
                                        <rect
                                            data-elid={el.id}
                                            width={el.width || 100}
                                            height={el.height || 100}
                                            fill={el.fill || '#000'}
                                            rx="2"
                                            filter={satFilter}
                                        />
                                    )}

                                    {el.type === 'circulo' && (
                                        <ellipse
                                            data-elid={el.id}
                                            cx={(el.width || 100) / 2}
                                            cy={(el.height || 100) / 2}
                                            rx={(el.width || 100) / 2}
                                            ry={(el.height || 100) / 2}
                                            fill={el.fill || '#000'}
                                            filter={satFilter}
                                        />
                                    )}

                                    {isStrokeType(el.type) && (
                                        <>
                                            <path
                                                data-elid={el.id}
                                                d={buildStrokePathD(el)}
                                                stroke={el.stroke || el.fill || '#000'}
                                                strokeWidth={el.strokeWidth || 3}
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                markerEnd={el.type === 'flecha' ? 'url(#arrowhead)' : undefined}
                                                style={{ color: el.stroke || el.fill || '#000' }}
                                            />

                                            {modoPuntos && seleccionadoId === el.id && strokePts.length >= 2 && (
                                                // ✅ editor-only overlay (se borra al exportar)
                                                <g data-editor="1">
                                                    {strokePts.map((p: Pt, idx: number) => (
                                                        <g key={`${el.id}-s-${idx}`} data-editor="1">
                                                            <circle
                                                                cx={p.x}
                                                                cy={p.y}
                                                                r={9}
                                                                fill="white"
                                                                stroke="#2563eb"
                                                                strokeWidth={2}
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

                                    {el.type === 'imagen' && (
                                        <image
                                            data-elid={el.id}
                                            href={el.url}
                                            width={el.width || 100}
                                            height={el.height || 100}
                                            preserveAspectRatio="none"
                                            filter={satFilter}
                                        />
                                    )}

                                    {el.type === 'lapiz' && (
                                        <path
                                            data-elid={el.id}
                                            d={el.points || ''}
                                            stroke={el.fill || '#000'}
                                            fill="none"
                                            strokeWidth={el.strokeWidth || 3}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    )}

                                    {el.type === 'texto' && (
                                        <foreignObject data-elid={el.id} width={el.width || 100} height={el.height || 100}>
                                            <div
                                                xmlns="http://www.w3.org/1999/xhtml"
                                                style={{
                                                    color: el.fill || '#000',
                                                    font: `bold ${el.fontSize || 16}px ${el.fontFamily || 'Arial'}`,
                                                    padding: '2px',
                                                    pointerEvents: 'none',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {el.text || ''}
                                            </div>
                                        </foreignObject>
                                    )}
                                </DraggableItem>
                            );
                        })}
                    </svg>
                </div>

                <div
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize flex items-center justify-center text-blue-500 hover:scale-110 shadow-md"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startW = canvasSize.w;
                        const startH = canvasSize.h;

                        const onMove = (m: MouseEvent) =>
                            setCanvasSize({ w: startW + (m.clientX - startX), h: startH + (m.clientY - startY) });

                        const onUp = () => {
                            document.removeEventListener('mousemove', onMove);
                            document.removeEventListener('mouseup', onUp);
                        };

                        document.addEventListener('mousemove', onMove);
                        document.addEventListener('mouseup', onUp);
                    }}
                >
                    <Maximize2 size={12} />
                </div>
            </div>
        </main>
    );
};
