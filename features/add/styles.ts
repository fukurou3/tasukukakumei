// app/features/add/styles.ts
import { StyleSheet } from 'react-native';
import type { AddTaskStyles } from './types';
import { fontSizes } from '@/constants/fontSizes';
import type { FontSizeKey } from '@/context/FontSizeContext';
import {
  LIGHT_INPUT_BG,
  DARK_INPUT_BG,
  LIGHT_GUIDE_TEXT,
  DARK_GUIDE_TEXT,
  LIGHT_PLACEHOLDER,
  DARK_PLACEHOLDER,
  LIGHT_REMOVE_BG,
  DARK_REMOVE_BG,
  LIGHT_DRAFTS_BG,
  DARK_DRAFTS_BG,
} from './constants';

export function createStyles(
  isDark: boolean,
  subColor: string,
  fsKey: FontSizeKey
): AddTaskStyles {
  return StyleSheet.create<AddTaskStyles>({
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
    appBarTitle: {
      fontSize: fontSizes[fsKey] + 6,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    draftsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: subColor,
      backgroundColor: isDark ? DARK_DRAFTS_BG : LIGHT_DRAFTS_BG,
    },
    draftsButtonText: {
      fontSize: fontSizes[fsKey],
      marginLeft: 6,
      fontWeight: 'bold',
      color: subColor,
    },
    label: {
      fontSize: fontSizes[fsKey],
      marginBottom: 3,
      fontWeight: '600',
      color: subColor,
    },
    input: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      color: isDark ? '#fff' : '#000',
      padding: 13,
      borderRadius: 8,
      marginBottom: 16,
      fontSize: fontSizes[fsKey],
    },
    folderInput: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      borderRadius: 8,
      paddingVertical: 13,
      paddingHorizontal: 12,
      marginBottom: 16,
      minHeight: 40,

    },
    pickerButton: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      borderRadius: 8,
      padding: 12,
      marginBottom: 22,
      alignItems: 'center',
    },
    pickerButtonWithPreview: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      borderRadius: 10,
      padding: 8,
      marginBottom: 10,
    },
    addMoreButton: {
      alignSelf: 'flex-end',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: subColor,
      marginBottom: 8,
    },
    addMoreButtonText: {
      color: '#fff',
      fontSize: fontSizes[fsKey] - 2,
      fontWeight: '600',
    },
    fieldWrapper: {
      backgroundColor: isDark ? DARK_INPUT_BG : LIGHT_INPUT_BG,
      borderRadius: 10,
      paddingHorizontal: 15,
      justifyContent: 'center',
      height: 50,
      marginBottom: 10,
    },
    dateWrapper: {
      flex: 1,
      marginRight: 8,
    },
    timeWrapper: {
      flex: 1,
    },
    datetimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    datetimeText: {
      color: isDark ? '#fff' : '#000',
      fontSize: fontSizes[fsKey],
    },
    notifyContainer: {
      backgroundColor: isDark ? '#1e1e1e' : '#f4f4f4',
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    notifyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    notifyLabel: {
      fontSize: fontSizes[fsKey],
      fontWeight: '600',
    },
    toggleContainer: {
      width: 50,
      height: 28,
      borderRadius: 14,
      padding: 2,
      justifyContent: 'center',
    },
    toggleCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#fff',
    },
    guideText: {
      fontSize: fontSizes[fsKey],
      color: isDark ? DARK_GUIDE_TEXT : LIGHT_GUIDE_TEXT,
      marginBottom: 6,
    },
    slotPickerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 0,
    },
    slotPickerWrapper: {
      flex: 1,
      marginRight: 8,
      justifyContent: 'center',
    },
    slotPicker: {
      width: '100%',
      color: isDark ? '#fff' : '#000',
      fontSize: fontSizes[fsKey],
    },
    photoPreviewContainer: {
      paddingTop: 8,
      paddingBottom: 0, // 下マージンは各アイテムのmarginBottomで制御
      // paddingHorizontal はFlatListのstyleで設定
    },
    photoPreviewItem: {
      position: 'relative',
      borderRadius: 8,
      // overflow: 'hidden', // 画像の角丸を適用するため
      // width, height, marginRight, marginBottom はindex.tsxで動的に設定
    },
    photoPreviewImage: {
      width: '100%',
      height: '100%',
      borderRadius: 8, // photoPreviewItemと合わせる
    },
    removeIcon: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: isDark ? DARK_REMOVE_BG : LIGHT_REMOVE_BG,
      borderRadius: 12,
      padding: 2,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    saveButton: {
      flex: 1,
      backgroundColor: subColor,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginLeft: 10,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: fontSizes[fsKey],
      fontWeight: 'bold',
    },
    draftButton: {
      flex: 1,
      backgroundColor: '#888',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
  });
}