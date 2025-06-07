import EventDatabase from '../lib/EventDatabase'
import * as SecureStore from 'expo-secure-store'
import { fetchEvents } from '../lib/GoogleCalendarApi'
import * as Network from 'expo-network'

export default async function GoogleSyncTask() {
  console.log('GoogleSyncTask: start')
  const state = await Network.getNetworkStateAsync()
  if (!state.isConnected || !state.isInternetReachable) {
    console.log('GoogleSyncTask: no network, abort')
    return
  }
  await EventDatabase.initialize()
  const token = await SecureStore.getItemAsync('google_calendar_sync_token')
  try {
    const result = await fetchEvents(token || undefined)
    if (result.nextSyncToken) {
      await SecureStore.setItemAsync('google_calendar_sync_token', result.nextSyncToken)
    }
    if (Array.isArray(result.items)) {
      for (const item of result.items) {
        await EventDatabase.saveEvent({ id: item.id, ...item })
      }
    }
    console.log('GoogleSyncTask: finished')
  } catch (e) {
    console.warn('GoogleSyncTask: error', e)
  }
}
