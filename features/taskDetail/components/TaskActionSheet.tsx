import React from 'react';
import { Modal, Pressable, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TaskDetailStyles } from '../styles';

export type TaskActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  onToggleDone: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  isDone: boolean;
  styles: TaskDetailStyles;
  subColor: string;
};

export function TaskActionSheet({
  visible,
  onClose,
  onToggleDone,
  onEdit,
  onShare,
  onDelete,
  isDone,
  styles,
  subColor,
}: TaskActionSheetProps) {
  const { t } = useTranslation();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.actionSheetContainer}>
          <View>
            <TouchableOpacity style={styles.actionSheetItem} onPress={onToggleDone}>
              <Ionicons
                name={isDone ? 'checkbox' : 'square-outline'}
                size={24}
                color={subColor}
                style={styles.actionSheetIcon}
              />
              <Text style={styles.actionSheetText}>
                {isDone ? t('task_detail.mark_as_not_done') : t('task_detail.mark_as_done')}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionSheetSeparator} />
            <TouchableOpacity style={styles.actionSheetItem} onPress={onEdit}>
              <Ionicons name="create-outline" size={24} color={subColor} style={styles.actionSheetIcon} />
              <Text style={styles.actionSheetText}>{t('task_detail.edit')}</Text>
            </TouchableOpacity>
            <View style={styles.actionSheetSeparator} />
            <TouchableOpacity style={styles.actionSheetItem} onPress={onShare}>
              <Ionicons name="share-social-outline" size={24} color={subColor} style={styles.actionSheetIcon} />
              <Text style={styles.actionSheetText}>{t('task_detail.share')}</Text>
            </TouchableOpacity>
            <View style={styles.actionSheetSeparator} />
            <TouchableOpacity style={styles.actionSheetItem} onPress={onDelete}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" style={styles.actionSheetIcon} />
              <Text style={styles.actionSheetDestructiveText}>{t('task_detail.delete')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
