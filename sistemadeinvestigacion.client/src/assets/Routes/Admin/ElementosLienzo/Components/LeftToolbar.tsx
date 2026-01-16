// Admin/ElementosLienzo/Components/LeftToolbar.tsx
import React, { useMemo, useState } from 'react';
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

// ===== Mini iconos (SVG) para mostrar dentro de los dropdowns =====
const FiguraMiniIcon: React.FC<{ id: string }> = ({ id }) => {
    // Iconos simples, no dependen de lucide (evitamos imports que fallen)
    // Se renderizan en gris; el hover lo maneja el botón.
    const common = {
        width: 22,
        height: 22,
        viewBox: '0 0 100 100',
        className: 'block'
    };

    if (id === 'rectangulo') {
        return (
            <svg {...common}>
                <rect x="18" y="26" width="64" height="48" rx="6" fill="currentColor" opacity="0.85" />
            </svg>
        );
    }

    if (id === 'circulo') {
        return (
            <svg {...common}>
                <circle cx="50" cy="50" r="28" fill="currentColor" opacity="0.85" />
            </svg>
        );
    }

    if (id === 'triangulo') {
        return (
            <svg {...common}>
                <polygon points="50,18 18,82 82,82" fill="currentColor" opacity="0.85" />
            </svg>
        );
    }

    if (id === 'rombo') {
        return (
            <svg {...common}>
                <polygon points="50,16 84,50 50,84 16,50" fill="currentColor" opacity="0.85" />
            </svg>
        );
    }

    if (id === 'hexagono') {
        return (
            <svg {...common}>
                <polygon points="30,18 70,18 88,50 70,82 30,82 12,50" fill="currentColor" opacity="0.85" />
            </svg>
        );
    }

    if (id === 'octagono') {
        return (
            <svg {...common}>
                <polygon
                    points="32,14 68,14 86,32 86,68 68,86 32,86 14,68 14,32"
                    fill="currentColor"
                    opacity="0.85"
                />
            </svg>
        );
    }

    if (id === 'estrella') {
        return (
            <svg {...common}>
                <polygon
                    points="50,10 60,38 90,38 66,56 76,86 50,68 24,86 34,56 10,38 40,38"
                    fill="currentColor"
                    opacity="0.85"
                />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.85" />
        </svg>
    );
};

const TrazoMiniIcon: React.FC<{ id: 'linea' | 'flecha' | 'curva' }> = ({ id }) => {
    const common = {
        width: 22,
        height: 22,
        viewBox: '0 0 100 100',
        className: 'block'
    };

    if (id === 'linea') {
        return (
            <svg {...common}>
                <line x1="18" y1="78" x2="82" y2="22" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            </svg>
        );
    }

    if (id === 'flecha') {
        return (
            <svg {...common}>
                <line x1="18" y1="78" x2="78" y2="28" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                <polygon points="78,28 78,48 92,22" fill="currentColor" />
            </svg>
        );
    }

    // curva (quadratic-like)
    return (
        <svg {...common}>
            <path
                d="M 18 78 Q 50 18 82 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
            />
            <circle cx="18" cy="78" r="6" fill="currentColor" />
            <circle cx="82" cy="42" r="6" fill="currentColor" />
        </svg>
    );
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

    // Menú local para Trazos
    const [menuTrazosOpen, setMenuTrazosOpen] = useState(false);

    const TRZ = useMemo(
        () =>
            [
                { id: 'linea' as const, label: 'Línea' },
                { id: 'flecha' as const, label: 'Flecha' },
                { id: 'curva' as const, label: 'Curva' }
            ] as const,
        []
    );

    const cerrarMenus = () => {
        setMenuFigurasOpen(false);
        setMenuTrazosOpen(false);
    };

    const activarHerramienta = (tool: any) => {
        setHerramientaActiva(tool);
        setModoPuntos(false);
        // cuando dibujo, normalmente no quiero quedarme en modo puntos
        // ni mover puntos del elemento anterior:
        // (si quieres conservar selección, quita este limpiarSeleccion())
        limpiarSeleccion();
        if (idCapaDibujoActual?.current !== undefined) idCapaDibujoActual.current = null;
    };

    return (
        <aside className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4 shadow-sm z-20">
            {/* Multi selección */}
            <button
                onClick={() => {
                    activarHerramienta('multiseleccion');
                }}
                className={sidebarBtnClass(herramientaActiva === 'multiseleccion')}
                title="Selección Múltiple"
            >
                <Layers size={22} />
            </button>

            {/* Seleccionar */}
            <button
                onClick={() => {
                    setHerramientaActiva(null);
                    setModoPuntos(false);
                    if (idCapaDibujoActual?.current !== undefined) idCapaDibujoActual.current = null;
                    cerrarMenus();
                }}
                className={sidebarBtnClass(herramientaActiva === null)}
                title="Seleccionar"
            >
                <MousePointer2 size={22} />
            </button>

            {/* Goma */}
            <button
                onClick={() => {
                    activarHerramienta('goma');
                    cerrarMenus();
                }}
                className={sidebarBtnClass(herramientaActiva === 'goma')}
                title="Eliminar por Click"
            >
                <Eraser size={22} />
            </button>

            {/* FIGURAS (dropdown) */}
            <div className="relative">
                <button
                    onClick={() => {
                        setMenuFigurasOpen(!menuFigurasOpen);
                        setMenuTrazosOpen(false);
                    }}
                    className={sidebarBtnClass(
                        (FIGURAS || []).map((x: any) => x.id).includes(herramientaActiva || '')
                    )}
                    title="Figuras"
                >
                    <Shapes size={22} />
                </button>

                {menuFigurasOpen && (
                    <div className="absolute left-16 top-0 bg-white shadow-2xl border border-gray-200 rounded-xl p-2 grid grid-cols-3 gap-2 z-50 w-56 animate-in fade-in slide-in-from-left-2">
                        {(FIGURAS || []).map((fig: any) => (
                            <button
                                key={fig.id}
                                onClick={() => {
                                    setHerramientaActiva(fig.id);
                                    setModoPuntos(false);
                                    setMenuFigurasOpen(false);
                                    if (idCapaDibujoActual?.current !== undefined) idCapaDibujoActual.current = null;
                                }}
                                className="p-2 hover:bg-blue-50 rounded-lg text-gray-600 flex flex-col items-center justify-center transition-colors"
                                title={fig.label}
                            >
                                <div className="text-gray-700">
                                    <FiguraMiniIcon id={fig.id} />
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 mt-1 text-center leading-tight">
                                    {fig.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* TRAZOS (dropdown) */}
            <div className="relative">
                <button
                    onClick={() => {
                        setMenuTrazosOpen(!menuTrazosOpen);
                        setMenuFigurasOpen(false);
                    }}
                    className={sidebarBtnClass(['linea', 'flecha', 'curva'].includes(herramientaActiva || ''))}
                    title="Trazos"
                >
                    {/* Iconito propio de “trazos” */}
                    <span className="text-gray-700">
                        <TrazoMiniIcon id="linea" />
                    </span>
                </button>

                {menuTrazosOpen && (
                    <div className="absolute left-16 top-0 bg-white shadow-2xl border border-gray-200 rounded-xl p-2 grid grid-cols-1 gap-2 z-50 w-44 animate-in fade-in slide-in-from-left-2">
                        {TRZ.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    activarHerramienta(t.id);
                                    setMenuTrazosOpen(false);
                                }}
                                className="p-2 hover:bg-blue-50 rounded-lg text-gray-600 flex items-center gap-2 transition-colors"
                                title={t.label}
                            >
                                <div className="text-gray-700">
                                    <TrazoMiniIcon id={t.id} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600">{t.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lápiz */}
            <button
                onClick={() => {
                    setHerramientaActiva('lapiz');
                    setModoPuntos(false);
                    limpiarSeleccion();
                    cerrarMenus();
                }}
                className={sidebarBtnClass(herramientaActiva === 'lapiz')}
                title="Lápiz"
            >
                <Pencil size={22} />
            </button>

            {/* Texto */}
            <button
                onClick={() => {
                    setHerramientaActiva('texto');
                    setModoPuntos(false);
                    if (idCapaDibujoActual?.current !== undefined) idCapaDibujoActual.current = null;
                    cerrarMenus();
                }}
                className={sidebarBtnClass(herramientaActiva === 'texto')}
                title="Texto"
            >
                <Type size={22} />
            </button>

            {/* Subir imagen */}
            <button
                onClick={() => {
                    fileInputRef.current?.click();
                    setModoPuntos(false);
                    if (idCapaDibujoActual?.current !== undefined) idCapaDibujoActual.current = null;
                    cerrarMenus();
                }}
                className={sidebarBtnClass(false)}
                title="Subir Imagen"
            >
                <LucideImageIcon size={22} />
            </button>

            <div className="flex-1" />

            {/* Guardar */}
            <button
                onClick={manejarGuardadoFinal}
                className="p-4 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                title="Guardar"
            >
                <Save size={22} />
            </button>

            {/* Descargar */}
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
