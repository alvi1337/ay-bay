import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions } from '../context/TransactionContext';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  showLanguageToggle?: boolean;
  showProfile?: boolean;
  onProfilePress?: () => void;
}

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/6949145e771bf6dd0007c3e0_1766397126688_a5d04e03.jpg';

export default function Header({
  showBack = false,
  onBack,
  title,
  showLanguageToggle = true,
  showProfile = true,
  onProfilePress,
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { businesses, currentBusinessId } = useTransactions();
  
  const currentBusiness = businesses.find((b) => b.id === currentBusinessId);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Image source={{ uri: LOGO_URL }} style={styles.logo} />
            <View style={styles.brandInfo}>
              <Text style={styles.appName}>{t('appName')}</Text>
              {currentBusiness && (
                <Text style={styles.businessName} numberOfLines={1}>
                  {currentBusiness.name}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.rightSection}>
        {showLanguageToggle && (
          <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
            <Text style={styles.langText}>
              {language === 'en' ? 'বাং' : 'EN'}
            </Text>
          </TouchableOpacity>
        )}
        
        {showProfile && (
          <TouchableOpacity style={styles.profileBtn} onPress={onProfilePress}>
            <Ionicons name="person-circle-outline" size={32} color="#1E40AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 10,
  },
  brandInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  businessName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  profileBtn: {
    padding: 4,
  },
});
