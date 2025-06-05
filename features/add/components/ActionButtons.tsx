import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { AddTaskStyles } from '../types';

interface ActionButtonsProps {
  onSave: () => void;
  onSaveDraft: () => void;
  saveText: string;
  draftText: string;
  styles: AddTaskStyles;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onSaveDraft,
  saveText,
  draftText,
  styles,
}) => (
  <View style={styles.buttonRow}>
    {/* 「下書きに保存」ボタンを先に記述 */}
    <TouchableOpacity style={styles.draftButton} onPress={onSaveDraft}>
      <Text style={styles.saveButtonText}>{draftText}</Text>
    </TouchableOpacity>
    {/* 「タスクに追加」ボタンを後に記述 */}
    <TouchableOpacity style={styles.saveButton} onPress={onSave}>
      <Text style={styles.saveButtonText}>{saveText}</Text>
    </TouchableOpacity>
  </View>
);