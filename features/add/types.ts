// app/features/add/types.ts
import { ViewStyle, TextStyle, ImageStyle, StyleProp } from 'react-native';
import type { DeadlineSettings } from './components/DeadlineSettingModal/types';

export interface Task {
  id: string;
  title: string;
  googleEventId?: string;
  memo: string;
  deadline: string | undefined; // UTC ISO8601 string or undefined
  imageUris: string[];
  notifyEnabled: boolean;
  customUnit: 'minutes' | 'hours' | 'days';
  customAmount: number;
  folder: string;
  deadlineDetails?: DeadlineSettings;
  completedInstanceDates?: string[];
  completedAt?: string; // For non-repeating tasks, UTC ISO8601 string
}

export type Draft = Task;

export type AddTaskStyles = {
  folderInput: ViewStyle;
  container: ViewStyle;
  appBar: ViewStyle;
  appBarTitle: TextStyle;
  draftsButton: ViewStyle;
  draftsButtonText: TextStyle;
  label: TextStyle;
  input: TextStyle;
  pickerButton: ViewStyle;
  pickerButtonWithPreview: ViewStyle;
  addMoreButton: ViewStyle;
  addMoreButtonText: TextStyle;
  fieldWrapper: ViewStyle;
  datetimeRow: ViewStyle;
  datetimeText: TextStyle;
  dateWrapper: ViewStyle;
  timeWrapper: ViewStyle;
  notifyContainer: ViewStyle;
  notifyHeader: ViewStyle;
  notifyLabel: TextStyle;
  toggleContainer: ViewStyle;
  toggleCircle: ViewStyle;
  guideText: TextStyle;
  slotPickerRow: ViewStyle;
  slotPickerWrapper: ViewStyle;
  slotPicker: TextStyle;
  photoPreviewContainer: ViewStyle;
  photoPreviewItem: ViewStyle;
  photoPreviewImage: ImageStyle;
  removeIcon: ViewStyle;
  buttonRow: ViewStyle;
  saveButton: ViewStyle;
  saveButtonText: TextStyle;
  draftButton: ViewStyle;
};

export interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  placeholderTextColor: string;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
}