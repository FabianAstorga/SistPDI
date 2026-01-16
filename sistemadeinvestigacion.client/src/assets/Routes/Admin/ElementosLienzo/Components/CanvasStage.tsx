// Admin/ElementosLienzo/Components/CanvasStage.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { Maximize2 } from 'lucide-react';
import { DraggableItem } from './DraggableItem';
import type { Pt } from '../types/lienzo.types';
import { getBasePolygonPoints, isEditablePolygon, ptsToString } from '../Utils/lienzo.geometry';

type Props = {
    model: any;
};

export const CanvasStage: React.FC<Props> = ({ model }) => {
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

    // ---- debug (solo en DEV): logea cambios reales sin spamear cada render
    const prevCountRef = useRef<number>(-1);
    const prevTypesRef = useRef<string>('');
    useEffect(() => {
        const count = Array.isArray(elementos) ? elementos.length : 0;
        const types = Array.isArray(elementos) ? elementos.map((e: any) => e?.type).join(',') : '';
        if (count !== prevCountRef.current || types !== prevTypesRef.current) {
            // eslint-disable-next-line no-console
            console.log('[CanvasStage] elementos:', count, 'types:', Array.isArray(elementos) ? elementos.map((e: any) => e?.type) : []);
            prevCountRef.current = count;
            prevTypesRef.current = types;
        }
    }, [elementos]);

    if (!canvasSize) {
        console.error('CanvasStage: canvasSize llegó undefined. model recibido:', model);
        return null;
    }

    const cursorClass = herramientaActiva ? 'cursor-crosshair' : 'cursor-default';

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
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        onClick={manejarClickLienzo}
                        onMouseDown={iniciarDibujo}
                        onMouseMove={onSvgMouseMove}
                        onMouseUp={onSvgMouseUp}
                        onMouseLeave={onSvgMouseUp}
                        className={cursorClass}
                    >
                        <defs>
                            {Array.isArray(elementos) &&
                                elementos
                                    .filter((el: any) => {
                                        const sat = Number(el?.saturation);
                                        return tiposConSaturacion?.has?.(el?.type) && Number.isFinite(sat) && sat !== 1;
                                    })
                                    .map((el: any) => {
                                        const sat = Number(el?.saturation);
                                        return (
                                            <filter key={`sat-${el.id}`} id={`sat-${el.id}`}>
                                                <feColorMatrix type="saturate" values={`${sat}`} />
                                            </filter>
                                        );
                                    })}
                        </defs>

                        {Array.isArray(elementos) &&
                            elementos.map((el: any) => {
                                const isSelected = Array.isArray(seleccionadosIds) && seleccionadosIds.includes(el.id);

                                const sat = Number(el?.saturation);
                                const aplicaSat = tiposConSaturacion?.has?.(el?.type) && Number.isFinite(sat) && sat !== 1;
                                const satFilter = aplicaSat ? `url(#sat-${el.id})` : undefined;

                                // ✅ Unifica lógica: si tiene pointsArr -> se dibuja como polygon (rect/círculo incluidos)
                                const hasPtsArr = Array.isArray(el.pointsArr) && el.pointsArr.length >= 3;
                                const isPoly = isEditablePolygon(el.type);
                                const pts: Pt[] = hasPtsArr
                                    ? el.pointsArr
                                    : isPoly
                                        ? getBasePolygonPoints(el.type, el.width || 120, el.height || 120)
                                        : [];

                                const renderAsPolygon = isPoly && pts.length >= 3;

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
                                        {/* ✅ POLYGON (con handles) */}
                                        {renderAsPolygon && (
                                            <>
                                                <polygon
                                                    data-elid={el.id}
                                                    points={ptsToString(pts)}
                                                    fill={el.fill || '#000'}
                                                    filter={satFilter}
                                                />

                                                {modoPuntos && seleccionadoId === el.id && (
                                                    <g>
                                                        {pts.map((p: Pt, idx: number) => (
                                                            <g key={`${el.id}-h-${idx}`}>
                                                                <circle
                                                                    cx={p.x}
                                                                    cy={p.y}
                                                                    r={9}
                                                                    fill="white"
                                                                    stroke="#2563eb"
                                                                    strokeWidth={2}
                                                                    style={{ cursor: 'grab' }}
                                                                    onMouseDown={(ev) => startDragPoint(ev, el.id, idx)}
                                                                />
                                                                <circle cx={p.x} cy={p.y} r={3} fill="#2563eb" pointerEvents="none" />
                                                            </g>
                                                        ))}
                                                    </g>
                                                )}
                                            </>
                                        )}

                                        {/* ✅ RECT normal: solo si NO se está dibujando como polygon */}
                                        {!renderAsPolygon && el.type === 'rectangulo' && (
                                            <rect
                                                data-elid={el.id}
                                                width={el.width || 100}
                                                height={el.height || 100}
                                                fill={el.fill || '#000'}
                                                rx="2"
                                                filter={satFilter}
                                            />
                                        )}

                                        {/* ✅ CIRCLE normal: solo si NO se está dibujando como polygon */}
                                        {!renderAsPolygon && el.type === 'circulo' && (
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

                                        {/* IMAGE */}
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

                                        {/* PEN */}
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

                                        {/* TEXT */}
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

                {/* RESIZE CANVAS HANDLE */}
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
