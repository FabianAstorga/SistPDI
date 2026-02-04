// types.ts - Debe tener la palabra export en cada definición
export type TipoElemento = 'rectangulo' | 'circulo' | 'triangulo' | 'estrella' | 'rombo' | 'hexagono' | 'octagono' | 'imagen' | 'lapiz' | 'texto';

export interface Pt {
    x: number;
    y: number;
}

export interface Elemento {
    id: number;
    type: TipoElemento;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fill?: string;
    rotation?: number;
    flipX?: boolean;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    points?: string;
    strokeWidth?: number;
    pointsArr?: Pt[];
    url?: string;
    saturation?: number;
}