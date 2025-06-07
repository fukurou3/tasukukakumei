import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import type { Task } from '@/features/tasks/types';
import type { GoogleEvent } from '@/features/calendar/useGoogleCalendar';

const CALENDAR_ID = process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_ID || 'primary';
const SYNC_TOKEN_KEY = 'GCAL_SYNC_TOKEN';
const API_BASE = 'https://www.googleapis.com/calendar/v3';

export const useGoogleCalendarApi = () => {
  const { accessToken } = useGoogleAuth();

  const callApi = async <T>(method: string, path: string, body?: any): Promise<T> => {
    if (!accessToken) {
      throw new Error('No access token');
    }
    const res = await fetch(`${API_BASE}/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google API error: ${text}`);
    }
    return res.status === 204 ? ({} as T) : await res.json();
  };

  const syncEvents = async (): Promise<GoogleEvent[]> => {
    if (!accessToken) return [];
    let syncToken = await AsyncStorage.getItem(SYNC_TOKEN_KEY);
    const events: GoogleEvent[] = [];
    let pageToken: string | undefined;
    do {
      const params = new URLSearchParams({ singleEvents: 'true', maxResults: '2500' });
      if (pageToken) params.append('pageToken', pageToken);
      if (syncToken) {
        params.append('syncToken', syncToken);
      } else {
        params.append('showDeleted', 'true');
        params.append('timeMin', dayjs().subtract(1, 'year').toISOString());
      }
      const data = await callApi<any>('GET', `calendars/${CALENDAR_ID}/events?${params.toString()}`);
      data.items.forEach((item: any) => {
        if (item.status === 'cancelled') return;
        events.push({
          id: item.id,
          title: item.summary || '',
          start: item.start.dateTime || item.start.date,
          end: item.end.dateTime || item.end.date,
          isAllDay: !!item.start.date && !item.start.dateTime,
        });
      });
      pageToken = data.nextPageToken;
      if (data.nextSyncToken) {
        syncToken = data.nextSyncToken;
        await AsyncStorage.setItem(SYNC_TOKEN_KEY, syncToken);
      }
    } while (pageToken);
    return events;
  };

  const buildEventBody = (task: Task) => {
    if (!task.deadline) return null;
    const startIso = task.deadline;
    const endIso = dayjs(task.deadline).add(1, 'hour').toISOString();
    const timeEnabled = task.deadlineDetails?.isTaskDeadlineTimeEnabled;
    return {
      summary: task.title,
      description: task.memo,
      start: timeEnabled ? { dateTime: startIso } : { date: startIso.substring(0, 10) },
      end: timeEnabled ? { dateTime: endIso } : { date: startIso.substring(0, 10) },
    };
  };

  const createEvent = async (task: Task): Promise<string | null> => {
    const body = buildEventBody(task);
    if (!body) return null;
    const res = await callApi<any>('POST', `calendars/${CALENDAR_ID}/events`, body);
    return res.id as string;
  };

  const updateEvent = async (eventId: string, task: Task): Promise<void> => {
    const body = buildEventBody(task);
    if (!body) return;
    await callApi('PUT', `calendars/${CALENDAR_ID}/events/${eventId}`, body);
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    await callApi('DELETE', `calendars/${CALENDAR_ID}/events/${eventId}`);
  };

  return { syncEvents, createEvent, updateEvent, deleteEvent };
};
