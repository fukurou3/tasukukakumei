import { useEffect, useState } from 'react';
import { NativeModules } from 'react-native';
import dayjs from 'dayjs';

export type NativeCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
};

const { OSCalendarModule } = NativeModules as any;

const monthCache: Record<string, NativeCalendarEvent[]> = {};

export const fetchEventsForMonth = async (month: dayjs.Dayjs): Promise<NativeCalendarEvent[]> => {
  const key = month.format('YYYY-MM');
  if (monthCache[key]) return monthCache[key];
  if (OSCalendarModule?.getEventsForMonth) {
    try {
      const events: NativeCalendarEvent[] = await OSCalendarModule.getEventsForMonth(
        month.year(),
        month.month() + 1
      );
      monthCache[key] = events;
      return events;
    } catch {
      return [];
    }
  }
  return [];
};

export const useOSCalendarEvents = (displayMonth: dayjs.Dayjs) => {
  const [events, setEvents] = useState<NativeCalendarEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetchEventsForMonth(displayMonth).then(ev => {
      if (isMounted) setEvents(ev);
    });
    // preload adjacent months
    fetchEventsForMonth(displayMonth.add(1, 'month')).then();
    fetchEventsForMonth(displayMonth.subtract(1, 'month')).then();
    return () => {
      isMounted = false;
    };
  }, [displayMonth]);

  return events;
};
