// features/growth/data/playerDatabase.tsx

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { PlayerThemeState } from '@/features/growth/types';
import { AVAILABLE_THEMES } from '@/features/growth/theme.config';

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
      CREATE TABLE IF NOT EXISTS player_currency (id TEXT PRIMARY KEY NOT NULL, amount INTEGER);
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY NOT NULL,
        level INTEGER NOT NULL,
        exp INTEGER NOT NULL,
        expToNextLevel INTEGER NOT NULL
      );
    `);
    
    await database.runAsync(
      "INSERT OR IGNORE INTO player_currency (id, amount) VALUES ('gold', 0);"
    );
    
    // 利用可能な全てのテーマを初期化
    for (const themeId of AVAILABLE_THEMES) {
        await database.runAsync(
            "INSERT OR IGNORE INTO themes (id, level, exp, expToNextLevel) VALUES (?, 1, 0, 100);",
            [themeId]
        );
    }
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

const getAllThemes = async (): Promise<PlayerThemeState[]> => {
    const database = await getDb();
    const results = await database.getAllAsync<PlayerThemeState>('SELECT * FROM themes;');
    return results;
};


const updateTheme = async (theme: PlayerThemeState): Promise<void> => {
    const database = await getDb();
    await database.runAsync(
        'UPDATE themes SET level = ?, exp = ?, expToNextLevel = ? WHERE id = ?;',
        [theme.level, theme.exp, theme.expToNextLevel, theme.id]
    );
};

export { initializeDatabase, getCurrency, updateCurrency, getAllThemes, updateTheme };