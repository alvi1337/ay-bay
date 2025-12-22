import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions, Transaction, categories } from '../context/TransactionContext';
import Header from '../components/Header';

interface AddTransactionScreenProps {
  onNavigate: (screen: string) => void;
  editTransaction?: Transaction | null;
  initialType?: 'income' | 'expense';
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

export default function AddTransactionScreen({
  onNavigate,
  editTransaction,
  initialType = 'expense',
}: AddTransactionScreenProps) {
  const { t, formatCurrency } = useLanguage();
  const { addTransaction, updateTransaction, currentBusinessId } = useTransactions();

  const [type, setType] = useState<'income' | 'expense'>(
    editTransaction?.type || initialType
  );
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [notes, setNotes] = useState(editTransaction?.notes || '');
  const [date, setDate] = useState(
    editTransaction?.date || new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'completed' | 'pending'>(
    editTransaction?.status || 'completed'
  );

  const isEditing = !!editTransaction;
  const currentCategories = type === 'income' ? categories.income : categories.expense;

  useEffect(() => {
    if (!editTransaction) {
      setCategory('');
    }
  }, [type]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      notes: notes.trim(),
      date,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status,
      businessId: currentBusinessId,
    };

    try {
      if (isEditing && editTransaction) {
        await updateTransaction(editTransaction.id, transactionData);
        Alert.alert('Success', t('transactionUpdated'));
      } else {
        await addTransaction(transactionData);
        Alert.alert('Success', t('transactionAdded'));
      }
      onNavigate('dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  };


  return (
    <View style={styles.container}>
      <Header
        showBack
        onBack={() => onNavigate('dashboard')}
        title={isEditing ? t('editTransaction') : t('addTransaction')}
        showProfile={false}
        showLanguageToggle={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'income' && styles.typeBtnIncomeActive,
              ]}
              onPress={() => setType('income')}
            >
              <Ionicons
                name="trending-up"
                size={20}
                color={type === 'income' ? '#FFFFFF' : '#10B981'}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'income' && styles.typeBtnTextActive,
                ]}
              >
                {t('income')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'expense' && styles.typeBtnExpenseActive,
              ]}
              onPress={() => setType('expense')}
            >
              <Ionicons
                name="trending-down"
                size={20}
                color={type === 'expense' ? '#FFFFFF' : '#EF4444'}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'expense' && styles.typeBtnTextActive,
                ]}
              >
                {t('expense')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>৳</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#D1D5DB"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('category')}</Text>
            <View style={styles.categoryGrid}>
              {currentCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    category === cat && styles.categoryItemActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      category === cat && styles.categoryIconActive,
                    ]}
                  >
                    <Ionicons
                      name={categoryIcons[cat] || 'ellipsis-horizontal-outline'}
                      size={22}
                      color={category === cat ? '#FFFFFF' : '#6B7280'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {t(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('description')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter description..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('date')}</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusToggle}>
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  status === 'completed' && styles.statusBtnActive,
                ]}
                onPress={() => setStatus('completed')}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={status === 'completed' ? '#FFFFFF' : '#10B981'}
                />
                <Text
                  style={[
                    styles.statusBtnText,
                    status === 'completed' && styles.statusBtnTextActive,
                  ]}
                >
                  {t('completed')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  status === 'pending' && styles.statusBtnPendingActive,
                ]}
                onPress={() => setStatus('pending')}
              >
                <Ionicons
                  name="time"
                  size={18}
                  color={status === 'pending' ? '#FFFFFF' : '#F59E0B'}
                />
                <Text
                  style={[
                    styles.statusBtnText,
                    status === 'pending' && styles.statusBtnTextActive,
                  ]}
                >
                  {t('pending')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('notes')}</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="Add notes (optional)..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => onNavigate('dashboard')}>
            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  typeToggle: {
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
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  typeBtnIncomeActive: {
    backgroundColor: '#10B981',
  },
  typeBtnExpenseActive: {
    backgroundColor: '#EF4444',
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E40AF',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 150,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    alignItems: 'center',
    width: '22%',
    paddingVertical: 12,
  },
  categoryItemActive: {},
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconActive: {
    backgroundColor: '#1E40AF',
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  statusToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  statusBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusBtnPendingActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
