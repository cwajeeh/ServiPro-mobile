import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useMyReviews } from '@/hooks/useReview';
import { ActivityIndicator } from 'react-native';

const { NAVY, WHITE, GRAY } = { ...AuthPalette, WHITE: '#FFFFFF' };
const RED = '#EF4444';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

export function CustomerReviewsScreen() {
  const navigation = useNavigation();
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const pageSize = 50; // Increased to fetch more data for smoother frontend filtering

  const { data: response, isLoading, error, refetch } = useMyReviews(page, pageSize);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1); // Reset to first page when filter changes
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  if (error || !response) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.errorText}>Failed to load reviews.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { reviews, overallRating, pagination } = response.data;
  const { averageRating, totalReviews, ratingBreakdown } = overallRating;

  // Frontend Filtering
  const filteredReviews = activeFilter === 'All'
    ? reviews
    : reviews.filter(r => r.rating === Number(activeFilter));

  const filters = [
    `All (${totalReviews})`,
    `5 (${ratingBreakdown['5'] || 0})`,
    `4 (${ratingBreakdown['4'] || 0})`,
    `3 (${ratingBreakdown['3'] || 0})`,
    `2 (${ratingBreakdown['2'] || 0})`,
    `1 (${ratingBreakdown['1'] || 0})`,
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AuthToolPattern />
      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Reviews</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Rating Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.averageScore}>{averageRating?.toFixed(1) || '0.0'}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={20} color={s <= Math.round(averageRating) ? "#FFC107" : "#E2E8F0"} />
              ))}
            </View>
            <Text style={styles.reviewCount}>{totalReviews} reviews</Text>
          </View>

          <View style={styles.summaryRight}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingBreakdown[String(rating)] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <View key={rating} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>{rating}</Text>
                  <Ionicons name="star" size={12} color="#FFC107" style={{ marginHorizontal: 4 }} />
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.ratingBarCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          {filters.map((f) => {
            const filterValue = f.split(' ')[0]; // extracts 'All', '5', '4', etc.
            const isActive = activeFilter === filterValue;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, isActive && styles.activeFilterBtn]}
                onPress={() => handleFilterChange(filterValue)}
              >
                <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reviews found for this rating on this page.</Text>
          </View>
        ) : (
          filteredReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.reviewer.profile_image ? `https://servisca-app.s3.eu-west-2.amazonaws.com/${review.reviewer.profile_image}` : 'https://i.pravatar.cc/100' }}
                  style={styles.avatar}
                />
                <View style={styles.nameRow}>
                  <Text style={styles.reviewerName}>
                    {review.reviewer.first_name} {review.reviewer.last_name}
                  </Text>
                  <View style={styles.starsRowSmall}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={14} color={s <= review.rating ? "#FFC107" : "#E2E8F0"} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{review.task.title}</Text>
              </View>

              <Text style={styles.comment}>{review.comment}</Text>
            </View>
          ))
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[styles.pageBtn, !pagination.hasPrevPage && styles.disabledBtn]}
              disabled={!pagination.hasPrevPage}
              onPress={() => setPage(p => p - 1)}
            >
              <Ionicons name="chevron-back" size={20} color={pagination.hasPrevPage ? NAVY : GRAY} />
            </TouchableOpacity>
            <Text style={styles.pageText}>Page {page} of {pagination.totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, !pagination.hasNextPage && styles.disabledBtn]}
              disabled={!pagination.hasNextPage}
              onPress={() => setPage(p => p + 1)}
            >
              <Ionicons name="chevron-forward" size={20} color={pagination.hasNextPage ? NAVY : GRAY} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: RED,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: NAVY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: WHITE,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: Spacing.four,
  },
  headerContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 20,
    fontWeight: '500',
    color: '#FFF',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryLeft: {
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    paddingRight: 24,
    marginRight: 24,
  },
  averageScore: {
    fontSize: 48,
    fontWeight: '700',
    color: NAVY,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryRight: {
    flex: 1,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 12,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 12,
    width: 12,
  },
  filtersScroll: {
    marginBottom: 20,
    marginHorizontal: -Spacing.four,
  },
  filtersContent: {
    paddingHorizontal: Spacing.four,
    gap: 12,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeFilterBtn: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFF',
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  nameRow: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  starsRowSmall: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    marginLeft: 56,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  comment: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 56,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: NAVY,
  },
});
