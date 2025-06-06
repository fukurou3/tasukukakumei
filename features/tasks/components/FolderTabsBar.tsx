// app/features/tasks/components/FolderTabsBar.tsx
import React, { useCallback, useEffect } from 'react';
import { ScrollView, View, type LayoutChangeEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useSharedValue, useDerivedValue, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
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
  pageScrollPosition: SharedValue<number>;
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

  const indicatorX = useDerivedValue(() => {
    'worklet';
    if (outputX.value.length === 0 || outputWidth.value.length === 0) return 0;

    const position = pageScrollPosition.value;
    const index = Math.floor(position);
    const progress = position - index;
    const nextIndex = Math.min(outputX.value.length - 1, index + 1);

    const startX = outputX.value[index] ?? 0;
    const endX = outputX.value[nextIndex] ?? startX;

    return startX + (endX - startX) * progress;
  });

  const indicatorWidth = useDerivedValue(() => {
    'worklet';
    if (outputX.value.length === 0 || outputWidth.value.length === 0) return 0;

    const position = pageScrollPosition.value;
    const index = Math.floor(position);
    const progress = position - index;
    const nextIndex = Math.min(outputWidth.value.length - 1, index + 1);

    const startW = outputWidth.value[index] ?? 0;
    const endW = outputWidth.value[nextIndex] ?? startW;

    return startW + (endW - startW) * progress;
  });

  const computePosition = (x: number) => {
    'worklet';
    const xs = outputX.value;
    const ws = outputWidth.value;
    if (xs.length === 0) return 0;

    const minX = xs[0];
    const lastX = xs[xs.length - 1] + ws[ws.length - 1];
    const clampedX = Math.max(minX, Math.min(x, lastX));

    for (let i = 0; i < xs.length - 1; i++) {
      const start = xs[i];
      const end = xs[i + 1];
      if (clampedX >= start && clampedX <= end) {
        const ratio = (clampedX - start) / (end - start);
        return i + ratio;
      }
    }
    return xs.length - 1;
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
    })
    .onUpdate((e) => {
      'worklet';
      const pos = computePosition(e.x - FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL);
      pageScrollPosition.value = pos;
    })
    .onEnd(() => {
      'worklet';
      const idx = Math.round(pageScrollPosition.value);
      runOnJS(memoizedOnItemPress)(idx, folderTabs[idx]?.label || '');
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
        <GestureDetector gesture={panGesture}>
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
            <Canvas style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: ACCENT_LINE_HEIGHT }}>
              <RoundedRect
                x={indicatorX}
                y={0}
                width={indicatorWidth}
                height={ACCENT_LINE_HEIGHT}
                r={ACCENT_LINE_HEIGHT / 2}
                color={subColor}
              />
            </Canvas>
          )}
          </View>
        </GestureDetector>
      </ScrollView>
    </View>
  );
});