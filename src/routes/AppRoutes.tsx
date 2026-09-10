import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Login } from '../modules/auth/Login';
import { DashboardLayout } from '../modules/dashboard/DashboardLayout';
import { RegistroTamizPage } from '../modules/tamiz/RegistroTamizPage';
import { PadronParterasPage } from '../modules/parteras/PadronParterasPage';
import { CalendarioAtencionPage } from '../modules/parteras/CalendarioAtencionPage';
import { NotificationCenter } from '../modules/notificaciones/NotificationCenter';

// Componente Guard para proteger rutas privadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* La ruta raíz '/' es estrictamente la pantalla de Login */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas Privadas Protegidas (Redirigen a '/' si user es null) */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={null} />
                <Route path="tamiz" element={<RegistroTamizPage />} />
                <Route path="parteras" element={<PadronParterasPage />} />
                <Route path="parteras/calendario" element={<CalendarioAtencionPage />} />
                <Route path="notificaciones" element={<NotificationCenter />} />
            </Route>

            {/* Redirección por defecto ante rutas desconocidas */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
