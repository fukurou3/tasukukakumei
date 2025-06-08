import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import WheelPicker from 'react-native-wheely';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  onChangeHours: (val: number) => void;
  onChangeMinutes: (val: number) => void;
  onChangeSeconds: (val: number) => void;
  onConfirm: () => void;
}

const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => `${i}`);
const MINUTE_SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => `${i}`);

export default function DurationPickerModal({
  visible,
  hours,
  minutes,
  seconds,
  onChangeHours,
  onChangeMinutes,
  onChangeSeconds,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <WheelPicker options={HOURS_OPTIONS} selectedIndex={hours} onChange={onChangeHours} itemHeight={40} visibleRest={1} />
        <Text style={styles.label}>{t('common.hours_label')}</Text>
        <WheelPicker options={MINUTE_SECOND_OPTIONS} selectedIndex={minutes} onChange={onChangeMinutes} itemHeight={40} visibleRest={1} />
        <Text style={styles.label}>{t('common.minutes_label')}</Text>
        <WheelPicker options={MINUTE_SECOND_OPTIONS} selectedIndex={seconds} onChange={onChangeSeconds} itemHeight={40} visibleRest={1} />
        <Text style={styles.label}>{t('common.seconds_label')}</Text>
      </View>
      <Pressable style={styles.button} onPress={onConfirm}>
        <Text style={styles.buttonText}>{t('growth.start_focus_mode')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  label: { marginHorizontal: 5, fontSize: 16 },
  button: { paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold' },
});
