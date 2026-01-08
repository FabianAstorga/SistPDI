import React from 'react';
import { Navbar } from '../../components/Navbar';

function Panel() {
    return (
        <div className="min-h-screen bg-gray-100 pt-24">

            <Navbar />

            <header className="mb-6">
                <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-[#003366] border-b-4 border-[#FFCC00] inline-block pb-1">
                        Panel de Administración
                    </h1>
                </div>
            </header>

            <main className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6">

                    <div className="bg-white overflow-hidden shadow-md rounded-xl p-8 border border-gray-200">

                        

                        <div className="space-y-4">
                            <p className="text-xl text-gray-700 font-medium">
                                Hola papus
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Panel;