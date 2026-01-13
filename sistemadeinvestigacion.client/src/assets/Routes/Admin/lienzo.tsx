import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Navbar } from '../../components/Navbar';
import {
    Square, Circle, Type, Download, Layers, Trash2,
    ImageIcon as LucideImageIcon, ChevronUp, ChevronDown,
    ArrowUpToLine, ArrowDownToLine, MousePointer2, Pencil, Shapes, Copy, Settings2, Triangle, Star, Hexagon,
    Image as ImageIconLucide
} from 'lucide-react';
import type { TipoElemento, ElementoCanvas } from '../../../types/canvas';

// --- COMPONENTE DRAGGABLE ITEM ---
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
            alRedimensionar(el.id, Math.max(10, startW + deltaX), Math.max(10, startH + deltaY));
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
                style={{ cursor: puedeInteractuar ? 'move' : 'default', pointerEvents: puedeInteractuar ? 'auto' : 'none' }}
            >
                <g transform={`rotate(${el.rotation || 0}, ${cx}, ${cy})`}>
                    {estaSeleccionado && (
                        <>
                            <rect x={-2} y={-2} width={el.width + 4} height={el.height + 4}
                                fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3" style={{ pointerEvents: 'none' }} />
                            <rect x={el.width - 4} y={el.height - 4}
                                width={8} height={8} fill="white" stroke="#3b82f6" strokeWidth="2"
                                className="cursor-nwse-resize" onMouseDown={iniciarRedimension}
                                style={{ pointerEvents: 'auto' }}
                            />
                        </>
                    )}
                    <g onClick={(e) => { if (puedeInteractuar) { e.stopPropagation(); alSeleccionar(el.id); } }}>
                        {children}
                    </g>
                </g>
            </g>
        </Draggable>
    );
};

export const Lienzo = () => {
    const [elementos, setElementos] = useState<any[]>([]);
    const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
    const [herramientaActiva, setHerramientaActiva] = useState<TipoElemento | null>(null);
    const [menuFigurasOpen, setMenuFigurasOpen] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
    const [colorGlobal, setColorGlobal] = useState('#003366');
    const [configExport, setConfigExport] = useState({ fondo: 'white', grosorLapiz: 3 });

    const [dibujando, setDibujando] = useState(false);
    const idCapaDibujoActual = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const seleccionado = elementos.find(el => el.id === seleccionadoId);
    const modoSeleccionActivo = herramientaActiva === null;

    const actualizarAtributo = (id: number, cambios: Partial<ElementoCanvas>) => {
        setElementos(prev => prev.map(el => el.id === id ? { ...el, ...cambios } : el));
    };

    const manejarCambioColor = (nuevoColor: string) => {
        setColorGlobal(nuevoColor);
        if (seleccionadoId) actualizarAtributo(seleccionadoId, { fill: nuevoColor });
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
        if (herramientaActiva === 'lapiz' || !herramientaActiva) {
            if (!herramientaActiva) setSeleccionadoId(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const nuevo: any = {
            id: Date.now(),
            type: herramientaActiva,
            x: e.clientX - rect.left - 50,
            y: e.clientY - rect.top - 50,
            width: herramientaActiva === 'texto' ? 250 : 100,
            height: herramientaActiva === 'texto' ? 100 : 100,
            fill: colorGlobal,
            rotation: 0,
            fontSize: 16,
            fontFamily: 'Arial',
            text: herramientaActiva === 'texto' ? 'Escribe aquí tu texto...' : undefined
        };
        setElementos([...elementos, nuevo]);
        setSeleccionadoId(nuevo.id);
        setHerramientaActiva(null);
    };

    const clonarElemento = () => {
        if (!seleccionado) return;
        const clon = { ...seleccionado, id: Date.now(), x: seleccionado.x + 20, y: seleccionado.y + 20 };
        setElementos([...elementos, clon]);
        setSeleccionadoId(clon.id);
    };

    const subirImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => {
                const nuevo: any = {
                    id: Date.now(), type: 'imagen', x: 50, y: 50,
                    width: 200, height: 200, rotation: 0, url: f.target?.result
                };
                setElementos([...elementos, nuevo]);
                setSeleccionadoId(nuevo.id);
            };
            reader.readAsDataURL(file);
        }
    };

    const iniciarDibujo = (e: React.MouseEvent) => {
        if (herramientaActiva !== 'lapiz') return;
        setDibujando(true);
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const startPoint = `M ${e.clientX - rect.left} ${e.clientY - rect.top}`;
        if (!idCapaDibujoActual.current) {
            const id = Date.now(); idCapaDibujoActual.current = id;
            setElementos(prev => [...prev, { id, type: 'lapiz', x: 0, y: 0, width: canvasSize.w, height: canvasSize.h, fill: colorGlobal, rotation: 0, points: startPoint, strokeWidth: configExport.grosorLapiz } as any]);
        } else {
            setElementos(prev => prev.map(el => el.id === idCapaDibujoActual.current ? { ...el, points: (el.points || "") + " " + startPoint } : el));
        }
    };

    const dibujar = (e: React.MouseEvent) => {
        if (!dibujando || !idCapaDibujoActual.current) return;
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const nextPoint = `L ${e.clientX - rect.left} ${e.clientY - rect.top}`;
        setElementos(prev => prev.map(el => el.id === idCapaDibujoActual.current ? { ...el, points: (el.points || "") + " " + nextPoint } : el));
    };

    const descargarSVG = () => {
        const bg = configExport.fondo === 'transparent' ? 'none' : configExport.fondo;
        let svg = `<svg width="${canvasSize.w}" height="${canvasSize.h}" viewBox="0 0 ${canvasSize.w} ${canvasSize.h}" xmlns="http://www.w3.org/2000/svg" style="background:${bg}">\n`;
        if (bg !== 'none') svg += `<rect width="100%" height="100%" fill="${bg}"/>`;
        elementos.forEach(el => {
            const cx = el.x + el.width / 2; const cy = el.y + el.height / 2;
            const transform = `rotate(${el.rotation || 0} ${cx} ${cy})`;
            if (el.type === 'rectangulo') svg += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'circulo') svg += `  <ellipse cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'triangulo') svg += `  <polygon points="${cx},${el.y} ${el.x},${el.y + el.height} ${el.x + el.width},${el.y + el.height}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'estrella') svg += `  <polygon points="${cx},${el.y} ${cx + el.width * 0.1},${cy - el.height * 0.1} ${el.x + el.width},${cy} ${cx + el.width * 0.1},${cy + el.height * 0.1} ${cx},${el.y + el.height} ${cx - el.width * 0.1},${cy + el.height * 0.1} ${el.x},${cy} ${cx - el.width * 0.1},${cy - el.height * 0.1}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'hexagono') svg += `  <polygon points="${el.x + el.width * 0.25},${el.y} ${el.x + el.width * 0.75},${el.y} ${el.x + el.width},${cy} ${el.x + el.width * 0.75},${el.y + el.height} ${el.x + el.width * 0.25},${el.y + el.height} ${el.x},${cy}" fill="${el.fill}" transform="${transform}" />\n`;
            else if (el.type === 'lapiz') svg += `  <path d="${el.points}" stroke="${el.fill}" fill="none" stroke-width="${el.strokeWidth || 3}" stroke-linecap="round" stroke-linejoin="round" />\n`;
            else if (el.type === 'imagen') svg += ` <image href="${el.url}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" transform="${transform}" />\n`;
            else if (el.type === 'texto') svg += `  <foreignObject x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" transform="${transform}"><div xmlns="http://www.w3.org/1999/xhtml" style="color:${el.fill};font-family:${el.fontFamily};font-size:${el.fontSize}px;font-weight:bold;word-wrap:break-word;white-space:pre-wrap;">${el.text}</div></foreignObject>\n`;
        });
        svg += `</svg>`;
        const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        link.download = `pdi_diseno.svg`; link.click();
    };

    return (
        <div className="h-screen bg-[#f3f4f6] flex flex-col overflow-hidden text-gray-800 font-sans">
            <Navbar />
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={subirImagen} />

            <div className="mt-20 h-11 shrink-0 bg-white border-b border-gray-200"></div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-5 shadow-sm z-20">
                    <button onClick={() => setHerramientaActiva(null)} className={`p-3 rounded-xl border transition-all ${modoSeleccionActivo ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-blue-50'}`}><MousePointer2 size={22} /></button>
                    <div className="relative">
                        <button onClick={() => setMenuFigurasOpen(!menuFigurasOpen)} className={`p-3 rounded-xl border transition-all ${['rectangulo', 'circulo', 'triangulo', 'estrella', 'hexagono'].includes(herramientaActiva!) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-blue-50'}`}><Shapes size={22} /></button>
                        {menuFigurasOpen && (
                            <div className="absolute left-16 top-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 flex flex-col space-y-2 z-50">
                                <button onClick={() => { setHerramientaActiva('rectangulo'); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Square size={20} /></button>
                                <button onClick={() => { setHerramientaActiva('circulo'); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Circle size={20} /></button>
                                <button onClick={() => { setHerramientaActiva('triangulo'); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Triangle size={20} /></button>
                                <button onClick={() => { setHerramientaActiva('estrella' as any); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Star size={20} /></button>
                                <button onClick={() => { setHerramientaActiva('hexagono' as any); setMenuFigurasOpen(false); }} className="p-2 hover:bg-blue-50 rounded text-gray-600"><Hexagon size={20} /></button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:bg-blue-50 rounded-xl"><ImageIconLucide size={22} /></button>
                    <button onClick={() => { setHerramientaActiva('lapiz'); setSeleccionadoId(null); }} className={`p-3 rounded-xl border transition-all ${herramientaActiva === 'lapiz' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-blue-50'}`}><Pencil size={22} /></button>
                    <button onClick={() => setHerramientaActiva('texto')} className={`p-3 rounded-xl border transition-all ${herramientaActiva === 'texto' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-blue-50'}`}><Type size={22} /></button>
                </aside>

                <main className="flex-1 overflow-auto bg-[#e5e7eb] flex items-center justify-center p-20" onClick={() => setSeleccionadoId(null)}>
                    <div id="canvas-white-sheet" className="bg-white shadow-2xl relative shrink-0 rounded-sm overflow-hidden" style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }} onClick={(e) => e.stopPropagation()}>
                        <svg width="100%" height="100%" viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
                            onClick={manejarClickLienzo} onMouseDown={iniciarDibujo} onMouseMove={dibujar} onMouseUp={() => setDibujando(false)}
                            className={herramientaActiva ? 'cursor-crosshair' : 'cursor-default'}>
                            {elementos.map(el => (
                                <DraggableItem key={el.id} el={el} estaSeleccionado={seleccionadoId === el.id} alSeleccionar={setSeleccionadoId}
                                    alTerminarArrastre={(id: any, x: any, y: any) => actualizarAtributo(id, { x, y })}
                                    alRedimensionar={(id: any, width: any, height: any) => actualizarAtributo(id, { width, height })}
                                    puedeInteractuar={modoSeleccionActivo}>
                                    {el.type === 'rectangulo' && <rect width={el.width} height={el.height} fill={el.fill} rx="2" />}
                                    {el.type === 'circulo' && <ellipse cx={el.width / 2} cy={el.height / 2} rx={el.width / 2} ry={el.height / 2} fill={el.fill} />}
                                    {el.type === 'triangulo' && <polygon points={`${el.width / 2},0 0,${el.height} ${el.width},${el.height}`} fill={el.fill} />}
                                    {el.type === 'estrella' && <polygon points={`${el.width / 2},0 ${el.width * 0.6},${el.height * 0.4} ${el.width},${el.height * 0.4} ${el.width * 0.7},${el.height * 0.6} ${el.width * 0.8},${el.height} ${el.width / 2},${el.height * 0.75} ${el.width * 0.2},${el.height} ${el.width * 0.3},${el.height * 0.6} 0,${el.height * 0.4} ${el.width * 0.4},${el.height * 0.4}`} fill={el.fill} />}
                                    {el.type === 'hexagono' && <polygon points={`${el.width * 0.25},0 ${el.width * 0.75},0 ${el.width},${el.height / 2} ${el.width * 0.75},${el.height} ${el.width * 0.25},${el.height} 0,${el.height / 2}`} fill={el.fill} />}
                                    {el.type === 'lapiz' && <path d={el.points} stroke={el.fill} fill="none" strokeWidth={el.strokeWidth || 3} strokeLinecap="round" strokeLinejoin="round" />}
                                    {el.type === 'imagen' && <image href={el.url} width={el.width} height={el.height} preserveAspectRatio="none" />}
                                    {el.type === 'texto' && (
                                        <foreignObject width={el.width} height={el.height}>
                                            <div xmlns="http://www.w3.org/1999/xhtml" style={{
                                                color: el.fill, font: `bold ${el.fontSize}px ${el.fontFamily}`,
                                                wordWrap: 'break-word', whiteSpace: 'pre-wrap', padding: '2px', pointerEvents: 'none'
                                            }}>
                                                {el.text}
                                            </div>
                                        </foreignObject>
                                    )}
                                </DraggableItem>
                            ))}
                        </svg>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 cursor-nwse-resize hover:bg-blue-400 transition-colors z-30"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                const startX = e.clientX; const startY = e.clientY;
                                const startW = canvasSize.w; const startH = canvasSize.h;
                                const onMove = (m: MouseEvent) => setCanvasSize({ w: startW + (m.clientX - startX), h: startH + (m.clientY - startY) });
                                const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                                document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                            }}
                        />
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
                        <div className="flex space-x-2 mb-3">
                            <input type="number" value={canvasSize.w} onChange={(e) => setCanvasSize({ ...canvasSize, w: Number(e.target.value) })} className="w-full border rounded p-1 text-[10px]" />
                            <input type="number" value={canvasSize.h} onChange={(e) => setCanvasSize({ ...canvasSize, h: Number(e.target.value) })} className="w-full border rounded p-1 text-[10px]" />
                        </div>
                        <select className="w-full border p-1 text-[10px] rounded font-bold bg-white" onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            if (w) setCanvasSize({ w, h });
                        }}>
                            <option value="">Presets de tamaño</option>
                            <option value="800x600">800 x 600</option>
                            <option value="794x1123">794 x 1123</option>
                            <option value="1080x1080">1080 x 1080</option>
                            <option value="1280x720">1280 x 720</option>
                        </select>
                    </div>

                    <div className="p-4 border-b border-gray-100 min-h-[160px]">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{seleccionadoId ? 'Color Selección' : 'Color Pincel'}</label>
                                <input type="color" value={seleccionado ? seleccionado.fill : colorGlobal} onChange={(e) => manejarCambioColor(e.target.value)} className="w-full h-8 cursor-pointer rounded border-gray-200" />
                            </div>

                            {seleccionado ? (
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
                                            <textarea
                                                value={seleccionado.text}
                                                onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })}
                                                className="w-full border p-2 text-xs rounded focus:ring-1 focus:ring-blue-400 outline-none h-20"
                                            />
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block text-[9px]">Tamaño Fuente: {seleccionado.fontSize}px</label>
                                            <input type="range" min="10" max="200" value={seleccionado.fontSize} onChange={(e) => actualizarAtributo(seleccionado.id, { fontSize: Number(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
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
                            ) : herramientaActiva === 'lapiz' && (
                                <div className="space-y-2 border-t pt-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Grosor de línea: {configExport.grosorLapiz}px</label>
                                    <input type="range" min="1" max="50" value={configExport.grosorLapiz} onChange={e => setConfigExport({ ...configExport, grosorLapiz: +e.target.value })} className="w-full accent-blue-600" />
                                </div>
                            )}

                            <div className="pt-2 border-t">
                                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Fondo Exportación</label>
                                <select value={configExport.fondo} onChange={e => setConfigExport({ ...configExport, fondo: e.target.value })} className="w-full border p-1 text-[10px] rounded font-bold bg-white">
                                    <option value="white">Blanco</option>
                                    <option value="transparent">Transparente</option>
                                    <option value={colorGlobal}>Color Predeterminado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-gray-50/50">
                        {[...elementos].reverse().map((el) => (
                            <div key={el.id} onClick={() => { setHerramientaActiva(null); setSeleccionadoId(el.id); }} className={`p-2 border rounded flex items-center justify-between transition-all cursor-pointer group ${seleccionadoId === el.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                                <div className="flex items-center space-x-3 pointer-events-none">
                                    <LucideImageIcon size={14} className={seleccionadoId === el.id ? "text-blue-500" : "text-gray-400"} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{el.type === 'lapiz' ? 'DIBUJO LIBRE' : el.type}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setElementos(elementos.filter(item => item.id !== el.id)); if (seleccionadoId === el.id) setSeleccionadoId(null); }} className="text-red-400 hover:text-red-600 hidden group-hover:block transition-colors"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white shadow-lg">
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