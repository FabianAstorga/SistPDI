import type React from 'react';
import type { CanvasSize, Elemento, Herramienta } from './lienzo.types';

export type LienzoModel = {
    fileInputRef: React.RefObject<HTMLInputElement>;
    svgRef: React.RefObject<SVGSVGElement>;
    tituloAcuerdo: string;
    autorNombre: string;
    herramientaActiva: Herramienta;
    setHerramientaActiva: React.Dispatch<React.SetStateAction<Herramienta>>;
    menuFigurasOpen: boolean;
    setMenuFigurasOpen: React.Dispatch<React.SetStateAction<boolean>>;
    canvasSize: CanvasSize;
    setCanvasSize: React.Dispatch<React.SetStateAction<CanvasSize>>;
    elementos: Elemento[];
    seleccionadoId: number | null;
    seleccionado: Elemento | undefined;
    seleccionadosIds: number[];
    setSeleccionadosIds: React.Dispatch<React.SetStateAction<number[]>>;
    colorGlobal: string;
    setColorGlobal: React.Dispatch<React.SetStateAction<string>>;
    grosorLapiz: number;
    setGrosorLapiz: React.Dispatch<React.SetStateAction<number>>;
    dibujando: boolean;
    modoPuntos: boolean;
    setModoPuntos: React.Dispatch<React.SetStateAction<boolean>>;
    canEditPoints: boolean;
    sidebarBtnClass: (active: boolean) => string;
    controlLabel: string;
    inputStyle: string;
    fontsDisponibles: string[];
    presetsLienzo: CanvasSize[];
    FIGURAS: any[];
    tiposConSaturacion: Set<string>;

    subirImagen: (e: any) => void;
    manejarGuardadoFinal: () => Promise<void>;
    descargarSVG: () => void;

    crearGrupoElemento: (e: any) => void;
    transformarGrupoPosicion: (id: number, dx: number, dy: number) => void;
    transformarGrupoEscala: (id: number, width: number, height: number) => void;

    iniciarDibujo: (e: any) => void;
    onSvgMouseMove: (e: any) => void;
    onSvgMouseUp: () => void;
    seleccionarElementoCanvas: (id: number) => void;
    seleccionarElementoDesdeCapas: (id: number) => void;
    actualizarAtributo: (id: number, cambios: any) => void;
    manejarCambioColor: (nuevoColor: string) => void;
    eliminarElemento: (id: number) => void;

    bloquearElemento: (id: number, lock: boolean) => void;

    clonarElemento: () => void;
    moverCapa: (id: number, direction: 'up' | 'down') => void;
    moverCapaExtremo: (id: number, direction: 'top' | 'bottom') => void;
    startDragPoint: (e: any, elId: number, idx: number) => void;

    generarMetadatosNuevoElemento: (tipo: string) => { id: number; name: string; templateKey: string; };
};