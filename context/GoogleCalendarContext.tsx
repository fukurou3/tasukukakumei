import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import {
  useGoogleCalendarAllEvents,
  GoogleEvent,
} from "@/features/calendar/useGoogleCalendar";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CalendarContextType {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  events: GoogleEvent[];
  loading: boolean;
  refreshEvents: () => void;
}

const CalendarContext = createContext<CalendarContextType>({
  enabled: false,
  setEnabled: () => {},
  events: [],
  loading: false,
  refreshEvents: () => {},
});

const STORAGE_KEY = "GOOGLE_CALENDAR_ENABLED";

export const GoogleCalendarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [enabled, setEnabledState] = useState(false);
  const { events, loading, refresh } = useGoogleCalendarAllEvents(enabled);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setEnabledState(raw === "true");
    })();
  }, []);

  const setEnabled = async (v: boolean) => {
    setEnabledState(v);
    await AsyncStorage.setItem(STORAGE_KEY, v ? "true" : "false");
  };

  return (
    <CalendarContext.Provider
      value={{ enabled, setEnabled, events, loading, refreshEvents: refresh }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useGoogleCalendar = () => useContext(CalendarContext);
export const useGoogleCalendarSync = () => {
  const { enabled, setEnabled } = useContext(CalendarContext);
  return { enabled, setEnabled };
};
