import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Settings2, Save } from 'lucide-react';

function Acuerdos() {
    const navigate = useNavigate();

    const [instituciones, setInstituciones] = useState<any[]>([]);
    const [loadingInstituciones, setLoadingInstituciones] = useState(true);

    const [formData, setFormData] = useState(() => {
        const tempStored = localStorage.getItem('temp_acuerdo');
        if (tempStored) {
            try {
                const parsed = JSON.parse(tempStored);
                return {
                    ...parsed,
                    IdInstitucion: parsed?.IdInstitucion !== undefined && parsed?.IdInstitucion !== null
                        ? Number(parsed.IdInstitucion)
                        : ''
                };
            } catch (e) {
                console.error("Error recuperando datos temporales", e);
            }
        }

        return {
            Titulo: '',
            Descripcion: '',
            DetallesDescripcion: '',
            FechaVencimiento: '',
            Estado: 'Activo',
            PdfUrl: '',
            ImagenUrl: '',
            Habilitado: 'true',
            IdInstitucion: '', 
            IdSvgTemplate: 0
        };
    });

    const institucionSeleccionada = useMemo(() => {
        if (formData.IdInstitucion === '' || formData.IdInstitucion === null || formData.IdInstitucion === undefined) return null;
        return (
            instituciones.find((i: any) => Number(i.idInstitucion) === Number(formData.IdInstitucion)) || null
        );
    }, [instituciones, formData.IdInstitucion]);

    useEffect(() => {
        const fetchInstituciones = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:5091/api/Instituciones', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });

                if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    console.error('Error HTTP cargando instituciones:', response.status, response.statusText, text);
                    setInstituciones([]);
                    setLoadingInstituciones(false);
                    return;
                }

                const data = await response.json();
                const list = Array.isArray(data) ? data : [];
                setInstituciones(list);

                setFormData((prev: any) => {
                    if (prev.IdInstitucion !== '' && prev.IdInstitucion !== null && prev.IdInstitucion !== undefined) return prev;
                    if (list.length === 0) return prev;
                    return { ...prev, IdInstitucion: Number(list[0]?.idInstitucion) };
                });

                setLoadingInstituciones(false);
            } catch (error) {
                console.error("Error cargando instituciones:", error);
                setInstituciones([]);
                setLoadingInstituciones(false);
            }
        };

        fetchInstituciones();
    }, []);

    const controlLabel = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block";
    const inputStyle =
        "w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const idInst =
            formData.IdInstitucion === '' || formData.IdInstitucion === null || formData.IdInstitucion === undefined
                ? 0
                : Number(formData.IdInstitucion);

        if (!formData.Titulo || !formData.FechaVencimiento || !idInst) {
            alert("Título, Fecha e Institución son obligatorios");
            return;
        }

        const payload = { ...formData, IdInstitucion: idInst };
        localStorage.setItem('temp_acuerdo', JSON.stringify(payload));
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
                                            <label className={controlLabel}>Título del Acuerdo</label>
                                            <input
                                                name="Titulo"
                                                value={formData.Titulo}
                                                onChange={handleChange}
                                                type="text"
                                                className={inputStyle}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Estado</label>
                                            <select
                                                name="Estado"
                                                value={formData.Estado}
                                                onChange={handleChange}
                                                className={inputStyle}
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Pendiente">Pendiente</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Fecha Vencimiento</label>
                                            <input
                                                name="FechaVencimiento"
                                                value={formData.FechaVencimiento}
                                                onChange={handleChange}
                                                type="datetime-local"
                                                className={inputStyle}
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={controlLabel}>URL del PDF</label>
                                            <input
                                                name="PdfUrl"
                                                value={formData.PdfUrl}
                                                onChange={handleChange}
                                                type="text"
                                                className={inputStyle}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={controlLabel}>URL de Imagen</label>
                                            <input
                                                name="ImagenUrl"
                                                value={formData.ImagenUrl}
                                                onChange={handleChange}
                                                type="text"
                                                className={inputStyle}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={controlLabel}>Institución</label>

                                            <select
                                                name="IdInstitucion"
                                                value={formData.IdInstitucion}
                                                onChange={(e) =>
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        IdInstitucion: Number(e.target.value)
                                                    }))
                                                }
                                                className={inputStyle}
                                                required
                                                disabled={loadingInstituciones || instituciones.length === 0}
                                            >
                                                {instituciones.length === 0 ? (
                                                    <option value="">No hay instituciones disponibles</option>
                                                ) : (
                                                    <>
                                                        {formData.IdInstitucion === '' && (
                                                            <option value="" disabled>
                                                                Seleccione una institución
                                                            </option>
                                                        )}
                                                        {instituciones.map((inst: any) => (
                                                            <option
                                                                key={String(inst.idInstitucion)}   
                                                                value={Number(inst.idInstitucion)} 
                                                            >
                                                                {inst.nombre}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>

                                            {institucionSeleccionada && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    Seleccionada: <strong>{institucionSeleccionada.nombre}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className={controlLabel}>Descripción Breve</label>
                                        <textarea
                                            name="Descripcion"
                                            value={formData.Descripcion}
                                            onChange={handleChange}
                                            className={`${inputStyle} h-36 resize-none`}
                                        />
                                    </div>

                                    <div>
                                        <label className={controlLabel}>Detalles Completos</label>
                                        <textarea
                                            name="DetallesDescripcion"
                                            value={formData.DetallesDescripcion}
                                            onChange={handleChange}
                                            className={`${inputStyle} h-[360px] resize-none`}
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

export default Acuerdos;
