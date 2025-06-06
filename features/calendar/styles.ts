// app/(tabs)/calendar/styles.ts
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export type CalendarScreenStyles = {
  container: ViewStyle;
  appBar: ViewStyle;
  titleText: TextStyle;
  monthHeader: ViewStyle;
  monthText: TextStyle;
  todayButton: ViewStyle;
  todayButtonText: TextStyle;
  toggleButton: ViewStyle;
  calendarWrapper: ViewStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  headerItem: ViewStyle;
  googleHeader: ViewStyle;
  googleHeaderText: TextStyle;
  googleEventContainer: ViewStyle;
  googleEvent: TextStyle;
  fab: ViewStyle;
};

export const createCalendarStyles = (isDark: boolean, subColor: string): CalendarScreenStyles => {
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const dynamicSubColor = subColor || (isDark ? '#4875B7' : '#2F5A8F');
  const shadowStyle = {
    shadowColor: isDark ? '#000' : '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  };
  
  return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#f2f2f4',
    },
    appBar: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#000000' : '#f2f2f4',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6',
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: textColor,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12, // 左右の余白を調整
        paddingVertical: 8,
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    monthText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: textColor,
    },
    todayButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: dynamicSubColor,
    },
    toggleButton: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: dynamicSubColor,
    },
    todayButtonText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    calendarWrapper: {
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6',
    },
    list: {
        flex: 1,
        marginTop: 8,
    },
    listContent: {
        paddingBottom: 20,
        paddingHorizontal: 12,
    },
    headerItem: {
        marginVertical: 16,
    },
    googleHeader: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6',
        marginHorizontal: 12,
    },
    googleHeaderText: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: dynamicSubColor,
    },
    googleEventContainer: {
        paddingLeft: 8,
        paddingVertical: 4,
    },
    googleEvent: {
        fontSize: 14,
        lineHeight: 18,
        color: textColor,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 16,
        bottom: 16,
        backgroundColor: dynamicSubColor,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadowStyle,
        elevation: 6,
    },
  });
};