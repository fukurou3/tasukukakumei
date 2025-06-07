// app/(tabs)/drafts.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '@/components/ConfirmModal';

const DRAFTS_KEY = 'TASK_DRAFTS';

type Draft = {
  id: string;
  title: string;
  memo: string;
  deadline: string;
  imageUris: string[];
  notifyEnabled: boolean;
  customUnit: 'minutes' | 'hours' | 'days';
  customAmount: number;
};

type DraftListStyles = {
  container: ViewStyle;
  appBar: ViewStyle;
  appBarTitle: TextStyle;
  draftItem: ViewStyle;
  draftTitle: TextStyle;
  draftDeadline: TextStyle;
  noDraftsText: TextStyle;
};

const createStyles = (isDark: boolean, subColor: string) =>
  StyleSheet.create<DraftListStyles>({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    appBar: {
      height: 56,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    appBarTitle: {
      fontSize: 25,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    draftItem: {
      backgroundColor: isDark ? '#1e1e1e' : '#f4f4f4',
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 10,
    },
    draftTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    draftDeadline: {
      fontSize: 14,
      color: isDark ? '#bbb' : '#555',
      marginTop: 4,
    },
    noDraftsText: {
      textAlign: 'center',
      fontSize: 18,
      color: isDark ? '#aaa' : '#555',
      marginTop: 40,
    },
  });
  export default function DraftsScreen() {
    const router = useRouter();
    const { colorScheme, subColor } = useAppTheme();
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark, subColor);
    const { t } = useTranslation();
  
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
    const loadDrafts = useCallback(async () => {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem(DRAFTS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        setDrafts(parsed);
      } catch (error) {
        console.error('Failed to load drafts', error);
      } finally {
        setLoading(false);
      }
    }, []);
  
    const requestDeleteDraft = useCallback((id: string) => {
      setPendingDeleteId(id);
    }, []);

    const confirmDeleteDraft = useCallback(async () => {
      if (!pendingDeleteId) return;
      try {
        const updated = drafts.filter((draft) => draft.id !== pendingDeleteId);
        await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
        setDrafts(updated);
      } catch (error) {
        console.error('Failed to delete draft', error);
      } finally {
        setPendingDeleteId(null);
      }
    }, [drafts, pendingDeleteId]);

    const cancelDeleteDraft = () => {
      setPendingDeleteId(null);
    };
  
    useEffect(() => {
      loadDrafts();
    }, [loadDrafts]);
  
    const renderItem = ({ item }: { item: Draft }) => (
      <TouchableOpacity
        style={styles.draftItem}
        onPress={() => router.push({ pathname: '/add_edit/edit-draft', params: { draftId: item.id } })}
        onLongPress={() => requestDeleteDraft(item.id)}
      >
        <Text style={styles.draftTitle}>{item.title}</Text>
        <Text style={styles.draftDeadline}>
          {new Date(item.deadline).toLocaleDateString()} {new Date(item.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
    );
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>{t('draft_list.title')}</Text>
        </View>
  
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color={subColor} />
        ) : drafts.length === 0 ? (
          <Text style={styles.noDraftsText}>{t('draft_list.no_drafts')}</Text>
        ) : (
          <FlatList
            data={drafts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
        <ConfirmModal
          visible={pendingDeleteId !== null}
          title={t('draft_list.delete_confirm_title')}
          message={t('draft_list.delete_confirm_message')}
          okText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={confirmDeleteDraft}
          onCancel={cancelDeleteDraft}
          isOkDestructive
        />
      </SafeAreaView>
    );
  }
  