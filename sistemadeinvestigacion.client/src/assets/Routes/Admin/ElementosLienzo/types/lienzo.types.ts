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

/**
 * ElementoBase ahora representa un Grupo Semántico.
 * Todos los objetos visuales están contenidos en este Bounding Box.
 */
export type ElementoBase = {
    id: number;
    name: string;           // Identificador único (ej: Rectangulo_1)
    templateKey: string;    // Clave para inyección de datos
    type: Herramienta;      // Tipo de objeto vinculado a la herramienta

    // Dimensiones del Bounding Box (BBox) del grupo
    x: number;              //
    y: number;              //
    width: number;          //
    height: number;         //

    fill?: string;
    stroke?: string;
    strokeWidth?: number;

    rotation: number;       //
    flipX: boolean;         //
    saturation: number;     //

    // Puntos locales relativos al 0,0 del grupo
    pointsArr?: Pt[];       //
};

export type ElementoTexto = ElementoBase & {
    type: 'texto';
    text: string;
    fontSize: number;
    fontFamily: string;
};

export type ElementoImagen = ElementoBase & {
    type: 'imagen';
    url: string; // URL o Base64
};

// El tipo Elemento ahora es más simple y predecible
export type Elemento =
    | ElementoBase
    | ElementoTexto
    | ElementoImagen;

export type DragHandle = null | { elId: number; idx: number };