import { createNavigationContainerRef } from '@react-navigation/native';

import { useAuthStore } from '@/store/authStore';

// Root trees remount by role; use a loose ref for cross-role notification deep links.
export const navigationRef = createNavigationContainerRef();

export function navigateToNotifications() {
  if (!navigationRef.isReady()) return;
  const role = useAuthStore.getState().role;
  try {
    if (role === 'customer') {
      // Customer notifications live inside the tab navigator.
      (navigationRef as { navigate: (name: string, params?: object) => void }).navigate(
        'CustomerTabs',
        { screen: 'CustomerNotifications' },
      );
      return;
    }
    if (role === 'tasker') {
      (navigationRef as { navigate: (name: string) => void }).navigate('TaskerNotifications');
    }
  } catch {
    // ignore navigation race during remount
  }
}
