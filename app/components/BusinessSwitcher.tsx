import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions, Business } from '../context/TransactionContext';
import { useLanguage } from '../context/LanguageContext';

interface BusinessSwitcherProps {
  visible: boolean;
  onClose: () => void;
  onAddBusiness: () => void;
}

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/6949145e771bf6dd0007c3e0_1766397126688_a5d04e03.jpg';

export default function BusinessSwitcher({
  visible,
  onClose,
  onAddBusiness,
}: BusinessSwitcherProps) {
  const { t } = useLanguage();
  const { businesses, currentBusinessId, setCurrentBusiness } = useTransactions();

  const handleSelect = (businessId: string) => {
    setCurrentBusiness(businessId);
    onClose();
  };

  const BusinessItem = ({ business, isActive }: { business: Business; isActive: boolean }) => (
    <TouchableOpacity
      style={[styles.businessItem, isActive && styles.businessItemActive]}
      onPress={() => handleSelect(business.id)}
    >
      <Image source={{ uri: LOGO_URL }} style={styles.businessLogo} />
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{business.name}</Text>
        <Text style={styles.businessOwner}>{business.ownerName}</Text>
      </View>
      {isActive && (
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('switchBusiness')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {businesses.map((business) => (
              <BusinessItem
                key={business.id}
                business={business}
                isActive={business.id === currentBusinessId}
              />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.addBtn} onPress={onAddBusiness}>
            <Ionicons name="add-circle" size={22} color="#1E40AF" />
            <Text style={styles.addBtnText}>{t('addBusiness')}</Text>
          </TouchableOpacity>
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
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: 16,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  businessItemActive: {
    borderColor: '#1E40AF',
    backgroundColor: '#EEF2FF',
  },
  businessLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 14,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  businessOwner: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E40AF',
    borderStyle: 'dashed',
    gap: 8,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
});
