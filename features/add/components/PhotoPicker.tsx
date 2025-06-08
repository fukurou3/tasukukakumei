import React, { useState, useEffect, useCallback, useRef } from 'react'; // useRef を追加
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';

type Photo = { id: string; uri: string };

export interface PhotoPickerProps {
  visible: boolean;
  defaultSelected: string[];
  onCancel: () => void;
  onDone: (uris: string[]) => void;
}

const ITEMS_PER_PAGE = 30;

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  visible,
  defaultSelected,
  onCancel,
  onDone,
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [granted, setGranted] = useState<boolean | null>(null);
  const [after, setAfter] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);
  const isExpoGo = Constants.appOwnership === 'expo';

  // isMounted のような役割で、アンマウント後の setState を防ぐ (モーダル非表示時)
  const isComponentMounted = useRef(false);

  // --- 1. モーダル表示/非表示時の初期化 ---
  useEffect(() => {
    if (visible) {
      isComponentMounted.current = true;
      console.log('[EFFECT] Modal visible: Initializing states.');
      setSelected(defaultSelected || []);
      setPhotos([]);
      setAfter(undefined);
      setHasNextPage(true);
      setIsLoading(false);
      setGranted(null); // 権限状態を未確認に戻し、再確認を促す
    } else {
      console.log('[EFFECT] Modal hidden: Cleaning up.');
      isComponentMounted.current = false;
      // 必要であれば、ここでさらにクリーンアップ処理
    }
    return () => { // クリーンアップ関数
      isComponentMounted.current = false;
    };
  }, [visible, defaultSelected]);

  // --- 2. 権限確認 ---
  // onCancel は依存不要なので警告を抑制
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (visible && granted === null && isComponentMounted.current) {
      if (isExpoGo) {
        Alert.alert(
          '開発ビルドが必要です',
          'Expo Go ではメディアライブラリへのフルアクセスが利用できません。'
        );
        setGranted(false);
        setIsLoading(false);
        return;
      }

      console.log('[EFFECT] Visible and permission not determined: Checking permissions.');
      setIsLoading(true); // 権限確認中もローディング表示
      (async () => {
        try {
          let currentPermissions = await MediaLibrary.getPermissionsAsync(false);
          console.log('Initial permissions:', currentPermissions.status);

          if (currentPermissions.status !== 'granted') {
            currentPermissions = await MediaLibrary.requestPermissionsAsync(false);
            console.log('Requested permissions:', currentPermissions.status);
          }

          if (isComponentMounted.current) {
            if (currentPermissions.status === 'granted') {
              console.log('Permission granted.');
              setGranted(true);
            } else {
              console.log('Permission denied.');
              setGranted(false);
              Alert.alert(
                '権限が必要です',
                '写真や動画にアクセスするためには許可が必要です。設定画面から許可してください。',
                [
                  { text: 'キャンセル', onPress: onCancel, style: 'cancel' },
                  { text: '設定を開く', onPress: () => Linking.openSettings().finally(onCancel) }
                ]
              );
            }
          }
        } catch (error) {
          console.error("Error during permission check:", error);
          if (isComponentMounted.current) setGranted(false); // エラー時も拒否扱い
        } finally {
          if (isComponentMounted.current) setIsLoading(false); // 権限確認が完了したらローディング解除
        }
      })();
    }
  }, [visible, granted]);

  // --- 3. メディア読み込み関数 ---
  const loadMedia = useCallback(async (isLoadingMore = false) => {
    if (!isComponentMounted.current) {
      console.log('loadMedia: Component not mounted, aborting.');
      return;
    }
    if (isLoading) {
      console.log('loadMedia: Already loading, aborting.');
      return;
    }
    if (isLoadingMore && !hasNextPage) {
      console.log('loadMedia: No more pages for loading more, aborting.');
      return;
    }
    if (granted !== true) {
      console.log('loadMedia: Permission not granted, aborting.');
      return;
    }

    console.log(`loadMedia: Starting. isLoadingMore: ${isLoadingMore}`);
    setIsLoading(true);

    // 初回ロードの場合、photos と after はリセットされているはず
    // (useEffect [visible, defaultSelected] で対応)

    try {
      const currentAfter = isLoadingMore ? after : undefined;
      console.log(`Workspaceing media with after: ${currentAfter}`);
      const { assets, endCursor, hasNextPage: newHasNextPage } = await MediaLibrary.getAssetsAsync({
        first: ITEMS_PER_PAGE,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
        after: currentAfter,
      });
      console.log(`Workspaceed ${assets.length} assets. Has next page: ${newHasNextPage}`);

      if (isComponentMounted.current) {
        const newPhotos = assets.map(asset => ({ id: asset.id, uri: asset.uri }));
        setPhotos(prevPhotos => isLoadingMore ? [...prevPhotos, ...newPhotos] : newPhotos);
        setAfter(endCursor);
        setHasNextPage(newHasNextPage);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      if (isComponentMounted.current) Alert.alert("エラー", "メディアの読み込みに失敗しました。");
    } finally {
      if (isComponentMounted.current) setIsLoading(false);
      console.log('loadMedia: Finished.');
    }
  }, [granted, after, hasNextPage, isLoading]); // isLoading を依存に含めることで、setIsLoading(false)後に再評価される

  // --- 4. 初回ロードのトリガー ---
  useEffect(() => {
    // モーダル表示中、権限許可済み、写真が0枚、次のページがある、かつ現在ロード中でない場合
    if (visible && granted === true && photos.length === 0 && hasNextPage && !isLoading && isComponentMounted.current) {
      console.log('[EFFECT] Conditions met for initial load: Calling loadMedia(false).');
      loadMedia(false);
    }
  }, [visible, granted, photos.length, hasNextPage, isLoading, loadMedia]);


  const handleSelect = (uri: string) => {
    setSelected(prev =>
      prev.includes(uri) ? prev.filter(item => item !== uri) : [...prev, uri]
    );
  };

  const handleDone = () => {
    onDone(selected);
  };

  const renderHeader = () => (
    <View style={localStyles.headerBar}>
      <TouchableOpacity onPress={onCancel}>
        <Text style={localStyles.headerBtn}>キャンセル</Text>
      </TouchableOpacity>
      <Text style={localStyles.headerTitle}>写真を選択</Text>
      <TouchableOpacity onPress={handleDone}>
        <Text style={[localStyles.headerBtn, localStyles.headerDone]}>完了</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    // 追加ロード中のみフッターのインジケータを表示
    if (isLoading && photos.length > 0) {
      return <ActivityIndicator style={{ marginVertical: 20 }} />;
    }
    return null;
  };

  if (!visible) return null;

  let content;
  if (granted === null || (isLoading && photos.length === 0)) { // 権限未確認 または 初回ロード中
    content = (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" />
        <Text>読み込み中...</Text>
      </View>
    );
  } else if (granted === false) {
    content = (
      <View style={localStyles.center}>
        <Text>メディアへのアクセス権限がありません。</Text>
        <TouchableOpacity onPress={() => Linking.openSettings()} style={{ marginTop: 10 }}>
          <Text style={{ color: 'blue' }}>設定を開く</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (photos.length === 0 && !hasNextPage) {
    content = (
      <View style={localStyles.center}>
        <Text>表示できる写真や動画がありません。</Text>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              width: Dimensions.get('window').width / 3 - 2,
              height: Dimensions.get('window').width / 3 - 2,
              margin: 1,
            }}
            onPress={() => handleSelect(item.uri)}
          >
            <Image
              source={{ uri: item.uri }}
              style={{ flex: 1, width: undefined, height: undefined, borderRadius: 4 }}
            />
            {selected.includes(item.uri) && (
              <>
                <View style={localStyles.overlay} />
                <View style={localStyles.checkCircle}>
                  <Text style={localStyles.checkIcon}>✓</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (granted === true && hasNextPage && !isLoading) {
            console.log('onEndReached: Calling loadMedia(true).');
            loadMedia(true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <SafeAreaView style={localStyles.container}>
        {renderHeader()}
        {content}
      </SafeAreaView>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerBtn: { fontSize: 17, color: '#007AFF' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerDone: { fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
  },
  checkCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
});

export default PhotoPicker;