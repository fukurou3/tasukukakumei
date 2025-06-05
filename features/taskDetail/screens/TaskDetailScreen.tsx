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
  image: ImageStyle;
  deleteButton: ViewStyle;
  deleteButtonText: TextStyle;
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
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    appBarTitle: {
      fontSize: 25,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginLeft: 16,
    },
    backButton: {
      padding: 8,
    },
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
    image: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginTop: 10,
    },
    deleteButton: {
      backgroundColor: 'red',
      marginTop: 30,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colorScheme, subColor } = useAppTheme();
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark, subColor);
    const { t, i18n } = useTranslation(); // i18n を追加

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

    if (!task) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.appBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={subColor} />
            </TouchableOpacity>
            <Text style={styles.appBarTitle}>{t('task_detail.title')}</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.memo}>{t('common.loading')}</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={subColor} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>{t('task_detail.title')}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.title}>{task.title}</Text>

          <Text style={styles.label}>{t('task_detail.memo')}</Text>
          <Text style={styles.memo}>{task.memo || '-'}</Text>

          <Text style={styles.label}>{t('task_detail.deadline')}</Text>
          <Text style={styles.field}>
            {task.deadline ? dayjs(task.deadline).format(i18n.language.startsWith('ja') ? 'YYYY/MM/DD' : 'L') : t('common.not_set')}
            {task.deadline && task.deadlineDetails?.isTaskDeadlineTimeEnabled ? (
              ` ${dayjs(task.deadline).format('HH:mm')}`
            ) : ''}
          </Text>

          {task.imageUris && task.imageUris.length > 0 && ( // task.imageUris が undefined でないかチェック
            <>
              <Text style={styles.label}>{t('task_detail.photo')}</Text>
              {task.imageUris.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.image} />
              ))}
            </>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }