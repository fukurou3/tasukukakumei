// app/features/tasks/constants.ts
export const STORAGE_KEY = 'TASKS';
export const FOLDER_ORDER_KEY = 'FOLDER_ORDER';
export const SELECTION_BAR_HEIGHT = 60;
export const FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL = 12;
export const TAB_MARGIN_RIGHT = 8;
export const ACCENT_LINE_HEIGHT = 2;
// When switching folders by sliding, the text color should update almost
// immediately. This threshold represents how far the page must move (as a
// fraction of the screen width) before the tab text switches selection state.
// 0.001 corresponds to 0.1% of the page width.
export const TAB_SWITCH_THRESHOLD = 0.001;

