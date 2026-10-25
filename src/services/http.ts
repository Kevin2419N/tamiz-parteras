import axios from 'axios';

// Creamos la instancia de Axios con la URL base apuntando oficialmente al /api/v1 del backend en Render
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend-parteras.onrender.com/api/v1',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor de Request: Inyecta automáticamente el Token JWT
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token_sso_parteras');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de Response: Manejo de errores globales
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token_sso_parteras');
            localStorage.removeItem('user_sso_parteras');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);