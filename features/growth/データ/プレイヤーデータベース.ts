// features/growth/データ/プレイヤーデータベース.ts
import * as SQLite from 'expo-sqlite';
import { Award, Scene, PlayerItem } from '../型定義';

const db = SQLite.openDatabase('PlayerData.db');

const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS unlocked_scenes (id TEXT PRIMARY KEY NOT NULL);');
        tx.executeSql('CREATE TABLE IF NOT EXISTS unlocked_awards (id TEXT PRIMARY KEY NOT NULL, unlocked_at INTEGER);');
        tx.executeSql('CREATE TABLE IF NOT EXISTS player_items (id TEXT PRIMARY KEY NOT NULL, quantity INTEGER);');
        tx.executeSql('CREATE TABLE IF NOT EXISTS player_currency (id TEXT PRIMARY KEY NOT NULL, amount INTEGER);',
          [],
          () => {
             // 初期データとして通貨'gold'を0で登録
            tx.executeSql('INSERT OR IGNORE INTO player_currency (id, amount) VALUES (?, ?);', ['gold', 0]);
          }
        );
      },
      reject,
      resolve
    );
  });
};

const getCurrency = (id: string): Promise<number> => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT amount FROM player_currency WHERE id = ?;',
        [id],
        (_, { rows }) => {
          resolve(rows.length > 0 ? rows.item(0).amount : 0);
        },
        () => {
          resolve(0); // エラー時は0を返す
          return false;
        }
      );
    });
  });
};

const updateCurrency = (id: string, newAmount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'UPDATE player_currency SET amount = ? WHERE id = ?;',
                [newAmount, id],
                () => resolve(),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};


export { initializeDatabase, getCurrency, updateCurrency };