import { useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { Task } from '../types';
import { STORAGE_KEY } from '../constants';
import type { DeadlineSettings, DeadlineTime } from '../components/DeadlineSettingModal/types';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { useGoogleCalendarApi } from '@/lib/googleCalendarApi';

dayjs.extend(utc);

interface UpdateTaskParams {
  id: string;
  title: string;
  memo: string;
  imageUris: string[];
  notifyEnabled: boolean;
  customUnit?: 'minutes' | 'hours' | 'days';
  customAmount?: number;
  folder: string;
  t: (key: string, options?: any) => string;
  deadlineDetails?: DeadlineSettings;
}

const dateStringToUTCDate = (dateStr: string, time?: DeadlineTime): dayjs.Dayjs => {
  if (time) {
    const localDateTimeString = `${dateStr} ${String(time.hour).padStart(2,'0')}:${String(time.minute).padStart(2,'0')}`;
    return dayjs(localDateTimeString).utc();
  }
  return dayjs.utc(dateStr).startOf('day');
};

const dateToUTCISOString = (dateObj: dayjs.Dayjs, includeTime: boolean = true): string => {
  if (includeTime) return dateObj.toISOString();
  return dateObj.format('YYYY-MM-DD');
};

export const formatTaskDeadlineISO = (settings?: DeadlineSettings): string | undefined => {
  if (!settings) return undefined;
  if (settings.repeatFrequency && settings.repeatStartDate) {
    const firstInstanceStartDate = dateStringToUTCDate(settings.repeatStartDate);
    return dateToUTCISOString(firstInstanceStartDate, false);
  } else if (settings.taskDeadlineDate) {
    if (settings.isTaskDeadlineTimeEnabled && settings.taskDeadlineTime) {
      const deadlineDate = dateStringToUTCDate(settings.taskDeadlineDate, settings.taskDeadlineTime);
      return dateToUTCISOString(deadlineDate, true);
    }
    const deadlineDate = dateStringToUTCDate(settings.taskDeadlineDate);
    return dateToUTCISOString(deadlineDate, true);
  }
  return undefined;
};

export const useUpdateTask = ({
  id,
  title,
  memo,
  imageUris,
  notifyEnabled,
  customUnit,
  customAmount,
  folder,
  t,
  deadlineDetails,
}: UpdateTaskParams) => {
  const router = useRouter();
  const { isSignedIn } = useGoogleAuth();
  const { createEvent, updateEvent } = useGoogleCalendarApi();

  const updateTask = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert(t('edit_task.alert_no_title'));
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const tasks: Task[] = raw ? JSON.parse(raw) : [];
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) {
        Toast.show({ type: 'error', text1: t('add_task.error_saving_task', '保存に失敗しました') });
        return;
      }
      const taskDeadlineValue = formatTaskDeadlineISO(deadlineDetails);
      let finalDeadlineDetails = deadlineDetails;
      if (finalDeadlineDetails?.repeatFrequency) {
        finalDeadlineDetails = { ...finalDeadlineDetails };
      }
      tasks[index] = {
        ...tasks[index],
        title: title.trim(),
        memo,
        deadline: taskDeadlineValue,
        imageUris,
        notifyEnabled,
        customUnit: notifyEnabled ? (customUnit ?? 'hours') : 'hours',
        customAmount: notifyEnabled ? (customAmount ?? 1) : 1,
        folder,
        deadlineDetails: finalDeadlineDetails,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

      const updatedTask = tasks[index];
      if (isSignedIn && updatedTask.deadline && !updatedTask.deadlineDetails?.repeatFrequency) {
        try {
          if (updatedTask.googleEventId) {
            await updateEvent(updatedTask.googleEventId, updatedTask);
          } else {
            const eventId = await createEvent(updatedTask);
            if (eventId) {
              updatedTask.googleEventId = eventId;
              tasks[index] = updatedTask;
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            }
          }
        } catch (e) {
          console.error('Failed to sync google event', e);
        }
      }
      Toast.show({ type: 'success', text1: t('edit_task.save_success') });
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error('Failed to update task:', error);
      Toast.show({ type: 'error', text1: t('add_task.error_saving_task', '保存に失敗しました') });
    }
  }, [id, title, memo, imageUris, notifyEnabled, customUnit, customAmount, folder, t, deadlineDetails, router, isSignedIn, createEvent, updateEvent]);

  return { updateTask };
};
