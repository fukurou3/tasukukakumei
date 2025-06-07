import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable, Image, Modal, Alert, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import TasksDatabase from '@/lib/TaskDatabase';
import { Ionicons } from '@expo/vector-icons';
import { useUnsavedStore } from '@/hooks/useUnsavedStore';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';

import type { Task } from '@/features/add/types';
import { createStyles } from '@/features/add/styles';
import { useFolders } from '@/features/add/hooks/useFolders';
import { useUpdateTask } from '@/features/add/hooks/useUpdateTask';
import { TitleField } from '@/features/add/components/TitleField';
import { MemoField } from '@/features/add/components/MemoField';
import { PhotoPicker } from '@/features/add/components/PhotoPicker';
import { FolderSelectorModal } from '@/features/add/components/FolderSelectorModal';
import { WheelPickerModal } from '@/features/add/components/WheelPickerModal';
import { DeadlineSettingModal } from '@/features/add/components/DeadlineSettingModal';
import type { DeadlineSettings, DeadlineTime, RepeatFrequency } from '@/features/add/components/DeadlineSettingModal/types';

const INITIAL_INPUT_HEIGHT = 60;
const PHOTO_LIST_HORIZONTAL_PADDING = 8 * 2;
const MIN_IMAGE_SIZE = 120;
const IMAGE_MARGIN = 8;
const DESTRUCTIVE_ACTION_COLOR = '#FF3B30';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation<BottomTabNavigationProp<{ tasks: undefined }>>();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const fsKey = fontSizeKey;
  const { t, i18n } = useTranslation();

  const unsaved = useUnsavedStore(state => state.unsaved);
  const setUnsaved = useUnsavedStore(state => state.setUnsaved);
  const resetUnsaved = useUnsavedStore(state => state.reset);

  const styles = createStyles(isDark, subColor, fsKey);

  const { width: screenWidth } = useWindowDimensions();
  const photoListContentWidth = screenWidth - PHOTO_LIST_HORIZONTAL_PADDING - (8 * 2);
  const numColumns = useMemo(() => {
    const n = Math.floor((photoListContentWidth + IMAGE_MARGIN) / (MIN_IMAGE_SIZE + IMAGE_MARGIN));
    return Math.max(1, n);
  }, [photoListContentWidth]);
  const imageSize = useMemo(() => {
    const totalMarginSpace = (numColumns - 1) * IMAGE_MARGIN;
    return Math.floor((photoListContentWidth - totalMarginSpace) / numColumns);
  }, [photoListContentWidth, numColumns]);

  const [loading, setLoading] = useState(true);
  const [originalTask, setOriginalTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedUris, setSelectedUris] = useState<string[]>([]);
  const [folder, setFolder] = useState('');
  const [currentDeadlineSettings, setCurrentDeadlineSettings] = useState<DeadlineSettings | undefined>(undefined);
  const [notificationActive, setNotificationActive] = useState(false);
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [customAmount, setCustomAmount] = useState(1);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      await TasksDatabase.initialize();
      const raw = await TasksDatabase.getAllTasks();
      const tasks: Task[] = raw.map(r => JSON.parse(r));
      const found = tasks.find(t => t.id === id);
      if (!found) {
        router.back();
        return;
      }
      setOriginalTask(found);
      setTitle(found.title);
      setMemo(found.memo);
      setSelectedUris(found.imageUris || []);
      setFolder(found.folder || '');
      setCurrentDeadlineSettings(found.deadlineDetails);
      setNotificationActive(found.notifyEnabled);
      setCustomUnit(found.customUnit);
      setCustomAmount(found.customAmount);
      setLoading(false);
      setUnsaved(false);
    };
    load();
  }, [id, router, setUnsaved]);

  const existingFolders = useFolders(showFolderModal);
  useEffect(() => { if (showFolderModal) setFolders(existingFolders); }, [showFolderModal, existingFolders]);

  useEffect(() => {
    if (!originalTask) return;
    const changed =
      title !== originalTask.title ||
      memo !== originalTask.memo ||
      JSON.stringify(selectedUris) !== JSON.stringify(originalTask.imageUris || []) ||
      folder !== (originalTask.folder || '') ||
      JSON.stringify(currentDeadlineSettings) !== JSON.stringify(originalTask.deadlineDetails) ||
      notificationActive !== originalTask.notifyEnabled ||
      customUnit !== originalTask.customUnit ||
      customAmount !== originalTask.customAmount;
    setUnsaved(changed);
  }, [title, memo, selectedUris, folder, currentDeadlineSettings, notificationActive, customUnit, customAmount, originalTask, setUnsaved]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e:any) => {
      if (!unsaved) return;
      e.preventDefault();
      Alert.alert(
        t('edit_task.alert_discard_changes_title'),
        t('edit_task.alert_discard_changes_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('edit_task.alert_discard'),
            style: 'destructive',
            onPress: () => {
              resetUnsaved();
              if (e.data?.action) navigation.dispatch(e.data.action); else router.back();
            },
          },
        ]
      );
    });
    return unsub;
  }, [navigation, router, t, unsaved, resetUnsaved]);

  const { updateTask } = useUpdateTask({
    id: id as string,
    title,
    memo,
    imageUris: selectedUris,
    notifyEnabled: notificationActive,
    customUnit: notificationActive ? customUnit : undefined,
    customAmount: notificationActive ? customAmount : undefined,
    folder,
    t,
    deadlineDetails: currentDeadlineSettings,
  });

  const handleSetNoNotificationInModal = () => {
    setNotificationActive(false);
    setCustomAmount(1);
    setCustomUnit('hours');
    setShowWheelModal(false);
  };

  const handleConfirmNotificationInModal = (amount:number, unit:'minutes'|'hours'|'days') => {
    setNotificationActive(true);
    setCustomAmount(amount);
    setCustomUnit(unit);
    setShowWheelModal(false);
  };

  const renderPhotoItem = ({ item, index }: { item: string; index: number }) => (
    <View
      style={[styles.photoPreviewItem, {
        width: imageSize,
        height: imageSize,
        marginRight: (index + 1) % numColumns !== 0 ? IMAGE_MARGIN : 0,
        marginBottom: IMAGE_MARGIN,
      }]}
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>{t('edit_task.title')}</Text>
        </View>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <Text>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>{t('edit_task.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={{
              backgroundColor: isDark ? '#121212' : '#FFFFFF',
              borderRadius: 12,
              overflow: 'hidden',
              marginHorizontal:8,
              marginTop: 16,
              marginBottom: selectedUris.length > 0 ? 0 : 24,
            }}>
              <View style={{ paddingHorizontal:8, paddingTop:12, paddingBottom:12 }}>
                <TitleField
                  label={t('edit_task.input_title')}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('edit_task.input_title_placeholder')}
                  placeholderTextColor={isDark ? '#adaaaa' : '#777'}
                  labelStyle={[styles.label, { color: subColor }]}
                  inputStyle={[styles.input, { minHeight: INITIAL_INPUT_HEIGHT, backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}
                />
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal:8 }} />
              <View style={{ paddingHorizontal:8, paddingTop:12, paddingBottom:12 }}>
                <MemoField
                  label={t('edit_task.memo')}
                  value={memo}
                  onChangeText={setMemo}
                  placeholder={t('edit_task.memo_placeholder')}
                  placeholderTextColor={isDark ? '#adaaaa' : '#777'}
                  labelStyle={[styles.label, { color: subColor }]}
                  inputStyle={[styles.input, { minHeight: INITIAL_INPUT_HEIGHT, backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0', textAlignVertical:'top' }]}
                />
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal:8 }} />
              <TouchableOpacity onPress={() => setPickerVisible(true)} style={{ paddingVertical:14, paddingHorizontal:8 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom:0 }]}>{t('edit_task.photo')}</Text>
                  <View style={{ flexDirection:'row', alignItems:'center' }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: fontSizes[fsKey], fontWeight:'400', marginRight:4 }}>
                      {selectedUris.length > 0 ? t('add_task.photo_selected', { count: selectedUris.length }) : t('edit_task.select_photo')}
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
        keyExtractor={item => item}
        numColumns={numColumns}
        key={numColumns}
        style={{ paddingHorizontal:8 }}
        contentContainerStyle={styles.photoPreviewContainer}
        ListFooterComponent={
          <>
            {selectedUris.length > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal:8, marginTop: IMAGE_MARGIN, marginBottom:12 }} />}
            <View style={{
              backgroundColor: isDark ? '#121212' : '#FFFFFF',
              borderRadius:12,
              overflow:'hidden',
              marginHorizontal:8,
              marginBottom:24,
              marginTop: selectedUris.length > 0 ? 0 : -24,
            }}>
              <TouchableOpacity onPress={() => setShowFolderModal(true)} style={{ paddingVertical:14, paddingHorizontal:8 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom:0 }]}>{t('add_task.folder')}</Text>
                  <View style={{ flexDirection:'row', alignItems:'center' }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: fontSizes[fsKey], fontWeight:'400', marginRight:4 }}>
                      {folder || t('add_task.no_folder')}
                    </Text>
                    <Ionicons name="chevron-forward" size={fontSizes[fsKey]} color={isDark ? '#A0A0A0' : '#555555'} />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal:8 }} />
              <TouchableOpacity onPress={() => setShowDeadlineModal(true)} style={{ paddingVertical:14, paddingHorizontal:8 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom:0 }]}>{t('add_task.deadline')}</Text>
                  <View style={{ flexDirection:'row', alignItems:'center', flexShrink:1 }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: fontSizes[fsKey], fontWeight:'400', marginRight:4, textAlign:'right' }} numberOfLines={1} ellipsizeMode="tail">
                      {currentDeadlineSettings ? t('add_task.task_deadline_prefix') + ' ' + (currentDeadlineSettings.taskDeadlineDate ?? '') : t('add_task.no_deadline_set')}
                    </Text>
                    <Ionicons name="chevron-forward" size={fontSizes[fsKey]} color={isDark ? '#A0A0A0' : '#555555'} />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD', marginHorizontal:8 }} />
              <TouchableOpacity onPress={() => setShowWheelModal(true)} style={{ paddingVertical:14, paddingHorizontal:8 }} activeOpacity={0.7}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <Text style={[styles.label, { color: subColor, marginBottom:0 }]}>{t('edit_task.notification')}</Text>
                  <View style={{ flexDirection:'row', alignItems:'center' }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: fontSizes[fsKey], fontWeight:'400', marginRight:4, maxWidth: screenWidth * 0.55 }} numberOfLines={1} ellipsizeMode="tail">
                      {notificationActive ? `${customAmount} ${t(`add_task.${customUnit}_before` as const, { count: customAmount })}` : t('add_task.no_notification_display', '通知なし')}
                    </Text>
                    <Ionicons name="chevron-forward" size={fontSizes[fsKey]} color={isDark ? '#A0A0A0' : '#555555'} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal:8, paddingBottom:100 }}>
              <TouchableOpacity style={styles.saveButton} onPress={updateTask}>
                <Text style={styles.saveButtonText}>{t('edit_task.save')}</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />

      <PhotoPicker
        visible={pickerVisible}
        defaultSelected={selectedUris}
        onCancel={() => setPickerVisible(false)}
        onDone={uris => { setSelectedUris(uris); setPickerVisible(false); }}
      />
      <FolderSelectorModal
        visible={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSubmit={(name) => { setFolder(name); setShowFolderModal(false); }}
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
        onSave={(newSettings) => { setCurrentDeadlineSettings(newSettings); setShowDeadlineModal(false); }}
        initialSettings={currentDeadlineSettings}
      />
      <Modal visible={!!previewUri} transparent animationType="fade">
        <Pressable style={{ flex:1, backgroundColor:'rgba(0,0,0,0.85)', justifyContent:'center', alignItems:'center' }} onPress={() => setPreviewUri(null)}>
          {previewUri && (
            <Image source={{ uri: previewUri }} style={{ width:'95%', height:'80%', resizeMode:'contain', borderRadius:8 }} />
          )}
          <TouchableOpacity style={{ position:'absolute', top: Platform.OS === 'ios' ? 50 : 20, right:20, padding:10 }} onPress={() => setPreviewUri(null)}>
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
