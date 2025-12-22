import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useTransactions } from '../context/TransactionContext';
import Header from '../components/Header';

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  loading?: boolean;
}

function SettingItem({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = true,
  loading = false,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress || loading}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#1E40AF" />
      ) : (
        rightElement || (showArrow && onPress && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        ))
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { 
    settings, 
    updateSettings, 
    createBackup, 
    restoreBackup, 
    getBackupInfo,
    getStorageInfo,
  } = useSettings();
  const { clearAllData, refreshData } = useTransactions();

  const [backupInfo, setBackupInfo] = useState<{ exists: boolean; date: string | null; size: string }>({
    exists: false,
    date: null,
    size: '0 KB',
  });
  const [storageInfo, setStorageInfo] = useState<{ totalKeys: number; totalSizeKB: number }>({
    totalKeys: 0,
    totalSizeKB: 0,
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const backup = await getBackupInfo();
    setBackupInfo(backup);
    const storage = await getStorageInfo();
    setStorageInfo(storage);
  };

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    await updateSettings({ language: newLang });
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await updateSettings({ notifications: value });
  };

  const handleAutoBackupToggle = async (value: boolean) => {
    await updateSettings({ autoBackup: value });
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await createBackup();
      Alert.alert(
        result.success ? 'Success' : 'Error',
        result.message
      );
      if (result.success) {
        await loadInfo();
      }
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!backupInfo.exists) {
      Alert.alert('No Backup', 'No backup found to restore.');
      return;
    }

    Alert.alert(
      'Restore Backup',
      `This will restore data from backup created on ${backupInfo.date ? new Date(backupInfo.date).toLocaleDateString() : 'unknown date'}. Current data will be replaced. Continue?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsRestoring(true);
            try {
              const result = await restoreBackup();
              Alert.alert(
                result.success ? 'Success' : 'Error',
                result.message
              );
              if (result.success) {
                await refreshData();
              }
            } finally {
              setIsRestoring(false);
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions, businesses, and settings. This action cannot be undone. Are you sure?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been cleared.');
            await loadInfo();
          },
        },
      ]
    );
  };

  const handlePinSetup = () => {
    Alert.alert(
      t('pinLock'),
      'Set up a 4-digit PIN to secure your app.',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: 'Set PIN', 
          onPress: async () => {
            await updateSettings({ pinEnabled: true });
            Alert.alert('Success', 'PIN has been enabled!');
          } 
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to logout?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      t('rateApp'),
      'Thank you for using AY BAY! Would you like to rate us on the Play Store?',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Rate Now', onPress: () => {} },
      ]
    );
  };

  const formatBackupDate = () => {
    if (!backupInfo.date) return 'No backup yet';
    return new Date(backupInfo.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onBack={() => onNavigate('dashboard')}
        title={t('appSettings')}
        showProfile={false}
        showLanguageToggle={false}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="language"
              iconColor="#1E40AF"
              iconBg="#EEF2FF"
              title={t('language')}
              subtitle={language === 'en' ? 'English' : 'বাংলা'}
              onPress={handleLanguageToggle}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="moon"
              iconColor="#8B5CF6"
              iconBg="#F5F3FF"
              title={t('darkMode')}
              subtitle="Coming soon"
              showArrow={false}
              rightElement={
                <Switch
                  value={settings.theme === 'dark'}
                  onValueChange={() => {}}
                  trackColor={{ false: '#E5E7EB', true: '#1E40AF' }}
                  thumbColor="#FFFFFF"
                  disabled
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon="notifications"
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
              title={t('notifications')}
              showArrow={false}
              rightElement={
                <Switch
                  value={settings.notifications}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: '#E5E7EB', true: '#1E40AF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* Data & Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Backup</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="cloud-upload"
              iconColor="#3B82F6"
              iconBg="#DBEAFE"
              title="Create Backup"
              subtitle={`Last: ${formatBackupDate()}`}
              onPress={handleBackup}
              loading={isBackingUp}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="cloud-download"
              iconColor="#10B981"
              iconBg="#D1FAE5"
              title="Restore Backup"
              subtitle={backupInfo.exists ? `Size: ${backupInfo.size}` : 'No backup available'}
              onPress={handleRestore}
              loading={isRestoring}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="sync"
              iconColor="#8B5CF6"
              iconBg="#F5F3FF"
              title="Auto Backup"
              subtitle={settings.autoBackup ? `Every ${settings.backupFrequency}` : 'Disabled'}
              showArrow={false}
              rightElement={
                <Switch
                  value={settings.autoBackup}
                  onValueChange={handleAutoBackupToggle}
                  trackColor={{ false: '#E5E7EB', true: '#1E40AF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon="server"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              title="Storage Used"
              subtitle={`${storageInfo.totalSizeKB.toFixed(2)} KB (${storageInfo.totalKeys} items)`}
              showArrow={false}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('security')}</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="keypad"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title={t('pinLock')}
              subtitle={settings.pinEnabled ? 'Enabled' : 'Set up a 4-digit PIN'}
              onPress={handlePinSetup}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="finger-print"
              iconColor="#10B981"
              iconBg="#D1FAE5"
              title={t('biometric')}
              subtitle="Use fingerprint to unlock"
              showArrow={false}
              rightElement={
                <Switch
                  value={settings.biometricEnabled}
                  onValueChange={(value) => updateSettings({ biometricEnabled: value })}
                  trackColor={{ false: '#E5E7EB', true: '#1E40AF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* Business Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="business"
              iconColor="#8B5CF6"
              iconBg="#F5F3FF"
              title={t('businessProfile')}
              subtitle="Manage your businesses"
              onPress={() => onNavigate('profile')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="star"
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
              title={t('rateApp')}
              subtitle="Rate us on Play Store"
              onPress={handleRateApp}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="share-social"
              iconColor="#10B981"
              iconBg="#D1FAE5"
              title={t('shareApp')}
              subtitle="Share with friends"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              title={t('privacyPolicy')}
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              title={t('termsOfService')}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="information-circle"
              iconColor="#1E40AF"
              iconBg="#EEF2FF"
              title={t('version')}
              subtitle="1.0.0"
              showArrow={false}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="trash"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Clear All Data"
              subtitle="Delete all transactions and settings"
              onPress={handleClearData}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 74,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 100,
  },
});
