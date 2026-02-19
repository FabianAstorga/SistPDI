import React, { useMemo, memo } from 'react';
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Trash2, Layers, Database } from 'lucide-react';

type Props = {
    elementos: any[];
    seleccionadosIds: number[];
    onSelectFromLayers: (id: number) => void;
    moverCapa: (id: number, direction: 'up' | 'down') => void;
    moverCapaExtremo: (id: number, direction: 'top' | 'bottom') => void;
    eliminarElemento: (id: number) => void;
    controlLabel: string;
};

const getElColor = (el: any) => el?.stroke || el?.fill || '#3b82f6';

const LayerRow = memo(({
    el, isSelected, isTop, isBottom, onSelect, onMove, onMoveExtreme, onDelete
}: any) => {
    const id = Number(el.id);

    return (
        <div
            onClick={() => onSelect(id)}
            className={`group p-2.5 rounded-lg flex items-center justify-between cursor-pointer border transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50'
                }`}
        >
            <div className="flex items-center space-x-2 truncate flex-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getElColor(el) }} />

                <div className="flex flex-col truncate">
                    <span className={`text-[10px] font-bold uppercase truncate ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                        {el.name || el.type || 'Elemento'}
                    </span>

                    {el.templateKey && (
                        <div className="flex items-center text-[8px] text-blue-500 mt-0.5">
                            <Database size={8} className="mr-1" />
                            <span className="truncate">{el.templateKey}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-1 ml-2 shrink-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveExtreme(id, 'top'); }}
                    disabled={isTop}
                    className={`p-1 rounded-md transition-all ${isTop
                        ? 'text-gray-200'
                        : 'text-black hover:bg-black/10 hover:scale-110'
                        }`}
                    title="Llevar al Tope"
                >
                    <ChevronsUp size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onMove(id, 'up'); }}
                    disabled={isTop}
                    className={`p-1 rounded-md transition-all ${isTop
                        ? 'text-gray-200'
                        : 'text-black hover:bg-black/10 hover:scale-110'
                        }`}
                    title="Subir"
                >
                    <ChevronUp size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onMove(id, 'down'); }}
                    disabled={isBottom}
                    className={`p-1 rounded-md transition-all ${isBottom
                        ? 'text-gray-200'
                        : 'text-black hover:bg-black/10 hover:scale-110'
                        }`}
                    title="Bajar"
                >
                    <ChevronDown size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onMoveExtreme(id, 'bottom'); }}
                    disabled={isBottom}
                    className={`p-1 rounded-md transition-all ${isBottom
                        ? 'text-gray-200'
                        : 'text-black hover:bg-black/10 hover:scale-110'
                        }`}
                    title="Al Fondo"
                >
                    <ChevronsDown size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="p-1 text-black hover:text-red-600 hover:bg-red-50 rounded-md transition-all hover:scale-110"
                    title="Eliminar"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
});

export const LayersPanel: React.FC<Props> = memo(({
    elementos,
    seleccionadosIds,
    onSelectFromLayers,
    moverCapa,
    moverCapaExtremo,
    eliminarElemento,
    controlLabel
}) => {
    const selectedSet = useMemo(() => new Set(seleccionadosIds), [seleccionadosIds]);

    return (
        <div className="w-full">
            {/* Clases limitantes removidas: la lista ahora crecerá natural */}
            <div className="flex flex-col-reverse space-y-1 space-y-reverse w-full pb-4">
                {elementos.map((el, idx) => {
                    const id = Number(el.id);
                    return (
                        <LayerRow
                            key={id}
                            el={el}
                            isSelected={selectedSet.has(id)}
                            isBottom={idx === 0}
                            isTop={idx === elementos.length - 1}
                            onSelect={onSelectFromLayers}
                            onMove={moverCapa}
                            onMoveExtreme={moverCapaExtremo}
                            onDelete={eliminarElemento}
                        />
                    );
                })}
            </div>
        </div>
    );
});