import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InsightCardProps {
  type: 'tip' | 'warning' | 'achievement' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const insightConfig = {
  tip: {
    icon: 'bulb' as const,
    backgroundColor: '#FEF3C7',
    iconBg: '#F59E0B',
    titleColor: '#92400E',
    messageColor: '#78350F',
  },
  warning: {
    icon: 'warning' as const,
    backgroundColor: '#FEE2E2',
    iconBg: '#EF4444',
    titleColor: '#991B1B',
    messageColor: '#7F1D1D',
  },
  achievement: {
    icon: 'trophy' as const,
    backgroundColor: '#ECFDF5',
    iconBg: '#10B981',
    titleColor: '#065F46',
    messageColor: '#064E3B',
  },
  info: {
    icon: 'information-circle' as const,
    backgroundColor: '#EFF6FF',
    iconBg: '#3B82F6',
    titleColor: '#1E40AF',
    messageColor: '#1E3A8A',
  },
};

export default function InsightCard({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
}: InsightCardProps) {
  const config = insightConfig[type];

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
          <Ionicons name={config.icon} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>
          <Text style={[styles.message, { color: config.messageColor }]}>{message}</Text>
          {actionLabel && onAction && (
            <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
              <Text style={[styles.actionText, { color: config.iconBg }]}>
                {actionLabel}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={config.iconBg} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
          <Ionicons name="close" size={18} color={config.titleColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtn: {
    padding: 4,
  },
});
