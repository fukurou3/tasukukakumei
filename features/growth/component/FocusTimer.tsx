import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type Props = {
  initialSeconds?: number;
  onComplete?: () => void;
};

export default function FocusTimer({ initialSeconds = 1500, onComplete }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft === 0) {
      setIsRunning(false);
      onComplete?.();
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, secondsLeft]);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  };

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(secondsLeft % 60)
    .toString()
    .padStart(2, '0');

  return (
    <View style={styles.container}>
      <ThemedText type="title">{`${minutes}:${seconds}`}</ThemedText>
      <View style={styles.buttons}>
        <Button
          title={isRunning ? 'Pause' : 'Start'}
          onPress={() => setIsRunning((v) => !v)}
        />
        <Button title="Reset" onPress={reset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
});
