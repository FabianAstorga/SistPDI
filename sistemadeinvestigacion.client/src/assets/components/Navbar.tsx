import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
    const navigate = useNavigate();

    // URL de la imagen de la PDI que proporcionaste
    const logoPDI = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Policia_de_Investigaciones_de_Chile.svg/1200px-Policia_de_Investigaciones_de_Chile.svg.png";

    const handleLogout = () => {
        console.log("Cerrando sesión...");
        navigate('/login');
    };

    const handlePlaceholderClick = (boton: string) => {
        console.log(`Botón presionado: ${boton}`);
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#003385] shadow-xl z-50 border-b-2 border-[#FFCC00]">
            <div className="w-full px-10">
                <div className="flex items-center justify-between h-20">

                    {/* --- EXTREMA IZQUIERDA: LOGO PDI Y TEXTO --- */}
                    <div className="flex items-center space-x-4 cursor-pointer">
                        <img
                            className="h-14 w-auto object-contain" // Ajustado para que el logo se vea bien
                            src={logoPDI}
                            alt="Logo PDI"
                        />
                        <span className="text-[#FFCC00] font-bold text-3xl tracking-tight">
                            Sist Convenios
                        </span>
                    </div>

                    {/* --- EXTREMA DERECHA: BOTONES --- */}
                    <div className="flex items-center space-x-8">
                        <button
                            onClick={() => handlePlaceholderClick('Inicio')}
                            type="button"
                            className="text-white hover:text-[#FFCC00] text-xl font-semibold transition duration-300"
                        >
                            Inicio
                        </button>

                        <button
                            onClick={() => handlePlaceholderClick('Configuración')}
                            type="button"
                            className="text-white hover:text-[#FFCC00] text-xl font-semibold transition duration-300"
                        >
                            Configuración
                        </button>

                        <button
                            onClick={handleLogout}
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-xl font-bold transition duration-300 shadow-md"
                        >
                            Cerrar sesión
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
};