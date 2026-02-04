import React, { useState } from 'react';
import { Navbar } from '../../../components/Navbar';
import { useLienzoState } from './useLienzoState';
import { Canvas } from '../lienzo/components/Canvas';
import { Sidebar } from './Sidebar';
import { PropertiesPanel } from './PropertiesPanel';

export const LienzoPage = () => {
    const {
        elementos,
        seleccionadoId,
        setSeleccionadoId,
        actualizarAtributo,
        redimensionarElemento, // Extraído del hook
        agregarElemento,
        eliminarElemento,
        moverCapa // Extraído del hook
    } = useLienzoState();

    const [canvasSize, setCanvasSize] = useState({ w: 1000, h: 800 });

    const seleccionado = elementos.find(el => el.id === seleccionadoId);

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans antialiased">
            <Navbar />

            <div className="flex flex-1 pt-16 overflow-hidden">
                <Sidebar onAddElement={agregarElemento} />

                <main className="flex-1 overflow-auto bg-slate-200 flex items-center justify-center p-12 custom-scrollbar">
                    <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300">
                        <Canvas
                            elementos={elementos}
                            seleccionadoId={seleccionadoId}
                            setSeleccionadoId={setSeleccionadoId}
                            actualizarAtributo={actualizarAtributo}
                            redimensionarElemento={redimensionarElemento} // Pasado al Canvas
                            canvasSize={canvasSize}
                        />

                        <div className="absolute -bottom-6 right-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {canvasSize.w} x {canvasSize.h} px
                        </div>
                    </div>
                </main>

                <PropertiesPanel
                    seleccionado={seleccionado}
                    elementos={elementos}
                    actualizarAtributo={actualizarAtributo}
                    onEliminar={eliminarElemento}
                    onMoverCapa={moverCapa} // Pasado al Panel
                    setSeleccionadoId={setSeleccionadoId} // Pasado al Panel
                />
            </div>
        </div>
    );
};

export default LienzoPage;