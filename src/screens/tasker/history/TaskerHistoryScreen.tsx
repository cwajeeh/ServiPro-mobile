import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchJobHistory } from '@/api/taskerJobs';
import { JobCard } from '@/components/tasker/JobCard';
import { TaskerSubHeader } from '@/components/tasker/TaskerSubHeader';
import { AuthPalette, Spacing, TaskerPalette } from '@/constants/theme';

const { BG_LIGHT } = TaskerPalette;
const { NAVY, GRAY } = AuthPalette;

export function TaskerHistoryScreen() {
  const historyQuery = useQuery({
    queryKey: ['tasker', 'history'],
    queryFn: () => fetchJobHistory(1, 30),
  });

  const jobs = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TaskerSubHeader title="History" subtitle="Completed & past jobs" />
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <JobCard job={item} />}
          refreshControl={
            <RefreshControl
              refreshing={historyQuery.isRefetching}
              onRefresh={() => void historyQuery.refetch()}
              tintColor={NAVY}
            />
          }
          ListEmptyComponent={
            historyQuery.isLoading ? (
              <ActivityIndicator color={NAVY} style={{ marginTop: Spacing.six }} />
            ) : (
              <Text style={styles.empty}>No job history yet.</Text>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_LIGHT },
  safe: { flex: 1 },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    paddingTop: Spacing.three,
    flexGrow: 1,
  },
  empty: { textAlign: 'center', color: GRAY, marginTop: Spacing.six },
});
