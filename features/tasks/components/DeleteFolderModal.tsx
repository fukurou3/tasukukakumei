// /app/(tabs)/tasks/DeleteFolderModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (mode: 'delete_all' | 'only_folder') => void;
};

export function DeleteFolderModal({ visible, onClose, onSelect }: Props) {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const BORDER_RADIUS_LG = 16;
  const BORDER_RADIUS_MD = 10;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
      borderRadius: BORDER_RADIUS_LG,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
      alignItems: 'stretch',
    },
    modalTitle: {
      color: isDark ? '#EFEFEF' : '#1C1C1E',
      fontSize: appFontSizes.large,
      fontWeight: '600',
      marginBottom: 24,
      textAlign: 'center',
    },
    optionButton: {
      borderRadius: BORDER_RADIUS_MD,
      paddingVertical: 14,
      marginBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteAllButton: {
      backgroundColor: isDark ? '#FF453A' :'#FF3B30', // Destructive red
    },
    deleteFolderOnlyButton: {
      backgroundColor: subColor,
    },
    cancelButton: {
      backgroundColor: isDark ? '#48484A' : '#E5E5EA',
      marginTop: 8,
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
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{width: '100%', maxWidth: 400}}>
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
                {t('task_list.select_delete_mode')}
            </Text>

            <TouchableOpacity
                onPress={() => {
                onSelect('delete_all');
                // onClose(); // onSelect should handle closing
                }}
                style={[styles.optionButton, styles.deleteAllButton]}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>
                {t('task_list.delete_folder_and_tasks')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                onSelect('only_folder');
                // onClose(); // onSelect should handle closing
                }}
                style={[styles.optionButton, styles.deleteFolderOnlyButton]}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>
                {t('task_list.delete_folder_only')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onClose}
                style={[styles.optionButton, styles.cancelButton]}
                activeOpacity={0.7}
            >
                <Text style={styles.cancelButtonText}>
                {t('common.cancel')}
                </Text>
            </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}