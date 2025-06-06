import React, { useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext, type FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';

export type TaskActionModalProps = {
  visible: boolean;
  onClose: () => void;
  onToggleDone: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const BACKDROP_OPACITY = 0.4;
const ANIMATION_TIMING = 250;

type Styles = {
  modal: ViewStyle;
  container: ViewStyle;
  option: ViewStyle;
  optionText: TextStyle;
  separator: ViewStyle;
};

const createStyles = (isDark: boolean, fsKey: FontSizeKey) => {
  return StyleSheet.create<Styles>({
    modal: { justifyContent: 'flex-end', margin: 0 },
    container: {
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
    },
    option: { paddingVertical: 14, paddingHorizontal: 20 },
    optionText: {
      fontSize: fontSizes[fsKey] + 2,
      textAlign: 'center',
      color: isDark ? '#E0E0E0' : '#222222',
    },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: isDark ? '#444' : '#DDD' },
  });
};

export const TaskActionModal: React.FC<TaskActionModalProps> = ({
  visible,
  onClose,
  onToggleDone,
  onShare,
  onEdit,
  onDelete,
}) => {
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = useMemo(() => createStyles(isDark, fontSizeKey), [isDark, fontSizeKey]);

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={ANIMATION_TIMING}
      animationOutTiming={ANIMATION_TIMING}
      backdropTransitionInTiming={ANIMATION_TIMING}
      backdropTransitionOutTiming={ANIMATION_TIMING}
      useNativeDriver={Platform.OS === 'android'}
      useNativeDriverForBackdrop
      backdropOpacity={BACKDROP_OPACITY}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      hideModalContentWhileAnimating
    >
      <SafeAreaView edges={[ 'bottom' ]} style={styles.container}>
        <TouchableOpacity onPress={() => { onClose(); onToggleDone(); }} activeOpacity={0.7} style={styles.option}>
          <Text style={styles.optionText}>□完了済みにする</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity onPress={() => { onClose(); onShare(); }} activeOpacity={0.7} style={styles.option}>
          <Text style={styles.optionText}>共有</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity onPress={() => { onClose(); onEdit(); }} activeOpacity={0.7} style={styles.option}>
          <Text style={styles.optionText}>編集</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity onPress={() => { onClose(); onDelete(); }} activeOpacity={0.7} style={styles.option}>
          <Text style={[styles.optionText, { color: 'red' }]}>消去</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};
