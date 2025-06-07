import { NativeModules } from 'react-native'

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

export default EventsDatabase as EventsDatabaseModule
