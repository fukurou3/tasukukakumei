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
  onClose: () => void;
  textColor: string;
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
  onClose,
  textColor,
}: Props) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
        <View style={styles.row}>
          <WheelPicker
            options={HOURS_OPTIONS}
            selectedIndex={hours}
            onChange={onChangeHours}
            itemHeight={40}
            visibleRest={1}
            itemTextStyle={{ color: textColor }}
          />
          <Text style={[styles.label, { color: textColor }]}>{t('common.hours_label')}</Text>
          <WheelPicker
            options={MINUTE_SECOND_OPTIONS}
            selectedIndex={minutes}
            onChange={onChangeMinutes}
            itemHeight={40}
            visibleRest={1}
            itemTextStyle={{ color: textColor }}
          />
          <Text style={[styles.label, { color: textColor }]}>{t('common.minutes_label')}</Text>
          <WheelPicker
            options={MINUTE_SECOND_OPTIONS}
            selectedIndex={seconds}
            onChange={onChangeSeconds}
            itemHeight={40}
            visibleRest={1}
            itemTextStyle={{ color: textColor }}
          />
          <Text style={[styles.label, { color: textColor }]}>{t('common.seconds_label')}</Text>
        </View>
        <Pressable style={styles.button} onPress={onConfirm}>
          <Text style={[styles.buttonText, { color: textColor }]}>{t('growth.start_focus_mode')}</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { padding: 0, backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  label: { marginHorizontal: 5, fontSize: 16 },
  button: { paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});
