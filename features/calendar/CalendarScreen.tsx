// // features/calendar/CalendarScreen.tsx
// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
// import { Calendar, CalendarUtils } from 'react-native-calendars';
// import type { DateData } from 'react-native-calendars';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useTranslation } from 'react-i18next';
// import { useAppTheme } from '@/hooks/ThemeContext';
// import { useGoogleCalendarSync } from '@/context/GoogleCalendarContext';
// import { groupTasksByDate, createMarkedDates, getHolidayMarksForMonths } from './utils';
// import { useGoogleCalendarAllEvents } from './useGoogleCalendar';
// import type { Task } from '@/features/tasks/types';
// import { STORAGE_KEY as TASKS_KEY } from '@/features/tasks/constants';
// import { TaskItem } from '@/features/tasks/components/TaskItem';
// import dayjs from 'dayjs';

// export default function CalendarScreen() {
//   const { t, i18n } = useTranslation();
//   const { colorScheme, subColor } = useAppTheme();
//   const { enabled: googleEnabled } = useGoogleCalendarSync();

//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedDate, setSelectedDate] = useState<string>(CalendarUtils.getCalendarDateString(new Date()));
//   const [holidayMarks, setHolidayMarks] = useState<Record<string, any>>({});
//   const [currentMonth, setCurrentMonth] = useState(() => dayjs());

//   const { events: googleAllEvents, loading: googleLoading } = useGoogleCalendarAllEvents(googleEnabled);

//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         const raw = await AsyncStorage.getItem(TASKS_KEY);
//         setTasks(raw ? JSON.parse(raw) : []);
//       } catch {
//         setTasks([]);
//       }
//     };
//     loadTasks();
//   }, []);
  
//   useEffect(() => {
//     if (i18n.language.startsWith('ja')) {
//       setHolidayMarks(getHolidayMarksForMonths([currentMonth], {}));
//     }
//   }, [i18n.language, currentMonth]);

//   const groupedTasks = useMemo(() => groupTasksByDate(tasks), [tasks]);

//   const marked = useMemo(
//     () => createMarkedDates(groupedTasks, selectedDate, holidayMarks, subColor),
//     [groupedTasks, selectedDate, holidayMarks, subColor]
//   );

//   const dayTasks = useMemo(() => groupedTasks[selectedDate] || [], [groupedTasks, selectedDate]);

//   const googleDayEvents = useMemo(() => {
//     if (!googleEnabled) return [];
//     return googleAllEvents.filter(ev => dayjs(ev.start).format('YYYY-MM-DD') === selectedDate);
//   }, [googleAllEvents, selectedDate, googleEnabled]);


//   const onDayPress = useCallback((day: DateData) => {
//     setSelectedDate(day.dateString);
//   }, []);
  
//   const onMonthChange = useCallback((date: DateData) => {
//     setCurrentMonth(dayjs(date.dateString));
//   }, []);

//   const renderTask = useCallback(({ item }: { item: Task }) => (
//     <TaskItem
//       task={{ ...item, keyId: item.id, displaySortDate: undefined, isTaskFullyCompleted: !!item.completedAt }}
//       onToggle={() => {}}
//       isSelecting={false}
//       selectedIds={[]}
//       onLongPressSelect={() => {}}
//       currentTab="incomplete"
//     />
//   ), []);

//   const renderHeader = useCallback(() => {
//     if (googleLoading) {
//       return <ActivityIndicator style={styles.headerItem} color={subColor} />;
//     }
//     if (googleDayEvents.length === 0) return null;

//     return (
//       <View style={styles.googleHeader}>
//         <Text style={[styles.googleHeaderText, { color: subColor }]}>Google Calendar</Text>
//         {googleDayEvents.map(ev => (
//           <Text key={ev.id} style={[styles.googleEvent, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{ev.title}</Text>
//         ))}
//       </View>
//     );
//   }, [googleDayEvents, googleLoading, subColor, colorScheme]);

//   return (
//     <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
//       <Calendar
//         current={selectedDate}
//         markedDates={marked}
//         onDayPress={onDayPress}
//         onMonthChange={onMonthChange}
//         enableSwipeMonths={true}
//         theme={{
//           calendarBackground: colorScheme === 'dark' ? '#000' : '#fff',
//           dayTextColor: colorScheme === 'dark' ? '#fff' : '#000',
//           monthTextColor: subColor,
//           textSectionTitleColor: colorScheme === 'dark' ? '#555' : '#b6c1cd',
//           textDayFontWeight: '500',
//           arrowColor: subColor,
//         }}
//       />
//       <FlatList
//         data={dayTasks}
//         keyExtractor={item => item.id}
//         renderItem={renderTask}
//         ListHeaderComponent={renderHeader}
//         style={styles.list}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   list: { flex: 1 },
//   headerItem: { marginVertical: 16 },
//   googleHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
//   googleHeaderText: { fontWeight: 'bold', marginBottom: 8 },
//   googleEvent: { paddingLeft: 8, paddingTop: 4, fontSize: 14 },
// });