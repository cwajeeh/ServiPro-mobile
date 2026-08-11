import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthPalette, Spacing, TaskerPalette, Typography } from '@/constants/theme';

const { NAVY, WHITE } = { ...AuthPalette, WHITE: '#FFFFFF' };
const { ACCENT_BLUE } = TaskerPalette;

/** Light-blue promo card below the header when offline. */
export function TaskerHomePromoBanner() {
  return (
    <View style={styles.promoCard}>
      <View style={styles.promoTextCol}>
        <Text style={styles.promoLabel}>Special Offer</Text>
        <Text style={styles.promoTitle}>20% Bonus on first Job</Text>
      </View>
      <View style={styles.promoIconCircle}>
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 17l6-6 4 4 8-8" />
          <Path d="M14 7h7v7" />
        </Svg>
      </View>
    </View>
  );
}

function OfflineIllustration() {
  return (
    <View style={styles.illuWrap}>
      <View style={styles.zzzRow}>
        <Text style={styles.zzz}>Z</Text>
        <Text style={[styles.zzz, styles.zzzMid]}>z</Text>
        <Text style={[styles.zzz, styles.zzzSmall]}>z</Text>
      </View>
      <Svg width={160} height={130} viewBox="0 0 160 130">
        <Circle cx={80} cy={72} r={52} fill="#C5DCFA" />
        <Circle cx={80} cy={72} r={48} fill="#D8E8FC" />
        <Path d="M58 64 Q64 58 70 64" stroke="#6B8CBC" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Path d="M90 64 Q96 58 102 64" stroke="#6B8CBC" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Circle cx={80} cy={78} r={4} fill="#6B8CBC" />
      </Svg>
    </View>
  );
}

type TaskerOfflinePanelProps = {
  onOnlineNow: () => void;
  loading: boolean;
};

export function TaskerOfflinePanel({ onOnlineNow, loading }: TaskerOfflinePanelProps) {
  return (
    <View style={styles.offlineOuter}>
      <OfflineIllustration />
      <Text style={styles.offlineMessage}>
        {"You're offline right now — reconnect to see all the jobs waiting for you."}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.onlineBtn, pressed && styles.onlineBtnPressed, loading && styles.onlineBtnDisabled]}
        onPress={onOnlineNow}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={WHITE} />
        ) : (
          <Text style={styles.onlineBtnText}>Online Now</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  promoCard: {
    backgroundColor: ACCENT_BLUE,
    marginHorizontal: Spacing.four,
    borderRadius: 24,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -40,
    marginBottom: Spacing.three,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  promoTextCol: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  promoLabel: {
    color: 'rgba(255,255,255,0.9)',
    ...Typography.caption,
    marginBottom: 4,
  },
  promoTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  promoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illuWrap: {
    alignItems: 'center',
    marginBottom: Spacing.four,
    position: 'relative',
  },
  zzzRow: {
    position: 'absolute',
    top: 0,
    right: '18%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  zzz: {
    color: '#7C3AED',
    fontWeight: '800',
    fontSize: 22,
    marginLeft: 2,
  },
  zzzMid: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 4,
  },
  zzzSmall: {
    fontSize: 12,
    opacity: 0.75,
    marginBottom: 8,
  },
  offlineOuter: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: 'center',
  },
  offlineMessage: {
    ...Typography.bodyMedium,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  onlineBtn: {
    backgroundColor: NAVY,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: '88%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  onlineBtnPressed: {
    opacity: 0.9,
  },
  onlineBtnDisabled: {
    opacity: 0.85,
  },
  onlineBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});
