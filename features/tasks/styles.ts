// app/features/tasks/styles.ts
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import type { FontSizeKey } from '@/context/FontSizeContext';

export type TaskScreenStyles = {
 taskItemContainer: ViewStyle;
 taskItem: ViewStyle;
 checkboxContainer: ViewStyle;
 taskCenter: ViewStyle;
 taskTitle: TextStyle;
 taskMemo: TextStyle;
 taskTime: TextStyle;
 noDeadlineText: TextStyle;
 taskDeadlineDisplayTextBase: TextStyle;
 selectionIconContainer: ViewStyle;

 container: ViewStyle;
 appBar: ViewStyle;
 title: TextStyle;
 topRow: ViewStyle;
 segmentedControlContainer: ViewStyle;
 segmentedControlButton: ViewStyle;
 segmentedControlButtonSelected: ViewStyle;
 segmentedControlButtonText: TextStyle;
 segmentedControlButtonTextSelectedLight: TextStyle;
 segmentedControlButtonTextSelectedDark: TextStyle;
 sortButton: ViewStyle;
 sortLabel: TextStyle;

 loader: ViewStyle;
 fab: ViewStyle;
 selectionBar: ViewStyle;
 selectionActionContainer: ViewStyle;
 selectionActionText: TextStyle;

 modalBlur: ViewStyle;
 modalContainer: ViewStyle;
 modalContent: ViewStyle;
 modalOption: TextStyle;
 modalTitle: TextStyle;

 folderContainer: ViewStyle;
 folderHeader: ViewStyle;
 folderName: TextStyle;
 emptyContainer: ViewStyle;
 emptyText: TextStyle;
 reorderButton: ViewStyle;
 folderHeaderSelected: ViewStyle;
 folderIconStyle: ViewStyle;
 folderTaskItemContainer: ViewStyle;
 folderTabsContainer: ViewStyle;
 folderTabButton: ViewStyle;
 folderTabSelected: ViewStyle;
 folderTabText: TextStyle;
 folderTabSelectedText: TextStyle;
};

export const createStyles = (isDark: boolean, subColor: string, fontSizeKey: FontSizeKey): TaskScreenStyles => {
 const baseFontSize = appFontSizes["normal"];
 const dynamicSubColor = subColor || (isDark ? '#4875B7' : '#2F5A8F');

 const BORDER_RADIUS_SM = 8;
 const BORDER_RADIUS_MD = 12;
 const BORDER_RADIUS_LG = 16;

 const shadowStyle = {
    shadowColor: isDark ? '#000' : '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.1,
    shadowRadius: 3.84,
    elevation: 3,
 };

 const cardBackground = isDark ? '#1f1f21' : '#FFFFFF';
 const secondaryTextDark = '#AEAEB2';
 const secondaryTextLight = '#6D6D72';

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
    title: {
        fontSize: baseFontSize + 3,
        fontWeight: '600',
        color: isDark ? '#FFFFFF' : '#000000',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: isDark ? '#000000' : '#f2f2f4',
    },
    segmentedControlContainer: {
        flexDirection: 'row',
        backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA', // ピル型長方形の背景色 (グレー系)
        borderRadius: BORDER_RADIUS_MD,
        padding: 2, // 内側のボタンに少しスペースを与える
        flex: 1, // topRow内でスペースを占めるように
        marginRight: 8, // ソートボタンとの間隔
    },
    segmentedControlButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS_SM, // 選択中の背景に合わせる
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentedControlButtonSelected: {
        backgroundColor: isDark ? dynamicSubColor : '#FFFFFF', // ダークモード時はサブカラー、ライトモード時は白
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentedControlButtonText: {
        fontSize: baseFontSize - 0.5,
        fontWeight: '500',
        color: isDark ? '#A0A0A0' : '#545454', // 未選択時の文字色
    },
    segmentedControlButtonTextSelectedLight: {
        color: dynamicSubColor, // ライトモード選択中の文字色 (サブカラー)
        fontWeight: '600',
    },
    segmentedControlButtonTextSelectedDark: {
        color: '#FFFFFF', // ダークモード選択中の文字色 (白)
        fontWeight: '600',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: BORDER_RADIUS_SM,
    },
    sortLabel: {
        fontSize: baseFontSize - 1,
        color: dynamicSubColor,
        marginRight: 6,
        fontWeight: '500',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    selectionBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDark ? '#1E1E1E' : '#F8F8F8',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: isDark ? '#3A3A3C' : '#C6C6C8',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        height: 60,
    },
    selectionActionContainer: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    selectionActionText: {
        fontSize: baseFontSize - 2.5,
        color: dynamicSubColor,
        marginTop: 2,
        fontWeight: '500',
    },
    modalBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        padding: 20,
    },
    modalContent: {
        backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
        borderRadius: BORDER_RADIUS_LG,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        alignItems: 'stretch',
        ...shadowStyle,
        elevation: 10,
    },
    modalTitle: {
        fontSize: baseFontSize + 2,
        fontWeight: '600',
        color: isDark ? '#FFF' : '#000',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        fontSize: baseFontSize + 1,
        paddingVertical: 14,
        textAlign: 'center',
        color: isDark ? '#E0E0E0' : '#222222',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 30,
    },
    emptyText: {
        fontSize: baseFontSize,
        color: isDark ? secondaryTextDark : secondaryTextLight,
        textAlign: 'center',
        lineHeight: baseFontSize * 1.5,
    },
    taskItemContainer: {
        backgroundColor: cardBackground,
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 2,
        borderRadius: BORDER_RADIUS_MD,
        paddingHorizontal: 16,
        paddingVertical: 10,
        ...shadowStyle,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxContainer: {
        paddingRight: 14,
        paddingLeft: 2,
        paddingVertical: 8,
    },
    taskCenter: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 10,
    },
    taskTitle: {
        fontSize: baseFontSize + 0.5,
        color: isDark ? '#FFFFFF' : '#111111',
        fontWeight: '500',
    },
    taskMemo: {
        fontSize: baseFontSize - 1.5,
        color: isDark ? secondaryTextDark : secondaryTextLight,
        marginTop: 3,
        lineHeight: baseFontSize * 1.2,
    },
    taskTime: {
        fontSize: baseFontSize - 1,
    },
    taskDeadlineDisplayTextBase: {
        fontSize: baseFontSize - 2,
        fontWeight: '600',
    },
    noDeadlineText: {
        fontStyle: 'normal',
        fontWeight: '500',
        color: isDark ? '#999999' : '#777777',
    },
    selectionIconContainer: {
        marginLeft: 'auto',
        paddingLeft: 12,
    },
    folderContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: cardBackground,
        borderRadius: BORDER_RADIUS_LG,
        overflow: 'hidden',
        ...shadowStyle,
        elevation: 4,
    },
    folderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? '#1f1f21' : '#FFFFFF',
    },
    folderHeaderSelected: {
        backgroundColor: isDark ? dynamicSubColor + '50' : dynamicSubColor + '25',
    },
    folderName: {
        fontSize: baseFontSize + 1,
        fontWeight: '600',
        color: isDark ? '#FFFFFF' : '#000000',
        flex: 1,
    },
    folderIconStyle: {
        marginRight: 10,
        marginLeft: 4,
    },
    reorderButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    folderTaskItemContainer: {
        backgroundColor: cardBackground,
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: isDark ? '#404040' : '#E8E8E8',
        paddingLeft: 20,
    },
    folderTabsContainer: {
        flexDirection: 'row',
        backgroundColor: isDark ? '#000000' : '#f2f2f4', // AppBar と同じ背景色に変更
        paddingHorizontal: 12, // 左右に少しパディング
        paddingTop: 8,
        paddingBottom: 0, // 下線を見せるため
        borderBottomWidth: StyleSheet.hairlineWidth, // 一応コンテナ全体の区切り線
        borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6',
    },
    folderTabButton: {
        paddingHorizontal: 12, // タブ間のスペースを少し調整
        paddingVertical: 10, // タップ領域
        marginRight: 8, // タブ間のマージン
        borderBottomWidth: 2, // 下線の太さ
        borderBottomColor: 'transparent', // 通常は透明
    },
    folderTabSelected: {
        borderBottomColor: dynamicSubColor, // 選択時にサブカラーのライン
    },
    folderTabText: {
        fontSize: baseFontSize,
        fontWeight: '500',
        color: isDark ? '#A0A0A0' : '#545454', // 未選択時の文字色
    },
    folderTabSelectedText: {
        color: isDark ? '#FFFFFF' : '#000000', // 選択時の文字色
        fontWeight: '600', // 文字を濃く
    },
 });
};