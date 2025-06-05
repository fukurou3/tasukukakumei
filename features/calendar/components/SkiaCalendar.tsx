// features/calendar/components/SkiaCalendar.tsx
import React from 'react';
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

const FONT_PATH = require('@/assets/fonts/NotoSansJP-Regular.ttf');
const PADDING = 0; // 横幅いっぱいに表示するために余白を0に
const HEADER_HEIGHT = 40;
const TASK_BAR_HEIGHT = 4;
const TASK_BAR_MARGIN = 2;
const EVENT_BAR_HEIGHT = 18;
const EVENT_BAR_Y_OFFSET = 24;

interface SkiaCalendarProps {
  date: dayjs.Dayjs;
  opacity: SharedValue<number>;
  backgroundImage?: number | null;
  selectedDate: string;
  onDayPress: (date: string) => void;
  groupedTasks: Record<string, Task[]>;
  eventLayout: EventLayout;
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
  theme,
}: SkiaCalendarProps) {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const calendarWidth = width - PADDING * 2;
  const cellWidth = calendarWidth / 7;

  const font = useFont(FONT_PATH, 14);
  const eventFont = useFont(FONT_PATH, 10);
  const skiaImage = backgroundImage ? useImage(backgroundImage) : null;

  const year = targetDate.year();
  const month = targetDate.month();
  const firstDayOfMonth = targetDate.startOf('month');
  const daysInMonth = targetDate.daysInMonth();
  const startDayOfWeek = firstDayOfMonth.day();
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map(day => t(`calendar.weekdays.${day}`));
  const numRows = Math.ceil((startDayOfWeek + daysInMonth) / 7);
  const calendarHeight = HEADER_HEIGHT + cellWidth * numRows;

  let gridPath = '';
  for (let i = 1; i < 7; i++) {
    gridPath += `M ${cellWidth * i} ${HEADER_HEIGHT} L ${cellWidth * i} ${calendarHeight} `;
  }
  for (let i = 0; i <= numRows; i++) {
    gridPath += `M 0 ${HEADER_HEIGHT + cellWidth * i} L ${calendarWidth} ${HEADER_HEIGHT + cellWidth * i} `;
  }
  
  const processTap = (tapX: number, tapY: number) => {
    const col = Math.floor(tapX / cellWidth);
    const row = Math.floor((tapY - HEADER_HEIGHT) / cellWidth);

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
              const cellY = HEADER_HEIGHT + y * cellWidth;

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
                    <Rect x={cellX} y={cellY} width={cellWidth} height={cellWidth} color={theme.primary} opacity={0.3} />
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

                  {tasksOnDay.slice(0, 3).map((task, taskIndex) => (
                    <Rect
                      key={task.id}
                      x={cellX + 4}
                      y={cellY + cellWidth - (taskIndex + 1) * (TASK_BAR_HEIGHT + TASK_BAR_MARGIN)}
                      width={cellWidth - 8}
                      height={TASK_BAR_HEIGHT}
                      color={theme.primary}
                    />
                  ))}
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