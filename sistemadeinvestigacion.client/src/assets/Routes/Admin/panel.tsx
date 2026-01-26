import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Navbar } from '../../components/Navbar';
import { Search } from 'lucide-react';

type AcuerdoApi = {
    id: number;
    titulo: string;
    descripcion: string;
    imagenUrl?: string | null;
};

// ✅ Base del backend (para no apuntar a :5173 con rutas relativas)
const API_BASE = 'http://localhost:5091';

// ✅ Convierte "/uploads/a.png" o "uploads/a.png" => "http://localhost:5091/uploads/a.png"
// ✅ Si ya es http(s), la deja tal cual
function resolveBackendUrl(path?: string | null) {
    if (!path) return null;
    const s = String(path).trim();
    if (!s) return null;

    if (/^https?:\/\//i.test(s)) return s;

    const normalized = s.startsWith('/') ? s : `/${s}`;
    return `${API_BASE}${normalized}`;
}

// ✅ Normaliza el acuerdo para que la imagen siempre sea URL absoluta al backend
function normalizeAcuerdo(a: any): AcuerdoApi {
    return {
        id: Number(a?.id ?? 0),
        titulo: String(a?.titulo ?? ''),
        descripcion: String(a?.descripcion ?? ''),
        imagenUrl: resolveBackendUrl(a?.imagenUrl),
    };
}

const BilliardCarousel = ({ acuerdos }: { acuerdos: AcuerdoApi[] }) => {
    const [items, setItems] = useState<number[]>([]);
    const [isTicking, setIsTicking] = useState(false);

    const length = useMemo(() => (acuerdos?.length ? acuerdos.length : 0), [acuerdos]);

    const extended = useMemo(() => {
        if (!acuerdos?.length) return [];
        return [...acuerdos, ...acuerdos];
    }, [acuerdos]);

    useEffect(() => {
        if (extended.length > 0) {
            setItems(Array.from({ length: extended.length }, (_, i) => i));
            setIsTicking(false);
        } else {
            setItems([]);
            setIsTicking(false);
        }
    }, [extended]);

    const nextClick = useCallback(
        (jump = 1) => {
            if (!isTicking && extended.length > 0) {
                setIsTicking(true);
                setItems((prev) => prev.map((_, i) => prev[(i - jump + prev.length) % prev.length]));
            }
        },
        [isTicking, extended.length]
    );

    useEffect(() => {
        if (isTicking) {
            const t = setTimeout(() => setIsTicking(false), 300);
            return () => clearTimeout(t);
        }
    }, [isTicking]);

    useEffect(() => {
        if (extended.length > 0) {
            const autoPlay = setInterval(() => nextClick(), 5000);
            return () => clearInterval(autoPlay);
        }
    }, [extended.length, nextClick]);

    if (extended.length === 0) {
        return <div className="text-center py-20 text-gray-600">No hay acuerdos para mostrar.</div>;
    }

    const activeIndex = useMemo(() => {
        if (!items.length || !length) return 0;
        const centerPos = length;
        const i = items.findIndex((p) => p === centerPos);
        if (i < 0) return 0;
        return i % length;
    }, [items, length]);

    const dotsCount = useMemo(() => Math.min(length || 0, 10), [length]);
    const activeDot = dotsCount ? activeIndex % dotsCount : 0;

    const goToIndex = useCallback(
        (targetIdx: number) => {
            if (!length || !dotsCount) return;
            const target = Math.max(0, Math.min(targetIdx, dotsCount - 1));

            const current = activeIndex;
            if (target === current) return;

            const forward = (target - current + length) % length;
            const backward = (current - target + length) % length;

            const jump = forward <= backward ? forward : -backward;
            if (jump !== 0) nextClick(jump);
        },
        [activeIndex, dotsCount, length, nextClick]
    );

    const slideWidth = 44;
    const half = extended.length / 2;

    return (
        <div className="relative w-full">
            <div className="flex items-center justify-center relative min-h-[620px] w-full">
                <ul className="relative flex list-none p-0 m-0 w-full justify-center items-center">
                    {items.map((pos, i) => {
                        const acuerdo = extended[i];
                        const isVisible = pos >= half - 1 && pos <= half + 1;
                        const isActive = pos === half;

                        return (
                            <li
                                key={`${acuerdo?.id ?? 'na'}-${i}`}
                                className="absolute transition-all duration-500 ease-in-out bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                                style={{
                                    transform: `translateX(${(pos - half) * slideWidth}rem)`,
                                    opacity: isVisible ? 1 : 0,
                                    width: '40rem',
                                    filter: isActive ? 'none' : ' blur(3px)',
                                    zIndex: isActive ? 10 : 5,
                                    scale: isActive ? '1.06' : '0.86',
                                    pointerEvents: isActive ? 'auto' : 'none',
                                }}
                            >
                                {/* ✅ FIX: no forzar 800x600 dentro de un card más chico.
                                    Forzamos relación 4:3 (equivalente a 800x600) y dejamos que el card mande. */}
                                <div className="w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={acuerdo?.imagenUrl || 'https://via.placeholder.com/800x600?text=Acuerdo'}
                                        alt={acuerdo?.titulo || 'Acuerdo'}
                                        width={800}
                                        height={600}
                                        className="w-full h-full object-contain"
                                        draggable={false}
                                    />
                                </div>

                                <div className="p-7 bg-white">
                                    <h4 className="font-bold text-2xl text-gray-800 mb-2 leading-tight">
                                        {acuerdo?.titulo}
                                    </h4>
                                    <p className="text-base text-gray-600 leading-relaxed line-clamp-3">
                                        {acuerdo?.descripcion}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {dotsCount > 0 && (
                <div className="w-full flex justify-center mt-6">
                    <div className="flex items-center gap-5">
                        {Array.from({ length: dotsCount }, (_, idx) => {
                            const on = idx === activeDot;
                            return (
                                <button
                                    key={`dot-${idx}`}
                                    type="button"
                                    onClick={() => goToIndex(idx)}
                                    disabled={isTicking}
                                    className={[
                                        'h-4 w-4 rounded-full transition-all duration-300',
                                        'focus:outline-none focus:ring-2 focus:ring-[#003385]/40',
                                        on ? 'bg-[#003385] scale-110' : 'bg-gray-300 hover:bg-gray-400',
                                        isTicking ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
                                    ].join(' ')}
                                    aria-label={`ir a acuerdo ${idx + 1}`}
                                    title={`Ir a ${idx + 1}`}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

function panel() {
    const topRef = useRef<HTMLElement | null>(null);
    const listRef = useRef<HTMLElement | null>(null);
    const snapRootRef = useRef<HTMLDivElement | null>(null);

    const [mejores, setMejores] = useState<AcuerdoApi[]>([]);
    const [acuerdos, setAcuerdos] = useState<AcuerdoApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [inputSearch, setInputSearch] = useState('');

    const searchResult = useMemo(() => {
        const q = inputSearch.trim().toLowerCase();
        if (!q) return acuerdos;
        return acuerdos.filter((a) => (a.titulo || '').toLowerCase().includes(q));
    }, [acuerdos, inputSearch]);

    const goToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const inputStyle =
        'w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm';

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
                                    <BilliardCarousel acuerdos={mejores.length ? mejores : acuerdos} />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            goToList();
                                        }}
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
                                        aria-label="Ir al tope"
                                    >
                                        <span className="text-xs font-bold uppercase tracking-widest">Acuerdos</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* LISTADO */}
                    <section
                        ref={(n) => (listRef.current = n)}
                        className="snap-start pt-24 pb-12 px-6 bg-slate-100 min-h-[calc(100vh-96px)]"
                    >
                        <div className="max-w-[95%] mx-auto -mt-6">
                            <div className="relative flex flex-col w-full mb-6 shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">
                                <div className="rounded-t bg-white border-b border-gray-100 px-8 py-12 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                            <span className="block w-5 h-5 rounded bg-gray-300" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h2 className="text-black text-xl font-black uppercase tracking-tighter leading-tight">
                                                Acuerdos
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full justify-end">
                                        <div className="w-full max-w-sm relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                <Search size={14} />
                                            </span>
                                            <input
                                                type="search"
                                                className={`${inputStyle} pl-10`}
                                                placeholder="Buscar por título"
                                                value={inputSearch}
                                                onChange={(e) => setInputSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 lg:px-12 py-10 shadow-inner -mt-6">
                                    <div
                                        className="w-full overflow-y-auto pr-1 rounded-2xl"
                                        style={{
                                            maxHeight: '520px',
                                            overscrollBehavior: 'contain',
                                        }}
                                    >
                                        {loading ? (
                                            <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                <p className="text-sm text-gray-700 font-semibold">Cargando acuerdos...</p>
                                            </div>
                                        ) : loadError ? (
                                            <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                <p className="text-sm text-red-600 font-semibold">{loadError}</p>
                                                <button
                                                    type="button"
                                                    onClick={fetchData}
                                                    className="mt-3 bg-gray-900 hover:bg-black text-white font-bold uppercase text-xs px-6 py-2 rounded-xl shadow-lg transition-all active:scale-95"
                                                >
                                                    Reintentar
                                                </button>
                                            </div>
                                        ) : searchResult.length === 0 ? (
                                            <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                <p className="text-sm text-indigo-700 font-bold">No hay resultados</p>
                                                <p className="text-xs text-gray-500 mt-1">Prueba otra búsqueda.</p>
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {searchResult.map((a) => (
                                                    <li key={a.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => console.log('Acuerdo:', a.id)}
                                                            className="w-full text-left bg-white rounded-2xl p-7 border border-gray-200 hover:shadow-lg hover:border-[#003385]/30 transition-all active:scale-[0.99]"
                                                        >
                                                            <div className="flex items-start gap-5">
                                                                {/* ✅ Thumbnail con relación 4:3 (tipo 800x600) */}
                                                                <div className="rounded-2xl w-28 aspect-[4/3] bg-gray-50 border border-gray-100 shadow shrink-0 overflow-hidden flex items-center justify-center">
                                                                    <img
                                                                        src={a.imagenUrl || 'https://via.placeholder.com/800x600?text=Acuerdo'}
                                                                        alt={a.titulo}
                                                                        width={800}
                                                                        height={600}
                                                                        className="w-full h-full object-contain"
                                                                        draggable={false}
                                                                    />
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-lg font-black text-gray-900 truncate">
                                                                        {a.titulo}
                                                                    </h3>
                                                                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                                                                        {a.descripcion}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default panel;
