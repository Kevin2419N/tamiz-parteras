import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../modules/auth/Login';
import { DashboardLayout } from '../modules/dashboard/DashboardLayout';
import { RegistroTamizPage } from '../modules/tamiz/RegistroTamizPage';
import { PadronParterasPage } from '../modules/parteras/PadronParterasPage';
import { CalendarioAtencionPage } from '../modules/parteras/CalendarioAtencionPage';
import { NotificationCenter } from '../modules/notificaciones/NotificationCenter';

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Shell de Rutas con DashboardLayout */}
            <Route path="/" element={<DashboardLayout />}>
                <Route path="dashboard" element={null} />
                <Route path="tamiz" element={<RegistroTamizPage />} />
                <Route path="parteras" element={<PadronParterasPage />} />
                <Route path="parteras/calendario" element={<CalendarioAtencionPage />} />
                <Route path="notificaciones" element={<NotificationCenter />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};
