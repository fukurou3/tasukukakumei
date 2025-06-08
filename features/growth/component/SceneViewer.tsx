import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';
import { useSceneState } from '@/features/growth/hooks/UseSceneState';

export default function SceneViewer({ growth }: { growth: number }) {
  const { scenes, selectedSceneId, setSelectedSceneId, selectedScene } =
    useSceneState();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const load = async () => {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        selectedScene.bgmPath,
      );
      setSound(newSound);
      await newSound.playAsync();
    };

    load();
    return () => {
      sound?.unloadAsync();
    };
  }, [selectedSceneId]);

  const size = 200 + growth * 10;

  return (
    <View>
      <Picker
        selectedValue={selectedSceneId}
        onValueChange={(itemValue) => setSelectedSceneId(itemValue)}>
        {scenes.map((scene) => (
          <Picker.Item key={scene.id} label={scene.name} value={scene.id} />
        ))}
      </Picker>
      <ImageBackground
        source={selectedScene.imagePath}
        style={[styles.image, { width: size, height: size }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});
