import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
  size?: 'small' | 'large';
}

export default function MetricCard({
  title,
  value,
  icon,
  iconColor,
  backgroundColor,
  trend,
  onPress,
  size = 'small',
}: MetricCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        size === 'large' && styles.largeCard,
        { backgroundColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconBg, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon} size={size === 'large' ? 28 : 22} color={iconColor} />
        </View>
      </View>
      
      <Text style={[styles.title, size === 'large' && styles.largeTitle]} numberOfLines={1}>
        {title}
      </Text>
      
      <Text style={[styles.value, size === 'large' && styles.largeValue]} numberOfLines={1}>
        {value}
      </Text>
      
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend.isPositive ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend.isPositive ? '#10B981' : '#EF4444'}
          />
          <Text
            style={[
              styles.trendText,
              { color: trend.isPositive ? '#10B981' : '#EF4444' },
            ]}
          >
            {trend.value}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    minWidth: 150,
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  largeCard: {
    padding: 20,
    minWidth: '100%',
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  largeTitle: {
    fontSize: 14,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  largeValue: {
    fontSize: 24,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
