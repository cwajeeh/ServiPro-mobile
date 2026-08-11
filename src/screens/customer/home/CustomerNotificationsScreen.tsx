import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationItemData } from '@/api/notifications';
import { AuthPalette, Spacing, Typography } from '@/constants/theme';
import { useNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '@/hooks/useNotifications';

const { NAVY, WHITE, GRAY } = { ...AuthPalette, WHITE: '#FFFFFF' };
const SUCCESS_GREEN = '#4CD964';

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function CustomerNotificationsScreen() {
  const navigation = useNavigation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useNotifications();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const sections = useMemo(() => {
    const notifications = data?.pages.flatMap((page) => page.items) ?? [];
    const today = new Date();
    const todayItems: NotificationItemData[] = [];
    const previousItems: NotificationItemData[] = [];

    notifications.forEach((item) => {
      const date = new Date(item.created_at);
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        todayItems.push(item);
      } else {
        previousItems.push(item);
      }
    });

    const result = [];
    if (todayItems.length > 0) {
      result.push({ title: 'Today', data: todayItems });
    }
    if (previousItems.length > 0) {
      result.push({ title: 'Previous', data: previousItems });
    }
    return result;
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {title === 'Today' && (
        <Pressable onPress={() => markAllAsRead()} disabled={isMarkingAll}>
          <Text style={[styles.markAllRead, isMarkingAll && { opacity: 0.5 }]}>
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: NotificationItemData }) => (
    <NotificationItem
      title={item.title}
      message={item.body}
      type={item.type}
      date={formatRelativeDate(item.created_at)}
      unread={!item.is_read}
      onPress={() => {
        if (!item.is_read) {
          markAsRead(item.id);
        }
      }}
    />
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Curved Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </SafeAreaView>
      </View>

      {isLoading && !data ? (
        <View style={styles.centerParams}>
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `notification-${String(item.id)}-${index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={{ paddingVertical: 20 }} color={NAVY} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

interface NotificationItemProps {
  type: string;
  title: string;
  message: string;
  date: string;
  unread?: boolean;
  avatar?: string;
  onPress?: () => void;
}

function NotificationItem({ title, message, date, unread, avatar, onPress }: NotificationItemProps) {
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!unread && !onPress}
    >
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
            <Text style={styles.boldName}>{title}</Text>
            {'\n'}
            {message}
          </Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        {unread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.divider} />
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFF',
    marginLeft: Spacing.two,
  },
  centerParams: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
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
    color: '#94A3B8',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: '#64748B',
  },
});
