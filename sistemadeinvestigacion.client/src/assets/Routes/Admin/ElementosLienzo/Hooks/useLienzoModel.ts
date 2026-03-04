/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { LienzoModel } from '../types/lienzo.model';
import type { DragHandle, Herramienta, Pt } from '../types/lienzo.types';
import {
    clamp,
    clonePts,
    getBasePolygonPoints,
    isEditablePolygon,
    isStrokeType,
    applyInverseElTransformToPoint,
    svgPointFromMouse,
    normalizePtsToLocal
} from '../Utils/lienzo.geometry';
import {
    readUserNameFromLocalStorage,
    getValueFromTempAcuerdo
} from '../Utils/lienzo.storage';
import { guardarAcuerdoFinal } from '../Utils/lienzo.http';

const reconstruirEstadoDesdeGruposSVG = (svgString: string): any[] => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const grupos = Array.from(doc.querySelectorAll('g[data-type]'));

        return grupos.map((g, index) => {
            const type = g.getAttribute('data-type') || '';
            const templateKey = g.getAttribute('data-template-key') || '';

            const textNode = g.querySelector('text');
            const fillNode = g.querySelector('[fill]');

            const el: any = {
                id: Number(g.getAttribute('data-elid')) || (Date.now() + index + Math.random()),
                type,
                name: g.getAttribute('data-name') || '',
                templateKey,
                isLocked: g.getAttribute('data-locked') === 'true',
                x: Number(g.getAttribute('data-x')) || 0,
                y: Number(g.getAttribute('data-y')) || 0,
                width: Number(g.getAttribute('data-width')) || 100,
                height: Number(g.getAttribute('data-height')) || 100,
                rotation: Number(g.getAttribute('data-rotation')) || 0,
                flipX: g.getAttribute('data-flipx') === 'true',
                saturation: Number(g.getAttribute('data-saturation')) || 1,
                fill: g.getAttribute('data-fill') ||
                    textNode?.getAttribute('fill') ||
                    fillNode?.getAttribute('fill') ||
                    '#000000',
                stroke: g.querySelector('[stroke]')?.getAttribute('stroke') || '#000000',
                strokeWidth: Number(g.querySelector('[stroke-width]')?.getAttribute('stroke-width')) || 3,
            };

            if (el.type === 'texto') {
                const datoInyectado = templateKey ? getValueFromTempAcuerdo(templateKey) : null;
                el.text = datoInyectado || textNode?.textContent || '';
                el.fontSize = Number(textNode?.getAttribute('font-size')) || 16;
                el.fontFamily = textNode?.getAttribute('font-family') || 'Arial';
                el.fontWeight = textNode?.getAttribute('font-weight') || '700';

                if (!el.fill || el.fill === 'none' || el.fill === 'transparent') {
                    el.fill = '#000000';
                }
            }

            if (el.type === 'imagen') {
                el.url = g.querySelector('image')?.getAttribute('href');
            }

            const pointsData = g.getAttribute('data-points');
            if (pointsData) {
                el.pointsArr = JSON.parse(pointsData);
            }

            return el;
        });
    } catch (e) {
        console.error("[PARSER] Fallo en la reconstrucción:", e);
        return [];
    }
};

export const useLienzoModel = (navigate: (path: string) => void): LienzoModel => {
    const [elementos, setElementos] = useState<any[]>([]);
    const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
    const [seleccionadosIds, setSeleccionadosIds] = useState<number[]>([]);
    const [herramientaActiva, setHerramientaActiva] = useState<Herramienta>(null);
    const [menuFigurasOpen, setMenuFigurasOpen] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
    const [colorGlobal, setColorGlobal] = useState('#003385');
    const [grosorLapiz, setGrosorLapiz] = useState(3);
    const [dibujando, setDibujando] = useState(false);
    const [modoPuntos, setModoPuntos] = useState(false);
    const [dragHandle, setDragHandle] = useState<DragHandle>(null);
    const [modo, setModo] = useState<{ tipo: number, id?: number } | null>(null);
    const [tituloAcuerdo, setTituloAcuerdo] = useState('Nuevo Proyecto');
    const [autorNombre, setAutorNombre] = useState('—');

    const svgRef = useRef<SVGSVGElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const creandoTrazoId = useRef<number | null>(null);
    const creandoTrazoStartWorld = useRef<Pt | null>(null);

    const generarMetadatosNuevoElemento = useCallback((tipo: string) => {
        const cuenta = elementos.filter(e => e.type === tipo).length + 1;
        const nombreSujeto = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        return {
            id: Date.now() + Math.random(),
            name: `${nombreSujeto}_${cuenta}`,
            templateKey: ''
        };
    }, [elementos]);


    useEffect(() => {
        const modoRaw = localStorage.getItem('modo');
        if (!modoRaw) return;

        const modoParsed = JSON.parse(modoRaw);
        setModo(modoParsed);

        if (modoParsed.tipo === 4) {
            const svgEdit = localStorage.getItem('template_svg_edit');
            if (svgEdit) {
                console.log("[Lienzo] 🔄 Reconstruyendo plantilla para edición (Modo 4)");
                setElementos(reconstruirEstadoDesdeGruposSVG(svgEdit));
            }
        } else {
            const templateSvg = localStorage.getItem('template_svg');
            if (templateSvg) {
                setElementos(reconstruirEstadoDesdeGruposSVG(templateSvg));
            }
        }

        if (modoParsed.tipo === 3) {
            const tempCambio = localStorage.getItem('temp_cambio');
            if (tempCambio) {
                const data = JSON.parse(tempCambio);
                setTituloAcuerdo(data.titulo || 'Editando Acuerdo');
            }
        } else if (modoParsed.tipo === 1 || modoParsed.tipo === 2) {
            const tempAcuerdo = localStorage.getItem('temp_acuerdo');
            if (tempAcuerdo) {
                const data = JSON.parse(tempAcuerdo);
                setTituloAcuerdo(data.titulo || 'Nuevo Proyecto');
            }
        }

        setAutorNombre(readUserNameFromLocalStorage());
    }, []);

    const actualizarAtributo = useCallback((id: number, cambios: any) => {
        setElementos((prev) => prev.map((el) => (el.id === id ? { ...el, ...cambios } : el)));
    }, []);

    const transformarGrupoPosicion = useCallback((id: number, dx: number, dy: number) => {
        if (modoPuntos) return;
        setElementos((prev) => prev.map((el) => {
            if ((id === el.id || seleccionadosIds.includes(el.id)) && !el.isLocked) {
                return { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy };
            }
            return el;
        }));
    }, [modoPuntos, seleccionadosIds]);

    const transformarGrupoEscala = useCallback((id: number, width: number, height: number) => {
        setElementos((prev) => prev.map((el) => {
            if (el.id !== id) return el;
            const oldW = el.width || 1;
            const oldH = el.height || 1;
            const next = { ...el, width, height };

            if (Array.isArray(el.pointsArr)) {
                const sx = width / oldW;
                const sy = height / oldH;
                next.pointsArr = el.pointsArr.map((p: Pt) => ({
                    x: clamp(p.x * sx, 0, width),
                    y: clamp(p.y * sy, 0, height)
                }));
            }
            return next;
        }));
    }, []);

    const crearGrupoElemento = useCallback((e: any) => {
        if (modoPuntos || !herramientaActiva || isStrokeType(herramientaActiva)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const meta = generarMetadatosNuevoElemento(herramientaActiva);
        const wInicial = herramientaActiva === 'texto' ? 250 : 120;
        const hInicial = 120;

        const nuevo: any = {
            ...meta,
            type: herramientaActiva,
            x: e.clientX - rect.left - wInicial / 2,
            y: e.clientY - rect.top - hInicial / 2,
            width: wInicial,
            height: hInicial,
            fill: colorGlobal,
            rotation: 0,
            flipX: false,
            saturation: 1,
            fontSize: 16,
            fontFamily: 'Arial',
            text: herramientaActiva === 'texto' ? 'Escribe aquí...' : ''
        };

        if (isEditablePolygon(nuevo.type)) {
            nuevo.pointsArr = getBasePolygonPoints(nuevo.type, nuevo.width, nuevo.height);
        }

        setElementos((prev) => [...prev, nuevo]);
        setSeleccionadoId(nuevo.id);
        setSeleccionadosIds([nuevo.id]);
        setHerramientaActiva(null);
    }, [modoPuntos, herramientaActiva, colorGlobal, generarMetadatosNuevoElemento]);

    const iniciarDibujo = useCallback((e: any) => {
        if (herramientaActiva && isStrokeType(herramientaActiva)) {
            if (!svgRef.current) return;
            const start = svgPointFromMouse(svgRef.current, e.clientX, e.clientY);
            const meta = generarMetadatosNuevoElemento(herramientaActiva);
            creandoTrazoId.current = meta.id;
            creandoTrazoStartWorld.current = start;
            setDibujando(true);

            const nuevo: any = {
                ...meta,
                type: herramientaActiva,
                x: start.x, y: start.y, width: 1, height: 1,
                rotation: 0, stroke: colorGlobal, strokeWidth: grosorLapiz,
                pointsArr: herramientaActiva === 'curva' ? [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }] : [{ x: 0, y: 0 }, { x: 0, y: 0 }]
            };
            setElementos((prev) => [...prev, nuevo]);
            setSeleccionadoId(meta.id);
            setSeleccionadosIds([meta.id]);
        }
    }, [herramientaActiva, colorGlobal, grosorLapiz, generarMetadatosNuevoElemento]);

    const dibujar = useCallback((e: any) => {
        if (!dibujando || !creandoTrazoId.current || !svgRef.current || !creandoTrazoStartWorld.current) return;
        const id = creandoTrazoId.current;
        const startWorld = creandoTrazoStartWorld.current;
        const endWorld = svgPointFromMouse(svgRef.current, e.clientX, e.clientY);
        const el = elementos.find(x => x.id === id);
        if (!el) return;

        let ptsWorld: Pt[] = [];
        if (el.type === 'curva') {
            const mx = (startWorld.x + endWorld.x) / 2;
            const my = (startWorld.y + endWorld.y) / 2;
            const dx = endWorld.x - startWorld.x;
            const dy = endWorld.y - startWorld.y;
            ptsWorld = [startWorld, { x: mx - dy * 0.15, y: my + dx * 0.15 }, endWorld];
        } else {
            ptsWorld = [startWorld, endWorld];
        }

        const { x, y, w, h, ptsLocal } = normalizePtsToLocal(ptsWorld);
        setElementos((prev) => prev.map((item) => (item.id === id ? { ...item, x, y, width: w, height: h, pointsArr: ptsLocal } : item)));
    }, [dibujando, elementos]);

    const seleccionado = useMemo(() => elementos.find((el) => el.id === seleccionadoId), [elementos, seleccionadoId]);

    const manejarGuardadoFinal = useCallback(async () => {
        if (!modo) return;
        await guardarAcuerdoFinal({ navigate, modo });
    }, [navigate, modo]);

    const onSvgMouseMove = useCallback((e: any) => {
        if (dibujando) {
            dibujar(e);
        } else if (modoPuntos && dragHandle && svgRef.current) {
            const el = elementos.find(x => x.id === dragHandle.elId);
            if (!el || !el.pointsArr) return;
            const pWorld = svgPointFromMouse(svgRef.current, e.clientX, e.clientY);
            const local = applyInverseElTransformToPoint(pWorld, el);
            setElementos(prev => prev.map(item => {
                if (item.id !== el.id) return item;
                const nextPts = [...item.pointsArr!];
                nextPts[dragHandle.idx] = { x: clamp(local.x, 0, item.width), y: clamp(local.y, 0, item.height) };
                return { ...item, pointsArr: nextPts };
            }));
        }
    }, [dibujando, dibujar, modoPuntos, dragHandle, elementos]);

    const bloquearElemento = useCallback((id: number, lock: boolean) => {
        setElementos(prev => prev.map(el =>
            el.id === id ? { ...el, isLocked: lock } : el
        ));
        if (lock) {
            setSeleccionadosIds(prev => prev.filter(sid => sid !== id));
            if (seleccionadoId === id) setSeleccionadoId(null);
        }
    }, [seleccionadoId]);

    return {
        elementos, seleccionadoId, seleccionadosIds, seleccionado, herramientaActiva,
        menuFigurasOpen, canvasSize, colorGlobal, grosorLapiz, dibujando,
        tituloAcuerdo, autorNombre, modoPuntos, dragHandle, fileInputRef, svgRef,
        modoSeleccionActivo: (herramientaActiva === null || herramientaActiva === 'multiseleccion') && !modoPuntos,
        presetsLienzo: [{ w: 800, h: 600 }, { w: 1280, h: 720 }, { w: 1920, h: 1080 }],
        FIGURAS: [
            { id: 'rectangulo', label: 'Rectángulo' },
            { id: 'circulo', label: 'Círculo' },
            { id: 'triangulo', label: 'Triángulo' },
            { id: 'estrella', label: 'Estrella' },
            { id: 'rombo', label: 'Rombo' }
        ],
        fontsDisponibles: ['Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Courier New'],
        tiposConSaturacion: new Set(['rectangulo', 'circulo', 'triangulo', 'estrella', 'rombo', 'imagen']),
        canEditPoints: !!seleccionado && (isEditablePolygon(seleccionado.type) || isStrokeType(seleccionado.type)),

        setElementos, setSeleccionadoId, setSeleccionadosIds, setHerramientaActiva,
        setMenuFigurasOpen, setCanvasSize, setColorGlobal, setModoPuntos,

        actualizarAtributo,
        manejarCambioColor: (color: string) => {
            setColorGlobal(color);
            if (seleccionadoId) {
                const el = elementos.find(x => x.id === seleccionadoId);
                actualizarAtributo(seleccionadoId, isStrokeType(el?.type || '') ? { stroke: color } : { fill: color });
            }
        },
        eliminarElemento: (id: number) => {
            setElementos(prev => prev.filter(el => el.id !== id));
            setSeleccionadosIds(prev => prev.filter(sid => sid !== id));
            if (seleccionadoId === id) setSeleccionadoId(null);
        },
        limpiarSeleccion: () => { setSeleccionadoId(null); setSeleccionadosIds([]); },

        seleccionarElementoCanvas: (id: number) => {
            const el = elementos.find(x => x.id === id);
            if (el?.isLocked) return;
            setSeleccionadoId(id);
            setSeleccionadosIds([id]);
        },

        seleccionarElementoDesdeCapas: (id: number) => setSeleccionadosIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
        bloquearElemento,

        subirImagen: (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (f) => {
                const nuevo = { ...generarMetadatosNuevoElemento('imagen'), type: 'imagen', x: 50, y: 50, width: 200, height: 200, url: f.target?.result, rotation: 0, saturation: 1 };
                setElementos(prev => [...prev, nuevo]);
            };
            reader.readAsDataURL(file);
        },

        manejarClickLienzo: crearGrupoElemento,
        iniciarDibujo,
        onSvgMouseMove,
        onSvgMouseUp: () => { setDibujando(false); setDragHandle(null); },

        clonarElemento: () => {
            if (!seleccionado) return;
            const nuevo = {
                ...seleccionado,
                ...generarMetadatosNuevoElemento(seleccionado.type),
                x: seleccionado.x + 20,
                y: seleccionado.y + 20,
                pointsArr: seleccionado.pointsArr ? clonePts(seleccionado.pointsArr) : undefined
            };
            setElementos(prev => [...prev, nuevo]);
        },
        alArrastrando: transformarGrupoPosicion,
        alTerminarArrastre: (id: number, x: number, y: number) => actualizarAtributo(id, { x, y }),
        moverCapa: (id: number, dir: 'up' | 'down') => {
            setElementos(prev => {
                const idx = prev.findIndex(x => x.id === id);
                if (idx === -1) return prev;
                const next = [...prev];
                const targetIdx = dir === 'up' ? idx + 1 : idx - 1;
                if (targetIdx < 0 || targetIdx >= next.length) return prev;
                [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
                return next;
            });
        },
        moverCapaExtremo: (id: number, dir: 'top' | 'bottom') => {
            setElementos(prev => {
                const idx = prev.findIndex(x => x.id === id);
                if (idx === -1) return prev;
                const next = [...prev];
                const [item] = next.splice(idx, 1);
                dir === 'top' ? next.push(item) : next.unshift(item);
                return next;
            });
        },
        redimensionarElemento: transformarGrupoEscala,
        manejarGuardadoFinal,
        descargarSVG: () => {
            const svgEl = svgRef.current;
            if (!svgEl) return;
            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(svgEl);
            const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${tituloAcuerdo}.svg`;
            link.click();
        },
        startDragPoint: (e: any, elId: number, idx: number) => { e.stopPropagation(); setDragHandle({ elId, idx }); },
        generarMetadatosNuevoElemento,

        sidebarBtnClass: (active: boolean) => `p-4 rounded-lg transition-all duration-200 flex items-center justify-center ${active ? 'bg-[#003385] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`,
        controlLabel: 'text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block',
        inputStyle: 'w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2'
    };
};