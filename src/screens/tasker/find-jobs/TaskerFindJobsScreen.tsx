import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
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

import { fetchAvailableJobs, type TaskerJobTypeFilter } from '@/api/taskerJobs';
import { JobCard } from '@/components/tasker/JobCard';
import { JobFilterSection } from '@/components/tasker/JobFilterSection';
import { TaskerOfflinePanel } from '@/components/tasker/TaskerOfflineHomeSection';
import { TaskerSubHeader } from '@/components/tasker/TaskerSubHeader';
import { TASKER_JOB_FILTERS } from '@/constants/taskerMockData';
import { AuthPalette, Spacing, TaskerPalette } from '@/constants/theme';
import { useTaskerCoords } from '@/hooks/useTaskerCoords';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { useTaskSocketStore } from '@/store/taskSocketStore';

const { BG_LIGHT } = TaskerPalette;
const { NAVY, GRAY } = AuthPalette;
const DEFAULT_RADIUS_KM = 25;

function filterToType(filter: string | null): TaskerJobTypeFilter | undefined {
  if (!filter) return undefined;
  const f = filter.toLowerCase();
  if (f === 'quick') return 'quick';
  if (f === 'hourly') return 'hourly';
  if (f.includes('fixed')) return 'fixed';
  return undefined;
}

export function TaskerFindJobsScreen() {
  const [activeFilter, setActiveFilter] = useState<string | null>('Quick');
  const { isOnline, isUpdating, setOnline } = useUserOnlineStatus();
  const { coords, loading: locLoading, error: locError, refresh: refreshLoc } = useTaskerCoords();

  const type = filterToType(activeFilter);

  const connect = useTaskSocketStore((s) => s.connect);
  const subscribeArea = useTaskSocketStore((s) => s.subscribeArea);
  const updateArea = useTaskSocketStore((s) => s.updateArea);
  const onNewTask = useTaskSocketStore((s) => s.onNewTask);

  const jobsQuery = useQuery({
    queryKey: ['tasker', 'jobs', 'available', coords?.lat, coords?.lng, type],
    enabled: Boolean(isOnline && coords),
    queryFn: () =>
      fetchAvailableJobs({
        lat: coords!.lat,
        lng: coords!.lng,
        type,
      }),
  });

  useEffect(() => {
    if (!isOnline || !coords) return undefined;
    connect();
    subscribeArea({ lat: coords.lat, lng: coords.lng, radius: DEFAULT_RADIUS_KM });
    updateArea({ lat: coords.lat, lng: coords.lng, radius: DEFAULT_RADIUS_KM });
    const unsub = onNewTask(() => {
      void jobsQuery.refetch();
    });
    return () => {
      unsub();
    };
  }, [
    connect,
    coords,
    isOnline,
    onNewTask,
    subscribeArea,
    updateArea,
    jobsQuery.refetch,
  ]);

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <JobFilterSection
        filters={TASKER_JOB_FILTERS}
        activeFilter={activeFilter}
        onFilterPress={(f) => setActiveFilter(activeFilter === f ? null : f)}
      />
      {locError ? <Text style={styles.errorText}>{locError}</Text> : null}
    </View>
  );

  const listEmpty = () => {
    if (jobsQuery.isLoading || locLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={NAVY} />
          <Text style={styles.emptyText}>Finding nearby jobs…</Text>
        </View>
      );
    }
    if (jobsQuery.isError) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load jobs. Pull to refresh.</Text>
          <Pressable onPress={() => void jobsQuery.refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No available jobs nearby right now.</Text>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TaskerSubHeader title="Find Jobs" subtitle="Get matched instantly" />

        {isOnline ? (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={listEmpty}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => <JobCard job={item} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={jobsQuery.isRefetching}
                onRefresh={() => {
                  void refreshLoc();
                  void jobsQuery.refetch();
                }}
                tintColor={NAVY}
              />
            }
          />
        ) : (
          <View style={styles.offlineContainer}>
            <TaskerOfflinePanel
              loading={isUpdating}
              onOnlineNow={() => setOnline(true)}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_LIGHT },
  safe: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    backgroundColor: BG_LIGHT,
    flexGrow: 1,
  },
  listHeader: { marginTop: Spacing.two, marginBottom: Spacing.two },
  offlineContainer: { flex: 1, paddingTop: Spacing.six },
  center: { paddingVertical: Spacing.six, alignItems: 'center', gap: Spacing.two },
  emptyText: { color: GRAY, textAlign: 'center' },
  errorText: { color: AuthPalette.ERROR_RED, textAlign: 'center', marginTop: Spacing.two },
  retryBtn: {
    marginTop: Spacing.two,
    backgroundColor: NAVY,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  retryText: { color: '#FFF', fontWeight: '600' },
});
