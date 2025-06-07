// features/taskDetail/screens/TaskDetailScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Modal,
  BackHandler,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { useGoogleCalendarApi } from '@/lib/googleCalendarApi';
import { FontSizeContext } from '@/context/FontSizeContext';
import dayjs from 'dayjs';
import type { Task } from '@/features/add/types';
import { getTimeText } from '@/features/tasks/utils';
import { ConfirmModal } from '@/components/ConfirmModal';
import { createTaskDetailStyles } from '../styles';
import { TaskActionSheet } from '../components/TaskActionSheet';

const STORAGE_KEY = 'TASKS';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = createTaskDetailStyles(isDark, subColor, fontSizeKey);
  const { width: screenWidth } = useWindowDimensions();
  const imageMargin = 8;
  const imageSize = (screenWidth - 40 - imageMargin * 2) / 3;
  const { t, i18n } = useTranslation();
  const { isSignedIn } = useGoogleAuth();
  const { deleteEvent } = useGoogleCalendarApi();

  const [task, setTask] = useState<Task | null>(null);
  const [tick, setTick] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      const found = list.find((t: Task) => t.id === id);
      if (found) setTask(found);
    })();
  }, [id]);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setTick((v) => v + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = () => {
    setIsActionModalVisible(false);
    setTimeout(() => {
      setIsDeleteConfirmVisible(true);
    }, 100);
  };

  const confirmDelete = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      const target = list.find((t: Task) => t.id === id);
      const updated = list.filter((t: Task) => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (isSignedIn && target?.googleEventId) {
        try { await deleteEvent(target.googleEventId); } catch {}
      }
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error('Failed to delete task', error);
    } finally {
      setIsDeleteConfirmVisible(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmVisible(false);
  };

  const handleToggleDone = async () => {
    if (!task) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: Task[] = JSON.parse(raw);
      const dueDateUtc = task.deadline ? dayjs.utc(task.deadline) : null;
      const newTasks = list.map(t => {
        if (t.id === task.id) {
          if (t.deadlineDetails?.repeatFrequency && dueDateUtc) {
            const instanceDateStr = dueDateUtc.format('YYYY-MM-DD');
            let dates = t.completedInstanceDates ? [...t.completedInstanceDates] : [];
            if (dates.includes(instanceDateStr)) {
              dates = dates.filter(d => d !== instanceDateStr);
            } else {
              dates.push(instanceDateStr);
            }
            const updated = { ...t, completedInstanceDates: dates } as Task;
            setTask(updated);
            return updated;
          } else {
            const updated = { ...t, completedAt: t.completedAt ? undefined : dayjs.utc().toISOString() } as Task;
            setTask(updated);
            return updated;
          }
        }
        return t;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error('toggle done error', e);
    }
  };

  const handleEdit = () => {
    setIsActionModalVisible(false);
    router.push({ pathname: '/add_edit', params: { id } });
  };

  const handleShare = async () => {
    setIsActionModalVisible(false);
    if (!task) return;
    try {
      await Share.share({ message: `${task.title}\n${task.memo}` });
    } catch (e) {
      console.error('share error', e);
    }
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={subColor} />
            <Text style={styles.backButtonText}>{t('common.detail')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.memo}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const deadlineText = task.deadline
    ? dayjs(task.deadline).format(i18n.language.startsWith('ja') ? 'YYYY/MM/DD' : 'L') +
      (task.deadlineDetails?.isTaskDeadlineTimeEnabled ? ` ${dayjs(task.deadline).format('HH:mm')}` : '')
    : t('common.not_set');

  const effectiveDueDateUtc = task.deadline ? dayjs.utc(task.deadline) : null;
  const countdownText = getTimeText(task as any, t, effectiveDueDateUtc ?? undefined);

  const isDone = task.deadlineDetails?.repeatFrequency && effectiveDueDateUtc
    ? task.completedInstanceDates?.includes(effectiveDueDateUtc.format('YYYY-MM-DD')) ?? false
    : !!task.completedAt;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={subColor} />
          <Text style={styles.backButtonText}>{t('common.detail')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction} onPress={() => setIsActionModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={subColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>{task.title}</Text>

        <Text style={styles.field} numberOfLines={1}>
          {`${deadlineText} ${countdownText}`}
        </Text>

        <Text style={styles.label}>{t('task_detail.memo')}</Text>
        <Text style={styles.memo}>{task.memo || '-'}</Text>

        {task.imageUris && task.imageUris.length > 0 && (
          <>
            <Text style={styles.label}>{t('task_detail.photo')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {task.imageUris.map((uri, index) => (
                <TouchableOpacity
                  key={uri}
                  onPress={() => setPreviewUri(uri)}
                  style={{ width: imageSize, height: imageSize, marginBottom: imageMargin, marginRight: (index + 1) % 3 !== 0 ? imageMargin : 0 }}
                >
                  <Image source={{ uri }} style={styles.image} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Modal visible={!!previewUri} transparent onRequestClose={() => setPreviewUri(null)}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setPreviewUri(null)}>
            {previewUri && <Image source={{ uri: previewUri }} style={{ width: '90%', height: '80%' }} resizeMode="contain" />}
          </TouchableOpacity>
        </Modal>
      </ScrollView>

      <TaskActionSheet
        visible={isActionModalVisible}
        onClose={() => setIsActionModalVisible(false)}
        onToggleDone={handleToggleDone}
        onEdit={handleEdit}
        onShare={handleShare}
        onDelete={handleDelete}
        isDone={isDone}
        styles={styles}
        subColor={subColor}
      />

      <ConfirmModal
        visible={isDeleteConfirmVisible}
        title={t('task_detail.delete_confirm_title')}
        message={t('task_detail.delete_confirm')}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isOkDestructive
      />
    </SafeAreaView>
  );
}