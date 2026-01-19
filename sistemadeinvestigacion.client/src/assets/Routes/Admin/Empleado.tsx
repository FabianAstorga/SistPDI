import React, { useMemo, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Save } from 'lucide-react';

import { Users, Search, X, User, Phone, IdCard, Briefcase } from 'lucide-react';

type UserRow = {
    id: string;
    firstname: string;
    lastname: string;
    country: string;
    photo: string;
};

function Empleado() {
    
    const [users] = useState<UserRow[]>([
        {
            id: 'u1',
            firstname: 'Juan',
            lastname: 'Topo',
            country: 'Chi/le',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8IDFWYReimH4pWG_dqzpLmUf0ftToyQsxjw&s',
        },
        {
            id: 'u2',
            firstname: 'Papi ',
            lastname: 'el Micky',
            country: 'kong xa lí',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpl4naH2wUPok15s57KZdK1qMewdFsrXltWA&s',
        },
        {
            id: 'u3',
            firstname: 'Juan',
            lastname: 'Alcayaga',
            country: 'Bv',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGjUhNrFwRrJNShcz1AYtsLMhqUpAuZnzYgg&s',
        },
        {
            id: 'u4',
            firstname: 'Roman',
            lastname: 'Corchea',
            country: 'La grieta del invocador',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE__oPyA1VIbCfrcU_pZ5B6gS7v9Voaam8Og&s',
        },
        {
            id: 'u5',
            firstname: 'Angel',
            lastname: 'Caiman',
            country: 'Tel aviv',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlD0Iy7inMA9_6QalnYsAOePopZgBcbIDCYQ&s',
        },
        {
            id: 'u6',
            firstname: 'Mister',
            lastname: 'Beast',
            country: 'Rancagua',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSflzUm2nYsZhTw4POn91VmMu-GASO6O4nQ_g&s',
        },
        {
            id: 'u7',
            firstname: 'Kitty',
            lastname: 'Bellaka',
            country: 'colina 2',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWZBXzm2l4G-sxYDnMqVVRSd61GZN3CveMVw&s',
        },
    ]);

    const [inputSearch, setInputSearch] = useState('');

    const searchResult = useMemo(() => {
        const q = inputSearch.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => `${u.firstname} ${u.lastname}`.toLowerCase().includes(q));
    }, [users, inputSearch]);

    
    const [modalOpen, setModalOpen] = useState(false);

    const [nombre, setNombre] = useState('');
    const [rut, setRut] = useState('');
    const [brigada, setBrigada] = useState('');
    const [cargo, setCargo] = useState('');
    const [telefono, setTelefono] = useState('');

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    const controlLabel = 'text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block';

    const inputStyle =
        'w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm';

    const cleanRut = (value: string) => value.replace(/\./g, '').replace(/-/g, '').trim();

    const formatRut = (value: string) => {
        const v = cleanRut(value);
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
            isRutValid(rut)
        );
    }, [nombre, rut, brigada, cargo, telefono]);

    const resetForm = () => {
        setNombre('');
        setRut('');
        setBrigada('');
        setCargo('');
        setTelefono('');
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

    const handleSubmit = async () => {
        setErrorMsg(null);
        setOkMsg(null);

        if (!nombre.trim() || !rut.trim() || !brigada.trim() || !cargo.trim() || !telefono.trim()) {
            setErrorMsg('Faltan campos obligatorios: nombre, rut, brigada, cargo y teléfono.');
            return;
        }
        if (!isRutValid(rut)) {
            setErrorMsg('RUT inválido. Revisa el dígito verificador.');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            const payload: any = {
                nombre: nombre.trim(),
                rut: cleanRut(rut).toUpperCase(),
                brigada: brigada.trim(),
                cargo: cargo.trim(),
                telefono: telefono.trim(),
            };

            const res = await fetch('http://localhost:5091/api/Empleados/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(text || `Error HTTP ${res.status}`);
            }

            setOkMsg('Empleado creado correctamente.');
           
            setNombre('');
            setRut('');
            setBrigada('');
            setCargo('');
            setTelefono('');
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
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">
                                    Empleados
                                </h6>
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
                                {searchResult.length === 0 ? (
                                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-sm text-indigo-700 font-bold">No results found!</p>
                                        <p className="text-xs text-gray-500 mt-1">Prueba otro nombre.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {searchResult.map((user) => (
                                            <li key={user.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => console.log('Selected user:', user)}
                                                    className="w-full text-left bg-indigo-50 rounded-xl p-8 border border-transparent hover:shadow-lg hover:border-indigo-300 transition-all active:scale-[0.99]"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={user.photo}
                                                            alt={`${user.firstname} ${user.lastname}`}
                                                            className="rounded-full w-16 h-16 object-cover border border-white shadow shrink-0"
                                                        />

                                                        <div className="flex-1 min-w-0">
                                                            <h2 className="text-base font-black text-gray-900 truncate">
                                                                {user.firstname} {user.lastname}
                                                            </h2>
                                                            <p className="text-sm text-gray-600 truncate">{user.country}</p>
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
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    aria-modal="true"
                    role="dialog"
                >
                    
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
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">
                                    Ingresar Nuevo Empleado
                                </h6>
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
                                        <span className="text-xs font-black text-black uppercase tracking-widest">
                                            Datos del empleado
                                        </span>
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
                                            <label className={controlLabel}>RUT</label>
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
                                                <p className="mt-1 text-[11px] text-red-600 font-semibold">
                                                    RUT inválido.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Teléfono</label>
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
                                        <span className="text-xs font-black text-black uppercase tracking-widest">
                                            Organización
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                                            <label className={controlLabel}>Brigada</label>
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
                                            <label className={controlLabel}>Cargo</label>
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

                            <div className="mt-8 flex justify-end gap-3">



                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Empleado;
