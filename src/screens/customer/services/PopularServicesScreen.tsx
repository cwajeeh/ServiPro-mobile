import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HomePromoBanner } from '@/components/customer/HomePromoBanner';
import { ScreenHeader } from '@/components/customer/ScreenHeader';
import { customerDevMock, PROMO_BANNERS } from '@/constants/customerMockData';
import { Spacing } from '@/constants/theme';

export function PopularServicesScreen() {
  const promoBanners = customerDevMock(PROMO_BANNERS, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScreenHeader title="Popular Services" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bannerList}>
          {promoBanners.map((banner) => (
            <View key={banner.id} style={styles.bannerWrapper}>
              <HomePromoBanner
                {...banner}
              />
            </View>
          ))}

        </View>

        {/* Bottom Padding for Tab Bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  bannerList: {
    gap: Spacing.two,
  },
  bannerWrapper: {
    marginBottom: -Spacing.one,
  },
});
