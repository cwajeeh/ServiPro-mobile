import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getMediaBaseUrl } from '@/utils/mediaUrl';

interface CategoryItemProps {
  name: string;
  serviceCount: number;
  emoji?: string;
  imageUrl?: string | null;
  backgroundColor?: string;
  onPress?: () => void;
}

const resolveImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const baseUrl = getMediaBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
};

export function CategoryItem({ name, serviceCount, emoji, imageUrl, backgroundColor, onPress }: CategoryItemProps) {
  const resolvedUrl = resolveImageUrl(imageUrl);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, backgroundColor ? { backgroundColor } : undefined]}>
        {resolvedUrl ? (
          <Image source={{ uri: resolvedUrl }} style={{ width: 36, height: 36 }} resizeMode="contain" />
        ) : emoji ? (
          <Text style={styles.emojiText}>{emoji}</Text>
        ) : (
          <Text style={styles.emojiText}>📋</Text>
        )}
      </View>
      <ThemedText style={styles.name}>{name}</ThemedText>
      <ThemedText style={styles.serviceCount}>{serviceCount} services</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FAF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  emojiText: {
    fontSize: 30,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  serviceCount: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});
