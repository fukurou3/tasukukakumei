// app/(tabs)/_layout.tsx

import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SelectionProvider, useSelection } from '../../features/tasks/context';
import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext } from '@/context/FontSizeContext';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';

const TAB_HEIGHT = 56;

function InnerTabs() {
  const insets = useSafeAreaInsets();
  const { isSelecting } = useSelection();
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);

  const fontSizeMap: Record<string, number> = {
    small: 10,
    medium: 12,
    large: 14,
  };

  const inactiveColor = isDark ? '#CCCCCC' : '#000000';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Tabs
          screenOptions={({ route }) => {
            return {
              headerShown: false,
              tabBarStyle: {
                height: isSelecting
                  ? 0
                  : TAB_HEIGHT + (insets.bottom > 0 ? insets.bottom : 0),
                paddingBottom: isSelecting ? 0 : insets.bottom,                
                paddingTop: isSelecting ? 0 : 0,
                backgroundColor: isDark ? '#121212' : '#f2f2f2',
                borderTopWidth: 1,
                borderColor: isDark ? '#555' : '#CCC',
                overflow: 'hidden',
                width: '100%',
              },
              tabBarLabelPosition: 'below-icon',
              tabBarIcon: ({ focused }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
                if (route.name === 'calendar/index') {
                  iconName = 'calendar-outline';
                } else if (route.name === 'tasks/index') {
                  iconName = 'list-outline';
                } else if (route.name === 'growth/index') {
                  iconName = 'leaf-outline';
                } else if (route.name === 'settings/index') {
                  iconName = 'settings-outline';
                }
                return (
                  <Ionicons
                    name={iconName}
                    size={26}
                    color={focused ? subColor : inactiveColor}
                  />
                );
              },
              tabBarLabel: ({ focused }) => {
                let label = '';
                if (route.name === 'calendar/index') {
                  label = 'カレンダー';
                } else if (route.name === 'tasks/index') {
                  label = 'タスク一覧';
                } else if (route.name === 'growth/index') {
                  label = '成長';
                } else if (route.name === 'settings/index') {
                  label = '設定';
                }
                return (
                  <Text
                    style={{
                      fontSize: fontSizeMap[fontSizeKey] ?? 12,
                      color: focused ? subColor : inactiveColor,
                      textAlign: 'center',
                      marginTop: 2,
                    }}
                  >
                    {label}
                  </Text>
                );
              },
            };
          }}
        >
          {/* ✅ 表示するメインタブ */}
          <Tabs.Screen name="calendar/index" />
          <Tabs.Screen name="tasks/index" />
          <Tabs.Screen name="growth/index" />
          <Tabs.Screen name="settings/index" />

          {/* ✅ 非表示にしたいルートたち */}
          {[
            'settings/repeating-tasks',
            'settings/language',
            'add/index',
            'add_edit/index',
            'add_edit/edit-draft',
            'task-detail/[id]',
            'drafts',
            'explore',
            'index',
          ].map((name) => (
            <Tabs.Screen key={name} name={name} options={{ href: null }} />
          ))}
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  return (
    <SelectionProvider>
      <InnerTabs />
    </SelectionProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    width: '100%',
  },
});