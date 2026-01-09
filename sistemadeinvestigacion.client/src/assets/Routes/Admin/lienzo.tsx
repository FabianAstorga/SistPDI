import React from 'react';
import { Navbar } from '../../components/Navbar';
import {
    MousePointer2, Type, Square, Circle, Image as ImageIcon,
    Layers, Eye, Lock, Move, ChevronDown, Settings2, Maximize, ZoomIn
} from 'lucide-react';

export const Lienzo = () => {
    return (
        <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
            <Navbar />

            {/* BARRA DE CONTROL CONTEXTUAL (Debajo de la Navbar) */}
            <div className="mt-20 h-10 bg-[#2c2c2c] border-b border-black flex items-center px-4 space-x-6 text-[11px] text-gray-400">
                <div className="flex items-center space-x-2 border-r border-gray-600 pr-4">
                    <span className="font-bold text-gray-300">Selección</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>X: <span className="text-white">120px</span></span>
                    <span>Y: <span className="text-white">450px</span></span>
                    <span>W: <span className="text-white">800px</span></span>
                    <span>H: <span className="text-white">600px</span></span>
                </div>
                <div className="flex items-center space-x-2 ml-auto">
                    <span>Zoom:</span>
                    <input type="range" className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-white">100%</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* 1. BARRA DE HERRAMIENTAS (Izquierda) */}
                <aside className="w-14 bg-[#2c2c2c] border-r border-black flex flex-col items-center py-4 space-y-4">
                    <button title="Mover" className="p-2 bg-[#3d3d3d] text-[#FFCC00] rounded shadow-inner border border-gray-600">
                        <MousePointer2 size={20} />
                    </button>
                    <button title="Rectángulo" className="p-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded transition">
                        <Square size={20} />
                    </button>
                    <button title="Círculo" className="p-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded transition">
                        <Circle size={20} />
                    </button>
                    <button title="Texto" className="p-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded transition">
                        <Type size={20} />
                    </button>
                    <div className="h-[1px] w-8 bg-gray-700 my-2"></div>
                    <button title="Imagen" className="p-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded transition">
                        <ImageIcon size={20} />
                    </button>

                    {/* Selectores de Color Estilo Photoshop */}
                    <div className="mt-auto space-y-[-8px] flex flex-col items-center pb-4">
                        <div className="w-6 h-6 bg-[#003366] border border-white z-10 shadow-lg"></div>
                        <div className="w-6 h-6 bg-white border border-gray-400 ml-4 shadow-lg"></div>
                    </div>
                </aside>

                {/* 2. ÁREA DE TRABAJO (Canvas Central) */}
                <main className="flex-1 overflow-auto bg-[#1a1a1a] flex items-center justify-center p-20 relative custom-scrollbar">
                    {/* El "Documento" SVG */}
                    <div className="bg-white shadow-[0_0_60px_rgba(0,0,0,0.5)] relative" style={{ minWidth: '800px', minHeight: '600px' }}>
                        {/* Guías de diseño (opcionales visualmente) */}
                        <div className="absolute top-0 left-[-20px] h-full w-[1px] bg-blue-500/30"></div>
                        <div className="absolute top-[-20px] left-0 w-full h-[1px] bg-blue-500/30"></div>

                        {/* Contenido Simulado */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-100 font-black text-6xl uppercase pointer-events-none select-none">
                                Template PDI
                            </span>
                        </div>
                    </div>
                </main>

                {/* 3. PANEL DE CAPAS Y PROPIEDADES (Derecha) */}
                <aside className="w-72 bg-[#2c2c2c] border-l border-black flex flex-col text-white">

                    {/* Sección Propiedades */}
                    <div className="p-3 bg-[#383838] flex items-center justify-between border-b border-black">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Propiedades</span>
                        <Settings2 size={14} className="text-gray-400" />
                    </div>
                    <div className="p-4 space-y-4 border-b border-black">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Opacidad</span>
                            <span className="bg-[#1e1e1e] px-2 py-1 rounded">100%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Mezcla</span>
                            <span className="bg-[#1e1e1e] px-2 py-1 rounded flex items-center italic">Normal <ChevronDown size={12} className="ml-1" /></span>
                        </div>
                    </div>

                    {/* Sección Capas */}
                    <div className="p-3 bg-[#383838] flex items-center justify-between border-b border-black">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Capas</span>
                        <Layers size={14} className="text-gray-400" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#1e1e1e]">
                        {/* Capa de ejemplo activa */}
                        <div className="flex items-center space-x-3 p-2 bg-[#444444] border border-[#FFCC00]/50 rounded text-[11px]">
                            <Eye size={14} className="text-gray-300" />
                            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center border border-gray-600">
                                <Square size={12} />
                            </div>
                            <span className="flex-1 truncate">Rectángulo de Fondo</span>
                            <Lock size={12} className="text-gray-500" />
                        </div>

                        {/* Capas de ejemplo inactivas */}
                        {['Texto Título', 'Logo PDI', 'Capa de Email'].map((name, i) => (
                            <div key={i} className="flex items-center space-x-3 p-2 hover:bg-[#333333] rounded text-[11px] text-gray-400">
                                <Eye size={14} />
                                <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center border border-gray-700">
                                    <Layers size={12} />
                                </div>
                                <span className="flex-1 truncate">{name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer del panel (Acciones de capa) */}
                    <div className="h-10 bg-[#2c2c2c] border-t border-black flex items-center justify-around text-gray-400 px-4">
                        <button className="hover:text-white transition">+</button>
                        <button className="hover:text-white transition">🗑️</button>
                        <button className="hover:text-white transition">📁</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Lienzo;