import React, { useMemo, memo } from 'react';
import { wrapTextToLines, estimateCharWidthPx } from '../Utils/lienzo.text';

type Props = {
    el: any;
    svgId?: string;
};

export const SvgTextBox: React.FC<Props> = memo(({ el }) => {
    // 1. Mantenemos el fontSize y el padding
    const fontSize = Number(el.fontSize ?? 16);
    const pad = 10;
    const lineHeight = Math.round(fontSize * 1.2);
    const fontFamily = el.fontFamily || 'Arial';
    const fontWeight = el.fontWeight || '400';

    // 2. Generamos las líneas primero para saber cuántas hay y qué tan largas son
    const lines = useMemo(() => {
        return wrapTextToLines({
            text: el.text || '...',
            // Usamos el width actual del elemento como límite máximo para el wrap
            maxWidthPx: Number(el.width ?? 250) - (pad * 2),
            fontSize,
            fontFamily,
            fontWeight
        });
    }, [el.text, el.width, fontSize, fontFamily, fontWeight]);

    // 3. CÁLCULO DINÁMICO DEL ANCHO REAL (Ajuste lateral)
    // Buscamos la línea con más caracteres para ajustar la caja a ese ancho exacto
    const maxLineWidth = useMemo(() => {
        const charW = estimateCharWidthPx(fontSize, fontFamily, fontWeight);
        const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
        // El ancho real es: (caracteres * ancho estimado) + márgenes
        return (longestLine * charW) + (pad * 2);
    }, [lines, fontSize, fontFamily, fontWeight]);

    // 4. CÁLCULO DINÁMICO DEL ALTO REAL (Ajuste inferior)
    const contentHeight = (lines.length * lineHeight) + (pad * 2);

    // Usamos el ancho calculado (maxLineWidth) para el rect de fondo, 
    // así la bounding box se ajusta lateralmente.
    const finalW = maxLineWidth;
    const finalH = contentHeight;

    return (
        <>
            {/* Rectángulo ajustado al contenido real */}
            <rect
                width={finalW}
                height={finalH}
                fill="transparent"
                pointerEvents="all"
            />

            <text
                x={pad}
                y={pad}
                fill={el.fill || '#000000'}
                fontFamily={fontFamily}
                fontSize={fontSize}
                fontWeight={fontWeight}
                dominantBaseline="hanging"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
                {lines.map((line, i) => (
                    <tspan
                        key={`${el.id}-line-${i}`}
                        x={pad}
                        dy={i === 0 ? 0 : lineHeight}
                    >
                        {line}
                    </tspan>
                ))}
            </text>
        </>
    );
});