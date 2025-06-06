// app/features/add/components/DeadlineSettingModal/DatePickerModal.tsx
import React, { useState, useLayoutEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, TextStyle, useWindowDimensions, ViewStyle, ColorValue } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import WheelPicker from 'react-native-wheely';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import type { DeadlineModalStyles } from './types';
import { createDeadlineModalStyles } from './styles';

const WHEELY_ITEM_HEIGHT = Platform.OS === 'ios' ? 80 : 88;
const BASE_PICKER_FONT_SIZE_INCREASE = 18;

const DATE_PICKER_HORIZONTAL_SEPARATOR_PADDING = 5;

const ACCENT_LINE_THICKNESS = 4;
const ACCENT_LINE_LENGTH = 30;
const ACCENT_LINE_BORDER_RADIUS = 2;
const ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING = 10;
const ACCENT_LINE_HORIZONTAL_OFFSET = 5;

const CUSTOM_VISUAL_ALIGNMENT_SHIFT = -28;

const WHEELY_CONTAINER_WIDTH_YEAR = Platform.OS === 'ios' ? 120 : 120;
const WHEELY_CONTAINER_WIDTH_MONTH = Platform.OS === 'ios' ? 80 : 80;
const WHEELY_CONTAINER_WIDTH_DAY = Platform.OS === 'ios' ? 80 : 80;

const WHEELY_VISIBLE_COUNT = 3;
const PICKER_AREA_TOTAL_HEIGHT = WHEELY_ITEM_HEIGHT * WHEELY_VISIBLE_COUNT;

const BACKDROP_OPACITY = 0.4;
const ANIMATION_TIMING = 0;

const createYearData = (currentYear: number): Array<{ label: string; value: number }> => {
  const years = [];
  const startYear = currentYear - 70;
  const endYear = currentYear + 30;
  for (let i = startYear; i <= endYear; i++) {
    years.push({ label: `${i}`, value: i });
  }
  return years;
};

const createMonthData = (t: (key: string, options?: any) => string): Array<{ label: string; value: number }> => {
  const months = [];
  const monthKeys = ['jan_short', 'feb_short', 'mar_short', 'apr_short', 'may_short', 'jun_short', 'jul_short', 'aug_short', 'sep_short', 'oct_short', 'nov_short', 'dec_short'];
  for (let i = 0; i < 12; i++) {
    const label = t(`common.${monthKeys[i]as any}`, { defaultValue: `${i + 1}` });
    months.push({ label: label, value: i + 1 });
  }
  return months;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const createDayData = (year: number, month: number): Array<{ label: string; value: number }> => {
  const days = [];
  const numDays = getDaysInMonth(year, month);
  for (let i = 1; i <= numDays; i++) {
    days.push({ label: `${i}`, value: i });
  }
  return days;
};

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: string;
  onClose: () => void;
  onConfirm: (date: string) => void;
  onClear?: () => void;
  clearButtonText?: string;
}

const getInitialPickerDateValues = (initialDateProp?: string) => {
  const now = new Date();
  if (initialDateProp) {
    const [year, month, day] = initialDateProp.split('-').map(Number);
    return { year, month, day };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

export const DatePickerModal: React.FC<DatePickerModalProps> = React.memo(({
  visible,
  initialDate,
  onClose,
  onConfirm,
  onClear,
  clearButtonText,
}) => {
  const { t } = useTranslation();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const { width: windowWidth } = useWindowDimensions();

  // stylesFromTs は createDeadlineModalStyles から生成されるが、ピッカーモーダル内の特定要素は色を直接指定するため、
  // stylesFromTs の headerText や label の color はここでは使用しない。
  const stylesFromTs: DeadlineModalStyles = useMemo(() => createDeadlineModalStyles(isDark, subColor, fontSizeKey), [isDark, subColor, fontSizeKey]);
  const currentBaseFontSize = appFontSizes[fontSizeKey];
  const pickerItemFontSize = currentBaseFontSize + BASE_PICKER_FONT_SIZE_INCREASE;
  const accentLineColorValue = subColor as ColorValue;
  const baseTextColorForPicker = isDark ? '#FFFFFF' : '#000000'; // ピッカー内テキスト用の基本色

  const initialPickerValues = getInitialPickerDateValues(initialDate);
  const [selectedYear, setSelectedYear] = useState<number>(initialPickerValues.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialPickerValues.month);
  const [selectedDay, setSelectedDay] = useState<number>(initialPickerValues.day);

  const yearData = useMemo(() => createYearData(new Date().getFullYear()), []);
  const monthData = useMemo(() => createMonthData(t), [t]);
  const dayData = useMemo(() => createDayData(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  useLayoutEffect(() => {
    if (visible) {
      const currentDate = new Date();
      let yearToSet: number, monthToSet: number, dayToSet: number;

      if (initialDate) {
        const [year, month, day] = initialDate.split('-').map(Number);
        yearToSet = year;
        monthToSet = month;
        dayToSet = day;
      } else {
        yearToSet = currentDate.getFullYear();
        monthToSet = currentDate.getMonth() + 1;
        dayToSet = currentDate.getDate();
      }
      
      setSelectedYear(yearToSet);
      setSelectedMonth(monthToSet);
      const daysInNewMonth = getDaysInMonth(yearToSet, monthToSet);
      setSelectedDay(Math.min(dayToSet, daysInNewMonth));
    }
  }, [visible, initialDate]);

  useEffect(() => {
    if (visible) {
        const daysInCurrentMonth = getDaysInMonth(selectedYear, selectedMonth);
        if (selectedDay > daysInCurrentMonth) {
            setSelectedDay(daysInCurrentMonth);
        }
    }
  }, [selectedYear, selectedMonth, selectedDay, visible]);

  const handleConfirm = useCallback(() => {
    const finalDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onConfirm(finalDate);
  }, [selectedYear, selectedMonth, selectedDay, onConfirm]);

  const handleYearChange = useCallback((index: number) => setSelectedYear(yearData[index].value), [yearData]);
  const handleMonthChange = useCallback((index: number) => setSelectedMonth(monthData[index].value), [monthData]);
  const handleDayChange = useCallback((index: number) => setSelectedDay(dayData[index].value), [dayData]);

  const yearPickerOptions = useMemo(() => yearData.map(opt => opt.label), [yearData]);
  const monthPickerOptions = useMemo(() => monthData.map(opt => opt.label), [monthData]);
  const dayPickerOptions = useMemo(() => dayData.map(opt => opt.label), [dayData]);

  // MODIFIED: ピッカーモーダル内ヘッダーテキストスタイルを明示的に定義
  const pickerModalHeaderTextStyle = useMemo((): TextStyle => ({
    fontSize: appFontSizes[fontSizeKey] + 3, // styles.ts の headerBaseFontSize + 3 に相当
    fontWeight: '600',
    color: baseTextColorForPicker, // ★通常色を指定
    textAlign: 'center',
    lineHeight: appFontSizes[fontSizeKey] + 8, // styles.ts の headerBaseFontSize + 8 に相当
  }), [fontSizeKey, baseTextColorForPicker]);

  // MODIFIED: ピッカーアイテムテキストスタイルを明示的に定義
  const wheelyItemTextStyle = useMemo((): TextStyle => ({
    color: baseTextColorForPicker, // ★通常色を指定
    fontSize: pickerItemFontSize,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
  }), [baseTextColorForPicker, pickerItemFontSize]);

  const wheelySelectedIndicatorStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
  }), []);

  // MODIFIED: 日付区切り文字スタイルを明示的に定義
  const dateSeparatorStyle = useMemo((): TextStyle => ({
    fontSize: pickerItemFontSize - (Platform.OS === 'ios' ? 7 : 7),
    lineHeight: WHEELY_ITEM_HEIGHT,
    textAlignVertical: 'center',
    marginHorizontal: Platform.OS === 'ios' ? -9 : -9,
    color: baseTextColorForPicker, // ★通常色を指定
    fontWeight: (Platform.OS === 'ios' ? '300' : 'normal') as TextStyle['fontWeight'], // styles.ts の timeSeparator から流用
  }), [baseTextColorForPicker, pickerItemFontSize]);

  const pickerAreaPaddingVertical = useMemo((): number => {
    const defaultPaddingV = Platform.OS === 'ios' ? 10 : 10;
    const stylePaddingV = (stylesFromTs.timePickerContainer as ViewStyle)?.paddingVertical;
    return typeof stylePaddingV === 'number' ? stylePaddingV : defaultPaddingV;
  }, [stylesFromTs.timePickerContainer]);

  const datePickerOuterContainerStyle = useMemo((): ViewStyle => ({
    height: PICKER_AREA_TOTAL_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING,
    paddingVertical: pickerAreaPaddingVertical,
    position: 'relative',
  }), [pickerAreaPaddingVertical, ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING]);

  const innerPickerContentWrapperStyle = useMemo((): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: CUSTOM_VISUAL_ALIGNMENT_SHIFT,
  }), []);

  const adjustedDatePickerModalContainerStyle = useMemo((): ViewStyle => ({
    ...(stylesFromTs.timePickerModalContainer as ViewStyle),
  }), [stylesFromTs.timePickerModalContainer]);

  const yearUnitText = t('common.year_unit', '年');
  const monthUnitText = t('common.month_unit', '月');
  const dayUnitText = t('common.day_unit', '日');

  const pickerWrapperStyle = useMemo((): ViewStyle => ({
    ...(stylesFromTs.wheelPickerWrapper as ViewStyle),
  }), [stylesFromTs.wheelPickerWrapper]);

  const selectedItemAccentLineStyle = useMemo((): ViewStyle => ({
    position: 'absolute',
    width: ACCENT_LINE_LENGTH,
    height: ACCENT_LINE_THICKNESS,
    borderRadius: ACCENT_LINE_BORDER_RADIUS,
    backgroundColor: accentLineColorValue,
  }), [accentLineColorValue]);

  const accentLineTopPosition = pickerAreaPaddingVertical + WHEELY_ITEM_HEIGHT + (WHEELY_ITEM_HEIGHT / 2) - (ACCENT_LINE_THICKNESS / 2);

  const pickerOuterContainerActualWidth = windowWidth - 2 * ACCENT_LINE_CONTAINER_HORIZONTAL_PADDING;

  const leftAccentLeftPosition = ACCENT_LINE_HORIZONTAL_OFFSET;
  const rightAccentLeftPosition = pickerOuterContainerActualWidth - ACCENT_LINE_LENGTH - ACCENT_LINE_HORIZONTAL_OFFSET;

  const yearSelectedIndex = useMemo(() => yearData.findIndex(o => o.value === selectedYear), [yearData, selectedYear]);
  const monthSelectedIndex = useMemo(() => monthData.findIndex(o => o.value === selectedMonth), [monthData, selectedMonth]);
  const daySelectedIndex = useMemo(() => dayData.findIndex(o => o.value === selectedDay), [dayData, selectedDay]);


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
        style={adjustedDatePickerModalContainerStyle}
      >
        <View style={stylesFromTs.timePickerContentContainer}>
          <View style={stylesFromTs.headerContainer}>
            <Text style={pickerModalHeaderTextStyle}>{t('deadline_modal.specify_date', '日付を指定')}</Text>
          </View>

          {stylesFromTs.pickerRowSeparator &&
            <View style={[stylesFromTs.pickerRowSeparator, {
                width: windowWidth - (DATE_PICKER_HORIZONTAL_SEPARATOR_PADDING * 2),
                marginHorizontal: DATE_PICKER_HORIZONTAL_SEPARATOR_PADDING,
            }]} />
          }

          <View style={datePickerOuterContainerStyle}>
            <View style={[ selectedItemAccentLineStyle, { top: accentLineTopPosition, left: leftAccentLeftPosition, }]} />
            <View style={[ selectedItemAccentLineStyle, { top: accentLineTopPosition, left: rightAccentLeftPosition, }]} />

            <View style={innerPickerContentWrapperStyle}>
              <View style={pickerWrapperStyle}>
                <WheelPicker
                  key={`year-${yearSelectedIndex}`}
                  options={yearPickerOptions}
                  selectedIndex={yearSelectedIndex}
                  onChange={handleYearChange}
                  itemHeight={WHEELY_ITEM_HEIGHT}
                  itemTextStyle={wheelyItemTextStyle}
                  containerStyle={{ width: WHEELY_CONTAINER_WIDTH_YEAR, height: PICKER_AREA_TOTAL_HEIGHT }}
                  selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                  decelerationRate="fast"
                  visibleRest={Math.floor(WHEELY_VISIBLE_COUNT / 2)}
                />
              </View>
              <Text style={dateSeparatorStyle}>{yearUnitText}</Text>
              <View style={pickerWrapperStyle}>
                <WheelPicker
                  key={`month-${monthSelectedIndex}`}
                  options={monthPickerOptions}
                  selectedIndex={monthSelectedIndex}
                  onChange={handleMonthChange}
                  itemHeight={WHEELY_ITEM_HEIGHT}
                  itemTextStyle={wheelyItemTextStyle}
                  containerStyle={{ width: WHEELY_CONTAINER_WIDTH_MONTH, height: PICKER_AREA_TOTAL_HEIGHT }}
                  selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                  decelerationRate="fast"
                  visibleRest={Math.floor(WHEELY_VISIBLE_COUNT / 2)}
                />
              </View>
              <Text style={dateSeparatorStyle}>{monthUnitText}</Text>
              <View style={pickerWrapperStyle}>
                <WheelPicker
                  key={`day-${daySelectedIndex}`}
                  options={dayPickerOptions}
                  selectedIndex={daySelectedIndex}
                  onChange={handleDayChange}
                  itemHeight={WHEELY_ITEM_HEIGHT}
                  itemTextStyle={wheelyItemTextStyle}
                  containerStyle={{ width: WHEELY_CONTAINER_WIDTH_DAY, height: PICKER_AREA_TOTAL_HEIGHT }}
                  selectedIndicatorStyle={wheelySelectedIndicatorStyle}
                  decelerationRate="fast"
                  visibleRest={Math.floor(WHEELY_VISIBLE_COUNT / 2)}
                />
              </View>
              <Text style={dateSeparatorStyle}>{dayUnitText}</Text>
            </View>
          </View>

          {stylesFromTs.pickerRowSeparator &&
            <View style={[stylesFromTs.pickerRowSeparator, {
                width: windowWidth - (DATE_PICKER_HORIZONTAL_SEPARATOR_PADDING * 2),
                marginHorizontal: DATE_PICKER_HORIZONTAL_SEPARATOR_PADDING,
            }]} />
          }

          <View style={[stylesFromTs.footer, stylesFromTs.timePickerModalFooter]}>
            <TouchableOpacity style={[stylesFromTs.button, stylesFromTs.timePickerModalButton]} onPress={onClose}>
              <Text style={stylesFromTs.buttonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.cancel')}</Text>
            </TouchableOpacity>
            {onClear && (
                <TouchableOpacity style={[stylesFromTs.button, stylesFromTs.timePickerModalButton]} onPress={onClear}>
                    <Text style={stylesFromTs.buttonText} numberOfLines={1} adjustsFontSizeToFit>{clearButtonText || t('common.clear')}</Text>
                </TouchableOpacity>
            )}
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
});