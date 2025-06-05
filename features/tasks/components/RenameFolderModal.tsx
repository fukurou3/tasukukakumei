// /app/(tabs)/tasks/RenameFolderModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  initialName: string;
};

export function RenameFolderModal({
  visible,
  onClose,
  onSubmit,
  initialName,
}: Props) {
  const { colorScheme, subColor } = useAppTheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const [name, setName] = useState(initialName);
  const textInputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      // Delay focus slightly to ensure modal animation is complete
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  }, [visible, initialName]);

  const handleSave = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      // onClose(); // onSubmit should ideally handle closing if successful
    }
  };

  const BORDER_RADIUS_LG = 16;
  const BORDER_RADIUS_MD = 10; // Adjusted for input and buttons

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)', // Consistent overlay
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyboardAvoidingView: {
      width: '90%',
      maxWidth: 400,
      justifyContent: 'center',
    },
    modalContent: {
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
      padding: 24,
      borderRadius: BORDER_RADIUS_LG,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    modalTitle: {
      color: isDark ? '#EFEFEF' : '#1C1C1E',
      fontSize: appFontSizes.large,
      fontWeight: '600',
      marginBottom: 24,
      textAlign: 'center',
    },
    textInput: {
      backgroundColor: isDark ? '#3A3A3C' : '#F0F0F2',
      color: isDark ? '#FFFFFF' : '#000000',
      borderRadius: BORDER_RADIUS_MD,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 14 : 12,
      marginBottom: 28,
      fontSize: appFontSizes.medium,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? '#545458' : '#C6C6C8',
    },
    buttonContainer: {
      flexDirection: 'row',
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: BORDER_RADIUS_MD,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: isDark ? '#48484A' : '#E5E5EA',
      marginRight: 6, // Half of the spacing
    },
    saveButton: {
      backgroundColor: subColor,
      marginLeft: 6, // Half of the spacing
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: appFontSizes.medium,
    },
    cancelButtonText: {
       color: isDark ? '#EFEFEF' : '#1C1C1E',
       fontWeight: '500',
       fontSize: appFontSizes.medium,
    }
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
        >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                    {t('task_list.rename_folder_title')}
                </Text>
                <TextInput
                    ref={textInputRef}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('task_list.rename_folder_placeholder')}
                    placeholderTextColor={isDark ? '#98989F' : '#A9A9A9'}
                    style={styles.textInput}
                    onSubmitEditing={handleSave}
                    returnKeyType="done"
                    autoCapitalize="sentences"
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                    onPress={onClose}
                    style={[styles.button, styles.cancelButton]}
                    activeOpacity={0.7}
                    >
                    <Text style={styles.cancelButtonText}>
                        {t('common.cancel')}
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.button, styles.saveButton]}
                    activeOpacity={0.7}
                    >
                    <Text style={styles.buttonText}>
                        {t('common.save')}
                    </Text>
                    </TouchableOpacity>
                </View>
                </View>
            </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}