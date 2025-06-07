import EventDatabase, { EventRecord } from './EventDatabase'

export async function initEventsDB() {
  try {
    await EventDatabase.initialize()
  } catch {}
}

export async function getAllEventsFromDB(): Promise<EventRecord[]> {
  const rows = await EventDatabase.getAllEvents()
  return rows.map(r => JSON.parse(r))
}

export async function saveEventToDB(event: EventRecord) {
  await EventDatabase.saveEvent(event)
}

export async function deleteEventFromDB(id: string) {
  await EventDatabase.deleteEvent(id)
}

export async function clearEventsFromDB() {
  await EventDatabase.clearEvents()
}
