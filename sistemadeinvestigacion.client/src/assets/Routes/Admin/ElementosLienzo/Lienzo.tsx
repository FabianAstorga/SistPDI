import React, { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/Navbar';
import { useLienzoModel } from './Hooks/useLienzoModel';

import { LeftToolbar } from './Components/LeftToolbar';
import { CanvasStage } from './Components/CanvasStage';
import { RightPanel } from './Components/RightPanel';

const MemoizedLeftToolbar = memo(LeftToolbar);
const MemoizedCanvasStage = memo(CanvasStage);
const MemoizedRightPanel = memo(RightPanel);

const HERO_BG = "https://mvstoragev.blob.core.windows.net/memoriaviva/web/files/33220/i_region_cuartel_investigaciones_arica.webp";

export const Lienzo = () => {
    const navigate = useNavigate();
    const model = useLienzoModel((path: string) => navigate(path));

    const { fileInputRef, svgRef, idCapaDibujoActual, ...modelData } = model;

    return (
        /* Eliminamos cualquier rastro de gris con bg-[#002855] */
        /* overflow-hidden asegura que no aparezcan barras de scroll en el body */
        <div className="h-screen w-full bg-[#002855] flex flex-col overflow-hidden font-sans antialiased text-white relative">
            <Navbar />

            {/* Marca de agua de fondo */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-5"
                style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover' }}
            />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={model.subirImagen}
            />

            {/* Contenedor de herramientas y canvas */}
            <div className="flex flex-1 pt-16 relative z-10 overflow-hidden">

                {/* Toolbar Izquierda: Ahora sobre fondo azul */}
                <MemoizedLeftToolbar
                    model={{ ...modelData, fileInputRef, idCapaDibujoActual }}
                />

                {/* Área del Canvas: Única zona blanca, sin márgenes ni sombras grises */}
                <div className="flex-1 bg-transparent overflow-hidden relative">
                    <MemoizedCanvasStage
                        model={{ ...modelData, svgRef }}
                        svgId="lienzo-svg"
                    />
                </div>

                {/* Panel Derecho: Ahora sobre fondo azul */}
                <MemoizedRightPanel
                    model={modelData}
                />
            </div>
        </div>
    );
};