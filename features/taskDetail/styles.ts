// features/taskDetail/styles.ts
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { fontSizes } from '@/constants/fontSizes';
import type { FontSizeKey } from '@/context/FontSizeContext';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export type TaskDetailStyles = {
  container: ViewStyle;
  appBar: ViewStyle;
  backButton: ViewStyle;
  backButtonText: TextStyle;
  headerAction: ViewStyle;
  title: TextStyle;
  label: TextStyle;
  memo: TextStyle;
  field: TextStyle;
  countdown: TextStyle;
  image: ImageStyle;
  modalOverlay: ViewStyle;
  actionSheetContainer: ViewStyle;
  actionSheetItem: ViewStyle;
  actionSheetIcon: TextStyle;
  actionSheetText: TextStyle;
  actionSheetDestructiveText: TextStyle;
  actionSheetSeparator: ViewStyle;
};

export const createTaskDetailStyles = (
  isDark: boolean,
  subColor: string,
  fsKey: FontSizeKey,
) =>
  StyleSheet.create<TaskDetailStyles>({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    appBar: {
      height: 56,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    backButtonText: {
      color: subColor,
      fontSize: fontSizes[fsKey] + 2,
      marginLeft: 2,
    },
    headerAction: {
      padding: 8,
    },
    title: {
      fontSize: fontSizes[fsKey] + 8,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'left',
      color: isDark ? '#fff' : '#000',
    },
    label: {
      fontSize: fontSizes[fsKey],
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 4,
      color: subColor,
    },
    memo: {
      fontSize: fontSizes[fsKey] + 4,
      color: isDark ? '#ccc' : '#333',
    },
    field: {
      fontSize: fontSizes[fsKey],
      color: isDark ? '#ccc' : '#333',
    },
    countdown: {
      fontSize: fontSizes[fsKey] + 2,
      fontWeight: '600',
      marginTop: 4,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-end',
    },
    actionSheetContainer: {
      backgroundColor: isDark ? '#1E1E1E' : '#F8F8F8',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: 'hidden',
      paddingBottom: initialWindowMetrics?.insets.bottom ?? 20,
    },
    actionSheetItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
    },
    actionSheetIcon: {
      color: subColor,
    },
    actionSheetText: {
      fontSize: fontSizes[fsKey] + 2,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    actionSheetDestructiveText: {
      fontSize: fontSizes[fsKey] + 2,
      color: '#FF3B30',
    },
    actionSheetSeparator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? '#3A3A3C' : '#C6C6C8',
    },
  });