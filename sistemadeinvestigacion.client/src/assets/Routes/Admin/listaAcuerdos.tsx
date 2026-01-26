import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { AcuerdoApi } from './Carrusel';

export const ListaAcuerdos = ({
    acuerdos,
    loading,
    loadError,
    onRetry,
    onSelectAcuerdo,
}: {
    acuerdos: AcuerdoApi[];
    loading: boolean;
    loadError: string | null;
    onRetry: () => void;
    onSelectAcuerdo?: (id: number) => void;
}) => {
    const [inputSearch, setInputSearch] = useState('');

    const searchResult = useMemo(() => {
        const q = inputSearch.trim().toLowerCase();
        if (!q) return acuerdos;
        return acuerdos.filter((a) => (a.titulo || '').toLowerCase().includes(q));
    }, [acuerdos, inputSearch]);

    const inputStyle =
        'w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm';

    return (
        <section className="snap-start pt-24 pb-12 px-6 bg-slate-100 min-h-[calc(100vh-96px)]">
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
                                        onClick={onRetry}
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
                                                onClick={() => (onSelectAcuerdo ? onSelectAcuerdo(a.id) : console.log('Acuerdo:', a.id))}
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
                                                        <h3 className="text-lg font-black text-gray-900 truncate">{a.titulo}</h3>
                                                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{a.descripcion}</p>
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
    );
};
