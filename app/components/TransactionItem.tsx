import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../context/TransactionContext';
import { useLanguage } from '../context/LanguageContext';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  sales: 'cart-outline',
  purchases: 'bag-outline',
  salary: 'wallet-outline',
  rent: 'home-outline',
  utilities: 'flash-outline',
  marketing: 'megaphone-outline',
  tax: 'document-text-outline',
  transport: 'car-outline',
  food: 'restaurant-outline',
  entertainment: 'game-controller-outline',
  healthcare: 'medkit-outline',
  education: 'school-outline',
  investment: 'trending-up-outline',
  refund: 'refresh-outline',
  other: 'ellipsis-horizontal-outline',
};

export default function TransactionItem({
  transaction,
  onPress,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const { t, formatCurrency } = useLanguage();
  const isIncome = transaction.type === 'income';
  const iconName = categoryIcons[transaction.category] || 'ellipsis-horizontal-outline';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return t('today');
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return t('yesterday');
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isIncome ? '#ECFDF5' : '#FEF2F2' },
          ]}
        >
          <Ionicons
            name={iconName}
            size={22}
            color={isIncome ? '#10B981' : '#EF4444'}
          />
        </View>
        
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{t(transaction.category)}</Text>
            <View style={styles.dot} />
            <Text style={styles.date}>{formatDate(transaction.date)}</Text>
            {transaction.status === 'pending' && (
              <>
                <View style={styles.dot} />
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{t('pending')}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? '#10B981' : '#EF4444' },
          ]}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  actionBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
