import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: '@aybay_transactions',
  BUSINESSES: '@aybay_businesses',
  CURRENT_BUSINESS: '@aybay_current_business',
  SETTINGS: '@aybay_settings',
  APP_VERSION: '@aybay_app_version',
  BACKUP_DATA: '@aybay_backup',
  FIRST_LAUNCH: '@aybay_first_launch',
  PIN_CODE: '@aybay_pin_code',
  BIOMETRIC_ENABLED: '@aybay_biometric',
};

// Current app version for migrations
const CURRENT_APP_VERSION = '1.0.0';

// Storage Service
export const StorageService = {
  // Generic methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Transaction methods
  async saveTransactions(transactions: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  async getTransactions(): Promise<any[] | null> {
    return this.getItem<any[]>(STORAGE_KEYS.TRANSACTIONS);
  },

  // Business methods
  async saveBusinesses(businesses: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.BUSINESSES, businesses);
  },

  async getBusinesses(): Promise<any[] | null> {
    return this.getItem<any[]>(STORAGE_KEYS.BUSINESSES);
  },

  async saveCurrentBusiness(businessId: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.CURRENT_BUSINESS, businessId);
  },

  async getCurrentBusiness(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.CURRENT_BUSINESS);
  },

  // Settings methods
  async saveSettings(settings: AppSettings): Promise<void> {
    await this.setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  async getSettings(): Promise<AppSettings | null> {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
  },

  // Security methods
  async savePinCode(pin: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.PIN_CODE, pin);
  },

  async getPinCode(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.PIN_CODE);
  },

  async removePinCode(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.PIN_CODE);
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled);
  },

  async getBiometricEnabled(): Promise<boolean> {
    const value = await this.getItem<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return value ?? false;
  },

  // First launch check
  async isFirstLaunch(): Promise<boolean> {
    const value = await this.getItem<boolean>(STORAGE_KEYS.FIRST_LAUNCH);
    return value === null;
  },

  async setFirstLaunchComplete(): Promise<void> {
    await this.setItem(STORAGE_KEYS.FIRST_LAUNCH, false);
  },

  // App version and migration
  async getStoredAppVersion(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.APP_VERSION);
  },

  async setAppVersion(version: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_VERSION, version);
  },

  getCurrentAppVersion(): string {
    return CURRENT_APP_VERSION;
  },

  // Backup and Restore
  async createBackup(): Promise<BackupData> {
    const transactions = await this.getTransactions();
    const businesses = await this.getBusinesses();
    const settings = await this.getSettings();
    const currentBusiness = await this.getCurrentBusiness();

    const backup: BackupData = {
      version: CURRENT_APP_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        transactions: transactions || [],
        businesses: businesses || [],
        settings: settings || getDefaultSettings(),
        currentBusinessId: currentBusiness || '',
      },
    };

    await this.setItem(STORAGE_KEYS.BACKUP_DATA, backup);
    return backup;
  },

  async getLastBackup(): Promise<BackupData | null> {
    return this.getItem<BackupData>(STORAGE_KEYS.BACKUP_DATA);
  },

  async restoreFromBackup(backup: BackupData): Promise<void> {
    if (backup.data.transactions) {
      await this.saveTransactions(backup.data.transactions);
    }
    if (backup.data.businesses) {
      await this.saveBusinesses(backup.data.businesses);
    }
    if (backup.data.settings) {
      await this.saveSettings(backup.data.settings);
    }
    if (backup.data.currentBusinessId) {
      await this.saveCurrentBusiness(backup.data.currentBusinessId);
    }
  },

  async exportBackupAsJSON(): Promise<string> {
    const backup = await this.createBackup();
    return JSON.stringify(backup, null, 2);
  },

  async importBackupFromJSON(jsonString: string): Promise<boolean> {
    try {
      const backup: BackupData = JSON.parse(jsonString);
      if (backup.version && backup.data) {
        await this.restoreFromBackup(backup);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing backup:', error);
      return false;
    }
  },

  // Data Migration
  async runMigrations(): Promise<void> {
    const storedVersion = await this.getStoredAppVersion();
    
    if (!storedVersion) {
      // First time setup
      await this.setAppVersion(CURRENT_APP_VERSION);
      return;
    }

    if (storedVersion === CURRENT_APP_VERSION) {
      return; // No migration needed
    }

    // Run migrations based on version
    const migrations = getMigrations();
    
    for (const migration of migrations) {
      if (this.compareVersions(storedVersion, migration.version) < 0) {
        console.log(`Running migration to version ${migration.version}`);
        await migration.migrate();
      }
    }

    await this.setAppVersion(CURRENT_APP_VERSION);
  },

  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  },

  // Auto-save with debounce
  createAutoSaver<T>(
    saveFunction: (data: T) => Promise<void>,
    delay: number = 1000
  ): (data: T) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (data: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        saveFunction(data);
      }, delay);
    };
  },

  // Get all storage info
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        totalKeys: keys.length,
        totalSizeBytes: totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        keys: keys,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalKeys: 0,
        totalSizeBytes: 0,
        totalSizeKB: 0,
        keys: [],
      };
    }
  },
};

// Types
export interface AppSettings {
  language: 'en' | 'bn';
  theme: 'light' | 'dark' | 'system';
  currency: string;
  currencySymbol: string;
  notifications: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string | null;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  showOnboarding: boolean;
}

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    transactions: any[];
    businesses: any[];
    settings: AppSettings;
    currentBusinessId: string;
  };
}

export interface StorageInfo {
  totalKeys: number;
  totalSizeBytes: number;
  totalSizeKB: number;
  keys: string[];
}

export interface Migration {
  version: string;
  migrate: () => Promise<void>;
}

// Default settings
export function getDefaultSettings(): AppSettings {
  return {
    language: 'en',
    theme: 'light',
    currency: 'BDT',
    currencySymbol: '৳',
    notifications: true,
    dailyReminder: false,
    reminderTime: '09:00',
    autoBackup: true,
    backupFrequency: 'weekly',
    lastBackupDate: null,
    pinEnabled: false,
    biometricEnabled: false,
    showOnboarding: true,
  };
}

// Migration definitions
function getMigrations(): Migration[] {
  return [
    {
      version: '1.0.1',
      migrate: async () => {
        // Example migration: Add new field to transactions
        const transactions = await StorageService.getTransactions();
        if (transactions) {
          const updated = transactions.map((t: any) => ({
            ...t,
            attachments: t.attachments || [],
          }));
          await StorageService.saveTransactions(updated);
        }
      },
    },
    {
      version: '1.1.0',
      migrate: async () => {
        // Example migration: Update settings structure
        const settings = await StorageService.getSettings();
        if (settings) {
          const updated = {
            ...getDefaultSettings(),
            ...settings,
          };
          await StorageService.saveSettings(updated);
        }
      },
    },
  ];
}

export { STORAGE_KEYS };
