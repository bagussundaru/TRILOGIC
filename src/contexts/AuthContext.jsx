import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://103.189.234.15:3001/api';

// Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on mount
    useEffect(() => {
        async function checkAuth() {
            if (token) {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.data);
                    } else {
                        // Token invalid, clear it
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                }
            }
            setLoading(false);
        }

        checkAuth();
    }, [token]);

    // Login function
    const login = async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);

        return data.data.user;
    };

    // Register function
    const register = async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);

        return data.data.user;
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Check if user has role
    const hasRole = (roles) => {
        if (!user) return false;
        if (!Array.isArray(roles)) roles = [roles];
        return roles.includes(user.role);
    };

    // Get auth headers for API calls
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
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

// Custom hook to use auth
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Role constants for frontend
export const ROLES = {
    CEO: 'CEO',
    CFO: 'CFO',
    CTO: 'CTO',
    PMO_DIRECTOR: 'PMO_Director',
    PROJECT_MANAGER: 'Project_Manager',
    TEAM_LEAD: 'Team_Lead',
    ENGINEER: 'Engineer',
    FINANCE: 'Finance',
    VIEWER: 'Viewer'
};

export default AuthContext;
