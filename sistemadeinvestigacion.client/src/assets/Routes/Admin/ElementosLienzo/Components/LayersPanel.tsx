import React, { useMemo, memo } from 'react';
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

// 1. Extraemos funciones puras fuera del componente para evitar recrearlas
const getElColor = (el: any) => el?.stroke || el?.fill || '#000000';

const EL_LABELS: Record<string, string> = {
    rectangulo: 'Rectángulo', circulo: 'Círculo', triangulo: 'Triángulo',
    rombo: 'Rombo', hexagono: 'Hexágono', octagono: 'Octágono',
    estrella: 'Estrella', texto: 'Texto', imagen: 'Imagen',
    lapiz: 'Lápiz', linea: 'Línea', flecha: 'Flecha', curva: 'Curva'
};

const getElLabel = (el: any) => {
    const t = String(el?.type || '').toLowerCase();
    return EL_LABELS[t] || t || 'Elemento';
};

// 2. Componente de fila individual memoizado
// Solo se re-renderiza si cambian sus propiedades específicas o su estado de selección
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
            <div className="flex items-center space-x-2 truncate">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getElColor(el) }} />
                <span className="text-[10px] font-bold text-gray-600 uppercase truncate pr-2">
                    {getElLabel(el)}
                </span>
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveExtreme(id, 'top'); }}
                    disabled={isTop}
                    className={`p-1 rounded-md ${isTop ? 'text-gray-200' : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100'}`}
                    title="Llevar al Tope"
                >
                    <ChevronsUp size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onMove(id, 'up'); }}
                    disabled={isTop}
                    className={`p-1 rounded-md ${isTop ? 'text-gray-200' : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100'}`}
                    title="Subir"
                >
                    <ChevronUp size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onMove(id, 'down'); }}
                    disabled={isBottom}
                    className={`p-1 rounded-md ${isBottom ? 'text-gray-200' : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100'}`}
                    title="Bajar"
                >
                    <ChevronDown size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onMoveExtreme(id, 'bottom'); }}
                    disabled={isBottom}
                    className={`p-1 rounded-md ${isBottom ? 'text-gray-200' : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100'}`}
                    title="Al Fondo"
                >
                    <ChevronsDown size={14} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md"
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
    // 3. Optimizamos el acceso a índices con un Set para los seleccionados (Búsqueda O(1))
    const selectedSet = useMemo(() => new Set(seleccionadosIds), [seleccionadosIds]);

    return (
        <div className="pt-6 border-t border-gray-100">
            <label className={`${controlLabel} flex items-center text-blue-600 mb-2`}>
                <Layers size={12} className="mr-2" /> Capas ({elementos.length})
            </label>

            <div className="max-h-60 overflow-y-auto pr-1 flex flex-col-reverse space-y-1 space-y-reverse custom-scrollbar">
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