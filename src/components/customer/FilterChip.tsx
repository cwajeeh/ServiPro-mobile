import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

export function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText style={[styles.label, isActive && styles.activeLabel]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    backgroundColor: '#F1F5F9', // Light gray background
    marginRight: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
  },
  activeContainer: {
    backgroundColor: '#FFE5CC', // Pale orange background (matching design)
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#F97316', // Orange text
  },
});
