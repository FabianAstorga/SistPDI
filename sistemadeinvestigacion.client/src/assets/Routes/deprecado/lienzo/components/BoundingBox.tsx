// lienzo/components/BoundingBox.tsx
import React from 'react';

interface Props {
    width: number;
    height: number;
    onResizeStart: (e: React.MouseEvent, corner: string) => void;
}

export const BoundingBox = ({ width, height, onResizeStart }: Props) => {
    // Definimos las 4 esquinas para redimensionar
    const corners = [
        { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
        { id: 'ne', x: width, y: 0, cursor: 'nesw-resize' },
        { id: 'sw', x: 0, y: height, cursor: 'nesw-resize' },
        { id: 'se', x: width, y: height, cursor: 'nwse-resize' },
    ];

    return (
        <g className="pointer-events-none">
            {/* Marco principal */}
            <rect
                x={-4} y={-4}
                width={width + 8}
                height={height + 8}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="4"
            />
            {/* Tiradores de las esquinas */}
            {corners.map(c => (
                <circle
                    key={c.id}
                    cx={c.x}
                    cy={c.y}
                    r={5}
                    fill="white"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    style={{ cursor: c.cursor, pointerEvents: 'auto' }}
                    onMouseDown={(e) => onResizeStart(e, c.id)}
                />
            ))}
        </g>
    );
};