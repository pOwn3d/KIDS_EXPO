import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onHide,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide après duration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#10B981', icon: 'checkmark-circle' };
      case 'error':
        return { bg: '#EF4444', icon: 'close-circle' };
      case 'warning':
        return { bg: '#F59E0B', icon: 'warning' };
      case 'info':
      default:
        return { bg: '#3B82F6', icon: 'information-circle' };
    }
  };

  const { bg, icon } = getColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={icon as any} size={24} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 20,
    right: 20,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

// Hook pour utiliser le Toast
export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
};