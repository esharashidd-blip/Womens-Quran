/**
 * Safe localStorage wrapper for iOS WKWebView
 * Handles quota exceeded errors and private browsing mode
 */

const memoryStorage: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage.getItem failed, using memory fallback:', e);
      return memoryStorage[key] || null;
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      // Also store in memory as backup
      memoryStorage[key] = value;
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');

        try {
          // Try to free up space by removing oldest items
          const keys = Object.keys(localStorage);
          const sortedKeys = keys.sort((a, b) => {
            const aTime = parseInt(a.split('-').pop() || '0');
            const bTime = parseInt(b.split('-').pop() || '0');
            return aTime - bTime;
          });

          // Remove oldest 25% of items
          const toRemove = Math.ceil(sortedKeys.length * 0.25);
          for (let i = 0; i < toRemove; i++) {
            localStorage.removeItem(sortedKeys[i]);
          }

          // Try again
          localStorage.setItem(key, value);
          memoryStorage[key] = value;
          return true;
        } catch (retryError) {
          console.error('localStorage still exceeded after cleanup:', retryError);
          // Fall back to memory storage
          memoryStorage[key] = value;
          return false;
        }
      }

      console.error('localStorage.setItem failed:', e);
      // Fall back to memory storage
      memoryStorage[key] = value;
      return false;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      delete memoryStorage[key];
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
      delete memoryStorage[key];
    }
  },

  clear(): void {
    try {
      localStorage.clear();
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    } catch (e) {
      console.warn('localStorage.clear failed:', e);
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    }
  },

  /**
   * Check if localStorage is available (not in private browsing)
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
};

/**
 * Custom Supabase storage adapter for iOS reliability
 */
export const createSupabaseStorage = () => ({
  getItem: (key: string) => safeLocalStorage.getItem(key),
  setItem: (key: string, value: string) => {
    safeLocalStorage.setItem(key, value);
  },
  removeItem: (key: string) => safeLocalStorage.removeItem(key),
});
