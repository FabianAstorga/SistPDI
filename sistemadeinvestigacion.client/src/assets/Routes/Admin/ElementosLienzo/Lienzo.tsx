// Admin/ElementosLienzo/Lienzo.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/Navbar';

import type { LienzoModel } from './types/lienzo.model';
import { useLienzoModel } from './Hooks/useLienzoModel';
import { LeftToolbar } from './Components/LeftToolbar';
import { CanvasStage } from './Components/CanvasStage';
import { RightPanel } from './Components/RightPanel';

export const Lienzo = () => {
    const navigate = useNavigate();
    const model: LienzoModel = useLienzoModel((path: string) => navigate(path));

    // ✅ quita refs del model que va al RightPanel
    const {
        fileInputRef,
        svgRef,
        idCapaDibujoActual,
        dragHandle, // si también es ref-like o te da lata, sácalo
        ...modelSinRefs
    } = model as any;


    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans antialiased text-gray-900">
            <Navbar />

            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={model.subirImagen} />

            <div className="flex flex-1 pt-16 overflow-hidden flex-col">
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-center">
                    <div className="px-4 py-2 border-2 border-[#D4AF37] rounded-md">
                        <div className="text-sm font-black text-gray-800 uppercase tracking-tight truncate max-w-[70vw] text-center">
                            {model.tituloAcuerdo || 'No Acuerdo seleccionado'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* LeftToolbar sí usa refs */}
                    <LeftToolbar model={{ ...modelSinRefs, fileInputRef, idCapaDibujoActual }} />

                    {/* CanvasStage sí usa svgRef */}
                    <CanvasStage model={{ ...modelSinRefs, svgRef }} />

                    {/* RightPanel NO necesita refs */}
                    <RightPanel model={modelSinRefs} />
                </div>
            </div>
        </div>
    );
};
