import React, { useRef, useEffect, memo, useCallback } from 'react';

type Props = {
    el: any;
    children: React.ReactNode;
    alTerminarArrastre: (id: number, x: number, y: number) => void;
    alArrastrando: (id: number, dx: number, dy: number) => void;
    alSeleccionarCanvas: (id: number) => void;
    estaSeleccionado: boolean;
    alRedimensionar: (id: number, w: number, h: number) => void;
    puedeInteractuar: boolean;
};

export const DraggableItem: React.FC<Props> = memo(({
    el,
    children,
    alTerminarArrastre,
    alArrastrando,
    alSeleccionarCanvas,
    estaSeleccionado,
    alRedimensionar,
    puedeInteractuar
}) => {
    const draggingRef = useRef(false);
    const lastRef = useRef<{ x: number; y: number } | null>(null);

    const alArrastrandoRef = useRef(alArrastrando);
    const alTerminarArrastreRef = useRef(alTerminarArrastre);

    useEffect(() => {
        alArrastrandoRef.current = alArrastrando;
        alTerminarArrastreRef.current = alTerminarArrastre;
    }, [alArrastrando, alTerminarArrastre]);

    const iniciarResize = useCallback((e: React.MouseEvent, corner: string) => {
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const startW = el.width || 100, startH = el.height || 100;
        const startPosX = el.x || 0, startPosY = el.y || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX, dy = moveEvent.clientY - startY;
            let nW = startW, nH = startH, nX = startPosX, nY = startPosY;

            if (corner.includes('e')) nW = Math.max(10, startW + dx);
            if (corner.includes('s')) nH = Math.max(10, startH + dy);
            if (corner.includes('w')) { nW = Math.max(10, startW - dx); if (nW > 10) nX = startPosX + dx; }
            if (corner.includes('n')) { nH = Math.max(10, startH - dy); if (nH > 10) nY = startPosY + dy; }

            alRedimensionar(el.id, nW, nH);
            alTerminarArrastreRef.current(el.id, nX, nY);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [el.id, el.width, el.height, el.x, el.y, alRedimensionar]);

    const onMouseDownDrag = (e: React.MouseEvent<SVGGElement>) => {
        if (!puedeInteractuar) return;
        e.stopPropagation();
        alSeleccionarCanvas(el.id);
        draggingRef.current = true;
        lastRef.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        const onMove = (ev: MouseEvent) => {
            if (!draggingRef.current || !lastRef.current) return;
            const dx = ev.clientX - lastRef.current.x;
            const dy = ev.clientY - lastRef.current.y;
            lastRef.current = { x: ev.clientX, y: ev.clientY };
            alArrastrandoRef.current(el.id, dx, dy);
        };

        const onUp = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            lastRef.current = null;
            alTerminarArrastreRef.current(el.id, el.x || 0, el.y || 0);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [el.id, el.x, el.y]);

    const w = el.width || 0, h = el.height || 0;

    return (
        <g
            className="draggable-group"
            onMouseDown={onMouseDownDrag}
            style={{ cursor: puedeInteractuar ? 'move' : 'default' }}
            // --- NIVEL ÚNICO DE METADATOS ---
            data-elid={el.id}
            data-type={el.type}
            data-name={el.name || `${el.type}_${el.id}`}
            data-template-key={el.templateKey || ''}
            data-x={el.x || 0}
            data-y={el.y || 0}
            data-width={w}
            data-height={h}
            data-rotation={el.rotation || 0}
            data-flipx={el.flipX ? 'true' : 'false'}
            data-points={el.pointsArr ? JSON.stringify(el.pointsArr) : undefined}
            // Transformación combinada para evitar anidación
            transform={`translate(${el.x || 0}, ${el.y || 0}) rotate(${el.rotation || 0}, ${w / 2}, ${h / 2}) scale(${el.flipX ? -1 : 1}, 1) translate(${el.flipX ? -w : 0}, 0)`}
        >
            {/* Contenido Visual Directo */}
            {children}

            {/* Guías de Edición */}
            {estaSeleccionado && puedeInteractuar && (
                <g data-editor="1">
                    <rect
                        x={-4} y={-4}
                        width={w + 8} height={h + 8}
                        fill="none" stroke="#2563eb" strokeWidth="1.5"
                        strokeDasharray="4 2" pointerEvents="none"
                    />
                    {['nw', 'ne', 'sw', 'se'].map((corner) => (
                        <circle
                            key={corner}
                            cx={corner.includes('e') ? w : 0}
                            cy={corner.includes('s') ? h : 0}
                            r={7} fill="white" stroke="#2563eb" strokeWidth="2"
                            className={`cursor-${corner}-resize hover:fill-blue-50`}
                            onMouseDown={(e) => iniciarResize(e, corner)}
                        />
                    ))}
                </g>
            )}
        </g>
    );
});