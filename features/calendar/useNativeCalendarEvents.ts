import { useEffect, useState } from 'react';
import CalendarEvents from 'react-native-calendar-events';
import dayjs from 'dayjs';

export type NativeCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
};

const cache: Record<string, NativeCalendarEvent[]> = {};

const monthKey = (d: dayjs.Dayjs) => d.format('YYYY-MM');

const fetchEventsForMonth = async (month: dayjs.Dayjs) => {
  const key = monthKey(month);
  if (cache[key]) return;
  try {
    const events = await CalendarEvents.fetchAllEvents(
      month.startOf('month').toISOString(),
      month.endOf('month').toISOString(),
      []
    );
    cache[key] = events.map(ev => ({
      id: ev.id,
      title: ev.title || '',
      start: ev.startDate,
      end: ev.endDate,
      isAllDay: !!ev.allDay,
    }));
  } catch {
    cache[key] = [];
  }
};

export const useNativeCalendarEvents = (month: dayjs.Dayjs) => {
  const [events, setEvents] = useState<NativeCalendarEvent[]>([]);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      const status = await CalendarEvents.requestPermissions();
      if (status !== 'authorized') {
        setEvents([]);
        return;
      }
      await fetchEventsForMonth(month);
      if (!canceled) {
        setEvents(cache[monthKey(month)]);
      }
      fetchEventsForMonth(month.add(1, 'month'));
      fetchEventsForMonth(month.subtract(1, 'month'));
    };
    load();
    return () => {
      canceled = true;
    };
  }, [month]);

  return events;
};
