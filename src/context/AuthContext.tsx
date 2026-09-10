import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
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

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
