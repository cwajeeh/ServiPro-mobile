import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { APP_VERSION_LABEL } from '@/constants/appInfo';
import { AuthPalette, TaskerPalette } from '@/constants/theme';
import { nativeEnv } from '@/config/nativeEnv';
import { useConfirmDeleteAccount } from '@/hooks/useDeleteAccount';
import { useUserProfile } from '@/hooks/useProfile';
import { useSwitchRole } from '@/hooks/useSwitchRole';
import type { TaskerStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { useNotificationSocketStore } from '@/store/notificationSocketStore';
import { getUserDisplayName } from '@/utils/userDisplayName';

const { NAVY, WHITE, GRAY, PRIMARY_TEXT, ERROR_RED } = { ...AuthPalette, WHITE: '#FFFFFF' };
const { BG_LIGHT } = TaskerPalette;

export function TaskerProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TaskerStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile();
  const signOut = useAuthStore((s) => s.signOut);
  const unreadCount = useNotificationSocketStore((s) => s.unreadCount);
  const displayName = getUserDisplayName(user);
  const confirmDeleteAccount = useConfirmDeleteAccount();
  const switchRole = useSwitchRole();

  const avgRating = profile?.avgRating ?? 0;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTopRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>

            <Pressable style={styles.bellBtn}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                <Path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <Path d="M13.73 21a2 2 0 01-3.46 0" />
              </Svg>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>

          {/* User Card on Header */}
          <View style={styles.userCard}>
            <View style={styles.avatarLarge}>
              <View style={styles.avatarInner}>
                <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                  <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <Circle cx="12" cy="7" r="4" />
                </Svg>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= Math.round(avgRating) ? "#FFC107" : "#E2E8F0"}>
                      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </Svg>
                  ))}
                </View>
                <Text style={styles.ratingText}>{Number(avgRating).toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.switchCard}>
          <View style={styles.switchTop}>
            <View style={styles.briefcaseIconCircle}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
                <Path d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </Svg>
            </View>
            <View>
              <Text style={styles.switchTitle}>Switch to User Mode</Text>
              <Text style={styles.switchSubtitle}>Start placing your job</Text>
            </View>
          </View>
          <Pressable
            style={styles.switchBtn}
            disabled={switchRole.isPending}
            onPress={() => {
              Alert.alert('Switch to Customer', 'Switch your account to Customer mode?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Switch', onPress: () => switchRole.mutate() },
              ]);
            }}>
            <View style={styles.switchBtnLeft}>
              {switchRole.isPending ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
                  <Path d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                </Svg>
              )}
              <Text style={styles.switchBtnText}>Switch to User</Text>
            </View>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
              <Path d="M9 18l6-6-6-6" />
            </Svg>
          </Pressable>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon="user"
            label="My Profile"
            onPress={() => navigation.navigate('TaskerMyProfile' as never)}
          />
          <MenuItem
            icon="credit-card"
            label="My Wallet"
            onPress={() => navigation.navigate('TaskerWallet' as never)}
          />
          <MenuItem
            icon="star"
            label="My Reviews"
            onPress={() => navigation.navigate('TaskerReviews' as never)}
          />
          <MenuItem
            icon="gift"
            label="Refer a Friend"
            onPress={() => {
              void Linking.openURL(`${nativeEnv.webBaseUrl}/refer-a-friend`);
            }}
          />
          <MenuItem
            icon="file-text"
            label="Terms of use"
            onPress={() =>
              navigation.navigate('LegalWebView', { title: 'Terms of use', uri: nativeEnv.termsUrl })
            }
          />
          <MenuItem
            icon="shield"
            label="Privacy policy"
            onPress={() =>
              navigation.navigate('LegalWebView', { title: 'Privacy policy', uri: nativeEnv.privacyUrl })
            }
          />
          <MenuItem
            icon="list"
            label="FAQ"
            onPress={() =>
              navigation.navigate('LegalWebView', { title: 'FAQ', uri: nativeEnv.faqUrl })
            }
          />
          <MenuItem
            icon="help-circle"
            label="Help & Support"
            onPress={() => navigation.navigate('TaskerSupport')}
          />
          <MenuItem
            icon="settings"
            label="My Services"
            isLast
            onPress={() =>
              navigation.navigate('TaskerEditProfile', { initialTab: 'Services Info' })
            }
          />
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Pressable
            style={styles.logoutBtn}
            onPress={() => void signOut()}
            accessibilityRole="button"
            accessibilityLabel="Log out">
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
              <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </Svg>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={confirmDeleteAccount} accessibilityRole="button">
            <Text style={styles.deleteText}>Delete My Account</Text>
          </Pressable>

          <Text style={styles.versionText}>{APP_VERSION_LABEL}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, isLast, onPress }: { icon: string; label: string; isLast?: boolean; onPress?: () => void }) {
  return (
    <Pressable style={[styles.menuItem, isLast && styles.noBorder]} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#001A6E" strokeWidth="1.8">
          {icon === 'user' && (
            <>
              <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </>
          )}
          {icon === 'credit-card' && <Path d="M1 4h22v16H1zM1 10h22" />}
          {icon === 'star' && <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />}
          {icon === 'gift' && <Path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />}
          {icon === 'file-text' && <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />}
          {icon === 'help-circle' && (
            <>
              <Circle cx="12" cy="12" r="10" />
              <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
            </>
          )}
          {icon === 'shield' && <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
          {icon === 'list' && (
            <>
              <Path d="M8 6h13M8 12h13M8 18h13" strokeLinecap="round" />
              <Path d="M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
            </>
          )}
          {icon === 'settings' && (
            <>
              <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </>
          )}
        </Svg>
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5">
        <Path d="M9 18l6-6-6-6" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#001A6E',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 0,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 20,
  },
  headerTitleRow: {
    marginTop: 0,
    height: 150,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '500',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#001A6E',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 80, // Space for overlapping card
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: -60,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: '#001A6E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#001A6E',
  },
  switchCard: {
    backgroundColor: '#F9FAFE',
    borderRadius: 32,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  switchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  briefcaseIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#001A6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001A6E',
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  switchBtn: {
    backgroundColor: '#001A6E',
    borderRadius: 24,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  switchBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFE4E4',
    borderRadius: 32,
    width: '100%',
    height: 64,
    marginBottom: 20,
    backgroundColor: WHITE
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    marginBottom: 16,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  versionText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
