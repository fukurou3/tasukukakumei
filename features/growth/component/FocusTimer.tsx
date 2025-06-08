import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

type Props = {
  initialSeconds?: number;
  onFinish?: () => void;
};

export default function FocusTimer({ initialSeconds = 1500, onFinish }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          onFinish?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onFinish]);

  const start = () => setIsRunning(true);
  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const reset = () => {
    pause();
    setSecondsLeft(initialSeconds);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{minutes}:{seconds}</Text>
      <View style={styles.buttons}>
        {!isRunning ? (
          <Button title="Start" onPress={start} />
        ) : (
          <Button title="Pause" onPress={pause} />
        )}
        <Button title="Reset" onPress={reset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  time: { fontSize: 48, fontWeight: 'bold' },
  buttons: { flexDirection: 'row', gap: 10 },
});

