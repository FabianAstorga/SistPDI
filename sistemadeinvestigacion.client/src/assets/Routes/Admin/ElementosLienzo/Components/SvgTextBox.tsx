import React, { useMemo } from 'react';

type Props = {
    el: any;
    svgId?: string;
};

function wrapText(text: string, maxCharsPerLine: number) {
    const words = (text || '').split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const w of words) {
        const next = current ? `${current} ${w}` : w;
        if (next.length <= maxCharsPerLine) {
            current = next;
        } else {
            if (current) lines.push(current);
            // palabra muy larga: córtala igual
            current = w.length > maxCharsPerLine ? w.slice(0, maxCharsPerLine) : w;
        }
    }
    if (current) lines.push(current);
    return lines;
}

export const SvgTextBox: React.FC<Props> = ({ el, svgId = 'lienzo-svg' }) => {
    const w = Number(el.width ?? 200);
    const h = Number(el.height ?? 80);

    const fontSize = Number(el.fontSize ?? 16);
    const fontFamily = el.fontFamily ?? 'Arial';
    const fontWeight = el.fontWeight ?? '700';
    const fill = el.fill ?? '#000';

    // padding “visual” dentro de la caja
    const pad = 2;
    const lineHeight = Math.round(fontSize * 1.25);

    // aproximación simple: caracteres por línea según ancho
    // (si quieres precisión real, habría que medir con <textLength> o canvas)
    const maxChars = Math.max(5, Math.floor((w - pad * 2) / (fontSize * 0.6)));

    const lines = useMemo(() => wrapText(String(el.text ?? ''), maxChars), [el.text, maxChars]);

    // ✅ ID único (evita colisiones si exportas/pegas/varios SVG)
    const clipId = `clip-txt-${svgId}-${el.id}`;

    return (
        <g data-elid={el.id}>
            {/* ✅ HITBOX INVISIBLE:
          - captura mouse encima del texto
          - permite drag en DraggableItem (el onMouseDown está en el <g> padre) */}
            <rect
                data-elid={el.id}
                x={0}
                y={0}
                width={w}
                height={h}
                fill="transparent"
                opacity={0}
                pointerEvents="all"
            />

            <defs>
                <clipPath id={clipId}>
                    <rect x="0" y="0" width={w} height={h} />
                </clipPath>
            </defs>

            <text
                data-elid={el.id}
                x={pad}
                y={pad}
                fill={fill}
                fontFamily={fontFamily}
                fontSize={fontSize}
                fontWeight={fontWeight}
                dominantBaseline="hanging"
                clipPath={`url(#${clipId})`}
                // ✅ NO poner pointerEvents="none" aquí, o vuelves a perder el drag
                pointerEvents="visiblePainted"
            >
                {lines.map((line, i) => (
                    <tspan key={i} x={pad} dy={i === 0 ? 0 : lineHeight}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
};
