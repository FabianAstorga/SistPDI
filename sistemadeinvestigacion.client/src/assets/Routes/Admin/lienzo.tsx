import React from 'react';
// Importamos la misma Navbar que usas en el Panel
import { Navbar } from '../../components/Navbar';
import { Type, Square, Circle, Image as ImageIcon, MousePointer2, Layers } from 'lucide-react';

export const Lienzo = () => {
    return (
        /* pt-24 es vital para que la Navbar fija no tape el editor */
        <div className="min-h-screen bg-gray-200 pt-24 flex flex-col">

            {/* 1. La Navbar arriba, igual que en el Panel */}
            <Navbar />

            <div className="flex flex-1 p-6 gap-6 overflow-hidden">

                {/* --- BARRA DE HERRAMIENTAS (Izquierda) --- */}
                <aside className="w-20 bg-white shadow-xl rounded-2xl p-4 flex flex-col items-center space-y-6 border border-gray-300">
                    <div className="text-[#003366] mb-2 font-bold text-[10px] uppercase text-center leading-tight">
                        Herram.
                    </div>

                    <button title="Seleccionar" className="p-3 bg-blue-50 text-[#003366] rounded-xl hover:bg-blue-100 transition shadow-sm border border-blue-200">
                        <MousePointer2 size={24} />
                    </button>

                    <button title="Texto" className="p-3 text-gray-500 hover:text-[#003366] hover:bg-blue-50 rounded-xl transition">
                        <Type size={24} />
                    </button>

                    <button title="Rectángulo" className="p-3 text-gray-500 hover:text-[#003366] hover:bg-blue-50 rounded-xl transition">
                        <Square size={24} />
                    </button>

                    <button title="Círculo" className="p-3 text-gray-500 hover:text-[#003366] hover:bg-blue-50 rounded-xl transition">
                        <Circle size={24} />
                    </button>
                </aside>

                {/* --- ÁREA DE TRABAJO (Centro) --- */}
                <main className="flex-1 bg-white shadow-2xl rounded-2xl flex items-center justify-center border border-gray-300 relative overflow-auto">

                    {/* El "Lienzo" blanco (Simulando el papel) */}
                    <div className="min-w-[800px] min-h-[600px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] border border-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-200 pointer-events-none select-none italic text-2xl uppercase tracking-widest font-bold">
                        </div>
                    </div>

                </main>

                {/* --- PANEL DE CAPAS / PROPIEDADES (Derecha) --- */}
                <aside className="w-72 bg-white shadow-xl rounded-2xl p-6 border border-gray-300 flex flex-col">
                    <div className="flex items-center space-x-2 border-b-2 border-[#FFCC00] pb-2 mb-4">
                        <Layers size={20} className="text-[#003366]" />
                        <h3 className="font-bold text-[#003366] uppercase text-sm">Propiedades</h3>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <MousePointer2 size={20} />
                        </div>
                        <p className="text-xs text-gray-400 italic px-4">
                            
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Lienzo;