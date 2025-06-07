// features/calendar/useGoogleCalendar.ts
import { useState, useEffect, useCallback } from 'react'
import {
  fetchEvents,
  insertEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  type GoogleEventInput,
} from '@/lib/GoogleCalendarApi'

export type GoogleEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
};

export const useGoogleCalendarAllEvents = (enabled: boolean) => {
  const [events, setEvents] = useState<GoogleEvent[]>([])
  const [loading, setLoading] = useState(false)

  const mapApiEvent = useCallback((item: any): GoogleEvent => {
    const start = item.start.dateTime || item.start.date
    const end = item.end.dateTime || item.end.date
    return {
      id: item.id,
      title: item.summary ?? '',
      start,
      end,
      isAllDay: !!item.start.date,
    }
  }, [])

  const loadEvents = useCallback(async () => {
    if (!enabled) {
      setEvents([])
      return
    }
    setLoading(true)
    try {
      const result = await fetchEvents()
      const parsed = Array.isArray(result.items) ? result.items.map(mapApiEvent) : []
      setEvents(parsed)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [enabled, mapApiEvent])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const createEvent = useCallback(async (input: GoogleEventInput) => {
    const created = await insertEvent(input)
    const event = mapApiEvent(created)
    setEvents(prev => [...prev, event])
    return event
  }, [mapApiEvent])

  const updateEvent = useCallback(async (id: string, input: GoogleEventInput) => {
    const updated = await apiUpdateEvent(id, input)
    const event = mapApiEvent(updated)
    setEvents(prev => prev.map(e => (e.id === id ? event : e)))
    return event
  }, [mapApiEvent])

  const deleteEvent = useCallback(async (id: string) => {
    await apiDeleteEvent(id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  return { events, loading, reload: loadEvents, createEvent, updateEvent, deleteEvent }
}
