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

const HERO_BG = "/i_region_cuartel_investigaciones_arica.png";

export const Lienzo = () => {
    const navigate = useNavigate();
    const model = useLienzoModel((path: string) => navigate(path));

    const { fileInputRef, svgRef, idCapaDibujoActual, ...modelData } = model;

    return (
        <div className="h-screen w-full bg-[#002855] flex flex-col overflow-hidden font-sans antialiased text-white relative">
            <Navbar />

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

            <div className="flex flex-1 pt-16 relative z-10 overflow-hidden">

                <MemoizedLeftToolbar
                    model={{ ...modelData, fileInputRef, idCapaDibujoActual }}
                />

                <div className="flex-1 bg-transparent overflow-hidden relative">
                    <MemoizedCanvasStage
                        model={{ ...modelData, svgRef }}
                        svgId="lienzo-svg"
                    />
                </div>

                <MemoizedRightPanel
                    model={modelData}
                />
            </div>
        </div>
    );
};