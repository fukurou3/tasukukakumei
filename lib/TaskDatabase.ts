import * as SQLite from 'expo-sqlite';

export type TaskRecord = {
  id: string;
  [key: string]: any;
};

const db =
  'openDatabaseSync' in SQLite
    ? (SQLite as any).openDatabaseSync('tasks.db')
    : (SQLite as any).openDatabase('tasks.db');
    
const run = <T>(
  callback: (tx: SQLite.SQLTransaction) => void
): Promise<T> =>
  new Promise((resolve, reject) => {
    db.transaction(
      tx => callback(tx),
      error => reject(error),
      result => resolve(result as unknown as T)
    );
  });

const TasksDatabase = {
  async initialize() {
    await run<void>(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);'
      );
    });
  },

  async saveTask(task: TaskRecord) {
    const data = JSON.stringify(task);
    await run<void>(tx => {
      tx.executeSql(
        'REPLACE INTO tasks (id, data) VALUES (?, ?);',
        [task.id, data]
      );
    });
  },

  async getAllTasks(): Promise<string[]> {
    const result = await run<SQLite.SQLResultSet>(tx => {
      tx.executeSql('SELECT data FROM tasks;');
    });
    const rows = result.rows as unknown as SQLite.ResultSetRowList;
    const data: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      data.push((rows as any).item(i).data);
    }
    return data;
  },

  async deleteTask(id: string) {
    await run<void>(tx => {
      tx.executeSql('DELETE FROM tasks WHERE id = ?;', [id]);
    });
  },
};

export default TasksDatabase;
