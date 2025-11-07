// Local Storage Service
export const storageService = {
  // Keys for different data types
  keys: {
    appointments: 'musicStudio_appointments',
    settings: 'musicStudio_settings', 
    portfolio: 'musicStudio_portfolio',
    adminAuth: 'admin_auth'
  },

  // Generic save function
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  },

  // Generic load function
  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  // Remove specific key
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },

  // Clear all studio data
  clearAll: (): void => {
    Object.values(storageService.keys).forEach(key => {
      storageService.remove(key);
    });
  },

  // Check if localStorage is available
  isAvailable: (): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};

// Specialized storage functions for each data type
export const appointmentStorage = {
  save: (appointments: any[]) => 
    storageService.save(storageService.keys.appointments, appointments),
  
  load: () => 
    storageService.load(storageService.keys.appointments, [])
};

export const settingsStorage = {
  save: (settings: any) => 
    storageService.save(storageService.keys.settings, settings),
  
  load: () => 
    storageService.load(storageService.keys.settings, null)
};

export const portfolioStorage = {
  save: (portfolio: any[]) => 
    storageService.save(storageService.keys.portfolio, portfolio),
  
  load: () => 
    storageService.load(storageService.keys.portfolio, [])
};

export const authStorage = {
  save: (isAuthenticated: boolean) => 
    storageService.save(storageService.keys.adminAuth, isAuthenticated),
  
  load: () => 
    storageService.load(storageService.keys.adminAuth, false),
  
  clear: () => 
    storageService.remove(storageService.keys.adminAuth)
};