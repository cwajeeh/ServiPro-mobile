import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { fetchProviderRecentJobs, fetchWalletStats } from '@/api/taskerJobs';
import { JobCard } from '@/components/tasker/JobCard';
import { JobFilterSection } from '@/components/tasker/JobFilterSection';
import { TaskerHomePromoBanner, TaskerOfflinePanel } from '@/components/tasker/TaskerOfflineHomeSection';
import { TopHeader } from '@/components/tasker/TopHeader';
import { AuthPalette, Spacing, TaskerPalette, Typography } from '@/constants/theme';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { useAuthStore } from '@/store/authStore';
import { useNotificationSocketStore } from '@/store/notificationSocketStore';
import { getUserDisplayName } from '@/utils/userDisplayName';

const { GRAY, NAVY } = AuthPalette;
const { BG_LIGHT } = TaskerPalette;

const JOB_FILTERS = ['All', 'Quick', 'Bids', 'History'];

export function TaskerHomeScreen() {
  const [activeFilter, setActiveFilter] = useState(JOB_FILTERS[0]);
  const { isOnline, toggle, isUpdating, setOnline } = useUserOnlineStatus();

  const user = useAuthStore((s) => s.user);
  const displayName = getUserDisplayName(user, 'Tasker');
  const locationLabel = user?.address?.trim() || 'Your area';
  const unread = useNotificationSocketStore((s) => s.unreadCount);

  const walletQuery = useQuery({
    queryKey: ['tasker', 'wallet-stats'],
    queryFn: fetchWalletStats,
    enabled: isOnline,
  });

  const recentQuery = useQuery({
    queryKey: ['tasker', 'recent'],
    queryFn: fetchProviderRecentJobs,
    enabled: isOnline,
  });

  const todayJobs = recentQuery.data ?? [];
  const ongoingJob =
    todayJobs.find((j) => j.status === 'In Progress') ?? todayJobs[0] ?? null;
  const earningsToday = walletQuery.data?.todayEarnings ?? 0;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <TopHeader
            userName={displayName}
            location={locationLabel}
            notificationCount={unread}
            isOnline={isOnline}
            onOnlineToggle={toggle}
            onlineToggleDisabled={isUpdating}
          />

          {isOnline ? (
            <View style={styles.content}>
              <View style={styles.earningsCard}>
                <View>
                  <Text style={styles.earningsLabel}>{"Today's Earnings"}</Text>
                  <Text style={styles.earningsValue}>
                    £{Number(earningsToday).toFixed(Number(earningsToday) % 1 === 0 ? 0 : 2)}
                  </Text>
                </View>
                <View style={styles.walletIconWrap}>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
                    <Path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
                    <Path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                    <Path d="M18 12h4v4h-4z" />
                  </Svg>
                </View>
              </View>

              <JobFilterSection
                filters={JOB_FILTERS}
                activeFilter={activeFilter}
                onFilterPress={(f) => setActiveFilter(f)}
              />

              {recentQuery.isLoading || walletQuery.isLoading ? (
                <ActivityIndicator color={NAVY} style={{ marginVertical: Spacing.four }} />
              ) : null}

              {ongoingJob ? (
                <View style={styles.section}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.subTitle}>Ongoing</Text>
                  </View>
                  <JobCard job={ongoingJob} isOngoing />
                </View>
              ) : null}

              <View style={styles.section}>
                <View style={styles.rowHeader}>
                  <Text style={styles.subTitle}>Recent Jobs</Text>
                </View>
                {todayJobs.length === 0 && !recentQuery.isLoading ? (
                  <Text style={styles.empty}>No recent jobs yet.</Text>
                ) : (
                  todayJobs.map((job) => <JobCard key={job.id} job={job} />)
                )}
              </View>

              <TaskerHomePromoBanner />
            </View>
          ) : (
            <View style={styles.offlineContainer}>
              <TaskerOfflinePanel loading={isUpdating} onOnlineNow={() => setOnline(true)} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_LIGHT },
  safe: { flex: 1 },
  scroll: { paddingBottom: Spacing.six },
  content: { paddingHorizontal: Spacing.four, gap: Spacing.three },
  earningsCard: {
    marginTop: Spacing.three,
    backgroundColor: NAVY,
    borderRadius: 20,
    padding: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: { color: 'rgba(255,255,255,0.8)', ...Typography.caption },
  earningsValue: { color: '#FFF', fontSize: 28, fontWeight: '700', marginTop: 4 },
  walletIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: Spacing.two },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  subTitle: { ...Typography.h4, color: '#0F172A' },
  empty: { color: GRAY, marginBottom: Spacing.three },
  offlineContainer: { paddingTop: Spacing.six },
});
