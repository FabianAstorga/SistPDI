import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Navbar } from '../../components/Navbar';
import {
    Square, Circle, Type, Download, Layers, Trash2,
    ImageIcon as LucideImageIcon, ChevronUp, ChevronDown,
    ArrowUpToLine, ArrowDownToLine, MousePointer2, Pencil, Shapes, Copy, Settings2, Triangle
} from 'lucide-react';
import type { TipoElemento, ElementoCanvas } from '../../../types/canvas';

const DraggableItem = ({ el, children, alTerminarArrastre, alSeleccionar, estaSeleccionado, alRedimensionar, puedeInteractuar }: any) => {
    const nodeRef = useRef(null);
    const [redimensionando, setRedimensionando] = useState(false);

    const iniciarRedimension = (e: React.MouseEvent) => {
        e.stopPropagation(); e.preventDefault();
        setRedimensionando(true);
        const startX = e.clientX; const startY = e.clientY;
        const startW = el.width; const startH = el.height;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            alRedimensionar(el.id, Math.max(20, startW + deltaX), Math.max(20, startH + deltaY));
        };
        const onMouseUp = () => {
            setRedimensionando(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const cx = el.width / 2;
    const cy = el.height / 2;

    return (
        <Draggable
            nodeRef={nodeRef} bounds="#canvas-white-sheet"
            position={{ x: el.x, y: el.y }}
            onStop={(_e, data) => alTerminarArrastre(el.id, data.x, data.y)}
            onStart={() => alSeleccionar(el.id)}
            disabled={redimensionando || !puedeInteractuar}
        >
            <g
                ref={nodeRef}
                transform={`rotate(${el.rotation || 0}, ${cx}, ${cy})`}
                style={{ pointerEvents: puedeInteractuar ? 'auto' : 'none' }}
            >
                {estaSeleccionado && (
                    <>
                        <rect x={-2} y={-2} width={el.width + 4} height={(el.type === 'circulo' ? el.width : el.height) + 4}
                            fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3" style={{ pointerEvents: 'none' }} />
                        <rect x={el.width - 4} y={(el.type === 'circulo' ? el.width : el.height) - 4}
                            width={8} height={8} fill="white" stroke="#3b82f6" strokeWidth="2"
                            className="cursor-nwse-resize" onMouseDown={iniciarRedimension}
                            style={{ pointerEvents: 'auto' }}
                        />
                    </>
                )}
                <g onClick={(e) => { if (puedeInteractuar) { e.stopPropagation(); alSeleccionar(el.id); } }} className={puedeInteractuar ? "cursor-move" : ""}>
                    {children}
                </g>
            </g>
        </Draggable>
    );
};

export const Lienzo = () => {
    const [elementos, setElementos] = useState<ElementoCanvas[]>([]);
    const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
    const [herramientaActiva, setHerramientaActiva] = useState<TipoElemento | null>(null);
    const [menuFigurasOpen, setMenuFigurasOpen] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

    // NUEVO: Color predefinido para nuevas figuras y trazos
    const [colorGlobal, setColorGlobal] = useState('#003366');

    const [dibujando, setDibujando] = useState(false);
    const idCapaDibujoActual = useRef<number | null>(null);

    const seleccionado = elementos.find(el => el.id === seleccionadoId);
    const modoSeleccionActivo = herramientaActiva === null;

    const actualizarAtributo = (id: number, cambios: Partial<ElementoCanvas>) => {
        setElementos(prev => prev.map(el => el.id === id ? { ...el, ...cambios } : el));
    };

    const manejarCambioColor = (nuevoColor: string) => {
        setColorGlobal(nuevoColor);
        if (seleccionadoId) {
            actualizarAtributo(seleccionadoId, { fill: nuevoColor });
        }
    };

    const moverCapa = (id: number, direccion: 'subir' | 'bajar' | 'frente' | 'fondo') => {
        const index = elementos.findIndex(el => el.id === id);
        if (index === -1) return;
        const nuevos = [...elementos];
        const [elemento] = nuevos.splice(index, 1);
        switch (direccion) {
            case 'subir': nuevos.splice(Math.min(index + 1, elementos.length - 1), 0, elemento); break;
            case 'bajar': nuevos.splice(Math.max(index - 1, 0), 0, elemento); break;
            case 'frente': nuevos.push(elemento); break;
            case 'fondo': nuevos.unshift(elemento); break;
        }
        setElementos(nuevos);
    };

    const manejarClickLienzo = (e: React.MouseEvent<SVGSVGElement>) => {
        if (herramientaActiva === 'lapiz') return;
        if (!herramientaActiva) {
            setSeleccionadoId(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - 50;
        const y = e.clientY - rect.top - 50;

        const nuevo: ElementoCanvas = {
            id: Date.now(), type: herramientaActiva, x, y,
            width: herramientaActiva === 'texto' ? 200 : 100,
            height: herramientaActiva === 'texto' ? 24 : 100,
            fill: colorGlobal, // Usa el color predefinido
            rotation: 0, fontSize: 20, fontFamily: 'Arial',
            text: herramientaActiva === 'texto' ? 'Texto Nuevo 😎' : undefined
        };
        setElementos([...elementos, nuevo]);
        setSeleccionadoId(nuevo.id);
        setHerramientaActiva(null);
        idCapaDibujoActual.current = null;
    };

    const clonarElemento = () => {
        if (!seleccionado) return;
        const clon = { ...seleccionado, id: Date.now(), x: seleccionado.x + 20, y: seleccionado.y + 20 };
        setElementos([...elementos, clon]);
        setSeleccionadoId(clon.id);
    };

    const iniciarDibujo = (e: React.MouseEvent) => {
        if (herramientaActiva !== 'lapiz') return;
        setDibujando(true);
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const startPoint = `M ${e.clientX - rect.left} ${e.clientY - rect.top}`;

        if (!idCapaDibujoActual.current) {
            const id = Date.now();
            idCapaDibujoActual.current = id;
            const nuevaCapaDibujo: ElementoCanvas = {
                id, type: 'lapiz', x: 0, y: 0, width: canvasSize.w, height: canvasSize.h,
                fill: colorGlobal, // Usa el color predefinido para el trazo
                rotation: 0, points: startPoint
            };
            setElementos(prev => [...prev, nuevaCapaDibujo]);
        } else {
            setElementos(prev => prev.map(el =>
                el.id === idCapaDibujoActual.current
                    ? { ...el, points: (el.points || "") + " " + startPoint }
                    : el
            ));
        }
    };

    const dibujar = (e: React.MouseEvent) => {
        if (!dibujando || !idCapaDibujoActual.current) return;
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const nextPoint = `L ${e.clientX - rect.left} ${e.clientY - rect.top}`;
        setElementos(prev => prev.map(el =>
            el.id === idCapaDibujoActual.current ? { ...el, points: (el.points || "") + " " + nextPoint } : el
        ));
    };

    const terminarDibujo = () => setDibujando(false);

    const descargarSVG = () => {
        let svg = `<svg width="${canvasSize.w}" height="${canvasSize.h}" viewBox="0 0 ${canvasSize.w} ${canvasSize.h}" xmlns="http://www.w3.org/2000/svg" style="background:white">\n`;
        elementos.forEach(el => {
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            const transform = `rotate(${el.rotation || 0} ${cx} ${cy})`;
            if (el.type === 'rectangulo') svg += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'circulo') svg += `  <circle cx="${cx}" cy="${cy}" r="${el.width / 2}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'triangulo') svg += `  <polygon points="${cx},${el.y} ${el.x},${el.y + el.height} ${el.x + el.width},${el.y + el.height}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'lapiz') svg += `  <path d="${el.points}" stroke="${el.fill}" fill="none" stroke-width="2" stroke-linecap="round" />\n`;
            else if (el.type === 'texto') svg += `  <text x="${el.x}" y="${el.y + el.height}" fill="${el.fill}" font-family="${el.fontFamily}" font-size="${el.fontSize}" transform="${transform}">${el.text}</text>\n`;
        });
        svg += `</svg>`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        link.download = `pdi_diseno.svg`; link.click();
    };

    return (
        <div className="h-screen bg-[#f3f4f6] flex flex-col overflow-hidden text-gray-800 font-sans">
            <Navbar />

            <div className="mt-20 h-11 shrink-0 bg-transparent flex items-center px-6 justify-between">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-400 uppercase text-[11px] tracking-widest">Editor PDI Studio</span>
                    {herramientaActiva && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold animate-pulse uppercase text-[9px]">Modo {herramientaActiva} activo</span>}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-5 shadow-sm z-20">
                    <button onClick={() => { setHerramientaActiva(null); idCapaDibujoActual.current = null; }} className={`p-3 rounded-xl border transition-all ${modoSeleccionActivo ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-blue-50'}`} title="Seleccionar">
                        <MousePointer2 size={22} />
                    </button>

                    <div className="relative">
                        <button onClick={() => setMenuFigurasOpen(!menuFigurasOpen)} className={`p-3 rounded-xl border transition-all ${['rectangulo', 'circulo', 'triangulo'].includes(herramientaActiva!) ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-blue-50'}`} title="Figuras">
                            <Shapes size={22} />
                        </button>
                        {menuFigurasOpen && (
                            <div className="absolute left-16 top-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 flex flex-col space-y-2 z-50">
                                <button onClick={() => { setHerramientaActiva('rectangulo'); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Square size={20} /></button>
                                <button onClick={() => { setHerramientaActiva('circulo'); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Circle size={20} /></button>
                                <button onClick={() => { setHerramientaActiva('triangulo'); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Triangle size={20} /></button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => { setHerramientaActiva('lapiz'); setSeleccionadoId(null); }} className={`p-3 rounded-xl border transition-all ${herramientaActiva === 'lapiz' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-blue-50'}`} title="Lápiz">
                        <Pencil size={22} />
                    </button>

                    <button onClick={() => setHerramientaActiva('texto')} className={`p-3 rounded-xl border transition-all ${herramientaActiva === 'texto' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-blue-50'}`} title="Texto">
                        <Type size={22} />
                    </button>
                </aside>

                <main className="flex-1 overflow-auto bg-[#e5e7eb] flex items-center justify-center p-20" onClick={() => setSeleccionadoId(null)}>
                    <div id="canvas-white-sheet" className="bg-white shadow-2xl relative shrink-0 rounded-sm overflow-hidden" style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }} onClick={(e) => e.stopPropagation()}>
                        <svg
                            width="100%" height="100%"
                            viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
                            onClick={manejarClickLienzo}
                            onMouseDown={iniciarDibujo}
                            onMouseMove={dibujar}
                            onMouseUp={terminarDibujo}
                            className={herramientaActiva ? 'cursor-crosshair' : 'cursor-default'}
                        >
                            {elementos.map(el => (
                                <DraggableItem
                                    key={el.id} el={el}
                                    estaSeleccionado={seleccionadoId === el.id}
                                    alSeleccionar={setSeleccionadoId}
                                    alTerminarArrastre={(id: number, x: number, y: number) => actualizarAtributo(id, { x, y })}
                                    alRedimensionar={(id: number, width: number, height: number) => actualizarAtributo(id, { width, height })}
                                    puedeInteractuar={modoSeleccionActivo}
                                >
                                    {el.type === 'rectangulo' && <rect width={el.width} height={el.height} fill={el.fill} rx="2" />}
                                    {el.type === 'circulo' && <circle cx={el.width / 2} cy={el.width / 2} r={el.width / 2} fill={el.fill} />}
                                    {el.type === 'triangulo' && <polygon points={`${el.width / 2},0 0,${el.height} ${el.width},${el.height}`} fill={el.fill} />}
                                    {el.type === 'lapiz' && <path d={el.points} stroke={el.fill} fill="none" strokeWidth="2" strokeLinecap="round" />}
                                    {el.type === 'texto' && <text y={el.height} fill={el.fill} fontSize={el.fontSize} fontFamily={el.fontFamily} fontWeight="bold" style={{ userSelect: 'none' }}>{el.text}</text>}
                                </DraggableItem>
                            ))}
                        </svg>
                    </div>
                </main>

                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm shrink-0">
                    <div className="p-4 bg-gray-50 border-b font-bold uppercase text-[11px] text-gray-500 flex items-center justify-between tracking-widest">
                        <span>Propiedades y Capas</span> <Layers size={14} />
                    </div>

                    <div className="p-4 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex items-center space-x-2 text-gray-400 mb-2">
                            <Settings2 size={12} /> <span className="text-[9px] font-black uppercase tracking-widest">Lienzo</span>
                        </div>
                        <div className="flex space-x-2">
                            <input type="number" value={canvasSize.w} onChange={(e) => setCanvasSize({ ...canvasSize, w: Number(e.target.value) })} className="w-full border rounded p-1 text-[10px]" title="Ancho" />
                            <input type="number" value={canvasSize.h} onChange={(e) => setCanvasSize({ ...canvasSize, h: Number(e.target.value) })} className="w-full border rounded p-1 text-[10px]" title="Alto" />
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-100 min-h-[160px]">
                        {/* COLOR GLOBAL / DEL OBJETO: Ahora siempre visible para predefinir */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                    {seleccionadoId ? 'Color del Objeto' : 'Color Predeterminado'}
                                </label>
                                <input
                                    type="color"
                                    value={seleccionado ? (seleccionado.fill === 'none' ? colorGlobal : seleccionado.fill) : colorGlobal}
                                    onChange={(e) => manejarCambioColor(e.target.value)}
                                    className="w-full h-8 cursor-pointer rounded border-gray-200"
                                />
                            </div>

                            {seleccionado && (
                                <>
                                    <div className="flex justify-between items-center border-t pt-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Transformar</label>
                                        <button onClick={(e) => { e.stopPropagation(); clonarElemento(); }} className="text-blue-600 text-[10px] font-bold flex items-center hover:underline"><Copy size={12} className="mr-1" /> Clonar</button>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 text-[9px]">Rotación ({seleccionado.rotation || 0}°)</label>
                                        <input type="range" min="0" max="360" value={seleccionado.rotation || 0} onChange={(e) => actualizarAtributo(seleccionado.id, { rotation: Number(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>

                                    {seleccionado.type === 'texto' && (
                                        <div className="space-y-2 border-t pt-2">
                                            <input type="text" value={seleccionado.text} onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })} className="w-full border p-2 text-xs rounded focus:ring-1 focus:ring-blue-400 outline-none" />
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block text-[9px]">Tamaño Fuente: {seleccionado.fontSize}px</label>
                                            <input type="range" min="10" max="200" value={seleccionado.fontSize} onChange={(e) => actualizarAtributo(seleccionado.id, { fontSize: Number(e.target.value), height: Number(e.target.value) * 1.2 })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                            <select value={seleccionado.fontFamily} onChange={(e) => actualizarAtributo(seleccionado.id, { fontFamily: e.target.value })} className="w-full border p-1 text-xs rounded font-bold">
                                                <option value="Arial">Arial</option>
                                                <option value="Times New Roman">Serif</option>
                                                <option value="Courier New">Monospace</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-4 gap-1">
                                        <button onClick={() => moverCapa(seleccionado.id, 'fondo')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded flex justify-center"><ArrowDownToLine size={14} /></button>
                                        <button onClick={() => moverCapa(seleccionado.id, 'bajar')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded flex justify-center"><ChevronDown size={14} /></button>
                                        <button onClick={() => moverCapa(seleccionado.id, 'subir')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded flex justify-center"><ChevronUp size={14} /></button>
                                        <button onClick={() => moverCapa(seleccionado.id, 'frente')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded flex justify-center"><ArrowUpToLine size={14} /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-gray-50/50">
                        {[...elementos].reverse().map((el) => (
                            <div
                                key={el.id}
                                onClick={() => { setHerramientaActiva(null); setSeleccionadoId(el.id); }}
                                className={`p-2 border rounded flex items-center justify-between transition-all cursor-pointer group ${seleccionadoId === el.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center space-x-3 pointer-events-none">
                                    <LucideImageIcon size={14} className={seleccionadoId === el.id ? "text-blue-500" : "text-gray-400"} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{el.type === 'lapiz' ? 'DIBUJO LIBRE' : el.type}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setElementos(elementos.filter(item => item.id !== el.id)); if (seleccionadoId === el.id) setSeleccionadoId(null); }}
                                    className="text-red-400 hover:text-red-600 hidden group-hover:block transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button onClick={descargarSVG} className="w-full bg-[#003366] text-[#FFCC00] py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all hover:bg-[#00264d] shadow-lg">
                            <Download size={16} /> <span>GUARDAR SVG</span>
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Lienzo;