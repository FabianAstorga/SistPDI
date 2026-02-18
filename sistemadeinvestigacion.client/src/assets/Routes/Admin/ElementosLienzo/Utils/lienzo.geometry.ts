import type { Pt } from '../types/lienzo.types';

export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export const clonePts = (pts: Pt[]) => pts.map((p) => ({ x: p.x, y: p.y }));
export const ptsToString = (pts: Pt[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

export const isEditablePolygon = (type: string) =>
    ['rectangulo', 'circulo', 'triangulo', 'estrella', 'rombo', 'hexagono', 'octagono'].includes(type);

export const isStrokeType = (type: string) => ['linea', 'flecha', 'curva'].includes(type);

export const isEditableByPoints = (el: any) => Array.isArray(el?.pointsArr) && el.pointsArr.length >= 2;

export const getBasePolygonPoints = (type: string, w: number, h: number): Pt[] => {
    const W = w || 120;
    const H = h || 120;

    if (type === 'rectangulo') {
        return [
            { x: 0, y: 0 },
            { x: W, y: 0 },
            { x: W, y: H },
            { x: 0, y: H }
        ];
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

    if (type === 'circulo') {
        const pts: Pt[] = [];
        const res = 32;
        const rx = W / 2;
        const ry = H / 2;
        for (let i = 0; i < res; i++) {
            const ang = (i / res) * Math.PI * 2;
            pts.push({
                x: rx + rx * Math.cos(ang),
                y: ry + ry * Math.sin(ang)
            });
        }
        return pts;
    }

    if (type === 'hexagono') {
        const x0 = W * 0.25, x1 = W * 0.75;
        const y0 = 0, y1 = H * 0.5, y2 = H;
        return [
            { x: x0, y: y0 }, { x: x1, y: y0 },
            { x: W, y: y1 }, { x: x1, y: y2 },
            { x: x0, y: y2 }, { x: 0, y: y1 }
        ];
    }

    if (type === 'octagono') {
        const c = Math.min(W, H) * 0.22;
        return [
            { x: c, y: 0 }, { x: W - c, y: 0 },
            { x: W, y: c }, { x: W, y: H - c },
            { x: W - c, y: H }, { x: c, y: H },
            { x: 0, y: H - c }, { x: 0, y: c }
        ];
    }

    if (type === 'estrella') {
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

    let x = pWorld.x - cx;
    let y = pWorld.y - cy;

    const ang = -((el.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);

    const xr = x * cos - y * sin;
    const yr = x * sin + y * cos;

    x = xr;
    y = yr;

    if (el.flipX) x = -x;

    return { x: x + w / 2, y: y + h / 2 };
};


export const bboxFromPts = (pts: Pt[]) => {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const p of pts) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }

    if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    return { minX, minY, maxX, maxY };
};

export const normalizePtsToLocal = (ptsWorld: Pt[]) => {
    const { minX, minY, maxX, maxY } = bboxFromPts(ptsWorld);
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const ptsLocal = ptsWorld.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    return { x: minX, y: minY, w, h, ptsLocal };
};

export const buildStrokePathD = (el: any) => {
    const pts: Pt[] = Array.isArray(el?.pointsArr) ? el.pointsArr : [];
    if (el.type === 'linea' || el.type === 'flecha') {
        if (pts.length < 2) return '';
        return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
    }
    if (el.type === 'curva') {
        if (pts.length < 3) return '';
        return `M ${pts[0].x} ${pts[0].y} Q ${pts[1].x} ${pts[1].y} ${pts[2].x} ${pts[2].y}`;
    }
    return '';
};