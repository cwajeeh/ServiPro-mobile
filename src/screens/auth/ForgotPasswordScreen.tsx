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
import Svg, { Path } from 'react-native-svg';

import { forgotPasswordRequest, getAuthErrorMessage } from '@/api/auth';
import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { PRIMARY_TEXT, BORDER, GRAY, SECONDARY_BG, MAIN_BLUE } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSendCode = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Forgot password', 'Please enter your email address.');
      return;
    }
    setSubmitting(true);
    try {
      await forgotPasswordRequest(trimmed);
      navigation.navigate('OTPVerification', { email: trimmed });
    } catch (e) {
      Alert.alert('Forgot password', getAuthErrorMessage(e, 'Could not send reset code.'));
    } finally {
      setSubmitting(false);
    }
  }, [email, navigation]);

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
                  <Path
                    d="M15 18l-6-6 6-6"
                    stroke={MAIN_BLUE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
              <Text style={styles.headerTitle}>Forgot Password?</Text>
            </View>

            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/images/icons/elements.png')}
                style={styles.iconWrap}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>
              Oops, forgot your password? Don&apos;t worry enter your email and we&apos;ll help you reset it.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="jonmical@gmail.com"
              placeholderTextColor={GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                submitting && styles.primaryBtnDisabled,
                pressed && !submitting && styles.primaryBtnPressed,
              ]}
              onPress={() => void onSendCode()}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Send Code</Text>
              )}
            </Pressable>

            <View style={styles.signInWrap}>
              <Text style={styles.signInRow}>Return to </Text>
              <Pressable onPress={() => navigation.navigate('SignIn')}>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY_TEXT,
  },
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
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
    color: PRIMARY_TEXT,
    marginBottom: Spacing.six,
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    backgroundColor: MAIN_BLUE,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnDisabled: {
    opacity: 0.85,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signInWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInRow: {
    fontSize: 15,
    color: '#666666',
  },
  signInLink: {
    fontSize: 15,
    color: MAIN_BLUE,
    fontWeight: '700',
  },
});
