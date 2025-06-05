// app/features/tasks/components/TaskViewPager.tsx
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import PagerView, { type PagerViewOnPageSelectedEvent, type PagerViewOnPageScrollEvent } from 'react-native-pager-view';
import type { TaskScreenStyles } from '@/features/tasks/styles';
import type { DisplayableTaskItem, SelectableItem } from '@/features/tasks/types';
import { TaskFolder, type Props as TaskFolderProps } from '@/features/tasks/components/TaskFolder';
import type { ActiveTab, FolderTab, MemoizedPageData } from '@/features/tasks/hooks/useTasksScreenLogic';
import { SELECTION_BAR_HEIGHT } from '@/features/tasks/constants';

type TaskViewPagerProps = {
  styles: TaskScreenStyles;
  pagerRef: React.RefObject<PagerView>;
  folderTabs: FolderTab[];
  selectedTabIndex: number; // ★ プロパティ名を変更
  handlePageSelected: (event: PagerViewOnPageSelectedEvent) => void;
  handlePageScroll: (event: PagerViewOnPageScrollEvent) => void;
  activeTab: ActiveTab;
  toggleTaskDone: (id: string, instanceDate?: string) => void;
  isReordering: boolean;
  draggingFolder: string | null;
  setDraggingFolder: (name: string | null) => void;
  moveFolderOrder: (folderName: string, direction: 'up' | 'down') => void;
  stopReordering: () => void;
  isSelecting: boolean;
  selectedItems: SelectableItem[];
  onLongPressSelectItem: (type: 'task' | 'folder', id: string) => void;
  noFolderName: string;
  t: (key: string, options?: any) => string;
  memoizedPagesData: Map<string, MemoizedPageData>;
};

const windowWidth = Dimensions.get('window').width;

export const TaskViewPager: React.FC<TaskViewPagerProps> = ({
  styles,
  pagerRef,
  folderTabs,
  selectedTabIndex, // ★ プロパティ名を変更
  handlePageSelected,
  handlePageScroll,
  activeTab,
  toggleTaskDone,
  isReordering,
  draggingFolder,
  setDraggingFolder,
  moveFolderOrder,
  stopReordering,
  isSelecting,
  selectedItems,
  onLongPressSelectItem,
  noFolderName,
  t,
  memoizedPagesData,
}) => {
  const renderPageContent = (pageFolderName: string, pageIndex: number) => {
    const pageData = memoizedPagesData.get(pageFolderName);
    if (!pageData) {
        return <View key={`page-${pageFolderName}-${pageIndex}`} style={{ width: windowWidth, flex: 1 }} />;
    }
    const { foldersToRender, tasksByFolder, allTasksForPage } = pageData;

    return (
      <View key={`page-${pageFolderName}-${pageIndex}`} style={{ width: windowWidth, flex: 1, paddingTop: 8, paddingBottom: isSelecting ? SELECTION_BAR_HEIGHT + 20 : 100 }}>
          {foldersToRender.map(folderName => {
            const sortedFolderTasks = tasksByFolder.get(folderName) || [];
            if (activeTab === 'completed' && sortedFolderTasks.length === 0) {
              return null;
            }
            const taskFolderProps: Omit<TaskFolderProps, 'isCollapsed' | 'toggleFolder' | 'onRefreshTasks'> = {
              folderName,
              tasks: sortedFolderTasks,
              onToggleTaskDone: toggleTaskDone,
              isReordering: isReordering && draggingFolder === folderName && folderName !== noFolderName && pageFolderName === 'all',
              setDraggingFolder,
              draggingFolder,
              moveFolder: moveFolderOrder,
              stopReordering,
              isSelecting,
              selectedIds: selectedItems.map(it => it.id),
              onLongPressSelect: onLongPressSelectItem,
              currentTab: activeTab,
            };
            return <TaskFolder key={`${pageFolderName}-${folderName}-${pageIndex}`} {...taskFolderProps} />;
          })}
          {allTasksForPage.length === 0 && (
             <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>
                 {activeTab === 'incomplete' ? t('task_list.empty') : t('task_list.no_tasks_completed')}
               </Text>
             </View>
           )}
      </View>
    );
  };

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={selectedTabIndex} // ★ プロパティ名を変更
      onPageSelected={handlePageSelected}
      onPageScroll={handlePageScroll}
      key={folderTabs.map(f => f.name).join('-')}
      offscreenPageLimit={1}
    >
      {folderTabs.map((folder, index) => renderPageContent(folder.name, index))}
    </PagerView>
  );
};