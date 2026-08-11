import { AuthPalette, Typography } from '@/constants/theme';
import { useMyProviderProfile } from '@/hooks/useProvider';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { AuthToolPattern } from '../../../components/shared/auth-tool-pattern';
import { getMediaBaseUrl } from '@/utils/mediaUrl';

const { NAVY, WHITE, GRAY } = { ...AuthPalette, WHITE: '#FFFFFF' };
const ACCENT_BLUE = '#3A5A98';
const ERROR_RED = '#FF3B30';

export function TaskerMyProfileScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('About Me');

  const { data: profile, isLoading, isError } = useMyProviderProfile();

  if (isLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: NAVY }}>Failed to load profile. Please try again later.</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: ACCENT_BLUE, fontWeight: 'bold' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return 'https://i.pravatar.cc/300?u=john';
    if (url.startsWith('http')) return url;

    const baseUrl = getMediaBaseUrl();
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBase}${cleanPath}`;
  };

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
            <Text style={styles.headerTitle}>My Profile</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => navigation.navigate('TaskerEditProfile')}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2">
                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </Svg>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: getFullImageUrl(profile.profile_image) }}
              style={styles.avatar}
            />
          </View>
        </View>

        <View style={styles.profileHeader}>
          <Text style={styles.userName}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.userRole}>{profile.categoryname}</Text>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {['About Me', 'Services Info', 'Portfolio'].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'About Me' && (
          <View style={styles.content}>
            {/* Contact Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.infoRow}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT_BLUE} strokeWidth="2">
                  <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <Path d="M22 6l-10 7L2 6" />
                </Svg>
                <Text style={styles.infoText}>{profile.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT_BLUE} strokeWidth="2">
                  <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 015.06 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </Svg>
                <Text style={styles.infoText}>{profile.countrycode} {profile.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT_BLUE} strokeWidth="2">
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
                <Text style={styles.infoText}>{profile.address || 'Address not available'}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {profile.description || 'No description provided.'}
              </Text>
            </View>

            {/* Certifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {profile.certificates?.length > 0 ? (
                profile.certificates.map((cert: any) => (
                  <CertificationCard
                    key={cert.id}
                    title={cert.certificate_name}
                    date={cert.issue_date}
                    desc={cert.description}
                    fileUrl={cert.file_url}
                    getFullImageUrl={getFullImageUrl}
                  />
                ))
              ) : (
                <Text style={styles.descriptionText}>No certifications added yet.</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'Services Info' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services You Offer</Text>
              <View style={styles.offersRow}>
                {profile.subcategories?.filter((s: any) => s.isSelected).map((subcat: any) => (
                  <View key={subcat.id} style={styles.offerBadge}>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2">
                      <Path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z" />
                    </Svg>
                    <Text style={styles.offerBadgeText}>{subcat.name}</Text>
                  </View>
                ))}
                {(!profile.subcategories || profile.subcategories.filter((s: any) => s.isSelected).length === 0) && (
                  <Text style={styles.descriptionText}>No services selected.</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills (Subcategories)</Text>
              {profile.subcategories?.filter((s: any) => s.isSelected).length > 0 ? (
                profile.subcategories.filter((s: any) => s.isSelected).map((sub: any) => (
                  <SkillCard
                    key={sub.id}
                    title={sub.name}
                    badge="Active"
                    badgeColor="#82E0AA"
                  />
                ))
              ) : (
                <Text style={styles.descriptionText}>No skills added yet.</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'Portfolio' && (
          <View style={styles.content}>
            <View style={styles.portfolioGrid}>
              {profile.portfolio?.length > 0 ? (
                profile.portfolio.map((item: any) => (
                  <View key={item.id} style={styles.portfolioItem}>
                    <Image
                      source={{ uri: getFullImageUrl(item.image_url) }}
                      style={styles.portfolioImg}
                    />
                  </View>
                ))
              ) : (
                <Text style={styles.descriptionText}>No portfolio images added yet.</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Pressable
            style={styles.dashboardBtn}
            onPress={() => navigation.navigate('TaskerTabs' as never)}
          >
            <Text style={styles.dashboardBtnText}>Back To Dashboard</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SkillCard({ title, badge, badgeColor }: { title: string; badge: string; badgeColor: string }) {
  return (
    <View style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillTitle}>{title}</Text>
        <View style={[styles.skillBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.skillBadgeText}>{badge}</Text>
        </View>
      </View>
    </View>
  );
}

function CertificationCard({ title, date, desc, fileUrl, getFullImageUrl }: { title: string; date: string; desc: string; fileUrl?: string; getFullImageUrl: (u: string | null | undefined) => string }) {
  return (
    <View style={styles.certCard}>
      <View style={styles.certIconWrap}>
        <Image
          source={{ uri: getFullImageUrl(fileUrl) }}
          style={styles.certImg}
        />
      </View>
      <View style={styles.certInfo}>
        <Text style={styles.certTitle}>{title}</Text>
        <Text style={styles.certDate}>{date}</Text>
        <Text style={styles.certDesc} numberOfLines={2}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WHITE,
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
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '500',
  },
  scroll: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#F1F5F9',
  },
  profileHeader: {
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 24,
    marginLeft: 20
  },
  userName: {
    ...Typography.h2,
    color: NAVY,
  },
  userRole: {
    ...Typography.body,
    color: GRAY,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 20,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#FFD700',
  },
  tabText: {
    fontSize: 14,
    color: GRAY,
    fontWeight: '600',
  },
  tabTextActive: {
    color: NAVY,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h3,
    color: NAVY,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    ...Typography.body,
    color: '#334155',
  },
  descriptionText: {
    ...Typography.body,
    color: '#475569',
    lineHeight: 22,
  },
  certCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  certIconWrap: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  certImg: {
    width: '100%',
    height: '100%',
  },
  certInfo: {
    flex: 1,
  },
  certTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: NAVY,
    marginBottom: 2,
  },
  certDate: {
    ...Typography.tiny,
    color: GRAY,
    marginBottom: 4,
  },
  certDesc: {
    ...Typography.tiny,
    color: '#64748B',
    lineHeight: 14,
  },
  offersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  offerBadgeText: {
    ...Typography.bodyMedium,
    color: '#334155',
  },
  skillCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillTitle: {
    ...Typography.h4,
    color: '#1E293B',
    flex: 1,
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  skillBadgeText: {
    color: WHITE,
    ...Typography.tinyBold,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  portfolioItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  portfolioImg: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  dashboardBtn: {
    backgroundColor: NAVY,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBtnText: {
    color: WHITE,
    ...Typography.bodyBold,
    fontSize: 16,
  },
});
