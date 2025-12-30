import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

let toastId = 0;
const toasts = [];
const listeners = [];

const addToast = (message, type = 'info', duration = 3000) => {
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

  const getIconName = (type) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d1fae5',
          borderColor: '#10b981',
          iconColor: '#10b981',
          textColor: '#065f46',
        };
      case 'error':
        return {
          backgroundColor: '#fee2e2',
          borderColor: '#ef4444',
          iconColor: '#ef4444',
          textColor: '#991b1b',
        };
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          iconColor: '#f59e0b',
          textColor: '#92400e',
        };
      default:
        return {
          backgroundColor: '#dbeafe',
          borderColor: '#3b82f6',
          iconColor: '#3b82f6',
          textColor: '#1e40af',
        };
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toastList.map((toast) => {
        const toastStyles = getStyles(toast.type);
        return (
          <ToastItem
            key={toast.id}
            toast={toast}
            toastStyles={toastStyles}
            iconName={getIconName(toast.type)}
            onDismiss={() => removeToast(toast.id)}
          />
        );
      })}
    </View>
  );
}

const ToastItem = ({ toast, toastStyles, iconName, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        toastItemStyles.container,
        {
          backgroundColor: toastStyles.backgroundColor,
          borderColor: toastStyles.borderColor,
        },
      ]}
    >
      <View style={toastItemStyles.content}>
        <Ionicons name={iconName} size={20} color={toastStyles.iconColor} />
        <Text style={[toastItemStyles.message, { color: toastStyles.textColor }]}>
          {toast.message}
        </Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={toastItemStyles.closeButton}>
        <Ionicons name="close" size={16} color={toastStyles.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const toastItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    minWidth: width * 0.9,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10000,
    alignItems: 'center',
  },
});

export { ToastItem };

