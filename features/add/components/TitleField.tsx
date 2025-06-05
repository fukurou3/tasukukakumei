import React from 'react';
import { View, Text, TextInput } from 'react-native';
import type { FieldProps } from '../types';

export const TitleField: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
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
      style={inputStyle}
    />
  </View>
);
