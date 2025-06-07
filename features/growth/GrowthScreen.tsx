import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllTasksFromDB, initTasksDB } from '@/lib/tasksNative';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';
import { STORAGE_KEY as TASKS_KEY } from '@/features/tasks/constants';
import type { Task } from '@/features/tasks/types';

export default function GrowthScreen() {
  const { t } = useTranslation();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);

  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        await initTasksDB();
        const tasks: Task[] = await getAllTasksFromDB();
        setCompletedCount(tasks.filter(t => t.completedAt).length);
      } catch {
        setCompletedCount(0);
      }
    };
    load();
  }, []);

  const stage = Math.min(Math.floor(completedCount / 5), 3);
  const tree = ['\uD83C\uDF31', '\uD83C\uDF3F', '\uD83C\uDF33', '\uD83C\uDF32'][stage];

  const styles = createStyles(isDark, subColor, fontSizeKey);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.appBar}>
        <Text style={styles.title}>{t('growth.title')}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.tree}>{tree}</Text>
        <Text style={styles.description}>{t('growth.description')}</Text>
        <Text style={styles.count}>{t('growth.completed', { count: completedCount })}</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean, subColor: string, fontSizeKey: string) => {
  const baseFont = fontSizes[fontSizeKey as keyof typeof fontSizes] ?? 16;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#f2f2f4',
    },
    appBar: {
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#000000' : '#f2f2f4',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    tree: {
      fontSize: 80,
    },
    description: {
      marginTop: 16,
      fontSize: baseFont,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
    count: {
      marginTop: 8,
      fontSize: baseFont,
      color: subColor,
    },
  });
};
