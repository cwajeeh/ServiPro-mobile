import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AuthPalette, Spacing } from '@/constants/theme';

const { NAVY, GRAY } = AuthPalette;

interface JobFilterSectionProps {
  filters: string[];
  activeFilter: string | null;
  onFilterPress: (filter: string) => void;
  title?: string;
}

export function JobFilterSection({
  filters,
  activeFilter,
  onFilterPress,
  title = 'Jobs',
}: JobFilterSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isActive = activeFilter === item;
          return (
            <Pressable
              onPress={() => onFilterPress(item)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item}
              </Text>
              {isActive && (
                <View style={styles.iconWrap}>
                  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#000' : GRAY} strokeWidth="3">
                    <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.four,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: NAVY,
    marginRight: Spacing.four,
    paddingLeft: Spacing.four,
  },
  listContent: {
    paddingRight: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    minHeight: 44,
  },
  chipActive: {
    backgroundColor: '#FFE8D1',
  },
  chipInactive: {
    backgroundColor: '#F3F3F3',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B4D61',
  },
  labelActive: {
    color: '#3B4D61',
    marginRight: 6,
  },
  iconWrap: {
    marginTop: 1,
  },
});
