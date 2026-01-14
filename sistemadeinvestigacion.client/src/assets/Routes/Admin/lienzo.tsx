import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Navbar } from '../../components/Navbar';
import {
    Square, Circle, Type, Download, Layers, Trash2, Eraser,
    ImageIcon as LucideImageIcon, ChevronUp, ChevronDown,
    ArrowUpToLine, ArrowDownToLine, MousePointer2, Pencil, Shapes, Copy, Settings2, Triangle, Star, Hexagon,
    RotateCw, RefreshCcw, FlipHorizontal, Maximize2
} from 'lucide-react';

const DraggableItem = ({ el, children, alTerminarArrastre, alSeleccionar, estaSeleccionado, alRedimensionar, puedeInteractuar }) => {
    const nodeRef = useRef(null);
    const iniciarResize = (e, corner) => {
        e.stopPropagation(); e.preventDefault();
        const startX = e.clientX; const startY = e.clientY;
        const startW = el.width; const startH = el.height;
        const startPosX = el.x; const startPosY = el.y;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            let newW = startW; let newH = startH; let newX = startPosX; let newY = startPosY;
            const MIN_SIZE = 10;
            if (corner.includes('e')) newW = Math.max(MIN_SIZE, startW + deltaX);
            if (corner.includes('s')) newH = Math.max(MIN_SIZE, startH + deltaY);
            if (corner.includes('w')) {
                newW = Math.max(MIN_SIZE, startW - deltaX);
                if (newW > MIN_SIZE) newX = startPosX + deltaX;
            }
            if (corner.includes('n')) {
                newH = Math.max(MIN_SIZE, startH - deltaY);
                if (newH > MIN_SIZE) newY = startPosY + deltaY;
            }
            alRedimensionar(el.id, newW, newH);
            alTerminarArrastre(el.id, newX, newY);
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: el.x, y: el.y }}
            onStop={(_e, data) => alTerminarArrastre(el.id, data.x, data.y)}
            onStart={() => alSeleccionar(el.id)}
            disabled={!puedeInteractuar}
        >
            <g ref={nodeRef} style={{ cursor: puedeInteractuar ? 'move' : 'default' }}>
                {estaSeleccionado && el.type !== 'lapiz' && (
                    <>
                        <rect x={-2} y={-2} width={el.width + 4} height={el.height + 4} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
                        {['nw', 'ne', 'sw', 'se'].map((corner) => (
                            <circle key={corner} cx={corner.includes('e') ? el.width : 0} cy={corner.includes('s') ? el.height : 0} r={6} fill="white" stroke="#3b82f6" strokeWidth="2" className={`cursor-${corner}-resize`} onMouseDown={(e) => iniciarResize(e, corner)} />
                        ))}
                    </>
                )}
                <g transform={`translate(${el.width / 2}, ${el.height / 2}) scale(${el.flipX ? -1 : 1}, 1) rotate(${el.rotation || 0}) translate(${-el.width / 2}, ${-el.height / 2})`}>
                    <g onClick={(e) => { if (puedeInteractuar) { e.stopPropagation(); alSeleccionar(el.id); } }}>
                        {children}
                    </g>
                </g>
            </g>
        </Draggable>
    );
};

export const Lienzo = () => {
    const [elementos, setElementos] = useState([]);
    const [seleccionadoId, setSeleccionadoId] = useState(null);
    const [herramientaActiva, setHerramientaActiva] = useState(null);
    const [menuFigurasOpen, setMenuFigurasOpen] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
    const [colorGlobal, setColorGlobal] = useState('#003385');
    const [grosorLapiz, setGrosorLapiz] = useState(3);
    const [dibujando, setDibujando] = useState(false);
    const idCapaDibujoActual = useRef(null);
    const fileInputRef = useRef(null);

    const seleccionado = elementos.find(el => el.id === seleccionadoId);
    const modoSeleccionActivo = herramientaActiva === null;

    const actualizarAtributo = (id, cambios) => {
        setElementos(prev => prev.map(el => el.id === id ? { ...el, ...cambios } : el));
    };

    const manejarCambioColor = (nuevoColor) => {
        setColorGlobal(nuevoColor);
        if (seleccionadoId) actualizarAtributo(seleccionadoId, { fill: nuevoColor });
    };

    const subirImagen = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => {
                const nuevo = {
                    id: Date.now(), type: 'imagen', x: 50, y: 50,
                    width: 200, height: 200, rotation: 0, flipX: false, url: f.target?.result
                };
                setElementos(prev => [...prev, nuevo]);
                setSeleccionadoId(nuevo.id);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = "";
    };

    const manejarClickLienzo = (e) => {
        if (herramientaActiva === 'lapiz' || !herramientaActiva) {
            if (!herramientaActiva) setSeleccionadoId(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const nuevo = {
            id: Date.now(), type: herramientaActiva,
            x: e.clientX - rect.left - 50, y: e.clientY - rect.top - 50,
            width: herramientaActiva === 'texto' ? 250 : 100, height: 100,
            fill: colorGlobal, rotation: 0, flipX: false, fontSize: 16, fontFamily: 'Arial',
            text: herramientaActiva === 'texto' ? 'Escribe aquí tu texto...' : undefined
        };
        setElementos([...elementos, nuevo]);
        setSeleccionadoId(nuevo.id);
        setHerramientaActiva(null);
        idCapaDibujoActual.current = null;
    };

    const iniciarDibujo = (e) => {
        if (herramientaActiva !== 'lapiz') return;
        setDibujando(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const moveCommand = `M ${e.clientX - rect.left} ${e.clientY - rect.top}`;

        const ultimaCapa = elementos[elementos.length - 1];
        if (idCapaDibujoActual.current && ultimaCapa?.id === idCapaDibujoActual.current) {
            setElementos(prev => prev.map(el =>
                el.id === idCapaDibujoActual.current
                    ? { ...el, points: (el.points || "") + " " + moveCommand, strokeWidth: grosorLapiz }
                    : el
            ));
        } else {
            const id = Date.now();
            idCapaDibujoActual.current = id;
            setElementos(prev => [...prev, {
                id, type: 'lapiz', x: 0, y: 0, width: canvasSize.w, height: canvasSize.h,
                fill: colorGlobal, rotation: 0, points: moveCommand, strokeWidth: grosorLapiz
            }]);
        }
    };

    const dibujar = (e) => {
        if (!dibujando || !idCapaDibujoActual.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const nextPoint = `L ${e.clientX - rect.left} ${e.clientY - rect.top}`;
        setElementos(prev => prev.map(el => el.id === idCapaDibujoActual.current ? { ...el, points: (el.points || "") + " " + nextPoint } : el));
    };

    const clonarElemento = () => {
        if (!seleccionado) return;
        const nuevo = { ...seleccionado, id: Date.now(), x: seleccionado.x + 20, y: seleccionado.y + 20 };
        setElementos([...elementos, nuevo]);
        setSeleccionadoId(nuevo.id);
    };

    const descargarSVG = () => { console.log("Descargando..."); };

    const sidebarBtnClass = (active) => `p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${active ? 'bg-[#003385] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`;
    const controlLabel = "text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block";
    const inputStyle = "w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2";

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans antialiased text-gray-900">
            <Navbar />
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={subirImagen} />

            <div className="flex flex-1 mt-20 overflow-hidden">
                <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4 shadow-sm z-20">
                    <button onClick={() => { setHerramientaActiva(null); idCapaDibujoActual.current = null; }} className={sidebarBtnClass(modoSeleccionActivo)} title="Seleccionar">
                        <MousePointer2 size={20} />
                    </button>
                    <div className="relative">
                        <button onClick={() => setMenuFigurasOpen(!menuFigurasOpen)} className={sidebarBtnClass(['rectangulo', 'circulo', 'triangulo'].includes(herramientaActiva))} title="Figuras">
                            <Shapes size={20} />
                        </button>
                        {menuFigurasOpen && (
                            <div className="absolute left-16 top-0 bg-white shadow-2xl border border-gray-200 rounded-xl p-2 grid grid-cols-2 gap-2 z-50 w-32 animate-in fade-in slide-in-from-left-2">
                                {[
                                    { id: 'rectangulo', icon: Square }, { id: 'circulo', icon: Circle },
                                    { id: 'triangulo', icon: Triangle }, { id: 'estrella', icon: Star }
                                ].map(fig => (
                                    <button key={fig.id} onClick={() => { setHerramientaActiva(fig.id); setMenuFigurasOpen(false); idCapaDibujoActual.current = null; }} className="p-3 hover:bg-blue-50 rounded-lg text-gray-600 flex justify-center transition-colors">
                                        <fig.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => { setHerramientaActiva('lapiz'); setSeleccionadoId(null); }} className={sidebarBtnClass(herramientaActiva === 'lapiz')} title="Lápiz">
                        <Pencil size={20} />
                    </button>
                    <button onClick={() => { setHerramientaActiva('texto'); idCapaDibujoActual.current = null; }} className={sidebarBtnClass(herramientaActiva === 'texto')} title="Texto">
                        <Type size={20} />
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); idCapaDibujoActual.current = null; }} className={sidebarBtnClass(false)} title="Subir Imagen">
                        <LucideImageIcon size={20} />
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => { setHerramientaActiva(null); setSeleccionadoId(null); idCapaDibujoActual.current = null; }} className="p-3 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Borrador">
                        <Eraser size={20} />
                    </button>
                    <button onClick={descargarSVG} className="p-3 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-lg transition-colors mb-2">
                        <Download size={20} />
                    </button>
                </aside>

                <main className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-12" onClick={() => setSeleccionadoId(null)}>
                    <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300">
                        <div id="canvas-white-sheet" className="bg-white rounded-sm overflow-hidden" style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }} onClick={(e) => e.stopPropagation()}>
                            <svg
                                width="100%" height="100%"
                                onClick={manejarClickLienzo}
                                onMouseDown={iniciarDibujo}
                                onMouseMove={dibujar}
                                onMouseUp={() => setDibujando(false)}
                                className={herramientaActiva ? 'cursor-crosshair' : 'cursor-default'}
                            >
                                {elementos.map(el => (
                                    <DraggableItem key={el.id} el={el} estaSeleccionado={seleccionadoId === el.id} alSeleccionar={setSeleccionadoId}
                                        alTerminarArrastre={(id, x, y) => actualizarAtributo(id, { x, y })}
                                        alRedimensionar={(id, width, height) => actualizarAtributo(id, { width, height })}
                                        puedeInteractuar={modoSeleccionActivo}>
                                        {el.type === 'rectangulo' && <rect width={el.width} height={el.height} fill={el.fill} rx="2" />}
                                        {el.type === 'circulo' && <ellipse cx={el.width / 2} cy={el.height / 2} rx={el.width / 2} ry={el.height / 2} fill={el.fill} />}
                                        {el.type === 'triangulo' && <polygon points={`${el.width / 2},0 0,${el.height} ${el.width},${el.height}`} fill={el.fill} />}
                                        {el.type === 'estrella' && <polygon points={`${el.width / 2},0 ${el.width * 0.6},${el.height * 0.4} ${el.width},${el.height * 0.4} ${el.width * 0.7},${el.height * 0.6} ${el.width * 0.8},${el.height} ${el.width / 2},${el.height * 0.75} ${el.width * 0.2},${el.height} ${el.width * 0.3},${el.height * 0.6} 0,${el.height * 0.4} ${el.width * 0.4},${el.height * 0.4}`} fill={el.fill} />}
                                        {el.type === 'lapiz' && <path d={el.points} stroke={el.fill} fill="none" strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />}
                                        {el.type === 'imagen' && <image href={el.url} width={el.width} height={el.height} preserveAspectRatio="none" />}
                                        {el.type === 'texto' && (
                                            <foreignObject width={el.width} height={el.height}>
                                                <div xmlns="http://www.w3.org/1999/xhtml" style={{ color: el.fill, font: `bold ${el.fontSize}px ${el.fontFamily}`, padding: '2px', pointerEvents: 'none', wordBreak: 'break-word' }}>{el.text}</div>
                                            </foreignObject>
                                        )}
                                    </DraggableItem>
                                ))}
                            </svg>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize flex items-center justify-center text-blue-500 hover:scale-110 shadow-md"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                const startX = e.clientX; const startY = e.clientY;
                                const startW = canvasSize.w; const startH = canvasSize.h;
                                const onMove = (m) => setCanvasSize({ w: startW + (m.clientX - startX), h: startH + (m.clientY - startY) });
                                const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                                document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                            }}>
                            <Maximize2 size={12} />
                        </div>
                    </div>
                </main>

                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <span className="text-sm font-bold text-gray-700 flex items-center uppercase tracking-tight">
                            <Settings2 size={16} className="mr-2 text-blue-600" /> Configuración
                        </span>
                    </div>

                    <div className="p-5 space-y-6 overflow-y-auto flex-1">
                        <section>
                            <label className={controlLabel}>Tamaño del Lienzo</label>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-[10px] text-gray-400">W</span>
                                    <input type="number" value={canvasSize.w} onChange={(e) => setCanvasSize({ ...canvasSize, w: +e.target.value })} className={`${inputStyle} pl-6`} />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-[10px] text-gray-400">H</span>
                                    <input type="number" value={canvasSize.h} onChange={(e) => setCanvasSize({ ...canvasSize, h: +e.target.value })} className={`${inputStyle} pl-6`} />
                                </div>
                            </div>
                            <select className={inputStyle} onChange={(e) => {
                                const [w, h] = e.target.value.split('x').map(Number);
                                if (w) setCanvasSize({ w, h });
                            }}>
                                <option value="800x600">800x600</option>
                                <option value="1080x1080">1080x1080</option>
                                <option value="1280x720">1280x720</option>
                                <option value="1920x1080">1920x1080</option>
                            </select>
                        </section>

                        {seleccionado ? (
                            <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                                <div className="pt-4 border-t border-gray-100">
                                    <label className={controlLabel}>Estética</label>
                                    <input type="color" value={seleccionado.fill} onChange={(e) => manejarCambioColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-none p-1 bg-gray-100 shadow-inner" />
                                </div>

                                <div>
                                    <label className={controlLabel}>Transformación</label>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <button onClick={() => actualizarAtributo(seleccionado.id, { rotation: (seleccionado.rotation + 45) % 360 })} className="flex items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-[10px] font-medium text-gray-600 transition-colors">
                                            <RotateCw size={14} className="mr-1" /> +45°
                                        </button>
                                        <button onClick={() => actualizarAtributo(seleccionado.id, { rotation: 0 })} className="flex items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-[10px] font-medium text-gray-600 transition-colors">
                                            <RefreshCcw size={14} className="mr-1" /> 0°
                                        </button>
                                        <button onClick={() => actualizarAtributo(seleccionado.id, { flipX: !seleccionado.flipX })} className="flex items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-[10px] font-medium text-gray-600 transition-colors">
                                            <FlipHorizontal size={14} className="mr-1" /> Espejo
                                        </button>
                                    </div>

                                    <div className="mt-2 px-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Giro Manual</label>
                                            <span className="text-[9px] font-bold text-blue-600">{seleccionado.rotation || 0}°</span>
                                        </div>
                                        <input type="range" min="0" max="360" value={seleccionado.rotation || 0} onChange={(e) => actualizarAtributo(seleccionado.id, { rotation: +e.target.value })} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>

                                    <button onClick={clonarElemento} className="w-full mt-4 flex items-center justify-center p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 text-xs font-bold transition-all">
                                        <Copy size={14} className="mr-2" /> Clonar Objeto
                                    </button>
                                </div>

                                {seleccionado.type === 'texto' && (
                                    <div className="space-y-3">
                                        <label className={controlLabel}>Texto</label>
                                        <textarea value={seleccionado.text} onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })} className={`${inputStyle} h-24 resize-none`} />
                                    </div>
                                )}
                            </section>
                        ) : herramientaActiva === 'lapiz' && (
                            <section className="pt-4 border-t border-gray-100 animate-in fade-in duration-300">
                                <label className={controlLabel}>Grosor del Lápiz: {grosorLapiz}px</label>
                                <input type="range" min="1" max="50" value={grosorLapiz} onChange={(e) => setGrosorLapiz(+e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </section>
                        )}

                        <div className="pt-6 border-t border-gray-100">
                            <label className={`${controlLabel} flex items-center text-blue-600`}><Layers size={12} className="mr-2" /> Capas</label>
                            <div className="space-y-1 mt-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {[...elementos].reverse().map(el => (
                                    <div key={el.id} onClick={() => setSeleccionadoId(el.id)} className={`group p-2.5 rounded-lg flex items-center justify-between cursor-pointer border transition-all ${seleccionadoId === el.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                                        <div className="flex items-center space-x-2 truncate">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: el.fill }}></div>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase truncate pr-2">{el.type}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setElementos(elementos.filter(item => item.id !== el.id)); if (seleccionadoId === el.id) setSeleccionadoId(null); }}
                                            className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};