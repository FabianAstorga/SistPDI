import { useEffect, useMemo, useRef, useState } from 'react';
import type { LienzoModel } from '../types/lienzo.model';
import type { DragHandle, Herramienta, Pt } from '../types/lienzo.types';
import {
    clamp,
    clonePts,
    getBasePolygonPoints,
    isEditablePolygon,
    applyInverseElTransformToPoint,
    svgPointFromMouse
} from '../Utils/lienzo.geometry';
import { pick, readUserNameFromLocalStorage, safeJson } from '../Utils/lienzo.storage';
import { guardarAcuerdoFinal } from '../Utils/lienzo.http';

// ✅ icons para FIGURAS
import { Square, Circle, Triangle, Star, Diamond, Hexagon, Octagon } from 'lucide-react';

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
    const [tituloAcuerdo, setTituloAcuerdo] = useState('No acuerdo seleccionado');
    const [autorNombre, setAutorNombre] = useState('—');
    const [modoPuntos, setModoPuntos] = useState(false);
    const [dragHandle, setDragHandle] = useState<DragHandle>(null);

    const idCapaDibujoActual = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    const seleccionadosIdsRef = useRef<number[]>([]);
    useEffect(() => {
        seleccionadosIdsRef.current = seleccionadosIds;
    }, [seleccionadosIds]);

    const seleccionado = elementos.find((el) => el.id === seleccionadoId);
    const modoSeleccionActivo = (herramientaActiva === null || herramientaActiva === 'multiseleccion') && !modoPuntos;

    useEffect(() => {
        const temp = localStorage.getItem('temp_acuerdo');
        const parsed = safeJson(temp);
        const titulo = parsed
            ? String(pick(parsed, ['Titulo', 'titulo'], 'No acuerdo seleccionado') || 'No acuerdo seleccionado')
            : 'No acuerdo seleccionado';
        setTituloAcuerdo(titulo.trim().length > 0 ? titulo : 'No acuerdo seleccionado');
        setAutorNombre(readUserNameFromLocalStorage());
    }, []);

    useEffect(() => {
        const stopAll = () => setDibujando(false);
        window.addEventListener('mouseup', stopAll);
        window.addEventListener('blur', stopAll);
        return () => {
            window.removeEventListener('mouseup', stopAll);
            window.removeEventListener('blur', stopAll);
        };
    }, []);

    useEffect(() => {
        const onUp = () => setDragHandle(null);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('blur', onUp);
        return () => {
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('blur', onUp);
        };
    }, []);

    const actualizarAtributo = (id: number, cambios: any) => {
        setElementos((prev) => prev.map((el) => (el.id === id ? { ...el, ...cambios } : el)));
    };

    const manejarCambioColor = (nuevoColor: string) => {
        setColorGlobal(nuevoColor);
        if (seleccionadoId) actualizarAtributo(seleccionadoId, { fill: nuevoColor });
    };

    const eliminarElemento = (id: number) => {
        setElementos((prev) => prev.filter((x) => x.id !== id));
        setSeleccionadosIds((prev) => prev.filter((x) => x !== id));
        if (seleccionadoId === id) setSeleccionadoId(null);
    };

    const limpiarSeleccion = () => {
        setSeleccionadoId(null);
        setSeleccionadosIds([]);
    };

    const seleccionarElementoCanvas = (id: number) => {
        if (modoPuntos) {
            setSeleccionadoId(id);
            setSeleccionadosIds([id]);
            return;
        }

        if (herramientaActiva === 'multiseleccion') {
            setSeleccionadoId(id);
            setSeleccionadosIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
            return;
        }

        setSeleccionadoId(id);
        setSeleccionadosIds([id]);
    };

    const seleccionarElementoDesdeCapas = (id: number) => {
        if (modoPuntos) {
            setSeleccionadoId(id);
            setSeleccionadosIds([id]);
            return;
        }

        if (herramientaActiva === 'multiseleccion') {
            setSeleccionadoId(id);
            setSeleccionadosIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
            return;
        }

        setSeleccionadoId(id);
        setSeleccionadosIds([id]);
    };

    const subirImagen = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => {
                const nuevo = {
                    id: Date.now(),
                    type: 'imagen',
                    x: 50,
                    y: 50,
                    width: 200,
                    height: 200,
                    rotation: 0,
                    flipX: false,
                    url: f.target?.result,
                    saturation: 1
                };
                setElementos((prev) => [...prev, nuevo]);
                setSeleccionadoId(nuevo.id);
                setSeleccionadosIds([nuevo.id]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const ensurePolygonPoints = (base: any) => {
        if (!isEditablePolygon(base.type)) return base;
        const w = base.width || 120;
        const h = base.height || 120;
        if (Array.isArray(base.pointsArr) && base.pointsArr.length >= 3) {
            return { ...base, pointsArr: base.pointsArr };
        }
        const pts = getBasePolygonPoints(base.type, w, h);
        return { ...base, pointsArr: pts };
    };

    const manejarClickLienzo = (e: any) => {
        if (modoPuntos) return;
        if (herramientaActiva === 'lapiz') return;
        if (!herramientaActiva) {
            limpiarSeleccion();
            return;
        }
        if (herramientaActiva === 'multiseleccion') return;

        if (herramientaActiva === 'goma') {
            const target = e.target as any;
            const idStr = target?.dataset?.elid;
            if (idStr) eliminarElemento(Number(idStr));
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const baseNuevo = {
            id: Date.now(),
            type: herramientaActiva,
            x: e.clientX - rect.left - 50,
            y: e.clientY - rect.top - 50,
            width: herramientaActiva === 'texto' ? 250 : 120,
            height: 120,
            fill: colorGlobal,
            rotation: 0,
            flipX: false,
            fontSize: 16,
            fontFamily: 'Arial',
            text: herramientaActiva === 'texto' ? 'Escribe aquí tu texto...' : '',
            saturation: 1
        };

        const nuevo = ensurePolygonPoints(baseNuevo);
        setElementos((prev) => [...prev, nuevo]);
        setSeleccionadoId(nuevo.id);
        setSeleccionadosIds([nuevo.id]);
        setHerramientaActiva(null);
    };

    const iniciarDibujo = (e: any) => {
        if (herramientaActiva !== 'lapiz') return;

        setDibujando(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const moveCommand = `M ${e.clientX - rect.left} ${e.clientY - rect.top}`;

        const ultimaCapa = elementos[elementos.length - 1];
        if (idCapaDibujoActual.current && ultimaCapa?.id === idCapaDibujoActual.current) {
            setElementos((prev) =>
                prev.map((el) =>
                    el.id === idCapaDibujoActual.current
                        ? { ...el, points: (el.points || '') + ' ' + moveCommand, strokeWidth: grosorLapiz }
                        : el
                )
            );
        } else {
            const id = Date.now();
            idCapaDibujoActual.current = id;
            setElementos((prev) => [
                ...prev,
                {
                    id,
                    type: 'lapiz',
                    x: 0,
                    y: 0,
                    width: canvasSize.w,
                    height: canvasSize.h,
                    fill: colorGlobal,
                    rotation: 0,
                    points: moveCommand,
                    strokeWidth: grosorLapiz
                }
            ]);
        }
    };

    const dibujar = (e: any) => {
        if (!dibujando || !idCapaDibujoActual.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

        const nextPoint = `L ${x} ${y}`;
        setElementos((prev) =>
            prev.map((el) => (el.id === idCapaDibujoActual.current ? { ...el, points: (el.points || '') + ' ' + nextPoint } : el))
        );
    };

    const clonarElemento = () => {
        if (!seleccionado) return;

        const nuevoBase = {
            ...seleccionado,
            id: Date.now(),
            x: (seleccionado.x || 0) + 20,
            y: (seleccionado.y || 0) + 20
        };

        const nuevo = isEditablePolygon(nuevoBase.type)
            ? {
                ...nuevoBase,
                pointsArr: Array.isArray(nuevoBase.pointsArr)
                    ? clonePts(nuevoBase.pointsArr)
                    : getBasePolygonPoints(nuevoBase.type, nuevoBase.width || 120, nuevoBase.height || 120)
            }
            : nuevoBase;

        setElementos((prev) => [...prev, nuevo]);
        setSeleccionadoId(nuevo.id);
        setSeleccionadosIds([nuevo.id]);
    };

    const alArrastrando = (id: number, dx: number, dy: number) => {
        if (modoPuntos) return;

        if (herramientaActiva === 'multiseleccion') {
            const current = seleccionadosIdsRef.current || [];
            const nextSelected = current.includes(id) ? current : [...current, id];
            if (!current.includes(id)) {
                setSeleccionadosIds(nextSelected);
                setSeleccionadoId(id);
            }
            const setSel = new Set(nextSelected);
            setElementos((prev) =>
                prev.map((el) => (setSel.has(el.id) ? { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy } : el))
            );
            return;
        }

        setElementos((prev) => prev.map((el) => (el.id === id ? { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy } : el)));
    };

    const moverCapa = (id: number, direction: 'up' | 'down') => {
        setElementos((prev) => {
            const idx = prev.findIndex((x) => x.id === id);
            if (idx === -1) return prev;

            const next = [...prev];
            if (direction === 'up') {
                if (idx >= next.length - 1) return prev;
                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                return next;
            } else {
                if (idx <= 0) return prev;
                [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
                return next;
            }
        });
    };

    const moverCapaExtremo = (id: number, direction: 'top' | 'bottom') => {
        setElementos((prev) => {
            const idx = prev.findIndex((x) => x.id === id);
            if (idx === -1) return prev;

            const next = [...prev];
            const [item] = next.splice(idx, 1);
            if (direction === 'top') next.push(item);
            else next.unshift(item);
            return next;
        });
    };

    const descargarSVG = () => {
        const svgElement = document.querySelector('svg');
        if (!svgElement) return;
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lienzo_${Date.now()}.svg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const manejarGuardadoFinal = async () => {
        await guardarAcuerdoFinal({
            elementos,
            canvasSize,
            navigate
        });
    };

    const startDragPoint = (e: any, elId: number, idx: number) => {
        e.stopPropagation();
        e.preventDefault();
        setDragHandle({ elId, idx });
    };

    const onSvgMouseMove = (e: any) => {
        if (herramientaActiva === 'lapiz') {
            dibujar(e);
            return;
        }
        if (!modoPuntos) return;
        if (!dragHandle) return;
        if (!svgRef.current) return;

        const el = elementos.find((x) => x.id === dragHandle.elId);
        if (!el) return;
        if (!isEditablePolygon(el.type)) return;

        const pWorld = svgPointFromMouse(svgRef.current, e.clientX, e.clientY);
        const local = applyInverseElTransformToPoint(pWorld, el);

        const w = el.width || 120;
        const h = el.height || 120;
        const x = clamp(local.x, 0, w);
        const y = clamp(local.y, 0, h);

        setElementos((prev) =>
            prev.map((item) => {
                if (item.id !== el.id) return item;
                const pts = Array.isArray(item.pointsArr) ? clonePts(item.pointsArr) : getBasePolygonPoints(item.type, w, h);
                if (!pts[dragHandle.idx]) return item;
                pts[dragHandle.idx] = { x, y };
                return { ...item, pointsArr: pts };
            })
        );
    };

    const onSvgMouseUp = () => {
        if (herramientaActiva === 'lapiz') {
            setDibujando(false);
            return;
        }
        setDragHandle(null);
    };

    const redimensionarElemento = (id: number, width: number, height: number) => {
        setElementos((prev) =>
            prev.map((el) => {
                if (el.id !== id) return el;

                const oldW = el.width || 120;
                const oldH = el.height || 120;
                const next: any = { ...el, width, height };

                if (isEditablePolygon(el.type) && Array.isArray(el.pointsArr) && el.pointsArr.length >= 3) {
                    const sx = oldW > 0 ? width / oldW : 1;
                    const sy = oldH > 0 ? height / oldH : 1;
                    next.pointsArr = el.pointsArr.map((p: Pt) => ({
                        x: clamp(p.x * sx, 0, width),
                        y: clamp(p.y * sy, 0, height)
                    }));
                }

                return next;
            })
        );
    };

    const fontsDisponibles = [
        'Arial',
        'Helvetica',
        'Verdana',
        'Trebuchet MS',
        'Tahoma',
        'Georgia',
        'Times New Roman',
        'Courier New',
        'Lucida Console',
        'Impact',
        'Comic Sans MS',
        'MS Sans Serif',
        'MS Serif',
        'System',
        'Fixedsys',
        'Terminal',
        'Lucida Sans Typewriter',
        'Palatino Linotype',
        'Book Antiqua',
        'Garamond',
        'Century Schoolbook',
        'Courier',
        'Monaco',
        'Consolas',
        'Lucida Bright',
        'Bookman Old Style',
        'Century Gothic',
        'Franklin Gothic Medium',
        'Copperplate',
        'Rockwell',
        'Baskerville',
        'OCR A Std',
        'OCR A Extended',
        'American Typewriter',
        'Andale Mono'
    ];

    const presetsLienzo = [
        { w: 800, h: 600 },
        { w: 1024, h: 768 },
        { w: 1280, h: 720 },
        { w: 1366, h: 768 },
        { w: 1600, h: 900 },
        { w: 1920, h: 1080 },
        { w: 600, h: 800 },
        { w: 1080, h: 1920 }
    ];

    // ✅ ahora con iconos
    const FIGURAS = [
        { id: 'rectangulo', label: 'Rectángulo', icon: Square },
        { id: 'circulo', label: 'Círculo', icon: Circle },
        { id: 'triangulo', label: 'Triángulo', icon: Triangle },
        { id: 'estrella', label: 'Estrella', icon: Star },
        { id: 'rombo', label: 'Rombo', icon: Diamond },
        { id: 'hexagono', label: 'Hexágono', icon: Hexagon },
        { id: 'octagono', label: 'Octágono', icon: Octagon }
    ] as const;

    const tiposConSaturacion = useMemo(
        () => new Set(['rectangulo', 'circulo', 'triangulo', 'estrella', 'rombo', 'hexagono', 'octagono', 'imagen']),
        []
    );

    const canEditPoints = useMemo(() => !!(seleccionado && isEditablePolygon(seleccionado.type)), [seleccionado]);

    useEffect(() => {
        if (modoPuntos && !canEditPoints) setModoPuntos(false);
    }, [modoPuntos, canEditPoints]);

    const sidebarBtnClass = (active: boolean) =>
        `p-4 rounded-lg transition-all duration-200 flex items-center justify-center ${active ? 'bg-[#003385] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
        }`;

    const controlLabel = 'text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block';

    const inputStyle =
        'w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2';

    return {
        elementos,
        seleccionadoId,
        seleccionadosIds,
        seleccionado,
        herramientaActiva,
        menuFigurasOpen,
        canvasSize,
        colorGlobal,
        grosorLapiz,
        dibujando,
        tituloAcuerdo,
        autorNombre,
        modoPuntos,
        dragHandle,
        fileInputRef,
        svgRef,
        idCapaDibujoActual,
        modoSeleccionActivo,
        fontsDisponibles,
        presetsLienzo,
        FIGURAS,
        tiposConSaturacion,
        canEditPoints,
        sidebarBtnClass,
        controlLabel,
        inputStyle,
        setElementos,
        setSeleccionadoId,
        setSeleccionadosIds,
        setHerramientaActiva,
        setMenuFigurasOpen,
        setCanvasSize,
        setColorGlobal,
        setGrosorLapiz,
        setModoPuntos,
        actualizarAtributo,
        manejarCambioColor,
        eliminarElemento,
        limpiarSeleccion,
        seleccionarElementoCanvas,
        seleccionarElementoDesdeCapas,
        subirImagen,
        manejarClickLienzo,
        iniciarDibujo,
        dibujar,
        clonarElemento,
        alArrastrando,
        moverCapa,
        moverCapaExtremo,
        descargarSVG,
        manejarGuardadoFinal,
        startDragPoint,
        onSvgMouseMove,
        onSvgMouseUp,
        redimensionarElemento
    };
};
