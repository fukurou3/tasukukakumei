import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
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
  return (
    <View style={styles.overlay}>
      <TouchableOpacity onPress={onToggleMute} style={styles.audioButton}>
        <Ionicons name={isMuted ? 'volume-mute' : 'musical-notes'} size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.timerContainer}>
        <Canvas style={{ width: width * 0.6, height: 10, marginBottom: 20 }}>
          <Rect x={0} y={0} width={width * 0.6 * (timeRemaining / focusDurationSec)} height={10} color={subColor} />
        </Canvas>
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
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
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
});
