import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../themes/types';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  themes: Theme[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function ThemeSelectionModal({ visible, themes, selectedId, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('growth.select_theme')}</Text>
          <FlatList
            data={themes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, selectedId === item.id && styles.optionSelected, item.locked && styles.optionLocked]}
                onPress={() => onSelect(item.id)}
                disabled={item.locked}
              >
                <Image source={item.growthStages.seed.image} style={styles.optionImage} />
                <Text style={[styles.optionName, item.locked && styles.optionNameLocked]}>{item.name}</Text>
                {item.locked && (
                  <View style={styles.lockedOverlay}>
                    <Ionicons name="lock-closed" size={30} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.optionsContainer}
          />
          <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
            <Text style={styles.buttonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '90%', maxHeight: '80%' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  optionsContainer: { justifyContent: 'space-around', paddingBottom: 20 },
  option: { width: '45%', aspectRatio: 1, margin: '2.5%', borderWidth: 2, borderColor: 'transparent', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#f9f9f9', position: 'relative' },
  optionSelected: { borderColor: '#4CAF50' },
  optionLocked: { opacity: 0.5 },
  optionImage: { width: '80%', height: '80%', marginBottom: 5 },
  optionName: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  optionNameLocked: { color: '#888' },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', marginHorizontal: 20 },
  closeButton: { marginTop: 20, backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
