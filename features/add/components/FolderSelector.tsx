import React from 'react';
import { View, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import type { AddTaskStyles } from '../types';

interface FolderSelectorProps {
  existingFolders: string[];
  folder: string;
  showFolderInput: boolean;
  onSelect: (value: string) => void;
  newFolderName: string;
  onChangeNewFolderName: (text: string) => void;
  isDark: boolean;
  placeholderTextColor: string;
  noFolderLabel: string;
  createNewFolderLabel: string;
  styles: AddTaskStyles;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  existingFolders,
  folder,
  showFolderInput,
  onSelect,
  newFolderName,
  onChangeNewFolderName,
  isDark,
  placeholderTextColor,
  noFolderLabel,
  createNewFolderLabel,
  styles,
}) => (
  <>
    <View style={styles.fieldWrapper}>
      <Picker
        selectedValue={showFolderInput ? '__new__' : folder}
        onValueChange={onSelect}
        style={styles.slotPicker}
        dropdownIconColor={isDark ? '#fff' : '#000'}
      >
        <Picker.Item label={noFolderLabel} value="" />
        {existingFolders.map(name => (
          <Picker.Item key={name} label={name} value={name} />
        ))}
        <Picker.Item label={createNewFolderLabel} value="__new__" />
      </Picker>
    </View>
    {showFolderInput && (
      <TextInput
        value={newFolderName}
        onChangeText={onChangeNewFolderName}
        placeholder={createNewFolderLabel}
        placeholderTextColor={placeholderTextColor}
        style={styles.input}
      />
    )}
  </>
);
