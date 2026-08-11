import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import type { Bid } from '@/api/bidding';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { resolveMediaUrl } from '@/utils/mediaUrl';

interface BidCardProps {
  bid: Bid;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const BidCard = React.memo(({ bid, isAccepting, isRejecting, onAccept, onReject }: BidCardProps) => {
  const isDisabled = isAccepting || isRejecting;

  return (
    <View style={styles.bidCard}>
      <View style={styles.bidTopContent}>
        <View style={styles.bidderSidebar}>
          <Image
            source={{ uri: resolveMediaUrl(bid.provider?.profileImage) || 'https://i.pravatar.cc/300' }}
            style={styles.bidderAvatar}
          />
          <ThemedText style={styles.bidderName} numberOfLines={1}>
            {bid.provider?.name || 'Unknown'}
          </ThemedText>
        </View>
        <View style={styles.bidMainInfo}>
          <View style={styles.bidStatusRow}>
            <ThemedText style={styles.bidStatusTitle}>Bid Submitted</ThemedText>
            <ThemedText style={styles.bidAmount}>£{bid.amount}</ThemedText>
          </View>
          <ThemedText style={styles.bidMessage} numberOfLines={2}>
            {bid.message || 'No message provided.'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.bidActions}>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={onReject}
          disabled={isDisabled}
        >
          <ThemedText style={styles.declineButtonText}>
            {isRejecting ? '...' : 'Decline'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
          disabled={isDisabled}
        >
          <ThemedText style={styles.acceptButtonText}>
            {isAccepting ? 'Accepting...' : 'Accept'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bidCard: {
    backgroundColor: '#E9F2FF',
    borderRadius: 20,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#D1E5FF',
  },
  bidTopContent: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
  },
  bidderSidebar: {
    alignItems: 'center',
    width: 60,
    marginRight: Spacing.two,
  },
  bidderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  bidderName: {
    fontSize: 14,
    color: '#1E2939',
    fontWeight: '500',
  },
  bidMainInfo: {
    flex: 1,
  },
  bidStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidStatusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E2939',
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1E2939',
  },
  bidMessage: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 20,
  },
  bidActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  declineButton: {
    flex: 1.2,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  declineButtonText: {
    color: '#EF4444',
    fontWeight: '500',
    fontSize: 18,
  },
  acceptButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthPalette.NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
