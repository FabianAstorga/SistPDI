import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';

export type AcuerdoApi = {
    id: number;
    titulo: string;
    descripcion: string;
    imagenUrl?: string | null;
};

// ✅ Base del backend (para no apuntar a :5173 con rutas relativas)
const API_BASE = 'http://localhost:5091';

// ✅ Convierte "/uploads/a.png" o "uploads/a.png" => "http://localhost:5091/uploads/a.png"
// ✅ Si ya es http(s), la deja tal cual
export function resolveBackendUrl(path?: string | null) {
    if (!path) return null;
    const s = String(path).trim();
    if (!s) return null;

    if (/^https?:\/\//i.test(s)) return s;

    const normalized = s.startsWith('/') ? s : `/${s}`;
    return `${API_BASE}${normalized}`;
}

// ✅ Normaliza el acuerdo para que la imagen siempre sea URL absoluta al backend
export function normalizeAcuerdo(a: any): AcuerdoApi {
    return {
        id: Number(a?.id ?? 0),
        titulo: String(a?.titulo ?? ''),
        descripcion: String(a?.descripcion ?? ''),
        imagenUrl: resolveBackendUrl(a?.imagenUrl),
    };
}

/** -------------------------
 *  Embla dots
 *  ------------------------- */
type UseDotButtonType = {
    selectedIndex: number;
    scrollSnaps: number[];
    onDotButtonClick: (index: number) => void;
};

export const useDotButton = (emblaApi: EmblaCarouselType | undefined): UseDotButtonType => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onDotButtonClick = useCallback(
        (index: number) => {
            if (!emblaApi) return;
            emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onInit = useCallback((api: EmblaCarouselType) => {
        setScrollSnaps(api.scrollSnapList());
    }, []);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onInit(emblaApi);
        onSelect(emblaApi);
        emblaApi.on('reInit', onInit);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('reInit', onInit);
            emblaApi.off('reInit', onSelect);
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onInit, onSelect]);

    return { selectedIndex, scrollSnaps, onDotButtonClick };
};

type DotButtonProps = React.ComponentPropsWithoutRef<'button'>;

export const DotButton = (props: DotButtonProps) => {
    const { children, ...restProps } = props;
    return (
        <button type="button" {...restProps}>
            {children}
        </button>
    );
};

/** -------------------------
 *  Embla Carousel de Acuerdos
 *  - full width real pero acotado con max-w
 *  - 4:3
 *  - dragFree
 *  - autoplay 6s (pausa al arrastrar, reanuda al soltar)
 *  - estilos “configuracion” (dots y bordes más pro)
 *  - botón "Ver detalles"
 *  ------------------------- */
export const EmblaCarouselAcuerdos = ({
    acuerdos,
    options,
}: {
    acuerdos: AcuerdoApi[];
    options?: EmblaOptionsType;
}) => {
    const length = acuerdos?.length ?? 0;

    const emblaOptions: EmblaOptionsType = useMemo(
        () => ({
            loop: true,
            align: 'center',
            dragFree: true, // ✅ arrastre libre
            ...options,
        }),
        [options]
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);
    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

    const dots = useMemo(() => {
        if (!scrollSnaps?.length) return [];
        return scrollSnaps.slice(0, Math.min(scrollSnaps.length, 10));
    }, [scrollSnaps]);

    /** -------------------------
     * Autoplay 6s + pausa al drag
     * ------------------------- */
    const [isInteracting, setIsInteracting] = useState(false);

    // Pausar/reanudar cuando Embla detecta interacción
    useEffect(() => {
        if (!emblaApi) return;

        const onPointerDown = () => setIsInteracting(true);
        const onPointerUp = () => setIsInteracting(false);

        // Embla events
        emblaApi.on('pointerDown', onPointerDown);
        emblaApi.on('pointerUp', onPointerUp);

        return () => {
            emblaApi.off('pointerDown', onPointerDown);
            emblaApi.off('pointerUp', onPointerUp);
        };
    }, [emblaApi]);

    // Interval que respeta interacción
    useEffect(() => {
        if (!emblaApi) return;

        const id = window.setInterval(() => {
            if ((acuerdos?.length ?? 0) <= 1) return;
            if (isInteracting) return; // ✅ pausa mientras arrastras
            emblaApi.scrollNext();
        }, 6000);

        return () => window.clearInterval(id);
    }, [emblaApi, acuerdos?.length, isInteracting]);

    if (!length) {
        return <div className="text-center py-20 text-gray-600">No hay acuerdos para mostrar.</div>;
    }

    return (
        <section className="w-screen relative left-1/2 -translate-x-1/2">
            <div className="px-4">
                <div className="w-full max-w-5xl mx-auto">
                    <section className="embla relative w-full overflow-visible">
                        <div ref={emblaRef} className="embla__viewport overflow-visible w-full">
                            <div className="embla__container flex touch-pan-y -mx-2 py-3">
                                {acuerdos.map((acuerdo, index) => {
                                    const isActive = index === selectedIndex;

                                    return (
                                        <div
                                            key={`${acuerdo?.id ?? 'na'}-${index}`}
                                            className="embla__slide px-2 flex-[0_0_92%] sm:flex-[0_0_70%] lg:flex-[0_0_58%]"
                                        >
                                            <div
                                                className={[
                                                    'rounded-2xl overflow-hidden',
                                                    'bg-white',
                                                    'border border-black/10',
                                                    'shadow-[0_20px_60px_rgba(0,0,0,0.18)]',
                                                    'transition-all duration-300',
                                                ].join(' ')}
                                                style={{
                                                    opacity: isActive ? 1 : 0.94,
                                                    transform: isActive ? 'scale(1.01)' : 'scale(0.99)',
                                                    filter: isActive ? 'none' : 'blur(0.25px)',
                                                }}
                                            >
                                                {/* ✅ 4:3 + tamaño acotado */}
                                                <div className="w-full aspect-[4/3] bg-gray-50 overflow-hidden">
                                                    <img
                                                        src={acuerdo?.imagenUrl || 'https://via.placeholder.com/800x600?text=Acuerdo'}
                                                        alt={acuerdo?.titulo || 'Acuerdo'}
                                                        width={800}
                                                        height={600}
                                                        className="w-full h-full object-contain"
                                                        draggable={false}
                                                    />
                                                </div>

                                                {/* ✅ texto con altura uniforme */}
                                                <div className="p-6 bg-white">
                                                    <h4 className="font-bold text-xl text-gray-900 mb-2 leading-tight line-clamp-1">
                                                        {acuerdo?.titulo}
                                                    </h4>

                                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 min-h-[5.6rem]">
                                                        {acuerdo?.descripcion}
                                                    </p>

                                                    {/* ✅ botón "Ver detalles" */}
                                                    <div className="mt-5 flex justify-end">
                                                        <button
                                                            type="button"
                                                            className={[
                                                                'rounded-xl px-4 py-2 text-sm font-semibold',
                                                                'bg-black/90 text-white',
                                                                'hover:bg-black',
                                                                'border border-black/20',
                                                                'shadow-sm',
                                                                'active:scale-95 transition',
                                                                'focus:outline-none focus:ring-2 focus:ring-black/30',
                                                            ].join(' ')}
                                                        >
                                                            Ver detalles
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ✅ dots estilo “configuracion” (pill activo) */}
                        {dots.length > 0 && (
                            <div className="w-full flex justify-center mt-5">
                                <div className="flex items-center gap-2">
                                    {dots.map((_, i) => (
                                        <DotButton
                                            key={i}
                                            onClick={() => onDotButtonClick(i)}
                                            className={[
                                                'h-2.5 rounded-full transition-all border border-black/10',
                                                i === selectedIndex
                                                    ? 'w-8 bg-black'
                                                    : 'w-2.5 bg-black/20 hover:bg-black/35',
                                            ].join(' ')}
                                            aria-label={`Ir a acuerdo ${i + 1}`}
                                            title={`Ir a ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </section>
    );
};
