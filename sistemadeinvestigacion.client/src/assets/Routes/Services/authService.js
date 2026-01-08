// Definimos la URL base (idealmente esto vendría de una variable de entorno)
const API_URL = 'http://localhost:3000/api';

export const authService = {

    // Función específica para Login
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
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

            // Podríamos incluso guardar el token aquí mismo para no ensuciar el componente
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            // Relanzamos el error para que el componente decida qué mensaje mostrar
            throw error;
        }
    },

    // Función para cerrar sesión (ejemplo)
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};