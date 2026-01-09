import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Navbar } from '../../components/Navbar';
import { Square, Circle, Type, Download, Layers, Trash2, ImageIcon } from 'lucide-react';
import type { TipoElemento, ElementoCanvas } from '../../../types/canvas';

const DraggableItem = ({ el, children, alTerminarArrastre, alSeleccionar, estaSeleccionado, alRedimensionar }: {
    el: ElementoCanvas,
    children: React.ReactNode,
    estaSeleccionado: boolean,
    alTerminarArrastre: (id: number, nuevaX: number, nuevaY: number) => void,
    alSeleccionar: (id: number) => void,
    alRedimensionar: (id: number, w: number, h: number) => void
}) => {
    const nodeRef = useRef(null);
    const [redimensionando, setRedimensionando] = useState(false);

    // Lógica para redimensionar arrastrando la esquina
    const iniciarRedimension = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setRedimensionando(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = el.width;
        const startHeight = el.height;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            // Calculamos nuevo tamaño (mínimo 20px)
            const nuevoW = Math.max(20, startWidth + deltaX);
            const nuevoH = Math.max(20, startHeight + deltaY);

            alRedimensionar(el.id, nuevoW, nuevoH);
        };

        const onMouseUp = () => {
            setRedimensionando(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="#canvas-white-sheet"
            defaultPosition={{ x: el.x, y: el.y }}
            onStop={(_e, data) => alTerminarArrastre(el.id, data.x, data.y)}
            onStart={() => alSeleccionar(el.id)}
            disabled={redimensionando} // Bloquea el arrastre si estamos redimensionando
        >
            <g ref={nodeRef} className="cursor-move" onClick={(e) => { e.stopPropagation(); alSeleccionar(el.id); }}>
                {estaSeleccionado && (
                    <>
                        {/* Marco de selección */}
                        <rect
                            x={-2} y={-2}
                            width={(el.type === 'circulo' ? el.width : el.width) + 4}
                            height={(el.type === 'circulo' ? el.width : el.height) + 4}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="3"
                        />
                        {/* Manejador de Redimensión (Esquina inferior derecha) */}
                        <rect
                            x={el.width - 4}
                            y={(el.type === 'circulo' ? el.width : el.height) - 4}
                            width={8}
                            height={8}
                            fill="white"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            className="cursor-nwse-resize"
                            onMouseDown={iniciarRedimension}
                        />
                    </>
                )}
                {children}
            </g>
        </Draggable>
    );
};

export const Lienzo = () => {
    const [elementos, setElementos] = useState<ElementoCanvas[]>([]);
    const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

    const seleccionado = elementos.find(el => el.id === seleccionadoId);

    const manejarParadaArrastre = (id: number, nuevaX: number, nuevaY: number) => {
        setElementos(prev => prev.map(el => el.id === id ? { ...el, x: nuevaX, y: nuevaY } : el));
    };

    const manejarRedimension = (id: number, nuevoW: number, nuevoH: number) => {
        setElementos(prev => prev.map(el =>
            el.id === id ? { ...el, width: nuevoW, height: nuevoH } : el
        ));
    };

    const agregarElemento = (tipo: TipoElemento) => {
        const nuevoElemento: ElementoCanvas = {
            id: Date.now(),
            type: tipo,
            x: 100,
            y: 100,
            width: tipo === 'texto' ? 200 : 100,
            height: tipo === 'texto' ? 40 : 100,
            fill: '#003366',
            text: tipo === 'texto' ? 'Pelado somos un exito😎' : undefined
        };
        setElementos([...elementos, nuevoElemento]);
        setSeleccionadoId(nuevoElemento.id);
    };

    const actualizarPropiedad = (propiedad: keyof ElementoCanvas, valor: any) => {
        setElementos(prev => prev.map(el => el.id === seleccionadoId ? { ...el, [propiedad]: valor } : el));
    };

    const eliminarElemento = () => {
        setElementos(prev => prev.filter(el => el.id !== seleccionadoId));
        setSeleccionadoId(null);
    };

    const descargarSVG = () => {
        let contenido = `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">\n`;
        elementos.forEach((el) => {
            if (el.type === 'rectangulo') {
                contenido += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="2" />\n`;
            } else if (el.type === 'circulo') {
                contenido += `  <circle cx="${el.x + (el.width / 2)}" cy="${el.y + (el.width / 2)}" r="${el.width / 2}" fill="${el.fill}" />\n`;
            } else if (el.type === 'texto') {
                contenido += `  <text x="${el.x}" y="${el.y + 20}" fill="${el.fill}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${el.text}</text>\n`;
            }
        });
        contenido += `</svg>`;
        const blob = new Blob([contenido], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pdi_diseno_${Date.now()}.svg`;
        link.click();
    };

    return (
        <div className="h-screen bg-[#f3f4f6] flex flex-col overflow-hidden text-gray-800">
            <Navbar />

            <div className="mt-20 h-11 bg-white border-b border-gray-200 flex items-center px-6 justify-between text-[12px] shadow-sm shrink-0">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-700 uppercase tracking-wider">Editor PDI PRO</span>
                    {seleccionadoId && (
                        <button onClick={eliminarElemento} className="flex items-center space-x-1 text-red-500 hover:bg-red-50 px-2 py-1 rounded font-bold transition-colors">
                            <Trash2 size={14} /> <span>BORRAR OBJETO</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-5 shadow-sm">
                    <button onClick={() => agregarElemento('rectangulo')} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                        <Square size={22} />
                    </button>
                    <button onClick={() => agregarElemento('circulo')} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                        <Circle size={22} />
                    </button>
                    <button onClick={() => agregarElemento('texto')} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                        <Type size={22} />
                    </button>
                </aside>

                <main className="flex-1 overflow-auto bg-[#e5e7eb] flex items-center justify-center p-20" onClick={() => setSeleccionadoId(null)}>
                    <div id="canvas-white-sheet" className="bg-white shadow-2xl relative overflow-hidden shrink-0 rounded-sm" style={{ width: '800px', height: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <svg width="100%" height="100%" viewBox="0 0 800 600">
                            {elementos.map((el) => (
                                <DraggableItem
                                    key={el.id}
                                    el={el}
                                    estaSeleccionado={seleccionadoId === el.id}
                                    alSeleccionar={setSeleccionadoId}
                                    alTerminarArrastre={manejarParadaArrastre}
                                    alRedimensionar={manejarRedimension}
                                >
                                    {el.type === 'rectangulo' && <rect width={el.width} height={el.height} fill={el.fill} rx="2" />}
                                    {el.type === 'circulo' && <circle cx={el.width / 2} cy={el.width / 2} r={el.width / 2} fill={el.fill} />}
                                    {el.type === 'texto' && <text y={20} fill={el.fill} fontSize="20" fontWeight="bold" dominantBaseline="hanging" style={{ userSelect: 'none' }}>{el.text}</text>}
                                </DraggableItem>
                            ))}
                        </svg>
                    </div>
                </main>

                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm shrink-0">
                    <div className="p-4 bg-gray-50 border-b font-bold uppercase text-[11px] text-gray-500 tracking-widest flex items-center justify-between">
                        <span>Propiedades y Capas</span>
                        <Layers size={14} />
                    </div>

                    {/* SECCIÓN DE PROPIEDADES (Color y Texto solamente) */}
                    <div className="p-4 border-b border-gray-100">
                        {seleccionado ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Color de Relleno</label>
                                    <input type="color" value={seleccionado.fill} onChange={(e) => actualizarPropiedad('fill', e.target.value)} className="w-full h-10 cursor-pointer rounded" />
                                </div>
                                {seleccionado.type === 'texto' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Contenido del Texto</label>
                                        <input type="text" value={seleccionado.text} onChange={(e) => actualizarPropiedad('text', e.target.value)} className="w-full border p-2 text-xs rounded focus:ring-2 focus:ring-blue-400 outline-none" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-300 text-[10px] uppercase italic">Selecciona un elemento</div>
                        )}
                    </div>

                    {/* SECCIÓN DE CAPAS (Historial e Imágenes futuras) */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {[...elementos].reverse().map(el => (
                            <div key={el.id} onClick={() => setSeleccionadoId(el.id)} className={`p-3 border rounded-lg text-[11px] font-bold flex items-center justify-between cursor-pointer transition-colors ${seleccionadoId === el.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                                <div className="flex items-center space-x-2">
                                    <ImageIcon size={12} className="text-gray-400" />
                                    <span className="uppercase">{el.type}</span>
                                </div>
                                <span className="opacity-50 font-normal">#{el.id.toString().slice(-4)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <button onClick={descargarSVG} className="w-full bg-[#003366] text-[#FFCC00] py-3 rounded-xl font-bold text-xs hover:bg-[#00264d] transition-all flex items-center justify-center space-x-2">
                            <Download size={16} /> <span>GUARDAR SVG</span>
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Lienzo;