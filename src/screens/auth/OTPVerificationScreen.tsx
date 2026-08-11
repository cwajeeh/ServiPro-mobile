import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { forgotPasswordRequest, getAuthErrorMessage, verifyPasswordTokenRequest } from '@/api/auth';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { PRIMARY_TEXT, BORDER, GRAY, SECONDARY_BG, MAIN_BLUE } = AuthPalette;

const OTP_LENGTH = 6;
/** Seconds before resend is allowed (forgot-password flow uses same API as initial send). */
const RESEND_COOLDOWN_SEC = 60;

function formatResendCooldown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

export function OTPVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  /** 0 = user can tap Resend (calls forgot password API). >0 shows countdown. */
  const [resendCooldownSec, setResendCooldownSec] = useState(RESEND_COOLDOWN_SEC);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (resendCooldownSec <= 0) {
      return;
    }
    const id = setTimeout(() => {
      setResendCooldownSec((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearTimeout(id);
  }, [resendCooldownSec]);

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const onConfirm = useCallback(async () => {
    const token = code.join('');
    if (token.length !== OTP_LENGTH) {
      Alert.alert('Verification', `Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }
    setSubmitting(true);
    try {
      const resetToken = await verifyPasswordTokenRequest({ email, token });
      navigation.navigate('SetNewPassword', { email, resetToken });
    } catch (e) {
      Alert.alert('Verification', getAuthErrorMessage(e, 'Could not verify code.'));
    } finally {
      setSubmitting(false);
    }
  }, [code, email, navigation]);

  const onResend = useCallback(async () => {
    if (resending) {
      return;
    }
    setResending(true);
    try {
      await forgotPasswordRequest(email);
      setResendCooldownSec(RESEND_COOLDOWN_SEC);
      Alert.alert('Email sent', 'Check your inbox for a new code.');
    } catch (e) {
      Alert.alert('Resend', getAuthErrorMessage(e, 'Could not resend code.'));
    } finally {
      setResending(false);
    }
  }, [email, resending]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M15 18l-6-6 6-6" stroke={MAIN_BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
              <Text style={styles.headerTitle}>OTP Verification</Text>
            </View>

            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/images/icons/elements.png')}
                style={styles.iconWrap}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>
              We just sent a reset link to <Text style={styles.boldEmail}>{email}</Text>. Enter the {OTP_LENGTH}
              -digit code from your email and you&apos;re good to go
            </Text>

            <View style={styles.otpContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    if (el) inputs.current[index] = el;
                  }}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => onKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                submitting && styles.primaryBtnDisabled,
                pressed && !submitting && styles.primaryBtnPressed,
              ]}
              onPress={() => void onConfirm()}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Confirm</Text>
              )}
            </Pressable>

            <View style={styles.resendWrap}>
              <Text style={styles.resendRow}>Didn&apos;t get it? </Text>
              {resendCooldownSec > 0 ? (
                <Text style={styles.resendCooldownLabel}>
                  Resend in {formatResendCooldown(resendCooldownSec)}
                </Text>
              ) : (
                <Pressable onPress={() => void onResend()} disabled={resending} accessibilityRole="button">
                  <Text style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
                    {resending ? 'Sending…' : 'Resend email'}
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1, zIndex: 1 },
  flex: { flex: 1 },
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
  iconContainer: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.six,
  },
  iconWrap: {
    width: 40,
    height: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    marginBottom: Spacing.six,
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  boldEmail: { fontWeight: '700', color: MAIN_BLUE },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.six,
  },
  otpInput: {
    flex: 1,
    minWidth: 40,
    maxWidth: 52,
    height: 52,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.two,
    fontSize: 20,
    fontWeight: '700',
    color: MAIN_BLUE,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  otpInputFilled: { borderColor: MAIN_BLUE },
  primaryBtn: {
    backgroundColor: MAIN_BLUE,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  primaryBtnDisabled: { opacity: 0.85 },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendRow: { fontSize: 15, color: '#666666' },
  resendLink: { fontSize: 15, color: MAIN_BLUE, fontWeight: '700' },
  resendLinkDisabled: { opacity: 0.6 },
  resendCooldownLabel: {
    fontSize: 15,
    color: GRAY,
    fontWeight: '600',
  },
});
