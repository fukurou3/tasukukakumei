import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setEnabledState(raw === 'true');
    })();
  }, []);

  const setEnabled = async (v: boolean) => {
    setEnabledState(v);
    await AsyncStorage.setItem(STORAGE_KEY, v ? 'true' : 'false');
  };

  return (
    <CalendarSyncContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </CalendarSyncContext.Provider>
  );
};

export const useGoogleCalendarSync = () => useContext(CalendarSyncContext);
