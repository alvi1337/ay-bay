import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { categories } from '../context/TransactionContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  type: 'all' | 'income' | 'expense';
  category: string;
  status: 'all' | 'completed' | 'pending';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

const allCategories = [...new Set([...categories.income, ...categories.expense])];

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      type: 'all',
      category: 'all',
      status: 'all',
      dateRange: 'all',
    };
    setFilters(defaultFilters);
  };

  const FilterChip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('filter')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Transaction Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Type</Text>
              <View style={styles.chipContainer}>
                <FilterChip
                  label="All"
                  selected={filters.type === 'all'}
                  onPress={() => setFilters({ ...filters, type: 'all' })}
                />
                <FilterChip
                  label={t('income')}
                  selected={filters.type === 'income'}
                  onPress={() => setFilters({ ...filters, type: 'income' })}
                />
                <FilterChip
                  label={t('expense')}
                  selected={filters.type === 'expense'}
                  onPress={() => setFilters({ ...filters, type: 'expense' })}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('category')}</Text>
              <View style={styles.chipContainer}>
                <FilterChip
                  label={t('allCategories')}
                  selected={filters.category === 'all'}
                  onPress={() => setFilters({ ...filters, category: 'all' })}
                />
                {allCategories.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={t(cat)}
                    selected={filters.category === cat}
                    onPress={() => setFilters({ ...filters, category: cat })}
                  />
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.chipContainer}>
                <FilterChip
                  label="All"
                  selected={filters.status === 'all'}
                  onPress={() => setFilters({ ...filters, status: 'all' })}
                />
                <FilterChip
                  label={t('completed')}
                  selected={filters.status === 'completed'}
                  onPress={() => setFilters({ ...filters, status: 'completed' })}
                />
                <FilterChip
                  label={t('pending')}
                  selected={filters.status === 'pending'}
                  onPress={() => setFilters({ ...filters, status: 'pending' })}
                />
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('dateRange')}</Text>
              <View style={styles.chipContainer}>
                <FilterChip
                  label="All Time"
                  selected={filters.dateRange === 'all'}
                  onPress={() => setFilters({ ...filters, dateRange: 'all' })}
                />
                <FilterChip
                  label={t('today')}
                  selected={filters.dateRange === 'today'}
                  onPress={() => setFilters({ ...filters, dateRange: 'today' })}
                />
                <FilterChip
                  label={t('thisWeek')}
                  selected={filters.dateRange === 'week'}
                  onPress={() => setFilters({ ...filters, dateRange: 'week' })}
                />
                <FilterChip
                  label={t('thisMonth')}
                  selected={filters.dateRange === 'month'}
                  onPress={() => setFilters({ ...filters, dateRange: 'month' })}
                />
                <FilterChip
                  label={t('thisYear')}
                  selected={filters.dateRange === 'year'}
                  onPress={() => setFilters({ ...filters, dateRange: 'year' })}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: '#1E40AF',
  },
  chipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
