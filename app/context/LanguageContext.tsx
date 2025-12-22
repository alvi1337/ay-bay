import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // App
    appName: 'AY BAY',
    tagline: 'Smart Financial Management',
    
    // Navigation
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    
    // Dashboard
    welcomeBack: 'Welcome Back!',
    todayOverview: "Today's Overview",
    todayIncome: "Today's Income",
    todayExpense: "Today's Expense",
    monthlyProfit: 'Monthly Profit',
    monthlyLoss: 'Monthly Loss',
    yearlyRevenue: 'Yearly Revenue',
    totalBalance: 'Total Balance',
    pendingTransactions: 'Pending',
    quickActions: 'Quick Actions',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View All',
    
    // Transactions
    allTransactions: 'All Transactions',
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount',
    category: 'Category',
    description: 'Description',
    date: 'Date',
    time: 'Time',
    notes: 'Notes',
    attachment: 'Attachment',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    
    // Categories
    sales: 'Sales',
    purchases: 'Purchases',
    salary: 'Salary',
    rent: 'Rent',
    utilities: 'Utilities',
    marketing: 'Marketing',
    tax: 'Tax',
    transport: 'Transport',
    food: 'Food & Dining',
    entertainment: 'Entertainment',
    healthcare: 'Healthcare',
    education: 'Education',
    investment: 'Investment',
    refund: 'Refund',
    other: 'Other',
    
    // Reports
    financialReports: 'Financial Reports',
    profitLoss: 'Profit & Loss',
    incomeReport: 'Income Report',
    expenseReport: 'Expense Report',
    monthlyReport: 'Monthly Report',
    yearlyReport: 'Yearly Report',
    categoryBreakdown: 'Category Breakdown',
    trends: 'Trends',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    
    // Settings
    appSettings: 'App Settings',
    language: 'Language',
    english: 'English',
    bangla: 'বাংলা',
    currency: 'Currency',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    backup: 'Backup & Restore',
    security: 'Security',
    pinLock: 'PIN Lock',
    biometric: 'Biometric',
    about: 'About',
    version: 'Version',
    rateApp: 'Rate App',
    shareApp: 'Share App',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    logout: 'Logout',
    
    // Profile
    businessProfile: 'Business Profile',
    personalProfile: 'Personal Profile',
    businessName: 'Business Name',
    ownerName: 'Owner Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    addBusiness: 'Add Business',
    switchBusiness: 'Switch Business',
    
    // Status
    profit: 'Profit',
    loss: 'Loss',
    neutral: 'Neutral',
    pending: 'Pending',
    completed: 'Completed',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    custom: 'Custom',
    
    // Filters
    filter: 'Filter',
    search: 'Search',
    sortBy: 'Sort By',
    dateRange: 'Date Range',
    allCategories: 'All Categories',
    
    // Messages
    noTransactions: 'No transactions found',
    addFirstTransaction: 'Add your first transaction',
    confirmDelete: 'Are you sure you want to delete?',
    transactionAdded: 'Transaction added successfully',
    transactionUpdated: 'Transaction updated successfully',
    transactionDeleted: 'Transaction deleted successfully',
    
    // Backup
    backupSuccess: 'Backup created successfully',
    restoreSuccess: 'Data restored successfully',
    backupFailed: 'Backup failed',
    restoreFailed: 'Restore failed',
    
    // Currency
    taka: 'BDT',
    takaSymbol: '৳',
  },
  bn: {
    // App
    appName: 'এ ওয়াই বে',
    tagline: 'স্মার্ট আর্থিক ব্যবস্থাপনা',
    
    // Navigation
    dashboard: 'ড্যাশবোর্ড',
    transactions: 'লেনদেন',
    reports: 'রিপোর্ট',
    settings: 'সেটিংস',
    profile: 'প্রোফাইল',
    
    // Dashboard
    welcomeBack: 'স্বাগতম!',
    todayOverview: 'আজকের সারসংক্ষেপ',
    todayIncome: 'আজকের আয়',
    todayExpense: 'আজকের ব্যয়',
    monthlyProfit: 'মাসিক লাভ',
    monthlyLoss: 'মাসিক ক্ষতি',
    yearlyRevenue: 'বার্ষিক আয়',
    totalBalance: 'মোট ব্যালেন্স',
    pendingTransactions: 'বকেয়া',
    quickActions: 'দ্রুত কার্যক্রম',
    recentTransactions: 'সাম্প্রতিক লেনদেন',
    viewAll: 'সব দেখুন',
    
    // Transactions
    allTransactions: 'সকল লেনদেন',
    addTransaction: 'লেনদেন যোগ করুন',
    editTransaction: 'লেনদেন সম্পাদনা',
    income: 'আয়',
    expense: 'ব্যয়',
    amount: 'পরিমাণ',
    category: 'বিভাগ',
    description: 'বিবরণ',
    date: 'তারিখ',
    time: 'সময়',
    notes: 'নোট',
    attachment: 'সংযুক্তি',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    
    // Categories
    sales: 'বিক্রয়',
    purchases: 'ক্রয়',
    salary: 'বেতন',
    rent: 'ভাড়া',
    utilities: 'ইউটিলিটি',
    marketing: 'মার্কেটিং',
    tax: 'কর',
    transport: 'পরিবহন',
    food: 'খাবার',
    entertainment: 'বিনোদন',
    healthcare: 'স্বাস্থ্যসেবা',
    education: 'শিক্ষা',
    investment: 'বিনিয়োগ',
    refund: 'ফেরত',
    other: 'অন্যান্য',
    
    // Reports
    financialReports: 'আর্থিক রিপোর্ট',
    profitLoss: 'লাভ-ক্ষতি',
    incomeReport: 'আয় রিপোর্ট',
    expenseReport: 'ব্যয় রিপোর্ট',
    monthlyReport: 'মাসিক রিপোর্ট',
    yearlyReport: 'বার্ষিক রিপোর্ট',
    categoryBreakdown: 'বিভাগ বিশ্লেষণ',
    trends: 'প্রবণতা',
    exportPDF: 'PDF রপ্তানি',
    exportExcel: 'Excel রপ্তানি',
    
    // Settings
    appSettings: 'অ্যাপ সেটিংস',
    language: 'ভাষা',
    english: 'English',
    bangla: 'বাংলা',
    currency: 'মুদ্রা',
    theme: 'থিম',
    lightMode: 'লাইট মোড',
    darkMode: 'ডার্ক মোড',
    notifications: 'বিজ্ঞপ্তি',
    backup: 'ব্যাকআপ ও রিস্টোর',
    security: 'নিরাপত্তা',
    pinLock: 'পিন লক',
    biometric: 'বায়োমেট্রিক',
    about: 'সম্পর্কে',
    version: 'সংস্করণ',
    rateApp: 'অ্যাপ রেট করুন',
    shareApp: 'অ্যাপ শেয়ার করুন',
    privacyPolicy: 'গোপনীয়তা নীতি',
    termsOfService: 'সেবার শর্তাবলী',
    logout: 'লগআউট',
    
    // Profile
    businessProfile: 'ব্যবসার প্রোফাইল',
    personalProfile: 'ব্যক্তিগত প্রোফাইল',
    businessName: 'ব্যবসার নাম',
    ownerName: 'মালিকের নাম',
    phone: 'ফোন',
    email: 'ইমেইল',
    address: 'ঠিকানা',
    addBusiness: 'ব্যবসা যোগ করুন',
    switchBusiness: 'ব্যবসা পরিবর্তন',
    
    // Status
    profit: 'লাভ',
    loss: 'ক্ষতি',
    neutral: 'নিরপেক্ষ',
    pending: 'বকেয়া',
    completed: 'সম্পন্ন',
    
    // Time
    today: 'আজ',
    yesterday: 'গতকাল',
    thisWeek: 'এই সপ্তাহ',
    thisMonth: 'এই মাস',
    thisYear: 'এই বছর',
    custom: 'কাস্টম',
    
    // Filters
    filter: 'ফিল্টার',
    search: 'অনুসন্ধান',
    sortBy: 'সাজান',
    dateRange: 'তারিখ পরিসীমা',
    allCategories: 'সব বিভাগ',
    
    // Messages
    noTransactions: 'কোন লেনদেন পাওয়া যায়নি',
    addFirstTransaction: 'আপনার প্রথম লেনদেন যোগ করুন',
    confirmDelete: 'আপনি কি নিশ্চিত মুছে ফেলতে চান?',
    transactionAdded: 'লেনদেন সফলভাবে যোগ হয়েছে',
    transactionUpdated: 'লেনদেন সফলভাবে আপডেট হয়েছে',
    transactionDeleted: 'লেনদেন সফলভাবে মুছে ফেলা হয়েছে',
    
    // Backup
    backupSuccess: 'ব্যাকআপ সফলভাবে তৈরি হয়েছে',
    restoreSuccess: 'ডেটা সফলভাবে পুনরুদ্ধার হয়েছে',
    backupFailed: 'ব্যাকআপ ব্যর্থ হয়েছে',
    restoreFailed: 'পুনরুদ্ধার ব্যর্থ হয়েছে',
    
    // Currency
    taka: 'টাকা',
    takaSymbol: '৳',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const formatCurrency = (amount: number): string => {
    const symbol = translations[language].takaSymbol;
    if (language === 'bn') {
      return `${symbol}${toBengaliNumber(amount.toLocaleString())}`;
    }
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number): string => {
    if (language === 'bn') {
      return toBengaliNumber(num.toString());
    }
    return num.toString();
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatCurrency, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

function toBengaliNumber(str: string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit)]);
}
