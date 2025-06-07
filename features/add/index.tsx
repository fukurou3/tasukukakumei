// app/features/add/index.tsx
import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useWindowDimensions, View, Text, FlatList, TouchableOpacity, Alert, Pressable, Image, Modal, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useUnsavedStore } from '@/hooks/useUnsavedStore';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AddTaskStyles, Task } from './types'; // Task type from local types.ts
import { createStyles } from './styles';

import { useFolders } from './hooks/useFolders';
import { useSaveTask } from './hooks/useSaveTask';
import { TitleField } from './components/TitleField';
import { MemoField } from './components/MemoField';
import { PhotoPicker } from './components/PhotoPicker';
import { ActionButtons } from './components/ActionButtons';
import { FolderSelectorModal } from './components/FolderSelectorModal';
import { WheelPickerModal } from './components/WheelPickerModal';
import { LIGHT_PLACEHOLDER, DARK_PLACEHOLDER } from './constants';

import { DeadlineSettingModal } from './components/DeadlineSettingModal';
import type { // Types from DeadlineSettingModal
    DeadlineSettings,
    DeadlineTime,
    RepeatFrequency,
} from './components/DeadlineSettingModal/types';

type NotificationUnit = 'minutes' | 'hours' | 'days';

type TabParamList = {
  calendar: undefined;
  tasks: undefined;
  add: undefined;
  settings: undefined;
};

const INITIAL_INPUT_HEIGHT = 60;
const PHOTO_LIST_HORIZONTAL_PADDING = 8 * 2;
const MIN_IMAGE_SIZE = 120;
const IMAGE_MARGIN = 8;
const DESTRUCTIVE_ACTION_COLOR = '#FF3B30';
// モーダルの閉じるアニメーション時間（ミリ秒）
const MODAL_ANIMATION_DELAY = 300;

const formatDateForDisplayInternal = (dateString: string | undefined, t: Function, i18nLanguage: string): string => {
    if (!dateString) return t('add_task.unselected_date_placeholder', '未選択');
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    } catch (e) {
        return dateString;
    }
};

const formatTimeForDisplayInternal = (time: DeadlineTime | undefined, t: Function): string => {
    if (!time) return t('add_task.unselected_time_placeholder', '未選択');
    const hour12 = time.hour % 12 === 0 ? 12 : time.hour % 12;
    const ampmKey = (time.hour < 12 || time.hour === 24 || time.hour === 0) ? 'am' : 'pm';
    const ampm = t(`common.${ampmKey}`);
    return `${ampm} ${hour12}:${String(time.minute).padStart(2, '0')}`;
};

const formatDeadlineForDisplay = (settings: DeadlineSettings | undefined, t: Function, i18nLanguage: string): string => {
  if (!settings) {
    return t('add_task.no_deadline_set', '未設定');
  }

  const {
    taskDeadlineDate,
    isTaskDeadlineTimeEnabled,
    taskDeadlineTime,
    repeatFrequency,
    repeatStartDate: repeatPeriodStartDate,
  } = settings;

  if (repeatFrequency) {
    const frequencyKeyMap: Record<RepeatFrequency, string> = {
      daily: 'deadline_modal.daily',
      weekly: 'deadline_modal.weekly',
      monthly: 'deadline_modal.monthly',
      yearly: 'deadline_modal.yearly',
      custom: 'deadline_modal.custom',
    };
    let repeatText = t(frequencyKeyMap[repeatFrequency]);
    if (repeatPeriodStartDate) {
      const detail = formatDateForDisplayInternal(repeatPeriodStartDate, t, i18nLanguage);
      repeatText += ` (${detail})`;
    }
    return repeatText;
  } else if (taskDeadlineDate) { // 期間設定のロジックを削除し、単一期限の条件をこちらに統合
    let mainDisplay = formatDateForDisplayInternal(taskDeadlineDate, t, i18nLanguage);
    if (isTaskDeadlineTimeEnabled && taskDeadlineTime) {
      mainDisplay += ` ${formatTimeForDisplayInternal(taskDeadlineTime, t)}`;
    }
    return mainDisplay;
  }

  return t('add_task.no_deadline_set', '未設定');
};

export default function AddTaskScreen() {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const fsKey = fontSizeKey;
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const router = useRouter();
  const { draftId, date } = useLocalSearchParams<{ draftId?: string; date?: string }>();

  const unsaved = useUnsavedStore((state) => state.unsaved);
  const setUnsaved = useUnsavedStore((state) => state.setUnsaved);
  const resetUnsaved = useUnsavedStore((state) => state.reset);

  const styles = createStyles(isDark, subColor, fsKey);

  const { width: screenWidth } = useWindowDimensions();

  const photoListContentWidth = screenWidth - PHOTO_LIST_HORIZONTAL_PADDING - (8 * 2);

  const numColumns = useMemo(() => {
    const calculatedNumColumns = Math.floor(
      (photoListContentWidth + IMAGE_MARGIN) / (MIN_IMAGE_SIZE + IMAGE_MARGIN)
    );
    return Math.max(1, calculatedNumColumns);
  }, [photoListContentWidth]);

  const imageSize = useMemo(() => {
    const totalMarginSpace = (numColumns - 1) * IMAGE_MARGIN;
    return Math.floor((photoListContentWidth - totalMarginSpace) / numColumns);
  }, [photoListContentWidth, numColumns]);


  const initialFormState = useMemo(() => ({
    title: '',
    memo: '',
    selectedUris: [] as string[],
    folder: '',
    currentDeadlineSettings: date ? { taskDeadlineDate: String(date) } as DeadlineSettings : undefined,
    notificationActive: false,
    customAmount: 1,
    customUnit: 'hours' as NotificationUnit,
  }), [date]);


  const [selectedUris, setSelectedUris] = useState<string[]>(initialFormState.selectedUris);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId ?? null);
  const [title, setTitle] = useState(initialFormState.title);
  const [memo, setMemo] = useState(initialFormState.memo);

  const [notificationActive, setNotificationActive] = useState(initialFormState.notificationActive);
  const [customUnit, setCustomUnit] = useState<NotificationUnit>(initialFormState.customUnit);
  const [customAmount, setCustomAmount] = useState(initialFormState.customAmount);
  const [showWheelModal, setShowWheelModal] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [folder, setFolder] = useState(initialFormState.folder);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [currentDeadlineSettings, setCurrentDeadlineSettings] = useState<DeadlineSettings | undefined>(initialFormState.currentDeadlineSettings);

  const clearForm = useCallback(() => {
    setCurrentDraftId(null);
    setTitle(initialFormState.title);
    setMemo(initialFormState.memo);
    setNotificationActive(initialFormState.notificationActive);
    setCustomUnit(initialFormState.customUnit);
    setCustomAmount(initialFormState.customAmount);
    setFolder(initialFormState.folder);
    setSelectedUris(initialFormState.selectedUris);
    setCurrentDeadlineSettings(initialFormState.currentDeadlineSettings);
    resetUnsaved();
  }, [resetUnsaved, initialFormState]);

  useEffect(() => {
    let formChanged = false;
    const initialSettingsString = JSON.stringify(initialFormState.currentDeadlineSettings);
    const currentSettingsString = JSON.stringify(currentDeadlineSettings);

    if (currentDraftId) {
         formChanged =
            title !== initialFormState.title ||
            memo !== initialFormState.memo ||
            !selectedUris.every((uri, index) => uri === (initialFormState.selectedUris[index])) || selectedUris.length !== initialFormState.selectedUris.length ||
            folder !== initialFormState.folder ||
            currentSettingsString !== initialSettingsString ||
            notificationActive !== initialFormState.notificationActive ||
            customAmount !== initialFormState.customAmount ||
            customUnit !== initialFormState.customUnit;
    } else {
      formChanged =
        title !== initialFormState.title ||
        memo !== initialFormState.memo ||
        selectedUris.length > 0 ||
        folder !== initialFormState.folder ||
        currentSettingsString !== initialSettingsString ||
        notificationActive !== initialFormState.notificationActive ||
        (notificationActive &&
          (customAmount !== initialFormState.customAmount ||
           customUnit !== initialFormState.customUnit)
        );
    }
    setUnsaved(formChanged);
  }, [
    title, memo, selectedUris, folder, currentDeadlineSettings,
    notificationActive, customAmount, customUnit,
    initialFormState, currentDraftId, setUnsaved
  ]);


  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      if (!unsaved) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        t('add_task.alert_discard_changes_title'),
        t('add_task.alert_discard_changes_message'),
        [
          { text: t('common.cancel'), style: 'cancel', onPress: () => {} },
          {
            text: t('add_task.alert_discard'),
            style: 'destructive',
            onPress: () => {
              clearForm();
              if (e.data?.action) navigation.dispatch(e.data.action);
              else router.back();
            },
          },
        ],
      );
    });
    return unsub;
  }, [navigation, clearForm, t, unsaved, router]);

  const existingFolders = useFolders(showFolderModal);
  useEffect(() => {
    if (showFolderModal) {
      setFolders(existingFolders);
    }
  }, [showFolderModal, existingFolders]);

  const { saveTask, saveDraft } = useSaveTask({
    title,
    memo,
    imageUris: selectedUris,
    notifyEnabled: notificationActive,
    customUnit: notificationActive ? customUnit : undefined,
    customAmount: notificationActive ? customAmount : undefined,
    folder,
    currentDraftId,
    clearForm: () => {
      clearForm();
    },
    t,
    deadlineDetails: currentDeadlineSettings,
  });

  useEffect(() => {
    const loadDraft = async () => {
      if (draftId) {
        try {
          const storedDrafts = await AsyncStorage.getItem('TASK_DRAFTS');
          if (storedDrafts) {
            const draftsArray: Task[] = JSON.parse(storedDrafts);
            const draftToLoad = draftsArray.find(d => d.id === draftId);
            if (draftToLoad) {
              setCurrentDraftId(draftToLoad.id);
              setTitle(draftToLoad.title || '');
              setMemo(draftToLoad.memo || '');
              // 繰り返し設定の場合、ロード時に不要な時刻情報を削除する
              let loadedDeadlineDetails = draftToLoad.deadlineDetails;
              if (loadedDeadlineDetails?.repeatFrequency) {
                const {
                    // taskStartTime, // 廃止
                    // isTaskStartTimeEnabled, // 廃止
                    ...restOfDetails
                } = loadedDeadlineDetails;
                loadedDeadlineDetails = restOfDetails;
              }
              setCurrentDeadlineSettings(loadedDeadlineDetails);
              setSelectedUris(draftToLoad.imageUris || []);
              setNotificationActive(draftToLoad.notifyEnabled !== undefined ? draftToLoad.notifyEnabled : false);
              setCustomUnit((draftToLoad.customUnit as NotificationUnit) || 'hours');
              setCustomAmount(draftToLoad.customAmount || 1);
              setFolder(draftToLoad.folder || '');

              setTimeout(() => {
                setUnsaved(false);
              }, 0);
            } else {
              clearForm();
            }
          } else {
            clearForm();
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
          clearForm();
        }
      } else {
        clearForm();
      }
    };
    loadDraft();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, clearForm, setUnsaved]);


  const handleSetNoNotificationInModal = () => {
    setShowWheelModal(false);
    setTimeout(() => {
      setNotificationActive(false);
      setCustomAmount(initialFormState.customAmount);
      setCustomUnit(initialFormState.customUnit);
    }, MODAL_ANIMATION_DELAY);
  };

  const handleConfirmNotificationInModal = (amount: number, unit: NotificationUnit) => {
    setShowWheelModal(false);
    setTimeout(() => {
      setNotificationActive(true);
      setCustomAmount(amount);
      setCustomUnit(unit);
    }, MODAL_ANIMATION_DELAY);
  };

  const renderPhotoItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <View
        style={[
          styles.photoPreviewItem,
          {
            width: imageSize,
            height: imageSize,
            marginRight: (index + 1) % numColumns !== 0 ? IMAGE_MARGIN : 0,
            marginBottom: IMAGE_MARGIN,
          },
        ]}
      >
        <Pressable onPress={() => setPreviewUri(item)}>
          <Image source={{ uri: item }} style={styles.photoPreviewImage} />
        </Pressable>
        <TouchableOpacity
          onPress={() => setSelectedUris(prev => prev.filter(u => u !== item))}
          style={styles.removeIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={22} color={DESTRUCTIVE_ACTION_COLOR} />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>{t('add_task.title')}</Text>
        <TouchableOpacity
          style={styles.draftsButton}
          onPress={() => router.push('/(tabs)/drafts')}
        >
          <Ionicons name="document-text-outline" size={fontSizes[fsKey]} color={subColor} />
          <Text style={styles.draftsButtonText}>{t('add_task.drafts')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View
              style={{
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden',
                marginHorizontal:8,
                marginTop: 16,
                marginBottom: selectedUris.length > 0 ? 0 : 24,
              }}
            >
              <View style={{ paddingHorizontal: 8, paddingTop: 12, paddingBottom: 12 }}>
                <TitleField
                  label={t('add_task.input_title')}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('add_task.input_title_placeholder')}
                  placeholderTextColor={isDark ? DARK_PLACEHOLDER : LIGHT_PLACEHOLDER}
                  labelStyle={[styles.label, { color: subColor }]}
                  inputStyle={[styles.input, { minHeight: INITIAL_INPUT_HEIGHT, backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}
                />
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal: 8 }} />

              <View style={{ paddingHorizontal: 8, paddingTop: 12, paddingBottom: 12 }}>
                <MemoField
                  label={t('add_task.memo')}
                  value={memo}
                  onChangeText={setMemo}
                  placeholder={t('add_task.memo_placeholder')}
                  placeholderTextColor={isDark ? DARK_PLACEHOLDER : LIGHT_PLACEHOLDER}
                  labelStyle={[styles.label, { color: subColor }]}
                  inputStyle={[styles.input, { minHeight: INITIAL_INPUT_HEIGHT, backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0', textAlignVertical: 'top' }]}
                />
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal: 8 }} />

              <TouchableOpacity onPress={() => setPickerVisible(true)} style={{ paddingVertical: 14, paddingHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom: 0 }]}>{t('add_task.photo')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: fontSizes[fsKey], fontWeight: '400', marginRight: 4 }}>
                      {selectedUris.length > 0 ? t('add_task.photo_selected', { count: selectedUris.length }) : t('add_task.select_photo')}
                    </Text>
                    <Ionicons name="chevron-forward" size={fontSizes[fsKey]} color={isDark ? '#A0A0A0' : '#555555'} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </>
        }
        data={selectedUris}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item}
        numColumns={numColumns}
        key={numColumns}
        style={{paddingHorizontal: 8}}
        contentContainerStyle={styles.photoPreviewContainer}
        ListFooterComponent={
          <>
           {selectedUris.length > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal: 8, marginTop: IMAGE_MARGIN, marginBottom:12 }} /> }
            <View
              style={{
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden',
                marginHorizontal:8,
                marginBottom: 24,
                marginTop: selectedUris.length > 0 ? 0 : -24
              }}
            >
              <TouchableOpacity onPress={() => setShowFolderModal(true)} style={{ paddingVertical: 14, paddingHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom: 0 }]}>{t('add_task.folder')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: fontSizes[fsKey], fontWeight: '400', marginRight: 4 }}>
                      {folder || t('add_task.no_folder')}
                    </Text>
                    <Ionicons name="chevron-forward" size={fontSizes[fsKey]} color={isDark ? '#A0A0A0' : '#555555'} />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal: 8 }} />

              <TouchableOpacity onPress={() => setShowDeadlineModal(true)} style={{ paddingVertical: 14, paddingHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom: 0 }]}>{t('add_task.deadline')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: fontSizes[fsKey], fontWeight: '400', marginRight: 4, textAlign: 'right' }} numberOfLines={1} ellipsizeMode="tail">
                      {formatDeadlineForDisplay(currentDeadlineSettings, t, i18n.language)}
                    </Text>
                    <Ionicons name="chevron-forward" size={fontSizes[fsKey]} color={isDark ? '#A0A0A0' : '#555555'} />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal: 8 }} />

              <TouchableOpacity
                onPress={() => setShowWheelModal(true)}
                style={{ paddingVertical: 14, paddingHorizontal: 8 }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom: 0 }]}>{t('add_task.notification')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{
                            color: isDark ? '#FFF' : '#000',
                            fontSize: fontSizes[fsKey],
                            fontWeight: '400',
                            marginRight: 4,
                            maxWidth: screenWidth * 0.55
                        }} numberOfLines={1} ellipsizeMode="tail">
                            {notificationActive
                                ? `${customAmount} ${t(`add_task.${customUnit}_before` as const, { count: customAmount })}`
                                : t('add_task.no_notification_display', '通知なし')
                            }
                        </Text>
                        <Ionicons name="chevron-forward" size={fontSizes[fsKey]} color={isDark ? '#A0A0A0' : '#555555'} />
                    </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 8, paddingBottom: 100 }}>
                <ActionButtons
                onSave={saveTask}
                onSaveDraft={saveDraft}
                saveText={t('add_task.add_task_button')}
                draftText={t('add_task.save_draft_button')}
                styles={styles}
                />
            </View>
          </>
        }
      />


        <PhotoPicker
          visible={pickerVisible}
          defaultSelected={selectedUris}
          onCancel={() => setPickerVisible(false)}
          onDone={uris => {
            setSelectedUris(uris);
            setPickerVisible(false);
          }}
        />
        <FolderSelectorModal
          visible={showFolderModal}
          onClose={() => setShowFolderModal(false)}
          onSubmit={(name) => {
            setShowFolderModal(false);
            setTimeout(() => {
              setFolder(name);
            }, MODAL_ANIMATION_DELAY);
          }}
          folders={folders}
        />
        <WheelPickerModal
          visible={showWheelModal}
          initialAmount={customAmount}
          initialUnit={customUnit}
          onConfirm={handleConfirmNotificationInModal}
          onClose={() => setShowWheelModal(false)}
          onSetNoNotification={handleSetNoNotificationInModal}
        />
         <DeadlineSettingModal
          visible={showDeadlineModal}
          onClose={() => setShowDeadlineModal(false)}
          onSave={(newSettings) => {
            let processedSettings = newSettings;
            if (processedSettings && processedSettings.repeatFrequency) {
                const {
                    ...restOfDetails
                } = processedSettings;
                processedSettings = restOfDetails;
            }
            setShowDeadlineModal(false);
            setTimeout(() => {
              setCurrentDeadlineSettings(processedSettings);
            }, MODAL_ANIMATION_DELAY);
          }}
          initialSettings={currentDeadlineSettings}
        />
        <Modal visible={!!previewUri} transparent animationType="fade">
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setPreviewUri(null)}
          >
            {previewUri && (
              <Image source={{ uri: previewUri }} style={{ width: '95%', height: '80%', resizeMode: 'contain', borderRadius: 8 }} />
            )}
             <TouchableOpacity
                style={{ position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, padding: 10 }}
                onPress={() => setPreviewUri(null)}
            >
                <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
          </Pressable>
        </Modal>
    </SafeAreaView>
  );
}