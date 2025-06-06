// features/taskDetail/screens/TaskDetailScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Share,
  Modal,
  BackHandler,
  useWindowDimensions,
  Platform,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext, type FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';
import dayjs from 'dayjs';
import type { Task } from '@/features/add/types';
import { getTimeText } from '@/features/tasks/utils';
import { ConfirmModal } from '@/components/ConfirmModal';

const STORAGE_KEY = 'TASKS';

type TaskDetailStyles = {
  container: ViewStyle;
  appBar: ViewStyle;
  appBarTitle: TextStyle;
  backButton: ViewStyle;
  headerAction: ViewStyle;
  title: TextStyle;
  label: TextStyle;
  memo: TextStyle;
  field: TextStyle;
  countdown: TextStyle;
  image: ImageStyle;
  modalOverlay: ViewStyle;
  actionSheetContainer: ViewStyle;
  actionSheetItem: ViewStyle;
  actionSheetIcon: TextStyle;
  actionSheetText: TextStyle;
  actionSheetDestructiveText: TextStyle;
  actionSheetSeparator: ViewStyle;
};

const createStyles = (isDark: boolean, subColor: string, fsKey: FontSizeKey) =>
  StyleSheet.create<TaskDetailStyles>({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    appBar: {
      height: 56,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    appBarTitle: {
      fontSize: fontSizes[fsKey] + 4,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    backButton: { padding: 8 },
    headerAction: {
      padding: 8,
    },
    title: {
      fontSize: fontSizes[fsKey] + 8,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'left',
      color: isDark ? '#fff' : '#000',
    },
    label: {
      fontSize: fontSizes[fsKey],
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 4,
      color: subColor,
    },
    memo: {
      fontSize: fontSizes[fsKey] + 4,
      color: isDark ? '#ccc' : '#333',
    },
    field: {
      fontSize: fontSizes[fsKey],
      color: isDark ? '#ccc' : '#333',
    },
    countdown: {
      fontSize: fontSizes[fsKey] + 2,
      fontWeight: '600',
      marginTop: 4,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    actionSheetContainer: {
      backgroundColor: isDark ? '#1E1E1E' : '#F8F8F8',
      borderRadius: 12,
      marginHorizontal: 10,
      marginBottom: 30,
      overflow: 'hidden',
    },
    actionSheetItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
    },
    actionSheetIcon: {
      marginRight: 20,
    },
    actionSheetText: {
      fontSize: fontSizes[fsKey] + 2,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    actionSheetDestructiveText: {
      fontSize: fontSizes[fsKey] + 2,
      color: '#FF3B30',
    },
    actionSheetSeparator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? '#3A3A3C' : '#C6C6C8',
    },
  });

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = createStyles(isDark, subColor, fontSizeKey);
  const { width: screenWidth } = useWindowDimensions();
  const imageMargin = 8;
  const imageSize = (screenWidth - 40 - imageMargin * 2) / 3;
  const { t, i18n } = useTranslation();

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
      const updated = list.filter((t: Task) => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
    setIsActionModalVisible(false);
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
            <Ionicons name="arrow-back" size={24} color={subColor} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>{t('task_detail.title')}</Text>
          <View style={{ width: Platform.OS === 'ios' ? 40 : 24 }} />
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
          <Ionicons name="arrow-back" size={24} color={subColor} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle} numberOfLines={1}>{task.title}</Text>
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

      <Modal
        animationType="slide"
        transparent
        visible={isActionModalVisible}
        onRequestClose={() => setIsActionModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsActionModalVisible(false)}>
          <Pressable style={styles.actionSheetContainer}>
            <View>
              <TouchableOpacity style={styles.actionSheetItem} onPress={handleToggleDone}>
                <Ionicons
                  name={isDone ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={subColor}
                  style={styles.actionSheetIcon}
                />
                <Text style={styles.actionSheetText}>
                  {isDone ? t('task_detail.mark_as_not_done') : t('task_detail.mark_as_done')}
                </Text>
              </TouchableOpacity>
              <View style={styles.actionSheetSeparator} />
              <TouchableOpacity style={styles.actionSheetItem} onPress={handleEdit}>
                <Ionicons name="create-outline" size={24} color={subColor} style={styles.actionSheetIcon} />
                <Text style={styles.actionSheetText}>{t('task_detail.edit')}</Text>
              </TouchableOpacity>
              <View style={styles.actionSheetSeparator} />
              <TouchableOpacity style={styles.actionSheetItem} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={24} color={subColor} style={styles.actionSheetIcon} />
                <Text style={styles.actionSheetText}>{t('task_detail.share')}</Text>
              </TouchableOpacity>
              <View style={styles.actionSheetSeparator} />
              <TouchableOpacity style={styles.actionSheetItem} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" style={styles.actionSheetIcon} />
                <Text style={styles.actionSheetDestructiveText}>{t('task_detail.delete')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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