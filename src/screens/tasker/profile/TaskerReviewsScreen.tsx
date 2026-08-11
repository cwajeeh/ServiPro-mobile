import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/store/authStore';
import { useProviderReviews } from '@/hooks/useReview';
import { ProviderReview } from '@/types/review';

const REVIEWS_DATA = [
  {
    id: '1',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia1'
  },
  {
    id: '2',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia2'
  },
  {
    id: '3',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia3'
  },
  {
    id: '4',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia4'
  },
  {
    id: '5',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia1'
  },
  {
    id: '6',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia2'
  },
  {
    id: '7',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia3'
  },
  {
    id: '8',
    name: 'Olivia Michael',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely fantastic job. Came on schedule, worked fast, excellent quality and price. Could not be more pleased!',
    avatar: 'https://i.pravatar.cc/150?u=olivia4'
  }
];

const NAVY = '#001A6E';
const WHITE = '#FFFFFF';
const GRAY = '#64748B';

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

export function TaskerReviewsScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const pageSize = 50;

  const { data: response, isLoading, error, refetch } = useProviderReviews(user?.id || 0, page, pageSize);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
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
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const { reviews, avgRating } = response.data;

  // Frontend Filtering
  const filteredReviews = activeFilter === 'All'
    ? reviews
    : reviews.filter(r => r.rating === Number(activeFilter));

  const filters = ['All', '5', '4', '3', '2', '1'];

  const renderReviewItem = ({ item }: { item: ProviderReview }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150' }} // Fallback/Placeholder as API doesn't return reviewer profile_image directly in this endpoint yet based on example
          style={styles.avatar} 
        />
        <View style={styles.reviewInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.reviewerName}>{item.reviewerName}</Text>
            <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= item.rating ? '#FFB800' : '#E2E8F0'}>
                <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </Svg>
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
      {item.taskTitle && (
        <Text style={styles.taskTitleText}>Service: {item.taskTitle}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Text style={styles.headerTitle}>My Reviews</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Rating Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.avgRatingText}>{avgRating.toFixed(1)}</Text>
            <View style={styles.starRow}>
               {[1, 2, 3, 4, 5].map((s) => (
                <Svg key={s} width="20" height="20" viewBox="0 0 24 24" fill={s <= Math.round(avgRating) ? '#FFB800' : 'rgba(255,255,255,0.3)'}>
                  <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </Svg>
              ))}
            </View>
            <Text style={styles.totalReviewsText}>Based on {reviews.length} reviews</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Filters */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterChange(filter)}
              style={[
                styles.filterBtn,
                activeFilter === filter && styles.activeFilterBtn
              ]}
            >
              <Text style={[
                styles.filterBtnText,
                activeFilter === filter && styles.activeFilterBtnText
              ]}>
                {filter === 'All' ? 'All' : `${filter} Stars`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reviews found for this rating.</Text>
          </View>
        }
      />

      {/* Footer */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          style={styles.dashboardBtn}
          onPress={() => navigation.navigate('TaskerTabs' as never)}
        >
          <Text style={styles.dashboardBtnText}>Back To Dashboard</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 150,
  },
  reviewItem: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  reviewInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 12,
    color: GRAY,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  taskTitleText: {
    fontSize: 12,
    color: NAVY,
    fontWeight: '600',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  summaryContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 10,
  },
  avgRatingText: {
    fontSize: 48,
    fontWeight: '800',
    color: WHITE,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  totalReviewsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  filterWrapper: {
    backgroundColor: WHITE,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterBtn: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterBtnText: {
    color: WHITE,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: NAVY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: WHITE,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: GRAY,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dashboardBtn: {
    backgroundColor: NAVY,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});
