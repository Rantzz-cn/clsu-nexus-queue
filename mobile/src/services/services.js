import apiClient from './api';

/**
 * Services API Service
 * Handles service-related API calls
 */

/**
 * Get all active services
 */
export const getAllServices = async () => {
  const response = await apiClient.get('/services');
  return response;
};

/**
 * Get service by ID
 */
export const getServiceById = async (serviceId) => {
  const response = await apiClient.get(`/services/${serviceId}`);
  return response;
};

/**
 * Get service queue status
 */
export const getServiceQueueStatus = async (serviceId) => {
  const response = await apiClient.get(`/services/${serviceId}/queue-status`);
  return response;
};

