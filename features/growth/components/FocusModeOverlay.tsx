import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  width: number;
  subColor: string;
  isDark: boolean;
  isMuted: boolean;
  focusModeStatus: 'idle' | 'running' | 'paused';
  timeRemaining: number;
  focusDurationSec: number;
  formatTime: (sec: number) => string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleMute: () => void;
}

export default function FocusModeOverlay({
  visible,
  width,
  subColor,
  isDark,
  isMuted,
  focusModeStatus,
  timeRemaining,
  focusDurationSec,
  formatTime,
  onStart,
  onPause,
  onResume,
  onStop,
  onToggleMute,
}: Props) {
  if (!visible) return null;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const size = width * 0.6;
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeRemaining / focusDurationSec;
  return (
    <View
      style={[
        styles.overlay,
        {
          top: -insets.top,
          bottom: -insets.bottom,
          left: -insets.left,
          right: -insets.right,
        },
      ]}
    >
      <TouchableOpacity onPress={onToggleMute} style={styles.audioButton}>
        <Ionicons name={isMuted ? 'volume-mute' : 'musical-notes'} size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.timerContainer}>
        <Svg width={size} height={size} style={styles.progressCircle}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius}
            stroke="#fff"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference * (1 - progress)}
            rotation={-90}
            originX={radius}
            originY={radius}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        <View style={styles.controls}>
          {focusModeStatus === 'running' ? (
            <TouchableOpacity onPress={onPause} style={styles.controlButton}>
              <Text style={styles.controlText}>{t('growth.pause')}</Text>
            </TouchableOpacity>
          ) : focusModeStatus === 'paused' ? (
            <TouchableOpacity onPress={onResume} style={styles.controlButton}>
              <Text style={styles.controlText}>{t('growth.resume')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onStart} style={styles.controlButton}>
              <Text style={styles.controlText}>{t('growth.start_focus_mode')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onStop} style={styles.controlButton}>
            <Text style={styles.controlText}>{t('growth.end')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  timerContainer: {
    alignItems: 'center',
    padding: 30,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    padding: 10,
  },
  controlText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  progressCircle: {
    marginBottom: 20,
  },
});
