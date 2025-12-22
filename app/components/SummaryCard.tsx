import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface SummaryCardProps {
  income: number;
  expense: number;
  period: string;
}

export default function SummaryCard({ income, expense, period }: SummaryCardProps) {
  const { formatCurrency, t } = useLanguage();
  const profit = income - expense;
  const isProfit = profit >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.period}>{period}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isProfit ? '#ECFDF5' : '#FEF2F2' },
          ]}
        >
          <Ionicons
            name={isProfit ? 'trending-up' : 'trending-down'}
            size={14}
            color={isProfit ? '#10B981' : '#EF4444'}
          />
          <Text
            style={[
              styles.statusText,
              { color: isProfit ? '#10B981' : '#EF4444' },
            ]}
          >
            {isProfit ? t('profit') : t('loss')}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <View style={styles.metricHeader}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.metricLabel}>{t('income')}</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>
            {formatCurrency(income)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <View style={styles.metricHeader}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.metricLabel}>{t('expense')}</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#EF4444' }]}>
            {formatCurrency(expense)}
          </Text>
        </View>
      </View>

      <View style={styles.profitSection}>
        <Text style={styles.profitLabel}>Net {isProfit ? t('profit') : t('loss')}</Text>
        <Text
          style={[
            styles.profitValue,
            { color: isProfit ? '#10B981' : '#EF4444' },
          ]}
        >
          {formatCurrency(Math.abs(profit))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  period: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  profitSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  profitValue: {
    fontSize: 24,
    fontWeight: '800',
  },
});
