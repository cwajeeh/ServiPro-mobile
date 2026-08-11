import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';

import { AuthStack } from '@/navigation/AuthStack';
import { CustomerStack } from '@/navigation/CustomerStack';
import { TaskerStack } from '@/navigation/TaskerStack';
import { useAuthStore } from '@/store/authStore';
import { useNotificationSocketInit } from '@/hooks/useNotificationSocket';
import { useTaskSocketInit } from '@/hooks/useTaskSocket';

const HydrateStack = createNativeStackNavigator<{ __hydrate: undefined }>();

function HydratePlaceholder() {
  return <View style={{ flex: 1, backgroundColor: '#F8FAFC' }} />;
}

export function RootNavigator() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const provider = useAuthStore((s) => s.provider);
  const userId = useAuthStore((s) => s.user?.id);

  // Initialize global sockets
  useNotificationSocketInit();
  useTaskSocketInit();

  if (!hydrated) {
    return (
      <HydrateStack.Navigator screenOptions={{ headerShown: false }}>
        <HydrateStack.Screen name="__hydrate" component={HydratePlaceholder} />
      </HydrateStack.Navigator>
    );
  }

  if (!isAuthenticated || !role) {
    // `key` forces a fresh stack when switching between guest and logged-in tasker onboarding.
    return <AuthStack key="auth-guest" />;
  }

  if (role === 'customer') {
    return <CustomerStack />;
  }

  // Tasker with provider: main tasker app
  if (provider === true) {
    return <TaskerStack />;
  }

  // Tasker with provider === false: category selection (same as post–email OTP signup flow)
  return (
    <AuthStack
      key={`auth-tasker-onboarding-${userId ?? 'u'}`}
      initialRouteName="TaskerCategorySelect"
    />
  );
}
