import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
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
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth / 2;
  const progress = timeRemaining / focusDurationSec;
  const progressPath = React.useMemo(() => {
    const start = -Math.PI / 2;
    const sweep = 2 * Math.PI * progress;
    const rect = Skia.XYWHRect(strokeWidth / 2, strokeWidth / 2, radius * 2, radius * 2);
    const path = Skia.Path.Make();
    path.addArc(rect, (start * 180) / Math.PI, (sweep * 180) / Math.PI);
    return path;
  }, [progress, radius]);
  return (
    <View style={styles.overlay}>
      <TouchableOpacity onPress={onToggleMute} style={styles.audioButton}>
        <Ionicons name={isMuted ? 'volume-mute' : 'musical-notes'} size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.timerContainer}>
        <Canvas style={[styles.progressCircle, { width: size, height: size }] }>
          <Path path={progressPath} color="#fff" style="stroke" strokeWidth={strokeWidth} strokeCap="round" />
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
