// app/features/add/hooks/useSaveTask.ts
import { useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { Task, Draft } from '../types';
import { STORAGE_KEY, DRAFTS_KEY } from '../constants';
import { useTasksContext } from '@/context/TasksContext';
import type { DeadlineSettings, DeadlineTime } from '../components/DeadlineSettingModal/types';

dayjs.extend(utc);

interface SaveTaskParams {
  title: string;
  memo: string;
  imageUris: string[];
  notifyEnabled: boolean;
  customUnit?: 'minutes' | 'hours' | 'days';
  customAmount?: number;
  folder: string;
  currentDraftId: string | null;
  clearForm: () => void;
  t: (key: string, options?: any) => string;
  deadlineDetails?: DeadlineSettings;
}

const dateStringToUTCDate = (dateStr: string, time?: DeadlineTime): dayjs.Dayjs => {
    if (time) {
        // 時刻が指定されている場合、ローカルの日付と時刻で dayjs オブジェクトを生成し、それをUTCに変換
        const localDateTimeString = `${dateStr} ${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
        // dayjs(string) はローカルタイムゾーンとして解釈される
        return dayjs(localDateTimeString).utc();
    } else {
        // 時刻が指定されていない場合、日付文字列をUTCのその日の開始時刻 (00:00:00Z) として解釈
        // dayjs.utc(string) は文字列をUTCとして解釈する
        return dayjs.utc(dateStr).startOf('day');
    }
};

const dateToUTCISOString = (dateObj: dayjs.Dayjs, includeTime: boolean = true): string => {
    if (includeTime) {
        return dateObj.toISOString(); // 例: "2023-05-25T10:00:00.000Z"
    }
    // 時刻を含めない場合、YYYY-MM-DD形式 (UTC基準の日付)
    return dateObj.format('YYYY-MM-DD');
};

const formatTaskDeadlineISO = (settings?: DeadlineSettings): string | undefined => {
  if (!settings) return undefined;

  if (settings.repeatFrequency && settings.repeatStartDate) {
    // 繰り返し設定の場合、時刻は含めず日付のみとする (UTCの0時基準の日付)
    const firstInstanceStartDate = dateStringToUTCDate(settings.repeatStartDate); // timeなしで呼び出し
    return dateToUTCISOString(firstInstanceStartDate, false); // YYYY-MM-DD
  } else if (settings.taskDeadlineDate) { // 単発タスク
    if (settings.isTaskDeadlineTimeEnabled && settings.taskDeadlineTime) {
      // 時刻設定ありの場合
      const deadlineDate = dateStringToUTCDate(settings.taskDeadlineDate, settings.taskDeadlineTime);
      return dateToUTCISOString(deadlineDate, true); // ISO文字列 (時刻あり)
    }
    // 時刻設定なしの場合 (UTCの0時基準の日付)
    const deadlineDate = dateStringToUTCDate(settings.taskDeadlineDate); // timeなしで呼び出し
    return dateToUTCISOString(deadlineDate, true); // ISO文字列 (時刻あり、00:00:00Z)
                                                      // もし時刻なし (YYYY-MM-DD) で保存したい場合は第二引数を false にするが、
                                                      // DBや他機能との一貫性のため、時刻ありのISO文字列で統一する方が無難な場合もある
                                                      // ここでは、時刻設定なしの場合も便宜上00:00:00Zを含むISO文字列で返す
  }
  return undefined;
};


export const useSaveTask = ({
  title,
  memo,
  imageUris,
  notifyEnabled,
  customUnit,
  customAmount,
  folder,
  currentDraftId,
  clearForm,
  t,
  deadlineDetails,
}: SaveTaskParams) => {
  const router = useRouter();
  const { refresh } = useTasksContext();

  const saveTask = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert(t('add_task.alert_no_title'));
      return;
    }
    const taskId = uuid.v4() as string;
    const taskDeadlineValue = formatTaskDeadlineISO(deadlineDetails);

    let finalDeadlineDetails = deadlineDetails;
    if (finalDeadlineDetails?.repeatFrequency) {
        finalDeadlineDetails = {
            ...finalDeadlineDetails,
            // isTaskStartTimeEnabled: false, // 廃止済み
            // taskStartTime: undefined, // 廃止済み
        };
    }

    const newTask: Task = {
      id: taskId,
      title: title.trim(),
      memo,
      deadline: taskDeadlineValue,
      imageUris,
      notifyEnabled,
      customUnit: notifyEnabled ? customUnit : 'hours',
      customAmount: notifyEnabled ? customAmount : 1,
      folder,
      deadlineDetails: finalDeadlineDetails,
      completedInstanceDates: [],
      completedAt: undefined,
    };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const tasks: Task[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...tasks, newTask])
      );
      await refresh();
      Toast.show({ type: 'success', text1: t('add_task.task_added_successfully', 'タスクを追加しました') });
      clearForm();
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error("Failed to save task:", error);
      Toast.show({ type: 'error', text1: t('add_task.error_saving_task', 'タスクの保存に失敗しました') });
    }
  }, [
    title,
    memo,
    imageUris,
    notifyEnabled,
    customUnit,
    customAmount,
    folder,
    clearForm,
    router,
    t,
    deadlineDetails,
    refresh,
  ]);

  const saveDraft = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert(t('add_task.alert_no_title'));
      return;
    }
    const id = currentDraftId || (uuid.v4() as string);
    const draftDeadlineValue = formatTaskDeadlineISO(deadlineDetails);

    let finalDeadlineDetails = deadlineDetails;
    if (finalDeadlineDetails?.repeatFrequency) {
        finalDeadlineDetails = {
            ...finalDeadlineDetails,
            // isTaskStartTimeEnabled: false, // 廃止済み
            // taskStartTime: undefined, // 廃止済み
        };
    }

    const draftTask: Draft = {
      id,
      title: title.trim(),
      memo,
      deadline: draftDeadlineValue,
      imageUris,
      notifyEnabled,
      customUnit: notifyEnabled ? customUnit : 'hours',
      customAmount: notifyEnabled ? customAmount : 1,
      folder,
      deadlineDetails: finalDeadlineDetails,
      completedInstanceDates: deadlineDetails?.repeatFrequency ? [] : undefined,
      completedAt: undefined,
    };
    try {
      const raw = await AsyncStorage.getItem(DRAFTS_KEY);
      const drafts: Draft[] = raw ? JSON.parse(raw) : [];
      const newDrafts = drafts.filter(d => d.id !== id);
      newDrafts.push(draftTask);
      await AsyncStorage.setItem(
        DRAFTS_KEY,
        JSON.stringify(newDrafts)
      );
      Toast.show({
        type: 'success',
        text1: t('add_task.draft_saved_successfully', '下書きを保存しました'),
      });
      clearForm();
    } catch (error) {
      console.error("Failed to save draft:", error);
      Toast.show({ type: 'error', text1: t('add_task.error_saving_draft', '下書きの保存に失敗しました') });
    }
  }, [
    title,
    memo,
    imageUris,
    notifyEnabled,
    customUnit,
    customAmount,
    folder,
    currentDraftId,
    clearForm,
    t,
    deadlineDetails,
  ]);

  return { saveTask, saveDraft };
};