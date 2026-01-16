import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BilliardCarousel = () => {
    const [acuerdos, setAcuerdos] = useState([]);
    const [items, setItems] = useState([]);
    const [isTicking, setIsTicking] = useState(false);
    const [loading, setLoading] = useState(true);

    const slideWidth = 35;

    useEffect(() => {
        const fetchAcuerdos = async () => {
            try {
                const response = await fetch('http://localhost:5091/api/Acuerdos/mejores');
                const data = await response.json();
                if (data && data.length > 0) {
                    const extended = [...data, ...data];
                    setAcuerdos(extended);
                    setItems(Array.from(Array(extended.length).keys()));
                }
                setLoading(false);
            } catch (error) {
                console.error("Error cargando acuerdos:", error);
                setLoading(false);
            }
        };
        fetchAcuerdos();
    }, []);

    const nextClick = (jump = 1) => {
        if (!isTicking && acuerdos.length > 0) {
            setIsTicking(true);
            setItems((prev) => prev.map((_, i) => prev[(i - jump + prev.length) % prev.length]));
        }
    };

    const prevClick = (jump = 1) => {
        if (!isTicking && acuerdos.length > 0) {
            setIsTicking(true);
            setItems((prev) => prev.map((_, i) => prev[(i + jump) % prev.length]));
        }
    };

    useEffect(() => {
        if (isTicking) {
            const timer = setTimeout(() => setIsTicking(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isTicking]);

    useEffect(() => {
        if (acuerdos.length > 0) {
            const autoPlay = setInterval(() => {
                nextClick();
            }, 5000);
            return () => clearInterval(autoPlay);
        }
    }, [acuerdos, isTicking]);

    if (loading) return <div className="text-center py-20">Cargando acuerdos...</div>;
    if (acuerdos.length === 0) return <div className="text-center py-20">No hay acuerdos para mostrar.</div>;

    const length = acuerdos.length / 2;

    return (
        <div className="relative w-full">
            <div className="flex items-center justify-center relative min-h-[550px] w-full">
                <button
                    onClick={() => prevClick()}
                    className="absolute left-0 md:-left-4 z-20 bg-[#003385] hover:bg-[#002a66] text-white p-3 rounded-full shadow-xl transition-all duration-200 active:scale-95 border border-white/10 group"
                >
                    <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <ul className="relative flex list-none p-0 m-0 w-full justify-center items-center">
                    {items.map((pos, i) => {
                        const acuerdo = acuerdos[i];
                        const isVisible = pos >= length - 1 && pos <= length + 1;
                        const isActive = pos === length;

                        return (
                            <li
                                key={i}
                                className="absolute transition-all duration-500 ease-in-out bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                                style={{
                                    transform: `translateX(${(pos - length) * slideWidth}rem)`,
                                    opacity: isVisible ? 1 : 0,
                                    width: '35rem',
                                    filter: isActive ? 'none' : ' blur(3px)',
                                    zIndex: isActive ? 10 : 5,
                                    scale: isActive ? '1.05' : '0.85',
                                    pointerEvents: isActive ? 'auto' : 'none'
                                }}
                            >
                                <div className="h-72 w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={acuerdo.imagenUrl || 'https://via.placeholder.com/800x400?text=Convenio'}
                                        alt={acuerdo.titulo}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="p-6 bg-white">
                                    <h4 className="font-bold text-2xl text-gray-800 mb-2 leading-tight">
                                        {acuerdo.titulo}
                                    </h4>
                                    <p className="text-base text-gray-600 leading-relaxed line-clamp-3">
                                        {acuerdo.descripcion}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <button
                    onClick={() => nextClick()}
                    className="absolute right-0 md:-right-4 z-20 bg-[#003385] hover:bg-[#002a66] text-white p-3 rounded-full shadow-xl transition-all duration-200 active:scale-95 border border-white/10 group"
                >
                    <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

function Panel() {
    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <Navbar />
            <main className="w-full mt-[10px] px-[50px] pb-[50px]">
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white shadow-sm rounded-3xl p-8 md:p-12 border border-gray-200">
                        <BilliardCarousel />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Panel;