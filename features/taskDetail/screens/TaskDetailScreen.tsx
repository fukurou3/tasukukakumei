// app/(tabs)/task-detail.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Share,
  Modal,
  BackHandler,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs'; // dayjs をインポート
import type { DeadlineSettings } from '@/features/add/components/DeadlineSettingModal/types'; // DeadlineSettings の型をインポート
import { getTimeText, getTimeColor } from '@/features/tasks/utils';

const STORAGE_KEY = 'TASKS';

type Task = {
  id: string;
  title: string;
  memo: string;
  deadline?: string; // deadline はオプショナルに変更
  imageUris: string[];
  notifyEnabled: boolean;
  customUnit: 'minutes' | 'hours' | 'days';
  customAmount: number;
  deadlineDetails?: DeadlineSettings; // deadlineDetails プロパティを追加
};

type TaskDetailStyles = {
  container: ViewStyle;
  appBar: ViewStyle;
  appBarTitle: TextStyle;
  backButton: ViewStyle;
  title: TextStyle;
  label: TextStyle;
  memo: TextStyle;
  field: TextStyle;
  countdown: TextStyle;
  image: ImageStyle;
  actionBar: ViewStyle;
  actionIcon: ViewStyle;
};

const createStyles = (isDark: boolean, subColor: string) =>
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
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      flex: 1,
      textAlign: 'center',
    },
    backButton: { padding: 8 },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      color: isDark ? '#fff' : '#000',
    },
    label: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 4,
      color: subColor,
    },
    memo: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#333',
    },
    field: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#333',
    },
    countdown: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 4,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginTop: 10,
    },
    actionBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? '#1E1E1E' : '#F8F8F8',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? '#3A3A3C' : '#C6C6C8',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 8,
      height: 60,
    },
    actionIcon: { alignItems: 'center', paddingHorizontal: 8 },
  });

  export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colorScheme, subColor } = useAppTheme();
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark, subColor);
  const { t, i18n } = useTranslation(); // i18n を追加

  const [task, setTask] = useState<Task | null>(null);
  const [tick, setTick] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

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
    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setTick((v) => v + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async () => {
      Alert.alert(
        t('task_detail.delete_confirm_title'),
        t('task_detail.delete_confirm'),
        [
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
                router.replace('/(tabs)/tasks'); // パスを修正 (tasks ディレクトリは通常不要)
              } catch (error) {
                console.error('Failed to delete task', error);
              }
            },
          },
        ]
      );
  };


  const handleEdit = () => {
    router.push({ pathname: '/add_edit', params: { id } });
  };

  const handleShare = async () => {
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
          <View style={{ width: 24 }} />
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
  const countdownColor = getTimeColor(task as any, isDark, effectiveDueDateUtc ?? undefined);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={subColor} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{t('task_detail.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={styles.title}>{task.title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.label}>{t('task_detail.deadline')}</Text>
          <TouchableOpacity onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color={subColor} />
          </TouchableOpacity>
        </View>
        <Text style={styles.field}>{deadlineText}</Text>
        <Text style={[styles.countdown, { color: countdownColor }]}>{countdownText}</Text>

        <Text style={styles.label}>{t('task_detail.memo')}</Text>
        <Text style={styles.memo}>{task.memo || '-'}</Text>

        {task.imageUris && task.imageUris.length > 0 && (
          <>
            <Text style={styles.label}>{t('task_detail.photo')}</Text>
            {task.imageUris.map((uri) => (
              <TouchableOpacity key={uri} onPress={() => setPreviewUri(uri)}>
                <Image source={{ uri }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <Modal visible={!!previewUri} transparent onRequestClose={() => setPreviewUri(null)}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setPreviewUri(null)}>
            {previewUri && <Image source={{ uri: previewUri }} style={{ width: '90%', height: '80%' }} resizeMode="contain" />}
          </TouchableOpacity>
        </Modal>
      </ScrollView>
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionIcon} onPress={handleDelete}>
          <Ionicons name="trash" size={28} color="red" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon} onPress={handleEdit}>
          <Ionicons name="create-outline" size={28} color={subColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={28} color={subColor} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
  }
