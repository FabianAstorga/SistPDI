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
    | 'imagen'
    | 'linea'
    | 'flecha'
    | 'curva';

export type Pt = { x: number; y: number };

export type CanvasSize = { w: number; h: number };

export type ElementoBase = {
    id: number;
    name: string;           
    templateKey: string;   
    type: Herramienta;      

    x: number;              
    y: number;              
    width: number;          
    height: number;         

    fill?: string;
    stroke?: string;
    strokeWidth?: number;

    rotation: number;       
    flipX: boolean;         
    saturation: number;     

    pointsArr?: Pt[];       

    isLocked?: boolean;
};

export type ElementoTexto = ElementoBase & {
    type: 'texto';
    text: string;
    fontSize: number;
    fontFamily: string;
};

export type ElementoImagen = ElementoBase & {
    type: 'imagen';
    url: string; 
};

export type Elemento =
    | ElementoBase
    | ElementoTexto
    | ElementoImagen;

export type DragHandle = null | { elId: number; idx: number };