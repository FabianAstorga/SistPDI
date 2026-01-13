import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../Routes/Services/authService'


export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const logoPDI = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Policia_de_Investigaciones_de_Chile.svg/1200px-Policia_de_Investigaciones_de_Chile.svg.png";

    const handleLogout = async () => {
        console.log('Debug, llegue hasta aca');
        await authService.logout();

       console.log("pase");
       navigate('/login');
    }

    const buttonBaseClass = "text-white text-xl font-semibold px-4 py-2 rounded-md transition duration-200 ease-in-out hover:bg-[#002a66] active:bg-[#001d47] active:ring-2 active:ring-[#FFCC00] active:ring-offset-2 active:ring-offset-[#003385]";

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#003385] shadow-xl z-50 border-b-2 border-[#FFCC00]">
            <div className="w-full px-10">
                <div className="flex items-center justify-between h-20">
                    <div
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => navigate('/panel')}
                    >
                        <img
                            className="h-14 w-auto object-contain"
                            src={logoPDI}
                            alt="Logo PDI"
                        />
                        <span className="text-[#FFCC00] font-bold text-3xl tracking-tight">
                            Sistema de Acuerdos
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/panel')}
                            className={`${buttonBaseClass} ${location.pathname === '/panel' ? 'bg-[#002a66] border border-[#FFCC00]' : ''}`}
                        >
                            Inicio
                        </button>

                        <button
                            onClick={() => navigate('/lienzo')}
                            className={`${buttonBaseClass} ${location.pathname === '/panel/lienzo' ? 'bg-[#002a66] border border-[#FFCC00]' : ''}`}
                        >
                            Lienzo
                        </button>

                        <button
                            onClick={() => navigate('/configuracion')}
                            className={`${buttonBaseClass} ${location.pathname === '/panel/configuracion' ? 'bg-[#002a66] border border-[#FFCC00]' : ''}`}
                        >
                            Configuración
                        </button>

                        <button
                            onClick={handleLogout}
                            className="ml-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-6 py-2 rounded-lg text-xl font-bold transition duration-200 shadow-md active:ring-2 active:ring-red-400 active:ring-offset-2"
                        >
                            Cerrar sesión
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
};

function setError(arg0: any) {
        throw new Error('Function not implemented.');
    }
