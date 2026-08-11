import { getFirebaseIdTokenFromApple, isAppleSignInCancelledError } from '@/utils/appleAuth';
import {
  getGoogleSignInAlertMessage,
  isGoogleSignInCancelled,
  signInWithGoogleIdToken,
} from '@/utils/googleSignIn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import {
  firebaseLoginRequest,
  getLoginErrorMessage,
  getRegisterErrorMessage,
  REGISTER_ROLE_ID_CUSTOMER,
  REGISTER_ROLE_ID_TASKER,
  registerRequest,
} from '@/api/auth';
import { AuthOrSocialRow } from '@/components/shared/auth-or-social-row';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import {
  DEFAULT_COUNTRIES,
  PhoneCountryField,
  type CountryDial,
} from '@/components/shared/phone-country-field';
import { ServiscaMarkSvg } from '@/components/shared/servisca-mark-svg';
import { isGoogleWebClientConfigured } from '@/config/env';
import { nativeEnv } from '@/config/nativeEnv';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { buildSessionFromLoginData, useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/auth';
import { pickImageFromLibrary } from '@/utils/nativeImagePicker';

const { NAVY, BLACK, BORDER, GRAY, LINK_BLUE } = AuthPalette;
const LOGO_MARK = 52;

type RoleChoice = 'user' | 'tasker';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

function toStoreRole(choice: RoleChoice): UserRole {
  return choice === 'user' ? 'customer' : 'tasker';
}

export function SignUpScreen({ navigation }: Props) {
  const [role, setRole] = useState<RoleChoice>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNational, setPhoneNational] = useState('');
  const phoneCountryRef = useRef<CountryDial>(DEFAULT_COUNTRIES[0]);
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (role !== 'tasker') {
      setDocumentName(null);
    }
  }, [role]);

  const pickDocument = useCallback(async () => {
    try {
      const asset = await pickImageFromLibrary({ quality: 0.95 });
      if (!asset) {
        return;
      }
      const size = asset.fileSize ?? 0;
      if (size > 50 * 1024 * 1024) {
        Alert.alert('File too large', 'Choose an image under 50MB.');
        return;
      }
      setDocumentName(asset.fileName ?? 'Photo');
    } catch {
      Alert.alert('Upload', 'Could not open the photo library.');
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!name.trim() || !email.trim() || !phoneNational.trim() || !password.trim()) {
      Alert.alert('Sign up', 'Please fill in all required fields.');
      return;
    }
    const nameParts = name.trim().split(/\s+/);
    const first_name = nameParts[0] ?? '';
    const last_name = nameParts.slice(1).join(' ');
    if (!last_name) {
      Alert.alert('Sign up', 'Please enter your first and last name.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Sign up', 'Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Sign up', 'Please accept the Terms of use and Privacy policy.');
      return;
    }
    if (role === 'tasker' && !documentName) {
      Alert.alert('Sign up', 'Please upload your license or ID photo (JPEG or PNG).');
      return;
    }
    const country = phoneCountryRef.current;
    const phone = phoneNational.replace(/\D/g, '');
    if (!phone) {
      Alert.alert('Sign up', 'Please enter a valid phone number.');
      return;
    }
    setSubmitting(true);
    try {
      await registerRequest({
        email: email.trim().toLowerCase(),
        countryCode: country.dial,
        isoCode: country.isoCode,
        phone,
        password,
        first_name,
        last_name,
        address: address.trim(),
        role_id: role === 'user' ? REGISTER_ROLE_ID_CUSTOMER : REGISTER_ROLE_ID_TASKER,
        sole_trader: false,
      });
      navigation.navigate('EmailVerify', {
        email: email.trim().toLowerCase(),
        roleForSignup: toStoreRole(role),
      });
    } catch (e) {
      Alert.alert('Sign up', getRegisterErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }, [
    address,
    confirmPassword,
    documentName,
    email,
    name,
    navigation,
    password,
    phoneNational,
    role,
    termsAccepted,
  ]);

  const setSessionFromLogin = useAuthStore((s) => s.setSessionFromLogin);

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
                  <Text style={styles.brandBlack}>SERVISCA</Text>
                  <Text style={styles.brandNavy}>CA</Text>
                </Text>
                <Text style={styles.tagline}>
                  <Text style={styles.tagMuted}>Click</Text>
                  <Text style={styles.tagMuted}> | </Text>
                  <Text style={styles.tagNavyStrong}>Book</Text>
                  <Text style={styles.tagMuted}> | </Text>
                  <Text style={styles.tagMuted}>Done</Text>
                </Text>
              </View>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.screenTitle}>Sign Up</Text>
              <View style={styles.titleUnderline} />
            </View>
            <Text style={styles.intro}>
              Join us today! Create an account to book trusted handymen and get your tasks done hassle-free.
            </Text>

            <Text style={styles.fieldLabel}>Select Role*</Text>
            <View style={styles.roleRow}>
              <Pressable
                style={styles.radioOption}
                onPress={() => setRole('user')}
                accessibilityRole="radio"
                accessibilityState={{ selected: role === 'user' }}>
                <View style={[styles.radioOuter, role === 'user' && styles.radioOuterActive]}>
                  {role === 'user' ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.radioLabel}>User</Text>
              </Pressable>
              <Pressable
                style={styles.radioOption}
                onPress={() => setRole('tasker')}
                accessibilityRole="radio"
                accessibilityState={{ selected: role === 'tasker' }}>
                <View style={[styles.radioOuter, role === 'tasker' && styles.radioOuterActive]}>
                  {role === 'tasker' ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.radioLabel}>Tasker</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="First & last name *"
              placeholderTextColor={GRAY}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor={GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <PhoneCountryField
              value={phoneNational}
              onChangeText={setPhoneNational}
              onCountryChange={(c) => {
                phoneCountryRef.current = c;
              }}
              placeholder="Phone Number *"
            />

            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor={GRAY}
              autoCapitalize="words"
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password *"
                placeholderTextColor={GRAY}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
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

            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password *"
                placeholderTextColor={GRAY}
                secureTextEntry={!confirmVisible}
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable
                onPress={() => setConfirmVisible((v) => !v)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={confirmVisible ? 'Hide confirm password' : 'Show confirm password'}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {confirmVisible ? (
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

            {role === 'tasker' ? (
              <View style={styles.uploadBlock}>
                <View style={styles.uploadLeft}>
                  <Text style={styles.uploadTitle}>Upload Documents</Text>
                  <Text style={styles.uploadSubtitle}>Add your license, or ID card</Text>
                </View>
                <View style={styles.uploadRight}>
                  <Pressable
                    style={({ pressed }) => [styles.uploadBtn, pressed && styles.uploadBtnPressed]}
                    onPress={pickDocument}
                    accessibilityRole="button"
                    accessibilityLabel="Upload document">
                    <Text style={styles.uploadBtnText}>Upload</Text>
                  </Pressable>
                  {documentName ? (
                    <Text style={styles.uploadFileName} numberOfLines={1}>
                      {documentName}
                    </Text>
                  ) : null}
                  <Text style={styles.uploadHint}>JPEG, PNG, PDF up to 50MB</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.termsRow}>
              <Pressable
                onPress={() => setTermsAccepted((t) => !t)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                style={styles.termsCheckboxHit}>
                <View style={[styles.checkbox, termsAccepted && styles.checkboxOn]}>
                  {termsAccepted ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
              </Pressable>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
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
                  style={styles.termsLink}
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

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                (pressed || submitting) && styles.primaryBtnPressed,
                submitting && styles.primaryBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Sign up"
              accessibilityState={{ disabled: submitting }}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign Up</Text>
              )}
            </Pressable>

            <AuthOrSocialRow
              onGooglePress={onGoogleSignIn}
              onApplePress={onAppleSignIn}
              googleSignInEnabled={isGoogleWebClientConfigured()}
            />

            <View style={styles.signInWrap}>
              <Text style={styles.signInMuted}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('SignIn')} accessibilityRole="link">
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </View>
          </ScrollView>
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
    fontSize: 28,
    fontWeight: Platform.select({ ios: '800', default: '700' }) as '700' | '800',
    letterSpacing: 1,
  },
  brandBlack: { color: BLACK },
  brandNavy: { color: NAVY },
  tagline: {
    marginTop: Spacing.half,
    fontSize: 13,
    letterSpacing: 2,
  },
  tagMuted: { color: BLACK },
  tagNavyStrong: { color: NAVY, fontWeight: '700' },
  titleBlock: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.two,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: NAVY,
  },
  titleUnderline: {
    width: 48,
    height: 3,
    backgroundColor: NAVY,
    borderRadius: 2,
    marginTop: Spacing.one,
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: Spacing.four,
    alignSelf: 'stretch',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: BLACK,
    marginBottom: Spacing.two,
    alignSelf: 'flex-start',
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.five,
    marginBottom: Spacing.four,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  radioOuterActive: {
    borderColor: NAVY,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: NAVY,
  },
  radioLabel: {
    fontSize: 16,
    color: BLACK,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
    color: BLACK,
    marginBottom: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    marginBottom: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
    color: BLACK,
  },
  eyeBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  eyeGlyph: {
    fontSize: 20,
  },
  uploadBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
    gap: Spacing.three,
  },
  uploadLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  uploadRight: {
    alignItems: 'flex-end',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
    marginBottom: Spacing.half,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: Spacing.two,
  },
  uploadBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#A5A5A5',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: 8,
    marginBottom: Spacing.two,
  },
  uploadBtnPressed: {
    opacity: 0.88,
  },
  uploadBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  uploadFileName: {
    fontSize: 13,
    color: NAVY,
    marginBottom: Spacing.one,
    maxWidth: '100%',
  },
  uploadHint: {
    fontSize: 12,
    color: GRAY,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    paddingRight: Spacing.two,
  },
  termsCheckboxHit: {
    paddingTop: 2,
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
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  termsText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: BLACK,
  },
  termsLink: {
    color: LINK_BLUE,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: NAVY,
    borderRadius: 10,
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
    fontSize: 17,
    fontWeight: '700',
  },
  signInWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  signInMuted: {
    fontSize: 15,
    color: '#444',
  },
  signInLink: {
    fontSize: 15,
    color: LINK_BLUE,
    fontWeight: '700',
  },
});
