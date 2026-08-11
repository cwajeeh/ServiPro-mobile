import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAuthErrorMessage, resendOtpRequest, verifyEmailRequest } from '@/api/auth';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { buildSessionFromLoginData, useAuthStore } from '@/store/authStore';

const { NAVY, BLACK, LINK_BLUE } = AuthPalette;
const BACK_BTN_BG = '#D6E4FF';
const OTP_COUNT = 6;

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerify'>;


export function VerifyEmailScreen({ navigation, route }: Props) {
  const { email, roleForSignup } = route.params;
  const signIn = useAuthStore((s) => s.signIn);
  const setSessionFromLogin = useAuthStore((s) => s.setSessionFromLogin);
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_COUNT).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const setDigitAt = useCallback((index: number, raw: string) => {
    const d = raw.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = d;
      return next;
    });
    if (d && index < OTP_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const onKeyPress = useCallback(
    (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const onVerify = useCallback(async () => {
    const code = digits.join('');
    if (code.length !== OTP_COUNT) {
      Alert.alert('Verification', 'Enter the 6-digit code from your email.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await verifyEmailRequest({ email, token: code });

      if (data && 'tokens' in data && 'user' in data) {
        const session = buildSessionFromLoginData(data);
        if (session) {
          setSessionFromLogin(session);
          return;
        }
      }

      if (roleForSignup === 'tasker') {
        navigation.navigate('TaskerCategorySelect');
      } else {
        signIn(roleForSignup);
      }
    } catch (err) {
      Alert.alert('Verification Failed', getAuthErrorMessage(err, 'Could not verify your email.'));
    } finally {
      setIsLoading(false);
    }
  }, [digits, email, roleForSignup, signIn, setSessionFromLogin, navigation]);

  const onResend = useCallback(async () => {
    try {
      setIsResending(true);
      await resendOtpRequest(email);
      Alert.alert('Resend email', 'A new code has been sent to your inbox.');
    } catch (err) {
      Alert.alert('Error', getAuthErrorMessage(err, 'Could not resend the code.'));
    } finally {
      setIsResending(false);
    }
  }, [email]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <View style={styles.headerRow}>
            <Pressable
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <Text style={styles.backChevron}>‹</Text>
            </Pressable>
            <Text style={styles.headerTitle} accessibilityRole="header">
              Verify your email
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.body}>
            <View style={styles.iconWrapContainer}>
              <Image
                source={require('../../../assets/images/icons/elements.png')}
                style={styles.iconWrap}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.lead}>
              We just sent a Verification Code to{' '}
              <Text style={styles.emailHighlight}>{email}</Text>.
            </Text>
            <Text style={styles.subLead}>
              Enter the 6-digit code from your email and you&apos;re good to go!
            </Text>

            <View style={styles.otpRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  style={[styles.otpCell, digit ? styles.otpCellFilled : null]}
                  value={digit}
                  onChangeText={(t) => setDigitAt(i, t)}
                  onKeyPress={(e) => onKeyPress(i, e)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                  accessibilityLabel={`Digit ${i + 1} of verification code`}
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.verifyBtn,
                (pressed || isLoading) && styles.verifyBtnPressed,
              ]}
              onPress={isLoading ? undefined : onVerify}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Verify email">
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </Pressable>

            <Text style={styles.resendRow}>
              Didn&apos;t get it?{' '}
              <Text
                style={[styles.resendLink, isResending && { opacity: 0.5 }]}
                onPress={isResending ? undefined : onResend}
                accessibilityRole="link"
              >
                {isResending ? 'Resending...' : 'Resend email'}
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safe: {
    flex: 1,
    zIndex: 1,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BACK_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 28,
    fontWeight: '600',
    color: NAVY,
    marginTop: -2,
    marginRight: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: NAVY,
  },
  headerSpacer: {
    width: 44,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  iconWrapContainer: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Light gray border
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.six,
  },
  iconWrap: {
    width: 40,
    height: 40,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    color: BLACK,
    textAlign: 'center',
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  emailHighlight: {
    color: LINK_BLUE,
    fontWeight: '700',
  },
  subLead: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    textAlign: 'center',
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.five,
  },
  otpCell: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: NAVY,
    fontSize: 22,
    fontWeight: '700',
    color: NAVY,
    backgroundColor: '#FFFFFF',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  otpCellFilled: {
    backgroundColor: 'rgba(0,26,110,0.04)',
  },
  verifyBtn: {
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  verifyBtnPressed: {
    opacity: 0.92,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  resendRow: {
    textAlign: 'center',
    fontSize: 15,
    color: '#444',
  },
  resendLink: {
    color: LINK_BLUE,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
