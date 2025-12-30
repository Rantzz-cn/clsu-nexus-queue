import { toast } from '../components/Toast';

/**
 * Error Handler Utility
 * Provides consistent error handling across the app
 */

/**
 * Get user-friendly error message from error object
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Handle API error responses
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle custom error objects
  if (error.error?.message) {
    return error.error.message;
  }

  if (error.message) {
    // Don't show generic network errors, show user-friendly message
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Show error alert with user-friendly message
 */
export const showError = (error, title = 'Error') => {
  const message = getErrorMessage(error);
  toast.error(message);
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error) => {
  return (
    error?.message?.includes('Network Error') ||
    error?.message?.includes('timeout') ||
    error?.code === 'NETWORK_ERROR' ||
    !error?.response
  );
};

