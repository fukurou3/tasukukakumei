// app/features/add/components/DeadlineSettingModal/styles.ts
import { StyleSheet, Platform, TextStyle, ViewStyle } from 'react-native';
import type { DeadlineModalStyles } from './types';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import type { FontSizeKey } from '@/context/FontSizeContext';

export const createDeadlineModalStyles = (
  isDark: boolean,
  subColor: string,
  fsKey: FontSizeKey,
  windowHeight: number
): DeadlineModalStyles => {
  const fontSizes = appFontSizes;
  const baseTextColor = isDark ? '#FFFFFF' : '#000000';
  const backgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const contentBackgroundColor = isDark ? '#000000' : '#FFFFFF';
  const iosSeparatorColor = isDark ? '#3A3A3C' : '#b3b3b5';

  const baseButtonFontSize = fontSizes[fsKey];
  const headerBaseFontSize = fontSizes[fsKey];

  const stylesObject: DeadlineModalStyles = {
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
      height: Math.round(windowHeight * 0.8),
      backgroundColor: contentBackgroundColor,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
    },
    headerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: iosSeparatorColor,
      alignItems: 'center',
      backgroundColor: contentBackgroundColor,
    },
    headerText: {
      fontSize: headerBaseFontSize + 1,
      fontWeight: '600',
      color: baseTextColor,
      textAlign: 'center',
      lineHeight: headerBaseFontSize + 6,
    },
    footer: {
      flexDirection: 'row',
      paddingVertical: Platform.OS === 'ios' ? 10 : 12,
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 28 : 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: iosSeparatorColor,
      backgroundColor: contentBackgroundColor,
      gap: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 5,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: subColor,
      minHeight: 40,
    },
    buttonText: {
      fontSize: baseButtonFontSize,
      fontWeight: '600',
      color: subColor,
      textAlign: 'center',
    },
    saveButton: {
      backgroundColor: subColor,
      borderColor: subColor,
    },
    saveButtonText: {
      color: isDark ? '#000000' : '#FFFFFF',
      fontSize: baseButtonFontSize,
      fontWeight: '600',
      textAlign: 'center',
    },
    tabBarContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: contentBackgroundColor,
      borderBottomWidth: 0,
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: isDark? '#1C1C1E' : '#E0E0E0',
      borderRadius: 20,
      padding: 4,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: 18,
      marginHorizontal: 2,
    },
    tabItemActive: {
      backgroundColor: contentBackgroundColor,
    },
    tabItemInactive: {
      backgroundColor: 'transparent',
    },
    tabLabel: {
      fontSize: fontSizes[fsKey] - 1,
      fontWeight: '600',
      textTransform: 'none',
      textAlign: 'center',
    } as TextStyle,
    tabLabelActive: {
        color: subColor,
    },
    tabLabelInactive: {
        color: baseTextColor,
    },
    tabIndicator: {
      height: 0,
      backgroundColor: 'transparent',
    },
    tabContentContainer: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    label: {
      fontSize: fontSizes[fsKey],
      color: subColor,
      fontWeight: '600',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: contentBackgroundColor,
    },
    settingRowNoBottomBorder: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 0,
      backgroundColor: contentBackgroundColor,
    } as ViewStyle,
    timePickerToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 0,
      backgroundColor: contentBackgroundColor,
    },
    pickerText: {
        fontSize: fontSizes[fsKey],
        color: baseTextColor,
        paddingVertical: Platform.OS === 'ios' ? 2 : 0,
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    timePickerModalContainer: {
        width: '100%',
        alignSelf: 'stretch',
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        paddingBottom: Platform.OS === 'ios' ? 0 : 10,
    },
    timePickerContentContainer: {
    },
    pickerRowSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: iosSeparatorColor,
        marginHorizontal: 0,
    },
    timePickerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    },
    wheelPickerWrapper: {
      marginHorizontal: Platform.OS === 'ios' ? 0 : 1,
    },
    timeSeparator: {
      fontWeight: (Platform.OS === 'ios' ? '300' : 'normal') as TextStyle['fontWeight'],
      marginHorizontal: Platform.OS === 'ios' ? -3 : -1,
      textAlignVertical: 'center',
      color: baseTextColor,
    },
    timePickerModalFooter: {
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 10 : 16,
        paddingHorizontal: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: iosSeparatorColor,
        flexDirection: 'row',
        gap: 8,
    },
    timePickerModalButton: {
    },
    frequencyPickerContainer: {
    },
    weekdaySelectorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: contentBackgroundColor,
    },
    daySelector: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: subColor,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    daySelectorSelected: {
      backgroundColor: subColor,
    },
    daySelectorText: {
      color: subColor,
      fontSize: fontSizes[fsKey] - (Platform.OS === 'ios' ? 1 : 2),
      fontWeight: '600',
    },
    daySelectorTextSelected: {
      color: isDark ? '#000' : '#FFF',
    },
    repeatEndText: {
        fontSize: fontSizes[fsKey],
        color: baseTextColor,
    },
    calendarOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    calendarInModalContainer: {
      width: '90%',
      maxWidth: 400,
      borderRadius: 12,
      paddingVertical: 10,
      backgroundColor: contentBackgroundColor,
      alignItems: 'stretch',
    },
    clearRepeatEndDateButton: {
      alignSelf: 'center',
      paddingVertical: 12,
    },
    periodButtonContainer: {}, // 削除またはDateSelectionTab用に再利用検討
    periodButton: {}, // 削除またはDateSelectionTab用に再利用検討
    periodButtonSelected: {}, // 削除またはDateSelectionTab用に再利用検討
    periodButtonText: {}, // 削除またはDateSelectionTab用に再利用検討
    periodButtonTextSelected: {}, // 削除またはDateSelectionTab用に再利用検討
    textInput: {
    } as ViewStyle,
    sectionTitle: {
      fontSize: fontSizes[fsKey] - 2,
      fontWeight: '500',
      color: isDark ? '#8E8E93' : '#6D6D72',
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8,
      backgroundColor: backgroundColor,
    },
    sectionHeaderText: {
      fontSize: fontSizes[fsKey] -1,
      fontWeight: '600',
      color: baseTextColor,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 10,
      backgroundColor: backgroundColor,
    } as TextStyle,
    settingRowLabelNormalColor: {
        color: baseTextColor,
        fontSize: fontSizes[fsKey],
        fontWeight: '600',
    } as TextStyle,
    exclusionSettingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: contentBackgroundColor,
    },
    exclusionValueText: {
      fontSize: fontSizes[fsKey],
      color: baseTextColor,
      flexShrink: 1,
      textAlign: 'right',
      marginLeft: 8,
    },
    modalContent: {
      backgroundColor: contentBackgroundColor,
      paddingVertical: 10,
      paddingHorizontal: 0,
      borderRadius: 12,
      width: '90%',
      maxWidth: 300,
      maxHeight: '80%',
      alignSelf: 'center',
    },
    modalOptionButton: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: iosSeparatorColor,
    },
    modalOptionText: {
      fontSize: fontSizes[fsKey],
      color: baseTextColor,
      textAlign: 'center',
    },
    pickerContainer: {},
    pickerColumn: {},
    pickerLabel: {},
    switchContainer: {
      width: 51,
      height: 31,
      borderRadius: 31 / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    customIntervalModalContainer: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    },
    customIntervalPickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    customIntervalInput: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      textAlign: 'center',
      minWidth: 60,
      marginRight: 10,
    } as TextStyle,
    dateSectionSeparator: { // DateSelectionTab で使用
      height: StyleSheet.hairlineWidth,
      backgroundColor: iosSeparatorColor,
      marginVertical: 15,
      marginHorizontal: 16,
    }
  };
  return StyleSheet.create(stylesObject as any);
};