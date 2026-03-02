import React, { useMemo, useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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

const FiguraMiniIcon = memo(({ id }: { id: string }) => {
    const common = { width: 20, height: 20, viewBox: '0 0 100 100', className: 'block transition-transform group-hover:scale-110' };
    const shapes: Record<string, React.ReactNode> = {
        rectangulo: <rect x="18" y="26" width="64" height="48" rx="6" fill="currentColor" />,
        circulo: <circle cx="50" cy="50" r="28" fill="currentColor" />,
        triangulo: <polygon points="50,18 18,82 82,82" fill="currentColor" />,
        rombo: <polygon points="50,16 84,50 50,84 16,50" fill="currentColor" />,
        hexagono: <polygon points="30,18 70,18 88,50 70,82 30,82 12,50" fill="currentColor" />,
        octagono: <polygon points="32,14 68,14 86,32 86,68 68,86 32,86 14,68 14,32" fill="currentColor" />,
        estrella: <polygon points="50,10 60,38 90,38 66,56 76,86 50,68 24,86 34,56 10,38 40,38" fill="currentColor" />
    };
    return <svg {...common}>{shapes[id] || <circle cx="50" cy="50" r="8" fill="currentColor" />}</svg>;
});

const TrazoMiniIcon = memo(({ id }: { id: string }) => {
    const common = { width: 20, height: 20, viewBox: '0 0 100 100', className: 'block transition-transform group-hover:scale-110' };
    if (id === 'linea') return <svg {...common}><line x1="18" y1="78" x2="82" y2="22" stroke="currentColor" strokeWidth="12" strokeLinecap="round" /></svg>;
    if (id === 'flecha') return (
        <svg {...common}>
            <line x1="18" y1="78" x2="78" y2="28" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            <polygon points="78,28 78,48 92,22" fill="currentColor" />
        </svg>
    );
    return (
        <svg {...common}>
            <path d="M 18 78 Q 50 18 82 42" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        </svg>
    );
});

export const LeftToolbar: React.FC<Props> = memo(({ model }) => {
    const {
        herramientaActiva, setHerramientaActiva, setModoPuntos,
        setMenuFigurasOpen, menuFigurasOpen, FIGURAS,
        limpiarSeleccion, fileInputRef,
        idCapaDibujoActual, manejarGuardadoFinal, descargarSVG
    } = model;

    const [menuTrazosOpen, setMenuTrazosOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const TRZ = useMemo(() => [
        { id: 'linea', label: 'Línea' },
        { id: 'flecha', label: 'Flecha' },
        { id: 'curva', label: 'Curva' }
    ], []);

    const cerrarMenus = useCallback(() => {
        setMenuFigurasOpen(false);
        setMenuTrazosOpen(false);
    }, [setMenuFigurasOpen]);

    const activarHerramienta = useCallback((tool: any) => {
        setHerramientaActiva(tool);
        setModoPuntos(false);
        limpiarSeleccion();
        if (idCapaDibujoActual?.current !== undefined) idCapaDibujoActual.current = null;
        cerrarMenus();
    }, [setHerramientaActiva, setModoPuntos, limpiarSeleccion, idCapaDibujoActual, cerrarMenus]);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await manejarGuardadoFinal();
        } catch (error) {
            console.error("Error saving:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const renderToolbarBtn = (id: any, Icon: any, label: string, onClick: () => void, isActive: boolean) => (
        <button
            onClick={onClick}
            className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 
                ${isActive ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            title={label}
        >
            <Icon size={20} strokeWidth={2.5} className={isActive ? 'text-blue-400' : ''} />
            {isActive && (
                <motion.div
                    layoutId="sidebar-selection-pill"
                    className="absolute inset-0 bg-white/10 rounded-xl z-[-1]"
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                />
            )}
        </button>
    );

    return (
        <aside className="w-20 bg-[#001a35]/40 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 gap-4 z-50">

            {renderToolbarBtn(null, MousePointer2, "Seleccionar", () => {
                setHerramientaActiva(null);
                setModoPuntos(false);
                if (idCapaDibujoActual?.current !== undefined) idCapaDibujoActual.current = null;
                cerrarMenus();
            }, herramientaActiva === null)}

            <div className="relative">
                {renderToolbarBtn('figuras', Shapes, "Figuras", () => {
                    setMenuFigurasOpen(!menuFigurasOpen);
                    setMenuTrazosOpen(false);
                }, FIGURAS?.some((x: any) => x.id === herramientaActiva))}

                <AnimatePresence>
                    {menuFigurasOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="absolute left-16 top-0 w-64 bg-[#001a35] border border-white/10 rounded-2xl shadow-2xl p-3 grid grid-cols-3 gap-2 z-[60] backdrop-blur-2xl"
                        >
                            {FIGURAS?.map((fig: any) => (
                                <button
                                    key={fig.id}
                                    onClick={() => activarHerramienta(fig.id)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-all group gap-2"
                                >
                                    <div className="text-blue-400 group-hover:text-white transition-colors">
                                        <FiguraMiniIcon id={fig.id} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-white/40 group-hover:text-white">
                                        {fig.label}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative">
                {renderToolbarBtn('trazos', Pencil, "Trazos", () => {
                    setMenuTrazosOpen(!menuTrazosOpen);
                    setMenuFigurasOpen(false);
                }, ['linea', 'flecha', 'curva'].includes(herramientaActiva || ''))}

                <AnimatePresence>
                    {menuTrazosOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="absolute left-16 top-0 w-48 bg-[#001a35] border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-[60] backdrop-blur-2xl"
                        >
                            {TRZ.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => activarHerramienta(t.id)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 group transition-all"
                                >
                                    <div className="text-blue-400 group-hover:text-white">
                                        <TrazoMiniIcon id={t.id} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">
                                        {t.label}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {renderToolbarBtn('texto', Type, "Texto", () => activarHerramienta('texto'), herramientaActiva === 'texto')}

            {renderToolbarBtn('imagen', LucideImageIcon, "Imagen", () => {
                fileInputRef.current?.click();
                cerrarMenus();
            }, false)}

            <div className="flex-1" />

            <div className="flex flex-col gap-2 pb-2">
                <motion.button
                    whileHover={!isSaving ? { scale: 1.1 } : {}}
                    whileTap={!isSaving ? { scale: 0.9 } : {}}
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all
                        ${isSaving
                            ? 'text-white/20 bg-white/5 border-white/5 cursor-not-allowed'
                            : 'text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500 hover:text-white'}`}
                    title={isSaving ? "Guardando..." : "Guardar"}
                >
                    <AnimatePresence mode="wait">
                        {isSaving ? (
                            <motion.div
                                key="loading"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <Save size={20} className="opacity-50" />
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Save size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={descargarSVG}
                    className="w-12 h-12 flex items-center justify-center text-blue-400 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                    title="Descargar"
                >
                    <Download size={20} />
                </motion.button>
            </div>
        </aside>
    );
});