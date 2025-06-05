// app/features/tasks/TasksScreen.tsx
import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes as appFontSizes } from '@/constants/fontSizes';
import { createStyles } from '@/features/tasks/styles';
import { RenameFolderModal } from '@/features/tasks/components/RenameFolderModal';
import { useTasksScreenLogic, type SortMode } from './hooks/useTasksScreenLogic';
import { FolderTabsBar } from './components/FolderTabsBar';
import { TaskViewPager } from './components/TaskViewPager';
import { SelectionBottomBar } from './components/SelectionBottomBar';

export default function TasksScreen() {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = createStyles(isDark, subColor, fontSizeKey);

  const logic = useTasksScreenLogic();
  const {
    loading, activeTab, sortMode, sortModalVisible,
    isReordering,
    selectionAnim,
    folderTabLayouts, selectedTabIndex, // ★ currentContentPage の代わりに selectedTabIndex を使用
    pageScrollPosition,
    noFolderName, folderTabs,
    pagerRef, folderTabsScrollViewRef,
    isSelecting, selectedItems,
    setActiveTab, setSortMode, setSortModalVisible,
    setFolderTabLayouts,
    memoizedPagesData,
    handleFolderTabPress, handlePageSelected, handlePageScroll,
    handleSelectAll, handleDeleteSelected,
    handleRenameFolderSubmit, handleReorderSelectedFolder, openRenameModalForSelectedFolder,
    cancelSelectionMode,
    router, t,
    toggleTaskDone,
    draggingFolder, setDraggingFolder, moveFolderOrder, stopReordering,
    onLongPressSelectItem, folderOrder,
    renameModalVisible, renameTarget, setRenameModalVisible, setRenameTarget,
    tasks,
  } = logic;

  const handleSortOptionSelect = (newSortMode: SortMode) => {
    setSortMode(newSortMode);
    setSortModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.appBar}><Text style={styles.title}>{t('task_list.title')}</Text></View>

      <FolderTabsBar
        styles={styles}
        subColor={subColor}
        folderTabs={folderTabs}
        folderTabLayouts={folderTabLayouts}
        setFolderTabLayouts={setFolderTabLayouts}
        handleFolderTabPress={handleFolderTabPress}
        pageScrollPosition={pageScrollPosition}
        folderTabsScrollViewRef={folderTabsScrollViewRef}
      />

      <View style={styles.topRow}>
        <View style={styles.segmentedControlContainer}>
          <TouchableOpacity
            style={[ styles.segmentedControlButton, activeTab === 'incomplete' && styles.segmentedControlButtonSelected ]}
            onPress={() => { setActiveTab('incomplete'); cancelSelectionMode(); }}
            activeOpacity={0.7}
          >
            <Text style={[ styles.segmentedControlButtonText, activeTab === 'incomplete' && (isDark ? styles.segmentedControlButtonTextSelectedDark : styles.segmentedControlButtonTextSelectedLight) ]}>
              {t('tab.incomplete')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ styles.segmentedControlButton, activeTab === 'completed' && styles.segmentedControlButtonSelected ]}
            onPress={() => { setActiveTab('completed'); cancelSelectionMode(); }}
            activeOpacity={0.7}
          >
            <Text style={[ styles.segmentedControlButtonText, activeTab === 'completed' && (isDark ? styles.segmentedControlButtonTextSelectedDark : styles.segmentedControlButtonTextSelectedLight) ]}>
              {t('tab.completed')}
            </Text>
          </TouchableOpacity>
        </View>
        {!isSelecting && activeTab === 'incomplete' && (
          <TouchableOpacity style={styles.sortButton} onPress={() => setSortModalVisible(true)} activeOpacity={0.7}>
            <Text style={styles.sortLabel}>
              {sortMode === 'deadline' ? t('sort.date') : sortMode === 'custom' ? t('sort.custom') : t('sort.priority')}
            </Text>
            <Ionicons name="swap-vertical" size={22} color={subColor} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={subColor} />
      ) : (
        <TaskViewPager
          styles={styles}
          pagerRef={pagerRef}
          folderTabs={folderTabs}
          selectedTabIndex={selectedTabIndex} // ★ プロパティ名を変更
          handlePageSelected={handlePageSelected}
          handlePageScroll={handlePageScroll}
          activeTab={activeTab}
          toggleTaskDone={toggleTaskDone}
          isReordering={isReordering}
          draggingFolder={draggingFolder}
          setDraggingFolder={setDraggingFolder}
          moveFolderOrder={moveFolderOrder}
          stopReordering={stopReordering}
          isSelecting={isSelecting}
          selectedItems={selectedItems}
          onLongPressSelectItem={onLongPressSelectItem}
          noFolderName={noFolderName}
          t={t}
          memoizedPagesData={memoizedPagesData}
        />
      )}

      {!isSelecting && !isReordering && (
        <TouchableOpacity
          style={[styles.fab, { bottom: Platform.OS === 'ios' ? 16 : 16 }]}
          onPress={() => router.push('/add/')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      <SelectionBottomBar
        styles={styles}
        isSelecting={isSelecting}
        selectionAnimSharedValue={selectionAnim}
        selectedItems={selectedItems}
        subColor={subColor}
        noFolderName={noFolderName}
        folderOrder={folderOrder}
        selectedFolderTabName={logic.selectedFolderTabName}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        onRenameSelected={openRenameModalForSelectedFolder}
        onReorderSelected={handleReorderSelectedFolder}
        onCancelSelection={cancelSelectionMode}
        t={t}
      />

      <RenameFolderModal
        visible={renameModalVisible}
        onClose={() => { setRenameModalVisible(false); setRenameTarget(null); cancelSelectionMode(); }}
        initialName={renameTarget || ''}
        onSubmit={handleRenameFolderSubmit}
      />

      <Modal transparent visible={sortModalVisible} animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
        <BlurView intensity={isDark ? 20 : 70} tint={isDark ? 'dark' : 'light'} style={styles.modalBlur}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSortModalVisible(false)} />
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, {width: '80%', maxWidth: 300}]}>
                <Text style={styles.modalTitle}>{t('sort.title')}</Text>
              <TouchableOpacity onPress={() => handleSortOptionSelect('deadline')} activeOpacity={0.7}>
                <Text style={[styles.modalOption, {color: sortMode === 'deadline' ? subColor : (isDark ? '#E0E0E0' : '#222222'), fontWeight: sortMode === 'deadline' ? '600' : '400'}]}>
                  {t('sort.date')}
                </Text>
              </TouchableOpacity>
              <View style={{height: StyleSheet.hairlineWidth, backgroundColor: isDark? '#444': '#DDD'}}/>
              <TouchableOpacity onPress={() => handleSortOptionSelect('custom')} activeOpacity={0.7}>
                <Text style={[styles.modalOption, {color: sortMode === 'custom' ? subColor : (isDark ? '#E0E0E0' : '#222222'), fontWeight: sortMode === 'custom' ? '600' : '400'}]}>
                  {t('sort.custom')}
                </Text>
              </TouchableOpacity>
               <View style={{height: StyleSheet.hairlineWidth, backgroundColor: isDark? '#444': '#DDD'}}/>
              <TouchableOpacity onPress={() => handleSortOptionSelect('priority')} activeOpacity={0.7}>
                <Text style={[styles.modalOption, {color: sortMode === 'priority' ? subColor : (isDark ? '#E0E0E0' : '#222222'), fontWeight: sortMode === 'priority' ? '600' : '400'}]}>
                  {t('sort.priority')}
                </Text>
              </TouchableOpacity>
              <View style={{height: StyleSheet.hairlineWidth, backgroundColor: isDark? '#444': '#DDD', marginTop: 10, marginBottom: 0 }}/>
              <TouchableOpacity onPress={() => setSortModalVisible(false)} style={{ marginTop: 0 }} activeOpacity={0.7}>
                <Text style={[styles.modalOption, {color: isDark ? '#CCCCCC' : '#555555', fontSize: appFontSizes[fontSizeKey]}]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}