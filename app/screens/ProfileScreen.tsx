import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions, Business } from '../context/TransactionContext';
import Header from '../components/Header';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/6949145e771bf6dd0007c3e0_1766397126688_a5d04e03.jpg';

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { t } = useLanguage();
  const {
    businesses,
    currentBusinessId,
    setCurrentBusiness,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    transactions,
  } = useTransactions();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
  });

  const currentBusiness = businesses.find((b) => b.id === currentBusinessId);
  const transactionCount = transactions.filter(t => t.businessId === currentBusinessId).length;

  const handleAddBusiness = async () => {
    if (!newBusiness.name.trim()) {
      Alert.alert('Error', 'Please enter a business name');
      return;
    }
    if (!newBusiness.ownerName.trim()) {
      Alert.alert('Error', 'Please enter owner name');
      return;
    }

    await addBusiness(newBusiness);
    setNewBusiness({ name: '', ownerName: '', phone: '', email: '', address: '' });
    setShowAddForm(false);
    Alert.alert('Success', 'Business added successfully!');
  };

  const handleUpdateBusiness = async () => {
    if (!editingBusiness) return;
    
    await updateBusiness(editingBusiness.id, {
      name: newBusiness.name,
      ownerName: newBusiness.ownerName,
      phone: newBusiness.phone,
      email: newBusiness.email,
      address: newBusiness.address,
    });
    
    setEditingBusiness(null);
    setNewBusiness({ name: '', ownerName: '', phone: '', email: '', address: '' });
    Alert.alert('Success', 'Business updated successfully!');
  };

  const handleDeleteBusiness = (business: Business) => {
    if (businesses.length <= 1) {
      Alert.alert('Error', 'You must have at least one business.');
      return;
    }

    Alert.alert(
      'Delete Business',
      `Are you sure you want to delete "${business.name}"? This will also delete all associated transactions.`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteBusiness(business.id);
            Alert.alert('Success', 'Business deleted successfully!');
          },
        },
      ]
    );
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setNewBusiness({
      name: business.name,
      ownerName: business.ownerName,
      phone: business.phone,
      email: business.email,
      address: business.address,
    });
    setShowAddForm(true);
  };

  const handleSwitchBusiness = async (businessId: string) => {
    await setCurrentBusiness(businessId);
    Alert.alert('Success', 'Business switched successfully!');
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingBusiness(null);
    setNewBusiness({ name: '', ownerName: '', phone: '', email: '', address: '' });
  };

  const BusinessCard = ({ business, isActive }: { business: Business; isActive: boolean }) => (
    <View style={[styles.businessCard, isActive && styles.businessCardActive]}>
      <TouchableOpacity
        style={styles.businessCardContent}
        onPress={() => handleSwitchBusiness(business.id)}
      >
        <View style={styles.businessHeader}>
          <Image source={{ uri: LOGO_URL }} style={styles.businessLogo} />
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{business.name}</Text>
            <Text style={styles.businessOwner}>{business.ownerName}</Text>
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          )}
        </View>
        <View style={styles.businessDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{business.phone || 'Not set'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{business.email || 'Not set'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={2}>
              {business.address || 'Not set'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.businessActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEditBusiness(business)}
        >
          <Ionicons name="pencil-outline" size={18} color="#1E40AF" />
          <Text style={styles.actionBtnText}>{t('edit')}</Text>
        </TouchableOpacity>
        {businesses.length > 1 && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteBusiness(business)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>{t('delete')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        showBack
        onBack={() => onNavigate('dashboard')}
        title={t('businessProfile')}
        showProfile={false}
        showLanguageToggle={false}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Business */}
        {currentBusiness && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Business</Text>
            <BusinessCard business={currentBusiness} isActive={true} />
          </View>
        )}

        {/* All Businesses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Businesses</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                if (showAddForm) {
                  handleCancelForm();
                } else {
                  setShowAddForm(true);
                }
              }}
            >
              <Ionicons
                name={showAddForm ? 'close' : 'add'}
                size={20}
                color="#1E40AF"
              />
              <Text style={styles.addBtnText}>
                {showAddForm ? 'Cancel' : t('addBusiness')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add/Edit Business Form */}
          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>
                {editingBusiness ? 'Edit Business' : 'Add New Business'}
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('businessName')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter business name"
                  placeholderTextColor="#9CA3AF"
                  value={newBusiness.name}
                  onChangeText={(text) => setNewBusiness({ ...newBusiness, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('ownerName')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter owner name"
                  placeholderTextColor="#9CA3AF"
                  value={newBusiness.ownerName}
                  onChangeText={(text) => setNewBusiness({ ...newBusiness, ownerName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('phone')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+880 1XXX-XXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={newBusiness.phone}
                  onChangeText={(text) => setNewBusiness({ ...newBusiness, phone: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newBusiness.email}
                  onChangeText={(text) => setNewBusiness({ ...newBusiness, email: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('address')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter business address"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={newBusiness.address}
                  onChangeText={(text) => setNewBusiness({ ...newBusiness, address: text })}
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelFormBtn} onPress={handleCancelForm}>
                  <Text style={styles.cancelFormBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={editingBusiness ? handleUpdateBusiness : handleAddBusiness}
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Business List */}
          {!showAddForm && businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              isActive={business.id === currentBusinessId}
            />
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{businesses.length}</Text>
              <Text style={styles.statLabel}>Total Businesses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{transactionCount}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentBusiness?.createdAt 
                  ? Math.floor((Date.now() - new Date(currentBusiness.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
                  : 0}
              </Text>
              <Text style={styles.statLabel}>Months Active</Text>
            </View>
          </View>
        </View>

        {/* Data Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#1E40AF" />
            <Text style={styles.infoText}>
              All your business data is automatically saved locally on your device. 
              Use the backup feature in Settings to create a backup of your data.
            </Text>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  businessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  businessCardActive: {
    borderColor: '#1E40AF',
  },
  businessCardContent: {
    padding: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  businessOwner: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  activeBadge: {
    padding: 4,
  },
  businessDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
  businessActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  deleteBtn: {
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelFormBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelFormBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});
