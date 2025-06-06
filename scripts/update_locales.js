const fs = require('fs');
function flatten(obj, prefix='') {
  const res = {};
  for (const k in obj) {
    const val = obj[k];
    const path = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(res, flatten(val, path));
    } else {
      res[path] = val;
    }
  }
  return res;
}
function unflatten(obj) {
  const result = {};
  for (const path in obj) {
    const parts = path.split('.');
    let cur = result;
    for (let i=0;i<parts.length-1;i++) {
      cur = cur[parts[i]] = cur[parts[i]] || {};
    }
    cur[parts[parts.length-1]] = obj[path];
  }
  return result;
}
const ja = JSON.parse(fs.readFileSync('locales/ja.json','utf8'));
const enOld = JSON.parse(fs.readFileSync('locales/en.json','utf8'));
const koOld = JSON.parse(fs.readFileSync('locales/ko.json','utf8'));
const jaFlat = flatten(ja);
const enFlat = flatten(enOld);
const koFlat = flatten(koOld);
// manual mappings for missing keys
const enMap = {
  "settings.repeating_tasks_title": "Recurring Task Settings",
  "settings.manage_repeating_tasks": "Manage Recurring Tasks",
  "settings.no_repeating_tasks": "No tasks with recurrence.",
  "settings.edit_repeat_settings_tooltip": "Edit recurrence settings",
  "settings.stop_repeating_tooltip": "Stop recurrence",
  "settings.stop_repeating_confirm_title": "Stop Recurrence",
  "settings.stop_repeating_confirm_message": "Remove recurrence for this task?\\nThe task itself will remain.",
  "settings.stop_action": "Stop",
  "settings.view_task_details_tooltip": "View task details",
  "common.info": "Info",
  "common.month_day_format": "MMM D",
  "common.date_time_format_short": "M/D HH:mm",
  "common.date_format_short": "YYYY/M/D",
  "common.time_format_simple": "H:mm",
  "common.month_day_format_short": "M/D",
  "common.month_day_format_deadline": "MMM D",
  "add_task.period_not_fully_set": "Period incomplete",
  "add_task.period_start_prefix": "Start:",
  "add_task.task_deadline_prefix": "Due:",
  "task_list.announce_next_occurrence": "This task will appear again on {{date}}.",
  "task_list.due_today": "Today",
  "task_list.due_tomorrow": "Tomorrow",
  "task_list.overdue": "Overdue",
  "task_list.completed_on_date_time": "Completed on {{date}}",
  "time.monthsAgoApprox": "about {{count}} month(s) ago",
  "time.yearsMonthsAgo": "{{years}} yr {{months}} mo ago",
  "time.yearsAgoExact": "{{count}} yr ago",
  "time.remainingMonths": "{{count}} month(s) left",
  "time.remainingMonthsDays": "{{months}} mo {{days}} d left",
  "time.remainingYears": "{{count}} yr left",
  "time.remainingYearsMonths": "{{years}} yr {{months}} mo left",
  "time.justNow": "just now",
  "time.dueNow": "Due now",
  "time.dueTomorrowWithTime": "Tomorrow {{time}}",
  "time.overdue_days": "{{count}} day(s) ago",
  "time.overdue_hours": "{{count}} hr ago",
  "time.overdue_minutes": "{{count}} min ago",
  "time.startsInMinutes": "Starts in {{count}} min",
  "time.startsInHours": "Starts in {{count}} hr",
  "time.startsTomorrow": "Starts tomorrow",
  "time.startsOnDate": "Starts {{date}}",
  "deadline_modal.custom_interval": "Interval",
  "deadline_modal.set_custom_interval": "Set Interval",
  "deadline_modal.enter_interval_value": "Enter number",
  "deadline_modal.select_interval_unit": "Select unit",
  "deadline_modal.error_invalid_interval_value": "Enter an integer of 1 or more.",
  "deadline_modal.interval_not_set": "Not set",
  "deadline_modal.every_x_hours": "Every {{count}} hours",
  "deadline_modal.start_date_section_title": "Start Date & Time",
  "deadline_modal.end_date_section_title": "Task Deadline",
  "deadline_modal.end_date_label": "Date",
  "deadline_modal.end_time_label": "Time",
  "deadline_modal.start_date_required_for_end_date": "Start date required for end date.",
  "deadline_modal.end_date_before_start_date_alert_message": "End date must be after start date.",
  "deadline_modal.end_time_requires_end_date_alert_message": "Select an end date to set time.",
  "deadline_modal.task_deadline_section_title": "Task Deadline",
  "deadline_modal.date_label": "Date",
  "deadline_modal.time_label": "Time",
  "deadline_modal.set_period_toggle_label": "Set period",
  "deadline_modal.start_date_label": "Start Date",
  "deadline_modal.start_date_required_for_time": "Start date required to set time.",
  "deadline_modal.period_start_must_be_before_deadline_alert_message": "Start date must be before due date.",
  "deadline_modal.period_start_time_must_be_before_deadline_time_alert_message": "Start time must be before due time.",
  "tasks.display_repeating_today": "🔁Today",
  "tasks.display_repeating_date": "🔁{{date}}",
  "tasks.no_upcoming_repeat": "🔁No upcoming repeat",
  "tasks.no_deadline": "No due date",
  "tasks.completed": "Completed",
  "tasks.completed_on_date": "Completed {{date}}",
  "tasks.display_repeating_overdue_short": "🔁{{date}}",
  "tasks.display_repeating_future_short": "🔁Due {{date}}",
  "calendar.title": "Calendar"
};
const koMap = {
  "settings.repeating_tasks_title": "반복 작업 설정",
  "settings.manage_repeating_tasks": "반복 설정 관리",
  "settings.no_repeating_tasks": "반복 설정된 작업이 없습니다.",
  "settings.edit_repeat_settings_tooltip": "반복 설정 편집",
  "settings.stop_repeating_tooltip": "반복 중지",
  "settings.stop_repeating_confirm_title": "반복 중지",
  "settings.stop_repeating_confirm_message": "이 작업의 반복 설정을 해제하시겠습니까?\\n작업 자체는 삭제되지 않습니다.",
  "settings.stop_action": "중지",
  "settings.view_task_details_tooltip": "작업 상세 보기",
  "settings.google_calendar_integration": "구글 캘린더 연동",
  "settings.calendar_background": "캘린더 배경",
  "settings.connected": "연결됨",
  "settings.not_connected": "연결되지 않음",
  "settings.disconnect_confirm": "연동을 해제하시겠습니까?",
  "settings.login_with_google": "Google 계정으로 로그인",
  "settings.logout": "로그아웃",
  "settings.connected_as": "{{name}} 계정으로 연동 중",
  "settings.google_sync_description": "Google 계정과 연결하면 일정이 양방향으로 동기화됩니다.",
  "common.enabled": "활성",
  "common.disabled": "비활성",
  "common.info": "알림",
  "common.month_day_format": "M월 D일",
  "common.date_time_format_short": "M/D HH:mm",
  "common.date_format_short": "YYYY/M/D",
  "common.time_format_simple": "H:mm",
  "common.month_day_format_short": "M/D",
  "common.month_day_format_deadline": "M월 D일",
  "add_task.unselected_date_placeholder": "미선택",
  "add_task.unselected_time_placeholder": "미선택",
  "add_task.period_not_fully_set": "기간 미완료",
  "add_task.period_start_prefix": "시작:",
  "add_task.task_deadline_prefix": "마감:",
  "task_list.announce_next_occurrence": "이 작업은 {{date}}에 다시 추가됩니다.",
  "task_list.due_today": "오늘",
  "task_list.due_tomorrow": "내일",
  "task_list.overdue": "마감 지남",
  "task_list.completed_on_date_time": "{{date}} 완료",
  "time.monthsAgoApprox": "약 {{count}}개월 전",
  "time.yearsMonthsAgo": "{{years}}년 {{months}}개월 전",
  "time.yearsAgoExact": "{{count}}년 전",
  "time.remainingMonths": "{{count}}개월 남음",
  "time.remainingMonthsDays": "{{months}}개월 {{days}}일 남음",
  "time.remainingYears": "{{count}}년 남음",
  "time.remainingYearsMonths": "{{years}}년 {{months}}개월 남음",
  "time.justNow": "방금 전",
  "time.dueNow": "마감 임박",
  "time.dueTomorrowWithTime": "내일 {{time}}",
  "time.overdue_days": "{{count}}일 전",
  "time.overdue_hours": "{{count}}시간 전",
  "time.overdue_minutes": "{{count}}분 전",
  "time.startsInMinutes": "{{count}}분 후 시작",
  "time.startsInHours": "{{count}}시간 후 시작",
  "time.startsTomorrow": "내일 시작",
  "time.startsOnDate": "{{date}} 시작",
  "deadline_modal.custom_interval": "간격",
  "deadline_modal.set_custom_interval": "간격 설정",
  "deadline_modal.enter_interval_value": "숫자 입력",
  "deadline_modal.select_interval_unit": "단위 선택",
  "deadline_modal.error_invalid_interval_value": "1 이상의 정수를 입력하세요.",
  "deadline_modal.interval_not_set": "미설정",
  "deadline_modal.every_x_hours": "{{count}}시간마다",
  "deadline_modal.start_date_section_title": "시작 일시",
  "deadline_modal.end_date_section_title": "마감 일시",
  "deadline_modal.end_date_label": "날짜",
  "deadline_modal.end_time_label": "시간",
  "deadline_modal.start_date_required_for_end_date": "종료 일시를 설정하려면 시작일이 필요합니다.",
  "deadline_modal.end_date_before_start_date_alert_message": "종료일은 시작일 이후여야 합니다.",
  "deadline_modal.end_time_requires_end_date_alert_message": "종료 시간을 설정하려면 종료일도 선택하세요.",
  "deadline_modal.task_deadline_section_title": "작업 마감",
  "deadline_modal.date_label": "날짜",
  "deadline_modal.time_label": "시간",
  "deadline_modal.set_period_toggle_label": "기간 설정",
  "deadline_modal.start_date_label": "시작일",
  "deadline_modal.start_date_required_for_time": "시간을 설정하려면 시작일도 선택하세요.",
  "deadline_modal.period_start_must_be_before_deadline_alert_message": "시작일은 마감일보다 이전이어야 합니다.",
  "deadline_modal.period_start_time_must_be_before_deadline_time_alert_message": "시작 시간은 마감 시간보다 이전이어야 합니다.",
  "tasks.display_repeating_today": "🔁오늘",
  "tasks.display_repeating_date": "🔁{{date}}",
  "tasks.no_upcoming_repeat": "🔁예정 없음",
  "tasks.no_deadline": "마감 없음",
  "tasks.completed": "완료",
  "tasks.completed_on_date": "{{date}} 완료",
  "tasks.display_repeating_overdue_short": "🔁{{date}}",
  "tasks.display_repeating_future_short": "🔁{{date}} 예정",
  "calendar.title": "캘린더",
  "calendar.weekdays.0": "일",
  "calendar.weekdays.1": "월",
  "calendar.weekdays.2": "화",
  "calendar.weekdays.3": "수",
  "calendar.weekdays.4": "목",
  "calendar.weekdays.5": "금",
  "calendar.weekdays.6": "토"
};

function merge(baseFlat, oldFlat, map){
  const result={};
  for(const k in baseFlat){
    if(k in map) result[k]=map[k];
    else if(k in oldFlat) result[k]=oldFlat[k];
    else result[k]=baseFlat[k];
  }
  return result;
}
const enMerged = unflatten(merge(jaFlat, enFlat, enMap));
const koMerged = unflatten(merge(jaFlat, koFlat, koMap));
fs.writeFileSync('locales/en.json',JSON.stringify(enMerged, null, 2));
fs.writeFileSync('locales/ko.json',JSON.stringify(koMerged, null, 2));
