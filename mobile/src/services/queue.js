import apiClient from './api';

/**
 * Queue API Service
 * Handles queue-related API calls
 */

/**
 * Request a queue number
 */
export const requestQueue = async (serviceId) => {
  const response = await apiClient.post('/queue/request', {
    serviceId,
  });
  return response;
};

/**
 * Get queue status
 */
export const getQueueStatus = async (queueId) => {
  const response = await apiClient.get(`/queue/${queueId}`);
  return response;
};

/**
 * Get service queue status
 */
export const getServiceQueueStatus = async (serviceId) => {
  const response = await apiClient.get(`/queue/status/${serviceId}`);
  return response;
};

/**
 * Cancel queue
 */
export const cancelQueue = async (queueId) => {
  const response = await apiClient.delete(`/queue/${queueId}/cancel`);
  return response;
};

/**
 * Get user's queue history
 */
export const getQueueHistory = async (page = 1, limit = 20) => {
  const response = await apiClient.get(`/queue/history?page=${page}&limit=${limit}`);
  return response;
};

