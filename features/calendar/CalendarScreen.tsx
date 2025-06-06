// app/(tabs)/calendar/index.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, FlatList, Text, ActivityIndicator, Pressable, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';

import SkiaCalendar from '@/features/calendar/components/SkiaCalendar';
import { BACKGROUND_IMAGES } from '@/constants/CalendarBackgrounds';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useGoogleCalendarSync } from '@/context/GoogleCalendarContext';
import { useGoogleCalendarAllEvents, GoogleEvent } from '@/features/calendar/useGoogleCalendar';
import { groupTasksByDate, processMultiDayEvents } from '@/features/calendar/utils';
import type { Task } from '@/features/tasks/types';
import { STORAGE_KEY as TASKS_KEY } from '@/features/tasks/constants';
import { TaskItem } from '@/features/tasks/components/TaskItem';
import { createCalendarStyles } from '@/features/calendar/styles';
import { Ionicons } from '@expo/vector-icons';
const CALENDAR_BG_KEY = '@calendar_background_id';
const WEEKDAY_COLOR = '#888888';
const SUNDAY_COLOR = '#FF6666';
const SATURDAY_COLOR = '#66B2FF';

export default function CalendarPage() {
  const { t } = useTranslation();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const styles = createCalendarStyles(isDark, subColor);
  const router = useRouter();

  const { enabled: googleEnabled } = useGoogleCalendarSync();

  const [displayMonth, setDisplayMonth] = useState(dayjs());
  const [backgroundImage, setBackgroundImage] = useState<number | null>(null);
  const opacity = useSharedValue(1);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [viewType, setViewType] = useState<'list' | 'full'>('list');

  const { events: googleAllEvents, loading: googleLoading } = useGoogleCalendarAllEvents(googleEnabled);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedId = await AsyncStorage.getItem(CALENDAR_BG_KEY);
        const selectedImage = BACKGROUND_IMAGES.find(img => img.id === savedId);
        
        setBackgroundImage(selectedImage ? selectedImage.source : null);

        try {
          const rawTasks = await AsyncStorage.getItem(TASKS_KEY);
          setTasks(rawTasks ? JSON.parse(rawTasks) : []);
        } catch {
          setTasks([]);
        }
      };
      loadData();
    }, [])
  );

  const groupedTasks = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const eventLayout = useMemo(() => processMultiDayEvents(googleAllEvents, displayMonth), [googleAllEvents, displayMonth]);
  const dayTasks = useMemo(() => groupedTasks[selectedDate] || [], [groupedTasks, selectedDate]);
  const googleDayEvents = useMemo(() => {
    if (!googleEnabled) return [];
    return googleAllEvents.filter(ev => dayjs(ev.start).format('YYYY-MM-DD') === selectedDate);
  }, [googleAllEvents, selectedDate, googleEnabled]);

  const changeMonthJs = useCallback((direction: 'next' | 'prev') => {
    setDisplayMonth(current =>
      direction === 'next' ? current.add(1, 'month') : current.subtract(1, 'month')
    );
  }, []);

  const handleSwipe = useCallback((direction: 'next' | 'prev') => {
    'worklet';
    if (opacity.value !== 1) return;

    opacity.value = withTiming(0, { duration: 150 }, (isFinished) => {
      if (isFinished) {
        runOnJS(changeMonthJs)(direction);
        opacity.value = withTiming(1, { duration: 150 });
      }
    });
  }, [opacity, changeMonthJs]);

  const onDayPress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);
  
  const onTodayPress = useCallback(() => {
      const today = dayjs();
      setSelectedDate(today.format('YYYY-MM-DD'));
      if (!displayMonth.isSame(today, 'month')) {
          setDisplayMonth(today);
      }
  }, [displayMonth]);

  const toggleViewJs = () => {
    setViewType(v => (v === 'list' ? 'full' : 'list'));
  };

  const toggleView = useCallback(() => {
    'worklet';
    runOnJS(toggleViewJs)();
  }, []);

  const flingRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => handleSwipe('prev'));
  const flingLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(() => handleSwipe('next'));
  const flingUp = Gesture.Fling().direction(Directions.UP).onEnd(() => toggleView());
  const flingDown = Gesture.Fling().direction(Directions.DOWN).onEnd(() => toggleView());
  const composedGesture = Gesture.Race(flingLeft, flingRight, flingUp, flingDown);

  const renderTask = useCallback(({ item }: { item: Task }) => (
    <TaskItem
      task={{ ...item, keyId: item.id, displaySortDate: undefined, isTaskFullyCompleted: !!item.completedAt }}
      onToggle={() => {}}
      isSelecting={false}
      selectedIds={[]}
      onLongPressSelect={() => {}}
      currentTab="incomplete"
    />
  ), []);
  
  const renderGoogleEvent = useCallback((event: GoogleEvent) => (
     <View key={event.id} style={styles.googleEventContainer}>
        <Text style={styles.googleEvent}>{event.title}</Text>
     </View>
  ), [styles]);

  const renderListHeader = useCallback(() => {
    if (googleLoading && googleDayEvents.length === 0) {
      return <ActivityIndicator style={styles.headerItem} color={subColor} />;
    }
    if (googleDayEvents.length === 0) return null;

    return (
      <View style={styles.googleHeader}>
        <Text style={styles.googleHeaderText}>Google Calendar</Text>
        {googleDayEvents.map(renderGoogleEvent)}
      </View>
    );
  }, [googleDayEvents, googleLoading, subColor, renderGoogleEvent, styles]);
  
  const textColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
       <View style={styles.appBar}>
         <Text style={styles.titleText}>{t('calendar.title')}</Text>
       </View>
      <View style={[
        styles.calendarContainer,
        viewType === 'full' && styles.fullCalendarContainer,
      ]}>
        <View style={styles.monthHeader}>
             <Text style={styles.monthText}>
                 {displayMonth.format(t('common.year_month_format'))}
             </Text>
             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <Pressable onPress={onTodayPress} style={styles.todayButton}>
                     <Text style={styles.todayButtonText}>{t('common.today')}</Text>
                 </Pressable>
                 <Pressable onPress={toggleView} style={styles.toggleButton}>
                     <Ionicons name={viewType === 'list' ? 'calendar' : 'list'} size={20} color="#fff" />
                 </Pressable>
             </View>
        </View>
        <GestureDetector gesture={composedGesture}>
          <View style={[styles.calendarWrapper, viewType === 'full' && { flex: 1 }]}>
            <SkiaCalendar
              date={displayMonth}
              backgroundImage={backgroundImage}
              opacity={opacity}
              selectedDate={selectedDate}
            onDayPress={onDayPress}
            groupedTasks={groupedTasks}
            eventLayout={eventLayout}
            showTaskTitles={viewType === 'full'}
            theme={{
              primary: subColor,
              weekday: WEEKDAY_COLOR,
              day: textColor,
              saturday: SATURDAY_COLOR,
              sunday: SUNDAY_COLOR,
              line: isDark ? '#303030' : '#B0B0B5',
              background: isDark ? '#000000' : '#FFFFFF',
              eventText: '#FFFFFF',
            }}
          />
          </View>
        </GestureDetector>
      </View>
      {viewType === 'list' && (
        <FlatList
          data={dayTasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          ListHeaderComponent={renderListHeader}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { bottom: Platform.OS === 'ios' ? 16 : 16 }]}
        onPress={() => router.push({ pathname: '/add/', params: { date: selectedDate } })}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
