// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   LayoutChangeEvent,
//   ScrollView,
//   Platform, // Platform を追加
// } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming, // タップ時のアニメーションに使用
//   interpolate,
//   Extrapolate,
//   interpolateColor,
// } from 'react-native-reanimated';
// import PagerView, { PagerViewOnPageScrollEventData, PagerViewOnPageSelectedEventData } from 'react-native-pager-view'; // PagerView をインポート

// const SCREEN_WIDTH = Dimensions.get('window').width;
// const ACCENT_LINE_HEIGHT = 3;
// const TAB_MARGIN_RIGHT = 8;
// const FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL = 12;

// // 1. ダミーデータ (前回と同じ)
// const DUMMY_FOLDERS = [
//   { id: 'all', name: 'すべて' },
//   { id: 'folderA', name: 'フォルダA' },
//   { id: 'folderB', name: 'フォルダB' },
//   { id: 'folderC', name: 'フォルダC' },
//   { id: 'folderD', name: 'フォルダD' }, // テスト用に少し増やす
//   { id: 'folderE', name: 'フォルダE' },
// ];

// const DUMMY_TASKS = [
//   { id: '1', title: '買い物に行く (A)', folderId: 'folderA' },
//   { id: '2', title: 'React Nativeの勉強 (A)', folderId: 'folderA' },
//   { id: '3', title: '部屋の掃除 (B)', folderId: 'folderB' },
//   { id: '4', title: 'メール返信 (C)', folderId: 'folderC' },
//   { id: '5', title: '散歩する (B)', folderId: 'folderB' },
//   { id: '6', title: '新しいレシピ試す (A)', folderId: 'folderA' },
//   { id: '7', title: '読書 (D)', folderId: 'folderD' },
//   { id: '8', title: '運動 (E)', folderId: 'folderE' },
// ];

// // -----------------------------------------------------------------------------
// // AnimatedTabItem (前回とほぼ同じ、アニメーションの入力値を調整)
// // -----------------------------------------------------------------------------
// interface AnimatedTabItemProps {
//   label: string;
//   index: number;
//   onPress: (index: number) => void;
//   onTabLayout: (index: number, event: LayoutChangeEvent) => void;
//   pageScrollPosition: Animated.SharedValue<number>; // PagerView の position
//   pageScrollOffset: Animated.SharedValue<number>; // PagerView の offset
//   selectedColor: string;
//   unselectedColor: string;
// }

// const AnimatedTabItem: React.FC<AnimatedTabItemProps> = React.memo(
//   ({
//     label,
//     index,
//     onPress,
//     onTabLayout,
//     pageScrollPosition,
//     pageScrollOffset,
//     selectedColor,
//     unselectedColor,
//   }) => {
//     const handlePress = () => {
//       onPress(index);
//     };

//     const animatedTextStyle = useAnimatedStyle(() => {
//       // スワイプ中の絶対的な位置を計算 (例: 0.0 -> 0.5 -> 1.0 -> 1.5 ...)
//       const absolutePosition = pageScrollPosition.value + pageScrollOffset.value;

//       const progress = interpolate(
//         absolutePosition,
//         [index - 1, index, index + 1], // 対象タブとその両隣のインデックス
//         [0, 1, 0], // 非選択(0) -> 選択(1) -> 非選択(0)
//         Extrapolate.CLAMP
//       );

//       const color = interpolateColor(
//         progress,
//         [0, 1],
//         [unselectedColor, selectedColor]
//       );
      
//       const fontWeight = progress > 0.5 ? '600' : '500';

//       return {
//         color: color as string,
//         fontWeight: fontWeight as '500' | '600',
//       };
//     });

//     return (
//       <TouchableOpacity
//         style={styles.folderTabButton}
//         onPress={handlePress}
//         onLayout={(event) => onTabLayout(index, event)}
//         activeOpacity={0.7}
//       >
//         <Animated.Text style={[styles.folderTabText, animatedTextStyle]}>
//           {label}
//         </Animated.Text>
//       </TouchableOpacity>
//     );
//   }
// );

// // -----------------------------------------------------------------------------
// // SimplifiedFolderTabsBar (PagerViewと連携するように調整)
// // -----------------------------------------------------------------------------
// interface SimplifiedFolderTabsBarProps {
//   tabs: { id: string; name: string }[];
//   onTabPress: (index: number) => void; // タップ時に PagerView を操作
//   tabLayouts: Record<number, { x: number; width: number }>;
//   setTabLayouts: React.Dispatch<React.SetStateAction<Record<number, { x: number; width: number }>>>;
//   pageScrollPosition: Animated.SharedValue<number>; // PagerView の state を直接使用
//   pageScrollOffset: Animated.SharedValue<number>; // PagerView の state を直接使用
//   currentPageForScroll: number; // タブスクロール位置調整用
//   accentColor: string;
//   selectedTextColor: string;
//   unselectedTextColor: string;
// }

// const SimplifiedFolderTabsBar: React.FC<SimplifiedFolderTabsBarProps> = ({
//   tabs,
//   onTabPress,
//   tabLayouts,
//   setTabLayouts,
//   pageScrollPosition,
//   pageScrollOffset,
//   currentPageForScroll,
//   accentColor,
//   selectedTextColor,
//   unselectedTextColor,
// }) => {
//   const scrollViewRef = useRef<ScrollView>(null);

//   const handleTabLayout = useCallback((index: number, event: LayoutChangeEvent) => {
//     const { x, width } = event.nativeEvent.layout;
//     setTabLayouts(prev => ({ ...prev, [index]: { x, width } }));
//   }, [setTabLayouts]);
  
//   useEffect(() => {
//     const currentLayout = tabLayouts[currentPageForScroll];
//     if (currentLayout && scrollViewRef.current) {
//       const tabCenter = currentLayout.x + currentLayout.width / 2;
//       const screenCenter = SCREEN_WIDTH / 2;
//       let scrollToX = tabCenter - screenCenter;
      
//       let totalWidthOfAllTabs = 0;
//       tabs.forEach((_, i) => {
//         totalWidthOfAllTabs += (tabLayouts[i]?.width || 0) + TAB_MARGIN_RIGHT;
//       });
//       totalWidthOfAllTabs -= TAB_MARGIN_RIGHT; 
//       totalWidthOfAllTabs += FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL * 2;

//       const maxScrollX = Math.max(0, totalWidthOfAllTabs - SCREEN_WIDTH);
//       scrollToX = Math.max(0, Math.min(scrollToX, maxScrollX));

//       scrollViewRef.current.scrollTo({ x: scrollToX, animated: true });
//     }
//   }, [currentPageForScroll, tabLayouts, tabs]);


//   const animatedAccentLineStyle = useAnimatedStyle(() => {
//     if (Object.keys(tabLayouts).length < tabs.length || tabs.length === 0) {
//       const firstTabLayout = tabLayouts[0];
//       return { // 初期状態、またはタブがない場合
//         width: firstTabLayout?.width ?? 0,
//         transform: [{ translateX: firstTabLayout?.x ?? FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL }],
//       };
//     }

//     // スワイプ中の絶対的な位置
//     const absolutePosition = pageScrollPosition.value + pageScrollOffset.value;

//     const inputRange = tabs.map((_, i) => i); // [0, 1, 2, ...]
//     const outputX = tabs.map((_, i) => tabLayouts[i]?.x ?? 0);
//     const outputWidth = tabs.map((_, i) => tabLayouts[i]?.width ?? 0);
    
//     // inputRangeに値がない (outputXやoutputWidthも空) のを避ける
//     if (inputRange.length === 0 || outputX.length === 0 || outputWidth.length === 0) {
//         return { width: 0, transform: [{ translateX: 0 }] };
//     }
//     // タブが1つの場合
//     if (inputRange.length === 1) {
//         return {
//             width: outputWidth[0],
//             transform: [{ translateX: outputX[0] }],
//         };
//     }

//     const width = interpolate(
//       absolutePosition,
//       inputRange,
//       outputWidth,
//       Extrapolate.CLAMP
//     );
//     const translateX = interpolate(
//       absolutePosition,
//       inputRange,
//       outputX,
//       Extrapolate.CLAMP
//     );

//     return {
//       width: width,
//       transform: [{ translateX: translateX }],
//     };
//   });

//   return (
//     <View style={styles.folderTabsContainer}>
//       <ScrollView
//         ref={scrollViewRef}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.tabsScrollContentContainer}
//       >
//         <View style={styles.tabsInnerContainer}>
//           {tabs.map((tab, index) => (
//             <AnimatedTabItem
//               key={tab.id}
//               label={tab.name}
//               index={index}
//               onPress={onTabPress} // PagerView のページを直接変更する
//               onTabLayout={handleTabLayout}
//               pageScrollPosition={pageScrollPosition}
//               pageScrollOffset={pageScrollOffset}
//               selectedColor={selectedTextColor}
//               unselectedColor={unselectedTextColor}
//             />
//           ))}
//           {tabs.length > 0 && ( // タブがある場合のみアクセントラインを表示
//             <Animated.View
//               style={[
//                 styles.accentLine,
//                 { backgroundColor: accentColor },
//                 animatedAccentLineStyle,
//               ]}
//             />
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// // -----------------------------------------------------------------------------
// // SwipeableLowLoadTestScreen: メインのテスト画面コンポーネント
// // -----------------------------------------------------------------------------
// export default function SwipeableLowLoadTestScreen() {
//   const [currentPage, setCurrentPage] = useState(0);
//   const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});
//   const pagerRef = useRef<PagerView>(null);

//   // PagerView のスクロール状態を保持する SharedValue
//   const pageScrollPosition = useSharedValue(0);
//   const pageScrollOffset = useSharedValue(0);

//   const handleTabPress = useCallback((index: number) => {
//     pagerRef.current?.setPage(index); // PagerView のページを切り替え
//   }, []);

//   const onPageScroll = useCallback((event: PagerViewOnPageScrollEventData) => {
//     // PagerView から position と offset を取得して SharedValue を更新
//     pageScrollPosition.value = event.nativeEvent.position;
//     pageScrollOffset.value = event.nativeEvent.offset;
//   }, [pageScrollPosition, pageScrollOffset]);

//   const onPageSelected = useCallback((event: PagerViewOnPageSelectedEventData) => {
//     const newPage = event.nativeEvent.position;
//     setCurrentPage(newPage); 
//     // PagerView がページ選択を完了した時点で、スクロールオフセットは0になるはず
//     // pageScrollPosition.value = newPage; // onPageScrollで更新されるので不要な場合もある
//     // pageScrollOffset.value = 0; // onPageScrollで更新される
//   }, []);


//   // テーマカラー (仮)
//   const isDark = false; // ライトモード固定
//   const accentColor = isDark ? '#4875B7' : '#2F5A8F';
//   const selectedTextColor = isDark ? '#FFFFFF' : '#000000';
//   const unselectedTextColor = isDark ? '#A0A0A0' : '#545454';
//   const backgroundColor = isDark ? '#000000' : '#F2F2F4';
//   const taskItemBackgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';
//   const taskItemTextColor = isDark ? '#FFFFFF' : '#000000';

//   return (
//     <View style={[styles.fullScreenContainer, { backgroundColor }]}>
//       <SimplifiedFolderTabsBar
//         tabs={DUMMY_FOLDERS}
//         onTabPress={handleTabPress}
//         tabLayouts={tabLayouts}
//         setTabLayouts={setTabLayouts}
//         pageScrollPosition={pageScrollPosition} // PagerView の状態を渡す
//         pageScrollOffset={pageScrollOffset}     // PagerView の状態を渡す
//         currentPageForScroll={currentPage}      // タブスクロール位置調整用
//         accentColor={accentColor}
//         selectedTextColor={selectedTextColor}
//         unselectedTextColor={unselectedTextColor}
//       />

//       <PagerView
//         ref={pagerRef}
//         style={styles.pagerView}
//         initialPage={0}
//         onPageScroll={onPageScroll} // スクロールイベントを処理
//         onPageSelected={onPageSelected} // ページ選択完了イベントを処理
//         // scrollEnabled={true} // デフォルトでtrue
//       >
//         {DUMMY_FOLDERS.map((folder, index) => {
//           const tasksForThisFolder = DUMMY_TASKS.filter(task => {
//             if (folder.id === 'all') return true;
//             return task.folderId === folder.id;
//           });
//           return (
//             <View key={folder.id} style={styles.page}>
//               <ScrollView contentContainerStyle={styles.taskListContainer}>
//                 {tasksForThisFolder.length > 0 ? (
//                   tasksForThisFolder.map(task => (
//                     <View key={task.id} style={[styles.taskItem, { backgroundColor: taskItemBackgroundColor }]}>
//                       <Text style={[styles.taskText, { color: taskItemTextColor }]}>{task.title}</Text>
//                     </View>
//                   ))
//                 ) : (
//                   <Text style={[styles.emptyTasksText, { color: unselectedTextColor }]}>
//                     このフォルダにはタスクがありません
//                   </Text>
//                 )}
//               </ScrollView>
//             </View>
//           );
//         })}
//       </PagerView>
//     </View>
//   );
// }

// // 2. スタイル (前回とほぼ同じ + PagerView用スタイル)
// const styles = StyleSheet.create({
//   fullScreenContainer: {
//     flex: 1,
//     paddingTop: Platform.OS === 'android' ? 25 : 50, // ステータスバーを考慮 (簡易的)
//   },
//   folderTabsContainer: {
//     backgroundColor: 'transparent', // 背景色は fullScreenContainer で設定
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#D1D1D6', // ライトモードの区切り線
//   },
//   tabsScrollContentContainer: {
//     paddingHorizontal: FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL,
//   },
//   tabsInnerContainer: {
//     flexDirection: 'row',
//     position: 'relative', // アクセントラインの基準
//   },
//   folderTabButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginRight: TAB_MARGIN_RIGHT,
//     borderBottomWidth: ACCENT_LINE_HEIGHT, // 下線の太さ分を確保 (実際の色はアクセントラインで)
//     borderBottomColor: 'transparent',
//   },
//   folderTabText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   accentLine: {
//     height: ACCENT_LINE_HEIGHT,
//     position: 'absolute',
//     bottom: 0,
//     borderRadius: ACCENT_LINE_HEIGHT / 2, // 少し丸みをつける
//   },
//   pagerView: {
//     flex: 1,
//   },
//   page: {
//     flex: 1,
//     // justifyContent: 'center', // タスクリストが上から表示されるように削除
//     // alignItems: 'center',
//   },
//   taskListContainer: {
//     padding: 16,
//   },
//   taskItem: {
//     padding: 16,
//     marginVertical: 8,
//     borderRadius: 8,
//     shadowColor: '#000', // ライトモードでの影
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   taskText: {
//     fontSize: 16,
//   },
//   emptyTasksText: {
//       textAlign: 'center',
//       marginTop: 20,
//       fontSize: 16,
//   }
// });