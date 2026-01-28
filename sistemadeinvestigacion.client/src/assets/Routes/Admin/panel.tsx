import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { EmblaCarouselAcuerdos, normalizeAcuerdo, type AcuerdoApi } from './Carrusel';
import { ListaAcuerdos } from './listaAcuerdos';

function panel() {
    const topRef = useRef<HTMLElement | null>(null);
    const listRef = useRef<HTMLElement | null>(null);
    const snapRootRef = useRef<HTMLDivElement | null>(null);

    const [mejores, setMejores] = useState<AcuerdoApi[]>([]);
    const [acuerdos, setAcuerdos] = useState<AcuerdoApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const goToList = () => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const fetchData = async () => {
        try {
            setLoading(true);
            setLoadError(null);

            const token = localStorage.getItem('token');

            const resMejores = await fetch('http://localhost:5091/api/Acuerdos/mejores', {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!resMejores.ok) {
                const t = await resMejores.text().catch(() => '');
                throw new Error(t || `Error HTTP ${resMejores.status} en /mejores`);
            }

            const mejoresData = (await resMejores.json()) as any;
            const mejoresNorm = Array.isArray(mejoresData) ? mejoresData.map(normalizeAcuerdo) : [];
            setMejores(mejoresNorm);

            const resAll = await fetch('http://localhost:5091/api/Acuerdos', {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!resAll.ok) {
                const t = await resAll.text().catch(() => '');
                throw new Error(t || `Error HTTP ${resAll.status} en /Acuerdos`);
            }

            const allData = (await resAll.json()) as any;
            const allNorm = Array.isArray(allData) ? allData.map(normalizeAcuerdo) : [];
            setAcuerdos(allNorm);
        } catch (e: any) {
            setLoadError(e?.message || 'Error al cargar acuerdos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="h-screen w-full bg-slate-100 overflow-hidden">
            <Navbar />

            <div
                ref={snapRootRef}
                className="h-screen overflow-y-auto overflow-x-hidden snap-y scroll-smooth"
                style={{ scrollPaddingTop: '96px' }}
            >
                <style>{`
                    .snap-proximity {
                        scroll-snap-type: y proximity;
                        scroll-snap-stop: normal;
                        overscroll-behavior-y: contain;
                        scroll-behavior: smooth;
                    }
                    @media (prefers-reduced-motion: no-preference) {
                        .snap-proximity { scroll-behavior: smooth; }
                    }
                `}</style>

                <div className="snap-proximity">
                    {/* HERO */}
                    <section
                        ref={(n) => (topRef.current = n)}
                        className="snap-start min-h-screen pt-24 px-6 flex items-center"
                    >
                        <div className="w-full max-w-[1400px] mx-auto">
                            {loading ? (
                                <div className="text-center py-20 text-gray-600">Cargando acuerdos...</div>
                            ) : loadError ? (
                                <div className="text-center py-20">
                                    <p className="text-sm text-red-600 font-semibold">{loadError}</p>
                                    <button
                                        type="button"
                                        onClick={fetchData}
                                        className="mt-3 bg-gray-900 hover:bg-black text-white font-bold uppercase text-xs px-6 py-2 rounded-xl shadow-lg transition-all active:scale-95"
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <EmblaCarouselAcuerdos
                                        acuerdos={mejores.length ? mejores : acuerdos}
                                        options={{ loop: true, align: 'center' }}
                                    />

                                    <button
                                        type="button"
                                        onClick={goToList}
                                        className="
                                            absolute left-1/2 -translate-x-1/2 -bottom-12
                                            bg-gray-200 text-gray-700
                                            hover:bg-gray-300
                                            active:bg-gray-400
                                            transition-colors
                                            px-4 py-2 rounded-md
                                            flex items-center gap-2
                                            shadow-sm
                                        "
                                        aria-label="Ir a acuerdos"
                                    >
                                        <span className="text-xs font-bold uppercase tracking-widest">Acuerdos</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* LISTADO */}
                    <div ref={(n) => (listRef.current = n)}>
                        <ListaAcuerdos
                            acuerdos={acuerdos}
                            loading={loading}
                            loadError={loadError}
                            onRetry={fetchData}
                            onSelectAcuerdo={(id) => console.log('Acuerdo:', id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default panel;
