import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Settings2, Save } from 'lucide-react';

function Acuerdos() {
    const [formData, setFormData] = useState(() => {
        const userStored = localStorage.getItem('user');
        let userId = 0;

        if (userStored) {
            try {
                const userData = JSON.parse(userStored);
                userId = userData.idUsuario || userData.id || 0;
            } catch (e) {
                console.error("Error inicializando user ID", e);
            }
        }

        return {
            titulo: '',
            descripcion: '',
            detallesDescripcion: '',
            fechaVencimiento: '',
            estado: 'Activo',
            pdfUrl: '',
            imagenUrl: '',
            habilitado: 'true',
            idCreador: userId,
            idInstitucion: 0,
            idSvgTemplate: 0
        };
    });

    const controlLabel = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block";
    const inputStyle = "w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.titulo) {
            alert("El titulo es obligatorio");
            return;
        }

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            let value = formData[key];

            if (key === 'fechaVencimiento' && value) {
                value = new Date(value).toISOString();
            }

            dataToSend.append(key, value);
        });

        try {
            const response = await fetch('http://localhost:5091/api/Acuerdos/crear', {
                method: 'POST',
                body: dataToSend
            });

            if (response.ok) {
                alert("Acuerdo publicado con exito");
            } else {
                const errorText = await response.text();
                alert("Error: " + errorText);
            }
        } catch (error) {
            console.error("No pudo subirse el acuerdo:", error);
            alert("Error de conexion con el servidor");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 overflow-y-auto w-full">
            <Navbar />

            <main className="pt-24 pb-20 px-6">
                <section className="max-w-[95%] mx-auto mt-6">
                    <form id="form-acuerdo" onSubmit={handleSubmit} className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">

                        <div className="rounded-t bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    <Settings2 size={24} className="text-black" />
                                </div>
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">
                                    Configuracion de Acuerdo
                                </h6>
                            </div>
                            <button
                                form="form-acuerdo"
                                className="bg-[#003385] hover:bg-[#002a66] text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center"
                                type="submit"
                            >
                                <Save size={16} className="mr-2" /> Guardar Convenio
                            </button>
                        </div>

                        <div className="flex-auto bg-gray-50 px-6 lg:px-12 py-10 shadow-inner">
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <span className="text-xs font-black text-black uppercase tracking-widest pb-1">Informacion General y Plazos</span>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="w-full lg:col-span-2">
                                            <label className={controlLabel}>Titulo del Acuerdo</label>
                                            <input name="titulo" value={formData.titulo} onChange={handleChange} type="text" className={inputStyle} placeholder="Ej: Convenio Marco de Colaboración" />
                                        </div>

                                        <div className="w-full">
                                            <label className={controlLabel}>Estado Operativo</label>
                                            <select name="estado" value={formData.estado} onChange={handleChange} className={`${inputStyle} font-bold`}>
                                                <option value="Activo">Activo</option>
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="Finalizado">Finalizado</option>
                                            </select>
                                        </div>

                                        <div className="w-full">
                                            <label className={controlLabel}>Visibilidad</label>
                                            <select name="habilitado" value={formData.habilitado} onChange={handleChange} className={inputStyle}>
                                                <option value="true">Visible en Plataforma</option>
                                                <option value="false">Oculto / Borrador</option>
                                            </select>
                                        </div>

                                        <div className="w-full">
                                            <label className={controlLabel}>Fecha Vencimiento</label>
                                            <input name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} type="datetime-local" className={inputStyle} />
                                        </div>

                                        <div className="w-full">
                                            <label className={controlLabel}>ID Institucion</label>
                                            <input name="idInstitucion" value={formData.idInstitucion} onChange={handleChange} type="number" className={inputStyle} />
                                        </div>

                                        <div className="w-full">
                                            <label className={controlLabel}>ID Template SVG</label>
                                            <input name="idSvgTemplate" value={formData.idSvgTemplate} onChange={handleChange} type="number" className={inputStyle} />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-300" />

                                <div className="space-y-6">
                                    <span className="text-xs font-black text-black uppercase tracking-widest pb-1">Documentacion y Media</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="w-full">
                                            <label className={controlLabel}>URL del PDF</label>
                                            <input name="pdfUrl" value={formData.pdfUrl} onChange={handleChange} type="text" className={inputStyle} placeholder="https://..." />
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>URL de la Imagen</label>
                                            <input name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} type="text" className={inputStyle} placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-300" />

                                <div className="space-y-6">
                                    <span className="text-xs font-black text-black uppercase tracking-widest pb-1">Contenido del Convenio</span>
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="w-full">
                                            <label className={controlLabel}>Descripcion Breve</label>
                                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className={`${inputStyle} h-20 resize-none`} placeholder="Resumen..." />
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>Detalles Completos</label>
                                            <textarea name="detallesDescripcion" value={formData.detallesDescripcion} onChange={handleChange} className={`${inputStyle} h-40 resize-none`} placeholder="Cuerpo completo..." />
                                        </div>
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