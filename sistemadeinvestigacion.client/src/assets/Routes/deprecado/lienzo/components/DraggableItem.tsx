import React, { memo, useRef } from 'react';
import Draggable from 'react-draggable';
import type { Elemento } from '../types';
import { BoundingBox } from './BoundingBox';

interface DraggableItemProps {
    el: Elemento;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onDrag: (id: number, dx: number, dy: number) => void;
    onStop: (id: number, x: number, y: number) => void;
    onResize: (id: number, width: number, height: number) => void;
    children: React.ReactNode;
}

export const DraggableItem = memo(({ el, isSelected, onSelect, onDrag, onStop, onResize, children }: DraggableItemProps) => {
    const nodeRef = useRef(null);

    const iniciarResize = (e: React.MouseEvent, corner: string) => {
        // Bloqueamos la propagación para que el fondo no deseleccione el objeto
        e.stopPropagation();
        e.preventDefault();

        // Reforzamos la selección al tocar un tirador
        onSelect(el.id);

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = el.width || 100;
        const startH = el.height || 100;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            let newW = startW;
            let newH = startH;

            if (corner.includes('e')) newW = startW + deltaX;
            if (corner.includes('s')) newH = startH + deltaY;
            if (corner.includes('w')) newW = startW - deltaX;
            if (corner.includes('n')) newH = startH - deltaY;

            onResize(el.id, Math.max(20, newW), Math.max(20, newH));
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: el.x, y: el.y }}
            onStart={(e) => {
                e.stopPropagation(); // Evita conflictos con el fondo
                onSelect(el.id);
            }}
            onDrag={(_, data) => onDrag(el.id, data.deltaX, data.deltaY)}
            onStop={(_, data) => onStop(el.id, data.x, data.y)}
        >
            <g
                ref={nodeRef}
                style={{ cursor: 'move' }}
                onMouseDown={(e) => {
                    e.stopPropagation(); // Detiene el evento antes de llegar al SVG
                    onSelect(el.id);
                }}
            >
                <g transform={`rotate(${el.rotation || 0}, ${(el.width || 0) / 2}, ${(el.height || 0) / 2})`}>
                    {children}

                    {isSelected && (
                        <BoundingBox
                            width={el.width || 100}
                            height={el.height || 100}
                            onResizeStart={iniciarResize}
                        />
                    )}
                </g>
            </g>
        </Draggable>
    );
});