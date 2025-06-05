// app/features/tasks/utils.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import type { Task } from './types';
import i18n from '@/lib/i18n';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);

export const calculateActualDueDate = (task: Task): dayjs.Dayjs | null => {
  const { deadlineDetails, deadline: taskDeadlineISO } = task;

  if (!deadlineDetails) {
    return taskDeadlineISO ? dayjs.utc(taskDeadlineISO) : null;
  }

  if (deadlineDetails.taskDeadlineDate) {
    if (deadlineDetails.isTaskDeadlineTimeEnabled && deadlineDetails.taskDeadlineTime) {
      const localDateTimeString = `${deadlineDetails.taskDeadlineDate} ${String(deadlineDetails.taskDeadlineTime.hour).padStart(2, '0')}:${String(deadlineDetails.taskDeadlineTime.minute).padStart(2, '0')}`;
      return dayjs(localDateTimeString).utc();
    } else {
      return dayjs.utc(deadlineDetails.taskDeadlineDate).startOf('day');
    }
  }
  return taskDeadlineISO ? dayjs.utc(taskDeadlineISO) : null;
};

export const calculateNextDisplayInstanceDate = (task: Task, fromDateLocal: dayjs.Dayjs = dayjs()): dayjs.Dayjs | null => {
  if (!task.deadlineDetails?.repeatFrequency || !task.deadlineDetails.repeatStartDate) {
    return calculateActualDueDate(task);
  }

  const {
    repeatFrequency,
    repeatStartDate: repeatStartDateStr,
    repeatDaysOfWeek,
    customIntervalValue,
    customIntervalUnit,
    repeatEnds,
  } = task.deadlineDetails;

  const fromDateUtc = fromDateLocal.utc();
  const originalRepeatStartDateUtc = dayjs.utc(repeatStartDateStr);
  let currentDateCandidateUtc = originalRepeatStartDateUtc.startOf('day');

  const completedDates = task.completedInstanceDates || [];
  const repeatEndDateUtc = (repeatEnds && repeatEnds.type === 'on_date' && repeatEnds.date)
    ? dayjs.utc(repeatEnds.date).endOf('day')
    : null;

  let effectiveFromDateUtc = originalRepeatStartDateUtc.startOf('day');
  if (fromDateUtc.isAfter(effectiveFromDateUtc)) {
      effectiveFromDateUtc = fromDateUtc.startOf('day');
  }

  const originalHour = 0;
  const originalMinute = 0;

  if (currentDateCandidateUtc.isBefore(effectiveFromDateUtc) && !(repeatFrequency === 'custom' && customIntervalUnit === 'hours')) {
    switch (repeatFrequency) {
        case 'daily':
            currentDateCandidateUtc = effectiveFromDateUtc.hour(originalHour).minute(originalMinute);
            if (currentDateCandidateUtc.isBefore(effectiveFromDateUtc)) currentDateCandidateUtc = currentDateCandidateUtc.add(1, 'day');
            break;
        case 'weekly':
            const originalStartDay = originalRepeatStartDateUtc.day();
            currentDateCandidateUtc = effectiveFromDateUtc.day(originalStartDay).hour(originalHour).minute(originalMinute);
            if (currentDateCandidateUtc.isBefore(effectiveFromDateUtc)) {
                 currentDateCandidateUtc = currentDateCandidateUtc.add(1, 'week');
            }
            break;
        case 'monthly':
            const dateInMonth = originalRepeatStartDateUtc.date();
            currentDateCandidateUtc = effectiveFromDateUtc.date(dateInMonth).hour(originalHour).minute(originalMinute);
             if (currentDateCandidateUtc.isBefore(effectiveFromDateUtc) || currentDateCandidateUtc.date() !== dateInMonth) {
                currentDateCandidateUtc = effectiveFromDateUtc.add(1, 'month').date(dateInMonth);
             }
            if (currentDateCandidateUtc.date() !== dateInMonth) {
                currentDateCandidateUtc = currentDateCandidateUtc.subtract(1,'month').endOf('month');
            }
            break;
        case 'yearly':
            const monthInYear = originalRepeatStartDateUtc.month();
            const dateInYearMonth = originalRepeatStartDateUtc.date();
            currentDateCandidateUtc = effectiveFromDateUtc.month(monthInYear).date(dateInYearMonth).hour(originalHour).minute(originalMinute);
            if (currentDateCandidateUtc.isBefore(effectiveFromDateUtc) || currentDateCandidateUtc.date() !== dateInYearMonth) {
                currentDateCandidateUtc = effectiveFromDateUtc.add(1, 'year').month(monthInYear).date(dateInYearMonth);
            }
            if (currentDateCandidateUtc.date() !== dateInYearMonth) {
                 currentDateCandidateUtc = currentDateCandidateUtc.month(monthInYear).endOf('month');
            }
            break;
    }
  }

  for (let i = 0; i < 365 * 5 + 14; i++) {
    if (repeatEndDateUtc && currentDateCandidateUtc.isAfter(repeatEndDateUtc)) {
      return null;
    }
    let isValidInstance = true;
    const currentDateStr = currentDateCandidateUtc.format('YYYY-MM-DD');
    if (currentDateCandidateUtc.isBefore(originalRepeatStartDateUtc.startOf('day'))) {
    } else {
        if (repeatFrequency === 'weekly') {
            const dayOfWeek = currentDateCandidateUtc.day();
            if (!repeatDaysOfWeek || !repeatDaysOfWeek[dayOfWeek]) {
                isValidInstance = false;
            }
        }
        if (isValidInstance && currentDateCandidateUtc.isSameOrAfter(fromDateUtc.startOf('day')) && !completedDates.includes(currentDateStr)) {
            return currentDateCandidateUtc;
        }
    }
    const originalDateForCalc = originalRepeatStartDateUtc.date();
    switch (repeatFrequency) {
      case 'daily':
        currentDateCandidateUtc = currentDateCandidateUtc.add(1, 'day');
        break;
      case 'weekly':
        currentDateCandidateUtc = currentDateCandidateUtc.add(1, 'week');
        break;
      case 'monthly':
        let nextMonthCandidate = currentDateCandidateUtc.add(1, 'month');
        if (nextMonthCandidate.date() !== originalDateForCalc) {
            const lastDayOfNextMonth = nextMonthCandidate.endOf('month').date();
            nextMonthCandidate = nextMonthCandidate.date(Math.min(originalDateForCalc, lastDayOfNextMonth));
        }
        currentDateCandidateUtc = nextMonthCandidate;
        break;
      case 'yearly':
        let nextYearCandidate = currentDateCandidateUtc.add(1, 'year');
        const originalMonth = originalRepeatStartDateUtc.month();
        if (nextYearCandidate.month() !== originalMonth || nextYearCandidate.date() !== originalDateForCalc) {
             nextYearCandidate = nextYearCandidate.month(originalMonth).date(originalDateForCalc);
             if (nextYearCandidate.month() !== originalMonth) {
                nextYearCandidate = nextYearCandidate.subtract(1,'day').endOf('month');
             }
        }
        currentDateCandidateUtc = nextYearCandidate;
        break;
      case 'custom':
        const interval = customIntervalValue || 1;
        if (customIntervalUnit === 'hours') {
          currentDateCandidateUtc = currentDateCandidateUtc.add(interval, 'hour');
        } else {
          currentDateCandidateUtc = currentDateCandidateUtc.add(interval, 'day');
        }
        break;
      default:
        return null;
    }
    currentDateCandidateUtc = currentDateCandidateUtc.hour(0).minute(0).second(0).millisecond(0);
  }
  return null;
};

export const getTimeText = (
  task: Task,
  t: (key: string, options?: any) => string,
  effectiveDueDateUtc?: dayjs.Dayjs | null,
  displayStartDateUtc?: dayjs.Dayjs | null
): string => {
  const nowLocal = dayjs();

  if ((task.deadlineDetails as any)?.isPeriodSettingEnabled && displayStartDateUtc && displayStartDateUtc.local().isAfter(nowLocal)) {
    const displayStartDateLocal = displayStartDateUtc.local();
    const diffMinutes = displayStartDateLocal.diff(nowLocal, 'minute');
    if (diffMinutes < 1) return t('time.startsInMinutes', { count: 1 });
    if (diffMinutes < 60) return t('time.startsInMinutes', { count: diffMinutes });
    const diffHours = displayStartDateLocal.diff(nowLocal, 'hour');
    if (diffHours < 24) return t('time.startsInHours', { count: diffHours });
    if (displayStartDateLocal.isSame(nowLocal.add(1, 'day'), 'day')) return t('time.startsTomorrow');
    return t('time.startsOnDate', { date: displayStartDateLocal.locale(i18n.language).format(t('common.month_day_format', 'M月D日')) });
  }

  if (!effectiveDueDateUtc) {
    return t('task_list.no_deadline', '期限なし');
  }
  const effectiveDueDateLocal = effectiveDueDateUtc.local();

  if (task.deadlineDetails?.repeatFrequency) {
    const dueDateStartOfDay = effectiveDueDateLocal.startOf('day');
    const todayStartOfDay = nowLocal.startOf('day');
    if (dueDateStartOfDay.isSame(todayStartOfDay, 'day')) {
      return t('tasks.display_repeating_today_short', '今日');
    } else if (dueDateStartOfDay.isBefore(todayStartOfDay, 'day')) {
      return t('tasks.display_repeating_overdue_short', { date: effectiveDueDateLocal.locale(i18n.language).format(t('common.month_day_format_deadline', 'M月D日')) });
    } else {
      return t('tasks.display_repeating_future_short', { date: effectiveDueDateLocal.locale(i18n.language).format(t('common.month_day_format_deadline', 'M月D日')) });
    }
  }

  if (task.deadlineDetails?.isTaskDeadlineTimeEnabled === false) {
    const dueDateStartOfDay = effectiveDueDateLocal.startOf('day');
    const todayStartOfDay = nowLocal.startOf('day');
    if (dueDateStartOfDay.isSame(todayStartOfDay, 'day')) {
      return t('task_list.due_today', '今日');
    } else if (dueDateStartOfDay.isSame(todayStartOfDay.add(1, 'day'), 'day')) {
      return t('task_list.due_tomorrow', '明日');
    } else if (dueDateStartOfDay.isBefore(todayStartOfDay, 'day')) {
      const daysOverdue = todayStartOfDay.diff(dueDateStartOfDay, 'day');
      return t('time.overdue_days', { count: daysOverdue });
    } else {
      const diffYears = dueDateStartOfDay.diff(todayStartOfDay, 'year');
      const diffMonths = dueDateStartOfDay.diff(todayStartOfDay, 'month');
      const diffDays = dueDateStartOfDay.diff(todayStartOfDay, 'day');
      if (diffYears > 0) {
        const monthsInLastYear = dueDateStartOfDay.subtract(diffYears, 'year').diff(todayStartOfDay, 'month');
        if (monthsInLastYear > 0) {
          return t('time.remainingYearsMonths', { years: diffYears, months: monthsInLastYear });
        }
        return t('time.remainingYears', { count: diffYears });
      }
      if (diffMonths > 0) {
        const daysInLastMonth = dueDateStartOfDay.subtract(diffMonths, 'month').diff(todayStartOfDay, 'day');
         if (daysInLastMonth > 0 ) {
            return t('time.remainingMonthsDays', { months: diffMonths, days: daysInLastMonth });
        }
        return t('time.remainingMonths', { count: diffMonths });
      }
      return t('time.remainingDays', { count: diffDays });
    }
  } else {
    const isOverdue = effectiveDueDateLocal.isBefore(nowLocal);
    if (isOverdue) {
      const diffHoursAbs = nowLocal.diff(effectiveDueDateLocal, 'hour');
      if (diffHoursAbs > 0) {
        return t('time.overdue_hours', { count: diffHoursAbs });
      }
      const diffMinutesAbs = nowLocal.diff(effectiveDueDateLocal, 'minute');
      return t('time.overdue_minutes', { count: Math.max(1, diffMinutesAbs) });
    }
    if (effectiveDueDateLocal.isSame(nowLocal.add(1, 'day'), 'day')) {
        return t('time.dueTomorrowWithTime', { time: effectiveDueDateLocal.format('HH:mm') });
    }
    const diffMinutesTotal = effectiveDueDateLocal.diff(nowLocal, 'minute');
    if (diffMinutesTotal < 60) {
      return t('time.remainingMinutes', { count: diffMinutesTotal });
    }
    const diffHoursTotal = effectiveDueDateLocal.diff(nowLocal, 'hour');
    if (diffHoursTotal < 24) {
      return t('time.remainingHours', { count: diffHoursTotal });
    }
    const dueDateStartOfDay = effectiveDueDateLocal.startOf('day');
    const todayStartOfDay = nowLocal.startOf('day');
    const diffYears = dueDateStartOfDay.diff(todayStartOfDay, 'year');
    const diffMonths = dueDateStartOfDay.diff(todayStartOfDay, 'month');
    const diffDays = dueDateStartOfDay.diff(todayStartOfDay, 'day');
    if (diffYears > 0) {
      const monthsInLastYear = dueDateStartOfDay.subtract(diffYears, 'year').diff(todayStartOfDay, 'month');
      if (monthsInLastYear > 0) {
        return t('time.remainingYearsMonths', { years: diffYears, months: monthsInLastYear });
      }
      return t('time.remainingYears', { count: diffYears });
    }
    if (diffMonths > 0) {
       const daysInLastMonth = dueDateStartOfDay.subtract(diffMonths, 'month').diff(todayStartOfDay, 'day');
        if (daysInLastMonth > 0 ) {
           return t('time.remainingMonthsDays', { months: diffMonths, days: daysInLastMonth });
       }
      return t('time.remainingMonths', { count: diffMonths });
    }
    return t('time.remainingDays', { count: diffDays });
  }
};

export const getTimeColor = (
  task: Task,
  isDark: boolean,
  effectiveDueDateUtc?: dayjs.Dayjs | null,
  displayStartDateUtc?: dayjs.Dayjs | null
): string => {
  const nowLocal = dayjs();

  if (!effectiveDueDateUtc) {
    return isDark ? '#8E8E93' : '#6D6D72';
  }

  const effectiveDueDateLocal = effectiveDueDateUtc.local();
  let isConsideredOverdue = false;

  if (task.deadlineDetails?.repeatFrequency) {
    if (effectiveDueDateLocal.startOf('day').isBefore(nowLocal.startOf('day'))) {
      isConsideredOverdue = true;
    }
  } else if (task.deadlineDetails?.isTaskDeadlineTimeEnabled === true) {
    if (effectiveDueDateLocal.isBefore(nowLocal)) {
      isConsideredOverdue = true;
    }
  } else {
    if (effectiveDueDateLocal.startOf('day').isBefore(nowLocal.startOf('day'))) {
      isConsideredOverdue = true;
    }
  }

  if (isConsideredOverdue) {
    return isDark ? '#FF453A' : '#FF3B30';
  }

  return isDark ? '#E0E0E0' : '#212121';
};

// interpolateNumeric, hexToRgb, rgbToHex are kept as they might be used elsewhere
// or for other non-reanimated animations, or reanimated worklets if ported.
// If they are confirmed to be unused across the entire project, they can be removed.
export const interpolateNumeric = (start: number, end: number, factor: number): number => {
  return Math.round(start + (end - start) * factor);
};

export const hexToRgb = (hex: string | undefined): { r: number; g: number; b: number } | null => {
  if (typeof hex !== 'string') return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};


if (i18n.isInitialized) {
    const lang = i18n.language.split('-')[0];
    dayjs.locale(lang);
    try {
      dayjs.tz.setDefault(dayjs.tz.guess());
    } catch (e) {
      console.warn("Could not guess timezone, defaulting to UTC for dayjs operations.", e);
      dayjs.tz.setDefault('Etc/UTC');
    }
}
i18n.on('languageChanged', (lng) => {
  const lang = lng.split('-')[0];
  dayjs.locale(lang);
  try {
    dayjs.tz.setDefault(dayjs.tz.guess());
  } catch (e) {
    console.warn("Could not guess timezone on language change, defaulting to UTC for dayjs operations.", e);
    dayjs.tz.setDefault('Etc/UTC');
  }
});