import { NativeModules } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEY as TASKS_KEY } from '@/features/tasks/constants'

export type TaskRecord = {
  id: string
  [key: string]: any
}

interface TasksDatabaseModule {
  initialize(): Promise<void>
  saveTask(task: TaskRecord): Promise<void>
  getAllTasks(): Promise<string[]>
  deleteTask(id: string): Promise<void>
}

const { TasksDatabase } = NativeModules

async function loadAllFromStorage(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(TASKS_KEY)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as TaskRecord[]
    return arr.map(t => JSON.stringify(t))
  } catch {
    return []
  }
}

async function saveToStorage(task: TaskRecord) {
  const raw = await AsyncStorage.getItem(TASKS_KEY)
  const tasks: TaskRecord[] = raw ? JSON.parse(raw) : []
  const index = tasks.findIndex(t => t.id === task.id)
  if (index !== -1) {
    tasks[index] = task
  } else {
    tasks.push(task)
  }
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

async function deleteFromStorage(id: string) {
  const raw = await AsyncStorage.getItem(TASKS_KEY)
  if (!raw) return
  const tasks: TaskRecord[] = JSON.parse(raw)
  const updated = tasks.filter(t => t.id !== id)
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated))
}

const fallback: TasksDatabaseModule = {
  initialize: async () => {},
  saveTask: saveToStorage,
  getAllTasks: loadAllFromStorage,
  deleteTask: deleteFromStorage,
}

export default (TasksDatabase ?? fallback) as TasksDatabaseModule
