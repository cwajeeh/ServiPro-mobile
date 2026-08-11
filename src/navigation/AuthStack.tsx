import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { AuthStackParamList } from '@/navigation/types';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { OnboardingScreen } from '@/screens/auth/OnboardingScreen';
import { OTPVerificationScreen } from '@/screens/auth/OTPVerificationScreen';
import { ResetSuccessScreen } from '@/screens/auth/ResetSuccessScreen';
import { SetNewPasswordScreen } from '@/screens/auth/SetNewPasswordScreen';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { VerifyEmailScreen } from '@/screens/auth/VerifyEmailScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { TaskerCategorySelectScreen } from '@/screens/tasker/profile/TaskerCategorySelectScreen';
import { TaskerCertificatesScreen } from '@/screens/tasker/profile/TaskerCertificatesScreen';
import { TaskerSkillsAndRateScreen } from '@/screens/tasker/profile/TaskerSkillsAndRateScreen';
import { TaskerSubCategorySelectScreen } from '@/screens/tasker/profile/TaskerSubCategorySelectScreen';
import { LegalWebViewScreen } from '@/screens/shared/LegalWebViewScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthStackProps = {
  initialRouteName?: keyof AuthStackParamList;
};

export function AuthStack({ initialRouteName = 'Welcome' }: AuthStackProps) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailVerify" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ResetSuccess" component={ResetSuccessScreen} />
      <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
      {/* Tasker Profile Screens   */}
      <Stack.Screen
        name="TaskerCategorySelect"
        component={TaskerCategorySelectScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="TaskerSubCategorySelect" component={TaskerSubCategorySelectScreen} />
      <Stack.Screen name="TaskerSkillsAndRate" component={TaskerSkillsAndRateScreen} />
      <Stack.Screen name="TaskerCertificates" component={TaskerCertificatesScreen} />
      <Stack.Screen name="LegalWebView" component={LegalWebViewScreen} />
    </Stack.Navigator>
  );
}
