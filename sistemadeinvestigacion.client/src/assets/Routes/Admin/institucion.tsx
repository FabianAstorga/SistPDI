import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Building, Globe, Mail, Phone, MapPin, FileText, Image as ImageIcon } from 'lucide-react';

function Institucion() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const controlLabel = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block";
    const inputStyle = "w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm";

    // Manejador para mostrar la imagen al cargarla
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 overflow-y-auto w-full">
            <Navbar />

            <main className="pt-24 pb-20 px-6">
                <section className="max-w-[95%] mx-auto mt-6">
                    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">

                        {/* HEADER PRINCIPAL */}
                        <div className="rounded-t bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    <Building size={24} className="text-black" />
                                </div>
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">
                                    Ingresar Nueva Institución
                                </h6>
                            </div>
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center"
                                type="button"
                            >
                                <i className="fas fa-save mr-2"></i> Guardar Institución
                            </button>
                        </div>

                        {/* CUERPO GRIS DIVIDIDO EN DOS COLUMNAS */}
                        <div className="flex-auto bg-gray-50 px-6 lg:px-12 py-10 shadow-inner">
                            <form className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                                {/* COLUMNA IZQUIERDA: DATOS DE CONTACTO */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-300 pb-1">
                                        <span className="text-xs font-black text-black uppercase tracking-widest">Información de Contacto</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={controlLabel}>Nombre de la Institución</label>
                                            <input type="text" className={inputStyle} placeholder="Nombre oficial..." />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={controlLabel}>Email de Contacto</label>
                                                <input type="email" className={inputStyle} placeholder="ejemplo@institucion.cl" />
                                            </div>
                                            <div>
                                                <label className={controlLabel}>Teléfono</label>
                                                <input type="text" className={inputStyle} placeholder="+56 9 ..." />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Dirección Física</label>
                                            <input type="text" className={inputStyle} placeholder="Calle, Número, Ciudad" />
                                        </div>

                                        <div>
                                            <label className={controlLabel}>Descripción</label>
                                            <textarea
                                                className={`${inputStyle} h-32 resize-none`}
                                                placeholder="Breve reseña de la institución..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* COLUMNA DERECHA: LOGO Y WEB */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-300 pb-1">
                                        <span className="text-xs font-black text-black uppercase tracking-widest">Sitio web y logo</span>
                                    </div>

                                    {/* CARD PARA INGRESO DE LOGO */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm space-y-4">
                                        <label className={controlLabel}>Logo Institucional</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                                        />

                                        {/* ÁREA DE PREVISUALIZACIÓN */}
                                        <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 h-48 overflow-hidden">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Preview logo" className="max-h-full object-contain p-2" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Vista previa del logo</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* SITIO WEB ABAJO DEL LOGO */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                                        <label className={controlLabel}>Sitio Web (URL)</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                <Globe size={14} />
                                            </span>
                                            <input
                                                type="url"
                                                className={`${inputStyle} pl-10`}
                                                placeholder="https://www.institucion.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Institucion;