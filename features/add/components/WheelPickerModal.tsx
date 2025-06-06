// app/features/add/components/WheelPickerModal.tsx
import React, { useState, useLayoutEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, TextStyle, useWindowDimensions, ViewStyle, StyleSheet, ColorValue } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import WheelPicker from 'react-native-wheely';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext, type FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';

type NotificationUnit = 'minutes' | 'hours' | 'days';

interface UnitOption {
  value: NotificationUnit;
  translationKey: string;
}

interface AmountOption {
  label: string;
  value: number;
}

interface WheelPickerModalProps {
  visible: boolean;
  initialAmount?: number;
  initialUnit?: NotificationUnit;
  onClose: () => void;
  onConfirm: (amount: number, unit: NotificationUnit) => void;
  onSetNoNotification: () => void; // ★ 新しいプロパティ
}

const createAmountData = (maxAmount: number = 60): AmountOption[] => {
  const data: AmountOption[] = [];
  for (let i = 1; i <= maxAmount; i++) {
    data.push({ label: `${i}`, value: i });
  }
  return data;
};

const amountDataDefault: AmountOption[] = createAmountData();

const unitData: UnitOption[] = [
  { value: 'minutes', translationKey: 'common.minutes' },
  { value: 'hours', translationKey: 'common.hours' },
  { value: 'days', translationKey: 'common.days' },
];

// --- スタイリング関連の定数や createStyles 関数 (変更なしのため省略) ---
const WHEELY_ITEM_HEIGHT = Platform.OS === 'ios' ? 80 : 88;
const BASE_PICKER_FONT_SIZE_INCREASE = 16;
const WHEELY_CONTAINER_WIDTH_NORMAL = Platform.OS === 'ios' ? 100 : 120;
const WHEELY_CONTAINER_WIDTH_UNIT = Platform.OS === 'ios' ? 150 : 170;
const WHEELY_VISIBLE_COUNT = 3;
const PICKER_AREA_TOTAL_HEIGHT = WHEELY_ITEM_HEIGHT * WHEELY_VISIBLE_COUNT;
const ACCENT_LINE_THICKNESS = 4;
const ACCENT_LINE_LENGTH = 30;
const ACCENT_LINE_BORDER_RADIUS = 2;
const ACCENT_LINE_HORIZONTAL_OFFSET = 5;
const BACKDROP_OPACITY = 0.4;
const ANIMATION_TIMING = 0;
const HORIZONTAL_SEPARATOR_PADDING = 24;
type WheelPickerModalStyleSheet = ReturnType<typeof StyleSheet.create>;
interface ExtendedStyles {
    styles: WheelPickerModalStyleSheet;
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
      fontSize: fontSizes[fsKey] - 1,
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
      paddingBottom: Platform.OS === 'ios' ? 22 : 12,
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
// --- スタイリング関連ここまで ---


const WheelPickerModalComponent: React.FC<WheelPickerModalProps> = ({
  visible,
  initialAmount: propInitialAmount,
  initialUnit: propInitialUnit,
  onClose,
  onConfirm,
  onSetNoNotification, // ★ プロパティ受け取り
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

  const defaultAmount = 1;
  const defaultUnit: NotificationUnit = 'hours';

  const [selectedAmount, setSelectedAmount] = useState<number>(propInitialAmount ?? defaultAmount);
  const [selectedUnit, setSelectedUnit] = useState<NotificationUnit>(propInitialUnit ?? defaultUnit);

  useLayoutEffect(() => {
    if (visible) {
      // モーダル表示時に常に初期値をセットする（通知なし状態から再度開いた場合も考慮）
      setSelectedAmount(propInitialAmount ?? defaultAmount);
      setSelectedUnit(propInitialUnit ?? defaultUnit);
    }
  }, [visible, propInitialAmount, propInitialUnit, defaultAmount, defaultUnit]);

  const handleConfirmPress = useCallback(() => {
    if (typeof onConfirm === 'function') {
        onConfirm(selectedAmount, selectedUnit);
    } else {
        console.error("WheelPickerModal: onConfirm prop is not a function or undefined!");
    }
  }, [selectedAmount, selectedUnit, onConfirm]);

  // ★ 「クリア」ボタンのハンドラを「通知なし」用に変更
  const handleSetNoNotificationPress = useCallback(() => {
    if (typeof onSetNoNotification === 'function') {
      onSetNoNotification(); // 親コンポーネントに通知（親がモーダルを閉じる）
    } else {
      console.error("WheelPickerModal: onSetNoNotification prop is not a function or undefined!");
    }
  }, [onSetNoNotification]);


  const handleAmountChange = useCallback((index: number) => {
    setSelectedAmount(amountDataDefault[index].value);
  }, []);

  const handleUnitChange = useCallback((index: number) => {
    setSelectedUnit(unitData[index].value);
  }, []);

  // --- useMemoフック (変更なしのため省略) ---
  const amountPickerOptions = useMemo(() => amountDataDefault.map(opt => opt.label), []);
  const unitPickerOptions = useMemo(() => unitData.map(opt => {
    const translatedValue = t(opt.translationKey);
    return translatedValue === opt.translationKey ? opt.value : translatedValue;
  }), [t]);
  const wheelyItemTextStyle = useMemo((): TextStyle => ({
    color: pickerItemBaseColorValue,
    fontSize: pickerItemFontSize,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    textAlign: 'center',
  }), [pickerItemBaseColorValue, pickerItemFontSize]);
  const wheelySelectedIndicatorStyle = useMemo((): ViewStyle => ({
    backgroundColor: 'transparent',
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
  const spaceBetweenPickers = 10;
  // --- useMemoフックここまで ---


  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      style={styles.modal}
      backdropOpacity={BACKDROP_OPACITY}
      animationInTiming={ANIMATION_TIMING}
      animationOutTiming={ANIMATION_TIMING}
      useNativeDriver={Platform.OS === 'android'}
      useNativeDriverForBackdrop
      onBackdropPress={() => {
          if (typeof onClose === 'function') {
            onClose();
          } else {
            console.error("WheelPickerModal: onClose prop is not a function or undefined! Cannot close modal on backdrop press.");
          }
      }}
      onBackButtonPress={() => {
          if (typeof onClose === 'function') {
            onClose();
            return true;
          }
          console.error("WheelPickerModal: onClose prop is not a function or undefined! Cannot close modal on back button press.");
          return false;
      }}
    >
      <SafeAreaView
        edges={['bottom']}
        style={styles.modalContainer}
      >
        <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{t('add_task.set_notification_time', '通知時間を設定')}</Text>
            </View>

            <View style={structuralPickerRowSeparatorStyle} />

            <View style={styles.pickerOuterContainer}>
                {/* ... (WheelPicker部分は変更なしのため省略) ... */}
                <View style={[ styles.selectedItemAccentLine, { top: accentLineTopPosition, left: leftAccentLeftPosition, backgroundColor: accentLineColorValue }]} />
                <View style={[ styles.selectedItemAccentLine, { top: accentLineTopPosition, left: rightAccentLeftPosition, backgroundColor: accentLineColorValue }]} />
                <View style={styles.wheelPickerWrapper}>
                    <WheelPicker
                        options={amountPickerOptions}
                        selectedIndex={amountDataDefault.findIndex(o => o.value === selectedAmount)}
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
                        options={unitPickerOptions}
                        selectedIndex={unitData.findIndex(o => o.value === selectedUnit)}
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
                <TouchableOpacity style={styles.button} onPress={() => {
                    if (typeof onClose === 'function') {
                        onClose();
                    } else {
                        console.error("WheelPickerModal: onClose prop is not a function or undefined! Cannot close modal on cancel.");
                    }
                }}>
                    <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.cancel', 'キャンセル')}</Text>
                </TouchableOpacity>
                {/* ★ ボタンのテキストとハンドラを変更 */}
                <TouchableOpacity style={styles.button} onPress={handleSetNoNotificationPress}>
                    <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>{t('add_task.no_notification_button', '通知なし')}</Text>
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

export const WheelPickerModal = React.memo(WheelPickerModalComponent);