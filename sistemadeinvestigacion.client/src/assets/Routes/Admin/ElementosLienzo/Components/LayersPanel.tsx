import React from 'react';
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Trash2, Layers } from 'lucide-react';

type Props = {
    elementos: any[];
    seleccionadosIds: number[];
    onSelectFromLayers: (id: number) => void;
    moverCapa: (id: number, direction: 'up' | 'down') => void;
    moverCapaExtremo: (id: number, direction: 'top' | 'bottom') => void;
    eliminarElemento: (id: number) => void;
    controlLabel: string;
};

export const LayersPanel: React.FC<Props> = ({
    elementos,
    seleccionadosIds,
    onSelectFromLayers,
    moverCapa,
    moverCapaExtremo,
    eliminarElemento,
    controlLabel
}) => {
    return (
        <div className="pt-6 border-t border-gray-100">
            <label className={`${controlLabel} flex items-center text-blue-600`}>
                <Layers size={12} className="mr-2" /> Capas
            </label>

            <div className="space-y-1 mt-2 max-h-60 overflow-y-auto pr-1">
                {[...elementos].reverse().map((el) => (
                    <div
                        key={el.id}
                        onClick={() => onSelectFromLayers(el.id)}
                        className={`group p-2.5 rounded-lg flex items-center justify-between cursor-pointer border transition-all ${seleccionadosIds.includes(el.id)
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center space-x-2 truncate">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: el.fill || '#000000' }} />
                            <span className="text-[10px] font-bold text-gray-600 uppercase truncate pr-2">{el.type}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moverCapaExtremo(el.id, 'top');
                                }}
                                className="p-1 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                                title="Llevar al Tope"
                            >
                                <ChevronsUp size={14} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moverCapa(el.id, 'up');
                                }}
                                className="p-1 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                                title="Subir Capa"
                            >
                                <ChevronUp size={14} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moverCapa(el.id, 'down');
                                }}
                                className="p-1 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                                title="Bajar Capa"
                            >
                                <ChevronDown size={14} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moverCapaExtremo(el.id, 'bottom');
                                }}
                                className="p-1 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                                title="Bajar al Fondo"
                            >
                                <ChevronsDown size={14} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarElemento(el.id);
                                }}
                                className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                title="Eliminar"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
