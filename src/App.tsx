import { StripeProvider } from '@stripe/stripe-react-native';
import * as Sentry from '@sentry/react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queryClient';
import { nativeEnv } from '@/config/nativeEnv';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import { useAuthStore } from '@/store/authStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { StatusBar } from '@/components/shared/RnStatusBar';
import { configureSocialAuth } from '@/config/socialAuth';

if (nativeEnv.sentryDsn) {
  Sentry.init({
    dsn: nativeEnv.sentryDsn,
    tracesSampleRate: __DEV__ ? 1.0 : 0.15,
    environment: __DEV__ ? 'development' : 'production',
  });
}

const SPLASH_VISIBLE_MS = 2000;

export default function App() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const provider = useAuthStore((s) => s.provider);
  const userId = useAuthStore((s) => s.user?.id);
  usePushNotifications();

  const stripePublishableKey = nativeEnv.stripePublishableKey;

  /** Remount navigation when auth changes so the post-login stack is not stuck on Sign In. */
  const navigationKey = `${isAuthenticated}-${role ?? ''}-${String(provider)}-${userId ?? ''}`;

  useEffect(() => {
    configureSocialAuth();
    const run = async () => {
      await Promise.all([
        useAuthStore.getState().hydrate(),
        new Promise<void>((resolve) => setTimeout(resolve, SPLASH_VISIBLE_MS)),
      ]);
    };
    void run();
  }, []);

  const linking = {
    prefixes: ['servisca://', 'https://servisca.co.uk', 'https://www.servisca.co.uk'],
  };

  const customDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#F8FAFC',
    },
  };

  const navigationTree = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer
            linking={linking}
            ref={navigationRef}
            key={navigationKey}
            theme={colorScheme === 'dark' ? DarkTheme : customDefaultTheme}>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );

  return (
    <ErrorBoundary>
      {stripePublishableKey ? (
        <StripeProvider publishableKey={stripePublishableKey}>{navigationTree}</StripeProvider>
      ) : (
        navigationTree
      )}
    </ErrorBoundary>
  );
}
