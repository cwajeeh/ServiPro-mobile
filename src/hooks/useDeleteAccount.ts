import { useCallback } from 'react';
import { Alert } from 'react-native';

import { deleteUserAccount, getDeleteAccountErrorMessage } from '@/api/user';
import { useAuthStore } from '@/store/authStore';

/**
 * Presents confirmation and deletes the account via the API, then clears the local session.
 * Uses `signOutLocal` so we do not call `/auth/logout` after the account may already be gone.
 */
export function useConfirmDeleteAccount() {
  const signOutLocal = useAuthStore((s) => s.signOutLocal);

  return useCallback(() => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your Servisca account and sign you out. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteUserAccount();
                await signOutLocal();
                Alert.alert('Account deleted', 'Your account has been removed.');
              } catch (e) {
                Alert.alert('Could not delete account', getDeleteAccountErrorMessage(e));
              }
            })();
          },
        },
      ],
    );
  }, [signOutLocal]);
}
