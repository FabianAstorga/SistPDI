import { Navbar } from '../../components/Navbar';
import { Settings2 } from 'lucide-react';

function Acuerdos() {
    const controlLabel = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block";
    const inputStyle = "w-full bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-2 focus:ring-[#003385] focus:border-transparent p-2.5 transition-all duration-200 outline-none shadow-sm";

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
                                    <Settings2 size={24} className="text-black" />
                                </div>
                                <h6 className="text-black text-xl font-black uppercase tracking-tighter">
                                    Configuración de Acuerdo
                                </h6>
                            </div>
                            <button
                                className="bg-[#003385] hover:bg-[#002a66] text-white font-bold uppercase text-xs px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center"
                                type="button"
                            >
                                <i className="fas fa-save mr-2"></i> Guardar Convenio
                            </button>
                        </div>

                        <div className="flex-auto bg-gray-50 px-6 lg:px-12 py-10 shadow-inner">
                            <form className="space-y-12">

                                {/* SECCIÓN 1: INFORMACIÓN BÁSICA Y VIGENCIA (UNIFICADO) */}
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-xs font-black text-black uppercase tracking-widest pb-1">Información General y Plazos</span>
                                    </div>

                                    {/* Grid principal ajustado */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {/* Fila 1 */}
                                        <div className="w-full lg:col-span-2">
                                            <label className={controlLabel}>Título del Acuerdo</label>
                                            <input type="text" className={inputStyle} placeholder="Ej: Convenio Marco PDI" />
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>Institución</label>
                                            <select className={inputStyle}>
                                                <option value="">Seleccionar institución</option>
                                                <option value="1">Policía de Investigaciones</option>
                                            </select>
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>Tipo de Acuerdo</label>
                                            <select className={inputStyle}>
                                                <option value="Académico">Académico</option>
                                                <option value="Comercial">Comercial</option>
                                            </select>
                                        </div>

                                        {/* Fila 2 - Incorporando Vigencia */}
                                        <div className="w-full">
                                            <label className={controlLabel}>Estado Operativo</label>
                                            <select className={`${inputStyle} font-bold text-black`}>
                                                <option value="Activo">Activo</option>
                                                <option value="Pendiente">Pendiente</option>
                                            </select>
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>Fecha de Inicio</label>
                                            <input type="date" className={inputStyle} />
                                        </div>
                                        <div className="w-full">
                                            <label className={controlLabel}>Fecha de Finalización</label>
                                            <input type="date" className={inputStyle} defaultValue="2026-01-01" />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-300" />

                                {/* SECCIÓN 2: DOCUMENTACIÓN */}
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-xs font-black text-black uppercase tracking-widest pb-1">Documentación y Media</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm transition-hover hover:border-[#003385]/30">
                                            <label className={controlLabel}>Archivo PDF / Word</label>
                                            <input type="file" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm transition-hover hover:border-[#003385]/30">
                                            <label className={controlLabel}>Imagen Referencial</label>
                                            <input type="file" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-300" />

                                {/* SECCIÓN 3: DETALLES */}
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-xs font-black text-black uppercase tracking-widest pb-1">Resumen del Convenio</span>
                                    </div>
                                    <div className="w-full">
                                        <label className={controlLabel}>Descripción General</label>
                                        <textarea
                                            className={`${inputStyle} h-40 resize-none`}
                                            placeholder="Detalle los puntos clave del acuerdo..."
                                        />
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

export default Acuerdos;