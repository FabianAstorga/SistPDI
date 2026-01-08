import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Para saber en qué página estamos

    const logoPDI = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Policia_de_Investigaciones_de_Chile.svg/1200px-Policia_de_Investigaciones_de_Chile.svg.png";

    const handleLogout = () => {
        navigate('/login');
    };

    // Función genérica para estilos de botones
    // active:bg-[#00265a] oscurece el fondo al hacer clic
    // ring-offset-2 y ring permiten crear un borde de enfoque al presionar
    const buttonBaseClass = "text-white text-xl font-semibold px-4 py-2 rounded-md transition duration-200 ease-in-out hover:bg-[#002a66] active:bg-[#001d47] active:ring-2 active:ring-[#FFCC00] active:ring-offset-2 active:ring-offset-[#003385]";

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#003385] shadow-xl z-50 border-b-2 border-[#FFCC00]">
            <div className="w-full px-10">
                <div className="flex items-center justify-between h-20">

                    {/* --- EXTREMA IZQUIERDA: LOGO PDI Y TEXTO --- */}
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
                            Sist Convenios
                        </span>
                    </div>

                    {/* --- EXTREMA DERECHA: BOTONES --- */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/panel')}
                            className={`${buttonBaseClass} ${location.pathname === '/panel' ? 'bg-[#002a66] border border-[#FFCC00]' : ''}`}
                        >
                            Inicio
                        </button>

                        {/* NUEVO BOTÓN: LIENZO */}
                        <button
                            onClick={() => navigate('/lienzo')}
                            className={`${buttonBaseClass} ${location.pathname === '/panel/lienzo' ? 'bg-[#002a66] border border-[#FFCC00]' : ''}`}
                        >
                            Lienzo
                        </button>

                        <button
                            onClick={() => navigate('/login')} // O la ruta que definas
                            className={buttonBaseClass}
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