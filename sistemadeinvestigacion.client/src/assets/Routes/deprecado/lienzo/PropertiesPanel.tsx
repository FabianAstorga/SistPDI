// lienzo/PropertiesPanel.tsx
import React from 'react';
import type { Elemento } from './types';
import { Trash2, Layers, Type, Square, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
    seleccionado: Elemento | undefined;
    elementos: Elemento[];
    actualizarAtributo: (id: number, cambios: Partial<Elemento>) => void;
    onEliminar: (id: number) => void;
    onMoverCapa: (id: number, direccion: 'arriba' | 'abajo') => void;
    setSeleccionadoId: (id: number | null) => void;
}

export const PropertiesPanel = ({ seleccionado, elementos, actualizarAtributo, onEliminar, onMoverCapa, setSeleccionadoId }: Props) => {
    return (
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-30">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Configuración</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {seleccionado ? (
                    <div className="space-y-6">
                        {/* Controles de edición (se mantienen igual que antes) */}
                        {seleccionado.type === 'texto' && (
                            <section>
                                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Contenido</label>
                                <textarea
                                    value={seleccionado.text || ''}
                                    onChange={(e) => actualizarAtributo(seleccionado.id, { text: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                />
                            </section>
                        )}

                        <button
                            onClick={() => onEliminar(seleccionado.id)}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                        >
                            <Trash2 size={14} /> Eliminar
                        </button>
                    </div>
                ) : (
                    /* LISTA DE CAPAS MEJORADA */
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-4 border-b pb-2">
                            <Layers size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Capas (Orden Z)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {[...elementos].reverse().map((el) => (
                                <div
                                    key={el.id}
                                    onClick={() => setSeleccionadoId(el.id)}
                                    className="group p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 hover:border-blue-300 transition-all cursor-pointer"
                                >
                                    {el.type === 'texto' ? <Type size={14} /> : <Square size={14} />}
                                    <span className="text-xs font-semibold text-slate-600 truncate flex-1">
                                        {el.type === 'texto' ? el.text?.substring(0, 15) + '...' : el.type}
                                    </span>

                                    {/* Controles de Capa rápidos */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onMoverCapa(el.id, 'arriba'); }}
                                            className="p-1 hover:bg-white rounded shadow-sm text-slate-400 hover:text-blue-600"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onMoverCapa(el.id, 'abajo'); }}
                                            className="p-1 hover:bg-white rounded shadow-sm text-slate-400 hover:text-blue-600"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};