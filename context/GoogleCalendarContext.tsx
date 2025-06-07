import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { getItem, setItem } from '@/lib/Storage';
import { registerBackgroundSync, unregisterBackgroundSync } from '../background/GoogleSyncScheduler';

interface CalendarSyncContextType {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const CalendarSyncContext = createContext<CalendarSyncContextType>({ enabled: false, setEnabled: () => {} });

const STORAGE_KEY = 'GOOGLE_CALENDAR_ENABLED';

export const GoogleCalendarProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await getItem(STORAGE_KEY);
      const init = raw === 'true';
      setEnabledState(init);
      if (init) {
        registerBackgroundSync();
      }
    })();
  }, []);

  const setEnabled = async (v: boolean) => {
    setEnabledState(v);
    await setItem(STORAGE_KEY, v ? 'true' : 'false');
    if (v) {
      await registerBackgroundSync();
    } else {
      await unregisterBackgroundSync();
    }
  };

  return (
    <CalendarSyncContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </CalendarSyncContext.Provider>
  );
};

export const useGoogleCalendarSync = () => useContext(CalendarSyncContext);
