import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface NavItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const navItems: NavItem[] = [
  { key: 'dashboard', icon: 'grid-outline', iconActive: 'grid', labelKey: 'dashboard' },
  { key: 'transactions', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal', labelKey: 'transactions' },
  { key: 'add', icon: 'add-circle-outline', iconActive: 'add-circle', labelKey: 'addTransaction' },
  { key: 'reports', icon: 'bar-chart-outline', iconActive: 'bar-chart', labelKey: 'reports' },
  { key: 'settings', icon: 'settings-outline', iconActive: 'settings', labelKey: 'settings' },
];

export default function BottomNavigation({ activeTab, onTabPress }: BottomNavigationProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        const isAddButton = item.key === 'add';

        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItem, isAddButton && styles.addButtonContainer]}
            onPress={() => onTabPress(item.key)}
            activeOpacity={0.7}
          >
            {isAddButton ? (
              <View style={styles.addButton}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
            ) : (
              <>
                <Ionicons
                  name={isActive ? item.iconActive : item.icon}
                  size={24}
                  color={isActive ? '#1E40AF' : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                  ]}
                >
                  {t(item.labelKey)}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    position: 'relative',
  },
  addButtonContainer: {
    marginTop: -30,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  labelActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E40AF',
  },
});
