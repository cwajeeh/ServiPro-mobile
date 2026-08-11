import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import type { BiddingTask } from '@/api/bidding';
import { BidCard } from './BidCard';

interface TaskCardProps {
  item: BiddingTask;
  acceptPendingBidId?: number | null;
  rejectPendingBidId?: number | null;
  onAcceptBid: (taskId: number, bidId: number) => void;
  onRejectBid: (taskId: number, bidId: number) => void;
}

export const TaskCard = React.memo(({ 
  item, 
  acceptPendingBidId, 
  rejectPendingBidId, 
  onAcceptBid, 
  onRejectBid 
}: TaskCardProps) => {
  const iconUrl = item.icon ? resolveMediaUrl(item.icon) : null;

  const getBidKey = (bid: BiddingTask['bids'][number], index: number) => {
    const bidIdPart = bid?.id != null ? String(bid.id) : 'no-id';
    const providerIdPart = bid?.provider?.id != null ? String(bid.provider.id) : 'no-provider';
    return `task-${item.id}-bid-${bidIdPart}-provider-${providerIdPart}-idx-${index}`;
  };

  return (
    <View style={styles.taskCard}>
      {/* Task Header Info */}
      <View style={styles.taskInfoRow}>
        <View style={styles.iconContainer}>
          {iconUrl ? (
            <Image 
              source={{ uri: iconUrl }} 
              style={styles.taskIcon} 
            />
          ) : (
            <Ionicons name="construct-outline" size={24} color="#64748B" />
          )}
        </View>
        <View style={styles.taskTextInfo}>
          <ThemedText style={styles.taskTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.taskMeta}>
            Scheduled: {dayjs(item.scheduledDate).format('MMM D, YYYY')}    |    {item.type.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText style={styles.taskBudget}>£{item.price}</ThemedText>
      </View>

      {/* Bids List */}
      {item.bids && item.bids.length > 0 ? (
        item.bids.map((bid, index) => (
          <BidCard
            key={getBidKey(bid, index)}
            bid={bid}
            isAccepting={acceptPendingBidId === bid.id}
            isRejecting={rejectPendingBidId === bid.id}
            onAccept={() => onAcceptBid(item.id, bid.id)}
            onReject={() => onRejectBid(item.id, bid.id)}
          />
        ))
      ) : (
        <ThemedText style={styles.noBidsText}>Waiting for professionals to place bids...</ThemedText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  taskInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  taskIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  taskTextInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: AuthPalette.NAVY,
  },
  taskMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  taskBudget: {
    fontSize: 18,
    fontWeight: '500',
    color: AuthPalette.NAVY,
  },
  noBidsText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
});
