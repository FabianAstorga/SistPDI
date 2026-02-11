// Utils/lienzo.text.ts
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/**
 * Normaliza los saltos de línea para evitar caracteres invisibles que rompan el XML del SVG.
 */
export function sanitizeText(raw: any) {
    return String(raw ?? '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
}

/**
 * Estima el ancho en píxeles de un carácter promedio según la fuente y su peso.
 */
export function estimateCharWidthPx(fontSize: number, fontFamily: string, fontWeight: number | string) {
    const base = 0.55; // Factor base para fuentes proporcionales (Arial, Helvetica)
    const isBold = String(fontWeight) === '700' || String(fontWeight).toLowerCase() === 'bold';
    const weightFactor = isBold ? 1.1 : 1.0;
    return fontSize * base * weightFactor;
}

/**
 * Procesa el texto para ajustarlo al ancho del Bounding Box del grupo.
 * Soporta saltos de línea manuales (\n) y ajuste automático (soft wrap).
 */
export function wrapTextToLines(opts: {
    text: string;
    maxWidthPx: number;
    fontSize: number;
    fontFamily: string;
    fontWeight?: number | string;
}) {
    const {
        text,
        maxWidthPx,
        fontSize,
        fontFamily,
        fontWeight = 700
    } = opts;

    const clean = sanitizeText(text);
    const hardLines = clean.split('\n');
    const charW = estimateCharWidthPx(fontSize, fontFamily, fontWeight);

    // Calculamos el límite de caracteres basado en el ancho actual del grupo
    const maxChars = Math.max(1, Math.floor(maxWidthPx / Math.max(1, charW)));
    const lines: string[] = [];

    for (const hl of hardLines) {
        const words = hl.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            lines.push('');
            continue;
        }

        let cur = '';
        for (const w of words) {
            if (!cur) {
                cur = w;
                continue;
            }
            // Si la palabra cabe en la línea actual
            if ((cur.length + 1 + w.length) <= maxChars) {
                cur += ' ' + w;
            } else {
                // Si no cabe, cerramos línea y empezamos una nueva
                lines.push(cur);
                cur = w;
            }
        }
        if (cur) lines.push(cur);
    }
    return lines;
}