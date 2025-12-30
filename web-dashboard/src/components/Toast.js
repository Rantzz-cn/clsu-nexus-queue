import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

let toastId = 0;
const toasts = [];
const listeners = [];

const addToast = (message, type = 'info', duration = 4000) => {
  const id = ++toastId;
  const toast = { id, message, type, duration };
  toasts.push(toast);
  listeners.forEach(listener => listener([...toasts]));
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

const removeToast = (id) => {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach(listener => listener([...toasts]));
  }
};

export const toast = {
  success: (message, duration) => addToast(message, 'success', duration),
  error: (message, duration) => addToast(message, 'error', duration),
  warning: (message, duration) => addToast(message, 'warning', duration),
  info: (message, duration) => addToast(message, 'info', duration),
};

export default function ToastContainer() {
  const [toastList, setToastList] = useState([]);

  useEffect(() => {
    const listener = (newToasts) => {
      setToastList(newToasts);
    };
    listeners.push(listener);
    setToastList([...toasts]);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle size={20} />;
      case 'error':
        return <FiXCircle size={20} />;
      case 'warning':
        return <FiAlertCircle size={20} />;
      default:
        return <FiInfo size={20} />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d1fae5',
          borderColor: '#10b981',
          color: '#065f46',
        };
      case 'error':
        return {
          backgroundColor: '#fee2e2',
          borderColor: '#ef4444',
          color: '#991b1b',
        };
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          color: '#92400e',
        };
      default:
        return {
          backgroundColor: '#dbeafe',
          borderColor: '#3b82f6',
          color: '#1e40af',
        };
    }
  };

  return (
    <div style={containerStyles}>
      {toastList.map((toast) => {
        const toastStyles = getStyles(toast.type);
        return (
          <div
            key={toast.id}
            style={{
              ...toastStyles,
              ...toastItemStyles,
            }}
            onClick={() => removeToast(toast.id)}
          >
            <div style={toastContentStyles}>
              {getIcon(toast.type)}
              <span style={toastMessageStyles}>{toast.message}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              style={toastCloseButtonStyles}
            >
              <FiX size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const containerStyles = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 10000,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxWidth: '400px',
  pointerEvents: 'none',
};

const toastItemStyles = {
  padding: '16px 20px',
  borderRadius: '12px',
  border: '2px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
  pointerEvents: 'auto',
  animation: 'slideIn 0.3s ease-out',
};

const toastContentStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
};

const toastMessageStyles = {
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '1.5',
};

const toastCloseButtonStyles = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.7,
  transition: 'opacity 0.2s',
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  if (!document.head.querySelector('style[data-toast-animation]')) {
    style.setAttribute('data-toast-animation', 'true');
    document.head.appendChild(style);
  }
}

