import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

/**
 * Image-based tool motifs for auth screens (matches SERVISCA handyman brand).
 */
export function AuthToolPattern() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image
        source={require('../../../assets/images/auth_bg.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 0.8, // Adjust opacity to blend nicely, just in case. Based on the user image it has a white background.
  },
});
