// features/calendar/utils.ts
import dayjs from 'dayjs';
import type { Task } from '@/features/tasks/types';
import type { GoogleEvent } from './useGoogleCalendar';
import { calculateActualDueDate, calculateNextDisplayInstanceDate } from '@/features/tasks/utils';

export const groupTasksByDate = (tasks: Task[]): Record<string, Task[]> => {
  const map: Record<string, Task[]> = {};
  const add = (date: dayjs.Dayjs | null, task: Task) => {
    if (!date) return;
    const key = date.local().format('YYYY-MM-DD');
    if (!map[key]) map[key] = [];
    map[key].push(task);
  };

  tasks.forEach(task => {
    if (task.deadlineDetails?.repeatFrequency) {
      task.completedInstanceDates?.forEach(d => add(dayjs.utc(d), task));
      add(calculateNextDisplayInstanceDate(task), task);
    } else {
      add(calculateActualDueDate(task), task);
    }
  });

  return map;
};

export type EventLayoutSegment = {
  event: GoogleEvent;
  lane: number;
  type: 'start' | 'middle' | 'end' | 'single';
};

export type EventLayout = Record<string, EventLayoutSegment[]>;

export const processMultiDayEvents = (events: GoogleEvent[], displayMonth: dayjs.Dayjs): EventLayout => {
    const layout: EventLayout = {};
    const monthStart = displayMonth.startOf('month');
    const monthEnd = displayMonth.endOf('month');

    const sortedEvents = [...events].sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));

    const lanes: (string | null)[] = []; 

    for (const event of sortedEvents) {
        const start = dayjs(event.start);
        const end = dayjs(event.end);

        if (end.isBefore(monthStart) || start.isAfter(monthEnd)) {
            continue;
        }

        let laneIndex = lanes.findIndex(lane => {
            if (!lane) return true;
            const laneEnd = dayjs(lane);
            return start.isAfter(laneEnd);
        });

        if (laneIndex === -1) {
            laneIndex = lanes.length;
        }
        lanes[laneIndex] = end.format('YYYY-MM-DD');

        for (let d = start.clone(); d.isBefore(end.add(1, 'day')); d = d.add(1, 'day')) {
            const dateStr = d.format('YYYY-MM-DD');
            if (!layout[dateStr]) layout[dateStr] = [];

            const isStart = d.isSame(start, 'day');
            const isEnd = d.isSame(end, 'day');
            
            let type: EventLayoutSegment['type'] = 'middle';
            if (isStart && isEnd) {
                type = 'single';
            } else if (isStart) {
                type = 'start';
            } else if (isEnd) {
                type = 'end';
            }

            layout[dateStr].push({
                event,
                lane: laneIndex,
                type,
            });
        }
    }
    return layout;
};