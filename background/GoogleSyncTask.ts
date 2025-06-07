import EventDatabase from '../lib/EventDatabase'
import * as SecureStore from 'expo-secure-store'
import { fetchEvents } from '../lib/GoogleCalendarApi'

export default async function GoogleSyncTask() {
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
  } catch (e) {
    console.warn('Sync failed', e)
  }
}
