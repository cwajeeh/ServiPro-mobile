import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Bid } from '@/api/bidding';
import { BidCard } from '@/components/customer/bidding/BidCard';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useAcceptBid, useCustomerBiddingTasks, useRejectBid } from '@/hooks/useBidding';
import type { CustomerTabParamList } from '@/navigation/types';
import { useTaskSocketStore } from '@/store/taskSocketStore';

function normalizeIncomingBid(payload: Record<string, unknown>, taskId: number): Bid | null {
  const id = Number(payload.id ?? payload.bidId);
  if (!Number.isFinite(id)) return null;
  const providerRaw = (payload.provider ?? {}) as Record<string, unknown>;
  return {
    id,
    amount: String(payload.amount ?? ''),
    message: typeof payload.message === 'string' ? payload.message : '',
    status: typeof payload.status === 'string' ? payload.status : 'pending',
    createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : new Date().toISOString(),
    portfolio: Array.isArray(payload.portfolio) ? payload.portfolio : [],
    provider: {
      id: Number(providerRaw.id) || 0,
      name: typeof providerRaw.name === 'string' ? providerRaw.name : 'Professional',
      profileImage: typeof providerRaw.profileImage === 'string'
        ? providerRaw.profileImage
        : typeof providerRaw.profile_image === 'string'
          ? providerRaw.profile_image
          : '',
      description: typeof providerRaw.description === 'string' ? providerRaw.description : '',
    },
  };
}

export function MatchingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerTabParamList>>();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerMatching'>>();
  const taskId = route.params?.taskId != null ? Number(route.params.taskId) : NaN;
  const hasTaskId = Number.isFinite(taskId) && taskId > 0;

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [seconds, setSeconds] = useState(0);
  const [liveBids, setLiveBids] = useState<Bid[]>([]);

  const connect = useTaskSocketStore((s) => s.connect);
  const subscribeTask = useTaskSocketStore((s) => s.subscribeTask);
  const unsubscribeTask = useTaskSocketStore((s) => s.unsubscribeTask);
  const onBidPlaced = useTaskSocketStore((s) => s.onBidPlaced);
  const onTaskStatusChanged = useTaskSocketStore((s) => s.onTaskStatusChanged);

  const { data: biddingTasks, refetch } = useCustomerBiddingTasks();
  const acceptBidMutation = useAcceptBid();
  const rejectBidMutation = useRejectBid();

  const restBids = useMemo(() => {
    if (!hasTaskId || !biddingTasks) return [];
    const task = biddingTasks.find((t) => Number(t.id) === taskId);
    return task?.bids ?? [];
  }, [biddingTasks, hasTaskId, taskId]);

  const bids = useMemo(() => {
    const byId = new Map<number, Bid>();
    for (const b of restBids) byId.set(Number(b.id), b);
    for (const b of liveBids) byId.set(Number(b.id), b);
    return Array.from(byId.values()).sort((a, b) => Number(b.id) - Number(a.id));
  }, [liveBids, restBids]);

  useFocusEffect(
    useCallback(() => {
      setSeconds(0);
      const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const rotateLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      rotateLoop.start();

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();

      return () => {
        rotateLoop.stop();
        pulseLoop.stop();
      };
    }, [rotateAnim, pulseAnim]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!hasTaskId) return undefined;

      connect();
      subscribeTask(taskId);
      void refetch();

      const unsubBid = onBidPlaced((payload) => {
        const p = payload as Record<string, unknown>;
        const payloadTaskId = Number(p.taskId ?? p.task_id);
        if (Number.isFinite(payloadTaskId) && payloadTaskId !== taskId) return;
        const bid = normalizeIncomingBid(p, taskId);
        if (!bid) {
          void refetch();
          return;
        }
        setLiveBids((prev) => {
          if (prev.some((b) => Number(b.id) === Number(bid.id))) return prev;
          return [bid, ...prev];
        });
        void refetch();
      });

      const unsubStatus = onTaskStatusChanged((payload) => {
        if (payload.taskId != null && Number(payload.taskId) !== taskId) return;
        const status = (payload.status ?? '').toLowerCase();
        if (
          status === 'assigned' ||
          status === 'accepted' ||
          status === 'on_the_way' ||
          status === 'in_progress'
        ) {
          navigation.replace('CustomerTaskDetail', { taskId });
        }
      });

      return () => {
        unsubscribeTask(taskId);
        unsubBid();
        unsubStatus();
      };
    }, [
      connect,
      hasTaskId,
      navigation,
      onBidPlaced,
      onTaskStatusChanged,
      refetch,
      subscribeTask,
      taskId,
      unsubscribeTask,
    ]),
  );

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleAccept = (bidId: number) => {
    if (!hasTaskId) return;
    Alert.alert('Accept Bid', 'Are you sure you want to accept this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          acceptBidMutation.mutate(
            { taskId, bidId },
            {
              onSuccess: () => {
                Alert.alert('Success', 'Bid accepted successfully.');
                navigation.replace('CustomerTaskDetail', { taskId });
              },
              onError: (err) => {
                Alert.alert('Error', err.message || 'Failed to accept bid.');
              },
            },
          );
        },
      },
    ]);
  };

  const handleReject = (bidId: number) => {
    if (!hasTaskId) return;
    Alert.alert('Decline Bid', 'Are you sure you want to decline this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          rejectBidMutation.mutate(
            { taskId, bidId },
            {
              onSuccess: () => {
                setLiveBids((prev) => prev.filter((b) => Number(b.id) !== bidId));
                void refetch();
              },
              onError: (err) => {
                Alert.alert('Error', err.message || 'Failed to decline bid.');
              },
            },
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <ThemedText style={styles.headerTitle}>Your Task</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.matchingContainer}>
          <Animated.View style={[styles.imageWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <Animated.Image
              source={require('../../../../assets/images/matching.png')}
              style={[styles.matchingImage, { transform: [{ rotate: rotation }] }]}
            />
          </Animated.View>
          <View style={styles.centerIcon}>
            <View style={styles.innerCircle}>
              <Ionicons name="search" size={32} color={AuthPalette.NAVY} />
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>
            {bids.length > 0 ? 'Bids coming in' : 'Matching you ASAP'}
          </ThemedText>
          <ThemedText style={styles.timerText}>{formatTime(seconds)}</ThemedText>
          {!hasTaskId ? (
            <ThemedText style={styles.hintText}>
              Waiting for task id… You can still check Bidding from the tab bar.
            </ThemedText>
          ) : null}
        </View>

        {hasTaskId ? (
          <FlatList
            data={bids}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBids}>
                <ActivityIndicator color={AuthPalette.NAVY} />
                <ThemedText style={styles.hintText}>Listening for nearby professionals…</ThemedText>
              </View>
            }
            renderItem={({ item }) => (
              <BidCard
                bid={item}
                isAccepting={
                  acceptBidMutation.isPending && acceptBidMutation.variables?.bidId === item.id
                }
                isRejecting={
                  rejectBidMutation.isPending && rejectBidMutation.variables?.bidId === item.id
                }
                onAccept={() => handleAccept(item.id)}
                onReject={() => handleReject(item.id)}
              />
            )}
          />
        ) : (
          <TouchableOpacity
            style={styles.pendingBtn}
            onPress={() => navigation.navigate('CustomerPendingTask', route.params)}
          >
            <ThemedText style={styles.pendingBtnText}>View pending task</ThemedText>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: AuthPalette.NAVY,
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
  matchingContainer: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  centerIcon: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: AuthPalette.BLACK,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 28,
    fontWeight: '500',
    color: AuthPalette.NAVY,
  },
  hintText: {
    marginTop: Spacing.two,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 40,
  },
  emptyBids: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.four,
  },
  pendingBtn: {
    marginHorizontal: Spacing.four,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthPalette.NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
