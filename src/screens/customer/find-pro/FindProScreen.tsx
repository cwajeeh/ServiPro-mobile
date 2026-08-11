import { FilterModal } from '@/components/customer/find-pro/FilterModal';
import { useInfiniteProviders } from '@/hooks/useProvider';
import type { CustomerTabParamList } from '@/navigation/types';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/customer/FilterChip';
import { TaskerCard } from '@/components/customer/TaskerCard';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';

const FILTERS = [
  { label: 'All', id: 'all' },
  { label: 'Available', id: 'available' },
  { label: 'Top Rated', id: 'top_rated' },
  { label: 'Near Me', id: 'near_me' },
];

export type FilterState = {
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export function FindProScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ minPrice: 16, maxPrice: 56 });
  const navigation = useNavigation<NativeStackNavigationProp<CustomerTabParamList>>();
  const isFiltered = !!(filters.categoryId || filters.subCategoryId || (filters.minPrice !== 16 || filters.maxPrice !== 56));

  const handleChipPress = (filterId: string) => {
    setActiveFilter(filterId);
    if (filterId === 'all') {
      setFilters({ minPrice: 16, maxPrice: 56 });
    }
    // Note: available and top_rated filters are currently disabled as they were removed from the API
  };

  const handleResetFilters = () => {
    setActiveFilter('all');
    setFilters({ minPrice: 16, maxPrice: 56 });
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProviders(20, filters);

  const providers = data?.pages.flatMap((page) => page.providers) || [];

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.chipsRow}>
        <ThemedText style={styles.sectionTitle}>Hire Pros</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              isActive={activeFilter === filter.id}
              onPress={() => handleChipPress(filter.id)}
            />
          ))}
        </ScrollView>
      </View>
      {isFiltered && (
        <TouchableOpacity style={styles.clearFiltersRow} onPress={handleResetFilters}>
          <ThemedText style={styles.clearFiltersText}>Clear Filters X</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View style={{ height: 100 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={AuthPalette.NAVY} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <ThemedText style={styles.emptyText}>No professionals found</ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerContainer}>
      <ThemedText style={styles.errorText}>Failed to load professionals</ThemedText>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <ThemedText style={styles.retryText}>Retry</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Curved Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeftRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <View>
                <ThemedText style={styles.headerTitle}>Find Pro</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Search Professionals Here</ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.filterIconButton} onPress={() => setFilterModalVisible(true)}>
              <Ionicons name="options-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {isLoading ? (
        <View style={[styles.root, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={AuthPalette.NAVY} />
        </View>
      ) : isError ? (
        renderError()
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item, index) => `provider-${item.id}-${index}`}
          renderItem={({ item: tasker }) => (
            <TaskerCard
              name={tasker.name}
              profession={tasker.category || 'Professional'}
              rating={tasker.avg_rating}
              location={tasker.address}
              pricePerHour={tasker.price_hourly}
              image={resolveMediaUrl(tasker.image) || 'https://i.pravatar.cc/300'}
              statusLabel="Hire Now"
              onPress={() => {
                navigation.navigate('CustomerProviderDetails', { providerId: tasker.id });
              }}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onEndReached={() => {
            if (hasNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setActiveFilter('Custom'); // Optional: show custom filter active
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: AuthPalette.NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: Spacing.four,
    zIndex: 1,
  },
  headerContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: -20, // Overlap the curved header slightly if needed, or just follow it
  },
  scrollContent: {
    paddingTop: 40, // Adjust for the negative margin/curvature
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: AuthPalette.NAVY,
    marginRight: Spacing.three,
  },
  listContainer: {
    paddingTop: Spacing.one,
  },
  centerContainer: {
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: Spacing.two,
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: AuthPalette.NAVY,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  footerLoader: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    marginBottom: 100,
  },
  headerWrapper: {
    marginBottom: Spacing.two,
  },
  clearFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
    marginTop: -Spacing.one,
    marginBottom: Spacing.one,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#007AFF', // Premium blue
    fontWeight: '500',
  },
});
