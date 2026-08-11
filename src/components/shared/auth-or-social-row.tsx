import React from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { Spacing } from '@/constants/theme';
import { isAppleSignInSupported } from '@/utils/appleAuth';

const BORDER = '#E0E0E0';
const GRAY = '#757575';

interface AuthOrSocialRowProps {
  onGooglePress?: () => void;
  onFacebookPress?: () => void;
  onApplePress?: () => void;
  onXPress?: () => void;
  /** When false (e.g. release build without GOOGLE_WEB_CLIENT_ID), Google button explains missing config. */
  googleSignInEnabled?: boolean;
}

/** “Or” divider + Google / Facebook / Apple — shared by Sign In and Tasker Sign Up. */
export function AuthOrSocialRow({
  onGooglePress,
  onFacebookPress,
  onApplePress,
  onXPress,
  googleSignInEnabled = true,
}: AuthOrSocialRowProps) {
  return (
    <>
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.orLine} />
      </View>

      <View style={styles.socialRow}>
        <Pressable
          style={[styles.socialGoogle, !googleSignInEnabled && styles.socialDisabled]}
          accessibilityLabel="Continue with Google"
          accessibilityState={{ disabled: !googleSignInEnabled }}
          onPress={() => {
            if (!googleSignInEnabled) {
              Alert.alert(
                'Google Sign-In unavailable',
                'Set GOOGLE_WEB_CLIENT_ID in your environment and rebuild the app.',
              );
              return;
            }
            (onGooglePress ?? (() => Alert.alert('Google', 'Social sign-in coming soon.')))();
          }}>
          <Image
            source={require('../../../assets/images/icons/google.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Pressable
          style={styles.socialFacebook}
          accessibilityLabel="Continue with Facebook"
          onPress={onFacebookPress ?? (() => Alert.alert('Facebook', 'Social sign-in coming soon.'))}>
          <Image
            source={require('../../../assets/images/icons/facebook.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Pressable
          style={styles.socialX}
          accessibilityLabel="Continue with X"
          onPress={onXPress ?? (() => Alert.alert('X', 'Social sign-in coming soon.'))}>
          <Image
            source={require('../../../assets/images/icons/x.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </Pressable>
        {isAppleSignInSupported() ? (
          <Pressable
            style={styles.socialApple}
            accessibilityLabel="Continue with Apple"
            onPress={onApplePress ?? (() => Alert.alert('Apple', 'Sign in with Apple is not wired on this screen.'))}>
            <Svg width={22} height={26} viewBox="0 0 24 28">
              <Path
                fill="#FFFFFF"
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
              />
            </Svg>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  orText: {
    fontSize: 14,
    color: GRAY,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.four,
  },
  socialGoogle: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialDisabled: {
    opacity: 0.45,
  },
  socialFacebook: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialX: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialApple: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 60,
    height: 60,
  },
});
