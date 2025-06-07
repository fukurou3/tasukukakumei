// features/calendar/useGoogleCalendar.ts
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useGoogleCalendarApi } from '@/lib/googleCalendarApi';

export type GoogleEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
};

export const useGoogleCalendarAllEvents = (enabled: boolean) => {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { syncEvents } = useGoogleCalendarApi();

  useEffect(() => {
    if (!enabled) {
      setEvents([]);
      return;
    }
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const ev = await syncEvents();
        setEvents(ev);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [enabled, syncEvents]);

  return { events, loading };
};

export const parseICal = (ics: string): GoogleEvent[] => {
  const events: GoogleEvent[] = [];
  const lines = ics.split(/\r?\n/);
  let current: Partial<GoogleEvent> | null = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = { isAllDay: false };
    } else if (line === 'END:VEVENT') {
      if (current && current.id && current.start && current.end && current.title) {
        events.push(current as GoogleEvent);
      }
      current = null;
    } else if (current) {
      if (line.startsWith('UID')) {
        current.id = line.substring(line.indexOf(':') + 1);
      } else if (line.startsWith('SUMMARY')) {
        current.title = line.substring(line.indexOf(':') + 1);
      } else if (line.startsWith('DTSTART')) {
        const value = line.substring(line.indexOf(':') + 1);
        current.start = icsDateToISO(value);
        if (line.includes('VALUE=DATE')) {
            current.isAllDay = true;
        }
      } else if (line.startsWith('DTEND')) {
        const value = line.substring(line.indexOf(':') + 1);
        current.end = icsDateToISO(value, current.isAllDay);
      }
    }
  }
  return events;
};

const icsDateToISO = (str: string, isAllDayEnd: boolean = false): string => {
  if (str.length === 8) {
    const d = dayjs(str, 'YYYYMMDD');
    return isAllDayEnd ? d.subtract(1, 'day').endOf('day').toISOString() : d.startOf('day').toISOString();
  }
  return dayjs(str.replace(/Z$/, ''), 'YYYYMMDDTHHmmss').toISOString();
};