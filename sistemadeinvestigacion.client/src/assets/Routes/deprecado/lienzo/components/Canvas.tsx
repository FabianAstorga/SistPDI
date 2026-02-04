import React from 'react';
import { type Elemento } from '../types';
import { DraggableItem } from './DraggableItem';

interface CanvasProps {
    elementos: Elemento[];
    seleccionadoId: number | null;
    setSeleccionadoId: (id: number | null) => void;
    actualizarAtributo: (id: number, cambios: Partial<Elemento>) => void;
    redimensionarElemento: (id: number, width: number, height: number) => void;
    canvasSize: { w: number; h: number };
}

export const Canvas = ({
    elementos,
    seleccionadoId,
    setSeleccionadoId,
    actualizarAtributo,
    redimensionarElemento,
    canvasSize
}: CanvasProps) => {

    const handleDrag = (id: number, dx: number, dy: number) => {
        const el = elementos.find(item => item.id === id);
        if (el) {
            actualizarAtributo(id, { x: el.x + dx, y: el.y + dy });
        }
    };

    return (
        <svg
            viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
            width={canvasSize.w}
            height={canvasSize.h}
            className="bg-white rounded-sm shadow-inner overflow-visible"
            // Solo deselecciona si el click es directamente en el fondo del SVG
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    setSeleccionadoId(null);
                }
            }}
        >
            {elementos.map((el) => (
                <DraggableItem
                    key={el.id}
                    el={el}
                    isSelected={el.id === seleccionadoId}
                    onSelect={setSeleccionadoId}
                    onDrag={handleDrag}
                    onStop={(id, x, y) => actualizarAtributo(id, { x, y })}
                    onResize={redimensionarElemento}
                >
                    {/* RENDERIZADO DE TEXTO */}
                    {el.type === 'texto' && (
                        <foreignObject
                            width={el.width || 400}
                            height={el.height || 200}
                            className="overflow-visible pointer-events-none"
                        >
                            <div
                                style={{
                                    color: el.fill,
                                    fontSize: `${el.fontSize}px`,
                                    fontWeight: el.fontWeight,
                                    fontFamily: el.fontFamily || 'Arial, sans-serif',
                                    lineHeight: '1.2',
                                    userSelect: 'none',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {el.text}
                            </div>
                        </foreignObject>
                    )}

                    {/* RENDERIZADO DE RECTÁNGULO */}
                    {el.type === 'rectangulo' && (
                        <rect
                            width={el.width || 100}
                            height={el.height || 100}
                            fill={el.fill}
                            rx={4}
                        />
                    )}

                    {/* RENDERIZADO DE CÍRCULO */}
                    {el.type === 'circulo' && (
                        <ellipse
                            cx={(el.width || 100) / 2}
                            cy={(el.height || 100) / 2}
                            rx={(el.width || 100) / 2}
                            ry={(el.height || 100) / 2}
                            fill={el.fill}
                        />
                    )}

                    {/* RENDERIZADO DE HEXÁGONO */}
                    {el.type === 'hexagono' && (
                        <polygon
                            points="50,5 95,25 95,75 50,95 5,75 5,25"
                            fill={el.fill}
                            transform={`scale(${(el.width || 100) / 100}, ${(el.height || 100) / 100})`}
                        />
                    )}

                    {/* RENDERIZADO DE TRIÁNGULO */}
                    {el.type === 'triangulo' && (
                        <polygon
                            points="50,15 90,85 10,85"
                            fill={el.fill}
                            transform={`scale(${(el.width || 100) / 100}, ${(el.height || 100) / 100})`}
                        />
                    )}
                </DraggableItem>
            ))}
        </svg>
    );
};