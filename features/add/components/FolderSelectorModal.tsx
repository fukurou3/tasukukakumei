import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { AppModal } from '@/components/modals/AppModal';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontSizeContext } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => void;
  folders: string[];
};

export function FolderSelectorModal({
  visible,
  onClose,
  onSubmit,
  folders,
}: Props) {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { fontSizeKey } = useContext(FontSizeContext);
  const fontSize = fontSizes[fontSizeKey];
  const { t } = useTranslation();

  const [customName, setCustomName] = useState('');
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setSelected('');
      setCustomName('');
      setError('');
    }
  }, [visible]);

  const handleSave = () => {
    const finalName =
      selected === '__new__' ? customName.trim() : selected;
    if (selected === '__new__' && !finalName) {
      setError(t('task_list.rename_folder_placeholder'));
      return;
    }
    onSubmit(finalName);
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? '#333' : '#fff',
            padding: 20,
            borderRadius: 10,
            width: '100%',
          }}
        >
          <Text
            style={{
              color: subColor,
              fontSize,
              fontWeight: 'bold',
              marginBottom: 10,
            }}
          >
            {t('add_task.folder')}
          </Text>

          <ScrollView style={{ maxHeight: 200, marginBottom: 10 }}>
            {/* 未選択 */}
            <TouchableOpacity
              onPress={() => setSelected('')}
              style={{
                paddingVertical: 8,
                backgroundColor:
                  selected === ''
                    ? isDark
                      ? '#555'
                      : '#eee'
                    : 'transparent',
                borderRadius: 6,
                paddingHorizontal: 6,
              }}
            >
              <Text
                style={{
                  color: isDark ? '#fff' : '#000',
                  fontSize,
                }}
              >
                ・{t('add_task.no_folder')}
              </Text>
            </TouchableOpacity>

            {/* 新しいフォルダー */}
            {selected === '__new__' ? (
              <>
                <View
                  style={{
                    backgroundColor: isDark
                      ? '#555'
                      : '#eee',
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    marginBottom: 10,
                  }}
                >
                  <TextInput
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder={t(
                      'task_list.rename_folder_placeholder'
                    )}
                    placeholderTextColor={
                      isDark ? '#aaa' : '#666'
                    }
                    style={{
                      color: isDark
                        ? '#fff'
                        : '#000',
                      fontSize,
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                    }}
                    autoFocus
                  />
                </View>
                {!!error && (
                  <Text
                    style={{
                      color: 'red',
                      marginBottom: 10,
                      fontSize,
                    }}
                  >
                    {error}
                  </Text>
                )}
              </>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  setSelected('__new__')
                }
                style={{
                  paddingVertical: 8,
                  backgroundColor: 'transparent',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    color: isDark
                      ? '#fff'
                      : '#000',
                    fontSize,
                  }}
                >
                  ・{t(
                    'add_task.create_new_folder'
                  )}
                </Text>
              </TouchableOpacity>
            )}

            {/* 使用中フォルダ一覧 */}
            {folders.map(name => (
              <TouchableOpacity
                key={name}
                onPress={() => setSelected(name)}
                style={{
                  paddingVertical: 8,
                  backgroundColor:
                    selected === name
                      ? isDark
                        ? '#555'
                        : '#eee'
                      : 'transparent',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    color: isDark
                      ? '#fff'
                      : '#000',
                    fontSize,
                  }}
                >
                  ・{name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ボタン */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: '#888',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize,
                }}
              >
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: subColor,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize,
                }}
              >
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppModal>
  );
}
