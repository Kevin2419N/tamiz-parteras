import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    updateUser: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Inicializado estrictamente como null por defecto (sin sesión automática)
    const [user, setUser] = useState<User | null>(null);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('tamiz_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tamiz_user');
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('tamiz_user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
