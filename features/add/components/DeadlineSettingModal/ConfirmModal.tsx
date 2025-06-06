// app/features/add/components/DeadlineSettingModal/ConfirmModal.tsx
import React, { useContext, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext, FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';

export type ConfirmModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;
  neutralText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onNeutral?: () => void;
  isOkDestructive?: boolean;
  isNeutralDestructive?: boolean;
};

const createConfirmModalStyles = (isDark: boolean, subColor: string, baseFontSize: number) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      padding: 20,
      borderRadius: 12,
      width: '100%',
      maxWidth: 400,
      alignItems: 'stretch',
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    title: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: baseFontSize + 2,
    },
    message: {
      textAlign: 'center',
      marginVertical: 20,
      color: isDark ? '#E5E5EA' : '#3C3C43',
      fontSize: baseFontSize,
      lineHeight: baseFontSize * 1.5,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 15,
    },
    actionButton: {
      paddingVertical: 10,
      paddingHorizontal: 20, // ユーザーの初期ConfirmModalのokButtonの値を参照
    },
    buttonText: {
      fontSize: baseFontSize,
      textAlign: 'center',
    },
    cancelButtonTextContent: {
      color: Platform.OS === 'ios'
        ? (isDark ? subColor : '#007AFF')
        : (isDark ? '#B0B0B0' : '#555555'),
      fontWeight: 'normal',
    },
    okButtonTextContent: {
      color: subColor,
      fontWeight: 'bold',
    },
    okDestructiveButtonTextContent: {
      color: isDark ? '#FF6B6B' : '#D32F2F',
      fontWeight: 'bold',
    },
  });
};


export function ConfirmModal({
  visible,
  title,
  message,
  okText,
  cancelText,
  onConfirm,
  onCancel,
  isOkDestructive,
}: ConfirmModalProps) {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const baseFontSize = appFontSizes[fontSizeKey];
  const { t } = useTranslation();

  const styles = useMemo(
    () => createConfirmModalStyles(isDark, subColor, baseFontSize),
    [isDark, subColor, baseFontSize]
  );

  const displayTitle = title ?? t('common.notification_title');
  const hasCancelButton = !!(cancelText && onCancel);
  const hasNeutralButton = !!(neutralText && onNeutral);
  const multipleButtons = hasCancelButton || hasNeutralButton;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>
            {displayTitle}
          </Text>
          <Text style={styles.message}>
            {message}
          </Text>
          <View
            style={[
              styles.buttonContainer,
              multipleButtons ? { justifyContent: 'space-between' } : { justifyContent: 'flex-end' },
            ]}
          >
            {hasCancelButton && (
              <TouchableOpacity onPress={onCancel} style={styles.actionButton}>
                <Text style={[styles.buttonText, styles.cancelButtonTextContent]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            {hasNeutralButton && (
              <TouchableOpacity onPress={onNeutral} style={styles.actionButton}>
                <Text
                  style={[
                    styles.buttonText,
                    isNeutralDestructive ? styles.okDestructiveButtonTextContent : styles.okButtonTextContent,
                  ]}
                >
                  {neutralText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onConfirm} style={styles.actionButton}>
              <Text
                style={[
                  styles.buttonText,
                  isOkDestructive ? styles.okDestructiveButtonTextContent : styles.okButtonTextContent,
                ]}
              >
                {okText ?? t('common.ok')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}