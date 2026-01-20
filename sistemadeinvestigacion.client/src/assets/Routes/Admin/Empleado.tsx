import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Save } from 'lucide-react';
import { Users, Search, User, Phone, IdCard, Briefcase, Mail } from 'lucide-react';

type EmpleadoApi = {
    id: number;
    nombre: string;
    rut: string;
    brigada: string;
    cargo: string;
    telefono: number | string;
    mail?: string | null;
    idCreador?: number | null;
};

function Empleado() {
    const [empleados, setEmpleados] = useState<EmpleadoApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [inputSearch, setInputSearch] = useState('');

    const searchResult = useMemo(() => {
        const q = inputSearch.trim().toLowerCase();
        if (!q) return empleados;
        return empleados.filter((e) => (e.nombre || '').toLowerCase().includes(q));
    }, [empleados, inputSearch]);

    const [modalOpen, setModalOpen] = useState(false);

    const [nombre, setNombre] = useState('');
    const [rut, setRut] = useState('');
    const [brigada, setBrigada] = useState('');
    const [cargo, setCargo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [mail, setMail] = useState('');

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    const controlLabel =
        'text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block';

    const inputStyle =
        'w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm';

    const cleanRut = (value: string) => value.replace(/\./g, '').replace(/-/g, '').trim();

    const formatRut = (value: string) => {
        const v = cleanRut(value).toUpperCase();
        if (v.length <= 1) return v;
        const body = v.slice(0, -1);
        const dv = v.slice(-1);
        const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${bodyWithDots}-${dv}`;
    };

    const calcDv = (rutBody: string) => {
        let sum = 0;
        let mul = 2;
        for (let i = rutBody.length - 1; i >= 0; i--) {
            sum += parseInt(rutBody[i], 10) * mul;
            mul = mul === 7 ? 2 : mul + 1;
        }
        const res = 11 - (sum % 11);
        if (res === 11) return '0';
        if (res === 10) return 'K';
        return String(res);
    };

    const isRutValid = (value: string) => {
        const v = cleanRut(value).toUpperCase();
        if (v.length < 8) return false;
        const body = v.slice(0, -1);
        const dv = v.slice(-1);
        if (!/^\d+$/.test(body)) return false;
        return dv === calcDv(body);
    };

    const canSubmit = useMemo(() => {
        return (
            nombre.trim().length > 0 &&
            rut.trim().length > 0 &&
            brigada.trim().length > 0 &&
            cargo.trim().length > 0 &&
            telefono.trim().length > 0 &&
            mail.trim().length > 0 &&
            isRutValid(rut)
        );
    }, [nombre, rut, brigada, cargo, telefono, mail]);

    const resetForm = () => {
        setNombre('');
        setRut('');
        setBrigada('');
        setCargo('');
        setTelefono('');
        setMail('');
        setSaving(false);
        setErrorMsg(null);
        setOkMsg(null);
    };

    const openModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRut(formatRut(e.target.value));
        setOkMsg(null);
        setErrorMsg(null);
    };

    const fetchEmpleados = async () => {
        try {
            setLoading(true);
            setLoadError(null);

            const token = localStorage.getItem('token');

            const res = await fetch('http://localhost:5091/api/Empleados', {
                method: 'GET',
                headers: {
                    accept: 'text/plain',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(text || `Error HTTP ${res.status}`);
            }

            const data = (await res.json().catch(() => null)) as any;
            if (!Array.isArray(data)) {
                // si tu backend devolviera {data:[...]} o similar, ajusta acá
                throw new Error('Respuesta inesperada del servidor (no es una lista).');
            }

            setEmpleados(data as EmpleadoApi[]);
        } catch (err: any) {
            setLoadError(err?.message || 'Error al cargar empleados.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpleados();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async () => {
        setErrorMsg(null);
        setOkMsg(null);

        if (!nombre.trim() || !rut.trim() || !brigada.trim() || !cargo.trim() || !telefono.trim() || !mail.trim()) {
            setErrorMsg('Faltan campos obligatorios: nombre, rut, mail, brigada, cargo y teléfono.');
            return;
        }
        if (!isRutValid(rut)) {
            setErrorMsg('RUT inválido. Revisa el dígito verificador.');
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem('token');

            // ✅ NUEVO ENDPOINT: multipart/form-data (según tu swagger/curl)
            const fd = new FormData();
            fd.append('Nombre', nombre.trim());
            fd.append('Rut', formatRut(rut).toUpperCase()); // backend espera "Rut=string" con guion
            fd.append('Mail', mail.trim());
            fd.append('brigada', brigada.trim());
            fd.append('cargo', cargo.trim());

            const telNum = Number(String(telefono).replace(/[^\d]/g, ''));
            fd.append('telefono', Number.isFinite(telNum) ? String(telNum) : '0');

            const res = await fetch('http://localhost:5091/api/Empleados', {
                method: 'POST',
                headers: {
                    accept: 'text/plain',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    // OJO: NO poner Content-Type aquí (el browser lo setea con boundary)
                },
                body: fd,
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(text || `Error HTTP ${res.status}`);
            }

            setOkMsg('Empleado creado correctamente.');

            // refresca lista
            await fetchEmpleados();

            // limpia form
            setNombre('');
            setRut('');
            setBrigada('');
            setCargo('');
            setTelefono('');
            setMail('');
        } catch (err: any) {
            setErrorMsg(err?.message || 'Error al crear el empleado.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 w-full">
            <Navbar />

            <main className="pt-24 pb-20 px-6">
                <section className="max-w-[95%] mx-auto mt-6">
                    <div className="w-full mb-6 shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">
                        <div className="bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center gap-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    <Users size={24} className="text-black" />
                                </div>
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">Empleados</h6>
                            </div>

                            <div className="flex items-center gap-3 w-full justify-end">
                                <div className="w-full max-w-xs relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <Search size={14} />
                                    </span>
                                    <input
                                        type="search"
                                        className={`${inputStyle} pl-10`}
                                        placeholder="Buscar por nombre"
                                        value={inputSearch}
                                        onChange={(e) => setInputSearch(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={openModal}
                                    className="bg-[#003385] hover:bg-[#002a66] text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center"
                                >
                                    <Save size={16} className="mr-2" />
                                    Crear Empleado
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 lg:px-6 py-6 shadow-inner">
                            <div className="w-full max-h-[650px] overflow-y-auto pr-1">
                                {loading ? (
                                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-sm text-gray-700 font-semibold">Cargando empleados...</p>
                                    </div>
                                ) : loadError ? (
                                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-sm text-red-600 font-semibold">{loadError}</p>
                                        <button
                                            type="button"
                                            onClick={fetchEmpleados}
                                            className="mt-3 bg-gray-900 hover:bg-black text-white font-bold uppercase text-xs px-6 py-2 rounded-xl shadow-lg transition-all active:scale-95"
                                        >
                                            Reintentar
                                        </button>
                                    </div>
                                ) : searchResult.length === 0 ? (
                                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-sm text-indigo-700 font-bold">No results found!</p>
                                        <p className="text-xs text-gray-500 mt-1">Prueba otro nombre.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {searchResult.map((emp) => (
                                            <li key={emp.id}>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        // ✅ ejemplo: obtener 1 empleado usando GET /api/Empleados/{id}
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            const res = await fetch(`http://localhost:5091/api/Empleados/${emp.id}`, {
                                                                method: 'GET',
                                                                headers: {
                                                                    accept: 'text/plain',
                                                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                                                },
                                                            });
                                                            if (!res.ok) return console.log('No se pudo obtener empleado', emp.id);
                                                            const data = await res.json();
                                                            console.log('Empleado detalle:', data);
                                                        } catch (e) {
                                                            console.log('Error al obtener empleado', e);
                                                        }
                                                    }}
                                                    className="w-full text-left bg-indigo-50 rounded-xl p-8 border border-transparent hover:shadow-lg hover:border-indigo-300 transition-all active:scale-[0.99]"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="rounded-full w-16 h-16 bg-white border border-white shadow shrink-0 flex items-center justify-center">
                                                            <User size={26} className="text-gray-700" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h2 className="text-base font-black text-gray-900 truncate">{emp.nombre}</h2>
                                                            <p className="text-sm text-gray-600 truncate">
                                                                {emp.brigada} · {emp.cargo}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {emp.rut} · {emp.mail || 'sin mail'} · {String(emp.telefono ?? '')}
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
                </section>
            </main>

            {modalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center" aria-modal="true" role="dialog">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={closeModal}
                        aria-label="Cerrar modal"
                    />

                    <div className="relative w-[min(1100px,95vw)] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
                        <div className="rounded-t bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    <User size={24} className="text-black" />
                                </div>
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">Ingresar Nuevo Empleado</h6>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    className={`${canSubmit && !saving ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                                        } text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center`}
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || saving}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Empleado'}
                                </button>
                            </div>
                        </div>

                        {(errorMsg || okMsg) && (
                            <div className="px-8 py-4 border-b bg-white">
                                {errorMsg && <p className="text-sm text-red-600 font-semibold">{errorMsg}</p>}
                                {okMsg && <p className="text-sm text-green-700 font-semibold">{okMsg}</p>}
                            </div>
                        )}

                        <div className="flex-auto bg-gray-50 px-6 lg:px-12 py-10 shadow-inner">
                            <form
                                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                            >
                                <div className="space-y-6">
                                    <div className="border-b border-gray-300 pb-1">
                                        <span className="text-xs font-black text-black uppercase tracking-widest">Datos del empleado</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={controlLabel}>Nombre *</label>
                                            <input
                                                type="text"
                                                className={inputStyle}
                                                placeholder="Nombre completo"
                                                value={nombre}
                                                onChange={(e) => {
                                                    setNombre(e.target.value);
                                                    setOkMsg(null);
                                                    setErrorMsg(null);
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label className={controlLabel}>RUT *</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                    <IdCard size={14} />
                                                </span>
                                                <input
                                                    type="text"
                                                    className={`${inputStyle} pl-10`}
                                                    placeholder="12.345.678-5"
                                                    value={rut}
                                                    onChange={handleRutChange}
                                                />
                                            </div>

                                            {rut.trim().length > 0 && !isRutValid(rut) && (
                                                <p className="mt-1 text-[11px] text-red-600 font-semibold">RUT inválido.</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Mail *</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                    <Mail size={14} />
                                                </span>
                                                <input
                                                    type="email"
                                                    className={`${inputStyle} pl-10`}
                                                    placeholder="usuario@mail.com"
                                                    value={mail}
                                                    onChange={(e) => {
                                                        setMail(e.target.value);
                                                        setOkMsg(null);
                                                        setErrorMsg(null);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Teléfono *</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                    <Phone size={14} />
                                                </span>
                                                <input
                                                    type="text"
                                                    className={`${inputStyle} pl-10`}
                                                    placeholder="+56 9 ..."
                                                    value={telefono}
                                                    onChange={(e) => {
                                                        setTelefono(e.target.value);
                                                        setOkMsg(null);
                                                        setErrorMsg(null);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="border-b border-gray-300 pb-1">
                                        <span className="text-xs font-black text-black uppercase tracking-widest">Organización</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                                            <label className={controlLabel}>Brigada *</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                    <Users size={14} />
                                                </span>
                                                <input
                                                    type="text"
                                                    className={`${inputStyle} pl-10`}
                                                    placeholder="Ej: POLIN / PREPOLINACA"
                                                    value={brigada}
                                                    onChange={(e) => {
                                                        setBrigada(e.target.value);
                                                        setOkMsg(null);
                                                        setErrorMsg(null);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                                            <label className={controlLabel}>Cargo *</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                    <Briefcase size={14} />
                                                </span>
                                                <input
                                                    type="text"
                                                    className={`${inputStyle} pl-10`}
                                                    placeholder="Ej: Funcionario / Opp"
                                                    value={cargo}
                                                    onChange={(e) => {
                                                        setCargo(e.target.value);
                                                        setOkMsg(null);
                                                        setErrorMsg(null);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="mt-8 flex justify-end gap-3"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Empleado;
