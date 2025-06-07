// features/growth/GrowthScreen.tsx
import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useプレイヤーデータ } from './フック/useプレイヤーデータ';

export default function GrowthScreen() {
  const { isReady, gold, addGold } = useプレイヤーデータ();

  if (!isReady) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">成長の世界</ThemedText>

      <View style={styles.statusContainer}>
        <ThemedText style={styles.goldText}>所持ゴールド: {gold} G</ThemedText>
      </View>

      {/* テスト用のボタン */}
      <Button title="ゴールドを10増やす" onPress={() => addGold(10)} />

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  statusContainer: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  goldText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});