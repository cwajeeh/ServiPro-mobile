import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import * as Sentry from '@sentry/react-native';
import { AppRegistry } from 'react-native';

import App from './src/App';

setBackgroundMessageHandler(getMessaging(getApp()), async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('main', () => Sentry.wrap(App));
