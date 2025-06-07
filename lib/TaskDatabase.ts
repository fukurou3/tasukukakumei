import { NativeModules } from 'react-native'

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

export default TasksDatabase as TasksDatabaseModule
