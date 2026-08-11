import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useState } from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';

import { getAuthErrorMessage, resetPasswordRequest } from '@/api/auth';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { PRIMARY_TEXT, BORDER, GRAY, SECONDARY_BG, MAIN_BLUE, ERROR_RED } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'SetNewPassword'>;

export function SetNewPasswordScreen({ navigation, route }: Props) {
  const resetEmail = route.params.email;
  const resetToken = route.params.resetToken;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validations
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@#$%&]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Let's assume some validations fail and some pass based on state
  const isStarted = password.length > 0;

  const allRulesPass =
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch;

  const onSubmit = useCallback(async () => {
    if (!resetToken?.trim()) {
      Alert.alert(
        'Session expired',
        'Please start the forgot-password flow again from Sign in.',
      );
      return;
    }
    if (!allRulesPass) {
      Alert.alert('Password', 'Please meet all password requirements.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPasswordRequest({ password, token: resetToken });
      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') },
      ]);
    } catch (e) {
      Alert.alert('Reset password', getAuthErrorMessage(e, 'Could not update password.'));
    } finally {
      setSubmitting(false);
    }
  }, [allRulesPass, navigation, password, resetToken]);

  const ValidationItem = ({ label, isPassed, isError }: { label: string; isPassed: boolean; isError?: boolean }) => {
    let strokeColor: string = BORDER;
    if (isPassed) strokeColor = MAIN_BLUE;
    else if (isError) strokeColor = ERROR_RED;

    return (
      <View style={styles.validationRow}>
        <View style={styles.validationIcon}>
          {isPassed ? (
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Circle cx="8" cy="8" r="7" stroke={strokeColor} strokeWidth="1.5" />
              <Path d="M5 8l2 2 4-4" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : isError ? (
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Circle cx="8" cy="8" r="7" stroke={strokeColor} strokeWidth="1.5" />
            </Svg> // Simplified
          ) : (
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Circle cx="8" cy="8" r="7" stroke={strokeColor} strokeWidth="1.5" />
            </Svg>
          )}
        </View>
        <Text style={[styles.validationText, isPassed && styles.validationPassed, isError && styles.validationError]}>
          {label}
        </Text>
      </View>
    );
  };

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
              <Text style={styles.headerTitle}>Set a New Password</Text>
            </View>

            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/images/icons/password-validation.png')}
                style={styles.iconWrap}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>
              Create a strong <Text style={styles.boldText}>password</Text> that&apos;s different from your previous
              ones to keep your account secure.
            </Text>
            {resetEmail ? <Text style={styles.emailHint}>{resetEmail}</Text> : null}

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={GRAY}
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setPasswordVisible(!passwordVisible)}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={GRAY} strokeWidth="1.5" strokeLinejoin="round" />
                  <Circle cx="12" cy="12" r="3" stroke={GRAY} strokeWidth="1.5" />
                </Svg>
              </Pressable>
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={GRAY}
                secureTextEntry={!confirmVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setConfirmVisible(!confirmVisible)}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={GRAY} strokeWidth="1.5" strokeLinejoin="round" />
                  <Circle cx="12" cy="12" r="3" stroke={GRAY} strokeWidth="1.5" />
                </Svg>
              </Pressable>
            </View>

            <View style={styles.validationContainer}>
              <ValidationItem label="At least 8 characters long" isPassed={hasMinLength} isError={isStarted && !hasMinLength} />
              <ValidationItem label="Contains one uppercase letter (A-Z)" isPassed={hasUpper} isError={isStarted && !hasUpper} />
              <ValidationItem label="Contains one lowercase letter (a-z)" isPassed={hasLower} isError={isStarted && !hasLower} />
              <ValidationItem label="Includes at least one number (0-9)" isPassed={hasNumber} isError={isStarted && !hasNumber} />
              <ValidationItem label="Includes at least one special character (@ # $ % &)" isPassed={hasSpecial} isError={isStarted && !hasSpecial} />
              <ValidationItem label="Password matches" isPassed={passwordsMatch} isError={confirmPassword.length > 0 && !passwordsMatch} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                (!allRulesPass || submitting) && styles.primaryBtnDisabled,
                pressed && allRulesPass && !submitting && styles.primaryBtnPressed,
              ]}
              onPress={() => void onSubmit()}
              disabled={!allRulesPass || submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Confirm</Text>
              )}
            </Pressable>

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
    paddingHorizontal: Spacing.two,
  },
  boldText: { fontWeight: '700', color: MAIN_BLUE },
  emailHint: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.two,
    marginBottom: Spacing.four,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
    color: PRIMARY_TEXT,
  },
  eyeBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  validationContainer: { marginBottom: Spacing.six, marginTop: Spacing.two },
  validationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.three },
  validationIcon: { marginRight: Spacing.three },
  validationText: { fontSize: 13, color: GRAY },
  validationPassed: { color: MAIN_BLUE },
  validationError: { color: ERROR_RED },
  primaryBtn: {
    backgroundColor: MAIN_BLUE,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
