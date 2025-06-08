// features/growth/hooks/useGrowth.ts
import { useState, useEffect, useCallback, useMemo } from 'react'; // useMemoを追加
import { getItem, setItem } from '@/lib/Storage';
import { THEMES, GROWTH_THRESHOLDS, getGrowthStage, GROWTH_POINTS_PER_TASK_COMPLETION, GROWTH_POINTS_PER_FOCUS_MINUTE } from '../themes';
import { GrowthStage, Theme, UserThemeProgress } from '../themes/types'; // types.tsからUserThemeProgressをインポート
import TasksDatabase from '@/lib/TaskDatabase';
import { Task } from '@/features/add/types';
import { useFocusEffect } from 'expo-router';

const USER_THEME_PROGRESS_KEY = 'USER_THEME_PROGRESS';
const SELECTED_THEME_ID_KEY = 'SELECTED_THEME_ID';

export const useGrowth = () => {
  const [userProgress, setUserProgress] = useState<UserThemeProgress[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(THEMES[0]?.id || null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]); // タスクデータを保持

  // 初期ロード
  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      try {
        const storedProgress = await getItem(USER_THEME_PROGRESS_KEY);
        if (storedProgress) {
          setUserProgress(JSON.parse(storedProgress));
        } else {
          // 初期テーマのプログレスを生成
          const initialProgress: UserThemeProgress = {
            themeId: THEMES[0].id,
            totalGrowthPoints: 0,
            currentGrowthStage: 'seed',
          };
          setUserProgress([initialProgress]);
          await setItem(USER_THEME_PROGRESS_KEY, JSON.stringify([initialProgress]));
        }

        const storedSelectedThemeId = await getItem(SELECTED_THEME_ID_KEY);
        if (storedSelectedThemeId && THEMES.some(t => t.id === storedSelectedThemeId)) {
          setSelectedThemeId(storedSelectedThemeId);
        } else if (THEMES.length > 0) {
          setSelectedThemeId(THEMES[0].id);
          await setItem(SELECTED_THEME_ID_KEY, THEMES[0].id);
        }

        // 全タスクをロードして、成長ポイントを再計算
        await TasksDatabase.initialize(); //
        const rawTasks = await TasksDatabase.getAllTasks(); //
        setTasks(rawTasks.map(t => JSON.parse(t)));
        
      } catch (e) {
        console.error("Failed to load growth data or tasks:", e);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  // タスクが更新されたら成長ポイントを再計算
  useEffect(() => {
    if (tasks.length > 0 || userProgress.length > 0) {
      updateGrowthPointsBasedOnTasks();
    }
  }, [tasks]);


  // 成長ポイントの更新ロジック
  const updateGrowthPointsBasedOnTasks = useCallback(async () => {
    // 実際には、完了したタスクの数や集中モードの利用時間などをTasksDatabaseから取得し、成長ポイントに換算する
    // 例として、ここでは単にダミーのポイントを追加する
    const completedTasksCount = tasks.filter(task => task.completedAt).length; // 完了したタスクの数
    // 集中モードの利用時間は別途状態管理が必要です

    setUserProgress(prevProgress => {
      const newProgress = [...prevProgress];
      let found = false;

      for (let i = 0; i < newProgress.length; i++) {
        if (newProgress[i].themeId === selectedThemeId) {
          const newPoints = completedTasksCount * GROWTH_POINTS_PER_TASK_COMPLETION; // 仮の計算
          const newStage = getGrowthStage(newPoints);
          
          if (newProgress[i].totalGrowthPoints !== newPoints || newProgress[i].currentGrowthStage !== newStage) {
             newProgress[i] = {
                ...newProgress[i],
                totalGrowthPoints: newPoints,
                currentGrowthStage: newStage,
             };
             console.log(`Theme ${newProgress[i].themeId} grew to ${newStage} with ${newPoints} points.`);
          }
          found = true;
          break;
        }
      }
      if (!found && selectedThemeId) { // 新しいテーマが選択されたがプログレスがない場合
        const newPoints = completedTasksCount * GROWTH_POINTS_PER_TASK_COMPLETION;
        const newStage = getGrowthStage(newPoints);
        newProgress.push({
            themeId: selectedThemeId,
            totalGrowthPoints: newPoints,
            currentGrowthStage: newStage,
        });
      }
      
      setItem(USER_THEME_PROGRESS_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, [tasks, selectedThemeId]);

  const addGrowthPoints = useCallback(async (themeId: string, points: number) => {
    setUserProgress(prevProgress => {
      const newProgress = [...prevProgress];
      let updated = false;
      for (let i = 0; i < newProgress.length; i++) {
        if (newProgress[i].themeId === themeId) {
          const newTotalPoints = newProgress[i].totalGrowthPoints + points;
          const newStage = getGrowthStage(newTotalPoints);
          newProgress[i] = {
            ...newProgress[i],
            totalGrowthPoints: newTotalPoints,
            currentGrowthStage: newStage,
          };
          updated = true;
          break;
        }
      }
      if (!updated) {
        const newTotalPoints = points;
        const newStage = getGrowthStage(newTotalPoints);
        newProgress.push({
          themeId: themeId,
          totalGrowthPoints: newTotalPoints,
          currentGrowthStage: newStage,
        });
      }
      setItem(USER_THEME_PROGRESS_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  const changeSelectedTheme = useCallback(async (themeId: string) => {
    if (THEMES.find(t => t.id === themeId)?.locked) {
      // ロックされているテーマは選択できない
      console.log(`Theme ${themeId} is locked.`);
      return;
    }
    setSelectedThemeId(themeId);
    await setItem(SELECTED_THEME_ID_KEY, themeId);

    // 新しいテーマが選択された場合、そのテーマの進行状況がなければ初期化
    setUserProgress(prevProgress => {
        if (!prevProgress.some(p => p.themeId === themeId)) {
            const newProgress = {
                themeId: themeId,
                totalGrowthPoints: 0,
                currentGrowthStage: 'seed' as GrowthStage,
            };
            const updatedProgress = [...prevProgress, newProgress];
            setItem(USER_THEME_PROGRESS_KEY, JSON.stringify(updatedProgress));
            return updatedProgress;
        }
        return prevProgress;
    });
  }, []);

  const currentTheme = useMemo(() => {
    return THEMES.find(t => t.id === selectedThemeId) || THEMES[0];
  }, [selectedThemeId]);

  const currentThemeProgress = useMemo(() => {
    return userProgress.find(p => p.themeId === selectedThemeId) || {
      themeId: selectedThemeId || (THEMES[0]?.id || 'default'), // fallback for safety
      totalGrowthPoints: 0,
      currentGrowthStage: 'seed',
    };
  }, [userProgress, selectedThemeId]);

  const currentThemeAsset = useMemo(() => {
    return currentTheme.growthStages[currentThemeProgress.currentGrowthStage] || currentTheme.growthStages.seed;
  }, [currentTheme, currentThemeProgress.currentGrowthStage]);

  return {
    loading,
    themes: THEMES,
    selectedThemeId,
    changeSelectedTheme,
    currentTheme,
    currentThemeProgress,
    currentThemeAsset,
    addGrowthPoints,
    // タスクの更新をトリガーするために、reloadTasksを提供
    reloadTasks: async () => {
      await TasksDatabase.initialize(); //
      const rawTasks = await TasksDatabase.getAllTasks(); //
      setTasks(rawTasks.map(t => JSON.parse(t)));
    },
  };
};