import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { ServiscaMarkSvg } from '@/components/shared/servisca-mark-svg';
import { AuthPalette, Spacing, Typography } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { NAVY, BLACK } = AuthPalette;
const LOGO_SIZE = 140; // Slightly reduced from 168

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <Pressable
        style={styles.tapRoot}
        onPress={() => navigation.navigate('Onboarding')}
        accessibilityRole="button"
        accessibilityLabel="Continue to onboarding">
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <ServiscaMarkSvg size={LOGO_SIZE} />
            <Text style={styles.brand} accessibilityRole="header">
              <Text style={styles.brandBlack}>SERVIS</Text>
              <Text style={styles.brandNavy}>CA</Text>
            </Text>
            <Text style={styles.tagline}>
              <Text style={styles.tagBlack}>Click</Text>
              <Text style={styles.tagBlack}> | </Text>
              <Text style={styles.tagNavy}>Book</Text>
              <Text style={styles.tagBlack}> | </Text>
              <Text style={styles.tagBlack}>Done</Text>
            </Text>
          </View>
        </SafeAreaView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tapRoot: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  brand: {
    marginTop: Spacing.two,
    fontSize: 28, // Reduced from 34
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  brandBlack: { color: BLACK },
  brandNavy: { color: NAVY },
  tagline: {
    marginTop: Spacing.half,
    ...Typography.body,
    letterSpacing: 3.5,
    textAlign: 'center',
  },
  tagBlack: { color: BLACK },
  tagNavy: { color: NAVY },
});
