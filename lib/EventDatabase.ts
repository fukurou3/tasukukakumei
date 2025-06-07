import { NativeModules } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type EventRecord = {
  id: string
  [key: string]: any
}

interface EventsDatabaseModule {
  initialize(): Promise<void>
  saveEvent(event: EventRecord): Promise<void>
  getAllEvents(): Promise<string[]>
  deleteEvent(id: string): Promise<void>
  clearEvents(): Promise<void>
}

const { EventsDatabase } = NativeModules

const EVENTS_KEY = 'EVENTS'

async function loadAll(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(EVENTS_KEY)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as EventRecord[]
    return arr.map(e => JSON.stringify(e))
  } catch {
    return []
  }
}

async function save(event: EventRecord) {
  const raw = await AsyncStorage.getItem(EVENTS_KEY)
  const events: EventRecord[] = raw ? JSON.parse(raw) : []
  const index = events.findIndex(e => e.id === event.id)
  if (index !== -1) {
    events[index] = event
  } else {
    events.push(event)
  }
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

async function remove(id: string) {
  const raw = await AsyncStorage.getItem(EVENTS_KEY)
  if (!raw) return
  const events: EventRecord[] = JSON.parse(raw)
  const filtered = events.filter(e => e.id !== id)
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filtered))
}

async function clearStorage() {
  await AsyncStorage.removeItem(EVENTS_KEY)
}

const fallback: EventsDatabaseModule = {
  initialize: async () => {},
  saveEvent: save,
  getAllEvents: loadAll,
  deleteEvent: remove,
  clearEvents: clearStorage,
}

export default (EventsDatabase ?? fallback) as EventsDatabaseModule
