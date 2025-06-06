// app/(tabs)/task-detail.tsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';
import dayjs from 'dayjs';
import type { DeadlineSettings } from '@/features/add/components/DeadlineSettingModal/types';
import { createStyles } from '../styles';

const STORAGE_KEY = 'TASKS';

type Task = {
  id: string;
  title: string;
  memo?: string;
  deadline?: string;
  imageUris?: string[];
  notifyEnabled?: boolean;
  customUnit?: 'minutes' | 'hours' | 'days';
  customAmount?: number;
  deadlineDetails?: DeadlineSettings;
};

const formatDeadlineForDisplay = (
  settings: DeadlineSettings | undefined,
  t: Function,
  lang: string
): string => {
  if (!settings) return t('common.not_set');
  const {
    taskDeadlineDate,
    isTaskDeadlineTimeEnabled,
    taskDeadlineTime,
    repeatFrequency,
    repeatStartDate,
  } = settings;
  if (repeatFrequency) {
    const map: Record<string, string> = {
      daily: 'deadline_modal.daily',
      weekly: 'deadline_modal.weekly',
      monthly: 'deadline_modal.monthly',
      yearly: 'deadline_modal.yearly',
      custom: 'deadline_modal.custom',
    };
    let text = t(map[repeatFrequency]);
    if (repeatStartDate) {
      const d = dayjs(repeatStartDate).format(lang.startsWith('ja') ? 'YYYY/MM/DD' : 'L');
      text += ` (${d})`;
    }
    return text;
  }
  if (taskDeadlineDate) {
    let d = dayjs(taskDeadlineDate).format(lang.startsWith('ja') ? 'YYYY/MM/DD' : 'L');
    if (isTaskDeadlineTimeEnabled && taskDeadlineTime) {
      d += ` ${String(taskDeadlineTime.hour).padStart(2, '0')}:${String(taskDeadlineTime.minute).padStart(2, '0')}`;
    }
    return d;
  }
  return t('common.not_set');
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = createStyles(isDark, subColor, fontSizeKey);
  const { t, i18n } = useTranslation();

  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      const found = list.find((t: Task) => t.id === id);
      if (found) setTask(found);
    })();
  }, [id]);

  const handleDelete = useCallback(() => {
    Alert.alert(t('task_detail.delete_confirm_title'), t('task_detail.delete_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const list = JSON.parse(raw);
            const updated = list.filter((t: Task) => t.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            router.replace('/(tabs)/tasks');
          } catch (e) {
            console.error('Failed to delete task', e);
          }
        },
      },
    ]);
  }, [id, router, t]);

  const handleEdit = useCallback(() => {
    router.push({ pathname: '/add_edit/index', params: { id } });
  }, [id, router]);

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={fontSizes[fontSizeKey]} color={subColor} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>{t('task_detail.title')}</Text>
          <View style={styles.appBarActionPlaceholder} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={subColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={fontSizes[fontSizeKey]} color={subColor} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{t('task_detail.title')}</Text>
        <View style={styles.appBarActionPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{task.title}</Text>

        {task.memo ? (
          <>
            <Text style={styles.label}>{t('task_detail.memo')}</Text>
            <Text style={styles.memo}>{task.memo}</Text>
          </>
        ) : null}

        <Text style={styles.label}>{t('task_detail.deadline')}</Text>
        <Text style={styles.field}>{formatDeadlineForDisplay(task.deadlineDetails, t, i18n.language)}</Text>

        {task.imageUris && task.imageUris.length > 0 && (
          <>
            <Text style={styles.label}>{t('task_detail.photo')}</Text>
            {task.imageUris.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.image} />
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>{t('task_detail.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
