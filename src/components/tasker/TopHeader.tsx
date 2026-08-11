import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthPalette, Spacing, TaskerPalette, Typography } from '@/constants/theme';
import type { TaskerStackParamList } from '@/navigation/types';

const { NAVY, WHITE, GRAY } = { ...AuthPalette, WHITE: '#FFFFFF' };
const { BADGE_RED } = TaskerPalette;

interface TopHeaderProps {
  userName: string;
  location: string;
  notificationCount: number;
  /** From GET /user/online-status (`data.is_online`). */
  isOnline: boolean;
  /** Flip online ↔ offline; parent reads latest state and calls PATCH (avoid stale `!isOnline`). */
  onOnlineToggle: () => void;
  /** Disables the toggle while PATCH /user/online-status is in flight. */
  onlineToggleDisabled?: boolean;
}

export function TopHeader({
  userName,
  location,
  notificationCount,
  isOnline,
  onOnlineToggle,
  onlineToggleDisabled = false,
}: TopHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<TaskerStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.locationGroup}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <Circle cx="12" cy="10" r="3" />
          </Svg>
          <Text style={styles.locationText}>{location}</Text>
        </View>
        <View style={styles.iconGroup}>
          <Pressable 
            style={styles.iconBtn}
            onPress={() => navigation.navigate('TaskerNotifications')}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
              <Path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <Path d="M13.73 21a2 2 0 01-3.46 0" />
            </Svg>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable 
            style={styles.profileCircle}
            onPress={() => navigation.navigate('TaskerProfile')}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2">
              <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          </Pressable>
        </View>
      </View>

      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.nameText}>{userName}</Text>
        </View>
        <Pressable
          disabled={onlineToggleDisabled}
          onPress={onOnlineToggle}
          style={[
            styles.switchTrack,
            isOnline ? styles.switchOn : styles.switchOff,
            onlineToggleDisabled && styles.switchDisabled,
          ]}>
          <View style={[styles.switchThumb, isOnline ? styles.thumbOn : styles.thumbOff]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: NAVY,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  locationText: {
    color: WHITE,
    ...Typography.caption,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: BADGE_RED,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: NAVY,
  },
  badgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    color: WHITE,
    ...Typography.h3,
    fontWeight: '500',
  },
  nameText: {
    color: WHITE,
    ...Typography.h1,
    fontWeight: '600',
    marginTop: -2,
  },
  switchTrack: {
    width: 60,
    height: 32,
    borderRadius: 16,
    padding: 4,
  },
  switchOn: {
    backgroundColor: '#4CD964',
  },
  switchOff: {
    backgroundColor: '#E0E0E0',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WHITE,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  switchDisabled: {
    opacity: 0.55,
  },
});
