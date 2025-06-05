// app/features/tasks/components/FolderTabsBar.tsx
import React, { useCallback, useEffect } from 'react';
import { ScrollView, View, Platform, type LayoutChangeEvent } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { TaskScreenStyles } from '@/features/tasks/styles';
import type { FolderTab, FolderTabLayout } from '@/features/tasks/hooks/useTasksScreenLogic';
import { ACCENT_LINE_HEIGHT, FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL } from '@/features/tasks/constants';
import { AnimatedTabItem } from './AnimatedTabItem';

type FolderTabsBarProps = {
  styles: TaskScreenStyles;
  subColor: string;
  folderTabs: FolderTab[];
  folderTabLayouts: Record<number, FolderTabLayout>;
  setFolderTabLayouts: (updater: (prev: Record<number, FolderTabLayout>) => Record<number, FolderTabLayout>) => void;
  handleFolderTabPress: (folderName: string, index: number) => void;
  pageScrollPosition: Reanimated.SharedValue<number>;
  folderTabsScrollViewRef: React.RefObject<ScrollView>;
};

export const FolderTabsBar: React.FC<FolderTabsBarProps> = React.memo(({
  styles,
  subColor,
  folderTabs,
  folderTabLayouts,
  setFolderTabLayouts,
  handleFolderTabPress,
  pageScrollPosition,
  folderTabsScrollViewRef,
}) => {
  const selectedTextColor = styles.folderTabSelectedText.color as string;
  const unselectedTextColor = styles.folderTabText.color as string;
  const selectedFontWeight = styles.folderTabSelectedText.fontWeight;
  const unselectedFontWeight = styles.folderTabText.fontWeight;
  const baseTabTextStyle = styles.folderTabText;
  const baseTabButtonStyle = styles.folderTabButton;

  const outputX = useSharedValue<number[]>([]);
  const outputWidth = useSharedValue<number[]>([]);

  useEffect(() => {
    const layoutsReady = folderTabs.length > 0 && Object.keys(folderTabLayouts).length >= folderTabs.length;
    if (layoutsReady) {
      const sortedLayouts = folderTabs
        .map((_, i) => folderTabLayouts[i])
        .filter((l): l is FolderTabLayout => !!l)
        .sort((a, b) => a.index - b.index);

      if (sortedLayouts.length === folderTabs.length) {
        outputX.value = sortedLayouts.map(l => l.x);
        outputWidth.value = sortedLayouts.map(l => l.width);
      }
    } else if (folderTabs.length === 0) {
        outputX.value = [];
        outputWidth.value = [];
    }
  }, [folderTabs, folderTabLayouts, outputX, outputWidth]);

  const memoizedOnItemPress = useCallback((index: number, label: string) => {
    const folderName = folderTabs[index]?.name || label;
    handleFolderTabPress(folderName, index);
  }, [handleFolderTabPress, folderTabs]);

  const memoizedOnTabLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setFolderTabLayouts(prev => {
      if (prev[index]?.x === x && prev[index]?.width === width) {
        return prev;
      }
      return {
        ...prev,
        [index]: { x, width, index: index },
      };
    });
  }, [setFolderTabLayouts]);

  const animatedAccentLineStyle = useAnimatedStyle(() => {
    'worklet';
    if (outputX.value.length === 0 || outputWidth.value.length === 0) {
      return {
        width: 0,
        transform: [{ translateX: FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL }],
      };
    }

    const position = pageScrollPosition.value;
    const threshold = 0.01;
    const roundedPosition = Math.round(position);
    const diff = position - roundedPosition;

    let activeIndex;
    if (diff > threshold) {
      activeIndex = Math.ceil(position);
    } else if (diff < -threshold) {
      activeIndex = Math.floor(position);
    } else {
      activeIndex = roundedPosition;
    }

    const clampedIndex = Math.max(0, Math.min(activeIndex, outputX.value.length - 1));

    const newWidth = outputWidth.value[clampedIndex] ?? 0;
    const newTranslateX = outputX.value[clampedIndex] ?? 0;

    return {
      width: withTiming(newWidth, { duration: 250 }),
      transform: [{ translateX: withTiming(newTranslateX, { duration: 250 }) }],
    };
  });

  return (
    <View style={[styles.folderTabsContainer]}>
      <ScrollView
        ref={folderTabsScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL,
        }}
      >
        <View style={{ flexDirection: 'row', position: 'relative' }}>
          {folderTabs.map((folder, index) => (
            <AnimatedTabItem
              key={`${folder.name}-${index}`}
              label={folder.label}
              index={index}
              onPress={memoizedOnItemPress}
              onTabLayout={memoizedOnTabLayout}
              pageScrollPosition={pageScrollPosition}
              selectedTextColor={selectedTextColor}
              unselectedTextColor={unselectedTextColor}
              selectedFontWeight={selectedFontWeight}
              unselectedFontWeight={unselectedFontWeight}
              baseTabTextStyle={baseTabTextStyle}
              baseTabButtonStyle={baseTabButtonStyle}
            />

          ))}
          {folderTabs.length > 0 && (
            <Reanimated.View
              style={[
                {
                  height: ACCENT_LINE_HEIGHT,
                  backgroundColor: subColor,
                  position: 'absolute',
                  bottom: 0,
                  borderRadius: ACCENT_LINE_HEIGHT / 2,
                },
                animatedAccentLineStyle,
              ]}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
});