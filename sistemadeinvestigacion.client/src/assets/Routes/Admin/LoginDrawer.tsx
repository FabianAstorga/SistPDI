import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../Services/authService';
import { X, Mail, Lock, ArrowRight, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5091';

interface LoginDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export const LoginDrawer = ({ isOpen, onClose, onLoginSuccess }: LoginDrawerProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [isRecovering, setIsRecovering] = useState(false);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Ingrese su correo para enviar el código");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('Email', email);

            const response = await fetch(`${API_BASE}/api/Auth/enviar`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'No se pudo enviar el correo de recuperación');
            }

            setIsRecovering(true);
        } catch (err: any) {
            setError(err.message || 'Error al solicitar código');
        } finally {
            setLoading(false);
        }
    };

    const handleRecoverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('Email', email);
            formData.append('Code', code);
            formData.append('Password', newPassword);

            const response = await fetch(`${API_BASE}/api/Auth/comprobar`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Código incorrecto o expirado');
            }

            alert("Contraseña actualizada con éxito. Inicie sesión ahora.");

            setIsRecovering(false);
            setPassword('');
            setNewPassword('');
            setCode('');
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await authService.login(email, password);
            onLoginSuccess();
            onClose();
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
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 bg-[#001a35]/40 backdrop-blur-sm z-[150]"
                    />

                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0, maxWidth: isRecovering ? '100%' : '448px' }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.2)] z-[160] p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            {isRecovering && (
                                <button
                                    onClick={() => setIsRecovering(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-[#002855] flex items-center gap-2 text-xs font-bold uppercase transition-colors"
                                >
                                    <ArrowLeft size={20} /> Volver
                                </button>
                            )}
                            <div className={!isRecovering ? "ml-auto" : ""}>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className={`flex-1 ${isRecovering ? 'max-w-md mx-auto w-full flex flex-col justify-center' : ''}`}>
                            <h2 className="text-2xl font-black text-[#002855] text-center uppercase tracking-tighter mb-2">
                                {isRecovering ? 'Nueva Contraseña' : 'Acceso Funcionarios'}
                            </h2>
                            <p className="text-slate-500 text-sm text-center mb-10 font-medium leading-relaxed px-4">
                                {isRecovering ? `Validación de identidad para:\n${email}` : 'Ingrese sus credenciales de sistema'}
                            </p>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg uppercase">
                                    {error}
                                </motion.div>
                            )}

                            {!isRecovering ? (
                                <form onSubmit={handleSubmitLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#003385] outline-none text-slate-800 font-bold"
                                                placeholder="usuario@investigaciones.cl" value={email} onChange={(e) => setEmail(e.target.value)} required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="password" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#003385] outline-none text-slate-800"
                                                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full group flex items-center justify-center gap-3 py-4 bg-[#003385] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-[#002a66] transition-all disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                                            <>
                                                Entrar
                                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex justify-center pr-1">
                                        <button
                                            type="button" onClick={handleForgotPassword} disabled={loading}
                                            className="text-[10px] font-bold text-slate-400 hover:text-[#003385] uppercase tracking-tight py-2 px-3 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Procesando...' : '¿Olvidó su contraseña?'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleRecoverySubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Institucional</label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#003385] outline-none text-slate-800 font-bold tracking-[0.4em] text-center uppercase"
                                                placeholder="CÓDIGO" value={code} onChange={(e) => setCode(e.target.value)} required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="password" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#003385] outline-none text-slate-800 font-bold"
                                                placeholder="MÍNIMO 8 CARACTERES" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-[#003385] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-[#002a66] transition-all disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Actualizar Credenciales'}
                                    </button>
                                </form>
                            )}
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