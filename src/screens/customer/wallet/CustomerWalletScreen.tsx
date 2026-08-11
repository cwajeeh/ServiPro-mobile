import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { type BookingItem } from '@/api/tasks';
import { AuthPalette } from '@/constants/theme';
import { useBookingHistory } from '@/hooks/useBookingHistory';
import { useUserProfile } from '@/hooks/useProfile';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import { formatDate } from '@/utils/dateFormatter';

const { NAVY, WHITE, GRAY, PRIMARY_TEXT, BORDER } = { ...AuthPalette, WHITE: '#FFFFFF' };

export function CustomerWalletScreen() {
  const navigation = useCustomerTabNavigation();
  const { data: profile } = useUserProfile();
  const {
    data: historyData,
    isLoading: historyLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBookingHistory(20);

  const inProgressJob = historyData?.pages[0]?.inProgressJob;
  const bookings = historyData?.pages.flatMap((page) => page.bookings) || [];
  const totalOrders = historyData?.pages[0]?.pagination.total || 0;

  // Filter out inProgressJob from main list
  const filteredBookings = inProgressJob
    ? bookings.filter(b => b.taskId !== inProgressJob.taskId)
    : bookings;

  const allData = inProgressJob ? [inProgressJob, ...filteredBookings] : filteredBookings;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          {/* Top Row */}
          <View style={styles.topRow}>
            <View style={styles.locationGroup}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <Circle cx="12" cy="10" r="3" />
              </Svg>
              <Text style={styles.locationText}>{profile?.address || 'London, UK'}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.iconBtn}
                onPress={() => navigation.navigate('CustomerNotifications')}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
                  <Path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <Path d="M13.73 21a2 2 0 01-3.46 0" />
                </Svg>
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => navigation.navigate('CustomerMyProfile')}
              >
                <View style={styles.avatarMini}>
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <Circle cx="12" cy="7" r="4" />
                  </Svg>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Earnings Display */}
          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsLabel}>Total Balance</Text>
              <Text style={styles.earningsAmount}>£{profile?.wallet_balance || '0.00'}</Text>
            </View>
            <Pressable
              style={styles.addBankBtn}
              onPress={() => navigation.navigate('CustomerAddCards')}
            >
              <View style={styles.plusIconWrap}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="3">
                  <Path d="M12 5v14M5 12h14" />
                </Svg>
              </View>
              <Text style={styles.addBankText}>Add{"\n"}Money</Text>
            </Pressable>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard value={`£${profile?.wallet_balance || 0}`} label="Spent (Total)" />
            <StatCard value={String(totalOrders)} label="Total Orders" />
            <StatCard value={inProgressJob ? "1" : "0"} label="Active Tasks" />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );

  const renderTransaction = ({ item, index }: { item: BookingItem; index: number }) => {
    const isOngoing = item.status === 'in_progress';

    // Grouping by date (simple implementation for real data)
    const currentDate = formatDate(item.scheduledDate || item.schedule).split(' - ')[0];
    const prevDate = index > 0
      ? formatDate(allData[index - 1].scheduledDate || allData[index - 1].schedule).split(' - ')[0]
      : null;
    const showDateGroup = index === 0 || currentDate !== prevDate;

    return (
      <View style={styles.transactionWrapper}>
        {showDateGroup && <Text style={styles.dateGroupTitle}>{currentDate}</Text>}
        <View style={[styles.transactionCard, isOngoing && styles.ongoingCard]}>
          <View style={styles.cardTop}>
            <View style={styles.providerInfo}>
              <View style={styles.providerAvatar}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
                  <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <Circle cx="12" cy="7" r="4" />
                </Svg>
              </View>
              <Text style={styles.providerName}>{item.provider?.name?.split(' ')[0] || ''}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badgeTag, { backgroundColor: '#FFD500' }]}>
                <Text style={[styles.badgeTagText, { color: '#000' }]}>{item.category}</Text>
              </View>
              <View style={[styles.badgeTag, { backgroundColor: isOngoing ? NAVY : '#22C55E' }]}>
                <Text style={styles.badgeTagText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.cardPrice}>£{item.amount}</Text>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerData}>{item.hours || '1-2 hrs'}</Text>
            <Text style={styles.footerSeparator}>|</Text>
            <Text style={styles.footerData}>{item.distance ? `${item.distance}Km` : 'Distance TBA'}</Text>
            <Text style={styles.footerSeparator}>|</Text>
            <Text style={styles.footerData}>{formatDate(item.scheduledDate || item.schedule)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (historyLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={allData}
        keyExtractor={(item, index) => `wallet-transaction-${item.taskId}-${index}`}
        renderItem={renderTransaction}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => (
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color={NAVY} style={{ marginVertical: 20 }} />
          ) : <View style={{ height: 100 }} />
        )}
        refreshing={historyLoading}
        onRefresh={refetch}
      />

      {/* Footer sticky button */}
      <SafeAreaView edges={['bottom']} style={styles.stickyFooter}>
        <Pressable
          style={styles.dashboardBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.dashboardBtnText}>Back To Home</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    marginBottom: 100,
  },
  headerBackground: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  headerContent: {
    paddingTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: NAVY,
  },
  badgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  earningsLabel: {
    color: WHITE,
    fontSize: 18,
    opacity: 0.9,
    marginBottom: 8,
  },
  earningsAmount: {
    color: WHITE,
    fontSize: 48,
    fontWeight: '500',
  },
  addBankBtn: {
    alignItems: 'center',
    gap: 8,
  },
  plusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBankText: {
    color: WHITE,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    bottom: -60,
    left: 20,
    right: 20,
    top: 260,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#EBF3FF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  transactionWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateGroupTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#334155',
    marginVertical: 16,
  },
  transactionCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  ongoingCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#F5F7FF',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerInfo: {
    alignItems: 'center',
    marginRight: 12,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTagText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  footerData: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  footerSeparator: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dashboardBtn: {
    backgroundColor: NAVY,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});
