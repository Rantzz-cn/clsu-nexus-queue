import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication API Service
 * Handles login, registration, and token management
 */

/**
 * Register a new user
 */
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  
  if (response.success && response.data.token) {
    // Store token and user data
    await AsyncStorage.setItem('authToken', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Login user
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });
  
  if (response.success && response.data.token) {
    // Store token and user data
    await AsyncStorage.setItem('authToken', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Logout user
 */
export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response;
};

/**
 * Get stored token
 */
export const getStoredToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

/**
 * Get stored user
 */
export const getStoredUser = async () => {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const token = await getStoredToken();
  return !!token;
};

