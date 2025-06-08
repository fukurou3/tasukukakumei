// features/growth/GrowthScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Modal, Pressable, Animated as RNAnimated, Vibration, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useGrowth } from './hooks/useGrowth';
import { GROWTH_THRESHOLDS, GROWTH_POINTS_PER_FOCUS_MINUTE } from './themes'; // GROWTH_POINTS_PER_FOCUS_MINUTE を追加
import { Theme, GrowthStage } from './themes/types'; // types.tsからThemeとGrowthStageを直接インポート
import { Task } from '@/features/add/types';
import TasksDatabase from '@/lib/TaskDatabase';
import { useFocusEffect, useRouter } from 'expo-router';
import WheelPicker from 'react-native-wheely';
import { Canvas, Rect } from '@shopify/react-native-skia';
import * as Notifications from 'expo-notifications';


type FocusModeStatus = 'idle' | 'running' | 'paused';

const FOCUS_DURATION_OPTIONS = [
  { label: '5分', value: 5 },
  { label: '15分', value: 15 },
  { label: '25分', value: 25 },
  { label: '30分', value: 30 },
  { label: '45分', value: 45 },
  { label: '60分', value: 60 },
];

const START_GROWTH_POINT = 0; // 開始時の成長ポイント

export default function GrowthScreen() {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const router = useRouter(); // ここでuseRouterを初期化
  const { width } = useWindowDimensions();

  const {
    loading,
    themes,
    selectedThemeId,
    changeSelectedTheme,
    currentTheme,
    currentThemeProgress,
    currentThemeAsset,
    addGrowthPoints,
    reloadTasks, // タスク再読み込み関数
  } = useGrowth();

  const [isThemeSelectionModalVisible, setThemeSelectionModalVisible] = useState(false);
  const [isFocusModeActive, setFocusModeActive] = useState(false);
  const [focusModeStatus, setFocusModeStatus] = useState<FocusModeStatus>('idle');
  const [focusDuration, setFocusDuration] = useState(25); // minutes
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60); // seconds
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isDurationPickerVisible, setDurationPickerVisible] = useState(false);
  const [tempFocusDuration, setTempFocusDuration] = useState(focusDuration);
  const [isMuted, setMuted] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  
  // ここを修正: NodeJS.Timeoutの代わりに ReturnType<typeof setInterval> を使用
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const notificationIdRef = useRef<string | null>(null);

  // GrowthScreenにフォーカスされた時にタスクを再読み込み
  useFocusEffect(
    useCallback(() => {
      reloadTasks(); // タスクデータが更新されることを期待
    }, [reloadTasks])
  );

  const getGrowthProgressText = useCallback(() => {
    if (!currentThemeProgress) return '';

    const currentPoints = currentThemeProgress.totalGrowthPoints;
    const currentStage = currentThemeProgress.currentGrowthStage;
    const nextStageKeys: GrowthStage[] = ['sprout', 'young', 'mature', 'ancient'];
    
    let nextStage: GrowthStage | undefined = undefined;
    let requiredPointsForNextStage = 0;

    for (let i = 0; i < nextStageKeys.length; i++) {
      if (GROWTH_THRESHOLDS[nextStageKeys[i]] > currentPoints) {
        nextStage = nextStageKeys[i];
        requiredPointsForNextStage = GROWTH_THRESHOLDS[nextStageKeys[i]];
        break;
      }
    }

    if (nextStage) {
      const pointsNeeded = requiredPointsForNextStage - currentPoints;
      return t('growth.progress_to_next_stage', { pointsNeeded, nextStage: t(`growth.stage_${nextStage}`) });
    } else {
      return t('growth.max_stage_reached');
    }
  }, [currentThemeProgress, t]);


  // 集中モード関連のロジック
  useEffect(() => {
    if (focusModeStatus === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerIntervalRef.current !== null) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            setFocusModeStatus('idle');
            setFocusModeActive(false);
            handleFocusModeCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [focusModeStatus, focusDuration, selectedThemeId, addGrowthPoints, t]);

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: isFocusModeActive ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFocusModeActive, fadeAnim]);


  const startFocusMode = useCallback(() => {
    startTimeRef.current = Date.now();
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notificationIdRef.current).catch(() => {});
      notificationIdRef.current = null;
    }
    Notifications.scheduleNotificationAsync({
      content: {
        title: t('growth.focus_mode_completed_title'),
        body: t('growth.focus_mode_completed_message', {
          minutes: focusDuration,
          points: focusDuration * GROWTH_POINTS_PER_FOCUS_MINUTE,
        }),
      },
      trigger: { seconds: focusDuration * 60 },
    }).then((id) => {
      notificationIdRef.current = id;
    });
    setFocusModeActive(true);
    setFocusModeStatus('running');
    setTimeRemaining(focusDuration * 60);
  }, [focusDuration, t]);

  const showDurationPicker = useCallback(() => {
    if (FOCUS_DURATION_OPTIONS.some(o => o.value === focusDuration)) {
      setTempFocusDuration(focusDuration);
    } else {
      setTempFocusDuration(FOCUS_DURATION_OPTIONS[0].value);
    }
    setDurationPickerVisible(true);
  }, [focusDuration]);

  const confirmDurationPicker = useCallback(() => {
    setFocusDuration(tempFocusDuration);
    setDurationPickerVisible(false);
    startFocusMode();
  }, [tempFocusDuration, startFocusMode]);

  const pauseFocusMode = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notificationIdRef.current).catch(() => {});
      notificationIdRef.current = null;
    }
    setFocusModeStatus('paused');
  }, []);

  const resumeFocusMode = useCallback(() => {
    startTimeRef.current = Date.now();
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notificationIdRef.current).catch(() => {});
      notificationIdRef.current = null;
    }
    Notifications.scheduleNotificationAsync({
      content: {
        title: t('growth.focus_mode_completed_title'),
        body: t('growth.focus_mode_completed_message', {
          minutes: Math.ceil(timeRemaining / 60),
          points: focusDuration * GROWTH_POINTS_PER_FOCUS_MINUTE,
        }),
      },
      trigger: { seconds: timeRemaining },
    }).then((id) => { notificationIdRef.current = id; });
    setFocusModeStatus('running');
  }, [timeRemaining, focusDuration, t]);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  const stopFocusMode = useCallback(() => {
    Alert.alert( // Alertが正しくインポートされたので使用可能
      t('growth.stop_focus_mode_title'),
      t('growth.stop_focus_mode_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.ok'), onPress: () => {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          if (notificationIdRef.current) {
            Notifications.cancelScheduledNotificationAsync(notificationIdRef.current).catch(() => {});
            notificationIdRef.current = null;
          }
          setFocusModeStatus('idle');
          setFocusModeActive(false);
          setTimeRemaining(focusDuration * 60); // Reset timer
        }}
      ]
    );
  }, [focusDuration, t]);

  const handleFocusModeCompletion = useCallback(() => {
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notificationIdRef.current).catch(() => {});
      notificationIdRef.current = null;
    }
    Vibration.vibrate();
    const pointsEarned = focusDuration * GROWTH_POINTS_PER_FOCUS_MINUTE; // 正しくアクセスできる
    addGrowthPoints(selectedThemeId!, pointsEarned);
    Alert.alert( // Alertが正しくインポートされたので使用可能
      t('growth.focus_mode_completed_title'),
      t('growth.focus_mode_completed_message', { minutes: focusDuration, points: pointsEarned }),
      [{ text: t('common.ok') }]
    );
  }, [focusDuration, selectedThemeId, addGrowthPoints, t]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `<span class="math-inline">\{minutes\}\:</span>{seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  // 画像アセットへの参照は `@` エイリアスを利用
  const PLACEHOLDER_IMAGE_FALLBACK = require('@/assets/images/growth/placeholder.png');
  const currentThemeImage = currentThemeAsset?.image || PLACEHOLDER_IMAGE_FALLBACK;

  return (
    <SafeAreaView style={styles.container}>

      {/* 成長表示エリア */}
      <View style={styles.growthDisplayArea}>
        {currentThemeImage && (
          <Image
            source={currentThemeImage}
            style={styles.themeImage}
            resizeMode="contain"
          />
        )}
        <Text style={styles.growthInfoText}>
          {t('growth.current_theme')}: {currentTheme?.name || t('common.none')}
        </Text>
        <Text style={styles.growthPointsText}>
          {t('growth.current_points')}: {currentThemeProgress?.totalGrowthPoints ?? 0}
        </Text>
        <Text style={styles.growthProgressText}>
          {getGrowthProgressText()}
        </Text>
      </View>

      {/* テーマ選択ボタン */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: subColor }]}
        onPress={() => setThemeSelectionModalVisible(true)}
      >
        <Text style={styles.buttonText}>{t('growth.select_theme')}</Text>
      </TouchableOpacity>



      {/* 集中モードUI (鑑賞モードUIの上に重ねて描画) */}
      {isFocusModeActive && (
        <View style={styles.focusModeOverlay}>
          <TouchableOpacity onPress={toggleMute} style={styles.audioButton}>
            <Ionicons name={isMuted ? 'volume-mute' : 'musical-notes'} size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.focusModeTimerContainer}>
            <Canvas style={{ width: width * 0.6, height: 10, marginBottom: 20 }}>
              <Rect x={0} y={0} width={width * 0.6 * (timeRemaining / (focusDuration * 60))} height={10} color={subColor} />
            </Canvas>
            <Text style={styles.focusModeTimerText}>
              {formatTime(timeRemaining)}
            </Text>
            <View style={styles.focusModeControls}>
              {focusModeStatus === 'running' ? (
                <TouchableOpacity onPress={pauseFocusMode} style={styles.focusControlButton}>
                  <Ionicons name="pause-circle-outline" size={50} color={subColor} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={resumeFocusMode} style={styles.focusControlButton}>
                  <Ionicons name="play-circle-outline" size={50} color={subColor} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={stopFocusMode} style={styles.focusControlButton}>
                <Ionicons name="stop-circle-outline" size={50} color={isDark ? '#FF6B6B' : '#D32F2F'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* テーマ選択モーダル */}
      <Modal
        visible={isThemeSelectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeSelectionModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setThemeSelectionModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('growth.select_theme')}</Text>
            <FlatList
              data={themes}
              keyExtractor={item => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    selectedThemeId === item.id && styles.themeOptionSelected,
                    item.locked && styles.themeOptionLocked,
                  ]}
                  onPress={() => changeSelectedTheme(item.id)}
                  disabled={item.locked}
                >
                  <Image source={item.growthStages.seed.image} style={styles.themeOptionImage} />
                  <Text style={[styles.themeOptionName, item.locked && styles.themeOptionNameLocked]}>
                    {item.name}
                  </Text>
                  {item.locked && (
                    <View style={styles.lockedOverlay}>
                      <Ionicons name="lock-closed" size={30} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.themeOptionsContainer}
            />
            <TouchableOpacity
              style={[styles.button, styles.modalCloseButton]}
              onPress={() => setThemeSelectionModalVisible(false)}
            >
              <Text style={styles.buttonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setThemeSelectionModalVisible(true); }}>
              <Text style={styles.menuItemText}>{t('growth.select_theme')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>{t('growth.gallery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>{t('growth.gacha')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>{t('growth.store')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isDurationPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDurationPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDurationPickerVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <WheelPicker
              options={FOCUS_DURATION_OPTIONS.map(o => o.label)}
              selectedIndex={Math.max(0, FOCUS_DURATION_OPTIONS.findIndex(o => o.value === tempFocusDuration))}
              onChange={index => setTempFocusDuration(FOCUS_DURATION_OPTIONS[index].value)}
              itemHeight={40}
              visibleRest={1}
            />
            <TouchableOpacity style={[styles.button, styles.modalCloseButton]} onPress={confirmDurationPicker}>
              <Text style={styles.buttonText}>{t('growth.start_focus_mode')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <RNAnimated.View style={[styles.bottomActions, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={toggleMute} style={styles.bottomActionButton}>
          <Ionicons name={isMuted ? 'volume-mute' : 'musical-notes'} size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={showDurationPicker} style={styles.focusButton}>
          <Ionicons name="timer-outline" size={40} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.bottomActionButton}>
          <Ionicons name="menu" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      </RNAnimated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // ライトモードの背景色
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  growthDisplayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8e8e8', // 鑑賞モードの背景色
  },
  themeImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  growthInfoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  growthPointsText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  growthProgressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  focusModeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', // 半透明のオーバーレイ
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // 他のUIの上に表示
  },
  focusModeTimerContainer: {
    backgroundColor: '#fff', // 集中モードUIの背景色
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  focusModeTimerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  focusModeControls: {
    flexDirection: 'row',
    gap: 20,
  },
  focusControlButton: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  themeOptionsContainer: {
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  themeOption: {
    width: '45%', // 2列表示
    aspectRatio: 1, // 正方形を維持
    margin: '2.5%', // 列間のスペース
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  themeOptionSelected: {
    borderColor: '#4CAF50', // サブカラー
  },
  themeOptionLocked: {
    opacity: 0.5,
  },
  themeOptionImage: {
    width: '80%',
    height: '80%',
    marginBottom: 5,
  },
  themeOptionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  themeOptionNameLocked: {
    color: '#888',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 5,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  bottomActionButton: {
    alignItems: 'center',
  },
  focusButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
});