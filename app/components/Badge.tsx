import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'small' | 'medium';
}

const variantStyles = {
  success: {
    backgroundColor: '#ECFDF5',
    textColor: '#065F46',
  },
  warning: {
    backgroundColor: '#FEF3C7',
    textColor: '#92400E',
  },
  error: {
    backgroundColor: '#FEE2E2',
    textColor: '#991B1B',
  },
  info: {
    backgroundColor: '#DBEAFE',
    textColor: '#1E40AF',
  },
  neutral: {
    backgroundColor: '#F3F4F6',
    textColor: '#4B5563',
  },
};

export default function Badge({ text, variant = 'neutral', size = 'medium' }: BadgeProps) {
  const style = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.backgroundColor },
        size === 'small' && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: style.textColor },
          size === 'small' && styles.textSmall,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});
