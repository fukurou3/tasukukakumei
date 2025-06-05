// app/features/add/components/DeadlineSettingModal/RepeatTab.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, Pressable, Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Switch } from 'react-native';
import { CalendarUtils, LocaleConfig } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/hooks/ThemeContext';
import type {
    SpecificRepeatTabProps,
    RepeatFrequency,
    DeadlineModalTranslationKey,
    CommonTranslationKey,
    DeadlineSettings,
    // DeadlineTime, // 廃止のためコメントアウト
    CustomIntervalUnit,
    // RepeatEnds, // 廃止のためコメントアウト (未使用)
} from './types';
import { DatePickerModal } from './DatePickerModal';
// import { TimePickerModal } from './TimePickerModal'; // 廃止のためコメントアウト
import { CustomIntervalModal } from './CustomIntervalModal';


const todayString = CalendarUtils.getCalendarDateString(new Date());

/* 廃止のためコメントアウト
const formatTimeToDisplay = (time: DeadlineTime | undefined, t: (key: string, options?: any) => string): string => {
    if (!time) return t('common.select');
    const hour24 = time.hour;
    const ampmKey = (hour24 < 12 || hour24 === 24 || hour24 === 0) ? 'am' : 'pm';
    const ampm = t(`common.${ampmKey}`);
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    return `${ampm} ${hour12}:${String(time.minute).padStart(2, '0')}`;
};
*/

const formatDateToDisplay = (dateString: string | undefined, t: (key: string, options?: any) => string, defaultText?: string): string => {
    if (!dateString) return defaultText || t('common.select');
    return dateString;
};

const formatCustomIntervalToDisplay = (
    value: number | undefined,
    unit: CustomIntervalUnit | undefined,
    t: (key: string, options?: any) => string
): string => {
    if (value === undefined || unit === undefined || value <=0) {
        return t('deadline_modal.interval_not_set');
    }
    if (unit === 'hours') {
        return t('deadline_modal.every_x_hours', { count: value });
    }
    if (unit === 'days') {
        return t('deadline_modal.every_x_days', { count: value });
    }
    return t('deadline_modal.interval_not_set');
};


const frequencyOptions: { labelKey: Extract<DeadlineModalTranslationKey, 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>; value: RepeatFrequency }[] = [
  { labelKey: 'daily', value: 'daily' },
  { labelKey: 'weekly', value: 'weekly' },
  { labelKey: 'monthly', value: 'monthly' },
  { labelKey: 'yearly', value: 'yearly' },
  { labelKey: 'custom', value: 'custom' },
];

const weekdayKeys: { key: Extract<CommonTranslationKey, 'sun_short' | 'mon_short' | 'tue_short' | 'wed_short' | 'thu_short' | 'fri_short' | 'sat_short'>; dayIndex: number }[] = [
  { key: 'sun_short', dayIndex: 0 },
  { key: 'mon_short', dayIndex: 1 },
  { key: 'tue_short', dayIndex: 2 },
  { key: 'wed_short', dayIndex: 3 },
  { key: 'thu_short', dayIndex: 4 },
  { key: 'fri_short', dayIndex: 5 },
  { key: 'sat_short', dayIndex: 6 },
];


const RepeatTabMemo: React.FC<SpecificRepeatTabProps> = ({ styles, settings, updateSettings, updateFullSettings, showErrorAlert }) => {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { t, i18n } = useTranslation();
  const isJapanese = i18n.language.startsWith('ja');

  const [isFrequencyPickerVisible, setFrequencyPickerVisible] = useState(false);
  const [isRepeatStartDatePickerVisible, setRepeatStartDatePickerVisible] = useState(false);
  const [isRepeatEndDatePickerVisible, setRepeatEndDatePickerVisible] = useState(false);
  // const [isTaskStartTimePickerVisible, setTaskStartTimePickerVisible] = useState(false); // 廃止のためコメントアウト
  const [isCustomIntervalModalVisible, setCustomIntervalModalVisible] = useState(false);


  const currentFrequency = settings.repeatFrequency;
  const currentRepeatStartDate = settings.repeatStartDate;
  // const currentTaskStartTime = settings.taskStartTime; // 廃止のためコメントアウト
  // const currentIsTaskStartTimeEnabled = settings.isTaskStartTimeEnabled ?? false; // 廃止のためコメントアウト
  const currentDaysOfWeek = settings.repeatDaysOfWeek ?? weekdayKeys.reduce((acc, curr) => ({ ...acc, [curr.dayIndex]: false }), {});
  const currentExcludeHolidays = settings.isExcludeHolidays ?? false;
  const currentRepeatEndsDate = settings.repeatEnds?.type === 'on_date' ? settings.repeatEnds.date : undefined;
  const currentCustomIntervalValue = settings.customIntervalValue;
  const currentCustomIntervalUnit = settings.customIntervalUnit;


  const switchTrackColorTrue = isDark ? '#30D158' : '#34C759';
  const switchTrackColorFalse = isDark ? '#2C2C2E' : '#E9E9EA';
  const switchThumbColorValue = '#FFFFFF';
  const switchTrackBorderColorFalse = isDark ? '#555557' : '#ADADAF';


  const handleFrequencyChange = useCallback((freq: RepeatFrequency) => {
    const newSettingsUpdate: Partial<Pick<DeadlineSettings, 'repeatFrequency' | 'repeatDaysOfWeek' | 'customIntervalValue' | 'customIntervalUnit'>> = { repeatFrequency: freq };
    if (freq === 'weekly') {
        const anyDaySelected = Object.values(settings.repeatDaysOfWeek || {}).some(v => v);
        if (!anyDaySelected) {
            newSettingsUpdate.repeatDaysOfWeek = weekdayKeys.reduce((acc, curr) => {
                acc[curr.dayIndex] = curr.dayIndex !== 0 && curr.dayIndex !== 6; // 月～金をデフォルト選択
                return acc;
            }, {} as Record<number, boolean>);
        }
    }

    if (!freq) { // 繰り返し設定なしの場合
        newSettingsUpdate.customIntervalValue = undefined;
        newSettingsUpdate.customIntervalUnit = undefined;
    } else if (freq !== 'custom') { // カスタム以外の場合
        newSettingsUpdate.customIntervalValue = undefined;
        newSettingsUpdate.customIntervalUnit = undefined;
    } else { // カスタムの場合
        if (!currentCustomIntervalValue || !currentCustomIntervalUnit) {
            newSettingsUpdate.customIntervalValue = 1;
            newSettingsUpdate.customIntervalUnit = 'days';
        }
    }

    updateFullSettings(newSettingsUpdate);
    setFrequencyPickerVisible(false);
  }, [updateFullSettings, settings.repeatDaysOfWeek, currentCustomIntervalValue, currentCustomIntervalUnit]);

  const toggleWeekday = useCallback((dayIndex: number) => {
    const currentSelection = settings.repeatDaysOfWeek || {};
    const newDays = { ...currentSelection, [dayIndex]: !currentSelection[dayIndex] };
    updateSettings('repeatDaysOfWeek', newDays);
  }, [settings.repeatDaysOfWeek, updateSettings]);

  const handleExcludeHolidaysChange = useCallback((value: boolean) => {
    updateSettings('isExcludeHolidays', value);
  }, [updateSettings]);


  useEffect(() => {
    const lang = i18n.language.split('-')[0];
    if (LocaleConfig.locales[lang]) {
        LocaleConfig.defaultLocale = lang;
    } else if (LocaleConfig.locales['en']) {
        LocaleConfig.defaultLocale = 'en';
    } else {
        LocaleConfig.defaultLocale = '';
    }
  }, [i18n.language]);


  const handleFrequencyPickerPress = useCallback(() => setFrequencyPickerVisible(true), []);
  const handleRepeatStartDatePickerPress = useCallback(() => setRepeatStartDatePickerVisible(true), []);
  const handleRepeatEndDatePickerPress = useCallback(() => setRepeatEndDatePickerVisible(true), []);
  // const handleTaskStartTimePickerPress = useCallback(() => setTaskStartTimePickerVisible(true), []); // 廃止のためコメントアウト
  const handleCustomIntervalModalPress = useCallback(() => setCustomIntervalModalVisible(true), []);


  const handleRepeatStartDatePickerClose = useCallback(() => setRepeatStartDatePickerVisible(false), []);
  const handleRepeatEndDatePickerClose = useCallback(() => setRepeatEndDatePickerVisible(false), []);
  // const handleTaskStartTimePickerClose = useCallback(() => setTaskStartTimePickerVisible(false), []); // 廃止のためコメントアウト
  const handleCustomIntervalModalClose = useCallback(() => setCustomIntervalModalVisible(false), []);


  const handleRepeatStartDateConfirm = useCallback((newDate: string) => {
    updateSettings('repeatStartDate', newDate);
    setRepeatStartDatePickerVisible(false);
  }, [updateSettings]);

  const handleRepeatEndDateConfirm = useCallback((newDate: string) => {
    updateSettings('repeatEnds', { type: 'on_date', date: newDate });
    setRepeatEndDatePickerVisible(false);
  }, [updateSettings]);

  const handleRepeatEndDateClear = useCallback(() => {
    updateSettings('repeatEnds', undefined); // または { type: 'never' }
    setRepeatEndDatePickerVisible(false);
  }, [updateSettings]);

  /* 廃止のためコメントアウト
  const handleTaskStartTimeConfirm = useCallback((newTime: DeadlineTime) => {
    updateFullSettings({ taskStartTime: newTime, isTaskStartTimeEnabled: true });
    setTaskStartTimePickerVisible(false);
  }, [updateFullSettings]);

  const handleTaskStartTimeClear = useCallback(() => {
    updateFullSettings({
        taskStartTime: undefined,
        isTaskStartTimeEnabled: false,
    });
    setTaskStartTimePickerVisible(false);
  }, [updateFullSettings]);
  */

  const handleCustomIntervalConfirm = useCallback((value: number, unit: CustomIntervalUnit) => {
    updateFullSettings({ customIntervalValue: value, customIntervalUnit: unit });
    setCustomIntervalModalVisible(false);
  }, [updateFullSettings]);


  const displayFrequency = useMemo(() => {
    if (!currentFrequency) return t('common.select');
    const option = frequencyOptions.find(opt => opt.value === currentFrequency);
    return option ? t(`deadline_modal.${option.labelKey}` as const) : t('common.select');
  }, [currentFrequency, t]);

  const displayRepeatStartDate = useMemo(() => {
    if (!currentRepeatStartDate) return t('common.not_set');
    const formattedDate = formatDateToDisplay(currentRepeatStartDate, t);
    if (currentRepeatStartDate === todayString) {
      return `${formattedDate} (${t('common.today')})`;
    }
    return formattedDate;
  }, [currentRepeatStartDate, t]);

  /* 廃止のためコメントアウト
  const displayTaskStartTime = useMemo(() => {
    if (currentIsTaskStartTimeEnabled) {
      return formatTimeToDisplay(currentTaskStartTime, t);
    }
    return t('common.select');
  }, [currentIsTaskStartTimeEnabled, currentTaskStartTime, t]);
  */

  const displayRepeatEndDate = useMemo(() => {
    return formatDateToDisplay(currentRepeatEndsDate, t, t('common.not_set'));
  }, [currentRepeatEndsDate, t]);

  const displayCustomInterval = useMemo(() => {
    return formatCustomIntervalToDisplay(currentCustomIntervalValue, currentCustomIntervalUnit, t);
  }, [currentCustomIntervalValue, currentCustomIntervalUnit, t]);

  /* 廃止のためコメントアウト
  const getInitialTaskStartTimeForPicker = (): DeadlineTime => {
    if (currentIsTaskStartTimeEnabled && currentTaskStartTime) {
        return currentTaskStartTime;
    }
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  };
  */


  const labelFontSize = typeof styles.label?.fontSize === 'number' ? styles.label.fontSize : 16;
  const mutedTextColor = isDark ? '#A0A0A0' : '#555555';
  const separatorColor = (styles.pickerRowSeparator as ViewStyle)?.backgroundColor as string || (isDark ? '#3A3A3C' : '#C6C6C8');

  const sectionHeaderTextStyleWithFallback: TextStyle = styles.sectionHeaderText || {
    fontSize: (styles.label?.fontSize || 16) + 1,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: (styles.tabContentContainer as ViewStyle)?.backgroundColor
  };

  const switchContainerBaseStyle: ViewStyle = {
    width: 51,
    height: 31,
    borderRadius: 31 / 2,
    justifyContent: 'center',
    padding: 2,
  };


  return (
    <ScrollView style={styles.tabContentContainer} contentContainerStyle={{ paddingBottom: 20 }}>
      <View>
        <Text style={sectionHeaderTextStyleWithFallback}>
          {t('deadline_modal.section_task_addition')}
        </Text>

        <TouchableOpacity onPress={handleFrequencyPickerPress} style={styles.settingRow}>
          <Text style={styles.label}>{t('deadline_modal.repeat_frequency')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.pickerText, { marginRight: 4 }]}>
              {displayFrequency}
              </Text>
              <Ionicons name="chevron-forward" size={labelFontSize + 2} color={mutedTextColor} />
          </View>
        </TouchableOpacity>

        {currentFrequency === 'weekly' && (
          <View style={styles.weekdaySelectorContainer}>
            {weekdayKeys.map(({ key, dayIndex }) => (
              <TouchableOpacity
                key={key}
                style={[styles.daySelector, currentDaysOfWeek?.[dayIndex] && styles.daySelectorSelected]}
                onPress={() => toggleWeekday(dayIndex)}
              >
                <Text style={[styles.daySelectorText, currentDaysOfWeek?.[dayIndex] && styles.daySelectorTextSelected]}>
                  {t(`common.${key}` as const)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {currentFrequency === 'custom' && (
          <TouchableOpacity onPress={handleCustomIntervalModalPress} style={styles.settingRow}>
            <Text style={styles.label}>{t('deadline_modal.custom_interval')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.pickerText, { marginRight: 4 }]}>
                {displayCustomInterval}
              </Text>
              <Ionicons name="chevron-forward" size={labelFontSize + 2} color={mutedTextColor} />
            </View>
          </TouchableOpacity>
        )}

        {isJapanese && currentFrequency && (
            <TouchableOpacity style={styles.settingRow} onPress={() => handleExcludeHolidaysChange(!currentExcludeHolidays)} activeOpacity={1}>
            <Text style={styles.label}>
                {t('deadline_modal.exclude_holidays')}
            </Text>
            <View
                style={[
                switchContainerBaseStyle,
                {
                    backgroundColor: currentExcludeHolidays ? switchTrackColorTrue : switchTrackColorFalse,
                    borderWidth: Platform.OS === 'android' && !currentExcludeHolidays ? 1.5 : 0,
                    borderColor: Platform.OS === 'android' && !currentExcludeHolidays ? switchTrackBorderColorFalse : 'transparent',
                }
                ]}
            >
                <Switch
                value={currentExcludeHolidays}
                onValueChange={handleExcludeHolidaysChange}
                thumbColor={switchThumbColorValue}
                trackColor={{ false: Platform.OS === 'ios' ? switchTrackColorFalse : 'transparent' , true: Platform.OS === 'ios' ? switchTrackColorTrue : 'transparent' }}
                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                ios_backgroundColor={switchTrackColorFalse}
                />
            </View>
            </TouchableOpacity>
        )}

        {/* 繰り返しタスクの開始時刻設定UIを削除
        {currentFrequency && (
          <>
            <TouchableOpacity onPress={handleTaskStartTimePickerPress} style={styles.settingRow}>
              <Text style={styles.label}>{t('deadline_modal.task_start_time_label')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.pickerText, { marginRight: 4 }]}>{displayTaskStartTime}</Text>
                <Ionicons name="chevron-forward" size={labelFontSize + 2} color={mutedTextColor} />
              </View>
            </TouchableOpacity>
          </>
        )}
        */}
      </View>


      {currentFrequency && (
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: separatorColor, marginHorizontal: 0, marginVertical: 10 }} />
      )}


      {currentFrequency && (
        <View>
          <Text style={sectionHeaderTextStyleWithFallback}>
            {t('deadline_modal.section_repeat_settings')}
          </Text>

          <TouchableOpacity
            onPress={handleRepeatStartDatePickerPress}
            style={styles.settingRow}
          >
            <Text style={styles.label}>{t('deadline_modal.repeat_start_date_label')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.pickerText, { marginRight: 4 }]}>{displayRepeatStartDate}</Text>
              <Ionicons name="chevron-forward" size={labelFontSize + 2} color={mutedTextColor} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRepeatEndDatePickerPress} style={styles.settingRow}>
              <Text style={styles.label}>{t('deadline_modal.end_repeat_title')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.pickerText, { marginRight: 4 }]}>
                  {displayRepeatEndDate}
              </Text>
              <Ionicons name="chevron-forward" size={labelFontSize + 2} color={mutedTextColor}/>
              </View>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isFrequencyPickerVisible} onRequestClose={() => setFrequencyPickerVisible(false)} transparent animationType="fade">
        <Pressable style={styles.calendarOverlay} onPress={() => setFrequencyPickerVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
            {frequencyOptions.map((opt, index) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleFrequencyChange(opt.value)}
                style={[
                    styles.modalOptionButton,
                    index === frequencyOptions.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <Text style={[styles.modalOptionText, currentFrequency === opt.value && { color: subColor, fontWeight: 'bold' }]}>
                  {t(`deadline_modal.${opt.labelKey}` as const)}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 繰り返しタスクの開始時刻設定モーダル呼び出しを削除
      <TimePickerModal
        visible={isTaskStartTimePickerVisible}
        initialTime={getInitialTaskStartTimeForPicker()}
        onClose={handleTaskStartTimePickerClose}
        onConfirm={handleTaskStartTimeConfirm}
        onClear={handleTaskStartTimeClear}
      />
      */}

      <DatePickerModal
        visible={isRepeatStartDatePickerVisible}
        initialDate={currentRepeatStartDate || todayString}
        onClose={handleRepeatStartDatePickerClose}
        onConfirm={handleRepeatStartDateConfirm}
        onClear={undefined} // 開始日はクリア不可
        clearButtonText={t('common.clear_date')}
      />

      <DatePickerModal
        visible={isRepeatEndDatePickerVisible}
        initialDate={currentRepeatEndsDate || currentRepeatStartDate || todayString}
        onClose={handleRepeatEndDatePickerClose}
        onConfirm={handleRepeatEndDateConfirm}
        onClear={handleRepeatEndDateClear}
        clearButtonText={t('common.clear_date')}
      />
      <CustomIntervalModal
        visible={isCustomIntervalModalVisible}
        initialValue={currentCustomIntervalValue}
        initialUnit={currentCustomIntervalUnit}
        onClose={handleCustomIntervalModalClose}
        onConfirm={handleCustomIntervalConfirm}
        styles={styles}
        showErrorAlert={showErrorAlert}
      />
    </ScrollView>
  );
};

const areRepeatTabPropsEqual = (
    prevProps: Readonly<SpecificRepeatTabProps>,
    nextProps: Readonly<SpecificRepeatTabProps>
): boolean => {
    return (
        prevProps.styles === nextProps.styles &&
        isEqual(prevProps.settings, nextProps.settings) && // settings の比較は isEqual を使用
        prevProps.updateSettings === nextProps.updateSettings &&
        prevProps.updateFullSettings === nextProps.updateFullSettings &&
        prevProps.showErrorAlert === nextProps.showErrorAlert
    );
};

export const RepeatTab = React.memo(RepeatTabMemo, areRepeatTabPropsEqual);