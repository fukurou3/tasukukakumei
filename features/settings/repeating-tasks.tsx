// app/features/settings/repeating-tasks.tsx
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import TasksDatabase from '@/lib/TaskDatabase';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext, FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import { Ionicons } from '@expo/vector-icons';

import type { Task } from '@/features/tasks/types';
import type { DeadlineSettings, RepeatFrequency, CustomIntervalUnit } from '@/features/add/components/DeadlineSettingModal/types';
import { DeadlineSettingModal } from '@/features/add/components/DeadlineSettingModal';
import { ConfirmModal } from '@/components/ConfirmModal';


const STORAGE_KEY = 'TASKS';

const formatRepeatSettingsForDisplay = (settings: DeadlineSettings | undefined, t: Function): string => {
  if (!settings || !settings.repeatFrequency) {
    return t('common.not_set');
  }

  let displayText = '';
  const frequencyKeyMap: Record<RepeatFrequency, string> = {
    daily: 'deadline_modal.daily',
    weekly: 'deadline_modal.weekly',
    monthly: 'deadline_modal.monthly',
    yearly: 'deadline_modal.yearly',
    custom: 'deadline_modal.custom',
  };
  displayText = t(frequencyKeyMap[settings.repeatFrequency]);

  if (settings.repeatFrequency === 'custom' && settings.customIntervalValue && settings.customIntervalUnit) {
    displayText = t(`deadline_modal.every_x_${settings.customIntervalUnit}`, { count: settings.customIntervalValue });
  }

  if (settings.repeatFrequency) {
      displayText += ` (${t('common.all_day')})`;
  }

  return displayText;
};


export default function RepeatingTasksScreen() {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { fontSizeKey } = useContext(FontSizeContext);
  const router = useRouter();
  const styles = createRepeatingTasksStyles(isDark, subColor, fontSizeKey);

  const [repeatingTasks, setRepeatingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeadlineModalVisible, setIsDeadlineModalVisible] = useState(false);

  const [isStopConfirmModalVisible, setIsStopConfirmModalVisible] = useState(false);
  const [taskPendingStop, setTaskPendingStop] = useState<Task | null>(null);

  const loadRepeatingTasks = useCallback(async () => {
    try {
      await TasksDatabase.initialize();
      const rawTasks = await TasksDatabase.getAllTasks();
      const allTasks: Task[] = rawTasks.map(r => JSON.parse(r));
      const filteredTasks = allTasks.filter(
        task => task.deadlineDetails && task.deadlineDetails.repeatFrequency
      );
      setRepeatingTasks(filteredTasks);
    } catch (e) {
      setRepeatingTasks([]);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  }, [loading]);

  useFocusEffect(
    useCallback(() => {
      loadRepeatingTasks();
    }, [loadRepeatingTasks])
  );

  const handleEditRepeatSettings = (task: Task) => {
    setEditingTask(task);
    setIsDeadlineModalVisible(true);
  };

  const handleRequestStopRepeating = (task: Task) => {
    setTaskPendingStop(task);
    setIsStopConfirmModalVisible(true);
  };

  const saveTaskUpdate = async (taskToUpdate: Task, newDeadlineSettings?: DeadlineSettings) => {
    const taskIdToUpdate = taskToUpdate.id;
    let finalDeadlineDetails: DeadlineSettings | undefined;

    if (newDeadlineSettings === undefined) {
        const baseSettings = taskToUpdate.deadlineDetails || {};
        finalDeadlineDetails = {
            taskDeadlineDate: baseSettings.taskDeadlineDate,
            taskDeadlineTime: baseSettings.taskDeadlineTime,
            isTaskDeadlineTimeEnabled: baseSettings.isTaskDeadlineTimeEnabled,
            // isPeriodSettingEnabled: baseSettings.isPeriodSettingEnabled, // プロパティが存在しないというエラー(107)に基づきコメントアウト
            // periodStartDate: baseSettings.periodStartDate, // プロパティが存在しないというエラー(108)に基づきコメントアウト
            // periodStartTime: baseSettings.periodStartTime, // プロパティが存在しないというエラー(109)に基づきコメントアウト
            repeatFrequency: undefined,
            repeatStartDate: undefined,
            repeatDaysOfWeek: undefined,
            repeatEnds: undefined,
            isExcludeHolidays: undefined,
            customIntervalValue: undefined,
            customIntervalUnit: undefined,
        };
    } else {
        finalDeadlineDetails = newDeadlineSettings;
    }

    try {
        await TasksDatabase.initialize();
        const rawTasks = await TasksDatabase.getAllTasks();
        let allTasks: Task[] = rawTasks.map(r => JSON.parse(r));
        const taskIndex = allTasks.findIndex(t => t.id === taskIdToUpdate);

        if (taskIndex !== -1) {
            const updatedTask = {
                ...allTasks[taskIndex],
                deadlineDetails: finalDeadlineDetails,
            };
            try {
                const { formatTaskDeadlineISO } = require('@/features/add/hooks/useSaveTask');
                if (typeof formatTaskDeadlineISO === 'function') {
                     updatedTask.deadline = formatTaskDeadlineISO(finalDeadlineDetails) || undefined;
                } else {
                    updatedTask.deadline = undefined;
                }
            } catch (e) {
                updatedTask.deadline = undefined;
            }
            allTasks[taskIndex] = updatedTask;
            await TasksDatabase.saveTask(updatedTask as any);
            loadRepeatingTasks();
        }
    } catch (error) {
    }
  };

  const handleConfirmStopRepeatingAction = async () => {
    if (!taskPendingStop) return;
    await saveTaskUpdate(taskPendingStop, undefined);
    setIsStopConfirmModalVisible(false);
    setTaskPendingStop(null);
  };

  const handleCancelStopRepeating = () => {
    setIsStopConfirmModalVisible(false);
    setTaskPendingStop(null);
  };

  const handleSaveEditedTaskFromModal = async (newSettings?: DeadlineSettings) => {
    if (!editingTask) return;
    await saveTaskUpdate(editingTask, newSettings);
    setIsDeadlineModalVisible(false);
    setEditingTask(null);
  };

  const navigateToTaskDetail = (taskId: string) => {
    router.push(`/task-detail/${taskId}`);
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={subColor} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>{t('settings.repeating_tasks_title')}</Text>
          <View style={styles.appBarActionPlaceholder} />
        </View>
        <ActivityIndicator style={styles.loader} size="large" color={subColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={subColor} />
          </TouchableOpacity>
        <Text style={styles.appBarTitle}>{t('settings.repeating_tasks_title')}</Text>
        <View style={styles.appBarActionPlaceholder} />
      </View>

      {repeatingTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color={isDark ? '#555' : '#CDCDCD'} />
          <Text style={styles.emptyText}>{t('settings.no_repeating_tasks')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {repeatingTasks.map((task) => (
            <View key={task.id} style={styles.taskItemOuter}>
                <TouchableOpacity
                    style={styles.taskItemTouchable}
                    onPress={() => navigateToTaskDetail(task.id)}
                    accessibilityLabel={t('settings.view_task_details_tooltip')}
                >
                    <View style={styles.taskItemTextContainer}>
                        <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                        {task.memo && task.memo.trim() !== "" && (
                             <Text style={styles.taskMemoPreview} numberOfLines={1}>{task.memo}</Text>
                        )}
                        <Text style={styles.taskRepeatConfig} numberOfLines={2}>
                        {formatRepeatSettingsForDisplay(task.deadlineDetails, t)}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.taskItemActions}>
                    <TouchableOpacity
                        onPress={() => handleEditRepeatSettings(task)}
                        style={styles.actionButton}
                        accessibilityLabel={t('settings.edit_repeat_settings_tooltip')}
                    >
                        <Ionicons name="pencil-outline" size={22} color={subColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleRequestStopRepeating(task)}
                        style={styles.actionButton}
                        accessibilityLabel={t('settings.stop_repeating_tooltip')}
                    >
                        <Ionicons name="close-circle-outline" size={22} color={isDark ? '#FF6961' : '#D9534F'} />
                    </TouchableOpacity>
                </View>
            </View>
          ))}
        </ScrollView>
      )}

      {editingTask && (
        <DeadlineSettingModal
          visible={isDeadlineModalVisible}
          onClose={() => {
            setIsDeadlineModalVisible(false);
            setEditingTask(null);
          }}
          onSave={handleSaveEditedTaskFromModal}
          initialSettings={editingTask.deadlineDetails}
        />
      )}

      <ConfirmModal
        visible={isStopConfirmModalVisible}
        message={t('settings.stop_repeating_confirm_message')}
        okText={t('settings.stop_action')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmStopRepeatingAction}
        onCancel={handleCancelStopRepeating}
        isOkDestructive={true}
      />
    </SafeAreaView>
  );
}

const createRepeatingTasksStyles = (isDark: boolean, subColor: string, fsKey: FontSizeKey) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000000' : '#F2F2F7',
  },
  appBar: {
    height: Platform.OS === 'ios' ? 44 : 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
    backgroundColor: isDark ? '#1C1C1E' : '#F9F9F9',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  appBarTitle: {
    fontSize: appFontSizes[fsKey] + (Platform.OS === 'ios' ? 1 : 0),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: isDark ? '#FFFFFF' : '#000000',
    textAlign: 'center',
    flex: 1,
  },
  appBarActionPlaceholder: {
    width: (Platform.OS === 'ios' ? 32 : 24) + 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: appFontSizes[fsKey],
    color: isDark ? '#8E8E93' : '#6D6D72',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: appFontSizes[fsKey] * 1.4,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  taskItemOuter: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    marginVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    paddingLeft: 16,
  },
  taskItemTouchable: {
    flex: 1,
    paddingVertical: 12,
  },
  taskItemTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: appFontSizes[fsKey] + (Platform.OS === 'ios' ? 1 : 0),
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 3,
  },
  taskMemoPreview: {
    fontSize: appFontSizes[fsKey] - 1,
    color: isDark ? '#8E8E93' : '#6D6D72',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  taskRepeatConfig: {
    fontSize: appFontSizes[fsKey] - (Platform.OS === 'ios' ? 1 : 2),
    color: isDark ? '#8E8E93' : '#6D6D72',
    lineHeight: appFontSizes[fsKey] * 1.2,
  },
  taskItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  }
});