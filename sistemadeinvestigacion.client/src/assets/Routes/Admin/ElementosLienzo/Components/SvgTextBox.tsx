import React, { useMemo, memo } from 'react';
import { wrapTextToLines, estimateCharWidthPx } from '../Utils/lienzo.text';

type Props = {
    el: any;
    svgId?: string;
};

export const SvgTextBox: React.FC<Props> = memo(({ el }) => {
    const fontSize = Number(el.fontSize ?? 16);
    const pad = 10;
    const lineHeight = Math.round(fontSize * 1.2);
    const fontFamily = el.fontFamily || 'Arial';
    const fontWeight = el.fontWeight || '400';

    const lines = useMemo(() => {
        return wrapTextToLines({
            text: el.text || '...',
            maxWidthPx: Number(el.width ?? 250) - (pad * 2),
            fontSize,
            fontFamily,
            fontWeight
        });
    }, [el.text, el.width, fontSize, fontFamily, fontWeight]);

    const maxLineWidth = useMemo(() => {
        const charW = estimateCharWidthPx(fontSize, fontFamily, fontWeight);
        const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
        return (longestLine * charW) + (pad * 2);
    }, [lines, fontSize, fontFamily, fontWeight]);

    const contentHeight = (lines.length * lineHeight) + (pad * 2);
    const finalW = maxLineWidth;
    const finalH = contentHeight;

    return (
        <>
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