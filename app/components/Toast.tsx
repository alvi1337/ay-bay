import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onHide: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: 'checkmark-circle' as const,
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    iconColor: '#10B981',
    textColor: '#065F46',
  },
  error: {
    icon: 'close-circle' as const,
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    iconColor: '#EF4444',
    textColor: '#991B1B',
  },
  info: {
    icon: 'information-circle' as const,
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    iconColor: '#3B82F6',
    textColor: '#1E40AF',
  },
  warning: {
    icon: 'warning' as const,
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    iconColor: '#F59E0B',
    textColor: '#92400E',
  },
};

export default function Toast({
  visible,
  message,
  type,
  onHide,
  duration = 3000,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const config = toastConfig[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name={config.icon} size={24} color={config.iconColor} />
      <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
