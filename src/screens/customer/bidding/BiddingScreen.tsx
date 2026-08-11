import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskCard } from '@/components/customer/bidding/TaskCard';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useAcceptBid, useCustomerBiddingTasks, useRejectBid } from '@/hooks/useBidding';
import type { CustomerTabParamList } from '@/navigation/types';
import { useTaskSocketStore } from '@/store/taskSocketStore';

const { NAVY } = AuthPalette;

export function BiddingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerTabParamList>>();
  const { data: biddingTasks, isLoading, isError, refetch } = useCustomerBiddingTasks();

  const acceptBidMutation = useAcceptBid();
  const rejectBidMutation = useRejectBid();
  const connect = useTaskSocketStore((s) => s.connect);
  const onBidPlaced = useTaskSocketStore((s) => s.onBidPlaced);
  const subscribeMyTasks = useTaskSocketStore((s) => s.subscribeMyTasks);

  useFocusEffect(
    useCallback(() => {
      connect();
      subscribeMyTasks();
      const unsub = onBidPlaced(() => {
        void refetch();
      });
      return () => unsub();
    }, [connect, onBidPlaced, refetch, subscribeMyTasks]),
  );

  const handleAcceptBid = useCallback((taskId: number, bidId: number) => {
    Alert.alert('Accept Bid', 'Are you sure you want to accept this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          acceptBidMutation.mutate({ taskId, bidId }, {
            onSuccess: () => {
              Alert.alert('Success', 'Bid accepted successfully.');
              navigation.navigate('CustomerTaskDetail', { taskId: taskId });

            },
            onError: (err) => {
              Alert.alert('Error', err.message || 'Failed to accept bid.');
            }
          });
        }
      }
    ]);
  }, [acceptBidMutation]);

  const handleRejectBid = useCallback((taskId: number, bidId: number) => {
    Alert.alert('Decline Bid', 'Are you sure you want to decline this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          rejectBidMutation.mutate({ taskId, bidId }, {
            onSuccess: () => {
              Alert.alert('Success', 'Bid declined successfully.');
            },
            onError: (err) => {
              Alert.alert('Error', err.message || 'Failed to decline bid.');
            }
          });
        }
      }
    ]);
  }, [rejectBidMutation]);

  const renderItem = ({ item }: any) => (
    <TaskCard
      item={item}
      acceptPendingBidId={acceptBidMutation.isPending ? acceptBidMutation.variables?.bidId : null}
      rejectPendingBidId={rejectBidMutation.isPending ? rejectBidMutation.variables?.bidId : null}
      onAcceptBid={handleAcceptBid}
      onRejectBid={handleRejectBid}
    />
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
              <ThemedText style={styles.headerTitle}>Bidding</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Bid With Professionals</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>Failed to load bids.</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={biddingTasks}

          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <ThemedText style={styles.emptyText}>No active bids found.</ThemedText>
            </View>
          }
          renderItem={renderItem}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
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
  listContent: {
    padding: Spacing.four,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: Spacing.three,
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: NAVY,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: Spacing.six,
  },
});
