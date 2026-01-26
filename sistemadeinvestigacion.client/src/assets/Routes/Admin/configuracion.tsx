import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Navbar } from '../../components/Navbar';

function configuracion() {
    const slides = useMemo(
        () => [
            { id: 1, title: 'Slide 1', desc: 'Prueba Embla + Tailwind' },
            { id: 2, title: 'Slide 2', desc: 'Flechas + dots' },
            { id: 3, title: 'Slide 3', desc: 'Loop activado' },
            { id: 4, title: 'Slide 4', desc: 'Autoplay opcional' },
            { id: 5, title: 'Slide 5', desc: 'Listo para reemplazar por cards' },
        ],
        []
    );

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onInit = useCallback(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onInit();
        onSelect();
        emblaApi.on('reInit', onInit);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('reInit', onInit);
            emblaApi.off('reInit', onSelect);
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onInit, onSelect]);

    const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

    return (
        <div className="pt-24 min-h-screen bg-black text-white">
            <Navbar />

            <main className="p-4 w-full max-w-none">
                <h1 className="text-xl font-semibold mb-4">configurando cositas</h1>

                {/* ✅ FULL WIDTH REAL (ignora max-w del layout/página) */}
                <section className="w-screen relative left-1/2 -translate-x-1/2">
                    <div className="px-4">
                        <div className="relative overflow-visible">
                            {/* ✅ Sin overflow-hidden: NO se corta nada + ocupa todo el ancho disponible */}
                            <div ref={emblaRef} className="overflow-visible w-full">
                                <div className="flex touch-pan-y -mx-2 py-3">
                                    {slides.map((s) => (
                                        <div
                                            key={s.id}
                                            className="px-2 flex-[0_0_92%] sm:flex-[0_0_82%] lg:flex-[0_0_70%]"
                                        >
                                            {/* ✅ Card 4:3 */}
                                            <div className="aspect-[4/3] rounded-2xl bg-black border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.65)] flex items-center justify-center">
                                                <div className="text-center px-6">
                                                    <div className="text-3xl font-bold mb-2">{s.title}</div>
                                                    <p className="text-white/70">{s.desc}</p>
                                                    <div className="mt-4 text-sm text-white/50">ID: {s.id}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="flex items-center justify-center gap-2 mt-5">
                            {scrollSnaps.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => scrollTo(i)}
                                    className={[
                                        'h-2.5 rounded-full transition-all border border-white/20',
                                        i === selectedIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/50',
                                    ].join(' ')}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default configuracion;
