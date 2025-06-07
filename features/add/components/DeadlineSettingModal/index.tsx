// app/features/add/components/DeadlineSettingModal/index.tsx
import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneRendererProps, TabBarProps } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import { CalendarUtils } from 'react-native-calendars';

import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext } from '@/context/FontSizeContext';
import type {
    DeadlineSettings,
    DeadlineTime,
    DeadlineRoute,
    SpecificDateSelectionTabProps,
    SpecificRepeatTabProps,
} from './types';
import { createDeadlineModalStyles } from './styles';
import { DeadlineModalHeader } from './DeadlineModalHeader';
import { DateSelectionTab } from './DateSelectionTab';
import { RepeatTab } from './RepeatTab';
import { ConfirmModal } from '@/components/ConfirmModal';

interface DeadlineSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings?: DeadlineSettings) => void;
  initialSettings?: DeadlineSettings;
}

const todayString = CalendarUtils.getCalendarDateString(new Date());
const ANIMATION_TIMING = 250;
const BACKDROP_OPACITY = 0.4;

const getDefaultInitialSettings = (): DeadlineSettings => {
    return {
      taskDeadlineDate: undefined,
      taskDeadlineTime: undefined,
      isTaskDeadlineTimeEnabled: false,
      repeatFrequency: undefined,
      repeatStartDate: todayString,
      repeatDaysOfWeek: undefined,
      repeatEnds: undefined,
      isExcludeHolidays: false,
      customIntervalValue: 1,
      customIntervalUnit: 'days',
    };
};


export const DeadlineSettingModal: React.FC<DeadlineSettingModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSettings,
}) => {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const layout = useWindowDimensions();
  const styles = useMemo(() => createDeadlineModalStyles(isDark, subColor, fontSizeKey, layout.height), [isDark, subColor, fontSizeKey, layout.height]);
  const { t } = useTranslation();


  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [settings, setSettings] = useState<DeadlineSettings>(getDefaultInitialSettings);

  const [isUnsetConfirmVisible, setUnsetConfirmVisible] = useState(false);
  const [isValidationErrorModalVisible, setValidationErrorModalVisible] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');


  useEffect(() => {
    const defaults = getDefaultInitialSettings();
    let effectiveInitialSettings = { ...defaults };

    if (initialSettings) {
      effectiveInitialSettings = {
        ...defaults,
        taskDeadlineDate: initialSettings.taskDeadlineDate,
        taskDeadlineTime: initialSettings.taskDeadlineTime,
        isTaskDeadlineTimeEnabled: initialSettings.isTaskDeadlineTimeEnabled,
        repeatFrequency: initialSettings.repeatFrequency,
        repeatStartDate: initialSettings.repeatStartDate || defaults.repeatStartDate,
        repeatDaysOfWeek: initialSettings.repeatDaysOfWeek,
        repeatEnds: initialSettings.repeatEnds,
        isExcludeHolidays: initialSettings.isExcludeHolidays ?? defaults.isExcludeHolidays,
        customIntervalValue: initialSettings.customIntervalValue || defaults.customIntervalValue,
        customIntervalUnit: initialSettings.customIntervalUnit || defaults.customIntervalUnit,
      };
    }

    setSettings(effectiveInitialSettings);
    setActiveTabIndex(effectiveInitialSettings.repeatFrequency ? 1 : 0);
  }, [initialSettings]);

  useEffect(() => {
    if (!visible) {
      setValidationErrorModalVisible(false);
      setValidationErrorMessage('');
    }
  }, [visible]);

  const updateSettingsCallback = useCallback(
    <K extends keyof DeadlineSettings>(key: K, value: DeadlineSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    }, []
  );

  const updateFullSettings = useCallback((newSettings: Partial<DeadlineSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const showErrorAlert = useCallback((message: string) => {
    setValidationErrorMessage(message);
    setValidationErrorModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    if (activeTabIndex === 0) { // 日付タブ
        if (settings.isTaskDeadlineTimeEnabled && !settings.taskDeadlineDate) { // 時刻が有効だが日付がない
            showErrorAlert(t('deadline_modal.date_missing_for_time_alert_message'));
            return;
        }
    } else if (activeTabIndex === 1 && settings.repeatFrequency) { // 繰り返しタブ
        if (!settings.repeatStartDate) {
            showErrorAlert(t('deadline_modal.repeat_start_date_missing_alert_message'));
            return;
        }
        if (settings.repeatEnds?.type === 'on_date' && settings.repeatStartDate && settings.repeatEnds.date && settings.repeatStartDate > settings.repeatEnds.date) {
            showErrorAlert(t('deadline_modal.repeat_start_must_be_before_end_alert_message'));
            return;
        }
        if (settings.repeatFrequency === 'weekly' && (!settings.repeatDaysOfWeek || Object.values(settings.repeatDaysOfWeek).every(day => !day))) {
            showErrorAlert(t('deadline_modal.weekly_day_missing_alert_message'));
            return;
        }
        if (settings.repeatFrequency === 'custom') {
            if (!settings.customIntervalValue || settings.customIntervalValue <= 0 || !settings.customIntervalUnit || !Number.isInteger(settings.customIntervalValue)) {
                showErrorAlert(t('deadline_modal.error_invalid_interval_value'));
                return;
            }
        }
    }

    let finalSettingsOutput: DeadlineSettings | undefined;

    if (activeTabIndex === 0) { // 日付タブ
        if (settings.taskDeadlineDate) {
            let finalDeadlineTime: DeadlineTime | undefined = undefined;
            if (settings.isTaskDeadlineTimeEnabled) {
                if (settings.taskDeadlineTime) {
                    finalDeadlineTime = settings.taskDeadlineTime;
                } else {
                    finalDeadlineTime = { hour: 0, minute: 0 };
                }
            }

            finalSettingsOutput = {
                taskDeadlineDate: settings.taskDeadlineDate,
                taskDeadlineTime: finalDeadlineTime,
                isTaskDeadlineTimeEnabled: settings.isTaskDeadlineTimeEnabled,
                repeatFrequency: undefined,
                repeatStartDate: undefined,
                repeatDaysOfWeek: undefined,
                repeatEnds: undefined,
                isExcludeHolidays: false,
                customIntervalValue: undefined,
                customIntervalUnit: undefined,
            };
        } else {
            finalSettingsOutput = undefined;
        }
    } else if (activeTabIndex === 1) { // 繰り返しタブ
        if (settings.repeatFrequency && settings.repeatStartDate) {
            finalSettingsOutput = {
                taskDeadlineDate: undefined,
                taskDeadlineTime: undefined,
                isTaskDeadlineTimeEnabled: false,
                repeatFrequency: settings.repeatFrequency,
                repeatStartDate: settings.repeatStartDate,
                repeatDaysOfWeek: settings.repeatFrequency === 'weekly' ? settings.repeatDaysOfWeek : undefined,
                repeatEnds: settings.repeatEnds,
                isExcludeHolidays: settings.isExcludeHolidays,
                customIntervalValue: settings.repeatFrequency === 'custom' ? settings.customIntervalValue : undefined,
                customIntervalUnit: settings.repeatFrequency === 'custom' ? settings.customIntervalUnit : undefined,
            };
        } else {
            finalSettingsOutput = undefined;
        }
    } else {
        finalSettingsOutput = undefined;
    }
    onSave(finalSettingsOutput);
  }, [activeTabIndex, settings, onSave, t, showErrorAlert]);

  const handleUnsetPress = useCallback(() => {
    setUnsetConfirmVisible(true);
  }, []);

  const handleConfirmUnset = useCallback(() => {
    setUnsetConfirmVisible(false);
    const unsetSettings: DeadlineSettings = getDefaultInitialSettings();
    setSettings(unsetSettings);
    setActiveTabIndex(0);
    onSave(undefined);
  }, [onSave, setSettings]);

  const handleCancelUnset = useCallback(() => {
    setUnsetConfirmVisible(false);
  }, []);

  const handleCloseValidationErrorModal = useCallback(() => {
    setValidationErrorModalVisible(false);
  }, []);

  const routes: DeadlineRoute[] = useMemo(() => [
    { key: 'date', title: t('deadline_modal.tab_date') },
    { key: 'repeat', title: t('deadline_modal.tab_repeat') },
  ], [t]);

  const dateTabProps = useMemo((): SpecificDateSelectionTabProps => ({
    styles,
    selectedTaskDeadlineDate: settings.taskDeadlineDate,
    selectedTaskDeadlineTime: settings.taskDeadlineTime,
    isTaskDeadlineTimeEnabled: settings.isTaskDeadlineTimeEnabled ?? false,
    updateSettings: updateSettingsCallback as any,
    showErrorAlert,
  }), [styles, settings.taskDeadlineDate, settings.taskDeadlineTime, settings.isTaskDeadlineTimeEnabled, updateSettingsCallback, showErrorAlert]);

  const repeatTabProps = useMemo((): SpecificRepeatTabProps => ({
    styles,
    settings: {
        repeatFrequency: settings.repeatFrequency,
        repeatStartDate: settings.repeatStartDate,
        repeatDaysOfWeek: settings.repeatDaysOfWeek,
        isExcludeHolidays: settings.isExcludeHolidays ?? false,
        repeatEnds: settings.repeatEnds,
        customIntervalValue: settings.customIntervalValue,
        customIntervalUnit: settings.customIntervalUnit,
    },
    updateSettings: updateSettingsCallback as any,
    updateFullSettings,
    showErrorAlert,
  }), [
    styles,
    settings.repeatFrequency,
    settings.repeatStartDate,
    settings.repeatDaysOfWeek,
    settings.isExcludeHolidays,
    settings.repeatEnds,
    settings.customIntervalValue,
    settings.customIntervalUnit,
    updateSettingsCallback,
    updateFullSettings,
    showErrorAlert,
  ]);

  const renderScene = useCallback(({ route }: SceneRendererProps & { route: DeadlineRoute }) => {
    switch (route.key) {
      case 'date':
        return <DateSelectionTab {...dateTabProps} />;
      case 'repeat':
        return <RepeatTab {...repeatTabProps} />;
      default:
        return null;
    }
  }, [dateTabProps, repeatTabProps]);

  const renderTabBar = useCallback(
    (props: TabBarProps<DeadlineRoute>) => (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {props.navigationState.routes.map((route, i) => {
            const isActive = props.navigationState.index === i;
            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.tabItem,
                  isActive ? styles.tabItemActive : styles.tabItemInactive,
                ]}
                onPress={() => {
                  setActiveTabIndex(i);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {route.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ),
    [styles, setActiveTabIndex]
  );

  return (
    <>
      <Modal
        isVisible={visible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={ANIMATION_TIMING}
        animationOutTiming={ANIMATION_TIMING}
        backdropTransitionInTiming={ANIMATION_TIMING}
        backdropTransitionOutTiming={ANIMATION_TIMING}
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        backdropColor="#000000"
        backdropOpacity={BACKDROP_OPACITY}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        style={styles.modal}
        hideModalContentWhileAnimating
      >
        <SafeAreaView edges={['bottom']} style={styles.container}>
          <DeadlineModalHeader
            settings={settings}
            styles={styles}
            activeTabIndex={activeTabIndex}
          />
          <TabView
            navigationState={{ index: activeTabIndex, routes }}
            renderScene={renderScene}
            onIndexChange={setActiveTabIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={renderTabBar}
            style={{ flex: 1 }}
            swipeEnabled={Platform.OS !== 'web'}
            lazy
            lazyPreloadDistance={0}
          />
          <View style={[
            styles.footer,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8
            }
          ]}>
            <TouchableOpacity style={[styles.button, { flex: 1, minWidth: 80 }]} onPress={onClose}>
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1, minWidth: 80 }]} onPress={handleUnsetPress}>
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
                {t('common.unset')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { flex: 1, minWidth: 80 }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText} numberOfLines={1} adjustsFontSizeToFit>
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      <ConfirmModal
        visible={isUnsetConfirmVisible}
        message={t('deadline_modal.unset_confirm_message')}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        onCancel={handleCancelUnset}
        onConfirm={handleConfirmUnset}
      />
      <ConfirmModal
        visible={isValidationErrorModalVisible}
        message={validationErrorMessage}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        onConfirm={handleCloseValidationErrorModal}
        onCancel={handleCloseValidationErrorModal}
      />
    </>
  );
};