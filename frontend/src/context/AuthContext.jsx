import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/auth/current-user');
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);
  const localLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const login = () => {

    window.location.href = 'URL/api/auth/google';
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/'; 
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, localLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};