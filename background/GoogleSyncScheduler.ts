import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import * as Network from 'expo-network'
import GoogleSyncTask from './GoogleSyncTask'

const TASK_NAME = 'GOOGLE_CALENDAR_BACKGROUND_SYNC'

TaskManager.defineTask(TASK_NAME, async () => {
  console.log('GoogleSyncTask start')
  try {
    const state = await Network.getNetworkStateAsync()
    if (!state.isConnected || !state.isInternetReachable) {
      console.log('Network unavailable, skipping sync')
      return BackgroundFetch.Result.NoData
    }
    await GoogleSyncTask()
    console.log('GoogleSyncTask finished')
    return BackgroundFetch.Result.NewData
  } catch (e) {
    console.warn('GoogleSyncTask error', e)
    return BackgroundFetch.Result.Failed
  }
})

export async function registerBackgroundSync() {
  const status = await BackgroundFetch.getStatusAsync()
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    console.log('Background fetch not available')
    return
  }
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

export async function unregisterBackgroundSync() {
  const registered = await TaskManager.isTaskRegisteredAsync(TASK_NAME)
  if (registered) {
    await BackgroundFetch.unregisterTaskAsync(TASK_NAME)
  }
}
