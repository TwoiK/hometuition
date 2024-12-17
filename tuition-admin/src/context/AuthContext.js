import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        console.log('Current token:', token);
        if (token) {
            const adminData = localStorage.getItem('adminData');
            if (adminData) {
                setAdmin(JSON.parse(adminData));
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await api.login(credentials);
            console.log('Login response:', response);
            
            // Make sure we're accessing the correct properties
            if (response && response.token) {
                localStorage.setItem('adminToken', response.token);
                localStorage.setItem('adminData', JSON.stringify(response.admin));
                setAdmin(response.admin);
                return true;
            } else {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);