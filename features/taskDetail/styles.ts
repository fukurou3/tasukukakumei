import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { fontSizes } from '@/constants/fontSizes';
import type { FontSizeKey } from '@/context/FontSizeContext';

export type TaskDetailStyles = {
  container: ViewStyle;
  appBar: ViewStyle;
  appBarTitle: TextStyle;
  backButton: ViewStyle;
  appBarActionPlaceholder: ViewStyle;
  contentContainer: ViewStyle;
  title: TextStyle;
  label: TextStyle;
  memo: TextStyle;
  field: TextStyle;
  image: ImageStyle;
  actionRow: ViewStyle;
  editButton: ViewStyle;
  deleteButton: ViewStyle;
  buttonText: TextStyle;
};

export const createStyles = (
  isDark: boolean,
  subColor: string,
  fsKey: FontSizeKey
): TaskDetailStyles =>
  StyleSheet.create<TaskDetailStyles>({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    appBar: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6',
    },
    backButton: {
      padding: 8,
    },
    appBarTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: fontSizes[fsKey] + 4,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    appBarActionPlaceholder: {
      width: 32,
    },
    contentContainer: {
      padding: 20,
    },
    title: {
      fontSize: fontSizes[fsKey] + 4,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 12,
    },
    label: {
      fontSize: fontSizes[fsKey],
      fontWeight: '600',
      color: subColor,
      marginBottom: 4,
      marginTop: 16,
    },
    memo: {
      fontSize: fontSizes[fsKey],
      color: isDark ? '#E0E0E0' : '#333333',
    },
    field: {
      fontSize: fontSizes[fsKey],
      color: isDark ? '#E0E0E0' : '#333333',
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginTop: 10,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 24,
      marginBottom: 20,
    },
    editButton: {
      flex: 1,
      backgroundColor: subColor,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginRight: 8,
    },
    deleteButton: {
      flex: 1,
      backgroundColor: '#FF3B30',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginLeft: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: fontSizes[fsKey],
      fontWeight: '600',
    },
  });

