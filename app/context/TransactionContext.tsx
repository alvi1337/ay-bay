import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StorageService } from '../services/StorageService';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  time: string;
  notes?: string;
  status: 'completed' | 'pending';
  businessId: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  createdAt?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  businesses: Business[];
  currentBusinessId: string;
  isLoading: boolean;
  isInitialized: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => Promise<void>;
  updateBusiness: (id: string, business: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  setCurrentBusiness: (id: string) => Promise<void>;
  getFilteredTransactions: (filters: TransactionFilters) => Transaction[];
  getTodayIncome: () => number;
  getTodayExpense: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpense: () => number;
  getYearlyIncome: () => number;
  getYearlyExpense: () => number;
  getTotalBalance: () => number;
  getPendingCount: () => number;
  getCategoryTotals: (type: 'income' | 'expense') => { category: string; total: number }[];
  getMonthlyTrends: () => { month: string; income: number; expense: number }[];
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  status?: 'completed' | 'pending' | 'all';
}

const categories = {
  income: ['sales', 'salary', 'investment', 'refund', 'other'],
  expense: ['purchases', 'rent', 'utilities', 'marketing', 'tax', 'transport', 'food', 'entertainment', 'healthcare', 'education', 'other'],
};

// Generate sample transactions for first-time users
const generateSampleTransactions = (): Transaction[] => {
  const sampleData: Transaction[] = [];
  const today = new Date();
  const now = new Date().toISOString();
  
  const incomeDescriptions = [
    { desc: 'Product Sales - Electronics', cat: 'sales' },
    { desc: 'Service Revenue - Consulting', cat: 'sales' },
    { desc: 'Monthly Salary', cat: 'salary' },
    { desc: 'Freelance Project Payment', cat: 'sales' },
    { desc: 'Investment Returns', cat: 'investment' },
    { desc: 'Customer Refund Return', cat: 'refund' },
    { desc: 'Online Store Sales', cat: 'sales' },
    { desc: 'Commission Earned', cat: 'sales' },
    { desc: 'Rental Income', cat: 'other' },
    { desc: 'Bonus Payment', cat: 'salary' },
  ];

  const expenseDescriptions = [
    { desc: 'Office Rent Payment', cat: 'rent' },
    { desc: 'Electricity Bill', cat: 'utilities' },
    { desc: 'Internet & Phone Bill', cat: 'utilities' },
    { desc: 'Raw Materials Purchase', cat: 'purchases' },
    { desc: 'Facebook Ads Campaign', cat: 'marketing' },
    { desc: 'Google Ads Spend', cat: 'marketing' },
    { desc: 'Staff Salary Payment', cat: 'purchases' },
    { desc: 'Transportation Cost', cat: 'transport' },
    { desc: 'Business Lunch Meeting', cat: 'food' },
    { desc: 'Office Supplies', cat: 'purchases' },
    { desc: 'Software Subscription', cat: 'purchases' },
    { desc: 'Tax Payment - Q4', cat: 'tax' },
    { desc: 'Insurance Premium', cat: 'other' },
    { desc: 'Equipment Maintenance', cat: 'purchases' },
    { desc: 'Training & Development', cat: 'education' },
  ];

  for (let i = 0; i < 55; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    const isIncome = Math.random() > 0.45;
    const descriptions = isIncome ? incomeDescriptions : expenseDescriptions;
    const item = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    const baseAmount = isIncome ? 
      Math.floor(Math.random() * 50000) + 5000 :
      Math.floor(Math.random() * 30000) + 1000;

    sampleData.push({
      id: `txn_${i + 1}`,
      type: isIncome ? 'income' : 'expense',
      amount: baseAmount,
      category: item.cat,
      description: item.desc,
      date: date.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      businessId: 'biz_1',
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  return sampleData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const defaultBusinesses: Business[] = [
  {
    id: 'biz_1',
    name: 'AY BAY Trading Co.',
    ownerName: 'Ahmed Rahman',
    phone: '+880 1712-345678',
    email: 'info@aybaytrading.com',
    address: 'House 45, Road 12, Gulshan-1, Dhaka-1212',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'biz_2',
    name: 'Rahman Electronics',
    ownerName: 'Ahmed Rahman',
    phone: '+880 1812-345678',
    email: 'sales@rahmanelectronics.com',
    address: 'Shop 23, Elephant Road, Dhaka-1205',
    createdAt: new Date().toISOString(),
  },
];

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusinessId, setCurrentBusinessIdState] = useState('biz_1');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-save transactions when they change
  useEffect(() => {
    if (isInitialized && transactions.length > 0) {
      StorageService.saveTransactions(transactions);
    }
  }, [transactions, isInitialized]);

  // Auto-save businesses when they change
  useEffect(() => {
    if (isInitialized && businesses.length > 0) {
      StorageService.saveBusinesses(businesses);
    }
  }, [businesses, isInitialized]);

  // Auto-save current business when it changes
  useEffect(() => {
    if (isInitialized) {
      StorageService.saveCurrentBusiness(currentBusinessId);
    }
  }, [currentBusinessId, isInitialized]);

  // Auto backup (weekly)
  useEffect(() => {
    if (isInitialized) {
      checkAndRunAutoBackup();
    }
  }, [isInitialized]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Run migrations first
      await StorageService.runMigrations();

      // Load transactions
      const savedTransactions = await StorageService.getTransactions();
      if (savedTransactions && savedTransactions.length > 0) {
        setTransactions(savedTransactions);
      } else {
        // First time - generate sample data
        const sampleData = generateSampleTransactions();
        setTransactions(sampleData);
        await StorageService.saveTransactions(sampleData);
      }

      // Load businesses
      const savedBusinesses = await StorageService.getBusinesses();
      if (savedBusinesses && savedBusinesses.length > 0) {
        setBusinesses(savedBusinesses);
      } else {
        setBusinesses(defaultBusinesses);
        await StorageService.saveBusinesses(defaultBusinesses);
      }

      // Load current business
      const savedCurrentBusiness = await StorageService.getCurrentBusiness();
      if (savedCurrentBusiness) {
        setCurrentBusinessIdState(savedCurrentBusiness);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to defaults
      setTransactions(generateSampleTransactions());
      setBusinesses(defaultBusinesses);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndRunAutoBackup = async () => {
    try {
      const settings = await StorageService.getSettings();
      if (!settings?.autoBackup) return;

      const lastBackup = settings.lastBackupDate;
      const now = new Date();
      
      let shouldBackup = false;
      if (!lastBackup) {
        shouldBackup = true;
      } else {
        const lastBackupDate = new Date(lastBackup);
        const daysSinceBackup = Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (settings.backupFrequency) {
          case 'daily':
            shouldBackup = daysSinceBackup >= 1;
            break;
          case 'weekly':
            shouldBackup = daysSinceBackup >= 7;
            break;
          case 'monthly':
            shouldBackup = daysSinceBackup >= 30;
            break;
        }
      }

      if (shouldBackup) {
        await StorageService.createBackup();
        await StorageService.saveSettings({
          ...settings,
          lastBackupDate: now.toISOString(),
        });
        console.log('Auto backup completed');
      }
    } catch (error) {
      console.error('Auto backup error:', error);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const clearAllData = async () => {
    await StorageService.clear();
    setTransactions([]);
    setBusinesses(defaultBusinesses);
    setCurrentBusinessIdState('biz_1');
    await StorageService.saveBusinesses(defaultBusinesses);
    await StorageService.saveCurrentBusiness('biz_1');
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => 
        t.id === id 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() } 
          : t
      )
    );
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBusiness = async (business: Omit<Business, 'id' | 'createdAt'>) => {
    const newBusiness: Business = {
      ...business,
      id: `biz_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBusinesses((prev) => [...prev, newBusiness]);
  };

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBusiness = async (id: string) => {
    if (businesses.length <= 1) {
      throw new Error('Cannot delete the last business');
    }
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    if (currentBusinessId === id) {
      const remaining = businesses.filter((b) => b.id !== id);
      if (remaining.length > 0) {
        setCurrentBusinessIdState(remaining[0].id);
      }
    }
  };

  const setCurrentBusiness = async (id: string) => {
    setCurrentBusinessIdState(id);
  };

  const getFilteredTransactions = useCallback((filters: TransactionFilters): Transaction[] => {
    return transactions.filter((t) => {
      if (t.businessId !== currentBusinessId) return false;
      if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.dateFrom && t.date < filters.dateFrom) return false;
      if (filters.dateTo && t.date > filters.dateTo) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          t.description.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [transactions, currentBusinessId]);

  const getDateRange = (period: 'today' | 'month' | 'year') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (period === 'today') {
      return { start: todayStr, end: todayStr };
    } else if (period === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      return { start, end: todayStr };
    } else {
      const start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      return { start, end: todayStr };
    }
  };

  const getTodayIncome = useCallback(() => {
    const { start, end } = getDateRange('today');
    return transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'income' && t.date >= start && t.date <= end && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentBusinessId]);

  const getTodayExpense = useCallback(() => {
    const { start, end } = getDateRange('today');
    return transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'expense' && t.date >= start && t.date <= end && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentBusinessId]);

  const getMonthlyIncome = useCallback(() => {
    const { start, end } = getDateRange('month');
    return transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'income' && t.date >= start && t.date <= end && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentBusinessId]);

  const getMonthlyExpense = useCallback(() => {
    const { start, end } = getDateRange('month');
    return transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'expense' && t.date >= start && t.date <= end && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentBusinessId]);

  const getYearlyIncome = useCallback(() => {
    const { start, end } = getDateRange('year');
    return transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'income' && t.date >= start && t.date <= end && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentBusinessId]);

  const getYearlyExpense = useCallback(() => {
    const { start, end } = getDateRange('year');
    return transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'expense' && t.date >= start && t.date <= end && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentBusinessId]);

  const getTotalBalance = useCallback(() => {
    const income = transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.businessId === currentBusinessId && t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  }, [transactions, currentBusinessId]);

  const getPendingCount = useCallback(() => {
    return transactions.filter((t) => t.businessId === currentBusinessId && t.status === 'pending').length;
  }, [transactions, currentBusinessId]);

  const getCategoryTotals = useCallback((type: 'income' | 'expense') => {
    const { start, end } = getDateRange('month');
    const filtered = transactions.filter(
      (t) => t.businessId === currentBusinessId && t.type === type && t.date >= start && t.date <= end && t.status === 'completed'
    );
    
    const totals: Record<string, number> = {};
    filtered.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    
    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, currentBusinessId]);

  const getMonthlyTrends = useCallback(() => {
    const months: { month: string; income: number; expense: number }[] = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
      const start = date.toISOString().split('T')[0];
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const income = transactions
        .filter((t) => t.businessId === currentBusinessId && t.type === 'income' && t.date >= start && t.date <= end && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = transactions
        .filter((t) => t.businessId === currentBusinessId && t.type === 'expense' && t.date >= start && t.date <= end && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push({ month: monthStr, income, expense });
    }
    
    return months;
  }, [transactions, currentBusinessId]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        businesses,
        currentBusinessId,
        isLoading,
        isInitialized,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBusiness,
        updateBusiness,
        deleteBusiness,
        setCurrentBusiness,
        getFilteredTransactions,
        getTodayIncome,
        getTodayExpense,
        getMonthlyIncome,
        getMonthlyExpense,
        getYearlyIncome,
        getYearlyExpense,
        getTotalBalance,
        getPendingCount,
        getCategoryTotals,
        getMonthlyTrends,
        refreshData,
        clearAllData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}

export { categories };
