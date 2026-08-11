import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type BookingItem } from '@/api/tasks';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useBookingHistory } from '@/hooks/useBookingHistory';
import { formatDate } from '@/utils/dateFormatter';
import { resolveMediaUrl } from '@/utils/mediaUrl';

const { NAVY } = AuthPalette;

export function CustomerOrderHistoryScreen() {
  const navigation = useNavigation();
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBookingHistory(20);

  const inProgressJob = data?.pages[0]?.inProgressJob;
  const bookings = data?.pages.flatMap((page) => page.bookings) || [];

  // filter out the inProgressJob from the main bookings list if it exists to avoid duplication
  const filteredBookings = inProgressJob
    ? bookings.filter(b => b.taskId !== inProgressJob.taskId)
    : bookings;

  // Combine for the list: inProgress at the top
  const allData = inProgressJob ? [inProgressJob, ...filteredBookings] : filteredBookings;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Curved Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Order History</Text>
              <Text style={styles.headerSubtitle}>View your past orders</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={allData}
        keyExtractor={(item, index) => `history-booking-${item.taskId}-${index}`}
        renderItem={({ item }) => <HistoryCard booking={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <ThemedText style={styles.sectionHeader}>
            {inProgressJob ? 'Ongoing & Past Bookings' : 'All Bookings'}
          </ThemedText>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No bookings found.</ThemedText>
          </View>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => (
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color={NAVY} style={{ marginVertical: 20 }} />
          ) : <View style={{ height: 40 }} />
        )}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
}

function HistoryCard({ booking }: { booking: BookingItem }) {
  const isOngoing = booking.status === 'in_progress';

  return (
    <View style={[styles.card, isOngoing && styles.ongoingCard]}>
      {/* Left Column: Avatar & Name */}
      <View style={styles.leftCol}>
        <View style={styles.avatarShadow}>
          <Image
            source={{ uri: resolveMediaUrl(booking.provider?.profileImage) || 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.workerName} numberOfLines={1}>
          {booking.provider?.name || ''}
        </Text>
      </View>

      {/* Right Column: Info */}
      <View style={styles.rightCol}>
        <View style={styles.cardTop}>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, styles.categoryBadge]}>
              <Text style={styles.badgeText}>{booking.category}</Text>
            </View>
            <View style={[styles.badge, isOngoing ? styles.ongoingBadge : styles.statusBadge]}>
              <Text style={[styles.badgeText, { color: '#FFF' }]}>
                {booking.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.priceText}>
            £{booking.amount}{booking.amountType === 'hourly' ? '/h' : ''}
          </Text>
        </View>

        <Text style={styles.taskTitle} numberOfLines={1}>{booking.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {booking.description}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            {formatDate(booking.scheduledDate || booking.schedule)}  |  {booking.hours || '1-2 hrs'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
    fontSize: 32,
    fontWeight: '500',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  listContent: {
    padding: Spacing.four,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: Spacing.four,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  ongoingCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#F5F7FF',
  },
  leftCol: {
    alignItems: 'center',
    width: 65,
    marginRight: 12,
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
  },
  workerName: {
    fontSize: 12,
    color: '#1E293B',
    marginTop: 6,
    fontWeight: '500',
  },
  rightCol: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadge: {
    backgroundColor: '#FFD500',
  },
  statusBadge: {
    backgroundColor: '#22C55E', // Green for Completed
  },
  ongoingBadge: {
    backgroundColor: NAVY,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#1E293B',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: NAVY,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
});
