import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions, Transaction } from '../context/TransactionContext';
import Header from '../components/Header';
import TransactionItem from '../components/TransactionItem';
import FilterModal, { FilterState } from '../components/FilterModal';

interface TransactionsScreenProps {
  onNavigate: (screen: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export default function TransactionsScreen({
  onNavigate,
  onEditTransaction,
}: TransactionsScreenProps) {
  const { t, formatCurrency } = useLanguage();
  const { getFilteredTransactions, deleteTransaction } = useTransactions();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: 'all',
    status: 'all',
    dateRange: 'all',
  });

  const getDateRange = (range: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        return { dateFrom: todayStr, dateTo: todayStr };
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { dateFrom: weekAgo.toISOString().split('T')[0], dateTo: todayStr };
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { dateFrom: monthStart.toISOString().split('T')[0], dateTo: todayStr };
      }
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return { dateFrom: yearStart.toISOString().split('T')[0], dateTo: todayStr };
      }
      default:
        return {};
    }
  };

  const filteredTransactions = useMemo(() => {
    const dateRange = getDateRange(filters.dateRange);
    return getFilteredTransactions({
      type: filters.type === 'all' ? undefined : filters.type,
      category: filters.category === 'all' ? undefined : filters.category,
      status: filters.status === 'all' ? undefined : filters.status,
      search: searchQuery,
      ...dateRange,
    });
  }, [filters, searchQuery, getFilteredTransactions]);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = (id: string) => {
    Alert.alert(
      t('delete'),
      t('confirmDelete'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  const activeFiltersCount = [
    filters.type !== 'all',
    filters.category !== 'all',
    filters.status !== 'all',
    filters.dateRange !== 'all',
  ].filter(Boolean).length;

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => onEditTransaction(item)}
      onEdit={() => onEditTransaction(item)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const ListHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <Ionicons name="trending-up" size={20} color="#10B981" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>{t('income')}</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
      </View>
      <View style={styles.summaryCard}>
        <Ionicons name="trending-down" size={20} color="#EF4444" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>{t('expense')}</Text>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
            {formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        showBack
        onBack={() => onNavigate('dashboard')}
        title={t('allTransactions')}
        showProfile={false}
      />

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="options"
            size={20}
            color={activeFiltersCount > 0 ? '#FFFFFF' : '#6B7280'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Type Filter Tabs */}
      <View style={styles.tabsContainer}>
        {(['all', 'income', 'expense'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tab, filters.type === type && styles.tabActive]}
            onPress={() => setFilters({ ...filters, type })}
          >
            <Text
              style={[styles.tabText, filters.type === type && styles.tabTextActive]}
            >
              {type === 'all' ? 'All' : t(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 8,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBtnActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryInfo: {
    marginLeft: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
