import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

export function SectionHeader({ title, onViewAll, showViewAll = true }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <ThemedText style={styles.viewAll}>View All</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    marginVertical: Spacing.two,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: AuthPalette.NAVY,
  },
});
