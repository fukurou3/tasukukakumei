// app/features/tasks/components/AnimatedTabItem.tsx
import React from 'react';
import { TouchableOpacity, type LayoutChangeEvent } from 'react-native';
import Reanimated, { useAnimatedStyle, useDerivedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import { TAB_MARGIN_RIGHT } from '../constants';

type AnimatedTabItemProps = {
  label: string;
  index: number;
  onPress: (index: number, label: string) => void;
  onTabLayout: (index: number, event: LayoutChangeEvent) => void;
  pageScrollPosition: Reanimated.SharedValue<number>;
  selectedTextColor: string;
  unselectedTextColor: string;
  selectedFontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | undefined;
  unselectedFontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | undefined;
  baseTabTextStyle: any;
  baseTabButtonStyle: any;
};

export const AnimatedTabItem: React.FC<AnimatedTabItemProps> = React.memo(({
  label,
  index,
  onPress,
  onTabLayout,
  pageScrollPosition,
  selectedTextColor,
  unselectedTextColor,
  selectedFontWeight,
  unselectedFontWeight,
  baseTabTextStyle,
  baseTabButtonStyle,
}) => {

  const handlePress = () => {
    onPress(index, label);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    onTabLayout(index, event);
  };

  const activeIndex = useDerivedValue(() => {
    'worklet';
    const position = pageScrollPosition.value;
    const threshold = 0.01;
    const roundedPosition = Math.round(position);
    const diff = position - roundedPosition;

    if (diff > threshold) {
      return Math.ceil(position);
    } else if (diff < -threshold) {
      return Math.floor(position);
    }
    return roundedPosition;
  });

  const progress = useDerivedValue(() => {
    'worklet';
    return withTiming(activeIndex.value === index ? 1 : 0, { duration: 200 });
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    'worklet';
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [unselectedTextColor, selectedTextColor]
    );

    const fontWeight = activeIndex.value === index ? selectedFontWeight : unselectedFontWeight;

    return {
      color: color as string,
      fontWeight: fontWeight,
    };
  });

  return (
    <TouchableOpacity
      style={[baseTabButtonStyle, { borderBottomWidth: 0, marginRight: TAB_MARGIN_RIGHT }]}
      onPress={handlePress}
      onLayout={handleLayout}
      activeOpacity={0.7}
    >
      <Reanimated.Text style={[baseTabTextStyle, animatedTextStyle]}>
        {label}
      </Reanimated.Text>
    </TouchableOpacity>
  );
});