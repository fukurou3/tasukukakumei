import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

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
  onPause,
  onResume,
  onStop,
  onToggleMute,
}: Props) {
  if (!visible) return null;
  const size = width * 0.6;
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeRemaining / focusDurationSec;
  return (
    <View style={styles.overlay}>
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
            strokeWidth={10}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </Svg>
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        <View style={styles.controls}>
          {focusModeStatus === 'running' ? (
            <TouchableOpacity onPress={onPause} style={styles.controlButton}>
              <Ionicons name="pause-circle-outline" size={50} color={subColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onResume} style={styles.controlButton}>
              <Ionicons name="play-circle-outline" size={50} color={subColor} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onStop} style={styles.controlButton}>
            <Ionicons name="stop-circle-outline" size={50} color={isDark ? '#FF6B6B' : '#D32F2F'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  audioButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  progressCircle: {
    marginBottom: 20,
  },
});
