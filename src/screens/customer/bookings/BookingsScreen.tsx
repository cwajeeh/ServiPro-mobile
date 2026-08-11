import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type BookingItem } from '@/api/tasks';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useBookingHistory } from '@/hooks/useBookingHistory';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import { resolveMediaUrl } from '@/utils/mediaUrl';

const { NAVY, PRIMARY_TEXT, BLACK } = AuthPalette;

export function BookingsScreen() {
  const navigation = useCustomerTabNavigation();
  const {
    data,
    isLoading: loading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBookingHistory(20);

  const inProgressJob = data?.pages[0]?.inProgressJob;
  const bookings = data?.pages.flatMap((page) => page.bookings) || [];

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>Failed to load bookings</ThemedText>
      <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <ThemedText style={styles.headerTitle}>Bookings</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Track All Task Statuses</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={NAVY} style={{ marginVertical: 40 }} />
        ) : isError ? (
          renderError()
        ) : !inProgressJob && bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No bookings found.</ThemedText>
            <ThemedText style={styles.emptySubText}>Create a task to get started!</ThemedText>
          </View>
        ) : (
          <>
            {inProgressJob && (
              <View style={styles.statusSection}>
                <ThemedText style={styles.statusLabel}>Ongoing Task</ThemedText>
                <BookingCard task={inProgressJob} />
              </View>
            )}

            {bookings.length > 0 && (
              <View style={styles.statusSection}>
                <ThemedText style={styles.statusLabel}>Booking History</ThemedText>
                {bookings.map((booking, idx) => (
                  <BookingCard key={`${booking.taskId}-${idx}`} task={booking} />
                ))}
              </View>
            )}

            {isFetchingNextPage && (
              <ActivityIndicator size="small" color={NAVY} style={{ marginVertical: 20 }} />
            )}

            {hasNextPage && !isFetchingNextPage && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={() => fetchNextPage()}>
                <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function BookingCard({ task }: { task: BookingItem }) {
  const navigation = useCustomerTabNavigation();
  const isOngoing = task.status === 'in_progress' || task.status === 'In Progress';
  const isScheduled = task.status === 'scheduled' || task.status === 'Scheduled';

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CustomerBookingDetail', { taskId: task.taskId })}
    >
      <View style={styles.cardRow}>
        {/* Left Side: Avatar & Name */}
        <View style={styles.leftCol}>
          <Image
            source={{ uri: resolveMediaUrl(task.provider?.profileImage) || 'https://i.pravatar.cc/100' }}
            style={styles.providerImage}
          />
          <ThemedText style={styles.providerName} numberOfLines={1}>
            {task.customer?.name?.split(' ')[0] || ''}
          </ThemedText>
        </View>

        {/* Right Side: Content */}
        <View style={styles.rightCol}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.tagsRow}>
              {task.category ? (
                <View style={[styles.tag, styles.categoryTag]}>
                  <ThemedText style={styles.tagText}>{task.category}</ThemedText>
                </View>
              ) : null}
              <View style={[styles.tag, isOngoing ? styles.ongoingTag : isScheduled ? styles.scheduledTag : styles.pendingTag]}>
                <ThemedText style={[styles.tagText, { color: '#FFF' }]}>{task.status.replace('_', ' ')}</ThemedText>
              </View>
            </View>

            {task.amount ? (
              <ThemedText style={styles.priceHeader}>
                £{task.amount}{task.amountType === 'hourly' ? '/h' : ''}
              </ThemedText>
            ) : null}
          </View>

          <ThemedText style={styles.taskTitle} numberOfLines={1}>{task.title}</ThemedText>

          {task.description ? (
            <ThemedText style={styles.description} numberOfLines={2}>
              {task.description}
            </ThemedText>
          ) : null}

          <View style={styles.metaRow}>
            <ThemedText style={styles.metaText}>Estimated Time: {task.hours || '1-2 hrs'}</ThemedText>
            <ThemedText style={styles.metaPipe}>|</ThemedText>
            <ThemedText style={styles.metaText}>{task.distance ? `${task.distance}Km Away` : '5Km Away'}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E2939',
    marginBottom: Spacing.four,
  },
  statusSection: {
    marginBottom: Spacing.four,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: Spacing.two,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: NAVY,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748B',
  },
  pendingTag: {
    backgroundColor: '#F59E0B',
  },
  card: {
    backgroundColor: '#EEF4FF', // Light themed background as in screenshot
    borderRadius: 30,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 16,
  },
  leftCol: {
    alignItems: 'center',
    width: 60,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  providerName: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
    marginTop: 8,
    textAlign: 'center',
  },
  rightCol: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  priceHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: NAVY,
    marginLeft: 8,
    flexShrink: 0,
  },
  tagsRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  categoryTag: {
    backgroundColor: '#F59E0B', // Matched to screenshot
  },
  ongoingTag: {
    backgroundColor: '#991B1B',
  },
  scheduledTag: {
    backgroundColor: '#0EA5E9',
  },

  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 10,
    color: NAVY,
    fontWeight: '700',
  },
  metaPipe: {
    fontSize: 10,
    color: '#94A3B8',
  },
  loadMoreButton: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  loadMoreText: {
    color: AuthPalette.NAVY,
    fontWeight: '600',
    fontSize: 14,
  },
  retryButton: {
    marginTop: Spacing.two,
    backgroundColor: AuthPalette.NAVY,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
