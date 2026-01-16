import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Settings2, Save, FileText, ImageIcon } from 'lucide-react';

function Acuerdos() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(() => {
        const tempStored = localStorage.getItem('temp_acuerdo');
        if (tempStored) {
            try {
                return JSON.parse(tempStored);
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
            IdInstitucion: 1,
            IdSvgTemplate: 0
        };
    });

    const controlLabel = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block";
    const inputStyle = "w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!formData.Titulo || !formData.FechaVencimiento) {
            alert("El Titulo y la Fecha son obligatorios");
            return;
        }

        localStorage.setItem('temp_acuerdo', JSON.stringify(formData));
        navigate('/lienzo');
    };

    return (
        <div className="min-h-screen bg-slate-100 overflow-y-auto w-full">
            <Navbar />
            <main className="pt-24 pb-20 px-6">
                <section className="max-w-[95%] mx-auto mt-6">
                    <form id="form-acuerdo" onSubmit={handleSubmit} autoComplete="off" className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">
                        <div className="rounded-t bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    <Settings2 size={24} className="text-black" />
                                </div>
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">Configuracion de Acuerdo</h6>
                            </div>
                            <button form="form-acuerdo" className="bg-[#003385] hover:bg-[#002a66] text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center" type="submit">
                                <Save size={16} className="mr-2" /> Continuar al Lienzo
                            </button>
                        </div>

                        <div className="flex-auto bg-gray-50 px-6 lg:px-12 py-10 shadow-inner">
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <span className="text-xs font-black text-black uppercase tracking-widest pb-1 border-b-2 border-[#003385]">1. Informacion General</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="w-full lg:col-span-2">
                                            <label className={controlLabel}>Titulo del Acuerdo</label>
                                            <input name="Titulo" value={formData.Titulo} onChange={handleChange} type="text" className={inputStyle} required placeholder="Ej: Convenio Marco de Colaboración" />
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>Estado</label>
                                            <select name="Estado" value={formData.Estado} onChange={handleChange} className={inputStyle}>
                                                <option value="Activo">Activo</option>
                                                <option value="Pendiente">Pendiente</option>
                                            </select>
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>Fecha Vencimiento</label>
                                            <input name="FechaVencimiento" value={formData.FechaVencimiento} onChange={handleChange} type="datetime-local" className={inputStyle} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-xs font-black text-black uppercase tracking-widest pb-1 border-b-2 border-[#003385]">2. Recursos y Documentación</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="w-full">
                                            <label className={controlLabel}>URL del Documento PDF</label>
                                            <div className="relative">
                                                <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                                                <input name="PdfUrl" value={formData.PdfUrl} onChange={handleChange} type="text" className={`${inputStyle} pl-10`} placeholder="https://ejemplo.com/archivo.pdf" />
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>URL de Imagen Representativa</label>
                                            <div className="relative">
                                                <ImageIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                                                <input name="ImagenUrl" value={formData.ImagenUrl} onChange={handleChange} type="text" className={`${inputStyle} pl-10`} placeholder="https://ejemplo.com/imagen.jpg" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/4">
                                        <label className={controlLabel}>ID Institucion</label>
                                        <input name="IdInstitucion" value={formData.IdInstitucion} onChange={handleChange} type="number" className={inputStyle} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-xs font-black text-black uppercase tracking-widest pb-1 border-b-2 border-[#003385]">3. Cuerpo del Convenio</span>
                                    <div className="grid grid-cols-1 gap-8">
                                        <div>
                                            <label className={controlLabel}>Descripcion Breve</label>
                                            <textarea name="Descripcion" value={formData.Descripcion} onChange={handleChange} className={`${inputStyle} h-20 resize-none`} placeholder="Resumen del acuerdo..." />
                                        </div>
                                        <div>
                                            <label className={controlLabel}>Detalles Completos</label>
                                            <textarea name="DetallesDescripcion" value={formData.DetallesDescripcion} onChange={handleChange} className={`${inputStyle} h-40 resize-none`} placeholder="Escriba aquí todas las cláusulas y detalles..." />
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