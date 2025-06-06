// app/features/add/components/DeadlineSettingModal/DurationPickerModal.tsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, TextStyle, useWindowDimensions, ViewStyle, StyleSheet, ColorValue } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import WheelPicker from 'react-native-wheely';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext, type FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import type { DurationUnit, DurationOption, AmountAndUnit } from './types';

interface DurationPickerModalProps {
  visible: boolean;
  initialDuration?: AmountAndUnit;
  onClose: () => void;
  onConfirm: (duration: AmountAndUnit) => void;
  onClear: () => void; // 「期限なし」用
}

const createAmountData = (maxAmount: number): DurationOption[] => {
  const data: DurationOption[] = [];
  for (let i = 1; i <= maxAmount; i++) {
    data.push({ label: `${i}`, value: i });
  }
  return data;
};

const durationUnitData: { value: DurationUnit; translationKey: string; maxAmount: number }[] = [
  { value: 'minutes', translationKey: 'common.minutes_unit_after', maxAmount: 90 },
  { value: 'hours', translationKey: 'common.hours_unit_after', maxAmount: 48 },
  { value: 'days', translationKey: 'common.days_unit_after', maxAmount: 90 },
  { value: 'months', translationKey: 'common.months_unit_after', maxAmount: 24 },
  { value: 'years', translationKey: 'common.years_unit_after', maxAmount: 10 },
];

const WHEELY_ITEM_HEIGHT = Platform.OS === 'ios' ? 80 : 88;
const BASE_PICKER_FONT_SIZE_INCREASE = 16;
const WHEELY_CONTAINER_WIDTH_NORMAL = Platform.OS === 'ios' ? 100 : 120;
const WHEELY_CONTAINER_WIDTH_UNIT = Platform.OS === 'ios' ? 150 : 170; // 単位ピッカーの幅を調整
const WHEELY_VISIBLE_COUNT = 3;
const PICKER_AREA_TOTAL_HEIGHT = WHEELY_ITEM_HEIGHT * WHEELY_VISIBLE_COUNT;
const ACCENT_LINE_THICKNESS = 4;
const ACCENT_LINE_LENGTH = 30;
const ACCENT_LINE_BORDER_RADIUS = 2;
const ACCENT_LINE_HORIZONTAL_OFFSET = 5;
const BACKDROP_OPACITY = 0.4;
const ANIMATION_TIMING = 300;
const HORIZONTAL_SEPARATOR_PADDING = 24;

type DurationPickerModalStyleSheet = ReturnType<typeof StyleSheet.create>;
interface ExtendedStyles {
    styles: DurationPickerModalStyleSheet;
    pickerItemBaseColorValue: ColorValue;
    accentLineColorValue: ColorValue;
}

const createStyles = (
  isDark: boolean,
  subColor: string,
  fsKey: FontSizeKey,
): ExtendedStyles => {
  const fontSizes = appFontSizes;
  const baseTextColor = isDark ? '#FFFFFF' : '#000000';
  const iosModalContentBackgroundColor = isDark ? '#1A1A1A' : '#F0F0F0';
  const iosSeparatorColor = isDark ? '#38383A' : '#C7C7CC';
  const baseButtonFontSize = fontSizes[fsKey];

  const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    modalContainer: {
      width: '100%',
      backgroundColor: iosModalContentBackgroundColor,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
      paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    },
    contentContainer: {},
    headerContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: iosSeparatorColor,
      alignItems: 'center',
      backgroundColor: iosModalContentBackgroundColor,
    },
    headerText: {
      fontSize: fontSizes[fsKey] -1, // 他のモーダルと合わせる
      fontWeight: '600',
      color: baseTextColor,
    },
    structuralPickerRowSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: iosSeparatorColor,
    },
    pickerOuterContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      marginHorizontal: HORIZONTAL_SEPARATOR_PADDING,
      height: PICKER_AREA_TOTAL_HEIGHT,
      position: 'relative',
    },
    wheelPickerWrapper: {},
    footer: {
      flexDirection: 'row',
      paddingVertical: Platform.OS === 'ios' ? 10 : 12,
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 22 : 12, // Safe Areaを考慮
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: iosSeparatorColor,
      backgroundColor: iosModalContentBackgroundColor,
      gap: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 5,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: subColor,
      minHeight: 36,
    },
    buttonText: {
      fontSize: baseButtonFontSize,
      fontWeight: '600',
      color: subColor,
      textAlign: 'center',
    },
    confirmButton: {
      backgroundColor: subColor,
      borderColor: subColor,
    },
    confirmButtonText: {
      color: isDark ? '#000000' : '#FFFFFF',
      fontSize: baseButtonFontSize,
      fontWeight: '600',
      textAlign: 'center',
    },
    selectedItemAccentLine: {
        position: 'absolute',
        width: ACCENT_LINE_LENGTH,
        height: ACCENT_LINE_THICKNESS,
        borderRadius: ACCENT_LINE_BORDER_RADIUS,
    },
  });
  return {
      styles,
      pickerItemBaseColorValue: baseTextColor as ColorValue,
      accentLineColorValue: subColor as ColorValue,
  };
};


const DurationPickerModalComponent: React.FC<DurationPickerModalProps> = ({
  visible,
  initialDuration,
  onClose,
  onConfirm,
  onClear,
}) => {
  const { t } = useTranslation();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const { width: windowWidth } = useWindowDimensions();

  const { styles, pickerItemBaseColorValue, accentLineColorValue } = useMemo(
    () => createStyles(isDark, subColor, fontSizeKey),
    [isDark, subColor, fontSizeKey]
  );

  const currentBaseFontSize = appFontSizes[fontSizeKey];
  const pickerItemFontSize = currentBaseFontSize + BASE_PICKER_FONT_SIZE_INCREASE;

  const getDefaultUnit = (): DurationUnit => durationUnitData[1].value; // 'hours'
  const getDefaultAmount = (unit: DurationUnit): number => {
      const unitConfig = durationUnitData.find(u => u.value === unit);
      return unitConfig ? 1 : 1; // Default to 1 if unit not found
  };


  const [selectedUnit, setSelectedUnit] = useState<DurationUnit>(initialDuration?.unit || getDefaultUnit());
  const [currentAmountData, setCurrentAmountData] = useState<DurationOption[]>(
    createAmountData(durationUnitData.find(u => u.value === (initialDuration?.unit || getDefaultUnit()))?.maxAmount || 60)
  );
  const [selectedAmount, setSelectedAmount] = useState<number>(initialDuration?.amount || getDefaultAmount(initialDuration?.unit || getDefaultUnit()));


  useEffect(() => {
    if (visible) {
      const unitToSet = initialDuration?.unit || getDefaultUnit();
      const unitConfig = durationUnitData.find(u => u.value === unitToSet);
      const maxAmountForUnit = unitConfig?.maxAmount || 60;
      const newAmountData = createAmountData(maxAmountForUnit);

      setSelectedUnit(unitToSet);
      setCurrentAmountData(newAmountData);

      let amountToSet = initialDuration?.amount || getDefaultAmount(unitToSet);
      if (amountToSet > maxAmountForUnit) {
        amountToSet = maxAmountForUnit; // Clamp to max if initial amount exceeds new max
      }
      setSelectedAmount(amountToSet);
    }
  }, [visible, initialDuration]);


  const handleConfirmPress = useCallback(() => {
    onConfirm({ amount: selectedAmount, unit: selectedUnit });
  }, [selectedAmount, selectedUnit, onConfirm]);

  const handleClearPress = useCallback(() => {
    onClear();
  }, [onClear]);

  const handleUnitChange = useCallback((index: number) => {
    const newUnit = durationUnitData[index].value;
    setSelectedUnit(newUnit);
    const newMaxAmount = durationUnitData[index].maxAmount;
    setCurrentAmountData(createAmountData(newMaxAmount));
    // 単位変更時にamountが新しい最大値を超えないように調整
    setSelectedAmount(prevAmount => Math.min(prevAmount, newMaxAmount));
  }, []);

  const handleAmountChange = useCallback((index: number) => {
    setSelectedAmount(currentAmountData[index].value);
  }, [currentAmountData]);


  const amountPickerOptions = useMemo(() => currentAmountData.map(opt => opt.label), [currentAmountData]);
  const unitPickerOptions = useMemo(() => durationUnitData.map(opt => {
    const translatedValue = t(opt.translationKey as any); // tに渡すキーをanyにキャスト
    return translatedValue === opt.translationKey ? opt.value : translatedValue;
  }), [t]);

  const wheelyItemTextStyle = useMemo((): TextStyle => ({
    color: pickerItemBaseColorValue,
    fontSize: pickerItemFontSize,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal', // より一般的なfontWeight
    textAlign: 'center',
  }), [pickerItemBaseColorValue, pickerItemFontSize]);

  const wheelySelectedIndicatorStyle = useMemo((): ViewStyle => ({
    backgroundColor: 'transparent', // 中央の線は別途描画するため透明
  }), []);

  const structuralPickerRowSeparatorStyle = useMemo((): ViewStyle => ({
    ...styles.structuralPickerRowSeparator,
    width: windowWidth - (HORIZONTAL_SEPARATOR_PADDING * 2),
    marginHorizontal: HORIZONTAL_SEPARATOR_PADDING,
  }), [styles.structuralPickerRowSeparator, windowWidth, HORIZONTAL_SEPARATOR_PADDING]);

  const pickerAreaVPadding = (styles.pickerOuterContainer.paddingVertical as number || 0);
  const accentLineTopPosition = pickerAreaVPadding + WHEELY_ITEM_HEIGHT + (WHEELY_ITEM_HEIGHT / 2) - (ACCENT_LINE_THICKNESS / 2);

  const pickerOuterContainerWidth = windowWidth - 2 * HORIZONTAL_SEPARATOR_PADDING;
  const leftAccentLeftPosition = ACCENT_LINE_HORIZONTAL_OFFSET;
  const rightAccentLeftPosition = pickerOuterContainerWidth - ACCENT_LINE_LENGTH - ACCENT_LINE_HORIZONTAL_OFFSET;
  const spaceBetweenPickers = 10; // ピッカー間のスペース

  const selectedAmountIndex = useMemo(() => {
    const index = currentAmountData.findIndex(o => o.value === selectedAmount);
    return index === -1 ? 0 : index; // 見つからない場合は先頭
  }, [currentAmountData, selectedAmount]);

  const selectedUnitIndex = useMemo(() => {
    const index = durationUnitData.findIndex(o => o.value === selectedUnit);
    return index === -1 ? 0 : index; // 見つからない場合は先頭
  }, [selectedUnit]);


  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.modal}
      backdropOpacity={BACKDROP_OPACITY}
      animationInTiming={ANIMATION_TIMING}
      animationOutTiming={ANIMATION_TIMING}
      useNativeDriver={Platform.OS === 'android'} // Androidではパフォーマンス向上のため推奨
      useNativeDriverForBackdrop
      onBackdropPress={onClose}
      onBackButtonPress={() => { onClose(); return true; }}
    >
      <SafeAreaView
        edges={['bottom']}
        style={styles.modalContainer}
      >
        <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{t('deadline_modal.set_task_duration_title', 'タスクの所要時間を設定')}</Text>
            </View>

            <View style={structuralPickerRowSeparatorStyle} />

            <View style={styles.pickerOuterContainer}>
                <View style={[ styles.selectedItemAccentLine, { top: accentLineTopPosition, left: leftAccentLeftPosition, backgroundColor: accentLineColorValue }]} />
                <View style={[ styles.selectedItemAccentLine, { top: accentLineTopPosition, left: rightAccentLeftPosition, backgroundColor: accentLineColorValue }]} />

                <View style={styles.wheelPickerWrapper}>
                    <WheelPicker
                        key={`amount-${selectedUnit}-${currentAmountData.length}`} // 単位やデータソースが変わったらキーを更新して再描画を促す
                        options={amountPickerOptions}
                        selectedIndex={selectedAmountIndex}
                        onChange={handleAmountChange}
                        itemHeight={WHEELY_ITEM_HEIGHT}
                        itemTextStyle={wheelyItemTextStyle}
                        containerStyle={{ width: WHEELY_CONTAINER_WIDTH_NORMAL, height: PICKER_AREA_TOTAL_HEIGHT }}
                        selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                        decelerationRate="fast"
                        visibleRest={(WHEELY_VISIBLE_COUNT - 1) / 2}
                    />
                </View>
                <View style={{width: spaceBetweenPickers}}/>
                <View style={styles.wheelPickerWrapper}>
                    <WheelPicker
                        key={`unit-${selectedUnitIndex}`}
                        options={unitPickerOptions}
                        selectedIndex={selectedUnitIndex}
                        onChange={handleUnitChange}
                        itemHeight={WHEELY_ITEM_HEIGHT}
                        itemTextStyle={wheelyItemTextStyle}
                        containerStyle={{ width: WHEELY_CONTAINER_WIDTH_UNIT, height: PICKER_AREA_TOTAL_HEIGHT }}
                        selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                        decelerationRate="fast"
                        visibleRest={(WHEELY_VISIBLE_COUNT - 1) / 2}
                    />
                </View>
            </View>

            <View style={structuralPickerRowSeparatorStyle} />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={onClose}>
                    <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.cancel', 'キャンセル')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleClearPress}>
                    <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.clear_duration', '期限なし')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirmPress}
                >
                    <Text style={styles.confirmButtonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.ok', 'OK')}</Text>
                </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export const DurationPickerModal = React.memo(DurationPickerModalComponent);