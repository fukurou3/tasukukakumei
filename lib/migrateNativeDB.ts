import AsyncStorage from '@react-native-async-storage/async-storage'
import { initTasksDB, saveTaskToDB } from './tasksNative'

const MIGRATED_KEY = 'DB_MIGRATED'

export async function migrateToNativeDB() {
  const migrated = await AsyncStorage.getItem(MIGRATED_KEY)
  if (migrated === 'true') return
  await initTasksDB()
  const raw = await AsyncStorage.getItem('TASKS')
  if (raw) {
    try {
      const tasks = JSON.parse(raw) as any[]
      for (const t of tasks) {
        await saveTaskToDB(t)
      }
      await AsyncStorage.removeItem('TASKS')
    } catch {}
  }
  await AsyncStorage.setItem(MIGRATED_KEY, 'true')
}
