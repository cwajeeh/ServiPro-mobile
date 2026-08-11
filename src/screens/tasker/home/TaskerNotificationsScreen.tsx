import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { 
  Image, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { AuthToolPattern } from '../../../components/shared/auth-tool-pattern';

import { AuthPalette, Spacing, TaskerPalette, Typography } from '@/constants/theme';

const { NAVY, WHITE, GRAY } = { ...AuthPalette, WHITE: '#FFFFFF' };
const SUCCESS_GREEN = '#4CD964';

export function TaskerNotificationsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <AuthToolPattern />
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Today Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Pressable>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </Pressable>
        </View>

        <NotificationItem 
          type="review"
          name="Meg Griffin"
          message="has left you a review. Both of your reviews from this task are now public."
          date="March 1, 2026"
          unread
        />

        {/* Old Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Old</Text>
        </View>

        <NotificationItem 
          type="message"
          name="Muhammad Azeem"
          message="messaged you : Come fast"
          date="April 25, 2026"
          avatar="https://i.pravatar.cc/150?u=azeem"
        />

        <NotificationItem 
          type="message"
          name="Hamza Mehar"
          message="Messaged you : Come fast"
          date="March 6, 2026"
          avatar="https://i.pravatar.cc/150?u=hamza"
        />

        <NotificationItem 
          type="system"
          message="Please confirm your email address by clicking on the link we just emailed you. If you cannot find the email, you can request a new confirmation email or change your email address."
          date="March 1, 2026"
        />
      </ScrollView>
    </View>
  );
}

interface NotificationItemProps {
  type: 'review' | 'message' | 'system';
  name?: string;
  message: string;
  date: string;
  unread?: boolean;
  avatar?: string;
}

function NotificationItem({ name, message, date, unread, avatar }: NotificationItemProps) {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <View style={styles.avatarWrap}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
             <View style={styles.logoBadge}>
                 <Text style={styles.logoText}>S</Text>
             </View>
          )}
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.messageText}>
            {name && <Text style={styles.boldName}>{name} </Text>}
            {message}
          </Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        {unread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TaskerPalette.BG_LIGHT,
  },
  header: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: WHITE,
    ...Typography.h3,
    fontWeight: '500',
  },
  scroll: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.h4,
    color: '#1E293B',
  },
  markAllRead: {
    ...Typography.bodyMedium,
    color: NAVY,
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 16,
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  textWrap: {
    flex: 1,
  },
  boldName: {
    fontWeight: '600',
    color: '#0F172A',
  },
  messageText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  dateText: {
    ...Typography.tiny,
    color: GRAY,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SUCCESS_GREEN,
    marginLeft: 8,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
