import TasksDatabase, { TaskRecord } from './TaskDatabase'

export async function initTasksDB() {
  try {
    await TasksDatabase.initialize()
  } catch {}
}

export async function getAllTasksFromDB(): Promise<TaskRecord[]> {
  const rows = await TasksDatabase.getAllTasks()
  return rows.map(r => JSON.parse(r))
}

export async function saveTaskToDB(task: TaskRecord) {
  await TasksDatabase.saveTask(task)
}

export async function deleteTaskFromDB(id: string) {
  await TasksDatabase.deleteTask(id)
}
