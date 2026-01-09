import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Navbar } from '../../components/Navbar';
import { Square, Circle, Type, Download, Layers, Eye } from 'lucide-react';
import type { TipoElemento, ElementoCanvas } from '../../../types/canvas';

// --- COMPONENTE DRAGGABLE CON CAPTURA DE POSICIÓN ---
const DraggableItem = ({ el, children, alTerminarArrastre }: {
    el: ElementoCanvas,
    children: React.ReactNode,
    alTerminarArrastre: (id: number, nuevaX: number, nuevaY: number) => void
}) => {
    const nodeRef = useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="#canvas-white-sheet"
            // Usamos defaultPosition para el inicio, pero la librería maneja el resto
            defaultPosition={{ x: el.x, y: el.y }}
            // Cuando el usuario suelta el mouse, actualizamos el estado global
            onStop={(_e, data) => alTerminarArrastre(el.id, data.x, data.y)}
        >
            <g ref={nodeRef} className="cursor-move">
                {children}
            </g>
        </Draggable>
    );
};

export const Lienzo = () => {
    const [elementos, setElementos] = useState<ElementoCanvas[]>([]);

    // 1. FUNCIÓN PARA ACTUALIZAR COORDENADAS REALES EN EL ESTADO
    const manejarParadaArrastre = (id: number, nuevaX: number, nuevaY: number) => {
        setElementos(prev => prev.map(el =>
            el.id === id ? { ...el, x: nuevaX, y: nuevaY } : el
        ));
    };

    const agregarElemento = (tipo: TipoElemento) => {
        const nuevoElemento: ElementoCanvas = {
            id: Date.now(),
            type: tipo,
            x: 50,
            y: 50,
            width: tipo === 'texto' ? 250 : 100,
            height: tipo === 'texto' ? 40 : 100,
            fill: '#003366',
            text: tipo === 'texto' ? 'Pelado somos un exito😎' : undefined
        };
        setElementos([...elementos, nuevoElemento]);
    };

    // 2. FUNCIÓN DE DESCARGA (Ahora usa las coordenadas X e Y actualizadas)
    const descargarSVG = () => {
        let contenido = `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">\n`;

        elementos.forEach((el) => {
            if (el.type === 'rectangulo') {
                contenido += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="2" />\n`;
            } else if (el.type === 'circulo') {
                // cx y cy son el centro del círculo
                contenido += `  <circle cx="${el.x + 50}" cy="${el.y + 50}" r="50" fill="${el.fill}" />\n`;
            } else if (el.type === 'texto') {
                contenido += `  <text x="${el.x}" y="${el.y + 20}" fill="${el.fill}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${el.text}</text>\n`;
            }
        });
        contenido += `</svg>`;

        const blob = new Blob([contenido], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `plantilla_pdi_${new Date().getTime()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-screen bg-[#f3f4f6] flex flex-col overflow-hidden text-gray-800">
            <Navbar />

            <div className="mt-20 h-11 bg-white border-b border-gray-200 flex items-center px-6 space-x-8 text-[12px] shadow-sm shrink-0">
                <span className="font-semibold text-gray-700 uppercase tracking-wider">Editor de Plantillas Institucionales</span>
                <div className="h-4 w-[1px] bg-gray-200"></div>
                <span className="text-gray-400 italic font-medium">Los elementos se guardarán en su posición actual al descargar</span>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* TOOLBAR */}
                <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-5 shadow-sm shrink-0">
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

                {/* CANVAS */}
                <main className="flex-1 overflow-auto bg-[#e5e7eb] flex items-center justify-center p-20 relative">
                    <div id="canvas-white-sheet" className="bg-white shadow-2xl relative overflow-hidden shrink-0 rounded-sm" style={{ width: '800px', height: '600px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 800 600">
                            {elementos.map((el) => (
                                <DraggableItem
                                    key={el.id}
                                    el={el}
                                    alTerminarArrastre={manejarParadaArrastre}
                                >
                                    {el.type === 'rectangulo' && (
                                        <rect width={el.width} height={el.height} fill={el.fill} rx="2" />
                                    )}
                                    {el.type === 'circulo' && (
                                        <circle cx={50} cy={50} r={50} fill={el.fill} />
                                    )}
                                    {el.type === 'texto' && (
                                        <text y={20} fill={el.fill} fontSize="20" fontWeight="bold" dominantBaseline="hanging" style={{ userSelect: 'none' }}>
                                            {el.text}
                                        </text>
                                    )}
                                </DraggableItem>
                            ))}
                        </svg>
                    </div>
                </main>

                {/* PANEL LATERAL */}
                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm shrink-0">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between font-bold uppercase text-[11px] text-gray-500 tracking-widest">
                        <span>Panel de Capas</span>
                        <Layers size={14} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
                        {elementos.map(el => (
                            <div key={el.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-600 shadow-sm flex items-center justify-between">
                                <span className="uppercase">{el.type}</span>
                                <span className="text-gray-300 font-normal">#{el.id.toString().slice(-4)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={descargarSVG}
                            className="w-full bg-[#003366] text-[#FFCC00] py-3 rounded-xl font-bold text-xs hover:bg-[#00264d] transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95 transform"
                        >
                            <Download size={16} />
                            <span>DESCARGAR SVG LOCAL</span>
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Lienzo;