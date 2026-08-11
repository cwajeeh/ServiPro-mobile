import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { fetchServiceSubcategories } from '@/api/services';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { NAVY, PRIMARY_TEXT, BORDER, MAIN_BLUE } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'TaskerSubCategorySelect'>;

export function TaskerSubCategorySelectScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    data: subcategories = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['serviceSubcategories', categoryId],
    queryFn: () => fetchServiceSubcategories(categoryId),
    enabled: Boolean(categoryId),
  });

  const toggleSub = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>Select Service Sub Category</Text>

          {isLoading && subcategories.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={MAIN_BLUE} />
            </View>
          ) : isError ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Could not load subcategories.</Text>
              <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
                <Text style={styles.retryBtnText}>Try again</Text>
              </Pressable>
            </View>
          ) : subcategories.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>No subcategories for this category.</Text>
              <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
                <Text style={styles.retryBtnText}>Refresh</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollFlex}
              refreshControl={
                <RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />
              }>
              <View style={styles.chipsContainer}>
                {subcategories.map((sub) => {
                  const isActive = selectedIds.includes(sub.id);
                  return (
                    <Pressable
                      key={sub.id}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => toggleSub(sub.id)}>
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{sub.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              selectedIds.length === 0 && styles.primaryBtnDisabled,
              pressed && selectedIds.length > 0 && styles.primaryBtnPressed,
            ]}
            disabled={selectedIds.length === 0 || subcategories.length === 0}
            onPress={() => navigation.navigate('TaskerSkillsAndRate')}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1, zIndex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.four,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: MAIN_BLUE },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  title: { fontSize: 24, fontWeight: '700', color: PRIMARY_TEXT, marginBottom: Spacing.half },
  subtitle: { fontSize: 16, color: '#4A4A4A', marginBottom: Spacing.four },
  scrollFlex: { paddingBottom: Spacing.six, flexGrow: 1 },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipActive: {
    backgroundColor: '#F0F4FF',
    borderColor: MAIN_BLUE,
  },
  chipText: {
    fontSize: 14,
    color: '#666666',
  },
  chipTextActive: {
    color: MAIN_BLUE,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: NAVY,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.six,
    marginTop: Spacing.two,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.six,
    minHeight: 200,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  retryBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    backgroundColor: NAVY,
    borderRadius: Spacing.two,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
