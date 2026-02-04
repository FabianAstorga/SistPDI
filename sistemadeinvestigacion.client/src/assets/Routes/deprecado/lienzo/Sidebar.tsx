import React, { useState } from 'react';
import {
    Type, Square, Circle, Image as ImageIcon,
    MousePointer2, Minus, Hexagon, Triangle,
    Shapes, Trash2
} from 'lucide-react';
import type { TipoElemento } from './types';

interface SidebarProps {
    onAddElement: (tipo: TipoElemento) => void;
}

export const Sidebar = ({ onAddElement }: SidebarProps) => {
    const [showShapes, setShowShapes] = useState(false);

    const herramientasBasicas = [
        { id: 'select', icon: MousePointer2, label: 'Seleccionar', action: null },
        { id: 'texto', icon: Type, label: 'Texto', type: 'texto' as TipoElemento },
        { id: 'imagen', icon: ImageIcon, label: 'Imagen', type: 'imagen' as TipoElemento },
        { id: 'linea', icon: Minus, label: 'Línea', type: 'lapiz' as TipoElemento },
    ];

    const formas = [
        { type: 'rectangulo' as TipoElemento, icon: Square, label: 'Cuadrado' },
        { type: 'circulo' as TipoElemento, icon: Circle, label: 'Círculo' },
        { type: 'hexagono' as TipoElemento, icon: Hexagon, label: 'Hexágono' },
        { type: 'triangulo' as TipoElemento, icon: Triangle, label: 'Triángulo' },
    ];

    return (
        <aside className="w-20 bg-[#002855] border-r border-blue-900 flex flex-col items-center py-6 shadow-2xl z-40 relative shrink-0">

            {/* Logo PDI */}
            <div className="mb-8 p-2 bg-blue-500/20 rounded-lg shrink-0">
                <div className="w-8 h-8 border-2 border-blue-400 rounded-sm rotate-45 flex items-center justify-center">
                    <span className="text-[10px] text-white -rotate-45 font-bold">PDI</span>
                </div>
            </div>

            {/* Grupo de Herramientas */}
            <div className="flex flex-col gap-4">
                {herramientasBasicas.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => item.type && onAddElement(item.type)}
                        className="group relative p-3 text-blue-200 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-200"
                    >
                        <item.icon size={22} />
                        <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                            {item.label}
                        </span>
                    </button>
                ))}

                {/* CONTENEDOR DEL SELECTOR DE FORMAS */}
                <div className="relative">
                    <button
                        onClick={() => setShowShapes(!showShapes)}
                        className={`p-3 rounded-xl transition-all duration-200 ${showShapes
                                ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                : 'text-blue-200 hover:bg-blue-600 hover:text-white'
                            }`}
                    >
                        <Shapes size={22} />
                    </button>

                    {showShapes && (
                        <>
                            {/* Overlay para cerrar al hacer clic fuera */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowShapes(false)}
                            />

                            <div className="absolute left-full ml-4 top-0 z-20 w-32 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    {formas.map((f) => (
                                        <button
                                            key={f.type}
                                            onClick={() => {
                                                onAddElement(f.type);
                                                setShowShapes(false);
                                            }}
                                            className="flex flex-col items-center justify-center aspect-square text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all group/item"
                                        >
                                            <f.icon size={20} />
                                            {/* AQUÍ ESTABA EL ERROR: span cerrado correctamente con </span> */}
                                            <span className="text-[8px] mt-1 font-bold uppercase opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                {f.label.slice(0, 4)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {/* Flecha decorativa */}
                                <div className="absolute right-full top-5 translate-x-1 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-slate-900" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Acción de Peligro */}
            <div className="mt-auto border-t border-blue-800 pt-6 shrink-0">
                <button
                    className="p-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                    title="Limpiar"
                >
                    <Trash2 size={22} />
                </button>
            </div>
        </aside>
    );
};