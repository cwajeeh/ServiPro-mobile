import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'react-native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchServiceCategories } from '@/api/services';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { isRemoteMediaReference, resolveMediaUrl } from '@/utils/mediaUrl';

const { NAVY, PRIMARY_TEXT, BORDER, MAIN_BLUE } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'TaskerCategorySelect'>;

function CategoryIcon({ icon, name }: { icon: string; name: string }) {
  if (isRemoteMediaReference(icon)) {
    const uri = resolveMediaUrl(icon);
    if (uri) {
      return (
        <Image
          source={{ uri }}
          style={styles.iconImage}
          accessibilityLabel={name}
          resizeMode="contain"
        />
      );
    }
  }
  return (
    <Text style={styles.icon} accessibilityLabel="">
      {icon}
    </Text>
  );
}

export function TaskerCategorySelectScreen({ navigation }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories,
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>Select Service Category</Text>

          {isLoading && categories.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={MAIN_BLUE} />
            </View>
          ) : isError ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Could not load categories.</Text>
              <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
                <Text style={styles.retryBtnText}>Try again</Text>
              </Pressable>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>No categories available.</Text>
              <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
                <Text style={styles.retryBtnText}>Refresh</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(i) => i.id}
              numColumns={3}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.rowWrapper}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />
              }
              renderItem={({ item }) => {
                const isActive = selectedId === item.id;
                return (
                  <Pressable
                    style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                    onPress={() => setSelectedId(item.id)}>
                    <CategoryIcon icon={item.icon} name={item.name} />
                    <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              }}
            />
          )}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              !selectedId && styles.primaryBtnDisabled,
              pressed && selectedId && styles.primaryBtnPressed,
            ]}
            disabled={!selectedId || categories.length === 0}
            onPress={() => navigation.navigate('TaskerSubCategorySelect', { categoryId: selectedId! })}>
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
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: MAIN_BLUE,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PRIMARY_TEXT,
    marginBottom: Spacing.half,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: Spacing.four,
  },
  gridContent: {
    paddingBottom: Spacing.six,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
  },
  categoryCardActive: {
    borderColor: MAIN_BLUE,
    backgroundColor: '#F0F4FF', // Light tint matching NAVY mapped
  },
  icon: {
    fontSize: 28,
    marginBottom: Spacing.two,
  },
  categoryLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: PRIMARY_TEXT,
  },
  categoryLabelActive: {
    fontWeight: '600',
    color: MAIN_BLUE,
  },
  primaryBtn: {
    backgroundColor: NAVY,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
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
  iconImage: {
    width: 28,
    height: 28,
    marginBottom: Spacing.two,
  },
});
