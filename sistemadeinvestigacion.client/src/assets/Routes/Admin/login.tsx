import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Services/authService'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        console.log('Datos listos para enviar al backend:', { email, password });
        try {
            await authService.login(email, password);
            console.log("debugeo paso la prueba")
        } catch(err) {
            setError(err.message);
        }


    };

    return (
        <div className="flex items-center justify-center min-h-screen">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-md w-96"
                autoComplete="off"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-white-800">Iniciar Sesión</h2>
                <div className="mb-4">
                    <label className="block text-white-700 text-sm font-bold mb-2">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ejemplo@correo.com"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-white-700 text-sm font-bold mb-2">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="********"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Entrar
                </button>
            </form>
        </div>
    );
}

export default Login;

function setError(arg0: null) {
    throw new Error('Function not implemented.');
}


function setLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}
