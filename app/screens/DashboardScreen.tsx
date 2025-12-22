import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions } from '../context/TransactionContext';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import QuickActionButton from '../components/QuickActionButton';
import TransactionItem from '../components/TransactionItem';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
  onAddTransaction: (type: 'income' | 'expense') => void;
}

export default function DashboardScreen({ onNavigate, onAddTransaction }: DashboardScreenProps) {
  const { t, formatCurrency, language } = useLanguage();
  const {
    getTodayIncome,
    getTodayExpense,
    getMonthlyIncome,
    getMonthlyExpense,
    getYearlyIncome,
    getTotalBalance,
    getPendingCount,
    getFilteredTransactions,
  } = useTransactions();

  const [refreshing, setRefreshing] = React.useState(false);

  const todayIncome = getTodayIncome();
  const todayExpense = getTodayExpense();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpense = getMonthlyExpense();
  const monthlyProfit = monthlyIncome - monthlyExpense;
  const yearlyRevenue = getYearlyIncome();
  const totalBalance = getTotalBalance();
  const pendingCount = getPendingCount();

  const recentTransactions = getFilteredTransactions({ type: 'all' }).slice(0, 5);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const quickActions = [
    {
      icon: 'add-circle' as const,
      label: t('income'),
      color: '#10B981',
      backgroundColor: '#ECFDF5',
      onPress: () => onAddTransaction('income'),
    },
    {
      icon: 'remove-circle' as const,
      label: t('expense'),
      color: '#EF4444',
      backgroundColor: '#FEF2F2',
      onPress: () => onAddTransaction('expense'),
    },
    {
      icon: 'document-text' as const,
      label: t('reports'),
      color: '#8B5CF6',
      backgroundColor: '#F5F3FF',
      onPress: () => onNavigate('reports'),
    },
    {
      icon: 'swap-horizontal' as const,
      label: t('transactions'),
      color: '#3B82F6',
      backgroundColor: '#EFF6FF',
      onPress: () => onNavigate('transactions'),
    },
  ];

  // Format date based on language
  const formatDate = () => {
    const date = new Date();
    if (language === 'bn') {
      const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const bengaliDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const toBengaliNum = (n: number) => n.toString().replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
      return `${bengaliDays[date.getDay()]}, ${toBengaliNum(date.getDate())} ${bengaliMonths[date.getMonth()]} ${toBengaliNum(date.getFullYear())}`;
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => onNavigate('profile')} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E40AF']} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t('welcomeBack')}</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>

        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceGradient}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>{t('totalBalance')}</Text>
              <View style={styles.balanceIconContainer}>
                <Ionicons name="wallet" size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
            <View style={styles.balanceFooter}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: totalBalance >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
                ]}
              >
                <Ionicons
                  name={totalBalance >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={totalBalance >= 0 ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: totalBalance >= 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {totalBalance >= 0 ? t('profit') : t('loss')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('todayOverview')}</Text>
          <View style={styles.metricsRow}>
            <MetricCard
              title={t('todayIncome')}
              value={formatCurrency(todayIncome)}
              icon="trending-up"
              iconColor="#10B981"
              backgroundColor="#FFFFFF"
              trend={{ value: 12, isPositive: true }}
            />
            <MetricCard
              title={t('todayExpense')}
              value={formatCurrency(todayExpense)}
              icon="trending-down"
              iconColor="#EF4444"
              backgroundColor="#FFFFFF"
              trend={{ value: 5, isPositive: false }}
            />
          </View>
        </View>

        {/* Monthly & Yearly Stats */}
        <View style={styles.section}>
          <View style={styles.metricsRow}>
            <MetricCard
              title={monthlyProfit >= 0 ? t('monthlyProfit') : t('monthlyLoss')}
              value={formatCurrency(Math.abs(monthlyProfit))}
              icon={monthlyProfit >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
              iconColor={monthlyProfit >= 0 ? '#10B981' : '#EF4444'}
              backgroundColor="#FFFFFF"
            />
            <MetricCard
              title={t('yearlyRevenue')}
              value={formatCurrency(yearlyRevenue)}
              icon="calendar"
              iconColor="#8B5CF6"
              backgroundColor="#FFFFFF"
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              title={t('pendingTransactions')}
              value={pendingCount.toString()}
              icon="time"
              iconColor="#F59E0B"
              backgroundColor="#FFFFFF"
              onPress={() => onNavigate('transactions')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                icon={action.icon}
                label={action.label}
                color={action.color}
                backgroundColor={action.backgroundColor}
                onPress={action.onPress}
              />
            ))}
          </View>
        </View>

        {/* Financial Insight */}
        <View style={styles.section}>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>
                {language === 'en' ? 'Financial Tip' : 'আর্থিক টিপস'}
              </Text>
              <Text style={styles.insightText}>
                {language === 'en' 
                  ? 'Track your daily expenses to identify spending patterns and save more!'
                  : 'আপনার দৈনিক খরচ ট্র্যাক করুন এবং আরও সঞ্চয় করুন!'}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
            <TouchableOpacity onPress={() => onNavigate('transactions')}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => {}}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
            <Text style={styles.emptySubtext}>{t('addFirstTransaction')}</Text>
            <TouchableOpacity 
              style={styles.addFirstBtn}
              onPress={() => onAddTransaction('income')}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addFirstBtnText}>{t('addTransaction')}</Text>
            </TouchableOpacity>
          </View>
        )}

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
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  balanceGradient: {
    backgroundColor: '#1E40AF',
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginVertical: 8,
  },
  balanceFooter: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 12,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 4,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 16,
  },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  addFirstBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 100,
  },
});
