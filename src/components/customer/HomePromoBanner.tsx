import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface HomePromoBannerProps {
  title: string;
  subtitle: string;
  description?: string;
  ctaText: string;
  image: string;
  backgroundColor: string;
}

export function HomePromoBanner({
  title,
  subtitle,
  description,
  ctaText,
  image,
  backgroundColor,
}: HomePromoBannerProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.textSection}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        {description && <ThemedText style={styles.description}>{description}</ThemedText>}

        <TouchableOpacity style={styles.ctaButton}>
          <ThemedText style={styles.ctaText}>{ctaText}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.imageSection}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    flexDirection: 'row',
    height: 160,
    overflow: 'hidden',
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  textSection: {
    flex: 1.5,
    padding: Spacing.three,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFF',
    marginBottom: Spacing.one,
  },
  description: {
    fontSize: 10,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: Spacing.two,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: Spacing.three,
  },
  ctaButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  ctaText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  imageSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  image: {
    width: '120%',
    height: '100%',
    bottom: -10,
    right: -10,
  },
});
