// app/features/tasks/components/TaskFolder.tsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'; // FlatListは前回導入済みのはず
import { Ionicons } from '@expo/vector-icons';
import { DisplayableTaskItem } from '../types';
import { TaskItem } from './TaskItem';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext, FontSizeKey } from '@/context/FontSizeContext';
import { createStyles } from '../styles';
import { fontSizes } from '@/constants/fontSizes';


export interface Props {
  folderName: string;
  tasks: DisplayableTaskItem[];
  // isCollapsed: boolean; // ← 削除
  // toggleFolder: (name: string) => void; // ← 削除
  onToggleTaskDone: (id: string, instanceDate?: string) => void;
  // onRefreshTasks?: () => void; // ViewPagerから渡されなくなった場合、またはFlatListが持つ場合
  isReordering: boolean;
  setDraggingFolder: (name: string | null) => void;
  draggingFolder: string | null;
  moveFolder: (folderName: string, direction: 'up' | 'down') => void;
  stopReordering: () => void;
  isSelecting: boolean;
  selectedIds: string[];
  onLongPressSelect: (type: 'task' | 'folder', id: string) => void;
  currentTab: 'incomplete' | 'completed';
}

export const TaskFolder: React.FC<Props> = ({
  folderName,
  tasks,
  // isCollapsed, // ← 削除
  // toggleFolder, // ← 削除
  onToggleTaskDone,
  // onRefreshTasks,
  isReordering,
  setDraggingFolder,
  draggingFolder,
  moveFolder,
  stopReordering,
  isSelecting,
  selectedIds,
  onLongPressSelect,
  currentTab,
}) => {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const styles = createStyles(isDark, subColor, fontSizeKey);
  const { t } = useTranslation();
  const baseFontSize = fontSizes[fontSizeKey];

  const isFolderSelected = isSelecting && selectedIds.includes(folderName);

  const handleLongPress = () => {
    if (folderName) {
        onLongPressSelect('folder', folderName);
    }
  };

  const handlePressFolder = () => {
    if (isSelecting && folderName) {
        onLongPressSelect('folder', folderName);
    } else {
        // toggleFolder(folderName); // ← 呼び出しを削除 (何もしないか、別の動作を割り当てる)
        // 例えば、選択モードでなければ何もしない、など。
        // このテストでは、フォルダヘッダータップで開閉しなくなることを意図しています。
    }
  };

  const renderTaskItem = ({ item, index }: { item: DisplayableTaskItem, index: number }) => (
    <TaskItem
      key={item.keyId}
      task={item}
      onToggle={onToggleTaskDone}
      isSelecting={isSelecting}
      selectedIds={selectedIds}
      onLongPressSelect={(id) => onLongPressSelect('task',id)}
      currentTab={currentTab}
      isInsideFolder={true}
      isLastItem={index === tasks.length - 1}
    />
  );

  return (
    <View style={styles.folderContainer}>
      {folderName && (
        <TouchableOpacity
          onPress={handlePressFolder}
          onLongPress={handleLongPress}
          delayLongPress={200}
          style={[
            styles.folderHeader,
            isFolderSelected && styles.folderHeaderSelected,
          ]}
          // disabled={!isSelecting} // 選択モードでない場合はタップ不要にするなら
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
             {isSelecting && (
                <Ionicons
                    name={isFolderSelected ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={subColor}
                    style={{ marginRight: 10 }}
                />
            )}
            {/* isCollapsed を参照しないように修正 */}
            {!isSelecting && folderName && (
                <Ionicons
                    name={"folder-open-outline"} // ← 常に開いているアイコン
                    size={20}
                    color={isDark ? '#E0E0E0' : '#333333'}
                    style={styles.folderIconStyle}
                />
            )}
            <Text style={styles.folderName} numberOfLines={1}>{folderName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* ... (並べ替えボタンのロジックは変更なし) ... */}
            {isReordering && draggingFolder !== folderName && folderName !== t('common.no_folder_name', 'フォルダなし') && (
              <>
                <TouchableOpacity onPress={() => moveFolder(folderName, 'up')} style={styles.reorderButton}>
                  <Ionicons name="arrow-up" size={20} color={subColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveFolder(folderName, 'down')} style={styles.reorderButton}>
                  <Ionicons name="arrow-down" size={20} color={subColor} />
                </TouchableOpacity>
              </>
            )}
             {isReordering && draggingFolder === folderName && folderName !== t('common.no_folder_name', 'フォルダなし') && (
                <TouchableOpacity onPress={stopReordering} style={styles.reorderButton}>
                  <Text style={{color: subColor}}>{t('common.done')}</Text>
                </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* isCollapsed の条件を削除し、tasks.length > 0 の場合のみ FlatList を表示 */}
      {tasks.length > 0 && (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.keyId}
          // ここに FlatList の他の props を追加できます
        />
      )}

      {/* isCollapsed の条件を削除 */}
      {tasks.length === 0 && folderName && (
         <View style={{ paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' }}>
             <Text style={{ color: isDark ? '#8E8E93' : '#6D6D72', fontSize: baseFontSize -1 }}>
                 {t('task_list.empty_folder', 'このフォルダーにはタスクがありません')}
             </Text>
         </View>
      )}
    </View>
  );
};