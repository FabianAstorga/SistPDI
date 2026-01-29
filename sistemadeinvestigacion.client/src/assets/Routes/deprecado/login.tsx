import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../Services/authService';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginDrawer = ({ isOpen, onClose }: LoginDrawerProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const logoPDI = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Policia_de_Investigaciones_de_Chile.svg/1200px-Policia_de_Investigaciones_de_Chile.svg.png";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await authService.login(email, password);
            // Al loguear, simplemente cerramos y refrescamos el estado del Panel
            onClose();
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay desenfocado */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#001a35]/40 backdrop-blur-sm z-[150]"
                    />

                    {/* Panel Lateral */}
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.2)] z-[160] p-8 flex flex-col"
                    >
                        <div className="flex justify-end mb-8">
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1">
                            <img src={logoPDI} alt="PDI" className="h-16 mb-6 mx-auto" />
                            <h2 className="text-2xl font-black text-[#002855] text-center uppercase tracking-tighter mb-2">Acceso Funcionarios</h2>
                            <p className="text-slate-500 text-sm text-center mb-10 font-medium">Ingrese sus credenciales institucionales</p>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg uppercase">
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#003385] outline-none transition-all text-slate-800"
                                            placeholder="nombre@investigaciones.cl"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#003385] outline-none transition-all text-slate-800"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full group flex items-center justify-center gap-3 py-4 bg-[#003385] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-[#002a66] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Validando...' : (
                                        <>
                                            Entrar
                                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <footer className="mt-auto pt-6 border-t border-slate-100">
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest text-center font-bold">
                                Policía de Investigaciones de Chile
                            </p>
                        </footer>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};