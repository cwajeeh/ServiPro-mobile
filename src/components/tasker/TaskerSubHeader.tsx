import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { AuthPalette, Spacing } from '@/constants/theme';

const { NAVY, WHITE } = { ...AuthPalette, WHITE: '#FFFFFF' };

interface TaskerSubHeaderProps {
  title: string;
  subtitle: string;
  showSwitch?: boolean;
  onBack?: () => void;
}

export function TaskerSubHeader({ 
  title, 
  subtitle, 
  showSwitch = true,
  onBack,
}: TaskerSubHeaderProps) {
  const { isOnline, toggle, isUpdating } = useUserOnlineStatus();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          )}
          <View style={styles.textGroup}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.subtitleText}>{subtitle}</Text>
          </View>
        </View>
        
        {showSwitch && (
          <Pressable
            disabled={isUpdating}
            onPress={toggle}
            style={[
              styles.switchTrack, 
              isOnline ? styles.switchOn : styles.switchOff,
              isUpdating && { opacity: 0.6 }
            ]}
            accessibilityRole="switch"
            accessibilityLabel="Toggle online status">
            <View style={[styles.switchThumb, isOnline ? styles.thumbOn : styles.thumbOff]} />
          </Pressable>
        )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: Spacing.three,
    marginLeft: -Spacing.one,
  },
  textGroup: {
    flex: 1,
  },
  titleText: {
    color: WHITE,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  switchTrack: {
    width: 60,
    height: 32,
    borderRadius: 16,
    padding: 4,
    backgroundColor: '#E0E0E0',
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
    // Add subtle shadow for thumb
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
});
