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

// ✅ Normaliza el acuerdo para que:
// - tome el id correcto desde Swagger: idAcuerdo
// - la imagen siempre sea URL absoluta al backend
export function normalizeAcuerdo(a: any): AcuerdoApi {
    return {
        id: Number(a?.idAcuerdo ?? a?.id ?? 0),
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
 *  Modal de detalles (sin librerías)
 *  ------------------------- */
type AcuerdoDetalles = {
    idAcuerdo?: number;
    id?: number;
    titulo?: string;
    descripcion?: string;
    detallesDescripcion?: string;
    fechaVencimiento?: string;
    estado?: string;
    imagenUrl?: string | null;
    habilitado?: boolean;
    fechaCreacion?: string;
    fechaActualizacion?: string;
    idEmpresa?: number;
};

function formatDateTime(value?: string) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function DetailsModal({
    open,
    onClose,
    loading,
    error,
    data,
    fallbackImg,
}: {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    error: string | null;
    data: AcuerdoDetalles | null;
    fallbackImg?: string | null;
}) {
    // Cerrar con ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const img = resolveBackendUrl(data?.imagenUrl ?? fallbackImg) || 'https://via.placeholder.com/800x600?text=Acuerdo';

    return (
        <div className="fixed inset-0 z-[999]">
            {/* Overlay */}
            <button
                type="button"
                aria-label="Cerrar modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Dialog */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] border border-black/10"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
                        <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-black/50">Detalle de acuerdo</div>
                            <h3 className="text-lg font-semibold text-black truncate">
                                {data?.titulo || 'Cargando...'}
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-3 py-2 text-sm font-semibold bg-black/5 hover:bg-black/10 border border-black/10 active:scale-95 transition"
                        >
                            Cerrar
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {loading ? (
                            <div className="py-16 text-center text-black/60">Cargando detalles…</div>
                        ) : error ? (
                            <div className="py-10 text-center">
                                <p className="text-sm font-semibold text-red-600">{error}</p>
                                <p className="text-xs text-black/50 mt-2">
                                    Revisa que el endpoint sea /api/Acuerdos/{'{id}'} y que el id exista.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* div1 (arriba-izq): Imagen */}
                                <div className="rounded-2xl overflow-hidden border border-black/10 bg-gray-50 p-4">
                                    <div
                                        className="relative w-full overflow-hidden rounded-2xl border border-black/10 bg-white"
                                        style={{ height: 'clamp(220px, 34vh, 360px)' }} // ✅ controla altura => no “cae” hacia abajo
                                    >
                                        {/* Marco 4:3 real */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img
                                                    src={img}
                                                    alt={data?.titulo || 'Acuerdo'}
                                                    width={1200}
                                                    height={900}
                                                    className="max-w-full max-h-full object-contain"
                                                    draggable={false}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    
                                </div>

                                {/* div2 (arriba-der): Detalles */}
                                <div className="rounded-2xl border border-black/10 bg-black/5 p-5">
                                    <div className="text-xs font-bold uppercase tracking-widest text-black/50 mb-4">
                                        Detalles
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-black/40">ID</div>
                                            <div className="font-semibold text-black">
                                                {data?.idAcuerdo ?? data?.id ?? '—'}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-black/40">Estado</div>
                                            <div className="font-semibold text-black">{data?.estado ?? '—'}</div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-black/40">Empresa</div>
                                            <div className="font-semibold text-black">{data?.idEmpresa ?? '—'}</div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-black/40">Habilitado</div>
                                            <div className="font-semibold text-black">
                                                {typeof data?.habilitado === 'boolean' ? (data.habilitado ? 'Sí' : 'No') : '—'}
                                            </div>
                                        </div>

                                        <div className="col-span-2 space-y-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-black/40">Vence</div>
                                            <div className="font-semibold text-black">{formatDateTime(data?.fechaVencimiento)}</div>
                                        </div>

                                        <div className="col-span-2 space-y-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-black/40">Creación</div>
                                            <div className="font-semibold text-black">{formatDateTime(data?.fechaCreacion)}</div>
                                        </div>

                                        <div className="col-span-2 space-y-1">
                                            <div className="text-xs font-bold uppercase tracking-widest text-black/40">Actualización</div>
                                            <div className="font-semibold text-black">{formatDateTime(data?.fechaActualizacion)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* div3 (abajo-izq): Título + descripción corta */}
                                <div className="rounded-2xl border border-black/10 bg-white p-5">
                                    <div className="text-xs font-bold uppercase tracking-widest text-black/50 mb-3">
                                        Resumen
                                    </div>

                                    <h4 className="text-xl font-bold text-black mb-3 break-words">
                                        {data?.titulo || '—'}
                                    </h4>

                                    <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">
                                        {data?.descripcion || '—'}
                                    </p>
                                </div>

                                {/* div4 (abajo-der): Descripción larga */}
                                <div className="rounded-2xl border border-black/10 bg-white p-5">
                                    <div className="text-xs font-bold uppercase tracking-widest text-black/50 mb-3">
                                        Descripción detallada
                                    </div>

                                    <div className="rounded-2xl border border-black/10 bg-white p-4 max-h-[260px] overflow-auto">
                                        <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">
                                            {data?.detallesDescripcion || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-black/10 flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-black/90 active:scale-95 transition"
                        >
                            Listo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** -------------------------
 *  Embla Carousel de Acuerdos
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
            dragFree: true,
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

    useEffect(() => {
        if (!emblaApi) return;

        const onPointerDown = () => setIsInteracting(true);
        const onPointerUp = () => setIsInteracting(false);

        emblaApi.on('pointerDown', onPointerDown);
        emblaApi.on('pointerUp', onPointerUp);

        return () => {
            emblaApi.off('pointerDown', onPointerDown);
            emblaApi.off('pointerUp', onPointerUp);
        };
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        const id = window.setInterval(() => {
            if ((acuerdos?.length ?? 0) <= 1) return;
            if (isInteracting) return;
            emblaApi.scrollNext();
        }, 6000);

        return () => window.clearInterval(id);
    }, [emblaApi, acuerdos?.length, isInteracting]);

    /** -------------------------
     * Modal state + fetch detalles
     * ------------------------- */
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [modalData, setModalData] = useState<AcuerdoDetalles | null>(null);
    const [modalFallbackImg, setModalFallbackImg] = useState<string | null>(null);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setModalLoading(false);
        setModalError(null);
        setModalData(null);
        setModalFallbackImg(null);
    }, []);

    const openDetails = useCallback(async (acuerdo: AcuerdoApi) => {
        if (!acuerdo?.id || acuerdo.id <= 0) {
            console.warn('Acuerdo sin id válido:', acuerdo);
            return;
        }

        setModalOpen(true);
        setModalLoading(true);
        setModalError(null);
        setModalData(null);
        setModalFallbackImg(acuerdo.imagenUrl ?? null);

        try {
            const token = localStorage.getItem('token');

            // ✅ endpoint correcto: /api/Acuerdos/{id}
            const res = await fetch(`${API_BASE}/api/Acuerdos/${acuerdo.id}`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) {
                const t = await res.text().catch(() => '');
                throw new Error(t || `Error HTTP ${res.status} en /api/Acuerdos/${acuerdo.id}`);
            }

            const data = (await res.json()) as any;
            setModalData(data);
        } catch (e: any) {
            setModalError(e?.message || 'Error al cargar el detalle del acuerdo.');
        } finally {
            setModalLoading(false);
        }
    }, []);

    if (!length) {
        return <div className="text-center py-20 text-gray-600">No hay acuerdos para mostrar.</div>;
    }

    return (
        <>
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
                                                key={`acuerdo-${acuerdo?.id || 'noid'}-${index}`}
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
                                                    {/* ✅ 4:3 */}
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
                                                                onClick={() => openDetails(acuerdo)}
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
                                                key={`dot-${i}`}
                                                onClick={() => onDotButtonClick(i)}
                                                className={[
                                                    'h-2.5 rounded-full transition-all border border-black/10',
                                                    i === selectedIndex ? 'w-8 bg-black' : 'w-2.5 bg-black/20 hover:bg-black/35',
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

            <DetailsModal
                open={modalOpen}
                onClose={closeModal}
                loading={modalLoading}
                error={modalError}
                data={modalData}
                fallbackImg={modalFallbackImg}
            />
        </>
    );
};
