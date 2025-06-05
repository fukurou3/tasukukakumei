// app/features/tasks/components/TaskItem.tsx
import React, { useContext, useState, useEffect, useMemo, useRef, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'expo-router';

import { DisplayableTaskItem } from '../types';
import { createStyles } from '../styles';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext } from '@/context/FontSizeContext';
import { getTimeColor, getTimeText, calculateActualDueDate } from '../utils';
import { fontSizes } from '@/constants/fontSizes';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

type TaskDeadlineProps = {
  task: DisplayableTaskItem;
  isDark: boolean;
  fontSizeKey: keyof typeof fontSizes;
  currentTab: 'incomplete' | 'completed';
};

const TaskDeadline = memo(({ task, isDark, fontSizeKey, currentTab }: TaskDeadlineProps) => {
  const { t, i18n } = useTranslation();
  const [, setTick] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveDueDateUtc = useMemo(() => {
    if (task.isCompletedInstance && task.instanceDate) {
        return dayjs.utc(task.instanceDate);
    }
    return task.displaySortDate || calculateActualDueDate(task);
  }, [task.isCompletedInstance, task.instanceDate, task.displaySortDate, task.deadline, task.deadlineDetails]);

  const displayStartDateUtc = useMemo(() => {
    if (!task.isCompletedInstance && (task.deadlineDetails as any)?.isPeriodSettingEnabled && (task.deadlineDetails as any).periodStartDate) {
      let startDate = dayjs.utc((task.deadlineDetails as any).periodStartDate);
      if ((task.deadlineDetails as any).periodStartTime) {
        startDate = startDate
          .hour((task.deadlineDetails as any).periodStartTime.hour)
          .minute((task.deadlineDetails as any).periodStartTime.minute);
      } else {
        startDate = startDate.startOf('day');
      }
      return startDate;
    }
    return null;
  }, [task.isCompletedInstance, task.deadlineDetails]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (task.isCompletedInstance) return;

    const calculateNextIntervalMs = (): number => {
      const dateToMonitorLocal = (displayStartDateUtc?.isAfter(dayjs().utc())
          ? displayStartDateUtc.local()
          : effectiveDueDateUtc?.local());
      if (!dateToMonitorLocal) return 60000 * 5;
      const diffMinutesTotal = dateToMonitorLocal.diff(dayjs(), 'minute');
      if (diffMinutesTotal <= 1) return 5000;
      if (diffMinutesTotal <= 5) return 10000;
      if (diffMinutesTotal <= 60) return 30000;
      return 60000;
    };

    const tick = () => {
      setTick(prev => prev + 1);
      timeoutRef.current = setTimeout(tick, calculateNextIntervalMs());
    };
    timeoutRef.current = setTimeout(tick, calculateNextIntervalMs());
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [task.isCompletedInstance, task.id, effectiveDueDateUtc, displayStartDateUtc]);

  let isCurrentDisplayInstanceDone = false;
  if (task.isCompletedInstance) isCurrentDisplayInstanceDone = true;
  else if (currentTab === 'completed') isCurrentDisplayInstanceDone = true;
  else if (task.deadlineDetails?.repeatFrequency && effectiveDueDateUtc) {
    const instanceDateStr = effectiveDueDateUtc.format('YYYY-MM-DD');
    isCurrentDisplayInstanceDone = task.completedInstanceDates?.includes(instanceDateStr) ?? false;
  } else if (!task.deadlineDetails?.repeatFrequency) {
    isCurrentDisplayInstanceDone = !!task.completedAt;
  }

  const rawDeadlineText = task.isCompletedInstance
    ? t('task_list.completed_on_date_time', { date: dayjs.utc(task.instanceDate).local().locale(i18n.language).format(t('common.date_time_format_short', "M/D H:mm"))})
    : getTimeText(task, t, effectiveDueDateUtc, displayStartDateUtc);

  const determinedTimeColor = task.isCompletedInstance
    ? (isDark ? '#8E8E93' : '#6D6D72')
    : getTimeColor(task, isDark, effectiveDueDateUtc, displayStartDateUtc);

  const isRepeatingTaskIconVisible = !!(task.deadlineDetails?.repeatFrequency && !task.isCompletedInstance && currentTab === 'incomplete' && !isCurrentDisplayInstanceDone);
  let deadlineTextForDisplay = rawDeadlineText.startsWith('🔁') ? rawDeadlineText.substring(1) : rawDeadlineText;

  const styles = createStyles(isDark, '', fontSizeKey);
  const topTextStyleArray: TextStyle[] = [styles.taskDeadlineDisplayTextBase, { color: determinedTimeColor }];
  if (deadlineTextForDisplay === t('task_list.no_deadline') && styles.noDeadlineText) {
    const { color, fontWeight, ...noDeadlineOtherStyles } = styles.noDeadlineText as TextStyle;
    topTextStyleArray.push(noDeadlineOtherStyles);
  }

  return (
    <View style={{alignItems: 'flex-end', justifyContent: 'center', minHeight: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          {isRepeatingTaskIconVisible && (
            <Ionicons
              name="repeat"
              size={fontSizes[fontSizeKey] * 0.9}
              color={determinedTimeColor}
              style={{ marginRight: 3 }}
            />
          )}
          <Text style={StyleSheet.flatten(topTextStyleArray)} numberOfLines={1} ellipsizeMode="tail">
            {deadlineTextForDisplay}
          </Text>
        </View>
    </View>
  );
});

const TaskCheckbox = memo(({ isDone, onToggle, subColor, styles }: { isDone: boolean; onToggle: () => void; subColor: string; styles: any }) => (
  <TouchableOpacity onPress={onToggle} style={styles.checkboxContainer}>
    <Ionicons name={isDone ? 'checkbox' : 'square-outline'} size={24} color={subColor} />
  </TouchableOpacity>
));

const TaskMainContent = memo(({ task, isDark, fontSizeKey, styles }: { task: DisplayableTaskItem; isDark: boolean; fontSizeKey: keyof typeof fontSizes; styles: any }) => {
  const displayStartDateUtc = useMemo(() => {
    if (!task.isCompletedInstance && (task.deadlineDetails as any)?.isPeriodSettingEnabled && (task.deadlineDetails as any).periodStartDate) {
      let startDate = dayjs.utc((task.deadlineDetails as any).periodStartDate);
      if ((task.deadlineDetails as any).periodStartTime) {
        startDate = startDate.hour((task.deadlineDetails as any).periodStartTime.hour).minute((task.deadlineDetails as any).periodStartTime.minute);
      } else {
        startDate = startDate.startOf('day');
      }
      return startDate;
    }
    return null;
  }, [task.isCompletedInstance, task.deadlineDetails]);

  return (
    <View style={styles.taskCenter}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {!task.isCompletedInstance && (task.deadlineDetails as any)?.isPeriodSettingEnabled && (task.deadlineDetails as any).periodStartDate && !((task.deadlineDetails as any)?.isPeriodSettingEnabled && displayStartDateUtc && displayStartDateUtc.local().isAfter(dayjs())) && (
          <Ionicons name="calendar-outline" size={fontSizes[fontSizeKey]} color={isDark ? '#999' : '#777'} style={{ marginRight: 4 }} />
        )}
         {!(task.isCompletedInstance) && (task.deadlineDetails as any)?.isPeriodSettingEnabled && displayStartDateUtc && displayStartDateUtc.local().isAfter(dayjs()) && (
          <Ionicons name="time-outline" size={fontSizes[fontSizeKey]} color={isDark ? '#999' : '#777'} style={{ marginRight: 4 }} />
        )}
        <Text style={styles.taskTitle} numberOfLines={1}>
          {task.title}
        </Text>
      </View>
    </View>
  );
});

const TaskSelectionIndicator = memo(({ isSelected, subColor, styles }: { isSelected: boolean; subColor: string; styles: any }) => (
  <View style={styles.selectionIconContainer}>
    <Ionicons name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={subColor} />
  </View>
));

type Props = {
  task: DisplayableTaskItem;
  onToggle: (id: string, instanceDate?: string) => void;
  isSelecting: boolean;
  selectedIds: string[];
  onLongPressSelect: (id: string) => void;
  currentTab: 'incomplete' | 'completed';
  isInsideFolder?: boolean;
  isLastItem?: boolean;
};

export const TaskItem = memo(({
  task,
  onToggle,
  isSelecting,
  selectedIds,
  onLongPressSelect,
  currentTab,
  isInsideFolder,
  isLastItem,
}: Props) => {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = createStyles(isDark, subColor, fontSizeKey);
  const router = useRouter();

  const effectiveDueDateUtc = useMemo(() => {
    if (task.isCompletedInstance && task.instanceDate) {
        return dayjs.utc(task.instanceDate);
    }
    return task.displaySortDate || calculateActualDueDate(task);
  }, [task.isCompletedInstance, task.instanceDate, task.displaySortDate, task.deadline, task.deadlineDetails]);
  
  const isCurrentDisplayInstanceDone = useMemo(() => {
    if (task.isCompletedInstance) return true;
    if (currentTab === 'completed') return true;
    if (task.deadlineDetails?.repeatFrequency && effectiveDueDateUtc) {
      const instanceDateStr = effectiveDueDateUtc.format('YYYY-MM-DD');
      return task.completedInstanceDates?.includes(instanceDateStr) ?? false;
    }
    if (!task.deadlineDetails?.repeatFrequency) {
      return !!task.completedAt;
    }
    return false;
  }, [task, currentTab, effectiveDueDateUtc]);

  const handleToggle = () => {
    if (task.isCompletedInstance && task.instanceDate) onToggle(task.id, task.instanceDate);
    else if (currentTab === 'completed' && !task.isCompletedInstance) onToggle(task.id);
    else if (task.deadlineDetails?.repeatFrequency && effectiveDueDateUtc) onToggle(task.id, effectiveDueDateUtc.format('YYYY-MM-DD'));
    else onToggle(task.id);
  };

  const handlePress = () => {
    if (isSelecting) onLongPressSelect(task.keyId);
    else if (!task.isCompletedInstance) router.push(`/task-detail/${task.id}`);
  };

  const isSelected = selectedIds.includes(task.keyId);
  const baseStyle = isInsideFolder ? styles.folderTaskItemContainer : styles.taskItemContainer;
  const itemContainerStyle = StyleSheet.flatten([
    baseStyle,
    (isInsideFolder && isLastItem && !task.isCompletedInstance) && { borderBottomWidth: 0 },
    task.isCompletedInstance && isLastItem && { borderBottomWidth: 0 }
  ]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={() => onLongPressSelect(task.keyId)}
      delayLongPress={200}
      style={itemContainerStyle}
      disabled={isSelecting ? false : task.isCompletedInstance}
    >
      <View style={styles.taskItem}>
        {!isSelecting && (
          <TaskCheckbox
            isDone={isCurrentDisplayInstanceDone}
            onToggle={handleToggle}
            subColor={subColor}
            styles={styles}
          />
        )}
        <TaskMainContent
          task={task}
          isDark={isDark}
          fontSizeKey={fontSizeKey}
          styles={styles}
        />
        <TaskDeadline
          task={task}
          isDark={isDark}
          fontSizeKey={fontSizeKey}
          currentTab={currentTab}
        />
        {isSelecting && (
          <TaskSelectionIndicator
            isSelected={isSelected}
            subColor={subColor}
            styles={styles}
          />
        )}
      </View>
    </TouchableOpacity>
  );
});