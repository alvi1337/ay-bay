import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions } from '../context/TransactionContext';
import Header from '../components/Header';
import { SimpleBarChart, ProgressBar } from '../components/SimpleChart';

interface ReportsScreenProps {
  onNavigate: (screen: string) => void;
}

type ReportPeriod = 'week' | 'month' | 'year';

const chartColors = [
  '#1E40AF',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

export default function ReportsScreen({ onNavigate }: ReportsScreenProps) {
  const { t, formatCurrency } = useLanguage();
  const {
    getMonthlyIncome,
    getMonthlyExpense,
    getYearlyIncome,
    getYearlyExpense,
    getCategoryTotals,
    getMonthlyTrends,
  } = useTransactions();

  const [period, setPeriod] = useState<ReportPeriod>('month');

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpense = getMonthlyExpense();
  const yearlyIncome = getYearlyIncome();
  const yearlyExpense = getYearlyExpense();

  const monthlyProfit = monthlyIncome - monthlyExpense;
  const yearlyProfit = yearlyIncome - yearlyExpense;

  const incomeCategories = getCategoryTotals('income');
  const expenseCategories = getCategoryTotals('expense');
  const monthlyTrends = getMonthlyTrends();

  const chartData = monthlyTrends.map((item) => ({
    label: item.month,
    income: item.income,
    expense: item.expense,
  }));

  const handleExport = (format: 'pdf' | 'excel') => {
    Alert.alert(
      format === 'pdf' ? t('exportPDF') : t('exportExcel'),
      `Your ${format.toUpperCase()} report is being generated...`,
      [{ text: 'OK' }]
    );
  };

  const totalExpenseForCategories = expenseCategories.reduce((sum, c) => sum + c.total, 0);
  const totalIncomeForCategories = incomeCategories.reduce((sum, c) => sum + c.total, 0);

  return (
    <View style={styles.container}>
      <Header
        showBack
        onBack={() => onNavigate('dashboard')}
        title={t('financialReports')}
        showProfile={false}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as ReportPeriod[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {t(`this${p.charAt(0).toUpperCase() + p.slice(1)}` as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="trending-up" size={24} color="#10B981" />
              </View>
              <Text style={styles.summaryLabel}>{t('income')}</Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                {formatCurrency(period === 'year' ? yearlyIncome : monthlyIncome)}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.expenseCard]}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="trending-down" size={24} color="#EF4444" />
              </View>
              <Text style={styles.summaryLabel}>{t('expense')}</Text>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                {formatCurrency(period === 'year' ? yearlyExpense : monthlyExpense)}
              </Text>
            </View>
          </View>

          {/* Profit/Loss Card */}
          <View
            style={[
              styles.profitCard,
              {
                backgroundColor:
                  (period === 'year' ? yearlyProfit : monthlyProfit) >= 0
                    ? '#ECFDF5'
                    : '#FEF2F2',
              },
            ]}
          >
            <View style={styles.profitHeader}>
              <Text style={styles.profitLabel}>{t('profitLoss')}</Text>
              <View
                style={[
                  styles.profitBadge,
                  {
                    backgroundColor:
                      (period === 'year' ? yearlyProfit : monthlyProfit) >= 0
                        ? '#10B981'
                        : '#EF4444',
                  },
                ]}
              >
                <Ionicons
                  name={
                    (period === 'year' ? yearlyProfit : monthlyProfit) >= 0
                      ? 'arrow-up'
                      : 'arrow-down'
                  }
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.profitBadgeText}>
                  {(period === 'year' ? yearlyProfit : monthlyProfit) >= 0
                    ? t('profit')
                    : t('loss')}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.profitValue,
                {
                  color:
                    (period === 'year' ? yearlyProfit : monthlyProfit) >= 0
                      ? '#10B981'
                      : '#EF4444',
                },
              ]}
            >
              {formatCurrency(Math.abs(period === 'year' ? yearlyProfit : monthlyProfit))}
            </Text>
          </View>
        </View>

        {/* Monthly Trends Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{t('trends')}</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={chartData} height={200} />
          </View>
        </View>

        {/* Expense Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>{t('expenseReport')}</Text>
          <View style={styles.breakdownCard}>
            {expenseCategories.length > 0 ? (
              expenseCategories.slice(0, 6).map((item, index) => (
                <ProgressBar
                  key={item.category}
                  label={t(item.category)}
                  value={item.total}
                  maxValue={totalExpenseForCategories}
                  color={chartColors[index % chartColors.length]}
                  formatAmount={formatCurrency}
                />
              ))
            ) : (
              <Text style={styles.noDataText}>No expense data available</Text>
            )}
          </View>
        </View>

        {/* Income Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>{t('incomeReport')}</Text>
          <View style={styles.breakdownCard}>
            {incomeCategories.length > 0 ? (
              incomeCategories.slice(0, 6).map((item, index) => (
                <ProgressBar
                  key={item.category}
                  label={t(item.category)}
                  value={item.total}
                  maxValue={totalIncomeForCategories}
                  color={chartColors[index % chartColors.length]}
                  formatAmount={formatCurrency}
                />
              ))
            ) : (
              <Text style={styles.noDataText}>No income data available</Text>
            )}
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.exportSection}>
          <Text style={styles.sectionTitle}>Export Reports</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => handleExport('pdf')}
            >
              <View style={[styles.exportIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="document-text" size={24} color="#EF4444" />
              </View>
              <Text style={styles.exportBtnText}>{t('exportPDF')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => handleExport('excel')}
            >
              <View style={[styles.exportIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="grid" size={24} color="#10B981" />
              </View>
              <Text style={styles.exportBtnText}>{t('exportExcel')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: '#1E40AF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  summarySection: {
    paddingHorizontal: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  profitCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  profitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profitLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  profitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  profitBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profitValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  chartSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  exportSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bottomPadding: {
    height: 100,
  },
});
