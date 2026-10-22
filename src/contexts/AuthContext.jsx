import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://103.189.234.15:3001/api';

// Demo Default Owner User for Direct Unrestricted Presentation
const DEFAULT_OWNER_USER = {
    id: 'owner-01',
    name: 'Bagus Sundaru',
    email: 'owner@tembalang.id',
    role: 'Project_Owner',
    title: 'Pemilik Proyek / Principal Investor'
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(DEFAULT_OWNER_USER);
    const [token, setToken] = useState('demo-owner-token');
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        const loggedUser = {
            id: 'owner-01',
            name: 'Bagus Sundaru',
            email: email || 'owner@tembalang.id',
            role: 'Project_Owner',
            title: 'Pemilik Proyek / Principal Investor'
        };
        setUser(loggedUser);
        setToken('demo-owner-token');
        return loggedUser;
    };

    const register = async (userData) => {
        const newUser = {
            id: Date.now().toString(),
            name: userData.name || 'Bagus Sundaru',
            email: userData.email || 'owner@tembalang.id',
            role: 'Project_Owner'
        };
        setUser(newUser);
        setToken('demo-owner-token');
        return newUser;
    };

    const logout = () => {
        // Keeps user logged in demo mode
        setUser(DEFAULT_OWNER_USER);
    };

    const hasRole = () => true;

    const getAuthHeaders = () => ({
        'Authorization': `Bearer demo-owner-token`,
        'Content-Type': 'application/json'
    });

    const value = {
        user,
        token,
        loading,
        isAuthenticated: true, // ALWAYS AUTHENTICATED FOR DEMO MODE
        login,
        register,
        logout,
        hasRole,
        getAuthHeaders
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export const ROLES = {
    PROJECT_OWNER: 'Project_Owner',
    PMO_DIRECTOR: 'PMO_Director',
    PROJECT_MANAGER: 'Project_Manager'
};

export default AuthContext;
