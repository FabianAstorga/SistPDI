export type TipoElemento = 'rectangulo' | 'circulo' | 'texto';

export interface ElementoCanvas {
    id: number;
    type: TipoElemento;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    text?: string;
}