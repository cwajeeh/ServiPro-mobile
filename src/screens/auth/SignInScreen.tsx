import { firebaseLoginRequest, getLoginErrorMessage, loginRequest } from '@/api/auth';
import { AuthOrSocialRow } from '@/components/shared/auth-or-social-row';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { ServiscaMarkSvg } from '@/components/shared/servisca-mark-svg';
import { nativeEnv } from '@/config/nativeEnv';
import { isGoogleWebClientConfigured } from '@/config/env';
import { AuthPalette, Spacing, Typography } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { buildSessionFromLoginData, useAuthStore } from '@/store/authStore';
import { getFirebaseIdTokenFromApple, isAppleSignInCancelledError } from '@/utils/appleAuth';
import {
  getGoogleSignInAlertMessage,
  isGoogleSignInCancelled,
  signInWithGoogleIdToken,
} from '@/utils/googleSignIn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const { NAVY, BLACK, BORDER, GRAY, LINK_BLUE } = AuthPalette;
const LOGO_MARK = 52;

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const setSessionFromLogin = useAuthStore((s) => s.setSessionFromLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Sign in', 'Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    let sessionEstablished = false;
    try {
      const data = await loginRequest({
        email: email.trim().toLowerCase(),
        password,
      });
      const session = buildSessionFromLoginData(data);
      if (!session) {
        Alert.alert('Sign in', 'This account type is not supported.');
        return;
      }
      setSessionFromLogin(session);
      sessionEstablished = true;
      // Keep loading visible until RootNavigator swaps the tree and this screen unmounts.
    } catch (e) {
      Alert.alert('Sign in', getLoginErrorMessage(e));
    } finally {
      if (!sessionEstablished) {
        setSubmitting(false);
      }
    }
  }, [email, password, setSessionFromLogin]);

  const onGoogleSignIn = useCallback(async () => {
    try {
      setSubmitting(true);
      const idToken = await signInWithGoogleIdToken();
      const data = await firebaseLoginRequest(idToken);
      const session = buildSessionFromLoginData(data);
      if (!session) {
        Alert.alert('Sign in', 'This account type is not supported.');
        return;
      }
      setSessionFromLogin(session);
    } catch (e: unknown) {
      if (isGoogleSignInCancelled(e)) {
        return;
      }
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code?: string }).code : undefined;
      if (code === '12501') {
        return;
      }
      Alert.alert('Google Sign-In', getGoogleSignInAlertMessage(e, getLoginErrorMessage(e)));
    } finally {
      setSubmitting(false);
    }
  }, [setSessionFromLogin]);

  const onAppleSignIn = useCallback(async () => {
    try {
      if (Platform.OS !== 'ios') {
        Alert.alert('Apple Sign-In', 'Sign in with Apple is only available on iOS devices.');
        return;
      }
      setSubmitting(true);
      const idToken = await getFirebaseIdTokenFromApple();
      const data = await firebaseLoginRequest(idToken);
      const session = buildSessionFromLoginData(data);
      if (!session) {
        Alert.alert('Sign in', 'This account type is not supported.');
        return;
      }
      setSessionFromLogin(session);
    } catch (e: unknown) {
      if (isAppleSignInCancelledError(e)) {
        return;
      }
      Alert.alert('Apple Sign-In', getLoginErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }, [setSessionFromLogin]);

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
            <View style={styles.brandRow}>
              <ServiscaMarkSvg size={LOGO_MARK} />
              <View style={styles.brandTextCol}>
                <Text style={styles.brand} accessibilityRole="header">
                  <Text style={styles.brandBlack}>SERVIS</Text>
                  <Text style={styles.brandNavy}>CA</Text>
                </Text>
                <Text style={styles.tagline}>
                  <Text style={styles.tagMuted}>Click</Text>
                  <Text style={styles.tagMuted}> | </Text>
                  <Text style={styles.tagNavy}>Book</Text>
                  <Text style={styles.tagMuted}> | </Text>
                  <Text style={styles.tagMuted}>Done</Text>
                </Text>
              </View>
            </View>

            <Text style={styles.screenTitle}>Sign In</Text>
            <Text style={styles.welcomeCopy}>
              Welcome back! Enter your credentials to access trusted handyman services and get the job done
              with ease.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor={GRAY}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setPasswordVisible((v) => !v)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {passwordVisible ? (
                    <>
                      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
                      <Path d="M12 12a3 3 0 01-3-3" />
                    </>
                  ) : (
                    <>
                      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </>
                  )}
                </Svg>
              </Pressable>
            </View>

            <View style={styles.rowBetween}>
              <Pressable
                style={styles.rememberRow}
                onPress={() => setRemember((r) => !r)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: remember }}>
                <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                  {remember ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberLabel}>Remember me</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && !submitting && styles.primaryBtnPressed,
                submitting && styles.primaryBtnDisabled,
              ]}
              onPress={() => void onSubmit()}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Sign in">
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </Pressable>

            <View style={styles.signUpWrap}>
              <Text style={styles.signUpRow}>Don&apos;t have an account? </Text>
              <Pressable
                onPress={() => navigation.navigate('SignUp')}
                accessibilityRole="link"
                accessibilityLabel="Sign up">
                <Text style={styles.signUpLink}>Sign Up</Text>
              </Pressable>
            </View>

            <AuthOrSocialRow
              onGooglePress={onGoogleSignIn}
              onApplePress={onAppleSignIn}
              googleSignInEnabled={isGoogleWebClientConfigured()}
            />

            <View style={styles.legalRow}>
              <Text style={styles.legalMuted}>
                By continuing you agree to our{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() =>
                    navigation.navigate('LegalWebView', {
                      title: 'Terms of use',
                      uri: nativeEnv.termsUrl,
                    })
                  }
                  accessibilityRole="link">
                  Terms of use
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() =>
                    navigation.navigate('LegalWebView', {
                      title: 'Privacy policy',
                      uri: nativeEnv.privacyUrl,
                    })
                  }
                  accessibilityRole="link">
                  Privacy policy
                </Text>
                .
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {submitting ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={NAVY} />
          <Text style={styles.loadingLabel}>Signing you in…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safe: {
    flex: 1,
    zIndex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    paddingTop: Spacing.two,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brand: {
    ...Typography.h1,
    letterSpacing: 1,
  },
  brandBlack: { color: BLACK },
  brandNavy: { color: NAVY },
  tagline: {
    marginTop: Spacing.half,
    ...Typography.tiny,
    letterSpacing: 2,
  },
  tagMuted: { color: BLACK },
  tagNavy: { color: NAVY, fontWeight: '600' },
  screenTitle: {
    ...Typography.h1,
    color: BLACK,
    marginBottom: Spacing.two,
  },
  welcomeCopy: {
    ...Typography.body,
    lineHeight: 20,
    color: '#444',
    marginBottom: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    ...Typography.body,
    color: BLACK,
    marginBottom: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.two,
    marginBottom: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    ...Typography.body,
    color: BLACK,
  },
  eyeBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  eyeGlyph: {
    fontSize: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  checkboxOn: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  checkMark: {
    color: '#FFF',
    ...Typography.tinyBold,
  },
  rememberLabel: {
    ...Typography.body,
    color: BLACK,
  },
  forgot: {
    ...Typography.bodyBold,
    color: BLACK,
  },
  primaryBtn: {
    backgroundColor: NAVY,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnDisabled: {
    opacity: 0.85,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    ...Typography.bodyBold,
    fontSize: 16,
  },
  signUpWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  signUpRow: {
    ...Typography.body,
    color: '#444',
  },
  signUpLink: {
    ...Typography.bodyBold,
    color: LINK_BLUE,
  },
  legalRow: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  legalMuted: {
    ...Typography.tiny,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  legalLink: {
    color: LINK_BLUE,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingLabel: {
    marginTop: Spacing.three,
    ...Typography.body,
    color: BLACK,
  },
});
