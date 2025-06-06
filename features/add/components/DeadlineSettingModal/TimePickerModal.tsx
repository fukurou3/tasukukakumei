// app/features/add/components/DeadlineSettingModal/TimePickerModal.tsx
import React, { useState, useLayoutEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, TextStyle, useWindowDimensions, ViewStyle, ColorValue } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import WheelPicker from 'react-native-wheely';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import type { DeadlineTime, AmPm, DeadlineModalStyles } from './types';
import { ampmData as ampmOptionsData, hourData12 } from './types';
import { createDeadlineModalStyles } from './styles';

const createMinuteData = (): Array<{ label: string; value: number }> => {
  const data = [];
  for (let i = 0; i < 60; i++) {
    data.push({ label: i < 10 ? `0${i}` : `${i}`, value: i });
  }
  return data;
};

const minuteDataFull = createMinuteData();

const WHEELY_ITEM_HEIGHT = Platform.OS === 'ios' ? 80 : 88;
const TIME_PICKER_BASE_FONT_SIZE_INCREASE = 18;
const AMPM_FONT_SIZE_ADJUSTMENT = -4;

const AMPM_PICKER_WRAPPER_MARGIN_RIGHT_ADJUSTMENT = Platform.OS === 'ios' ? -12 : -40;

const getAmPmPickerWidth = (baseFontSize: number, ampmFontSizeIncrease: number): number => {
  const effectiveFontSize = baseFontSize + ampmFontSizeIncrease;
  if (effectiveFontSize > 38) return Platform.OS === 'ios' ? 130 : 150;
  if (effectiveFontSize > 28) return Platform.OS === 'ios' ? 110 : 130;
  return Platform.OS === 'ios' ? 90 : 110;
};

const WHEELY_CONTAINER_WIDTH_NORMAL = Platform.OS === 'ios' ? 80 : 100;
const WHEELY_VISIBLE_COUNT = 3;
const PICKER_AREA_TOTAL_HEIGHT = WHEELY_ITEM_HEIGHT * WHEELY_VISIBLE_COUNT;

const BACKDROP_OPACITY = 0.4;
const ANIMATION_TIMING = 300;

const ACCENT_LINE_THICKNESS = 4;
const ACCENT_LINE_LENGTH = 30;
const ACCENT_LINE_BORDER_RADIUS = 2;
const ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING = 10;
const ACCENT_LINE_HORIZONTAL_OFFSET = 5;

const CUSTOM_VISUAL_ALIGNMENT_SHIFT_TIME = -50;

interface TimePickerModalProps {
  visible: boolean;
  initialTime?: DeadlineTime;
  onClose: () => void;
  onConfirm: (time: DeadlineTime) => void;
  onClear: () => void;
}

const to12HourFormat = (hour24: number, minute: number): { hour12: number; ampm: AmPm; minute: number } => {
  const ampm = hour24 < 12 || hour24 === 24 || hour24 === 0 ? 'AM' : 'PM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, ampm, minute };
};

const to24HourFormat = (hour12: number, ampm: AmPm, minute: number): DeadlineTime => {
  let hour24 = hour12;
  if (ampm === 'PM' && hour12 !== 12) {
    hour24 += 12;
  } else if (ampm === 'AM' && hour12 === 12) {
    hour24 = 0;
  }
  return { hour: hour24, minute };
};

const TimePickerModalMemo: React.FC<TimePickerModalProps> = ({
  visible,
  initialTime,
  onClose,
  onConfirm,
  onClear,
}) => {
  const { t } = useTranslation();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const { width: windowWidth } = useWindowDimensions();

  const stylesFromTs: DeadlineModalStyles = useMemo(() => createDeadlineModalStyles(isDark, subColor, fontSizeKey), [isDark, subColor, fontSizeKey]);
  const currentBaseFontSize = appFontSizes[fontSizeKey];
  
  const ampmPickerFontSizeIncrease = TIME_PICKER_BASE_FONT_SIZE_INCREASE + AMPM_FONT_SIZE_ADJUSTMENT;
  const WHEELY_CONTAINER_WIDTH_SHORT = useMemo(() => getAmPmPickerWidth(currentBaseFontSize, ampmPickerFontSizeIncrease), [currentBaseFontSize, ampmPickerFontSizeIncrease]);

  const pickerItemFontSize = currentBaseFontSize + TIME_PICKER_BASE_FONT_SIZE_INCREASE;
  const ampmPickerItemFontSize = currentBaseFontSize + ampmPickerFontSizeIncrease;
  const accentLineColorValue = subColor as ColorValue;
  const baseTextColorForPicker = isDark ? '#FFFFFF' : '#000000';

  const defaultDisplayTime = useMemo(() => {
    return to12HourFormat(initialTime?.hour ?? 0, initialTime?.minute ?? 0); // MODIFIED: Default hour from 9 to 0
  }, [initialTime]);

  const [selectedAmPm, setSelectedAmPm] = useState<AmPm>(defaultDisplayTime.ampm);
  const [selectedHour, setSelectedHour] = useState<number>(defaultDisplayTime.hour12);
  const [selectedMinute, setSelectedMinute] = useState<number>(defaultDisplayTime.minute);

  useLayoutEffect(() => {
    if (visible) {
      const displayTime = to12HourFormat(initialTime?.hour ?? 0, initialTime?.minute ?? 0); // MODIFIED: Default hour from 9 to 0
      setSelectedAmPm(displayTime.ampm);
      setSelectedHour(displayTime.hour12);
      setSelectedMinute(displayTime.minute);
    }
  }, [visible, initialTime]);

  const handleConfirm = useCallback(() => {
    const finalTime = to24HourFormat(selectedHour, selectedAmPm, selectedMinute);
    onConfirm(finalTime);
  }, [selectedHour, selectedAmPm, selectedMinute, onConfirm]);

  const handleAmPmChange = useCallback((index: number) => setSelectedAmPm(ampmOptionsData[index].value), []);
  const handleHourChange = useCallback((index: number) => setSelectedHour(hourData12[index].value), []);
  const handleMinuteChange = useCallback((index: number) => setSelectedMinute(minuteDataFull[index].value), []);

  const ampmPickerOptions = useMemo(() => ampmOptionsData.map(opt => t(`common.${opt.labelKey}`)), [t]);
  const hourPickerOptions = useMemo(() => hourData12.map(opt => opt.label), []);
  const minutePickerOptions = useMemo(() => minuteDataFull.map(opt => opt.label), []);

  const pickerModalHeaderTextStyle = useMemo((): TextStyle => ({
    fontSize: appFontSizes[fontSizeKey] + 3,
    fontWeight: '600',
    color: baseTextColorForPicker,
    textAlign: 'center',
    lineHeight: appFontSizes[fontSizeKey] + 8,
  }), [fontSizeKey, baseTextColorForPicker]);

  const wheelyItemHourMinuteTextStyle = useMemo((): TextStyle => ({
    color: baseTextColorForPicker,
    fontSize: pickerItemFontSize,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
  }), [baseTextColorForPicker, pickerItemFontSize]);

  const wheelyItemAmPmTextStyle = useMemo((): TextStyle => ({
    color: baseTextColorForPicker,
    fontSize: ampmPickerItemFontSize,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
  }), [baseTextColorForPicker, ampmPickerItemFontSize]);

  const wheelySelectedIndicatorStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
  }), []);

  const timeUnitLabelStyle = useMemo((): TextStyle => ({
    fontSize: pickerItemFontSize - (Platform.OS === 'ios' ? 7 : 7),
    lineHeight: WHEELY_ITEM_HEIGHT,
    textAlignVertical: 'center',
    marginHorizontal: Platform.OS === 'ios' ? -9 : -9,
    color: baseTextColorForPicker,
    fontWeight: (Platform.OS === 'ios' ? '300' : 'normal') as TextStyle['fontWeight'],
  }), [baseTextColorForPicker, pickerItemFontSize]);

  const timePickerAreaPaddingVertical = useMemo((): number => {
    const defaultPaddingV = Platform.OS === 'ios' ? 10 : 10;
    const stylePaddingV = (stylesFromTs.timePickerContainer as ViewStyle)?.paddingVertical;
    return typeof stylePaddingV === 'number' ? stylePaddingV : defaultPaddingV;
  }, [stylesFromTs.timePickerContainer]);

  const timePickerOuterContainerStyle = useMemo((): ViewStyle => ({
    height: PICKER_AREA_TOTAL_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: timePickerAreaPaddingVertical,
    marginHorizontal: ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING,
    position: 'relative',
  }), [PICKER_AREA_TOTAL_HEIGHT, timePickerAreaPaddingVertical, ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING]);

  const innerPickerContentWrapperStyle = useMemo((): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: CUSTOM_VISUAL_ALIGNMENT_SHIFT_TIME,
  }), [CUSTOM_VISUAL_ALIGNMENT_SHIFT_TIME]);

  const adjustedTimePickerModalContainerStyle = useMemo((): ViewStyle => ({
    ...(stylesFromTs.timePickerModalContainer as ViewStyle),
  }), [stylesFromTs.timePickerModalContainer]);

  const selectedItemAccentLineStyle = useMemo((): ViewStyle => ({
    position: 'absolute',
    width: ACCENT_LINE_LENGTH,
    height: ACCENT_LINE_THICKNESS,
    borderRadius: ACCENT_LINE_BORDER_RADIUS,
    backgroundColor: accentLineColorValue,
  }), [accentLineColorValue]);

  const accentLineTopPosition = timePickerAreaPaddingVertical + WHEELY_ITEM_HEIGHT + (WHEELY_ITEM_HEIGHT / 2) - (ACCENT_LINE_THICKNESS / 2);
  const pickerOuterContainerActualWidth = windowWidth - 2 * ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING;
  const leftAccentLeftPosition = ACCENT_LINE_HORIZONTAL_OFFSET;
  const rightAccentLeftPosition = pickerOuterContainerActualWidth - ACCENT_LINE_LENGTH - ACCENT_LINE_HORIZONTAL_OFFSET;

  const pickerWrapperStyle = useMemo((): ViewStyle => ({
    ...(stylesFromTs.wheelPickerWrapper as ViewStyle),
  }), [stylesFromTs.wheelPickerWrapper]);

  const amPmPickerSpecificWrapperStyle = useMemo((): ViewStyle => ({
    ...pickerWrapperStyle,
    marginRight: AMPM_PICKER_WRAPPER_MARGIN_RIGHT_ADJUSTMENT,
  }), [pickerWrapperStyle, AMPM_PICKER_WRAPPER_MARGIN_RIGHT_ADJUSTMENT]);

  const hourUnitText = t('common.hour_unit', '時');
  const minuteUnitText = t('common.minute_unit', '分');

  return (
    <Modal
      isVisible={visible}
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
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={[stylesFromTs.modal, { justifyContent: 'flex-end' }]}
    >
      <SafeAreaView
        edges={['bottom']}
        style={adjustedTimePickerModalContainerStyle}
      >
        <View style={stylesFromTs.timePickerContentContainer}>
            <View style={stylesFromTs.headerContainer}>
                <Text style={pickerModalHeaderTextStyle}>{t('deadline_modal.specify_time')}</Text>
            </View>

            {stylesFromTs.pickerRowSeparator &&
              <View style={[
                stylesFromTs.pickerRowSeparator,
                {
                  width: windowWidth - (ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING * 2),
                  marginHorizontal: ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING
                }
              ]} />
            }

            <View style={timePickerOuterContainerStyle}>
                <View style={[ selectedItemAccentLineStyle, { top: accentLineTopPosition, left: leftAccentLeftPosition, }]} />
                <View style={[ selectedItemAccentLineStyle, { top: accentLineTopPosition, left: rightAccentLeftPosition, }]} />
                
                <View style={innerPickerContentWrapperStyle}>
                    <View style={amPmPickerSpecificWrapperStyle}>
                        <WheelPicker
                        options={ampmPickerOptions}
                        selectedIndex={ampmOptionsData.findIndex(o => o.value === selectedAmPm)}
                        onChange={handleAmPmChange}
                        itemHeight={WHEELY_ITEM_HEIGHT}
                        itemTextStyle={wheelyItemAmPmTextStyle}
                        containerStyle={{ width: WHEELY_CONTAINER_WIDTH_SHORT, height: PICKER_AREA_TOTAL_HEIGHT }}
                        selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                        decelerationRate="fast"
                        visibleRest={Math.floor(WHEELY_VISIBLE_COUNT / 2)}
                        />
                    </View>
                    <View style={pickerWrapperStyle}>
                        <WheelPicker
                        options={hourPickerOptions}
                        selectedIndex={hourData12.findIndex(o => o.value === selectedHour)}
                        onChange={handleHourChange}
                        itemHeight={WHEELY_ITEM_HEIGHT}
                        itemTextStyle={wheelyItemHourMinuteTextStyle}
                        containerStyle={{ width: WHEELY_CONTAINER_WIDTH_NORMAL, height: PICKER_AREA_TOTAL_HEIGHT }}
                        selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                        decelerationRate="fast"
                        visibleRest={Math.floor(WHEELY_VISIBLE_COUNT / 2)}
                        />
                    </View>
                    <Text style={timeUnitLabelStyle}>{hourUnitText}</Text>
                    <View style={pickerWrapperStyle}>
                        <WheelPicker
                        options={minutePickerOptions}
                        selectedIndex={minuteDataFull.findIndex(o => o.value === selectedMinute)}
                        onChange={handleMinuteChange}
                        itemHeight={WHEELY_ITEM_HEIGHT}
                        itemTextStyle={wheelyItemHourMinuteTextStyle}
                        containerStyle={{ width: WHEELY_CONTAINER_WIDTH_NORMAL, height: PICKER_AREA_TOTAL_HEIGHT }}
                        selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                        decelerationRate="fast"
                        visibleRest={Math.floor(WHEELY_VISIBLE_COUNT / 2)}
                        />
                    </View>
                    <Text style={timeUnitLabelStyle}>{minuteUnitText}</Text>
                </View>
            </View>

            {stylesFromTs.pickerRowSeparator &&
              <View style={[
                stylesFromTs.pickerRowSeparator,
                {
                  width: windowWidth - (ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING * 2),
                  marginHorizontal: ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING
                }
              ]} />
            }

            <View style={[stylesFromTs.footer, stylesFromTs.timePickerModalFooter]}>
                <TouchableOpacity style={[stylesFromTs.button, stylesFromTs.timePickerModalButton]} onPress={onClose}>
                    <Text style={stylesFromTs.buttonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[stylesFromTs.button, stylesFromTs.timePickerModalButton]} onPress={onClear}>
                    <Text style={stylesFromTs.buttonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.clear')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[stylesFromTs.button, stylesFromTs.saveButton, stylesFromTs.timePickerModalButton]}
                    onPress={handleConfirm}
                >
                    <Text style={stylesFromTs.saveButtonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.ok')}</Text>
                </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
export const TimePickerModal = React.memo(TimePickerModalMemo);