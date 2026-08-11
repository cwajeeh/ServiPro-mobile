import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchServiceCategories } from '@/api/services';
import { useTopRatedProviders } from '@/hooks/useProvider';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import { useAuthStore } from '@/store/authStore';
import type { ServiceCategory } from '@/types/services';
import { logUnexpectedError } from '@/utils/devLog';
import { resolveMediaUrl } from '@/utils/mediaUrl';

import { CategoryItem } from '@/components/customer/CategoryItem';
import { HomeHeader } from '@/components/customer/HomeHeader';
import { HomePromoBanner } from '@/components/customer/HomePromoBanner';
import { HomeSearchBar } from '@/components/customer/HomeSearchBar';
import { SectionHeader } from '@/components/customer/SectionHeader';
import { TaskerCard } from '@/components/customer/TaskerCard';
import { customerDevMock, PROMO_BANNERS } from '@/constants/customerMockData';
import { AuthPalette } from '@/constants/theme';

const { NAVY } = AuthPalette;

export function HomeScreen() {
  const navigation = useCustomerTabNavigation();
  const user = useAuthStore((s) => s.user);
  const displayName = useMemo(() => {
    if (!user) {
      return 'Guest';
    }
    const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return full || user.email.split('@')[0] || 'Guest';
  }, [user]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchServiceCategories()
      .then((data) => setCategories(data))
      .catch((err) => logUnexpectedError('fetchServiceCategories', err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const { data: topTaskers, isLoading: loadingTopTaskers } = useTopRatedProviders(5);

  const promoBanners = customerDevMock(PROMO_BANNERS, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Section with Navy Background */}
          <View style={styles.headerBackground}>
            <HomeHeader
              userName={displayName}
              onProfilePress={() => navigation.navigate('CustomerProfile')}
              onNotificationPress={() => navigation.navigate('CustomerNotifications')}
            />
            <HomeSearchBar />
          </View>

          {/* First Promo Banner (dev mock only until CMS/API) */}
          {promoBanners.length > 0 ? (
            <View style={styles.promoBannerContainer}>
              <HomePromoBanner
                title={promoBanners[0].title}
                subtitle={promoBanners[0].subtitle}
                description="Start today and get 30% off your first service."
                ctaText={promoBanners[0].ctaText}
                image={promoBanners[0].image}
                backgroundColor={promoBanners[0].backgroundColor}
              />
            </View>
          ) : null}

          {/* Services Section */}
          <SectionHeader
            title="Services"
            onViewAll={() => navigation.navigate('CustomerAllServices')}
          />
          {loadingCategories ? (
            <ActivityIndicator size="large" color={NAVY} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.categoryGrid}>
              {categories.slice(0, 8).map((cat) => (
                <View key={cat.id} style={styles.gridItem}>
                  <CategoryItem
                    name={cat.name}
                    serviceCount={0} // Provide default placeholder since API might not return it yet
                    imageUrl={cat.icon}
                    backgroundColor={cat.backgroundColor}
                    onPress={() => navigation.navigate('CustomerSubCategories', {
                      categoryId: cat.id,
                      categoryName: cat.name
                    })}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Popular Services Section */}
          <SectionHeader
            title="Popular Services"
            onViewAll={() => navigation.navigate('CustomerPopularServices')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularCarousel}
          >
            {promoBanners.map((banner) => (
              <View key={banner.id} style={styles.carouselItem}>
                <HomePromoBanner
                  {...banner}
                />
              </View>
            ))}
          </ScrollView>

          {/* Top Rated Taskers Section */}
          <SectionHeader
            title="Top Rated Tasker"
            onViewAll={() => navigation.navigate('CustomerFindPro')}
          />
          {loadingTopTaskers ? (
            <ActivityIndicator size="small" color={NAVY} style={{ marginVertical: 10 }} />
          ) : (
            topTaskers?.map((tasker, idx) => (
              <TaskerCard
                key={`${tasker.id}-${idx}`}
                name={tasker.name}
                profession={tasker.category || 'Professional'}
                rating={tasker.avg_rating}
                location={tasker.address}
                pricePerHour={tasker.price_hourly}
                image={resolveMediaUrl(tasker.image) || 'https://i.pravatar.cc/300'}
                onPress={() => {
                  navigation.navigate('CustomerProviderDetails', { providerId: tasker.id });
                }}
              />
            ))
          )}

          {/* Padding at the bottom for navigation bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
    backgroundColor: AuthPalette.NAVY, // Match header background
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Content background
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridItem: {
    width: '25%',
  },
  popularCarousel: {
    paddingRight: 16,
  },
  carouselItem: {
    width: 320,
    paddingHorizontal: 16,
  },
  promoBannerContainer: {
    paddingHorizontal: 16,
    marginTop: -40, // Overlap the navy section
  },
  headerBackground: {
    backgroundColor: AuthPalette.NAVY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 60, // Extra padding to show the curve behind the banner
  },
});
