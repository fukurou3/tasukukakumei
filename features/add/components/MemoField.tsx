import React from 'react';
import {
  View,
  Text,
  TextInput,
  // NativeSyntheticEvent, // 不要になる
  // TextInputContentSizeChangeEventData, // 不要になる
} from 'react-native';
import type { FieldProps } from '../types';

// interface MemoFieldProps extends FieldProps { // 変更前
//   onContentSizeChange: ( // 変更前
//     e: NativeSyntheticEvent<TextInputContentSizeChangeEventData> // 変更前
//   ) => void; // 変更前
//   height: number; // 変更前
// } // 変更前

// MemoFieldProps は FieldProps をそのまま利用できるようになります
export const MemoField: React.FC<FieldProps> = ({ // 変更：Props型を変更し、不要なpropsを削除
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  // onContentSizeChange, // 不要になる
  // height, // 不要になる
  labelStyle,
  inputStyle,
}) => (
  <View>
    <Text style={labelStyle}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      multiline
      // onContentSizeChange={onContentSizeChange} // 削除
      // style={[inputStyle, { height }]} // 変更前
      style={inputStyle} // 変更：styleから動的なheight指定を削除
    />
  </View>
);