import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { LienzoModel } from '../types/lienzo.model';
import type { DragHandle, Herramienta, Pt } from '../types/lienzo.types';
import {
    clamp,
    clonePts,
    getBasePolygonPoints,
    isEditablePolygon,
    isStrokeType,
    isEditableByPoints,
    normalizePtsToLocal,
    applyInverseElTransformToPoint,
    svgPointFromMouse
} from '../Utils/lienzo.geometry';
import { pick, readUserNameFromLocalStorage, safeJson } from '../Utils/lienzo.storage';
import { guardarAcuerdoFinal } from '../Utils/lienzo.http';

export const useLienzoModel = (navigate: (path: string) => void): LienzoModel => {
    // --- ESTADOS BASE ---
    const [elementos, setElementos] = useState<any[]>([]);
    const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
    const [seleccionadosIds, setSeleccionadosIds] = useState<number[]>([]);
    const [herramientaActiva, setHerramientaActiva] = useState<Herramienta>(null);
    const [menuFigurasOpen, setMenuFigurasOpen] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
    const [colorGlobal, setColorGlobal] = useState('#003385');
    const [grosorLapiz, setGrosorLapiz] = useState(3);
    const [dibujando, setDibujando] = useState(false);

    // --- ESTADOS DE MODO Y METADATOS ---
    const [modo, setModo] = useState<{ tipo: number, id?: number } | null>(null);
    const [tituloAcuerdo, setTituloAcuerdo] = useState('No acuerdo seleccionado');
    const [autorNombre, setAutorNombre] = useState('—');
    const [modoPuntos, setModoPuntos] = useState(false);
    const [dragHandle, setDragHandle] = useState<DragHandle>(null);

    // --- REFS ---
    const idCapaDibujoActual = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const creandoTrazoId = useRef<number | null>(null);
    const creandoTrazoStartWorld = useRef<Pt | null>(null);

    const herramientaActivaRef = useRef(herramientaActiva);
    const seleccionadosIdsRef = useRef(seleccionadosIds);
    const modoPuntosRef = useRef(modoPuntos);

    // --- EFECTOS DE SINCRONIZACIÓN ---
    useEffect(() => {
        herramientaActivaRef.current = herramientaActiva;
        seleccionadosIdsRef.current = seleccionadosIds;
        modoPuntosRef.current = modoPuntos;
    }, [herramientaActiva, seleccionadosIds, modoPuntos]);

    const seleccionado = elementos.find((el) => el.id === seleccionadoId);
    const modoSeleccionActivo = (herramientaActiva === null || herramientaActiva === 'multiseleccion') && !modoPuntos;

    // --- CARGA INICIAL SEGÚN MODO ---
    useEffect(() => {
        const modoRaw = localStorage.getItem('modo');
        const modoParsed = modoRaw ? JSON.parse(modoRaw) : { tipo: 1 };
        setModo(modoParsed);

        if (modoParsed.tipo === 3) {
            // MODO 3: EDICIÓN (Lee de temp_cambio)
            const tempCambio = localStorage.getItem('temp_cambio');
            if (tempCambio) {
                const data = JSON.parse(tempCambio);
                setTituloAcuerdo(data.titulo || 'Editando Acuerdo');
                setElementos(data.elementos || []);
                setAutorNombre(readUserNameFromLocalStorage());
            }
        } else if (modoParsed.tipo === 2) {
            // MODO 2: TEMPLATE (Lienzo limpio)
            setTituloAcuerdo("Nueva Plantilla");
            setElementos([]);
            setAutorNombre(readUserNameFromLocalStorage());
        } else {
            // MODO 1: CREACIÓN (Lee de temp_acuerdo)
            const temp = localStorage.getItem('temp_acuerdo');
            if (temp) {
                try {
                    const parsed = safeJson(temp);
                    if (parsed) {
                        const titulo = String(pick(parsed, ['Titulo', 'titulo'], 'Nuevo Acuerdo'));
                        setTituloAcuerdo(titulo);
                        setAutorNombre(readUserNameFromLocalStorage());

                        setElementos((prev) => {
                            if (prev.length > 0) return prev;
                            const ahora = Date.now();
                            const descBreve = String(pick(parsed, ['Descripcion', 'descripcion'], 'Sin descripción breve'));
                            const descDetalle = String(pick(parsed, ['DetallesDescripcion', 'detallesDescripcion'], ''));

                            return [
                                { id: ahora, type: 'texto', text: titulo, x: 50, y: 50, width: 500, height: 100, fill: '#003385', fontSize: 32, fontFamily: 'Arial', fontWeight: 'bold', rotation: 0, flipX: false, saturation: 1 },
                                { id: ahora + 1, type: 'texto', text: descBreve, x: 50, y: 120, width: 500, height: 80, fill: '#1e293b', fontSize: 18, fontFamily: 'Arial', rotation: 0, flipX: false, saturation: 1 },
                                { id: ahora + 2, type: 'texto', text: descDetalle, x: 50, y: 180, width: 600, height: 500, fill: '#64748b', fontSize: 14, fontFamily: 'Arial', rotation: 0, flipX: false, saturation: 1 }
                            ];
                        });
                    }
                } catch (error) {
                    console.error("[Carga Inicial] Error:", error);
                }
            }
        }
    }, []);

    // --- MANEJADORES DE EVENTOS ---
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

    const actualizarAtributo = useCallback((id: number, cambios: any) => {
        setElementos((prev) => prev.map((el) => (el.id === id ? { ...el, ...cambios } : el)));
    }, []);

    const manejarCambioColor = (nuevoColor: string) => {
        setColorGlobal(nuevoColor);
        if (seleccionadoId) {
            const el = elementos.find((x) => x.id === seleccionadoId);
            if (el && isStrokeType(el.type)) actualizarAtributo(seleccionadoId, { stroke: nuevoColor });
            else actualizarAtributo(seleccionadoId, { fill: nuevoColor });
        }
    };

    const eliminarElemento = (id: number) => {
        setElementos((prev) => prev.filter((x) => x.id !== id));
        setSeleccionadosIds((prev) => prev.filter((x) => x !== id));
        if (seleccionadoId === id) setSeleccionadoId(null);
    };

    const limpiarSeleccion = useCallback(() => {
        setSeleccionadoId(null);
        setSeleccionadosIds([]);
    }, []);

    const seleccionarElementoCanvas = useCallback((id: number) => {
        setSeleccionadoId(id);
        setSeleccionadosIds([id]);
    }, []);

    const seleccionarElementoDesdeCapas = useCallback((id: number) => {
        setSeleccionadoId(id);
        setSeleccionadosIds((prev) => {
            const nuevo = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            return nuevo;
        });
    }, []);

    const subirImagen = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => {
                const nuevo = {
                    id: Date.now(), type: 'imagen', x: 50, y: 50, width: 200, height: 200,
                    rotation: 0, flipX: false, url: f.target?.result, saturation: 1
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
        if (Array.isArray(base.pointsArr) && base.pointsArr.length >= 3) return { ...base, pointsArr: base.pointsArr };
        const pts = getBasePolygonPoints(base.type, w, h);
        return { ...base, pointsArr: pts };
    };

    const manejarClickLienzo = (e: any) => {
        if (modoPuntos) return;
        const target = e.target as HTMLElement;
        const esObjeto = target.closest('[data-elid]') || target.closest('[data-editor="1"]');
        if (esObjeto) return;
        if (isStrokeType(herramientaActiva || '')) return;
        if (herramientaActiva === 'lapiz') return;
        if (!herramientaActiva || herramientaActiva === 'multiseleccion') {
            limpiarSeleccion();
            return;
        }
        if (herramientaActiva === 'goma') {
            const targetEl = e.target as any;
            const idStr = targetEl?.dataset?.elid;
            if (idStr) eliminarElemento(Number(idStr));
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const baseNuevo = {
            id: Date.now(), type: herramientaActiva,
            x: e.clientX - rect.left - 50, y: e.clientY - rect.top - 50,
            width: herramientaActiva === 'texto' ? 250 : 120, height: 120,
            fill: colorGlobal, rotation: 0, flipX: false, fontSize: 16,
            fontFamily: 'Arial', text: herramientaActiva === 'texto' ? 'Escribe aquí...' : '', saturation: 1
        };
        const nuevo = ensurePolygonPoints(baseNuevo);
        setElementos((prev) => [...prev, nuevo]);
        setSeleccionadoId(nuevo.id);
        setSeleccionadosIds([nuevo.id]);
        setHerramientaActiva(null);
    };

    const iniciarDibujo = (e: any) => {
        if (herramientaActiva && isStrokeType(herramientaActiva)) {
            if (!svgRef.current) return;
            const start = svgPointFromMouse(svgRef.current, e.clientX, e.clientY);
            const id = Date.now();
            creandoTrazoId.current = id;
            creandoTrazoStartWorld.current = start;
            setDibujando(true);
            const nuevo: any = {
                id, type: herramientaActiva, x: start.x, y: start.y, width: 1, height: 1,
                rotation: 0, flipX: false, stroke: colorGlobal, strokeWidth: Math.max(1, grosorLapiz),
                pointsArr: herramientaActiva === 'curva' ? [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }] : [{ x: 0, y: 0 }, { x: 0, y: 0 }]
            };
            setElementos((prev) => [...prev, nuevo]);
            setSeleccionadoId(id);
            setSeleccionadosIds([id]);
            return;
        }
        if (herramientaActiva !== 'lapiz') return;
        setDibujando(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const moveCommand = `M ${e.clientX - rect.left} ${e.clientY - rect.top}`;
        const ultimaCapa = elementos[elementos.length - 1];
        if (idCapaDibujoActual.current && ultimaCapa?.id === idCapaDibujoActual.current) {
            setElementos((prev) => prev.map((el) => el.id === idCapaDibujoActual.current ? { ...el, points: (el.points || '') + ' ' + moveCommand, strokeWidth: grosorLapiz } : el));
        } else {
            const id = Date.now();
            idCapaDibujoActual.current = id;
            setElementos((prev) => [...prev, { id, type: 'lapiz', x: 0, y: 0, width: canvasSize.w, height: canvasSize.h, fill: colorGlobal, rotation: 0, points: moveCommand, strokeWidth: grosorLapiz }]);
        }
    };

    const dibujar = (e: any) => {
        if (dibujando && creandoTrazoId.current && svgRef.current && creandoTrazoStartWorld.current) {
            const id = creandoTrazoId.current;
            const el = elementos.find((x) => x.id === id);
            if (!el || !isStrokeType(el.type)) return;
            const startWorld = creandoTrazoStartWorld.current;
            const endWorld = svgPointFromMouse(svgRef.current, e.clientX, e.clientY);
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
            return;
        }
        if (!dibujando || !idCapaDibujoActual.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
        const nextPoint = `L ${x} ${y}`;
        setElementos((prev) => prev.map((el) => (el.id === idCapaDibujoActual.current ? { ...el, points: (el.points || '') + ' ' + nextPoint } : el)));
    };

    const clonarElemento = () => {
        if (!seleccionado) return;
        const nuevoBase = { ...seleccionado, id: Date.now(), x: (seleccionado.x || 0) + 20, y: (seleccionado.y || 0) + 20 };
        const nuevo = Array.isArray(nuevoBase.pointsArr) && nuevoBase.pointsArr.length >= 2
            ? { ...nuevoBase, pointsArr: clonePts(nuevoBase.pointsArr) }
            : isEditablePolygon(nuevoBase.type)
                ? { ...nuevoBase, pointsArr: Array.isArray(nuevoBase.pointsArr) ? clonePts(nuevoBase.pointsArr) : getBasePolygonPoints(nuevoBase.type, nuevoBase.width || 120, nuevoBase.height || 120) }
                : nuevoBase;
        setElementos((prev) => [...prev, nuevo]);
        setSeleccionadoId(nuevo.id);
        setSeleccionadosIds([nuevo.id]);
    };

    const alArrastrando = useCallback((id: number, dx: number, dy: number) => {
        if (modoPuntosRef.current) return;
        if (herramientaActivaRef.current === 'multiseleccion') {
            const currentIds = seleccionadosIdsRef.current;
            const setSel = new Set(currentIds.includes(id) ? currentIds : [...currentIds, id]);
            setElementos((prev) => prev.map((el) => setSel.has(el.id) ? { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy } : el));
            return;
        }
        setElementos((prev) => prev.map((el) => el.id === id ? { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy } : el));
    }, []);

    const alTerminarArrastre = useCallback((id: number, x: number, y: number) => {
        actualizarAtributo(id, { x, y });
    }, [actualizarAtributo]);

    const moverCapa = (id: number, direction: 'up' | 'down') => {
        setElementos((prev) => {
            const idx = prev.findIndex((x) => x.id === id);
            if (idx === -1) return prev;
            const next = [...prev];
            if (direction === 'up') {
                if (idx >= next.length - 1) return prev;
                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            } else {
                if (idx <= 0) return prev;
                [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
            }
            return next;
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
        const svgElement = document.querySelector('svg#lienzo-svg') as SVGSVGElement | null;
        if (!svgElement) return;
        const clone = svgElement.cloneNode(true) as SVGSVGElement;
        const w = canvasSize?.w ?? 800;
        const h = canvasSize?.h ?? 600;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', String(w));
        clone.setAttribute('height', String(h));
        clone.setAttribute('viewBox', `0 0 ${w} ${h}`);
        const clean = new XMLSerializer().serializeToString(clone);
        const blob = new Blob([clean], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `lienzo_${Date.now()}.svg`;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    };

    // --- GUARDADO FINAL ---
    const manejarGuardadoFinal = async () => {
        if (!modo) {
            console.error("Modo no definido");
            return;
        }
        // Inyectamos el objeto modo aquí para que lienzo.http.ts lo reciba
        await guardarAcuerdoFinal({ elementos, canvasSize, navigate, modo });
    };

    const startDragPoint = (e: any, elId: number, idx: number) => {
        e.stopPropagation(); e.preventDefault(); setDragHandle({ elId, idx });
    };

    const onSvgMouseMove = (e: any) => {
        if (herramientaActiva === 'lapiz' || (dibujando && creandoTrazoId.current)) { dibujar(e); return; }
        if (!modoPuntos || !dragHandle || !svgRef.current) return;
        const el = elementos.find((x) => x.id === dragHandle.elId);
        if (!el || (!isEditableByPoints(el) && !isEditablePolygon(el.type))) return;
        const pWorld = svgPointFromMouse(svgRef.current, e.clientX, e.clientY);
        const local = applyInverseElTransformToPoint(pWorld, el);
        setElementos((prev) => prev.map((item) => {
            if (item.id !== el.id) return item;
            const basePts = Array.isArray(item.pointsArr) && item.pointsArr.length >= 2 ? clonePts(item.pointsArr) : (isEditablePolygon(item.type) ? getBasePolygonPoints(item.type, item.width || 120, item.height || 120) : []);
            if (!basePts[dragHandle!.idx]) return item;
            basePts[dragHandle!.idx] = { x: clamp(local.x, 0, item.width || 120), y: clamp(local.y, 0, item.height || 120) };
            return { ...item, pointsArr: basePts };
        }));
    };

    const onSvgMouseUp = () => {
        if (dibujando && creandoTrazoId.current) { creandoTrazoId.current = null; creandoTrazoStartWorld.current = null; setDibujando(false); return; }
        if (herramientaActiva === 'lapiz') { setDibujando(false); return; }
        setDragHandle(null);
    };

    const redimensionarElemento = useCallback((id: number, width: number, height: number) => {
        setElementos((prev) => prev.map((el) => {
            if (el.id !== id) return el;
            const oldW = el.width || 120; const oldH = el.height || 120;
            const next: any = { ...el, width, height };
            if (Array.isArray(el.pointsArr) && el.pointsArr.length >= 2) {
                const sx = oldW > 0 ? width / oldW : 1; const sy = oldH > 0 ? height / oldH : 1;
                next.pointsArr = el.pointsArr.map((p: Pt) => ({ x: clamp(p.x * sx, 0, width), y: clamp(p.y * sy, 0, height) }));
            }
            return next;
        }));
    }, []);

    const fontsDisponibles = ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Georgia', 'Times New Roman', 'Courier New'];
    const presetsLienzo = [{ w: 800, h: 600 }, { w: 1024, h: 768 }, { w: 1280, h: 720 }, { w: 1920, h: 1080 }];
    const FIGURAS = [{ id: 'rectangulo', label: 'Rectángulo' }, { id: 'circulo', label: 'Círculo' }, { id: 'triangulo', label: 'Triángulo' }, { id: 'estrella', label: 'Estrella' }, { id: 'rombo', label: 'Rombo' }, { id: 'hexagono', label: 'Hexágono' }, { id: 'octagono', label: 'Octágono' }] as const;
    const tiposConSaturacion = useMemo(() => new Set(['rectangulo', 'circulo', 'triangulo', 'estrella', 'rombo', 'hexagono', 'octagono', 'imagen']), []);

    const canEditPoints = useMemo(() => {
        if (!seleccionado) return false;
        return isEditablePolygon(seleccionado.type) || (Array.isArray(seleccionado.pointsArr) && seleccionado.pointsArr.length >= 2);
    }, [seleccionado]);

    useEffect(() => { if (modoPuntos && !canEditPoints) setModoPuntos(false); }, [modoPuntos, canEditPoints]);

    const sidebarBtnClass = (active: boolean) => `p-4 rounded-lg transition-all duration-200 flex items-center justify-center ${active ? 'bg-[#003385] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`;
    const controlLabel = 'text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block';
    const inputStyle = 'w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2';

    return {
        elementos, seleccionadoId, seleccionadosIds, seleccionado, herramientaActiva, menuFigurasOpen, canvasSize, colorGlobal, grosorLapiz, dibujando, tituloAcuerdo, autorNombre, modoPuntos, dragHandle, fileInputRef, svgRef, idCapaDibujoActual, modoSeleccionActivo, fontsDisponibles, presetsLienzo, FIGURAS, tiposConSaturacion, canEditPoints, sidebarBtnClass, controlLabel, inputStyle, modo,
        setElementos, setSeleccionadoId, setSeleccionadosIds, setHerramientaActiva, setMenuFigurasOpen, setCanvasSize, setColorGlobal, setGrosorLapiz, setModoPuntos,
        actualizarAtributo, manejarCambioColor, eliminarElemento, limpiarSeleccion, seleccionarElementoCanvas, seleccionarElementoDesdeCapas, subirImagen, manejarClickLienzo, iniciarDibujo, dibujar, clonarElemento, alArrastrando, alTerminarArrastre, moverCapa, moverCapaExtremo, descargarSVG, manejarGuardadoFinal, startDragPoint, onSvgMouseMove, onSvgMouseUp, redimensionarElemento
    };
};