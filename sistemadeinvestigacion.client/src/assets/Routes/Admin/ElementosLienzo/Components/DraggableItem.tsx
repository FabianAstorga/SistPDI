import React, { useRef, useEffect } from 'react';

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

export const DraggableItem: React.FC<Props> = ({
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

    // --- RESIZE
    const iniciarResize = (e: any, corner: string) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = el.width || 100;
        const startH = el.height || 100;
        const startPosX = el.x || 0;
        const startPosY = el.y || 0;

        const onMouseMove = (moveEvent: any) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            let newW = startW;
            let newH = startH;
            let newX = startPosX;
            let newY = startPosY;

            const MIN_SIZE = 10;

            if (corner.includes('e')) newW = Math.max(MIN_SIZE, startW + deltaX);
            if (corner.includes('s')) newH = Math.max(MIN_SIZE, startH + deltaY);

            if (corner.includes('w')) {
                newW = Math.max(MIN_SIZE, startW - deltaX);
                if (newW > MIN_SIZE) newX = startPosX + deltaX;
            }

            if (corner.includes('n')) {
                newH = Math.max(MIN_SIZE, startH - deltaY);
                if (newH > MIN_SIZE) newY = startPosY + deltaY;
            }

            alRedimensionar(el.id, newW, newH);
            alTerminarArrastre(el.id, newX, newY);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // --- DRAG SVG nativo
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
            alArrastrando(el.id, dx, dy);
        };

        const onUp = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            lastRef.current = null;
            alTerminarArrastre(el.id, el.x || 0, el.y || 0);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('blur', onUp);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('blur', onUp);
        };
    }, [el.id, el.x, el.y, alArrastrando, alTerminarArrastre]);

    const w = el.width || 0;
    const h = el.height || 0;

    return (
        <g
            transform={`translate(${el.x || 0}, ${el.y || 0})`}
            onMouseDown={onMouseDownDrag}
            style={{ cursor: puedeInteractuar ? 'move' : 'default' }}
        >
            {/* ✅ Editor-only UI (NO debe exportarse) */}
            {estaSeleccionado && el.type !== 'lapiz' && (
                <g data-editor="1">
                    <rect
                        data-editor="1"
                        x={-6}
                        y={-6}
                        width={w + 12}
                        height={h + 12}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="4"
                    />
                    {['nw', 'ne', 'sw', 'se'].map((corner) => (
                        <circle
                            data-editor="1"
                            key={corner}
                            cx={corner.includes('e') ? w : 0}
                            cy={corner.includes('s') ? h : 0}
                            r={10}
                            fill="white"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            className={`cursor-${corner}-resize`}
                            onMouseDown={(e) => iniciarResize(e, corner)}
                        />
                    ))}
                </g>
            )}

            <g
                transform={`translate(${w / 2}, ${h / 2}) scale(${el.flipX ? -1 : 1}, 1) rotate(${el.rotation || 0}) translate(${-w / 2}, ${-h / 2})`}
                onClick={(e) => {
                    if (!puedeInteractuar) return;
                    e.stopPropagation();
                    alSeleccionarCanvas(el.id);
                }}
            >
                {children}
            </g>
        </g>
    );
};
