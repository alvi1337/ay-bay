import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService, AppSettings, getDefaultSettings } from '../services/StorageService';

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  createBackup: () => Promise<{ success: boolean; message: string }>;
  restoreBackup: () => Promise<{ success: boolean; message: string }>;
  getBackupInfo: () => Promise<{ exists: boolean; date: string | null; size: string }>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<{ success: boolean; message: string }>;
  getStorageInfo: () => Promise<{ totalKeys: number; totalSizeKB: number }>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-save settings when they change
  useEffect(() => {
    if (!isLoading) {
      StorageService.saveSettings(settings);
    }
  }, [settings, isLoading]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const savedSettings = await StorageService.getSettings();
      if (savedSettings) {
        // Merge with defaults to ensure all fields exist
        setSettings({ ...getDefaultSettings(), ...savedSettings });
      } else {
        // First time - save defaults
        const defaults = getDefaultSettings();
        setSettings(defaults);
        await StorageService.saveSettings(defaults);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = async () => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    await StorageService.saveSettings(defaults);
  };

  const createBackup = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const backup = await StorageService.createBackup();
      await updateSettings({ lastBackupDate: backup.timestamp });
      return {
        success: true,
        message: `Backup created successfully at ${new Date(backup.timestamp).toLocaleString()}`,
      };
    } catch (error) {
      console.error('Backup error:', error);
      return {
        success: false,
        message: 'Failed to create backup. Please try again.',
      };
    }
  };

  const restoreBackup = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const backup = await StorageService.getLastBackup();
      if (!backup) {
        return {
          success: false,
          message: 'No backup found to restore.',
        };
      }

      await StorageService.restoreFromBackup(backup);
      
      // Reload settings after restore
      const restoredSettings = await StorageService.getSettings();
      if (restoredSettings) {
        setSettings({ ...getDefaultSettings(), ...restoredSettings });
      }

      return {
        success: true,
        message: `Data restored from backup created on ${new Date(backup.timestamp).toLocaleString()}`,
      };
    } catch (error) {
      console.error('Restore error:', error);
      return {
        success: false,
        message: 'Failed to restore backup. Please try again.',
      };
    }
  };

  const getBackupInfo = async (): Promise<{ exists: boolean; date: string | null; size: string }> => {
    try {
      const backup = await StorageService.getLastBackup();
      if (!backup) {
        return { exists: false, date: null, size: '0 KB' };
      }

      const backupString = JSON.stringify(backup);
      const sizeKB = (backupString.length / 1024).toFixed(2);

      return {
        exists: true,
        date: backup.timestamp,
        size: `${sizeKB} KB`,
      };
    } catch (error) {
      return { exists: false, date: null, size: '0 KB' };
    }
  };

  const exportData = async (): Promise<string> => {
    try {
      return await StorageService.exportBackupAsJSON();
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const importData = async (jsonData: string): Promise<{ success: boolean; message: string }> => {
    try {
      const success = await StorageService.importBackupFromJSON(jsonData);
      if (success) {
        // Reload settings after import
        const importedSettings = await StorageService.getSettings();
        if (importedSettings) {
          setSettings({ ...getDefaultSettings(), ...importedSettings });
        }
        return {
          success: true,
          message: 'Data imported successfully. Please restart the app to see all changes.',
        };
      }
      return {
        success: false,
        message: 'Invalid backup file format.',
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: 'Failed to import data. Please check the file format.',
      };
    }
  };

  const getStorageInfo = async (): Promise<{ totalKeys: number; totalSizeKB: number }> => {
    try {
      const info = await StorageService.getStorageInfo();
      return {
        totalKeys: info.totalKeys,
        totalSizeKB: info.totalSizeKB,
      };
    } catch (error) {
      return { totalKeys: 0, totalSizeKB: 0 };
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        resetSettings,
        createBackup,
        restoreBackup,
        getBackupInfo,
        exportData,
        importData,
        getStorageInfo,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
