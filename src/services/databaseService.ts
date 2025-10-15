import { Base } from '../types';
import { PlatformService } from './platformService';
import { sqliteService } from './sqliteService';
import { supabaseService, SupabaseService } from './supabaseService';
import { initialBases } from '../data/bases';

interface DatabaseService {
  getBases(): Promise<Base[]>;
  addBase(base: Omit<Base, 'id'>): Promise<void>;
  updateBase(id: string, base: Omit<Base, 'id'>): Promise<void>;
  deleteBase(id: string): Promise<void>;
  getBase(id: string): Promise<Base | null>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  initialize(): Promise<void>;
}

class DatabaseServiceImpl implements DatabaseService {
  private service: DatabaseService;

  constructor() {
    if (PlatformService.isNative()) {
      this.service = sqliteService;
    } else {
      this.service = supabaseService;
    }
  }

  async initialize(): Promise<void> {
    if (PlatformService.isNative()) {
      await sqliteService.initialize();
      await this.migrateFromLocalStorage();
    } else {
      // For web, we'll still use localStorage initially until Supabase tables are created
      await this.migrateFromLocalStorage();
    }
  }

  private async migrateFromLocalStorage(): Promise<void> {
    try {
      // Migrate bases
      const storedBases = localStorage.getItem('santahelena-bases');
      if (storedBases) {
        const bases = JSON.parse(storedBases);
        const existingBases = await this.getBases();
        
        if (existingBases.length === 0) {
          // Only migrate if no bases exist
          for (const base of bases) {
            await this.addBase(base);
          }
        }
      } else {
        // If no localStorage data, add initial bases
        const existingBases = await this.getBases();
        if (existingBases.length === 0) {
          for (const base of initialBases) {
            await this.addBase(base);
          }
        }
      }

      // Migrate settings - only if not already set
      const existingSetting = await this.getSetting('showFreightPerKm');
      if (existingSetting === null) {
        const storedSettings = localStorage.getItem('santahelena-settings');
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          await this.setSetting('showFreightPerKm', JSON.stringify(settings.showFreightPerKm ?? false));
        } else {
          await this.setSetting('showFreightPerKm', JSON.stringify(false));
        }
      }
    } catch (error) {
      console.error('Error migrating from localStorage:', error);
    }
  }

  async getBases(): Promise<Base[]> {
    return this.service.getBases();
  }

  async addBase(base: Omit<Base, 'id'>): Promise<void> {
    return this.service.addBase(base);
  }

  async updateBase(id: string, base: Omit<Base, 'id'>): Promise<void> {
    return this.service.updateBase(id, base);
  }

  async deleteBase(id: string): Promise<void> {
    return this.service.deleteBase(id);
  }

  async getBase(id: string): Promise<Base | null> {
    return this.service.getBase(id);
  }

  async getSetting(key: string): Promise<string | null> {
    return this.service.getSetting(key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    return this.service.setSetting(key, value);
  }
}

export const databaseService = new DatabaseServiceImpl();