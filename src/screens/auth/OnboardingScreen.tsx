import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AuthPalette, Spacing, Typography } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { ONBOARDING_SLIDES } from '@/screens/auth/onboardingContent';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const { NAVY } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SCREEN_WIDTH);
    setIndex(Math.min(Math.max(i, 0), ONBOARDING_SLIDES.length - 1));
  }, []);

  const goNext = useCallback(() => {
    if (index < ONBOARDING_SLIDES.length - 1) {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setIndex(next);
    } else {
      navigation.navigate('SignIn');
    }
  }, [index, navigation]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Background Images Layer */}
      <View style={StyleSheet.absoluteFill}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
        >
          {ONBOARDING_SLIDES.map((slide, i) => (
            <View key={i} style={styles.page}>
              <Image
                source={{ uri: slide.image }}
                style={styles.bgImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Overlay Content Panel */}
      <View style={[styles.overlayContainer, { height: SCREEN_HEIGHT * 0.45 }]}>
        {/* Organic Curve SVG */}
        <View style={styles.curveSpacer}>
          <Svg
            width={SCREEN_WIDTH}
            height={80}
            viewBox={`0 0 ${SCREEN_WIDTH} 80`}
            style={styles.curveSvg}
          >
            <Path
              d={`M0 80 C ${SCREEN_WIDTH * 0.25} 0, ${SCREEN_WIDTH * 0.75} 0, ${SCREEN_WIDTH} 80 L${SCREEN_WIDTH} 80 L0 80 Z`}
              fill={NAVY}
            />
          </Svg>
        </View>

        <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
          <View style={styles.progressRow}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dash,
                  i === index && styles.dashActive,
                  i < index && styles.dashCompleted
                ]}
              />
            ))}
          </View>

          <Text style={styles.title}>{ONBOARDING_SLIDES[index].title}</Text>
          <Text style={styles.subtitle}>{ONBOARDING_SLIDES[index].subtitle}</Text>
        </View>
      </View>

      {/* Next Button FAB */}
      <Pressable
        onPress={goNext}
        style={({ pressed }) => [
          styles.nextFab,
          {
            bottom: Math.max(insets.bottom, Spacing.four),
            right: Spacing.four,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#001A6E" strokeWidth="2">
          <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  curveSpacer: {
    height: 80,
    width: SCREEN_WIDTH,
  },
  curveSvg: {
    position: 'absolute',
    bottom: -1, // overlap to prevent gap
  },
  panel: {
    backgroundColor: NAVY,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    minHeight: 220,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.four,
  },
  dash: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dashActive: {
    backgroundColor: '#4E9FFF', // Bright blue from screenshot
    width: 32,
  },
  dashCompleted: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  title: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 36,
    marginBottom: Spacing.two,
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    paddingRight: 60, // Leave room for FAB
  },
  nextFab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});
