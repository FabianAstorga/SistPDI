import React, { useMemo, memo } from 'react';

type Props = {
    el: any;
    svgId?: string;
};

// 1. Extraemos la lógica de procesamiento de texto fuera del componente.
// Al ser una función pura, no consume recursos del ciclo de vida de React.
const wrapText = (text: string, maxCharsPerLine: number): string[] => {
    if (!text) return [];
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const w of words) {
        const next = current ? `${current} ${w}` : w;
        if (next.length <= maxCharsPerLine) {
            current = next;
        } else {
            if (current) lines.push(current);
            current = w.length > maxCharsPerLine ? w.slice(0, maxCharsPerLine) : w;
        }
    }
    if (current) lines.push(current);
    return lines;
};

// 2. Usamos memo para que el texto solo se recalcule si cambia su contenido, 
// tamaño o la caja que lo contiene.
export const SvgTextBox: React.FC<Props> = memo(({ el, svgId = 'lienzo-svg' }) => {
    // Valores calculados con defaults seguros
    const w = Number(el.width ?? 200);
    const h = Number(el.height ?? 80);
    const fontSize = Number(el.fontSize ?? 16);
    const fontFamily = el.fontFamily ?? 'Arial';
    const fontWeight = el.fontWeight ?? '700';
    const fill = el.fill ?? '#000';

    const pad = 10;
    const lineHeight = Math.round(fontSize * 1.25);

    // 3. Optimizamos el cálculo de caracteres máximos
    const maxChars = useMemo(() => {
        return Math.max(5, Math.floor((w - pad * 2) / (fontSize * 0.6)));
    }, [w, fontSize]);

    // 4. El wrapText solo se ejecuta si el texto o el ancho de la caja cambian
    const lines = useMemo(() => {
        return wrapText(String(el.text ?? ''), maxChars);
    }, [el.text, maxChars]);

    // ID único persistente para el clipPath
    const clipId = useMemo(() => `clip-txt-${svgId}-${el.id}`, [svgId, el.id]);

    return (
        <g data-elid={el.id}>
            {/* HITBOX: Optimizada para no tener opacidad innecesaria si es transparente */}
            <rect
                data-elid={el.id}
                width={w}
                height={h}
                fill="none"
                pointerEvents="all"
            />

            <defs>
                <clipPath id={clipId}>
                    <rect x="0" y="-20" width={w} height={h+20} />
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
                pointerEvents="visiblePainted"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
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
        </g>
    );
});