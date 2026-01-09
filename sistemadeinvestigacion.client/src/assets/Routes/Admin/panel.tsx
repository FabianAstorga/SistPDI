import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';

function Panel() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (userStored) {
            setUser(JSON.parse(userStored));
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 pt-24">

            <Navbar />

            <header className="mb-6">
                <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-[#003366] border-b-4 border-[#FFCC00] inline-block pb-1">
                        Bienvenido, {user ? user.name : 'Administrador'}
                    </h1>
                </div>
            </header>

            <main className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6">

                    <div className="bg-white overflow-hidden shadow-md rounded-xl p-8 border border-gray-200">

                        <section className="flex flex-col justify-center antialiased bg-gray-50 text-gray-600 min-h-[500px] p-4 rounded-lg">
                            <div className="h-full">

                                <div className="max-w-xs mx-auto">
                                    <div className="flex flex-col h-full bg-white shadow-lg rounded-lg overflow-hidden">

                                        <a className="block focus:outline-none focus-visible:ring-2" href="#0">
                                            <figure className="relative h-0 pb-[56.25%] overflow-hidden">
                                                <img
                                                    className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition duration-700 ease-out"
                                                    src="https://res.cloudinary.com/dc6deairt/image/upload/v1638284256/course-img_tf0g8c.png"
                                                    width="320"
                                                    height="180"
                                                    alt="Course"
                                                />
                                            </figure>
                                        </a>

                                        <div className="flex-grow flex flex-col p-5">
                                            <div className="flex-grow">
                                                <header className="mb-3">
                                                    <a className="block focus:outline-none focus-visible:ring-2" href="#0">
                                                        <h3 className="text-[22px] text-gray-900 font-extrabold leading-snug">
                                                            Prueba de Template
                                                        </h3>
                                                    </a>
                                                </header>
                                                <div className="mb-8">
                                                    <p>Template test.</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <button className="font-medium text-sm inline-flex items-center justify-center px-3 py-1.5 rounded leading-5 text-red-500 hover:underline focus:outline-none focus-visible:ring-2">
                                                    Eliminar
                                                </button>
                                                <button className="font-semibold text-sm inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded leading-5 shadow-sm transition duration-150 ease-in-out bg-indigo-500 focus:outline-none focus-visible:ring-2 hover:bg-indigo-600 text-white">
                                                    Ver Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="space-y-4 mt-8">
                            <p className="text-xl text-gray-700 font-medium">
                                Hola Papus
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Panel;