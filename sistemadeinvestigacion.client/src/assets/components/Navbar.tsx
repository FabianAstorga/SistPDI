import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../Routes/Services/authService';
import {
    LayoutDashboard,
    FileSignature,
    Layers,
    Building,
    LogOut,
    Settings,
    Users,
    ChevronDown,
    PlusCircle,
    List
} from 'lucide-react';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); }
            catch (e) { console.error("Error al leer usuario", e); }
        }
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('temp_acuerdo');
        navigate('/');
    };

    // Definición centralizada de la navegación para asegurar consistencia
    const navConfig = [
        { id: 'inicio', label: 'Inicio', path: '/panel', icon: LayoutDashboard },
        {
            id: 'acuerdos', label: 'Acuerdos', icon: FileSignature,
            items: [
                { label: 'Listar Acuerdos', path: '/acuerdos', icon: List },
                { label: 'Crear Acuerdo', path: '/acuerdos/crear', icon: PlusCircle },
            ]
        },
        {
            id: 'empresas', label: 'Empresas', icon: Building,
            items: [
                { label: 'Listar Empresas', path: '/institucionList', icon: List },
                { label: 'Registrar Empresa', path: '/institucion/crear', icon: PlusCircle },
            ]
        },
        {
            id: 'empleados', label: 'Empleados', icon: Users,
            items: [
                { label: 'Listar Empleados', path: '/empleado', icon: List },
                { label: 'Nuevo Empleado', path: '/empleado/crear', icon: PlusCircle },
            ]
        },
        { id: 'plantilla', label: 'Plantilla', path: '/lienzo', icon: Layers },
    ];

    // Determina qué sección principal está activa basándose en la URL
    const activeSection = navConfig.find(section =>
        section.path === location.pathname ||
        section.items?.some(item => item.path === location.pathname)
    )?.id;

    return (
        <nav className="fixed top-0 left-0 w-full z-[100] h-16 flex items-center px-6">
            {/* Fondo con Glassmorphism */}
            <div className="absolute inset-0 bg-[#001a35]/80 backdrop-blur-md border-b border-white/5 shadow-2xl" />

            <div className="relative w-full flex items-center justify-between h-full">

                {/* BLOQUE IZQUIERDO: Logo y Nav */}
                <div className="flex items-center gap-6 h-full">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 cursor-pointer mr-4"
                        onClick={() => navigate('/panel')}
                    >
                        <img src="/LOGOPDI.png" className="h-9 w-auto brightness-200" alt="PDI" />
                        
                    </motion.div>

                    {/* CONTENEDOR UNIFICADO DE BOTONES */}
                    <div className="hidden lg:flex items-center bg-white/5 p-1 rounded-2xl border border-white/5 h-12 relative">
                        {navConfig.map((section) => {
                            const isActive = activeSection === section.id;
                            const isHovered = hoveredMenu === section.id;

                            return (
                                <div
                                    key={section.id}
                                    className="relative h-full flex items-center"
                                    onMouseEnter={() => setHoveredMenu(section.id)}
                                    onMouseLeave={() => setHoveredMenu(null)}
                                >
                                    <button
                                        onClick={() => section.path && navigate(section.path)}
                                        className={`relative flex items-center px-4 py-2 rounded-xl transition-colors duration-300 text-xs font-bold uppercase tracking-tight gap-2 z-20
                                            ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                                    >
                                        <section.icon size={16} className={isActive ? 'text-blue-400' : ''} />
                                        {section.label}
                                        {section.items && (
                                            <motion.div animate={{ rotate: isHovered ? 180 : 0 }}>
                                                <ChevronDown size={14} />
                                            </motion.div>
                                        )}

                                        {/* EL PILL: Solo uno existe en todo el componente, controlado por layoutId */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-selection-pill"
                                                className="absolute inset-0 bg-white/10 rounded-xl z-[-1]"
                                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                            />
                                        )}
                                    </button>

                                    {/* DROPDOWN SUBMENU */}
                                    <AnimatePresence>
                                        {section.items && isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-[calc(100%+8px)] left-0 w-48 bg-[#001a35] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[110] backdrop-blur-xl p-2 flex flex-col gap-1"
                                            >
                                                {section.items.map((item) => (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => {
                                                            navigate(item.path);
                                                            setHoveredMenu(null);
                                                        }}
                                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider text-left w-full"
                                                    >
                                                        <item.icon size={14} className="text-blue-400" />
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* BLOQUE DERECHO: Usuario y Herramientas */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-white font-black text-[11px] uppercase tracking-widest leading-none">
                            {user?.nombre || 'Funcionario'}
                        </span>
                    </div>

                    <div className="h-6 w-[1px] bg-white/10 mx-1" />

                    {/* Engranaje Minimalista */}
                    <motion.button
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8, rotate: 180 }}
                        onClick={() => navigate('/configuracion')}
                        className={`p-1.5 transition-colors ${location.pathname === '/configuracion' ? 'text-blue-500' : 'text-white/50 hover:text-white'}`}
                    >
                        <Settings size={22} strokeWidth={2.5} />
                    </motion.button>

                    {/* Botón Salir */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="group relative flex items-center bg-gradient-to-r from-red-500/10 to-red-500/20 hover:from-red-500 hover:to-red-600 px-5 py-2 rounded-xl border border-red-500/30 hover:border-transparent transition-all duration-300 shadow-lg shadow-red-500/5 hover:shadow-red-500/30"
                    >
                        <span className="text-red-500 group-hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <LogOut size={14} />
                            Salir
                        </span>
                    </motion.button>
                </div>
            </div>
        </nav>
    );
};