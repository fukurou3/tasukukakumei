// app/features/add/components/DeadlineSettingModal/DeadlineModalHeader.tsx
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DeadlineSettings, DeadlineModalStyles } from './types';

interface DeadlineModalHeaderProps {
  settings: DeadlineSettings;
  styles: DeadlineModalStyles;
  activeTabIndex: number;
}

const DeadlineModalHeaderLogic: React.FC<DeadlineModalHeaderProps> = ({ settings, styles, activeTabIndex }) => {
  const { t } = useTranslation();

  const headerContent = useMemo(() => {
    return (
      <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
        {t('deadline_modal.title_display_no_deadline')}
      </Text>
    );
  }, [t, styles.headerText]);

  return (
    <View style={styles.headerContainer}>
      {headerContent}
    </View>
  );
};

export const DeadlineModalHeader = React.memo(DeadlineModalHeaderLogic);