import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onSelectDictionary: () => void;
  onSelectGacha: () => void;
  onSelectStore: () => void;
  onSelectTheme: () => void;
  onClose: () => void;
}

export default function MenuModal({ visible, onSelectDictionary, onSelectGacha, onSelectStore, onSelectTheme, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.item} onPress={onSelectTheme}>
            <Text style={styles.itemText}>{t('growth.select_theme')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={onSelectDictionary}>
            <Text style={styles.itemText}>{t('growth.gallery')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={onSelectGacha}>
            <Text style={styles.itemText}>{t('growth.gacha')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={onSelectStore}>
            <Text style={styles.itemText}>{t('growth.store')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '90%', maxHeight: '80%' },
  item: { paddingVertical: 10 },
  itemText: { fontSize: 16, textAlign: 'center', paddingVertical: 5 },
});
