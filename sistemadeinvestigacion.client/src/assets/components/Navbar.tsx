import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../Routes/Services/authService';
import {
    LayoutDashboard,
    FileSignature,
    Layers,
    Building,
    LogOut,
    Settings,
    Users,
} from 'lucide-react';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error al leer usuario", e);
            }
        }
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('temp_acuerdo');
        navigate('/login');
    };

    const getBtnClass = (path: string) => {
        const active =
            location.pathname === path ||
            location.pathname.startsWith(path + '/') ||
            (path === '/institucionList' && location.pathname.startsWith('/institucion'));

        const base = "flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-bold uppercase tracking-wider mx-1";
        return `${base} ${active
            ? 'bg-white/20 text-white shadow-md scale-105 border border-white/20'
            : 'text-white/80 hover:bg-[#002a66] hover:text-white'}`;
    };

    const logoActualizado = "/logo.png";

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#003385] shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-50 h-16 flex items-center">
            <div className="w-full px-4 flex items-center justify-between">

                <div className="flex items-center">
                    <div className="flex items-center mr-8 cursor-pointer" onClick={() => navigate('/panel')}>
                        <img
                            src={logoActualizado}
                            className="h-10 w-auto mr-3 drop-shadow-md"
                            alt="Logo PDI"
                        />
                        <span className="text-white font-black text-2xl tracking-tighter">
                            Acuerdos
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-4">
                        <button onClick={() => navigate('/panel')} className={getBtnClass('/panel')}>
                            <LayoutDashboard size={16} className="mr-2" /> Inicio
                        </button>
                        <button onClick={() => navigate('/acuerdos')} className={getBtnClass('/acuerdos')}>
                            <FileSignature size={16} className="mr-2" /> Acuerdos
                        </button>

                        <button onClick={() => navigate('/institucionList')} className={getBtnClass('/institucionList')}>
                            <Building size={16} className="mr-2" /> Instituciones
                        </button>
                        <button onClick={() => navigate('/empleado')} className={getBtnClass('/empleado')}>
                            <Users size={16} className="mr-2" /> Empleados
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">

                    {/* BOTÓN LIENZO SANDBOX A LA DERECHA */}
                    <button onClick={() => navigate('/lienzo')} className={getBtnClass('/lienzo')}>
                        <Layers size={16} className="mr-2" /> Lienzo Sandbox
                    </button>

                    <div className="flex flex-col items-end border-l border-white/10 pl-4 pr-2">
                        <span className="text-white font-black text-xs uppercase tracking-widest">
                            {user?.name || 'Admin'}
                        </span>
                    </div>

                    <button
                        onClick={() => navigate('/configuracion')}
                        className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${location.pathname === '/configuracion'
                            ? 'bg-[#FFCC00] text-[#003385] shadow-lg rotate-90 scale-110'
                            : 'text-white/80 hover:bg-white/10 hover:text-white hover:rotate-45'
                            }`}
                        title="Configuración"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-black text-[10px] transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                    >
                        <LogOut size={14} className="mr-2" /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};
