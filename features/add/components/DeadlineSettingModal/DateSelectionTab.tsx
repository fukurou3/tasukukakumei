// app/features/add/components/DeadlineSettingModal/DateSelectionTab.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CalendarUtils } from 'react-native-calendars';

import { useAppTheme } from '@/hooks/ThemeContext';
import type { SpecificDateSelectionTabProps, DeadlineTime } from './types';
import { TimePickerModal } from './TimePickerModal';
import { DatePickerModal } from './DatePickerModal';

const todayString = CalendarUtils.getCalendarDateString(new Date());

const formatTimeToDisplay = (time: DeadlineTime | undefined, t: (key: string, options?: any) => string): string => {
    if (!time) return t('common.select');
    const hour24 = time.hour;
    const ampmKey = (hour24 < 12 || hour24 === 24 || hour24 === 0) ? 'am' : 'pm';
    const ampm = t(`common.${ampmKey}`);
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    return `${ampm} ${hour12}:${String(time.minute).padStart(2, '0')}`;
};

const formatDateToDisplay = (dateString: string | undefined, t: (key: string, options?: any) => string): string => {
    if (!dateString) return t('common.select');
    return dateString;
};


const DateSelectionTabMemo: React.FC<SpecificDateSelectionTabProps> = ({
  styles,
  selectedTaskDeadlineDate,
  selectedTaskDeadlineTime,
  isTaskDeadlineTimeEnabled,
  updateSettings,
  showErrorAlert,
}) => {
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const [isTaskDeadlineDatePickerVisible, setTaskDeadlineDatePickerVisible] = useState(false);
  const [isTaskDeadlineTimePickerVisible, setTaskDeadlineTimePickerVisible] = useState(false);

  const handleTaskDeadlineDateSectionPress = useCallback(() => {
    setTaskDeadlineDatePickerVisible(true);
  }, []);

  const handleTaskDeadlineDateConfirm = useCallback((newDate: string) => {
    updateSettings('taskDeadlineDate', newDate);
    setTaskDeadlineDatePickerVisible(false);
  }, [updateSettings]);

  const handleTaskDeadlineDateClear = useCallback(() => {
    updateSettings('taskDeadlineDate', undefined);
    updateSettings('isTaskDeadlineTimeEnabled', false);
    updateSettings('taskDeadlineTime', undefined);
    setTaskDeadlineDatePickerVisible(false);
  }, [updateSettings]);

  const handleTaskDeadlineDatePickerClose = useCallback(() => {
    setTaskDeadlineDatePickerVisible(false);
  }, []);

  const handleTaskDeadlineTimeSectionPress = useCallback(() => {
    if (!selectedTaskDeadlineDate) {
        showErrorAlert(t('deadline_modal.date_missing_for_time_alert_message'));
        return;
    }
    setTaskDeadlineTimePickerVisible(true);
  }, [selectedTaskDeadlineDate, showErrorAlert, t]);

  const handleTaskDeadlineTimeConfirm = useCallback((newTime: DeadlineTime) => {
    updateSettings('taskDeadlineTime', newTime);
    updateSettings('isTaskDeadlineTimeEnabled', true);
    setTaskDeadlineTimePickerVisible(false);
  }, [updateSettings]);

  const handleTaskDeadlineTimeClear = useCallback(() => {
    updateSettings('taskDeadlineTime', undefined);
    updateSettings('isTaskDeadlineTimeEnabled', false);
    setTaskDeadlineTimePickerVisible(false);
  }, [updateSettings]);

  const handleTaskDeadlineTimePickerClose = useCallback(() => {
    setTaskDeadlineTimePickerVisible(false);
  }, []);

  const displayTaskDeadlineDate = useMemo(() => {
    if (!selectedTaskDeadlineDate) return t('common.select');
    const formattedDate = formatDateToDisplay(selectedTaskDeadlineDate, t);
    if (selectedTaskDeadlineDate === todayString) {
      return `${formattedDate} (${t('common.today')})`;
    }
    return formattedDate;
  }, [selectedTaskDeadlineDate, t]);

  const displayTaskDeadlineTime = useMemo(() => {
    if (isTaskDeadlineTimeEnabled && selectedTaskDeadlineTime) {
      return formatTimeToDisplay(selectedTaskDeadlineTime, t);
    }
    if (isTaskDeadlineTimeEnabled && !selectedTaskDeadlineTime) {
      return formatTimeToDisplay({ hour: 0, minute: 0 }, t);
    }
    return t('common.select');
  }, [isTaskDeadlineTimeEnabled, selectedTaskDeadlineTime, t]);

  const labelFontSize = typeof styles.label.fontSize === 'number' ? styles.label.fontSize : 16;
  const mutedTextColor = isDark ? '#A0A0A0' : '#555555';

  const sectionHeaderTextStyle = styles.sectionHeaderText || {
    fontSize: labelFontSize + 1,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: (styles.tabContentContainer as ViewStyle)?.backgroundColor,
  };

  const getInitialTimeForPicker = useCallback((): DeadlineTime | undefined => {
      if (isTaskDeadlineTimeEnabled && !selectedTaskDeadlineTime) {
        return { hour: 0, minute: 0 };
      }
      return selectedTaskDeadlineTime;
  }, [isTaskDeadlineTimeEnabled, selectedTaskDeadlineTime]);


  return (
    <ScrollView style={styles.tabContentContainer} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={sectionHeaderTextStyle}>{t('deadline_modal.task_deadline_section_title')}</Text>
      <TouchableOpacity onPress={handleTaskDeadlineDateSectionPress} style={styles.settingRow}>
        <Text style={styles.label}>{t('deadline_modal.date_label')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.pickerText, { marginRight: 4 }]}>{displayTaskDeadlineDate}</Text>
          <Ionicons name="chevron-forward" size={labelFontSize + 2} color={mutedTextColor} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleTaskDeadlineTimeSectionPress}
        style={styles.settingRow}
        disabled={!selectedTaskDeadlineDate}
      >
        <Text style={[styles.label, !selectedTaskDeadlineDate && { color: mutedTextColor }]}>
          {t('deadline_modal.time_label')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.pickerText, { marginRight: 4 }, !selectedTaskDeadlineDate && { color: mutedTextColor }]}>
            {displayTaskDeadlineTime}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={labelFontSize + 2}
            color={!selectedTaskDeadlineDate ? ((styles.tabContentContainer as ViewStyle)?.backgroundColor || mutedTextColor) as string : mutedTextColor}
           />
        </View>
      </TouchableOpacity>

      <DatePickerModal
        visible={isTaskDeadlineDatePickerVisible}
        initialDate={selectedTaskDeadlineDate || todayString}
        onClose={handleTaskDeadlineDatePickerClose}
        onConfirm={handleTaskDeadlineDateConfirm}
        onClear={handleTaskDeadlineDateClear}
        clearButtonText={t('common.clear_date')}
      />

      <TimePickerModal
        visible={isTaskDeadlineTimePickerVisible}
        initialTime={getInitialTimeForPicker()}
        onClose={handleTaskDeadlineTimePickerClose}
        onConfirm={handleTaskDeadlineTimeConfirm}
        onClear={handleTaskDeadlineTimeClear}
      />
    </ScrollView>
  );
};

const areDateSelectionTabPropsEqual = (
    prevProps: Readonly<SpecificDateSelectionTabProps>,
    nextProps: Readonly<SpecificDateSelectionTabProps>
): boolean => {
    return (
        prevProps.styles === nextProps.styles &&
        prevProps.selectedTaskDeadlineDate === nextProps.selectedTaskDeadlineDate &&
        prevProps.isTaskDeadlineTimeEnabled === nextProps.isTaskDeadlineTimeEnabled &&
        prevProps.selectedTaskDeadlineTime?.hour === nextProps.selectedTaskDeadlineTime?.hour &&
        prevProps.selectedTaskDeadlineTime?.minute === nextProps.selectedTaskDeadlineTime?.minute &&
        prevProps.updateSettings === nextProps.updateSettings &&
        prevProps.showErrorAlert === nextProps.showErrorAlert
    );
};

export const DateSelectionTab = React.memo(DateSelectionTabMemo, areDateSelectionTabPropsEqual);