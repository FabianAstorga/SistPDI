import type React from 'react';
export type Herramienta =
    | null
    | 'multiseleccion'
    | 'goma'
    | 'lapiz'
    | 'texto'
    | 'rectangulo'
    | 'circulo'
    | 'triangulo'
    | 'estrella'
    | 'rombo'
    | 'hexagono'
    | 'octagono'
    | 'imagen';
export type TipoElemento =
    | 'rectangulo'
    | 'circulo'
    | 'triangulo'
    | 'estrella'
    | 'rombo'
    | 'hexagono'
    | 'octagono'
    | 'texto'
    | 'lapiz'
    | 'imagen';
export type Pt = { x: number; y: number };
export type CanvasSize = { w: number; h: number };
export type ElementoBase = {
    id: number;
    type: TipoElemento;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    rotation?: number;
    flipX?: boolean;
    saturation?: number;
};
export type ElementoTexto = ElementoBase & {
    type: 'texto';
    text?: string;
    fontSize?: number;
    fontFamily?: string;
};
export type ElementoImagen = ElementoBase & {
    type: 'imagen';
    url?: string | ArrayBuffer | null;
};

export type ElementoLapiz = ElementoBase & {
    type: 'lapiz';
    points?: string;
    strokeWidth?: number;
};
export type ElementoPoligonoEditable = ElementoBase & {
    type: 'triangulo' | 'estrella' | 'rombo' | 'hexagono' | 'octagono';
    pointsArr?: Pt[];
};
export type ElementoFiguraNoEditable = ElementoBase & {
    type: 'rectangulo' | 'circulo';
};
export type Elemento =
    | ElementoTexto
    | ElementoImagen
    | ElementoLapiz
    | ElementoPoligonoEditable
    | ElementoFiguraNoEditable;
export type DragHandle = null | { elId: number; idx: number };
export type FiguraDef = {
    id: Exclude<Herramienta, null | 'multiseleccion' | 'goma' | 'lapiz' | 'texto' | 'imagen'>; // solo figuras
    label: string;
    icon: React.ComponentType<any>;
};
