import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
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

import { fetchAvailableBiddingTasks, fetchMyBids } from '@/api/taskerJobs';
import { JobCard } from '@/components/tasker/JobCard';
import { TaskerOfflinePanel } from '@/components/tasker/TaskerOfflineHomeSection';
import { TaskerSubHeader } from '@/components/tasker/TaskerSubHeader';
import { AuthPalette, Spacing, TaskerPalette } from '@/constants/theme';
import { useTaskerCoords } from '@/hooks/useTaskerCoords';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';

const { BG_LIGHT } = TaskerPalette;
const { NAVY, GRAY } = AuthPalette;

export function TaskerBiddingScreen() {
  const { isOnline, isUpdating, setOnline } = useUserOnlineStatus();
  const { coords, loading: locLoading, refresh: refreshLoc } = useTaskerCoords();

  const availableQuery = useQuery({
    queryKey: ['tasker', 'bidding', 'available', coords?.lat, coords?.lng],
    enabled: Boolean(isOnline && coords),
    queryFn: () =>
      fetchAvailableBiddingTasks({
        lat: coords!.lat,
        lng: coords!.lng,
      }),
  });

  const myBidsQuery = useQuery({
    queryKey: ['tasker', 'bidding', 'mine', coords?.lat, coords?.lng],
    enabled: Boolean(isOnline && coords),
    queryFn: () =>
      fetchMyBids({
        lat: coords!.lat,
        lng: coords!.lng,
      }),
  });

  const bids = useMemo(() => {
    const mine = myBidsQuery.data ?? [];
    const available = availableQuery.data ?? [];
    const seen = new Set(mine.map((j) => j.id));
    return [...mine, ...available.filter((j) => !seen.has(j.id))];
  }, [availableQuery.data, myBidsQuery.data]);

  const loading = availableQuery.isLoading || myBidsQuery.isLoading || locLoading;
  const refetching = availableQuery.isRefetching || myBidsQuery.isRefetching;
  const isError = availableQuery.isError && myBidsQuery.isError;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TaskerSubHeader title="Bidding" subtitle="Manage your active bids" />

        {isOnline ? (
          <FlatList
            data={bids}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => <JobCard job={item} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <View style={styles.center}>
                  <ActivityIndicator color={NAVY} />
                  <Text style={styles.emptyText}>Loading bidding tasks…</Text>
                </View>
              ) : isError ? (
                <View style={styles.center}>
                  <Text style={styles.errorText}>Could not load bids.</Text>
                  <Pressable
                    onPress={() => {
                      void availableQuery.refetch();
                      void myBidsQuery.refetch();
                    }}
                    style={styles.retryBtn}>
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>No bidding tasks nearby.</Text>
                </View>
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={refetching}
                onRefresh={() => {
                  void refreshLoc();
                  void availableQuery.refetch();
                  void myBidsQuery.refetch();
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
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    backgroundColor: BG_LIGHT,
    flexGrow: 1,
  },
  offlineContainer: { flex: 1, paddingTop: Spacing.six },
  center: { paddingVertical: Spacing.six, alignItems: 'center', gap: Spacing.two },
  emptyText: { color: GRAY, textAlign: 'center' },
  errorText: { color: AuthPalette.ERROR_RED, textAlign: 'center' },
  retryBtn: {
    marginTop: Spacing.two,
    backgroundColor: NAVY,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  retryText: { color: '#FFF', fontWeight: '600' },
});
