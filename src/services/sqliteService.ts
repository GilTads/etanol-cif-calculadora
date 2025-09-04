import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Base } from '../types';

class SQLiteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'etanol_cif_db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    try {
      // Check connection consistency
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(this.DB_NAME, false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(
          this.DB_NAME,
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.db.open();
      await this.createTables();
    } catch (error) {
      console.error('Error initializing SQLite:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sqlTables = `
      CREATE TABLE IF NOT EXISTS bases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        freight REAL NOT NULL,
        distance REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.db.execute(sqlTables);
  }

  async getBases(): Promise<Base[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM bases ORDER BY name');
    return result.values || [];
  }

  async addBase(base: Omit<Base, 'id'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = Date.now().toString();
    await this.db.query(
      'INSERT INTO bases (id, name, freight, distance, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
      [id, base.name, base.freight, base.distance, base.latitude, base.longitude]
    );
  }

  async updateBase(id: string, base: Omit<Base, 'id'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.query(
      'UPDATE bases SET name = ?, freight = ?, distance = ?, latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [base.name, base.freight, base.distance, base.latitude, base.longitude, id]
    );
  }

  async deleteBase(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.query('DELETE FROM bases WHERE id = ?', [id]);
  }

  async getBase(id: string): Promise<Base | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM bases WHERE id = ?', [id]);
    return result.values?.[0] || null;
  }

  async getSetting(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT value FROM settings WHERE key = ?', [key]);
    return result.values?.[0]?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.query(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value]
    );
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.DB_NAME, false);
      this.db = null;
    }
  }
}

export const sqliteService = new SQLiteService();