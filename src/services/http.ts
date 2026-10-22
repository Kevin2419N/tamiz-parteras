import axios from 'axios';

// Creamos la instancia de Axios con la URL base definida en las variables de entorno de Vite
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend-parteras.onrender.com/api/v1',
    timeout: 15000, // Tiempo máximo de espera (15 segundos)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor de Request: Inyecta automáticamente el Token JWT si el usuario ha iniciado sesión
http.interceptors.request.use(
    (config) => {
        // Buscamos el token en localStorage (puedes adaptarlo si lo guardas en sessionStorage o Zustand/Context)
        const token = localStorage.getItem('token_sso_parteras');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Response: Maneja errores globales (como token expirado o fallos de servidor)
http.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status } = error.response;

            // Si el servidor responde 401 (No autorizado), limpiamos credenciales y redirigimos al login
            if (status === 401) {
                localStorage.removeItem('token_sso_parteras');
                localStorage.removeItem('user_sso_parteras');

                // Redirigir al login si no estamos ya en él
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);