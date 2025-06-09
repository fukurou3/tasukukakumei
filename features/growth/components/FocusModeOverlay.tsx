import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import WheelPicker from 'react-native-wheely';

const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => `${i}`);
const MINUTE_SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => `${i}`);

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
  hours: number;
  minutes: number;
  seconds: number;
  onChangeHours: (val: number) => void;
  onChangeMinutes: (val: number) => void;
  onChangeSeconds: (val: number) => void;
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
      {focusModeStatus === 'idle' ? (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <WheelPicker
              options={HOURS_OPTIONS}
              selectedIndex={hours}
              onChange={onChangeHours}
              itemHeight={40}
              visibleRest={1}
              itemTextStyle={{ color: '#fff' }}
            />
            <Text style={styles.pickerLabel}>{t('common.hours_label')}</Text>
            <WheelPicker
              options={MINUTE_SECOND_OPTIONS}
              selectedIndex={minutes}
              onChange={onChangeMinutes}
              itemHeight={40}
              visibleRest={1}
              itemTextStyle={{ color: '#fff' }}
            />
            <Text style={styles.pickerLabel}>{t('common.minutes_label')}</Text>
            <WheelPicker
              options={MINUTE_SECOND_OPTIONS}
              selectedIndex={seconds}
              onChange={onChangeSeconds}
              itemHeight={40}
              visibleRest={1}
              itemTextStyle={{ color: '#fff' }}
            />
            <Text style={styles.pickerLabel}>{t('common.seconds_label')}</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity onPress={onStart} style={styles.controlButton}>
              <Ionicons name="play" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onStop} style={styles.controlButton}>
              <Ionicons name="stop" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
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
                <Ionicons name="pause" size={32} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onResume} style={styles.controlButton}>
                <Ionicons name="play" size={32} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onStop} style={styles.controlButton}>
              <Ionicons name="stop" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  pickerContainer: {
    alignItems: 'center',
    padding: 30,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerLabel: {
    color: '#fff',
    marginHorizontal: 5,
    fontSize: 16,
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
  audioButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  progressCircle: {
    marginBottom: 20,
  },
});
