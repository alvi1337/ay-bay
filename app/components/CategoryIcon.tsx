import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryIconProps {
  category: string;
  type: 'income' | 'expense';
  size?: 'small' | 'medium' | 'large';
}

const categoryConfig: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  // Income categories
  sales: { icon: 'cart', color: '#10B981' },
  salary: { icon: 'wallet', color: '#3B82F6' },
  investment: { icon: 'trending-up', color: '#8B5CF6' },
  refund: { icon: 'refresh', color: '#06B6D4' },
  
  // Expense categories
  purchases: { icon: 'bag', color: '#F59E0B' },
  rent: { icon: 'home', color: '#EF4444' },
  utilities: { icon: 'flash', color: '#F97316' },
  marketing: { icon: 'megaphone', color: '#EC4899' },
  tax: { icon: 'document-text', color: '#6366F1' },
  transport: { icon: 'car', color: '#14B8A6' },
  food: { icon: 'restaurant', color: '#F43F5E' },
  entertainment: { icon: 'game-controller', color: '#A855F7' },
  healthcare: { icon: 'medkit', color: '#EF4444' },
  education: { icon: 'school', color: '#3B82F6' },
  
  // Default
  other: { icon: 'ellipsis-horizontal', color: '#6B7280' },
};

const sizeConfig = {
  small: { container: 32, icon: 16 },
  medium: { container: 44, icon: 22 },
  large: { container: 56, icon: 28 },
};

export default function CategoryIcon({ category, type, size = 'medium' }: CategoryIconProps) {
  const config = categoryConfig[category] || categoryConfig.other;
  const dimensions = sizeConfig[size];
  
  const backgroundColor = type === 'income' ? '#ECFDF5' : '#FEF2F2';
  const iconColor = type === 'income' ? '#10B981' : config.color;

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.container / 3,
          backgroundColor,
        },
      ]}
    >
      <Ionicons name={config.icon} size={dimensions.icon} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
