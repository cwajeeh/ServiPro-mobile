import { ENV } from '@/config/env';
import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface InteractiveMapProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  style?: ViewStyle;
}

export function InteractiveMap({ region, style }: InteractiveMapProps) {
  const { latitude, longitude } = region;

  // Use Static Maps API for a high-quality web-safe fallback
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=600x400&maptype=roadmap&markers=color:blue%7Clabel:S%7C${latitude},${longitude}&key=${ENV.GOOGLE_MAPS_API_KEY}`;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: staticMapUrl }}
        style={styles.mapImg}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  mapImg: {
    ...StyleSheet.absoluteFillObject,
  },
});
