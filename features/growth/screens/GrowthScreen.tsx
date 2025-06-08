// features/growth/GrowthScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated as RNAnimated, Vibration, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useGrowth } from '../hooks/useGrowth';
import { GROWTH_THRESHOLDS, GROWTH_POINTS_PER_FOCUS_MINUTE } from '../themes'; // GROWTH_POINTS_PER_FOCUS_MINUTE を追加
import { Theme, GrowthStage } from '../themes/types'; // types.tsからThemeとGrowthStageを直接インポート
import { useFocusEffect, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import GrowthDisplay from '../components/GrowthDisplay';
import ThemeSelectionModal from '../components/ThemeSelectionModal';
import MenuModal from '../components/MenuModal';
import DurationPickerModal from '../components/DurationPickerModal';
import FocusModeOverlay from '../components/FocusModeOverlay';


type FocusModeStatus = 'idle' | 'running' | 'paused';

export default function GrowthScreen() {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const router = useRouter();

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
  const INITIAL_DURATION_SEC = 25 * 60;
  const [focusDurationSec, setFocusDurationSec] = useState(INITIAL_DURATION_SEC);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_DURATION_SEC);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isDurationPickerVisible, setDurationPickerVisible] = useState(false);
  const [tempHours, setTempHours] = useState(0);
  const [tempMinutes, setTempMinutes] = useState(25);
  const [tempSeconds, setTempSeconds] = useState(0);
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
  }, [focusModeStatus, focusDurationSec, selectedThemeId, addGrowthPoints, t]);

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
          minutes: Math.ceil(focusDurationSec / 60),
          points: Math.ceil(focusDurationSec / 60) * GROWTH_POINTS_PER_FOCUS_MINUTE,
        }),
      },
      trigger: { seconds: focusDurationSec, type: 'timeInterval' },
    }).then((id) => {
      notificationIdRef.current = id;
    });
    setFocusModeActive(true);
    setFocusModeStatus('running');
    setTimeRemaining(focusDurationSec);
  }, [focusDurationSec, t]);

  const showDurationPicker = useCallback(() => {
    const hours = Math.floor(focusDurationSec / 3600);
    const minutes = Math.floor((focusDurationSec % 3600) / 60);
    const seconds = focusDurationSec % 60;
    setTempHours(hours);
    setTempMinutes(minutes);
    setTempSeconds(seconds);
    setDurationPickerVisible(true);
  }, [focusDurationSec]);

  const confirmDurationPicker = useCallback(() => {
    const totalSec = tempHours * 3600 + tempMinutes * 60 + tempSeconds;
    setFocusDurationSec(totalSec);
    setTimeRemaining(totalSec);
    setDurationPickerVisible(false);
    startFocusMode();
  }, [tempHours, tempMinutes, tempSeconds, startFocusMode]);

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
          points: Math.ceil(focusDurationSec / 60) * GROWTH_POINTS_PER_FOCUS_MINUTE,
        }),
      },
      trigger: { seconds: timeRemaining, type: 'timeInterval' },
    }).then((id) => { notificationIdRef.current = id; });
    setFocusModeStatus('running');
  }, [timeRemaining, focusDurationSec, t]);

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
          setTimeRemaining(focusDurationSec); // Reset timer
        }}
      ]
    );
  }, [focusDurationSec, t]);

  const handleFocusModeCompletion = useCallback(() => {
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notificationIdRef.current).catch(() => {});
      notificationIdRef.current = null;
    }
    Vibration.vibrate();
    const pointsEarned = Math.ceil(focusDurationSec / 60) * GROWTH_POINTS_PER_FOCUS_MINUTE; // 正しくアクセスできる
    addGrowthPoints(selectedThemeId!, pointsEarned);
    Alert.alert( // Alertが正しくインポートされたので使用可能
      t('growth.focus_mode_completed_title'),
      t('growth.focus_mode_completed_message', { minutes: Math.ceil(focusDurationSec / 60), points: pointsEarned }),
      [{ text: t('common.ok') }]
    );
  }, [focusDurationSec, selectedThemeId, addGrowthPoints, t]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hoursStr = hours > 0 ? `${hours}:` : '';
    const minutesStr = `${hours > 0 && minutes < 10 ? '0' : ''}${minutes}`;
    const secondsStr = `${seconds < 10 ? '0' : ''}${seconds}`;
    return `${hoursStr}${minutesStr}:${secondsStr}`;
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

  return (
    <SafeAreaView style={styles.container}>

      {/* 成長表示エリア */}
      <GrowthDisplay
        theme={currentTheme}
        progress={currentThemeProgress}
        asset={currentThemeAsset || { image: PLACEHOLDER_IMAGE_FALLBACK }}
        getProgressText={getGrowthProgressText}
      />




      <FocusModeOverlay
        visible={isFocusModeActive}
        width={width}
        subColor={subColor}
        isDark={isDark}
        isMuted={isMuted}
        focusModeStatus={focusModeStatus}
        timeRemaining={timeRemaining}
        focusDurationSec={focusDurationSec}
        formatTime={formatTime}
        onPause={pauseFocusMode}
        onResume={resumeFocusMode}
        onStop={stopFocusMode}
        onToggleMute={toggleMute}
      />

      <ThemeSelectionModal
        visible={isThemeSelectionModalVisible}
        themes={themes}
        selectedId={selectedThemeId}
        onSelect={changeSelectedTheme}
        onClose={() => setThemeSelectionModalVisible(false)}
      />

      <MenuModal
        visible={isMenuVisible}
        onSelectTheme={() => { setMenuVisible(false); setThemeSelectionModalVisible(true); }}
        onSelectDictionary={() => { setMenuVisible(false); router.push('/(tabs)/growth/dictionary'); }}
        onSelectGacha={() => { setMenuVisible(false); router.push('/(tabs)/growth/gacha'); }}
        onSelectStore={() => { setMenuVisible(false); router.push('/(tabs)/growth/store'); }}
        onClose={() => setMenuVisible(false)}
      />

      <DurationPickerModal
        visible={isDurationPickerVisible}
        hours={tempHours}
        minutes={tempMinutes}
        seconds={tempSeconds}
        onChangeHours={setTempHours}
        onChangeMinutes={setTempMinutes}
        onChangeSeconds={setTempSeconds}
        onConfirm={confirmDurationPicker}
        onClose={() => setDurationPickerVisible(false)}
      />

      <RNAnimated.View style={[styles.bottomActions, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={toggleMute} style={styles.bottomActionButton}>
          <Ionicons name={isMuted ? 'volume-mute' : 'musical-notes'} size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isFocusModeActive ? stopFocusMode : showDurationPicker}
          style={[styles.focusModeToggleButton, { backgroundColor: subColor }]}
        >
          <Text style={styles.focusModeToggleText}>
            {isFocusModeActive ? t('growth.focus_mode_button_stop') : t('growth.focus_mode_button_start')}
          </Text>
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
  focusModeToggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  focusModeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});