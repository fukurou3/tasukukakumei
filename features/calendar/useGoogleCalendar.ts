// features/calendar/useGoogleCalendar.ts
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

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

  const loadEvents = useCallback(
    async (force = false) => {
      if (!enabled) {
        setEvents([]);
        return;
      }
      const url = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ICS_URL;
      if (!url) {
        setEvents([]);
        return;
      }

      const CACHE_KEY = "@google_calendar_cache";

      if (!force) {
        try {
          const raw = await AsyncStorage.getItem(CACHE_KEY);
          if (raw) {
            const { timestamp, events: cached } = JSON.parse(raw);
            if (dayjs().diff(dayjs(timestamp), "hour") < 6) {
              setEvents(cached);
              return;
            } else {
              setEvents(cached);
            }
          }
        } catch {}
      }

      setLoading(true);
      try {
        const res = await fetch(url);
        const text = await res.text();
        const parsed = parseICal(text);
        setEvents(parsed);
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: dayjs().toISOString(), events: parsed }),
        );
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const refresh = useCallback(() => loadEvents(true), [loadEvents]);

  return { events, loading, refresh };
};

export const parseICal = (ics: string): GoogleEvent[] => {
  const events: GoogleEvent[] = [];
  const lines = ics.split(/\r?\n/);
  let current: Partial<GoogleEvent> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = { isAllDay: false };
    } else if (line === "END:VEVENT") {
      if (
        current &&
        current.id &&
        current.start &&
        current.end &&
        current.title
      ) {
        events.push(current as GoogleEvent);
      }
      current = null;
    } else if (current) {
      if (line.startsWith("UID")) {
        current.id = line.substring(line.indexOf(":") + 1);
      } else if (line.startsWith("SUMMARY")) {
        current.title = line.substring(line.indexOf(":") + 1);
      } else if (line.startsWith("DTSTART")) {
        const value = line.substring(line.indexOf(":") + 1);
        current.start = icsDateToISO(value);
        if (line.includes("VALUE=DATE")) {
          current.isAllDay = true;
        }
      } else if (line.startsWith("DTEND")) {
        const value = line.substring(line.indexOf(":") + 1);
        current.end = icsDateToISO(value, current.isAllDay);
      }
    }
  }
  return events;
};

const icsDateToISO = (str: string, isAllDayEnd: boolean = false): string => {
  if (str.length === 8) {
    const d = dayjs(str, "YYYYMMDD");
    return isAllDayEnd
      ? d.subtract(1, "day").endOf("day").toISOString()
      : d.startOf("day").toISOString();
  }
  return dayjs(str.replace(/Z$/, ""), "YYYYMMDDTHHmmss").toISOString();
};
