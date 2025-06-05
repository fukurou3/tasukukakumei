// app/(tabs)/edit-task.tsx

import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useUnsavedStore } from '@/hooks/useUnsavedStore';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext, FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';

const LIGHT_INPUT_BG = '#e0e0e0';
const DARK_INPUT_BG = '#2e2d2d';
const LIGHT_PLACEHOLDER = '#777';
const DARK_PLACEHOLDER = '#adaaaa';
const LIGHT_REMOVE_BG = '#fff';
const DARK_REMOVE_BG = '#0d0d0d';

const STORAGE_KEY = 'TASKS';

type EditTaskStyles = {
  container: ViewStyle;
  appBar: ViewStyle;
  appBarTitle: TextStyle;
  label: TextStyle;
  input: TextStyle;
  pickerButton: ViewStyle;
  pickerButtonWithPreview: ViewStyle;
  addMoreButton: ViewStyle;
  addMoreButtonText: TextStyle;
  fieldWrapper: ViewStyle;
  datetimeRow: ViewStyle;
  datetimeText: TextStyle;
  dateWrapper: ViewStyle;
  timeWrapper: ViewStyle;
  notifyContainer: ViewStyle;
  notifyHeader: ViewStyle;
  notifyLabel: TextStyle;
  toggleContainer: ViewStyle;
  toggleCircle: ViewStyle;
  slotPickerRow: ViewStyle;
  slotPickerWrapper: ViewStyle;
  slotPicker: TextStyle;
  previewWrapper: ViewStyle;
  previewImage: ImageStyle;
  removeIcon: ViewStyle;
  buttonRow: ViewStyle;
  backButton: ViewStyle;
  saveButton: ViewStyle;
  saveButtonText: TextStyle;
};

const createStyles = (
  isDark: boolean,
  subColor: string,
  fsKey: FontSizeKey
) =>
  StyleSheet.create<EditTaskStyles>({
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
      fontSize: fontSizes[fsKey] + 4,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    label: {
      fontSize: fontSizes[fsKey],
      marginBottom: 3,
      fontWeight: '600',
    },
    input: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      color: isDark ? '#fff' : '#000',
      padding: 13,
      borderRadius: 8,
      marginBottom: 16,
      fontSize: fontSizes[fsKey],
    },
    pickerButton: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      borderRadius: 8,
      padding: 12,
      marginBottom: 22,
      alignItems: 'center',
    },
    pickerButtonWithPreview: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      borderRadius: 10,
      padding: 8,
      marginBottom: 10,
    },
    addMoreButton: {
      alignSelf: 'flex-end',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: subColor,
      marginBottom: 8,
    },
    addMoreButtonText: {
      color: '#fff',
      fontSize: fontSizes[fsKey] - 2,
      fontWeight: '600',
    },
    fieldWrapper: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      borderRadius: 10,
      paddingHorizontal: 15,
      justifyContent: 'center',
      height: 50,
      marginBottom: 10,
    },
    datetimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    datetimeText: {
      color: isDark ? '#fff' : '#000',
      fontSize: fontSizes[fsKey],
    },
    dateWrapper: {
      flex: 1,
      marginRight: 8,
    },
    timeWrapper: {
      flex: 1,
    },
    notifyContainer: {
      backgroundColor: isDark ? '#1e1e1e' : '#f4f4f4',
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    notifyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    notifyLabel: {
      fontSize: fontSizes[fsKey],
      fontWeight: '600',
    },
    toggleContainer: {
      width: 50,
      height: 28,
      borderRadius: 14,
      padding: 2,
      justifyContent: 'center',
    },
    toggleCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#fff',
    },
    slotPickerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 0,
    },
    slotPickerWrapper: {
      flex: 1,
      marginRight: 8,
      justifyContent: 'center',
    },
    slotPicker: {
      width: '100%',
      color: isDark ? '#fff' : '#000',
      fontSize: fontSizes[fsKey],
    },
    previewWrapper: {
      position: 'relative',
      marginRight: 12,
    },
    previewImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    removeIcon: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: isDark ? DARK_REMOVE_BG : LIGHT_REMOVE_BG,
      borderRadius: 10,
      padding: 2,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    backButton: {
      flex: 1,
      backgroundColor: '#888',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginRight: 10,
    },
    saveButton: {
      flex: 1,
      backgroundColor: subColor,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: fontSizes[fsKey],
      fontWeight: 'bold',
    },
  });

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = createStyles(isDark, subColor, fontSizeKey);
  const { reset: resetUnsaved } = useUnsavedStore();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [memoHeight, setMemoHeight] = useState(40);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(new Date());
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [customAmount, setCustomAmount] = useState(1);
  const original = useRef<any>(null);

  const getRange = useCallback((unit: 'minutes' | 'hours' | 'days') => {
    const max = unit === 'minutes' ? 60 : unit === 'hours' ? 48 : 31;
    return Array.from({ length: max }, (_, i) => i + 1);
  }, []);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      const task = list.find((t: any) => t.id === id);
      if (!task) return;
      original.current = task;
      setTitle(task.title);
      setMemo(task.memo);
      setMemoHeight(Math.max(40, task.memo.length));
      setDeadline(new Date(task.deadline));
      setImageUris(task.imageUris || []);
      setNotifyEnabled(typeof task.notifyEnabled === 'boolean' ? task.notifyEnabled : true);
      setCustomUnit(task.customUnit ?? 'hours');
      setCustomAmount(task.customAmount ?? 1);
    })();
  }, [id]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      if (!original.current) return;
      const o = original.current;
      const changed =
        title !== o.title ||
        memo !== o.memo ||
        deadline.toISOString() !== o.deadline ||
        notifyEnabled !== o.notifyEnabled ||
        customUnit !== o.customUnit ||
        customAmount !== o.customAmount ||
        JSON.stringify(imageUris) !== JSON.stringify(o.imageUris || []);
      if (!changed) return;
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
              router.replace('/(tabs)/tasks');
            },
          },
        ]
      );
    });
    return unsub;
  }, [navigation, title, memo, deadline, imageUris, notifyEnabled, customUnit, customAmount]);

  const showDatePicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: deadline,
      mode: 'date',
      is24Hour: true,
      onChange: (_e, d) =>
        d && setDeadline(new Date(d.getFullYear(), d.getMonth(), d.getDate(), deadline.getHours(), deadline.getMinutes())),
    });
  }, [deadline]);

  const showTimePicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: deadline,
      mode: 'time',
      is24Hour: true,
      onChange: (_e, t) =>
        t && setDeadline(new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate(), t.getHours(), t.getMinutes())),
    });
  }, [deadline]);

  const handlePickImages = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!res.canceled) {
      const uris = res.assets.map(a => a.uri);
      setImageUris(prev => [...prev, ...uris.filter(u => !prev.includes(u))]);
    }
  }, []);

  const handleRemoveImage = useCallback((uri: string) => {
    setImageUris(prev => prev.filter(u => u !== uri));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert(t('edit_task.alert_no_title'));
      return;
    }
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const updated = list.map((t: any) =>
      t.id === id
        ? {
            ...t,
            title,
            memo,
            deadline: deadline.toISOString(),
            imageUris,
            notifyEnabled,
            customUnit,
            customAmount,
          }
        : t
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    Toast.show({ type: 'success', text1: t('edit_task.save_success') });
    resetUnsaved();
    router.replace('/(tabs)/tasks');
  }, [id, title, memo, deadline, imageUris, notifyEnabled, customUnit, customAmount]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/tasks')}>
          <Ionicons name="arrow-back" size={fontSizes[fontSizeKey]} color={subColor} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{t('edit_task.title')}</Text>
        <View style={{ width: fontSizes[fontSizeKey] }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: subColor }]}>{t('edit_task.input_title')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('edit_task.input_title_placeholder')}
          placeholderTextColor={isDark ? DARK_PLACEHOLDER : LIGHT_PLACEHOLDER}
          multiline
          style={[styles.input, { minHeight: 40 }]}
        />

        <Text style={[styles.label, { color: subColor }]}>{t('edit_task.memo')}</Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder={t('edit_task.memo_placeholder')}
          placeholderTextColor={isDark ? DARK_PLACEHOLDER : LIGHT_PLACEHOLDER}
          multiline
          onContentSizeChange={(e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) =>
            setMemoHeight(e.nativeEvent.contentSize.height)
          }
          style={[styles.input, { height: Math.max(40, memoHeight) }]}
        />

        <Text style={[styles.label, { color: subColor }]}>{t('edit_task.photo')}</Text>
        {imageUris.length === 0 ? (
          <TouchableOpacity style={styles.pickerButton} onPress={handlePickImages}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: fontSizes[fontSizeKey] }}>{t('edit_task.select_photo')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.pickerButtonWithPreview}>
            <TouchableOpacity style={styles.addMoreButton} onPress={handlePickImages}>
              <Text style={styles.addMoreButtonText}>{t('edit_task.add_photo')}</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {imageUris.map(uri => (
                <View key={uri} style={styles.previewWrapper}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeIcon} onPress={() => handleRemoveImage(uri)}>
                    <Ionicons name="close-circle" size={fontSizes[fontSizeKey]} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.notifyContainer}>
          <Text style={[styles.label, { color: subColor }]}>{t('edit_task.deadline')}</Text>
          {Platform.OS === 'android' && (
            <View style={styles.datetimeRow}>
              <TouchableOpacity style={[styles.fieldWrapper, styles.dateWrapper]} onPress={showDatePicker}>
                <Text style={styles.datetimeText}>{deadline.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.fieldWrapper, styles.timeWrapper]} onPress={showTimePicker}>
                <Text style={styles.datetimeText}>
                  {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.notifyHeader}>
            <Text style={[styles.notifyLabel, { color: subColor }]}>{t('edit_task.notification')}</Text>
            <TouchableOpacity
              style={[
                styles.toggleContainer,
                notifyEnabled ? { backgroundColor: subColor } : { backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG },
              ]}
              onPress={() => setNotifyEnabled(v => !v)}
            >
              <View
                style={[
                  styles.toggleCircle,
                  notifyEnabled ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
                ]}
              />
            </TouchableOpacity>
          </View>

          {notifyEnabled && (
            <View style={styles.slotPickerRow}>
              <View style={[styles.fieldWrapper, styles.slotPickerWrapper]}>
                <Picker
                  mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                  selectedValue={customAmount}
                  onValueChange={setCustomAmount}
                  style={styles.slotPicker}
                  dropdownIconColor={isDark ? '#fff' : '#000'}
                >
                  {getRange(customUnit).map(n => (
                    <Picker.Item key={n} label={`${n}`} value={n} />
                  ))}
                </Picker>
              </View>
              <View style={[styles.fieldWrapper, styles.slotPickerWrapper]}>
                <Picker
                  mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                  selectedValue={customUnit}
                  onValueChange={v => {
                    setCustomUnit(v);
                    setCustomAmount(1);
                  }}
                  style={styles.slotPicker}
                  dropdownIconColor={isDark ? '#fff' : '#000'}
                >
                  <Picker.Item label={t('edit_task.minutes_before')} value="minutes" />
                  <Picker.Item label={t('edit_task.hours_before')} value="hours" />
                  <Picker.Item label={t('edit_task.days_before')} value="days" />
                </Picker>
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/tasks')}>
            <Text style={styles.saveButtonText}>{t('edit_task.back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('edit_task.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
