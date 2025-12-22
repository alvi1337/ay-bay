import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface AmountDisplayProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  showSign?: boolean;
}

export default function AmountDisplay({
  amount,
  type = 'neutral',
  size = 'medium',
  showSign = true,
}: AmountDisplayProps) {
  const { formatCurrency } = useLanguage();

  const getColor = () => {
    switch (type) {
      case 'income':
        return '#10B981';
      case 'expense':
        return '#EF4444';
      default:
        return '#1F2937';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 28;
      default:
        return 18;
    }
  };

  const getSign = () => {
    if (!showSign) return '';
    if (type === 'income') return '+';
    if (type === 'expense') return '-';
    return '';
  };

  return (
    <Text
      style={[
        styles.amount,
        {
          color: getColor(),
          fontSize: getFontSize(),
        },
      ]}
    >
      {getSign()}{formatCurrency(Math.abs(amount))}
    </Text>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontWeight: '700',
  },
});
