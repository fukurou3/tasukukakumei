// // app/features/add/components/DeadlineSettingModal/PeriodTab.tsx
// import React, { useState, useMemo, useCallback } from 'react';
// import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import { CalendarUtils } from 'react-native-calendars';
// import { Ionicons } from '@expo/vector-icons';
// import { useAppTheme } from '@/hooks/ThemeContext';
// import type { SpecificPeriodTabProps } from './types';
// import { DatePickerModal } from './DatePickerModal';

// const formatDateToDisplay = (dateString: string | undefined, t: (key: string, options?: any) => string): string => {
//     if (!dateString) return t('common.select');
//     return dateString;
// };

// const PeriodTabMemo: React.FC<SpecificPeriodTabProps> = ({
//   styles,
//   periodStartDate,
//   periodEndDate,
//   updateSettings,
// }) => {
//   const { colorScheme } = useAppTheme();
//   const isDark = colorScheme === 'dark';
//   const { t } = useTranslation();

//   const [isDatePickerVisible, setDatePickerVisible] = useState(false);
//   const [editingDateType, setEditingDateType] = useState<'start' | 'end' | null>(null);

//   const handleOpenDatePicker = useCallback((type: 'start' | 'end') => {
//     setEditingDateType(type);
//     setDatePickerVisible(true);
//   }, []);

//   const handleDatePickerClose = useCallback(() => {
//     setDatePickerVisible(false);
//     setEditingDateType(null);
//   }, []);

//   const handleDateConfirm = useCallback((newDate: string) => {
//     if (editingDateType === 'start') {
//       updateSettings('periodStartDate', newDate);
//     } else if (editingDateType === 'end') {
//       updateSettings('periodEndDate', newDate);
//     }
//     handleDatePickerClose();
//   }, [editingDateType, updateSettings, handleDatePickerClose]);

//   const handleDateClear = useCallback(() => {
//     if (editingDateType === 'start') {
//       updateSettings('periodStartDate', undefined);
//     } else if (editingDateType === 'end') {
//       updateSettings('periodEndDate', undefined);
//     }
//   }, [editingDateType, updateSettings]);

//   const displayStartDate = useMemo(() => formatDateToDisplay(periodStartDate, t), [periodStartDate, t]);
//   const displayEndDate = useMemo(() => formatDateToDisplay(periodEndDate, t), [periodEndDate, t]);

//   const labelFontSize = typeof styles.label.fontSize === 'number' ? styles.label.fontSize : 16;
//   const mutedTextColor = isDark ? '#A0A0A0' : '#555555';

//   const getInitialPickerDate = () => {
//     if (editingDateType === 'start' && periodStartDate) return periodStartDate;
//     if (editingDateType === 'end' && periodEndDate) return periodEndDate;
//     if (editingDateType === 'end' && periodStartDate && !periodEndDate) return periodStartDate;
//     return CalendarUtils.getCalendarDateString(new Date());
//   };

//   return (
//     <ScrollView style={styles.tabContentContainer} contentContainerStyle={{ paddingBottom: 20 }}>
//       <TouchableOpacity
//         onPress={() => handleOpenDatePicker('start')}
//         style={styles.settingRow}
//       >
//         <Text style={styles.label}>{t('deadline_modal.start_date')}</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <Text style={[styles.pickerText, { marginRight: 4 }]}>
//             {displayStartDate}
//           </Text>
//           <Ionicons
//             name={"chevron-forward"}
//             size={labelFontSize + 2}
//             color={mutedTextColor}
//           />
//         </View>
//       </TouchableOpacity>

//       <TouchableOpacity
//         onPress={() => handleOpenDatePicker('end')}
//         style={styles.settingRow}
//       >
//         <Text style={styles.label}>{t('deadline_modal.end_date')}</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <Text style={[styles.pickerText, { marginRight: 4 }]}>
//             {displayEndDate}
//           </Text>
//           <Ionicons
//             name={"chevron-forward"}
//             size={labelFontSize + 2}
//             color={mutedTextColor}
//           />
//         </View>
//       </TouchableOpacity>

//       <DatePickerModal
//         visible={isDatePickerVisible}
//         initialDate={getInitialPickerDate()}
//         onClose={handleDatePickerClose}
//         onConfirm={handleDateConfirm}
//         onClear={editingDateType ? handleDateClear : undefined}
//         clearButtonText={t(editingDateType === 'start' ? 'common.clear_start_date' : 'common.clear_end_date')}
//       />
//     </ScrollView>
//   );
// };

// const arePeriodTabPropsEqual = (
//     prevProps: Readonly<SpecificPeriodTabProps>,
//     nextProps: Readonly<SpecificPeriodTabProps>
// ): boolean => {
//     return (
//         prevProps.styles === nextProps.styles &&
//         prevProps.periodStartDate === nextProps.periodStartDate &&
//         prevProps.periodEndDate === nextProps.periodEndDate &&
//         prevProps.updateSettings === nextProps.updateSettings
//     );
// };

// export const PeriodTab = React.memo(PeriodTabMemo, arePeriodTabPropsEqual);