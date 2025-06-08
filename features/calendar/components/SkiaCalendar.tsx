// features/calendar/components/SkiaCalendar.tsx
import React, { useContext } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { Canvas, Path, Text, useFont, Image, useImage, Group, Rect, RoundedRect, Skia } from '@shopify/react-native-skia';
import { useTranslation } from 'react-i18next';
import { isHoliday } from '@holiday-jp/holiday_jp';
import dayjs from 'dayjs';
import type { SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { Task } from '@/features/tasks/types';
import type { EventLayout } from '../utils';
import { FontSizeContext, type FontSizeKey } from '@/context/FontSizeContext';

const FONT_PATH_MEDIUM = require('@/assets/fonts/NotoSansJP-Medium.ttf');
const FONT_PATH_REGULAR = require('@/assets/fonts/NotoSansJP-Regular.ttf');
// カレンダー表示用のパディング量（大表示時は0）
// パディングなしで全幅表示
const PADDING = 0;
// 曜日欄の高さをさらにコンパクトに
const HEADER_HEIGHT = 24;
const FULL_CELL_HEIGHT_FACTOR = 1.9;
const TASK_BAR_HEIGHT = 5;
const TASK_BAR_MARGIN = 3;
const EVENT_BAR_HEIGHT = 20;
const EVENT_BAR_Y_OFFSET = 24;
const TASK_TITLE_BOX_HEIGHT = 16;
const CALENDAR_FONT_SIZES: Record<FontSizeKey, number> = {
  small: 12,
  normal: 14,
  medium: 16,
  large: 18,
};

interface SkiaCalendarProps {
  date: dayjs.Dayjs;
  opacity: SharedValue<number>;
  backgroundImage?: number | null;
  selectedDate: string;
  onDayPress: (date: string) => void;
  groupedTasks: Record<string, Task[]>;
  eventLayout: EventLayout;
  showTaskTitles?: boolean;
  theme: {
    primary: string;
    weekday: string;
    day: string;
    saturday: string;
    sunday: string;
    line: string;
    background: string;
    eventText: string;
  }
}

export default function SkiaCalendar({
  date: targetDate,
  opacity,
  backgroundImage,
  selectedDate,
  onDayPress,
  groupedTasks,
  eventLayout,
  showTaskTitles = false,
  theme,
}: SkiaCalendarProps) {
  const { t, i18n } = useTranslation();
  const { fontSizeKey } = useContext(FontSizeContext);
  const { width } = useWindowDimensions();
  const calendarWidth = width - PADDING * 2;
  const cellWidth = calendarWidth / 7;
  const cellHeight = showTaskTitles ? cellWidth * FULL_CELL_HEIGHT_FACTOR : cellWidth; // 大表示時は縦長に

  const font = useFont(FONT_PATH_MEDIUM, CALENDAR_FONT_SIZES[fontSizeKey]);
  const eventFont = useFont(FONT_PATH_REGULAR, 10);
  const skiaImage = backgroundImage ? useImage(backgroundImage) : null;

  const year = targetDate.year();
  const month = targetDate.month();
  const firstDayOfMonth = targetDate.startOf('month');
  const daysInMonth = targetDate.daysInMonth();
  const startDayOfWeek = firstDayOfMonth.day();
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map(day => t(`calendar.weekdays.${day}`));
  const numRows = Math.ceil((startDayOfWeek + daysInMonth) / 7);
  const calendarHeight = HEADER_HEIGHT + cellHeight * numRows;

  let gridPath = '';
  for (let i = 0; i <= 7; i++) {
    const x = cellWidth * i;
    gridPath += `M ${x} 0 L ${x} ${calendarHeight} `;
  }
  for (let i = 0; i <= numRows; i++) {
    const y = HEADER_HEIGHT + cellHeight * i;
    gridPath += `M 0 ${y} L ${calendarWidth} ${y} `;
  }
  gridPath += `M 0 0 L ${calendarWidth} 0 `;
  
  const processTap = (tapX: number, tapY: number) => {
    const col = Math.floor(tapX / cellWidth);
    const row = Math.floor((tapY - HEADER_HEIGHT) / cellHeight);

    if (row < 0 || row >= numRows) return;

    const dayIndex = row * 7 + col - startDayOfWeek;
    const day = dayIndex + 1;

    if (day > 0 && day <= daysInMonth) {
      const dateStr = targetDate.date(day).format('YYYY-MM-DD');
      onDayPress(dateStr);
    }
  };

  const handleTap = Gesture.Tap().onEnd((e) => {
    'worklet';
    runOnJS(processTap)(e.x, e.y);
  });

  if (!font || !eventFont) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GestureDetector gesture={handleTap}>
        <Canvas style={{ width: calendarWidth, height: calendarHeight }}>
          <Group opacity={opacity}>
            {backgroundImage && skiaImage && (
              <Image
                image={skiaImage}
                fit="cover"
                x={0}
                y={0}
                width={calendarWidth}
                height={calendarHeight}
                opacity={0.3}
              />
            )}

            <Path path={gridPath} color={theme.line} style="stroke" strokeWidth={StyleSheet.hairlineWidth} />
            
            {weekdays.map((day, i) => {
              let weekdayColor = theme.weekday;
              if (i === 0) { // Sunday
                weekdayColor = theme.sunday;
              } else if (i === 6) { // Saturday
                weekdayColor = theme.saturday;
              }

              return (
                <Text
                  key={`weekday-${i}`}
                  x={cellWidth * i + (cellWidth - font.getTextWidth(day)) / 2}
                  y={HEADER_HEIGHT / 2 + font.getSize() / 2}
                  text={day}
                  font={font}
                  color={weekdayColor}
                />
              );
            })}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = targetDate.date(day);
              const dateStr = date.format('YYYY-MM-DD');
              const dayOfWeek = date.day();

              const x = (startDayOfWeek + i) % 7;
              const y = Math.floor((startDayOfWeek + i) / 7);
              const cellX = x * cellWidth;
              const cellY = HEADER_HEIGHT + y * cellHeight;

              let dayColor = theme.day;
              const isJpHoliday = i18n.language.startsWith('ja') && isHoliday(date.toDate());
              if (dayOfWeek === 0 || isJpHoliday) {
                dayColor = theme.sunday;
              } else if (dayOfWeek === 6) {
                dayColor = theme.saturday;
              }

              const eventsOnDay = eventLayout[dateStr] || [];
              const tasksOnDay = groupedTasks[dateStr] || [];

              return (
                <Group key={`cell-${day}`}>
                  {dateStr === selectedDate && (
                    <RoundedRect
                      x={cellX + 1}
                      y={cellY + 1}
                      width={cellWidth - 2}
                      height={cellHeight - 2}
                      r={6}
                      color={theme.primary}
                      opacity={0.25}
                    />
                  )}

                  {eventsOnDay.map(({ event, lane, type }) => {
                    const barY = cellY + EVENT_BAR_Y_OFFSET + lane * (EVENT_BAR_HEIGHT + 2);
                    const R = 6;
                    let bar;

                    if (type === 'single') {
                      bar = <RoundedRect x={cellX + 2} y={barY} width={cellWidth - 4} height={EVENT_BAR_HEIGHT} r={R} color={theme.primary} />;
                    } else if (type === 'start') {
                      const rect = Skia.XYWHRect(cellX + 2, barY, cellWidth - 2, EVENT_BAR_HEIGHT);
                      const rrect = Skia.RRectXY(rect, R, R);
                      const path = Skia.Path.Make();
                      path.addRRect(rrect);
                      path.addRect(Skia.XYWHRect(cellX + cellWidth - R, barY, R, EVENT_BAR_HEIGHT));
                      bar = <Path path={path} color={theme.primary} />;
                    } else if (type === 'end') {
                      const rect = Skia.XYWHRect(cellX, barY, cellWidth - 2, EVENT_BAR_HEIGHT);
                      const rrect = Skia.RRectXY(rect, R, R);
                      const path = Skia.Path.Make();
                      path.addRRect(rrect);
                      path.addRect(Skia.XYWHRect(cellX, barY, R, EVENT_BAR_HEIGHT));
                      bar = <Path path={path} color={theme.primary} />;
                    } else {
                      bar = <Rect x={cellX} y={barY} width={cellWidth} height={EVENT_BAR_HEIGHT} color={theme.primary} />;
                    }

                    return (
                      <Group key={event.id}>
                        {bar}
                        {(type === 'start' || type === 'single') && (
                          <Text
                            x={cellX + 6}
                            y={barY + eventFont.getSize() + 2}
                            font={eventFont}
                            text={event.title}
                            color={theme.eventText}
                            clip={{ x: cellX + 4, y: barY, width: cellWidth - 8, height: EVENT_BAR_HEIGHT }}
                          />
                        )}
                      </Group>
                    );
                  })}

                  <Text
                    x={cellX + 5}
                    y={cellY + font.getSize() + 3}
                    text={String(day)}
                    font={font}
                    color={dayColor}
                  />

                  {tasksOnDay.slice(0, showTaskTitles ? 2 : 3).map((task, taskIndex) => {
                    const barHeight = showTaskTitles ? TASK_TITLE_BOX_HEIGHT : TASK_BAR_HEIGHT;
                    const barY = cellY + cellHeight - (taskIndex + 1) * (barHeight + TASK_BAR_MARGIN);
                    return (
                      <Group key={task.id}>
                        <RoundedRect
                          x={cellX + 4}
                          y={barY}
                          width={cellWidth - 8}
                          height={barHeight}
                          r={2}
                          color={theme.primary}
                        />
                        {showTaskTitles && (
                          <Text
                            x={cellX + 6}
                            y={barY + eventFont.getSize() + 2}
                            font={eventFont}
                            text={task.title}
                            color={theme.eventText}
                            clip={{ x: cellX + 6, y: barY, width: cellWidth - 12, height: barHeight }}
                          />
                        )}
                      </Group>
                    );
                  })}
                </Group>
              );
            })}
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTopを削除してヘッダーとの間隔を詰める
  },
});