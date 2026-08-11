import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { NAVY, PRIMARY_TEXT, SECONDARY_BG, MAIN_BLUE } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetSuccess'>;

export function ResetSuccessScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerRow}>
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M15 18l-6-6 6-6" stroke={MAIN_BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Text style={styles.headerTitle}>You're All Set</Text>
          </View>

          <View style={styles.iconContainer}>
            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke={MAIN_BLUE} strokeWidth="1.5" />
              <Path d="M8 12l3 3 5-6" stroke={MAIN_BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>

          <Text style={styles.subtitle}>
            You can continue to sign in, or use Forgot password if you still need to set a new password.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
            onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.primaryBtnText}>Continue to Sign In</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1, zIndex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    paddingTop: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.six,
    marginTop: Spacing.four,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SECONDARY_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: PRIMARY_TEXT },
  iconContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.five },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    marginBottom: 64,
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  boldText: { fontWeight: '700', color: MAIN_BLUE },
  primaryBtn: {
    backgroundColor: MAIN_BLUE,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
