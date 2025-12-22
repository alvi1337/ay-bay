import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Text } from 'react-native';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { TransactionProvider, Transaction, useTransactions } from './context/TransactionContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import BottomNavigation from './components/BottomNavigation';
import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';

type Screen = 'dashboard' | 'transactions' | 'add' | 'reports' | 'settings' | 'profile';

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1E40AF" />
      <Text style={styles.loadingText}>Loading AY BAY...</Text>
    </View>
  );
}

function MainAppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [addTransactionType, setAddTransactionType] = useState<'income' | 'expense'>('expense');
  
  const { isLoading: transactionsLoading, isInitialized } = useTransactions();
  const { isLoading: settingsLoading, settings } = useSettings();
  const { setLanguage } = useLanguage();

  // Sync language from settings
  useEffect(() => {
    if (settings.language) {
      setLanguage(settings.language);
    }
  }, [settings.language]);

  const isLoading = transactionsLoading || settingsLoading || !isInitialized;

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
    if (screen !== 'add') {
      setEditTransaction(null);
    }
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'add') {
      setEditTransaction(null);
      setAddTransactionType('expense');
    }
    setCurrentScreen(tab as Screen);
  };

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setAddTransactionType(type);
    setEditTransaction(null);
    setCurrentScreen('add');
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setCurrentScreen('add');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigate={handleNavigate}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionsScreen
            onNavigate={handleNavigate}
            onEditTransaction={handleEditTransaction}
          />
        );
      case 'add':
        return (
          <AddTransactionScreen
            onNavigate={handleNavigate}
            editTransaction={editTransaction}
            initialType={addTransactionType}
          />
        );
      case 'reports':
        return <ReportsScreen onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsScreen onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      default:
        return (
          <DashboardScreen
            onNavigate={handleNavigate}
            onAddTransaction={handleAddTransaction}
          />
        );
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>{renderScreen()}</View>
        <BottomNavigation activeTab={currentScreen} onTabPress={handleTabPress} />
      </SafeAreaView>
    </View>
  );
}

function MainApp() {
  return (
    <SettingsProvider>
      <TransactionProvider>
        <MainAppContent />
      </TransactionProvider>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
