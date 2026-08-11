import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useNotificationSocketStore } from '@/store/notificationSocketStore';

interface HomeHeaderProps {
  userName: string;
  profileImage?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export function HomeHeader({ userName, profileImage, onProfilePress, onNotificationPress }: HomeHeaderProps) {
  const unreadCount = useNotificationSocketStore((s) => s.unreadCount);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          <ThemedText style={styles.avatarText}>MA</ThemedText>
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.welcomeText}>Welcome</ThemedText>
          <ThemedText style={styles.userName}>{userName} 👋</ThemedText>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color="#FFF" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onProfilePress}>
          <Ionicons name="person-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
  avatarText: {
    color: AuthPalette.NAVY,
    fontSize: 16,
    fontWeight: '500',
  },
  textContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    color: '#CCC', // Light gray for "Welcome"
    fontSize: 12,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.two,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AuthPalette.NAVY,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
});
