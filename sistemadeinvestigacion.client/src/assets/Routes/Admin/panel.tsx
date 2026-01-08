import React from 'react';
// Corregido: 3 niveles arriba para llegar a la carpeta components
import { Navbar } from '../../components/Navbar';

function Panel() {
    return (
        /* pt-16 añade el espacio necesario para que la Navbar fija no tape el contenido */
        <div className="min-h-screen bg-gray-100 pt-16">

            {/* 1. La Navbar (ahora es una Topbar fija) */}
            <Navbar />

            {/* 2. Encabezado de la página */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Panel de Administración
                    </h1>
                </div>
            </header>

            {/* 3. Contenido Principal */}
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                    {/* Contenedor tipo "Tarjeta" */}
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white overflow-hidden shadow rounded-lg min-h-[400px] p-6">

                            <p className="text-xl text-gray-800 font-medium">
                                Hola papus
                            </p>
                            <p className="text-gray-500 mt-2">
                                Bienvenido al sistema. Selecciona una opción del menú.
                            </p>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Panel;