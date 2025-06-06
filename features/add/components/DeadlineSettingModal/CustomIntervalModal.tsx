// app/features/add/components/DeadlineSettingModal/CustomIntervalModal.tsx
import React, { useState, useLayoutEffect, useMemo, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet, KeyboardAvoidingView } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import WheelPicker from 'react-native-wheely';

import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext, type FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import type { CustomIntervalUnit } from './types';
import type { DeadlineModalStyles } from './types';

const ANIMATION_TIMING = 0;
const BACKDROP_OPACITY = 0.4;

const WHEELY_ITEM_HEIGHT = Platform.OS === 'ios' ? 40 : 50;
const BASE_PICKER_FONT_SIZE_INCREASE = 2;
const WHEELY_VISIBLE_COUNT = 3;


interface CustomIntervalModalProps {
  visible: boolean;
  initialValue?: number;
  initialUnit?: CustomIntervalUnit;
  onClose: () => void;
  onConfirm: (value: number, unit: CustomIntervalUnit) => void;
  styles: DeadlineModalStyles;
  showErrorAlert: (message: string) => void;
}

const units: { labelKey: 'common.hours' | 'common.days'; value: CustomIntervalUnit }[] = [
  { labelKey: 'common.hours', value: 'hours' },
  { labelKey: 'common.days', value: 'days' },
];

export const CustomIntervalModal: React.FC<CustomIntervalModalProps> = ({
  visible,
  initialValue,
  initialUnit,
  onClose,
  onConfirm,
  styles,
  showErrorAlert,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const baseFontSize = appFontSizes[fontSizeKey];

  const [inputValue, setInputValue] = useState<string>(initialValue?.toString() ?? '1');
  const [selectedUnit, setSelectedUnit] = useState<CustomIntervalUnit>(initialUnit ?? 'days');

  useLayoutEffect(() => {
    if (visible) {
      setInputValue(initialValue?.toString() ?? '1');
      setSelectedUnit(initialUnit ?? 'days');
    }
  }, [visible, initialValue, initialUnit]);

  const handleConfirm = useCallback(() => {
    const numericValue = parseInt(inputValue, 10);
    if (isNaN(numericValue) || numericValue <= 0 || !Number.isInteger(numericValue)) {
      showErrorAlert(t('deadline_modal.error_invalid_interval_value'));
      return;
    }
    onConfirm(numericValue, selectedUnit);
  }, [inputValue, selectedUnit, onConfirm, t, showErrorAlert]);

  const unitOptions = useMemo(() => units.map(u => t(u.labelKey as string)), [t]);
  const selectedUnitIndex = useMemo(() => units.findIndex(u => u.value === selectedUnit), [selectedUnit]);

  const pickerItemTextStyle = useMemo(() => ({
    color: isDark ? '#FFFFFF' : '#000000',
    fontSize: baseFontSize + BASE_PICKER_FONT_SIZE_INCREASE,
    textAlign: 'center',
  } as const), [isDark, baseFontSize]);


  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={ANIMATION_TIMING}
      animationOutTiming={ANIMATION_TIMING}
      backdropTransitionInTiming={ANIMATION_TIMING}
      backdropTransitionOutTiming={ANIMATION_TIMING}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      backdropColor="#000000"
      backdropOpacity={BACKDROP_OPACITY}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ justifyContent: 'flex-end', flex:1 }}
      >
        <SafeAreaView edges={['bottom']} style={[styles.timePickerModalContainer, styles.customIntervalModalContainer]}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{t('deadline_modal.set_custom_interval')}</Text>
          </View>

          <View style={styles.pickerRowSeparator} />

          <View style={styles.customIntervalPickerContainer}>
            <TextInput
              style={[
                styles.customIntervalInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#5A5A5A' : '#D1D1D6',
                  fontSize: baseFontSize + 2
                }
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              placeholder={t('deadline_modal.enter_interval_value')}
              placeholderTextColor={isDark ? '#8A8A8E' : '#C7C7CD'}
              returnKeyType="done"
              maxLength={3}
            />
            <View style={styles.wheelPickerWrapper}>
                 <WheelPicker
                    options={unitOptions}
                    selectedIndex={selectedUnitIndex}
                    onChange={(index) => setSelectedUnit(units[index].value)}
                    itemHeight={WHEELY_ITEM_HEIGHT}
                    itemTextStyle={pickerItemTextStyle}
                    containerStyle={{ width: 120, height: WHEELY_ITEM_HEIGHT * WHEELY_VISIBLE_COUNT }}
                    selectedIndicatorStyle={{ backgroundColor: 'transparent' }}
                    decelerationRate="fast"
                    visibleRest={(WHEELY_VISIBLE_COUNT - 1) / 2}
                />
            </View>
          </View>

          <View style={styles.pickerRowSeparator} />

          <View style={[styles.footer, { paddingTop: 10 }]}>
            <TouchableOpacity style={[styles.button, {flex:1}]} onPress={onClose}>
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, {flex:1}]}
              onPress={handleConfirm}
            >
              <Text style={styles.saveButtonText} numberOfLines={1} adjustsFontSizeToFit>
                {t('common.ok')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};