import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';

import {
    Building,
    Globe,
    Phone,
    Mail,
    MapPin,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Save
} from 'lucide-react';

type ApiInstitucion = any;

type InstitucionVM = {
    id: number | string;
    nombre: string;
    descripcion: string;
    sitioWeb?: string | null;
    email?: string | null;
    telefono?: string | number | null;
    direccion?: string | null;
    logoUrl?: string | null;
};

const API_BASE = 'http://localhost:5091';
const PAGE_SIZE = 4;

function safeJsonParse(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function mapInstitucionFromApi(x: ApiInstitucion): InstitucionVM {
    return {
        id: x?.idEmpresa ?? x?.id ?? x?.empresaID ?? x?.ID,
        nombre: x?.nombre ?? '',
        descripcion: x?.descripcion ?? '',
        sitioWeb: x?.sitioWeb ?? null,
        email: x?.email ?? null,
        telefono: x?.telefono ?? null,
        direccion: x?.direccion ?? null,
        logoUrl: x?.logo
            ? String(x.logo).startsWith('http')
                ? String(x.logo)
                : `${API_BASE}/${String(x.logo).replace(/^\//, '')}`
            : null,
    };
}

function safeUrl(url?: string | null) {
    if (!url) return null;
    try {
        return new URL(url).toString();
    } catch {
        try {
            return new URL(`https://${url}`).toString();
        } catch {
            return null;
        }
    }
}

// ===== Paginación estilo lienzo =====
function getPageItems(current: number, total: number): Array<number | '...'> {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const windowStart = Math.max(2, current - 1);
    const windowEnd = Math.min(total - 1, current + 1);

    const pages: Array<number | '...'> = [1];

    if (windowStart > 2) pages.push('...');

    for (let p = windowStart; p <= windowEnd; p++) pages.push(p);

    if (windowEnd < total - 1) pages.push('...');

    pages.push(total);
    return pages;
}

function InstitucionList() {
    const navigate = useNavigate();

    const [items, setItems] = useState<InstitucionVM[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const headerTitle = 'Listado de Empresas';

    const fetchInstituciones = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const token = localStorage.getItem('token');

            const res = await fetch('http://localhost:5091/api/Empresa', {
                method: 'GET',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
                },
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(text || `Error HTTP ${res.status}`);
            }

            let data: any = null;
            try {
                data = await res.json();
            } catch {
                const text = await res.text();
                const trimmed = text.replace(/^\uFEFF/, '').trim();
                data = safeJsonParse(trimmed);
                if (data == null) throw new Error('La API respondió, pero no viene como JSON parseable.');
            }

            let arr: any[] = [];
            if (Array.isArray(data)) arr = data;
            else if (Array.isArray(data?.items)) arr = data.items;
            else if (Array.isArray(data?.data)) arr = data.data;
            else if (Array.isArray(data?.$values)) arr = data.$values;
            else if (Array.isArray(data?.value)) arr = data.value;
            else if (data && typeof data === 'object') {
                const maybe = data?.result?.$values || data?.result?.items || data?.result?.data || null;
                if (Array.isArray(maybe)) arr = maybe;
            }

            const mapped = arr.map(mapInstitucionFromApi).filter((x) => x?.id != null);
            setItems(mapped);

            const totalPagesLocal = Math.max(1, Math.ceil(mapped.length / PAGE_SIZE));
            setPage((p) => Math.min(p, totalPagesLocal));
        } catch (err: any) {
            setErrorMsg(err?.message || 'Error al cargar las instituciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstituciones();
    }, []);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / PAGE_SIZE)), [items.length]);

    const pagedItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return items.slice(start, start + PAGE_SIZE);
    }, [items, page]);

    const empty = useMemo(() => !loading && !errorMsg && items.length === 0, [loading, errorMsg, items.length]);

    const canPrev = page > 1;
    const canNext = page < totalPages;

    return (
        <div className="min-h-screen bg-slate-100 overflow-y-auto w-full">
            <Navbar />

            <main className="pt-24 pb-20 px-6">
                <section className="max-w-[95%] mx-auto mt-6">
                    <div className="relative flex flex-col w-full mb-6 shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">
                        {/* HEADER */}
                        <div className="rounded-t bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    <Building size={22} className="text-black" />
                                </div>
                                <h6 className="text-black text-lg font-black uppercase tracking-tighter">{headerTitle}</h6>
                            </div>

                            {/* ✅ Botón azul a la derecha */}
                            <button
                                type="button"
                                onClick={() => navigate('/institucion')}
                                className="bg-[#003385] hover:bg-[#002a66] text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center"
                            >
                                <Save size={16} className="mr-2" />
                                Nueva Empresa
                            </button>

                        </div>

                        {/* Mensajes */}
                        {(errorMsg || loading || empty) && (
                            <div className="px-8 py-4 border-b bg-white">
                                {loading && <p className="text-sm text-gray-600 font-semibold">Cargando instituciones...</p>}
                                {errorMsg && <p className="text-sm text-red-600 font-semibold">{errorMsg}</p>}
                                {empty && <p className="text-sm text-gray-600 font-semibold">No hay instituciones registradas.</p>}
                            </div>
                        )}

                        {/* CUERPO */}
                        <div className="flex-auto bg-gray-50 px-6 lg:px-12 py-8 shadow-inner">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {pagedItems.map((inst) => {
                                    const siteFixed = safeUrl(inst.sitioWeb ?? null);

                                    return (
                                        <div key={String(inst.id)} className="bg-white p-5 shadow rounded">
                                            <div className="border-b border-gray-200 pb-3">
                                                <p className="text-lg font-semibold text-gray-800">{inst.nombre || 'Sin nombre'}</p>
                                            </div>

                                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Datos */}
                                                <div>
                                                    <p className="text-sm text-gray-600 line-clamp-5">{inst.descripcion || 'Sin descripción.'}</p>

                                                    <div className="mt-4 space-y-2">
                                                        {siteFixed && (
                                                            <a
                                                                href={siteFixed}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center text-xs text-blue-700 hover:text-blue-800"
                                                            >
                                                                <Globe size={14} className="mr-2" />
                                                                {siteFixed}
                                                            </a>
                                                        )}

                                                        {inst.email && (
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Mail size={14} className="mr-2" />
                                                                {inst.email}
                                                            </div>
                                                        )}

                                                        {inst.telefono && (
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Phone size={14} className="mr-2" />
                                                                {inst.telefono}
                                                            </div>
                                                        )}

                                                        {inst.direccion && (
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <MapPin size={14} className="mr-2" />
                                                                {inst.direccion}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Logo */}
                                                <div className="flex justify-center md:justify-end">
                                                    <div className="w-full max-w-[220px] h-[160px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                        {inst.logoUrl ? (
                                                            <img src={inst.logoUrl} alt="logo" className="w-full h-full object-contain p-3" />
                                                        ) : (
                                                            <div className="text-center">
                                                                <ImageIcon size={28} className="mx-auto text-gray-300 mb-2" />
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Sin logo</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ✅ FOOTER (paginación abajo de todo, dentro del card principal) */}
                        {totalPages > 1 && (
                            <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-center">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => canPrev && setPage((p) => p - 1)}
                                        disabled={!canPrev}
                                        className={`p-2 rounded-lg transition-colors ${canPrev ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                        title="Anterior"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <div className="flex items-center gap-1 select-none">
                                        {getPageItems(page, totalPages).map((it, idx) => {
                                            if (it === '...') {
                                                return (
                                                    <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const n = it as number;
                                            const active = n === page;

                                            return (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setPage(n)}
                                                    className={
                                                        active
                                                            ? 'px-2.5 py-1 rounded-md text-sm font-black text-gray-900 bg-gray-100'
                                                            : 'px-2.5 py-1 rounded-md text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                    }
                                                >
                                                    {n}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => canNext && setPage((p) => p + 1)}
                                        disabled={!canNext}
                                        className={`p-2 rounded-lg transition-colors ${canNext ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                        title="Siguiente"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default InstitucionList;
