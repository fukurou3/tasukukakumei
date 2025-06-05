// app/features/tasks/hooks/useTasksScreenLogic.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert, Dimensions, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import PagerView, { type PagerViewOnPageSelectedEvent, type PagerViewOnPageScrollEvent } from 'react-native-pager-view';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import type { Task, FolderOrder, SelectableItem, DisplayTaskOriginal, DisplayableTaskItem } from '@/features/tasks/types';
import { calculateNextDisplayInstanceDate, calculateActualDueDate } from '@/features/tasks/utils';
import { useSelection } from '@/features/tasks/context';
import { STORAGE_KEY, FOLDER_ORDER_KEY, SELECTION_BAR_HEIGHT, FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL, TAB_MARGIN_RIGHT } from '@/features/tasks/constants';
import i18n from '@/lib/i18n';

const windowWidth = Dimensions.get('window').width;

export type SortMode = 'deadline' | 'custom' | 'priority';
export type ActiveTab = 'incomplete' | 'completed';
export type FolderTab = { name: string; label: string };
export type FolderTabLayout = { x: number; width: number; index: number };

export type MemoizedPageData = {
  foldersToRender: string[];
  tasksByFolder: Map<string, DisplayableTaskItem[]>;
  allTasksForPage: DisplayableTaskItem[];
};

export const useTasksScreenLogic = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const selectionHook = useSelection();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [folderOrder, setFolderOrder] = useState<FolderOrder>([]);
  const [loading, setLoading] = useState(true);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('incomplete');
  const [selectedFolderTabName, setSelectedFolderTabName] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('deadline');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draggingFolder, setDraggingFolder] = useState<string | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);

  const selectionAnim = useSharedValue(SELECTION_BAR_HEIGHT);
  const pagerRef = useRef<PagerView>(null);
  const folderTabsScrollViewRef = useRef<ScrollView>(null);
  const [folderTabLayouts, setFolderTabLayouts] = useState<Record<number, FolderTabLayout>>({});
  
  // ★ ちらつきの原因となっていた currentContentPage を廃止し、新しい確定状態を導入
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const pageScrollPosition = useSharedValue(0);

  const noFolderName = useMemo(() => t('common.no_folder_name', 'フォルダなし'), [t]);

  const folderTabs: FolderTab[] = useMemo(() => {
    const tabsArr: FolderTab[] = [{ name: 'all', label: t('folder_tabs.all', 'すべて') }];
    const uniqueFoldersFromTasks = Array.from(new Set(tasks.map(task => task.folder || noFolderName)));

    if (activeTab === 'completed') {
        const foldersWithCompletedTasks = new Set(
            tasks.filter(t => t.completedAt || (t.completedInstanceDates && t.completedInstanceDates.length > 0))
                 .map(t => t.folder || noFolderName)
        );
        folderOrder.forEach(folderName => {
            if (foldersWithCompletedTasks.has(folderName) && folderName !== noFolderName) {
                tabsArr.push({ name: folderName, label: folderName });
            }
        });
        const remainingFolders = [...foldersWithCompletedTasks].filter(name => !folderOrder.includes(name) && name !== noFolderName).sort();
        remainingFolders.forEach(folderName => {
             tabsArr.push({ name: folderName, label: folderName });
        });
        if (foldersWithCompletedTasks.has(noFolderName)) {
            tabsArr.push({ name: noFolderName, label: noFolderName });
        }
    } else {
        const allFolders = new Set([...folderOrder, ...uniqueFoldersFromTasks]);
        const orderedFolders = folderOrder.filter(name => allFolders.has(name) && name !== noFolderName);
        const unorderedFolders = [...allFolders].filter(name => !folderOrder.includes(name) && name !== noFolderName).sort();

        [...orderedFolders, ...unorderedFolders].forEach(folderName => {
            if (!tabsArr.some(tab => tab.name === folderName)) {
                tabsArr.push({ name: folderName, label: folderName });
            }
        });

        if (allFolders.has(noFolderName)) {
            tabsArr.push({ name: noFolderName, label: noFolderName });
        }
    }
    return tabsArr;
  }, [tasks, folderOrder, noFolderName, t, activeTab]);

  useFocusEffect(
    useCallback(() => {
      const langForDayjs = i18n.language.split('-')[0];
      if (dayjs.Ls[langForDayjs]) { dayjs.locale(langForDayjs); } else { dayjs.locale('en'); }

      const loadData = async () => {
        if (!isDataInitialized) {
          setLoading(true);
        }
        try {
          const [rawTasksData, rawOrderData] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY),
            AsyncStorage.getItem(FOLDER_ORDER_KEY),
          ]);
          setTasks(rawTasksData ? JSON.parse(rawTasksData) : []);
          setFolderOrder(rawOrderData ? JSON.parse(rawOrderData) : []);
        } catch (e) {
          console.error('Failed to load data from storage on focus:', e);
          setTasks([]);
          setFolderOrder([]);
        } finally {
          if (!isDataInitialized) {
            setLoading(false);
            setIsDataInitialized(true);
          }
        }
      };

      loadData();
    }, [i18n.language, isDataInitialized])
  );

  // ★ フォルダタブリストの変更（例：未完了/完了の切替）時に、ページャーの位置を同期させる
  useEffect(() => {
    const targetIndex = folderTabs.findIndex(ft => ft.name === selectedFolderTabName);
    const newIndex = targetIndex !== -1 ? targetIndex : 0;
    
    if (selectedTabIndex !== newIndex) {
        setSelectedTabIndex(newIndex);
        // アニメーションなしで即座にページを切り替え
        pagerRef.current?.setPageWithoutAnimation(newIndex);
        // アニメーション用の共有値も即座に更新
        pageScrollPosition.value = newIndex;
    }
  }, [folderTabs, selectedFolderTabName]);


  const scrollFolderTabsToCenter = useCallback((pageIndex: number) => {
    const tabInfo = folderTabLayouts[pageIndex];
    if (tabInfo && folderTabsScrollViewRef.current && windowWidth > 0 && folderTabs.length > 0 && pageIndex < folderTabs.length) {
        const screenCenter = windowWidth / 2;
        let targetScrollXForTabs = tabInfo.x + tabInfo.width / 2 - screenCenter;
        targetScrollXForTabs = Math.max(0, targetScrollXForTabs);

        let totalFolderTabsContentWidth = 0;
        folderTabs.forEach((_ft, idx) => {
            const layout = folderTabLayouts[idx];
            if (layout) {
                totalFolderTabsContentWidth += layout.width;
                if (idx < folderTabs.length - 1) {
                    totalFolderTabsContentWidth += TAB_MARGIN_RIGHT;
                }
            }
        });
        totalFolderTabsContentWidth += FOLDER_TABS_CONTAINER_PADDING_HORIZONTAL * 2;
        const maxScrollX = Math.max(0, totalFolderTabsContentWidth - windowWidth);
        targetScrollXForTabs = Math.min(targetScrollXForTabs, maxScrollX);

        folderTabsScrollViewRef.current.scrollTo({ x: targetScrollXForTabs, animated: true });
    }
  }, [folderTabLayouts, folderTabs]);

  useEffect(() => {
    selectionAnim.value = withTiming(selectionHook.isSelecting ? 0 : SELECTION_BAR_HEIGHT, { duration: 250 });
  }, [selectionHook.isSelecting, selectionAnim]);

  // ★ 依存配列を新しい確定状態 selectedTabIndex に変更
  useEffect(() => {
    scrollFolderTabsToCenter(selectedTabIndex);
  }, [selectedTabIndex, folderTabLayouts, scrollFolderTabsToCenter]);


  const saveTasksToStorage = async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (e) {
      console.error('Failed to save tasks to storage:', e);
    }
  };

  const saveFolderOrderToStorage = async (orderToSave: FolderOrder) => {
    try {
      await AsyncStorage.setItem(FOLDER_ORDER_KEY, JSON.stringify(orderToSave));
    } catch (e) {
      console.error('Failed to save folder order to storage:', e);
    }
  };

  const toggleTaskDone = useCallback(async (id: string, instanceDateStr?: string) => {
    const newTasks = tasks.map(task => {
      if (task.id === id) {
        if (task.deadlineDetails?.repeatFrequency) {
          let newCompletedDates = task.completedInstanceDates ? [...task.completedInstanceDates] : [];
          if (instanceDateStr) {
            const exists = newCompletedDates.includes(instanceDateStr);
            if (exists) {
              newCompletedDates = newCompletedDates.filter(d => d !== instanceDateStr);
            } else {
              newCompletedDates.push(instanceDateStr);
            }
          }
          return { ...task, completedInstanceDates: newCompletedDates };
        } else {
          return { ...task, completedAt: task.completedAt ? undefined : dayjs.utc().toISOString() };
        }
      }
      return task;
    });
    setTasks(newTasks);
    await saveTasksToStorage(newTasks);
  }, [tasks]);

  const moveFolderOrder = useCallback(async (folderName: string, direction: 'up' | 'down') => {
    const idx = folderOrder.indexOf(folderName);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= folderOrder.length) return;

    const newOrder = [...folderOrder];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setFolderOrder(newOrder);
    await saveFolderOrderToStorage(newOrder);
  }, [folderOrder]);

  const onLongPressSelectItem = useCallback((type: 'task' | 'folder', id: string) => {
    selectionHook.startSelecting();
    selectionHook.toggleItem({ id, type });
  }, [selectionHook]);

  const cancelSelectionMode = useCallback(() => {
    selectionHook.clearSelection();
  }, [selectionHook]);

  const stopReordering = useCallback(() => {
      setIsReordering(false);
      setDraggingFolder(null);
  }, []);

  const baseProcessedTasks: DisplayTaskOriginal[] = useMemo(() => {
    return tasks.map(task => {
      const displayDateUtc = task.deadlineDetails?.repeatFrequency && task.deadlineDetails.repeatStartDate
        ? calculateNextDisplayInstanceDate(task)
        : calculateActualDueDate(task);
      let isTaskFullyCompleted = false;
      if (task.deadlineDetails?.repeatFrequency) {
        const nextInstanceIsNull = displayDateUtc === null;
        let repeatEndsPassed = false;
        const repeatEnds = task.deadlineDetails.repeatEnds;
        if (repeatEnds) {
          switch (repeatEnds.type) {
            case 'on_date': if (typeof repeatEnds.date === 'string') { repeatEndsPassed = dayjs.utc(repeatEnds.date).endOf('day').isBefore(dayjs().utc()); } break;
            case 'count': if (typeof repeatEnds.count === 'number') { if ((task.completedInstanceDates?.length || 0) >= repeatEnds.count) { repeatEndsPassed = true; } } break;
          }
        }
        isTaskFullyCompleted = nextInstanceIsNull || repeatEndsPassed;
      } else { isTaskFullyCompleted = !!task.completedAt; }
      return { ...task, displaySortDate: displayDateUtc, isTaskFullyCompleted };
    });
  }, [tasks]);

  const memoizedPagesData = useMemo<Map<string, MemoizedPageData>>(() => {
    const pagesData = new Map<string, MemoizedPageData>();

    const getTasksToDisplayForPage = (pageFolderName: string): DisplayableTaskItem[] => {
        let filteredTasks = baseProcessedTasks;
        if (pageFolderName !== 'all') {
            filteredTasks = filteredTasks.filter(task => (task.folder || noFolderName) === pageFolderName);
        }

        if (activeTab === 'completed') {
            const completedDisplayItems: DisplayableTaskItem[] = [];
            filteredTasks.forEach(task => {
                if (task.isTaskFullyCompleted && !task.deadlineDetails?.repeatFrequency) {
                    completedDisplayItems.push({ ...task, keyId: task.id, displaySortDate: task.completedAt ? dayjs.utc(task.completedAt) : null });
                } else if (task.deadlineDetails?.repeatFrequency && task.completedInstanceDates && task.completedInstanceDates.length > 0) {
                    task.completedInstanceDates.forEach(instanceDate => {
                        completedDisplayItems.push({ ...task, keyId: `${task.id}-${instanceDate}`, displaySortDate: dayjs.utc(instanceDate), isCompletedInstance: true, instanceDate: instanceDate });
                    });
                }
            });
            return completedDisplayItems.sort((a, b) => (b.displaySortDate?.unix() || 0) - (a.displaySortDate?.unix() || 0));
        } else {
            const todayStartOfDayUtc = dayjs.utc().startOf('day');
            return filteredTasks
                .filter(task => {
                    if (task.isTaskFullyCompleted) return false;
                    if ((task.deadlineDetails as any)?.isPeriodSettingEnabled && (task.deadlineDetails as any)?.periodStartDate) {
                        const periodStartDateUtc = dayjs.utc((task.deadlineDetails as any).periodStartDate).startOf('day');
                        if (periodStartDateUtc.isAfter(todayStartOfDayUtc)) return false;
                    }
                    return true;
                })
                .map(task => ({ ...task, keyId: task.id }));
        }
    };
    
    folderTabs.forEach(tab => {
        const pageFolderName = tab.name;
        const tasksForPage = getTasksToDisplayForPage(pageFolderName);
        let foldersToRenderOnThisPage: string[];
        if (pageFolderName === 'all') {
            const allFolderNamesInTasksOnPage = Array.from(new Set(tasksForPage.map(t => t.folder || noFolderName)));
            const combinedFolders = new Set([...folderOrder, ...allFolderNamesInTasksOnPage]);
            const ordered = folderOrder.filter(name => combinedFolders.has(name) && name !== noFolderName);
            const unordered = [...combinedFolders].filter(name => !ordered.includes(name) && name !== noFolderName && name !== 'all').sort((a, b) => a.localeCompare(b));
            
            foldersToRenderOnThisPage = [...ordered, ...unordered];
            
            if (combinedFolders.has(noFolderName) && tasksForPage.some(t => (t.folder || noFolderName) === noFolderName)) {
                foldersToRenderOnThisPage.push(noFolderName);
            }
        } else {
            foldersToRenderOnThisPage = [pageFolderName];
        }

        const tasksByFolder = new Map<string, DisplayableTaskItem[]>();

        foldersToRenderOnThisPage.forEach(folderName => {
            const tasksInThisFolder = tasksForPage.filter(t => (t.folder || noFolderName) === folderName);
            if (activeTab === 'completed' && tasksInThisFolder.length === 0) {
                return;
            }

            const sortedFolderTasks = [...tasksInThisFolder].sort((a, b) => {
                if (activeTab === 'incomplete' && sortMode === 'deadline') {
                  const today = dayjs.utc().startOf('day');
                  const getCategory = (task: DisplayableTaskItem): number => {
                    const date = task.displaySortDate;
                    if (!date) return 3;
                    if (date.isBefore(today, 'day')) return 0;
                    if (date.isSame(today, 'day')) return 1;
                    return 2;
                  };
                  const categoryA = getCategory(a);
                  const categoryB = getCategory(b);
                  if (categoryA !== categoryB) return categoryA - categoryB;
                  if (categoryA === 3) return a.title.localeCompare(b.title);
                  const dateAVal = a.displaySortDate!;
                  const dateBVal = b.displaySortDate!;
                  if (dateAVal.isSame(dateBVal, 'day')) {
                      const timeEnabledA = a.deadlineDetails?.isTaskDeadlineTimeEnabled === true && !a.deadlineDetails?.repeatFrequency;
                      const timeEnabledB = b.deadlineDetails?.isTaskDeadlineTimeEnabled === true && !b.deadlineDetails?.repeatFrequency;
                      if (timeEnabledA && !timeEnabledB) return -1;
                      if (!timeEnabledA && timeEnabledB) return 1;
                  }
                  return dateAVal.unix() - dateBVal.unix();
                }

                if (sortMode === 'custom' && activeTab === 'incomplete') {
                    const orderA = a.customOrder ?? Infinity;
                    const orderB = b.customOrder ?? Infinity;
                    if (orderA !== Infinity || orderB !== Infinity) {
                        if (orderA === Infinity) return 1;
                        if (orderB === Infinity) return -1;
                        return orderA - orderB;
                    }
                }
                if (sortMode === 'priority' && activeTab === 'incomplete') {
                    const priorityA = a.priority ?? -1;
                    const priorityB = b.priority ?? -1;
                    if (priorityA !== priorityB) return priorityB - priorityA;
                }
                return a.title.localeCompare(b.title);
            });
            if (sortedFolderTasks.length > 0) {
                tasksByFolder.set(folderName, sortedFolderTasks);
            }
        });

        if (activeTab === 'completed') {
            foldersToRenderOnThisPage = foldersToRenderOnThisPage.filter(name => tasksByFolder.has(name));
        }

        pagesData.set(pageFolderName, {
            foldersToRender: foldersToRenderOnThisPage,
            tasksByFolder,
            allTasksForPage: tasksForPage,
        });
    });

    return pagesData;
  }, [baseProcessedTasks, activeTab, sortMode, folderOrder, noFolderName, folderTabs]);

  // ★ タブタップ時の処理を修正
  const handleFolderTabPress = useCallback((_folderName: string, index: number) => {
    if (selectedTabIndex !== index) {
      // 確定状態を更新
      setSelectedTabIndex(index);
      // PagerView をプログラムで操作
      pagerRef.current?.setPage(index);
      // アニメーション値を更新して、UIの追従を即座に開始させる（ちらつき防止）
      pageScrollPosition.value = withTiming(index, { duration: 250 });
    }
  }, [selectedTabIndex, pageScrollPosition]);

  const handlePageScroll = useCallback((event: PagerViewOnPageScrollEvent) => {
    // PagerViewのスクロールに追従してアニメーション値を更新
    pageScrollPosition.value = event.nativeEvent.position + event.nativeEvent.offset;
  }, [pageScrollPosition]);

  // ★ ページ切り替え完了時の処理を修正
  const handlePageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    const newPageIndex = event.nativeEvent.position;
    
    // 確定状態とUIを同期
    if (selectedTabIndex !== newPageIndex) {
      setSelectedTabIndex(newPageIndex);
    }
    
    // 現在のタブを中央にスクロール
    scrollFolderTabsToCenter(newPageIndex);

    // フォルダ名などの関連情報を更新
    if (newPageIndex >= 0 && newPageIndex < folderTabs.length) {
      const newSelectedFolder = folderTabs[newPageIndex].name;
      setSelectedFolderTabName(newSelectedFolder);
      selectionHook.clearSelection();
    }
  }, [folderTabs, selectedTabIndex, selectionHook, scrollFolderTabsToCenter]);

  const handleSelectAll = useCallback(() => {
    // ★ 依存を selectedTabIndex に変更
    const activeFolderTabName = folderTabs[selectedTabIndex]?.name || 'all';
    const pageData = memoizedPagesData.get(activeFolderTabName);
    if (!pageData) return;

    const itemsToSelect: SelectableItem[] = [];

    pageData.allTasksForPage.forEach(task => {
        itemsToSelect.push({ type: 'task', id: task.keyId });
    });
    
    if (activeFolderTabName === 'all') {
        pageData.foldersToRender.forEach(folderName => {
            if (folderName !== noFolderName) {
                itemsToSelect.push({ type: 'folder', id: folderName });
            }
        });
    } else if (activeFolderTabName !== noFolderName) {
        itemsToSelect.push({ type: 'folder', id: activeFolderTabName });
    }

    selectionHook.setAllItems(itemsToSelect);
  }, [selectionHook, folderTabs, selectedTabIndex, memoizedPagesData, noFolderName]);

  const confirmDelete = useCallback(async (mode: 'delete_all' | 'only_folder' | 'delete_tasks_only') => {
    let finalTasks = [...tasks];
    let finalFolderOrder = [...folderOrder];
    const folderBeingDeleted = selectionHook.selectedItems.find(item => item.type === 'folder')?.id;
    const selectedTaskRootIds = new Set<string>();
    const selectedTaskInstances = new Map<string, Set<string>>();

    selectionHook.selectedItems.forEach(item => {
        if (item.type === 'task') {
            const parts = item.id.split('-');
            selectedTaskRootIds.add(parts[0]);
            if (parts.length > 1) {
                if (!selectedTaskInstances.has(parts[0])) {
                    selectedTaskInstances.set(parts[0], new Set());
                }
                selectedTaskInstances.get(parts[0])!.add(item.id);
            }
        }
    });

    if (mode === 'delete_all' && folderBeingDeleted) {
        finalTasks = tasks.filter(task => {
            const taskFolder = task.folder || noFolderName;
            if (taskFolder === folderBeingDeleted) return false;
            return !selectedTaskRootIds.has(task.id);
        });
        finalFolderOrder = folderOrder.filter(name => name !== folderBeingDeleted);
    } else if (mode === 'only_folder' && folderBeingDeleted) {
        finalTasks = tasks.map(task => {
            if ((task.folder || noFolderName) === folderBeingDeleted) {
                return { ...task, folder: undefined };
            }
            return task;
        });
        finalTasks = finalTasks.filter(task => {
            if (selectedTaskRootIds.has(task.id)) {
                if (task.deadlineDetails?.repeatFrequency && selectedTaskInstances.has(task.id)) {
                    return true;
                }
                return false;
            }
            return true;
        });
        finalFolderOrder = folderOrder.filter(name => name !== folderBeingDeleted);
    } else {
         finalTasks = tasks.filter(task => {
            if (selectedTaskRootIds.has(task.id)) {
                if (task.deadlineDetails?.repeatFrequency && selectedTaskInstances.has(task.id) && (selectedTaskInstances.get(task.id)?.size || 0) > 0) {
                    return true;
                }
                return false;
            }
            return true;
         });
    }

    finalTasks = finalTasks.map(task => {
        if (task.deadlineDetails?.repeatFrequency && selectedTaskInstances.has(task.id) && task.completedInstanceDates) {
            const instancesToDeleteForThisTask = selectedTaskInstances.get(task.id)!;
            const datesToDelete = new Set<string>();
            instancesToDeleteForThisTask.forEach(instanceKeyId => {
                const datePart = instanceKeyId.substring(task.id.length + 1);
                datesToDelete.add(datePart);
            });

            if (datesToDelete.size > 0) {
                const newCompletedDates = task.completedInstanceDates.filter(date => !datesToDelete.has(date));
                return { ...task, completedInstanceDates: newCompletedDates };
            }
        }
        return task;
    });


    setTasks(finalTasks);
    const folderOrderActuallyChanged = JSON.stringify(folderOrder) !== JSON.stringify(finalFolderOrder);
    if (folderOrderActuallyChanged) {
      setFolderOrder(finalFolderOrder);
    }

    const savePromises = [saveTasksToStorage(finalTasks)];
    if (folderOrderActuallyChanged) {
      savePromises.push(saveFolderOrderToStorage(finalFolderOrder));
    }
    await Promise.all(savePromises);

    selectionHook.clearSelection();
  }, [tasks, folderOrder, selectionHook, noFolderName]);

  const handleDeleteSelected = useCallback(() => {
    const folderToDelete = selectionHook.selectedItems.find(item => item.type === 'folder');
    const selectedTasksCount = selectionHook.selectedItems.filter(i => i.type === 'task').length;

    if (folderToDelete && folderToDelete.id !== noFolderName) {
        let title = t('task_list.delete_folder_title', { folderName: folderToDelete.id });
        if (selectedTasksCount > 0) {
            title = t('task_list.delete_folder_and_selected_tasks_title', {folderName: folderToDelete.id, count: selectedTasksCount});
        }

        Alert.alert(
            title,
            t('task_list.delete_folder_confirmation'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('task_list.delete_folder_and_tasks'), onPress: () => confirmDelete('delete_all'), style: 'destructive' },
                { text: t('task_list.delete_folder_only'), onPress: () => confirmDelete('only_folder') }
            ],
            { cancelable: true }
        );
    } else if (selectedTasksCount > 0) {
         Alert.alert(
            t('task_list.delete_tasks_title', {count: selectedTasksCount}),
            t('task_list.delete_tasks_confirmation', {count: selectedTasksCount}),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.delete'), onPress: () => confirmDelete('delete_tasks_only'), style: 'destructive' }
            ],
            {cancelable: true}
        );
    }
  }, [selectionHook, noFolderName, t, confirmDelete]);

  const handleRenameFolderSubmit = useCallback(async (newName: string) => {
    if (!renameTarget || newName.trim() === renameTarget) {
      setRenameModalVisible(false);
      setRenameTarget(null);
      selectionHook.clearSelection();
      return;
    }
    const trimmedNewName = newName.trim();

    const newTasks = tasks.map(task => {
      if ((task.folder || noFolderName) === renameTarget) {
        return { ...task, folder: trimmedNewName === noFolderName ? undefined : trimmedNewName };
      }
      return task;
    });
    const newFolderOrder = folderOrder.map(name => (name === renameTarget ? trimmedNewName : name));

    setTasks(newTasks);
    setFolderOrder(newFolderOrder);

    await Promise.all([
        saveTasksToStorage(newTasks),
        saveFolderOrderToStorage(newFolderOrder)
    ]);
    
    const oldSelectedFolderTabName = selectedFolderTabName;

    setRenameModalVisible(false);
    setRenameTarget(null);
    selectionHook.clearSelection();

    if (oldSelectedFolderTabName === renameTarget) {
        setSelectedFolderTabName(trimmedNewName);
    }
  }, [tasks, folderOrder, renameTarget, noFolderName, selectionHook, selectedFolderTabName]);

  const handleReorderSelectedFolder = useCallback(() => {
    if (selectionHook.selectedItems.length === 1 && selectionHook.selectedItems[0].type === 'folder' && selectionHook.selectedItems[0].id !== noFolderName) {
      setIsReordering(true);
      setDraggingFolder(selectionHook.selectedItems[0].id);
      selectionHook.clearSelection();
    }
  }, [selectionHook, noFolderName]);

  const openRenameModalForSelectedFolder = useCallback(() => {
    if (selectionHook.selectedItems.length === 1 && selectionHook.selectedItems[0].type === 'folder' && selectionHook.selectedItems[0].id !== noFolderName) {
      setRenameTarget(selectionHook.selectedItems[0].id);
      setRenameModalVisible(true);
    }
  }, [selectionHook, noFolderName]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const rawTasksData = await AsyncStorage.getItem(STORAGE_KEY);
      setTasks(rawTasksData ? JSON.parse(rawTasksData) : []);

      const rawOrderData = await AsyncStorage.getItem(FOLDER_ORDER_KEY);
      setFolderOrder(rawOrderData ? JSON.parse(rawOrderData) : []);
    } catch (e) {
      console.error('Failed to refresh data from AsyncStorage:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    tasks, folderOrder, loading, activeTab, selectedFolderTabName, sortMode, sortModalVisible,
    isReordering, draggingFolder, renameModalVisible, renameTarget,
    selectionAnim, folderTabLayouts, selectedTabIndex, // ★ currentContentPage の代わりに selectedTabIndex を返す
    pageScrollPosition,
    noFolderName, folderTabs,
    pagerRef, folderTabsScrollViewRef,
    isSelecting: selectionHook.isSelecting,
    selectedItems: selectionHook.selectedItems,
    isRefreshing,
    memoizedPagesData,
    setActiveTab, setSelectedFolderTabName, setSortMode, setSortModalVisible,
    setIsReordering, setDraggingFolder, setRenameModalVisible, setRenameTarget,
    setFolderTabLayouts,
    toggleTaskDone,
    moveFolderOrder, stopReordering,
    onLongPressSelectItem, cancelSelectionMode,
    handleFolderTabPress, handlePageSelected, handlePageScroll,
    handleSelectAll, handleDeleteSelected, confirmDelete,

    handleRenameFolderSubmit, handleReorderSelectedFolder, openRenameModalForSelectedFolder,
    handleRefresh,
    router, t,
  };
};