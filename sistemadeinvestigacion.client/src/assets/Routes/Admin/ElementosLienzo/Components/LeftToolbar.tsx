// Admin/ElementosLienzo/Components/LeftToolbar.tsx
import React from 'react';
import {
    Layers,
    Eraser,
    Shapes,
    Pencil,
    Type,
    ImageIcon as LucideImageIcon,
    MousePointer2,
    Save,
    Download
} from 'lucide-react';

type Props = {
    model: any;
};

export const LeftToolbar: React.FC<Props> = ({ model }) => {
    const {
        herramientaActiva,
        setHerramientaActiva,
        setModoPuntos,
        setMenuFigurasOpen,
        menuFigurasOpen,
        FIGURAS,
        sidebarBtnClass,
        limpiarSeleccion,
        fileInputRef,
        idCapaDibujoActual,
        manejarGuardadoFinal,
        descargarSVG
    } = model;

    // ⚠️ No hagas logs condicionales en render; si quieres debug, hazlo en useEffect en el padre.
    // Si sidebarBtnClass no existe, aquí simplemente evitamos romper:
    const btnClass = typeof sidebarBtnClass === 'function'
        ? sidebarBtnClass
        : (_active: boolean) => 'p-4 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100';

    return (
        <aside className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4 shadow-sm z-20">
            <button
                onClick={() => {
                    setHerramientaActiva('multiseleccion');
                    setModoPuntos(false);
                    idCapaDibujoActual.current = null;
                }}
                className={btnClass(herramientaActiva === 'multiseleccion')}
                title="Selección Múltiple"
            >
                <Layers size={22} />
            </button>

            <button
                onClick={() => {
                    setHerramientaActiva(null);
                    setModoPuntos(false);
                    idCapaDibujoActual.current = null;
                }}
                className={btnClass(herramientaActiva === null)}
                title="Seleccionar"
            >
                <MousePointer2 size={22} />
            </button>

            <button
                onClick={() => {
                    setHerramientaActiva('goma');
                    setModoPuntos(false);
                    limpiarSeleccion();
                    idCapaDibujoActual.current = null;
                }}
                className={btnClass(herramientaActiva === 'goma')}
                title="Eliminar por Click"
            >
                <Eraser size={22} />
            </button>

            <div className="relative">
                <button
                    onClick={() => setMenuFigurasOpen(!menuFigurasOpen)}
                    className={btnClass(Array.isArray(FIGURAS) ? FIGURAS.map((x: any) => x.id).includes(herramientaActiva || '') : false)}
                    title="Figuras"
                >
                    <Shapes size={22} />
                </button>

                {menuFigurasOpen && Array.isArray(FIGURAS) && (
                    <div className="absolute left-16 top-0 bg-white shadow-2xl border border-gray-200 rounded-xl p-2 grid grid-cols-2 gap-2 z-50 w-40 animate-in fade-in slide-in-from-left-2">
                        {FIGURAS.map((fig: any) => (
                            <button
                                key={fig.id}
                                onClick={() => {
                                    setHerramientaActiva(fig.id);
                                    setModoPuntos(false);
                                    setMenuFigurasOpen(false);
                                    idCapaDibujoActual.current = null;
                                }}
                                className="p-3 hover:bg-blue-50 rounded-lg text-gray-600 flex flex-col items-center justify-center transition-colors"
                                title={fig.label}
                            >
                                {fig.icon ? <fig.icon size={18} /> : null}
                                <span className="text-[9px] font-bold text-gray-500 mt-1">{fig.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={() => {
                    setHerramientaActiva('lapiz');
                    setModoPuntos(false);
                    limpiarSeleccion();
                }}
                className={btnClass(herramientaActiva === 'lapiz')}
                title="Lápiz"
            >
                <Pencil size={22} />
            </button>

            <button
                onClick={() => {
                    setHerramientaActiva('texto');
                    setModoPuntos(false);
                    idCapaDibujoActual.current = null;
                }}
                className={btnClass(herramientaActiva === 'texto')}
                title="Texto"
            >
                <Type size={22} />
            </button>

            <button
                onClick={() => {
                    // ✅ correcto: acceder a .current dentro de handler
                    fileInputRef.current?.click();
                    setModoPuntos(false);
                    idCapaDibujoActual.current = null;
                }}
                className={btnClass(false)}
                title="Subir Imagen"
            >
                <LucideImageIcon size={22} />
            </button>

            <div className="flex-1" />

            <button
                onClick={manejarGuardadoFinal}
                className="p-4 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                title="Guardar"
            >
                <Save size={22} />
            </button>

            <button
                onClick={descargarSVG}
                className="p-4 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                title="Descargar"
            >
                <Download size={22} />
            </button>
        </aside>
    );
};
