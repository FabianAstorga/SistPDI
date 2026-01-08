import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/react.svg';

export const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("Cerrando sesión y redirigiendo...");
        navigate('/login');
    };

    const handlePlaceholderClick = (boton: string) => {
        console.log(`Botón presionado: ${boton} (Sin ruta asignada aún)`);
    };

    return (
        /* Clases añadidas:
           - fixed top-0 left-0: La fija arriba y a la izquierda.
           - w-full: Asegura que ocupe el 100% horizontal.
           - z-50: Asegura que esté por encima de cualquier otro contenido.
        */
        <nav className="fixed top-0 left-0 w-full bg-blue-600 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* --- LOGO --- */}
                    <div className="flex items-center flex-shrink-0 cursor-pointer">
                        <img
                            className="h-8 w-8 mr-2"
                            src={logo}
                            alt="Logo Sistema"
                        />
                        <span className="text-white font-bold text-xl">
                            Sistema Inv.
                        </span>
                    </div>

                    {/* --- BOTONES --- */}
                    <div className="flex items-center space-x-4">
                        {/* Botón Inicio */}
                        <button
                            onClick={() => handlePlaceholderClick('Inicio')}
                            type="button"
                            className="text-white hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                        >
                            Inicio
                        </button>

                        {/* Botón Crear Usuario */}
                        <button
                            onClick={() => handlePlaceholderClick('Crear Usuario')}
                            type="button"
                            className="text-white hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                        >
                            Crear usuario
                        </button>

                        {/* Botón Salir */}
                        <button
                            onClick={handleLogout}
                            type="button"
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold transition duration-300 shadow-md"
                        >
                            Salir
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
};