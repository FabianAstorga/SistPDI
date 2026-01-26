import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Settings2, Save } from 'lucide-react';

type Empresa = {
    idEmpresa: number | string;
    nombre: string;
    descripcion?: string;
    logo?: string;
    sitioWeb?: string;
    email?: string;
    telefono?: number;
    direccion?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
};

type TempAcuerdo = {
    titulo: string;
    descripcion: string;
    detallesDescripcion: string;
    fechaVencimiento: string; // ISO string
    estado: 'Activo' | string;
    habilitado: boolean;

    // solo UI
    idEmpresa: number | '';
};

function nowIso() {
    return new Date().toISOString();
}

function toIsoFromDatetimeLocal(value: string) {
    // value: "YYYY-MM-DDTHH:mm"
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString();
}

function toDatetimeLocalFromIso(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function Acuerdos() {
    const navigate = useNavigate();

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);

    const [formData, setFormData] = useState<TempAcuerdo>(() => {
        const tempStored = localStorage.getItem('temp_acuerdo'); // ✅ localStorage
        if (tempStored) {
            try {
                const parsed = JSON.parse(tempStored);
                return {
                    titulo: parsed?.titulo ?? '',
                    descripcion: parsed?.descripcion ?? '',
                    detallesDescripcion: parsed?.detallesDescripcion ?? '',
                    fechaVencimiento: parsed?.fechaVencimiento ?? nowIso(),
                    estado: 'Activo',
                    habilitado: true,
                    idEmpresa:
                        parsed?.idEmpresa !== undefined && parsed?.idEmpresa !== null && parsed?.idEmpresa !== ''
                            ? Number(parsed.idEmpresa)
                            : '',
                };
            } catch (e) {
                console.error('Error recuperando datos temporales', e);
            }
        }

        return {
            titulo: '',
            descripcion: '',
            detallesDescripcion: '',
            fechaVencimiento: nowIso(),
            estado: 'Activo',
            habilitado: true,
            idEmpresa: '',
        };
    });

    const empresaSeleccionada = useMemo(() => {
        if (formData.idEmpresa === '' || formData.idEmpresa === null || formData.idEmpresa === undefined) return null;
        return empresas.find((e) => Number(e.idEmpresa) === Number(formData.idEmpresa)) || null;
    }, [empresas, formData.idEmpresa]);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:5091/api/Empresa', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    console.error('Error HTTP cargando empresas:', response.status, response.statusText, text);
                    setEmpresas([]);
                    setLoadingEmpresas(false);
                    return;
                }

                let list: Empresa[] = [];
                try {
                    const data = await response.json();
                    list = Array.isArray(data) ? data : [];
                } catch {
                    const text = await response.text().catch(() => '');
                    try {
                        const data = JSON.parse(text);
                        list = Array.isArray(data) ? data : [];
                    } catch (err) {
                        console.error('No se pudo parsear respuesta de /api/Empresa', err);
                        list = [];
                    }
                }

                setEmpresas(list);

                setFormData((prev) => {
                    if (prev.idEmpresa !== '' && prev.idEmpresa !== null && prev.idEmpresa !== undefined) return prev;
                    if (list.length === 0) return prev;
                    return { ...prev, idEmpresa: Number(list[0]?.idEmpresa) };
                });

                setLoadingEmpresas(false);
            } catch (error) {
                console.error('Error cargando empresas:', error);
                setEmpresas([]);
                setLoadingEmpresas(false);
            }
        };

        fetchEmpresas();
    }, []);

    const controlLabel = 'text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block';
    const inputStyle =
        'w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const idEmp =
            formData.idEmpresa === '' || formData.idEmpresa === null || formData.idEmpresa === undefined
                ? 0
                : Number(formData.idEmpresa);

        if (!formData.titulo || !formData.fechaVencimiento || !idEmp) {
            alert('Título, Fecha y Empresa son obligatorios');
            return;
        }

        const payload = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            detallesDescripcion: formData.detallesDescripcion,
            fechaVencimiento: formData.fechaVencimiento,
            estado: 'Activo',
            habilitado: true,
        };

        localStorage.setItem('temp_acuerdo', JSON.stringify(payload)); // ✅ localStorage
        navigate('/lienzo');
    };

    return (
        <div className="min-h-screen bg-slate-100 overflow-y-auto w-full">
            <Navbar />

            <main className="pt-24 pb-20 px-6">
                <section className="max-w-[95%] mx-auto mt-6">
                    <form
                        onSubmit={handleSubmit}
                        autoComplete="off"
                        className="relative flex flex-col w-full mb-6 shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden"
                    >
                        <div className="rounded-t bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    <Settings2 size={24} className="text-black" />
                                </div>
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">
                                    Configuración de Acuerdo
                                </h6>
                            </div>

                            <button
                                className="bg-[#003385] hover:bg-[#002a66] text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center"
                                type="submit"
                            >
                                <Save size={16} className="mr-2" /> Continuar al Lienzo
                            </button>
                        </div>

                        <div className="bg-gray-50 px-6 lg:px-12 py-10 shadow-inner">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className={controlLabel}>Título del Acuerdo *</label>
                                            <input
                                                name="titulo"
                                                value={formData.titulo}
                                                onChange={handleChange}
                                                type="text"
                                                className={inputStyle}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Fecha Vencimiento *</label>
                                            <input
                                                name="fechaVencimiento"
                                                value={toDatetimeLocalFromIso(formData.fechaVencimiento)}
                                                onChange={(e) => {
                                                    const iso = toIsoFromDatetimeLocal(e.target.value);
                                                    setFormData((prev) => ({ ...prev, fechaVencimiento: iso }));
                                                }}
                                                type="datetime-local"
                                                className={inputStyle}
                                                required
                                            />
                                            <div className="mt-2 text-[11px] text-gray-500">
                                                ISO: <span className="font-mono">{formData.fechaVencimiento || '—'}</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={controlLabel}>Empresa *</label>
                                            <select
                                                name="idEmpresa"
                                                value={formData.idEmpresa}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, idEmpresa: Number(e.target.value) }))}
                                                className={inputStyle}
                                                required
                                                disabled={loadingEmpresas || empresas.length === 0}
                                            >
                                                {empresas.length === 0 ? (
                                                    <option value="">No hay empresas disponibles</option>
                                                ) : (
                                                    <>
                                                        {formData.idEmpresa === '' && (
                                                            <option value="" disabled>
                                                                Seleccione una empresa
                                                            </option>
                                                        )}
                                                        {empresas.map((emp) => (
                                                            <option key={String(emp.idEmpresa)} value={Number(emp.idEmpresa)}>
                                                                {emp.nombre}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>

                                            {empresaSeleccionada && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    Seleccionada: <strong>{empresaSeleccionada.nombre}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className={controlLabel}>Descripción Breve *</label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            className={`${inputStyle} h-36 resize-none`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={controlLabel}>Detalles Completos *</label>
                                        <textarea
                                            name="detallesDescripcion"
                                            value={formData.detallesDescripcion}
                                            onChange={handleChange}
                                            className={`${inputStyle} h-[220px] resize-none`}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
