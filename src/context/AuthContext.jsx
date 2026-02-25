/**
 * Authentication Context
 * Manages user authentication state globally
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Set axios auth header when token changes
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Load user on mount
  useEffect(() => {
    if (accessToken) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Load current user from API
   */
  const loadUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user:', error.message);
      // Token expired or invalid, try refresh
      if (error.response?.status === 401 && refreshToken) {
        const refreshed = await handleTokenRefresh();
        if (!refreshed) {
          logout();
        }
      } else {
        // Clear invalid tokens
        logout();
      }
      setLoading(false);
    }
  };

  /**
   * Refresh access token
   */
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post('/auth/refresh', { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data.data;

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Reload user with new token
      await loadUser();
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Register new user
   */
  const register = async (username, email, password, fullName) => {
    try {
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
        fullName,
      });

      const {
        user: newUser,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response.data.data;

      // Save tokens
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Set user
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });

      const {
        user: loggedInUser,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response.data.data;

      // Save tokens
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Set user
      setUser(loggedInUser);

      return { success: true, user: loggedInUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    // Call logout endpoint
    if (accessToken) {
      axios.post('/auth/logout').catch(() => {
        // Ignore errors
      });
    }

    // Clear state
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      setUser(response.data.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Update failed',
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    accessToken,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
