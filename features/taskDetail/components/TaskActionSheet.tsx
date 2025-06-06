// features/taskDetail/components/TaskActionSheet.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, Pressable, View, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TaskDetailStyles } from '../styles';

type TaskActionSheetProps = {
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

const screenHeight = Dimensions.get('window').height;

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
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <Pressable style={styles.actionSheetContainer}>
            <View>
              <TouchableOpacity style={styles.actionSheetItem} onPress={onToggleDone}>
                <Text style={styles.actionSheetText}>
                  {isDone ? t('task_detail.mark_as_not_done') : t('task_detail.mark_as_done')}
                </Text>
                <Ionicons
                  name={isDone ? 'checkbox' : 'square-outline'}
                  size={24}
                  style={styles.actionSheetIcon}
                />
              </TouchableOpacity>
              <View style={styles.actionSheetSeparator} />
              <TouchableOpacity style={styles.actionSheetItem} onPress={onEdit}>
                <Text style={styles.actionSheetText}>{t('task_detail.edit')}</Text>
                <Ionicons name="create-outline" size={24} style={styles.actionSheetIcon} />
              </TouchableOpacity>
              <View style={styles.actionSheetSeparator} />
              <TouchableOpacity style={styles.actionSheetItem} onPress={onShare}>
                <Text style={styles.actionSheetText}>{t('task_detail.share')}</Text>
                <Ionicons name="share-social-outline" size={24} style={styles.actionSheetIcon} />
              </TouchableOpacity>
              <View style={styles.actionSheetSeparator} />
              <TouchableOpacity style={styles.actionSheetItem} onPress={onDelete}>
                <Text style={styles.actionSheetDestructiveText}>{t('task_detail.delete')}</Text>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}