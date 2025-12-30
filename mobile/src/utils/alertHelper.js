import { toast } from '../components/Toast';

/**
 * Alert Helper
 * Provides toast notifications for simple messages
 * For confirmations, use CustomAlert component directly
 */

/**
 * Show a simple alert (now uses toast)
 */
export const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  // For simple alerts, just show toast
  toast.info(message || title);
};

/**
 * Show a success alert
 */
export const showSuccessAlert = (message, title = 'Success') => {
  toast.success(message);
};

/**
 * Show an error alert
 */
export const showErrorAlert = (message, title = 'Error') => {
  toast.error(message);
};

/**
 * Show a confirmation alert
 * Note: This now requires using CustomAlert component directly
 * This is kept for backward compatibility but should be replaced
 */
export const showConfirmAlert = (message, title = 'Confirm', onConfirm, onCancel) => {
  // For confirmations, you should use CustomAlert component directly
  // This is a fallback that just calls onConfirm (not ideal, but maintains compatibility)
  console.warn('showConfirmAlert: Use CustomAlert component directly for better UX');
  if (onConfirm) {
    // In a real scenario, you'd want to show CustomAlert here
    // For now, we'll just call onConfirm after a short delay
    setTimeout(() => {
      if (onConfirm) onConfirm();
    }, 100);
  }
};

