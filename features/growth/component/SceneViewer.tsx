import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useSceneState } from '../hooks/sceneState';

const scenes: Record<string, any> = {
  'Silent Forest': require('../assets/scene/Silent Forest/画像.png'),
  plateau: require('../assets/scene/plateau/画像.png'),
};

export default function SceneViewer() {
  const { selectedScene } = useSceneState();
  const source = scenes[selectedScene];

  if (!source) {
    return <View style={[styles.container, styles.placeholder]} />;
  }

  return <Image source={source} style={styles.image} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  container: { flex: 1 },
  placeholder: { backgroundColor: '#222' },
});

