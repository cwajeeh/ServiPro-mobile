import { getApp } from '@react-native-firebase/app';
import { getMessaging, type Messaging } from '@react-native-firebase/messaging';

let messagingInstance: Messaging | null = null;

/** Single default-app Messaging instance (RN Firebase modular API — avoids namespaced deprecation warnings). */
export function firebaseMessaging(): Messaging {
  if (!messagingInstance) {
    messagingInstance = getMessaging(getApp());
  }
  return messagingInstance;
}
