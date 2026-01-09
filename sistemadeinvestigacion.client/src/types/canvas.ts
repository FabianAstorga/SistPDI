export type TipoElemento = 'rectangulo' | 'circulo' | 'triangulo' | 'texto' | 'lapiz' | 'estrella';

export interface ElementoCanvas {
    id: number;
    type: TipoElemento;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    rotation: number; // Nueva
    text?: string;
    fontSize?: number; // Nueva
    fontFamily?: string; // Nueva
    points?: string; // Para el lápiz (path data)
}