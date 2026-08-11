import { Platform, StatusBar as RNStatusBar, useColorScheme } from 'react-native';

type BarStyle = 'auto' | 'inverted' | 'light' | 'dark';

type Props = {
  style?: BarStyle;
};

/**
 * Replaces `expo-status-bar` with React Native's StatusBar.
 */
export function StatusBar({ style = 'auto' }: Props) {
  const scheme = useColorScheme();
  let barStyle: 'light-content' | 'dark-content' = 'dark-content';
  if (style === 'auto') {
    barStyle = scheme === 'dark' ? 'light-content' : 'dark-content';
  } else if (style === 'light' || style === 'inverted') {
    barStyle = 'light-content';
  } else {
    barStyle = 'dark-content';
  }

  return (
    <RNStatusBar
      barStyle={barStyle}
      translucent={Platform.OS === 'android'}
      backgroundColor="transparent"
    />
  );
}
