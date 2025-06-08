// features/growth/data/playerDatabase.ts
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { Award, Scene, PlayerItem } from '@/features/growth/types';

let db: SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLiteDatabase> => {
  if (!db) {
    db = await openDatabaseAsync('PlayerData.db');
  }
  return db;
};

const initializeDatabase = async (): Promise<void> => {
    const database = await getDb();
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS unlocked_scenes (id TEXT PRIMARY KEY NOT NULL);
      CREATE TABLE IF NOT EXISTS unlocked_awards (id TEXT PRIMARY KEY NOT NULL, unlocked_at INTEGER);
      CREATE TABLE IF NOT EXISTS player_items (id TEXT PRIMARY KEY NOT NULL, quantity INTEGER);
      CREATE TABLE IF NOT EXISTS player_currency (id TEXT PRIMARY KEY NOT NULL, amount INTEGER);
      INSERT OR IGNORE INTO player_currency (id, amount) VALUES ('gold', 0);
      CREATE TABLE IF NOT EXISTS player_progress (id TEXT PRIMARY KEY NOT NULL, points INTEGER);
      INSERT OR IGNORE INTO player_progress (id, points) VALUES ('growth', 0);
    `);
};

const getCurrency = async (id: string): Promise<number> => {
    const database = await getDb();
    const result = await database.getFirstAsync<{ amount: number }>(
        'SELECT amount FROM player_currency WHERE id = ?;',
        [id]
    );
    return result?.amount ?? 0;
};

const updateCurrency = async (id: string, newAmount: number): Promise<void> => {
    const database = await getDb();
    await database.runAsync(
        'UPDATE player_currency SET amount = ? WHERE id = ?;',
        [newAmount, id]
    );
};

const getGrowthPoints = async (): Promise<number> => {
    const database = await getDb();
    const result = await database.getFirstAsync<{ points: number }>(
        'SELECT points FROM player_progress WHERE id = ?;',
        ['growth']
    );
    return result?.points ?? 0;
};

const updateGrowthPoints = async (newPoints: number): Promise<void> => {
    const database = await getDb();
    await database.runAsync(
        'UPDATE player_progress SET points = ? WHERE id = ?;',
        [newPoints, 'growth']
    );
};

export { initializeDatabase, getCurrency, updateCurrency, getGrowthPoints, updateGrowthPoints };
