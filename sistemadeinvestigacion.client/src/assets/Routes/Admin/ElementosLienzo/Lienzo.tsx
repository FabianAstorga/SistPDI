import React, { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/Navbar';
import { useLienzoModel } from './Hooks/useLienzoModel';

// Importaciones memoizadas para evitar re-renders en cascada
import { LeftToolbar } from './Components/LeftToolbar';
import { CanvasStage } from './Components/CanvasStage';
import { RightPanel } from './Components/RightPanel';

// Memoizamos los componentes hijos para que solo reaccionen a sus props específicas
const MemoizedLeftToolbar = memo(LeftToolbar);
const MemoizedCanvasStage = memo(CanvasStage);
const MemoizedRightPanel = memo(RightPanel);

export const Lienzo = () => {
    const navigate = useNavigate();

    // Inyectamos la navegación al hook. 
    // Asegúrate de que useLienzoModel use useCallback internamente para sus funciones.
    const model = useLienzoModel((path: string) => navigate(path));

    // 1. Separación de Referencias (No provocan re-render, pero deben pasarse limpias)
    const { fileInputRef, svgRef, idCapaDibujoActual, ...modelData } = model;

    // 2. Memoización del título para evitar cálculos en el render principal
    const displayTitle = useMemo(() => (
        modelData.tituloAcuerdo || 'No Acuerdo seleccionado'
    ), [modelData.tituloAcuerdo]);

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans antialiased text-gray-900">
            <Navbar />

            {/* Input oculto: se mantiene fuera del flujo principal de renderizado del lienzo */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={model.subirImagen}
            />

            <div className="flex flex-1 pt-16 overflow-hidden flex-col">
                {/* Header del Lienzo */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-center">
                    <div className="px-4 py-2 border-2 border-[#D4AF37] rounded-md">
                        <h1 className="text-sm font-black text-gray-800 uppercase tracking-tight truncate max-w-[70vw] text-center">
                            {displayTitle}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Toolbar Izquierda: Solo recibe lo necesario para herramientas */}
                    <MemoizedLeftToolbar
                        model={{ ...modelData, fileInputRef, idCapaDibujoActual }}
                    />

                    {/* Stage Central: El área más pesada, aislada por referencia de SVG */}
                    <MemoizedCanvasStage
                        model={{ ...modelData, svgRef }}
                        svgId="lienzo-svg"
                    />

                    {/* Panel Derecho: Limpio de referencias al DOM, solo datos y estados */}
                    <MemoizedRightPanel
                        model={modelData}
                    />
                </div>
            </div>
        </div>
    );
};