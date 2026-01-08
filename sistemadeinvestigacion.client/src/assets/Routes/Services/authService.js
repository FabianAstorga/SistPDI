const API_URL = 'http://localhost:5091/api';

export const authService = {

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // Si el backend devuelve error (ej: 401), lanzamos excepción para que el catch la atrape
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en las credenciales');
            }

            const data = await response.json();

//            if (data.token) {
//                localStorage.setItem('token', data.token);
//                localStorage.setItem('user', JSON.stringify(data.user));
//            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};