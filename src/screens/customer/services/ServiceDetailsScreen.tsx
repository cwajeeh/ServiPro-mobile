import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchSubcategoryDetail } from '@/api/services';
import { PriceRangeSlider } from '@/components/customer/create-task/PriceRangeSlider';
import { TaskerCard } from '@/components/customer/TaskerCard';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { CustomerTabParamList } from '@/navigation/types';
import type { SubcategoryDetail, TaskerInfo } from '@/types/services';
import { logUnexpectedError } from '@/utils/devLog';

const { NAVY, PRIMARY_TEXT, MAIN_BLUE } = AuthPalette;

export function ServiceDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerServiceDetails'>>();
  const { subCategoryId, subCategoryName } = route.params;

  const [detail, setDetail] = useState<SubcategoryDetail | null>(null);
  const [taskers, setTaskers] = useState<TaskerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [rangeValues, setRangeValues] = useState({ low: 0, high: 500 });
  const [appliedFilters, setAppliedFilters] = useState({ min: undefined as number | undefined, max: undefined as number | undefined });

  const loadData = useCallback(async (min?: number, max?: number) => {
    setLoading(true);
    try {
      const data = await fetchSubcategoryDetail(subCategoryId, min, max);
      if (data) {
        setDetail(data.subcategory);
        setTaskers(data.taskers);
      }
    } catch (err) {
      logUnexpectedError('fetchSubcategoryDetail', err);
    } finally {
      setLoading(false);
    }
  }, [subCategoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilter = () => {
    setAppliedFilters({ min: rangeValues.low, max: rangeValues.high });
    loadData(rangeValues.low, rangeValues.high);
    setIsFilterVisible(false);
  };

  const handleResetFilter = () => {
    setRangeValues({ low: 0, high: 500 });
    setAppliedFilters({ min: undefined, max: undefined });
    loadData();
    setIsFilterVisible(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Curved Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{detail?.title || subCategoryName}</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>

      {loading && !detail ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Service Info Card */}
          <View style={styles.section}>
            {/* Description Section */}
            <View>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {detail?.description || `Professional ${subCategoryName} services available near you.`}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Category Tag */}
            <View>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{detail?.category || 'Services'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Budget */}
            <View>
              <Text style={styles.sectionTitle}>Job Budget</Text>
              <Text style={styles.budgetValue}>Starting From £{detail?.starting_price || 0}/hr</Text>
            </View>
          </View>

          {/* Pros Section Header */}
          <View style={styles.prosHeader}>
            <Text style={styles.prosTitle}>Available Professionals ({taskers.length})</Text>
            <TouchableOpacity
              style={[styles.filterButton, (appliedFilters.min !== undefined || appliedFilters.max !== undefined) && styles.filterButtonActive]}
              onPress={() => setIsFilterVisible(true)}
            >
              <Ionicons name="options-outline" size={20} color={appliedFilters.min !== undefined || appliedFilters.max !== undefined ? '#FFF' : NAVY} />
            </TouchableOpacity>
          </View>

          {/* Professionals List */}
          <View style={styles.prosList}>
            {loading && detail ? (
              <ActivityIndicator size="small" color={NAVY} style={{ marginVertical: 20 }} />
            ) : taskers.length > 0 ? (
              taskers.map((tasker, index) => (
                <TaskerCard
                  key={tasker.provider_id || `tasker-${index}`}
                  name={tasker.name}
                  profession={detail?.title || subCategoryName}
                  rating={tasker.rating}
                  location={tasker.address || 'Location not provided'}
                  pricePerHour={tasker.price_hourly}
                  image={tasker.profile_image || 'https://via.placeholder.com/150'}
                  onPress={() => { navigation.navigate('CustomerProviderDetails', { providerId: tasker.provider_id }) }}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No professionals found matching your criteria.</Text>
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Price Filter Modal */}
      <Modal
        visible={isFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Price Range</Text>
                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                  <Ionicons name="close" size={24} color={NAVY} />
                </TouchableOpacity>
              </View>

              <View style={styles.filterSliderContainer}>
                <PriceRangeSlider
                  min={0}
                  max={500}
                  initialLow={appliedFilters.min ?? 0}
                  initialHigh={appliedFilters.max ?? 500}
                  onValueChange={(low, high) => setRangeValues({ low, high })}
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.resetButton} onPress={handleResetFilter}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                  <Text style={styles.applyButtonText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: Spacing.four,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    textAlign: 'left',
    marginHorizontal: Spacing.two,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
  },
  section: {
    marginBottom: Spacing.four,
    backgroundColor: '#FFF',
    padding: Spacing.three,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1E2939',
  },
  showMore: {
    color: MAIN_BLUE,
    fontWeight: '600',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: 18,
    color: NAVY,
    fontWeight: '500',
  },
  prosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  prosTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  prosList: {
    marginHorizontal: -Spacing.three, // Offset TaskerCard's margin
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: NAVY,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748B',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.six,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: NAVY,
  },
  filterSliderContainer: {
    marginBottom: Spacing.six,
    paddingHorizontal: Spacing.two,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: NAVY,
    backgroundColor: '#F8FAFC',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: NAVY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
