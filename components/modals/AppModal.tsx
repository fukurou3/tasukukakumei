import React from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const BACKDROP_OPACITY = 0.4;
const ANIMATION_TIMING = 250;

export const AppModal: React.FC<AppModalProps> = ({ visible, onClose, style, children }) => (
  <Modal
    isVisible={visible}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    style={[{ justifyContent: 'flex-end', margin: 0 }, style]}
    animationIn="slideInUp"
    animationOut="slideOutDown"
    animationInTiming={ANIMATION_TIMING}
    animationOutTiming={ANIMATION_TIMING}
    backdropTransitionInTiming={ANIMATION_TIMING}
    backdropTransitionOutTiming={ANIMATION_TIMING}
    useNativeDriver
    useNativeDriverForBackdrop
    backdropColor="#000000"
    backdropOpacity={BACKDROP_OPACITY}
    hideModalContentWhileAnimating
  >
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
      <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>
);
