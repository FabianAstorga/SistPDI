import React, { useMemo, memo } from 'react';
import { wrapTextToLines } from '../Utils/lienzo.text';

type Props = {
    el: any;
    svgId?: string;
};

/**
 * Componente SvgTextBox optimizado: 
 * Se elimina el envoltorio <g> para evitar anidaciones y duplicidad de metadatos.
 * Ahora el contenido se renderiza directamente dentro del DraggableItem.
 */
export const SvgTextBox: React.FC<Props> = memo(({ el }) => {
    // 1. Cálculos de dimensiones y tipografía
    const w = Number(el.width ?? 250);
    const h = Number(el.height ?? 100);
    const fontSize = Number(el.fontSize ?? 16);
    const pad = 10;
    const lineHeight = Math.round(fontSize * 1.2);

    // 2. Procesamiento de líneas (Word Wrap)
    // Se utiliza directamente el texto inyectado en el estado por el Parser
    const lines = useMemo(() => {
        return wrapTextToLines({
            text: el.text || '...',
            maxWidthPx: w - (pad * 2),
            fontSize,
            fontFamily: el.fontFamily || 'Arial',
            fontWeight: el.fontWeight || '400'
        });
    }, [el.text, w, fontSize, el.fontFamily, el.fontWeight]);

    return (
        /* Se usa un Fragment para inyectar los elementos directamente al DOM del padre */
        <>
            {/* Área reactiva para eventos del mouse */}
            <rect
                width={w}
                height={h}
                fill="transparent"
                pointerEvents="all"
            />

            <text
                x={pad}
                y={pad}
                fill={el.fill || '#000000'}
                fontFamily={el.fontFamily || 'Arial'}
                fontSize={fontSize}
                fontWeight={el.fontWeight || '400'}
                dominantBaseline="central"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
                {lines.map((line, i) => (
                    <tspan
                        key={`${el.id}-line-${i}`}
                        x={pad}
                        dy={i === 0 ? "1.2em" : `${lineHeight}px`}
                    >
                        {line}
                    </tspan>
                ))}
            </text>
        </>
    );
});