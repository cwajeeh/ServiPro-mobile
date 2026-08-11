import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RouteProp, useRoute } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import type { CustomerTabParamList } from '@/navigation/types';

export function PendingTaskScreen() {
  const navigation = useCustomerTabNavigation();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerPendingTask'>>();
  const params = route.params || {};

  const title = params.title || 'AC Not Cooling Properly';
  const description = params.description || 'AC unit running but not cooling effectively.';
  const categoryName = params.categoryName || 'Plumbing Services';
  const workingHours = params.workingHours || '2';
  
  let jobBudget = 'Quote Requested';
  if (params.amountType === 'hourly' && params.budget) {
    jobBudget = `£${params.budget}/h`;
  } else if (params.budget && params.budget > 0) {
    jobBudget = `£${params.budget}`;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Your Task</ThemedText>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle-outline" size={24} color="#EF4444" style={styles.warningIcon} />
          <ThemedText style={styles.warningText}>
            This task is still pending and not accepted by any tasker. Wait for few minutes to get accepted.
          </ThemedText>
        </View>

        {/* Task Details Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Title</ThemedText>
            <ThemedText style={styles.value}>{title}</ThemedText>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <ThemedText style={styles.value}>
              {description}
            </ThemedText>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{categoryName}</ThemedText>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Working Hours</ThemedText>
            <ThemedText style={styles.value}>{workingHours}</ThemedText>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Job Budget</ThemedText>
            <ThemedText style={styles.value}>{jobBudget}</ThemedText>
          </View>
        </View>

        {/* Search Again Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('CustomerHome')}
        >
          <ThemedText style={styles.searchButtonText}>Search Again</ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.five,
  },
  warningIcon: {
    marginRight: Spacing.two,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.six,
  },
  fieldGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: AuthPalette.NAVY,
    fontWeight: '500',
    lineHeight: 24,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: AuthPalette.NAVY,
    fontSize: 14,
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: AuthPalette.NAVY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
