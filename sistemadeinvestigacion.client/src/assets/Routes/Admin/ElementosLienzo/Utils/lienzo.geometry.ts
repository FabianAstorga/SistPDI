import type { Pt } from '../types/lienzo.types';

export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export const clonePts = (pts: Pt[]) => pts.map((p) => ({ x: p.x, y: p.y }));

export const ptsToString = (pts: Pt[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

// ✅ ahora incluye rectangulo y circulo
export const isEditablePolygon = (type: string) =>
    ['rectangulo', 'circulo', 'triangulo', 'estrella', 'rombo', 'hexagono', 'octagono'].includes(type);

export const getBasePolygonPoints = (type: string, w: number, h: number): Pt[] => {
    const W = w || 120;
    const H = h || 120;

    // ✅ RECT como polígono editable
    if (type === 'rectangulo') {
        return [
            { x: 0, y: 0 },
            { x: W, y: 0 },
            { x: W, y: H },
            { x: 0, y: H }
        ];
    }

    // ✅ CIRCULO como polígono editable (aprox)
    if (type === 'circulo') {
        const n = 24; // sube a 32/48 si quieres más redondo
        const cx = W / 2;
        const cy = H / 2;
        const rx = W / 2;
        const ry = H / 2;

        const pts: Pt[] = [];
        for (let i = 0; i < n; i++) {
            const t = (i / n) * Math.PI * 2;
            pts.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry });
        }
        return pts;
    }

    if (type === 'triangulo')
        return [
            { x: W / 2, y: 0 },
            { x: 0, y: H },
            { x: W, y: H }
        ];

    if (type === 'rombo')
        return [
            { x: W / 2, y: 0 },
            { x: W, y: H / 2 },
            { x: W / 2, y: H },
            { x: 0, y: H / 2 }
        ];

    if (type === 'hexagono') {
        const x0 = W * 0.25,
            x1 = W * 0.75;
        const y0 = 0,
            y1 = H * 0.5,
            y2 = H;
        return [
            { x: x0, y: y0 },
            { x: x1, y: y0 },
            { x: W, y: y1 },
            { x: x1, y: y2 },
            { x: x0, y: y2 },
            { x: 0, y: y1 }
        ];
    }

    if (type === 'octagono') {
        const c = Math.min(W, H) * 0.22;
        return [
            { x: c, y: 0 },
            { x: W - c, y: 0 },
            { x: W, y: c },
            { x: W, y: H - c },
            { x: W - c, y: H },
            { x: c, y: H },
            { x: 0, y: H - c },
            { x: 0, y: c }
        ];
    }

    if (type === 'estrella') {
        // 10-point star
        return [
            { x: W / 2, y: 0 },
            { x: W * 0.6, y: H * 0.4 },
            { x: W, y: H * 0.4 },
            { x: W * 0.7, y: H * 0.6 },
            { x: W * 0.8, y: H },
            { x: W / 2, y: H * 0.75 },
            { x: W * 0.2, y: H },
            { x: W * 0.3, y: H * 0.6 },
            { x: 0, y: H * 0.4 },
            { x: W * 0.4, y: H * 0.4 }
        ];
    }

    return [];
};

export const svgPointFromMouse = (svgEl: SVGSVGElement, clientX: number, clientY: number) => {
    const pt = svgEl.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
};

export const applyInverseElTransformToPoint = (pWorld: Pt, el: any): Pt => {
    const w = el.width || 120;
    const h = el.height || 120;
    const cx = (el.x || 0) + w / 2;
    const cy = (el.y || 0) + h / 2;

    // move to center
    let x = pWorld.x - cx;
    let y = pWorld.y - cy;

    // inverse rotation
    const ang = -((el.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const xr = x * cos - y * sin;
    const yr = x * sin + y * cos;
    x = xr;
    y = yr;

    // inverse flipX (scale(-1,1) about center)
    if (el.flipX) x = -x;

    // back to local top-left
    return { x: x + w / 2, y: y + h / 2 };
};
