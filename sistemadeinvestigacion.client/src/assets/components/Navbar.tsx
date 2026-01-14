import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../Routes/Services/authService';
// Importamos algunos iconos de Lucide que ya usas en el Lienzo
import {
    LayoutDashboard,
    FileSignature,
    Layers,
    PlusCircle,
    LogOut,
    User as UserIcon
} from 'lucide-react';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (userStored) setUser(JSON.parse(userStored));
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Tomado de tu lógica de sidebarBtnClass del Lienzo
    const getBtnClass = (path) => {
        const active = location.pathname === path;
        const base = "flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-bold uppercase tracking-wider mx-1";
        // Si está activo, usamos el azul #003385 con sombra del lienzo
        return `${base} ${active
            ? 'bg-[#003385] text-white shadow-md scale-105'
            : 'text-white/80 hover:bg-[#002a66] hover:text-white'}`;
    };

    const logoActualizado = "/logo.png";

    return (
        // Usamos la sombra profunda del lienzo pero suavizada
        <nav className="fixed top-0 left-0 w-full bg-[#003385] shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-50 h-15 flex items-center">
            <div className="w-full px-4 flex items-center justify-between">

                {/* IZQUIERDA: Brand + Menu Estilo Lienzo */}
                <div className="flex items-center">
                    <div className="flex items-center mr-10 cursor-pointer" onClick={() => navigate('/panel')}>
                        <img
                            src={logoActualizado}
                            className="h-8 w-auto mr-3 drop-shadow-md"
                            alt="Logo PDI"
                        />
                        <span className="text-white font-black text-3xl  tracking-tighter ">
                             Acuerdos
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-3">
                        <button onClick={() => navigate('/panel')} className={getBtnClass('/panel')}>
                            <LayoutDashboard size={16} className="mr-2" /> Inicio
                        </button>
                        <button onClick={() => navigate('/acuerdos')} className={getBtnClass('/acuerdos')}>
                            <FileSignature size={16} className="mr-2" /> Acuerdos
                        </button>
                        <button onClick={() => navigate('/lienzo')} className={getBtnClass('/lienzo')}>
                            <Layers size={16} className="mr-2" /> Lienzo
                        </button>
                        <button onClick={() => navigate('/configuracion')} className={getBtnClass('/configuracion')}>
                            <PlusCircle size={16} className="mr-2" /> Nuevo
                        </button>
                    </div>
                </div>

                {/* DERECHA: User Info + Logout */}
                <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-end border-r border-white/10 pr-6">
                        <span className="text-white font-black text-sm uppercase tracking-widest">
                            {user?.name || 'Admin'}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                    >
                        <LogOut size={16} className="mr-2" /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};