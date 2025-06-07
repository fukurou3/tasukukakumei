import {
  openDatabaseAsync,
  type SQLiteDatabase,
} from 'expo-sqlite';
export type TaskRecord = {
  id: string;
  [key: string]: any;
};

let db: SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLiteDatabase> => {
  if (!db) {
    db = await openDatabaseAsync('tasks.db');
  }
  return db;
};

const TasksDatabase = {
  async initialize() {
    const database = await getDb();
    await database.execAsync(
      'CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);'
    );
  },

  async saveTask(task: TaskRecord) {
    const database = await getDb();
    const data = JSON.stringify(task);
    await database.runAsync(
      'REPLACE INTO tasks (id, data) VALUES (?, ?);',
      [task.id, data]
    );
  },

  async getAllTasks(): Promise<string[]> {
    const database = await getDb();
    const rows = await database.getAllAsync<{ data: string }>(
      'SELECT data FROM tasks;'
    );
    return rows.map(r => r.data);
  },

  async deleteTask(id: string) {
    const database = await getDb();
    await database.runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
  },
};

export default TasksDatabase;
