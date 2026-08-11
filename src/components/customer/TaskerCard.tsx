import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';

interface TaskerCardProps {
  name: string;
  profession: string;
  rating: number | string;
  location: string;
  pricePerHour: number | string;
  image: string;
  isAvailable?: boolean;
  onPress?: () => void;
  statusLabel?: 'Hire Now' | 'Schedule';
}

export function TaskerCard({
  name,
  profession,
  rating,
  location,
  pricePerHour,
  image,
  isAvailable = true,
  onPress,
  statusLabel = isAvailable ? 'Hire Now' : 'Schedule',
}: TaskerCardProps) {
  const isHireVariant = statusLabel === 'Hire Now';
  const ratingNum = Number(rating);
  const safeRating = Number.isFinite(ratingNum) ? ratingNum : 0;
  const priceNum = Number(pricePerHour);
  const safePrice = Number.isFinite(priceNum) ? priceNum : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.badgeContainer, { backgroundColor: isHireVariant ? '#F0F9F0' : '#F1F5F9' }]}>
          <View style={[styles.statusDot, { backgroundColor: isHireVariant ? '#4CAF50' : '#94A3B8' }]} />
          <ThemedText style={styles.badgeText}>{statusLabel}</ThemedText>
        </View>
      </View>

      <View style={styles.mainContent}>
        <Image source={{ uri: image }} style={styles.avatar} />

        <View style={styles.infoContainer}>
          <ThemedText style={styles.name}>{name}</ThemedText>
          <ThemedText style={styles.profession}>{profession}</ThemedText>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <FontAwesome
                key={s}
                name={s <= Math.floor(safeRating) ? 'star' : 'star-o'}
                size={14}
                color="#FFC107"
                style={styles.starIcon}
              />
            ))}
            <ThemedText style={styles.ratingText}>{safeRating.toFixed(1)}</ThemedText>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#999" style={styles.pinIcon} />
            <ThemedText style={styles.locationText} numberOfLines={2}>
              {location}
            </ThemedText>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText style={styles.price}>£{safePrice}/hr</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -10, // Pull content up
    zIndex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0', // Light green background
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: Spacing.two,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  profession: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: AuthPalette.NAVY,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 10,
    color: '#999',
    flex: 1,
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: Spacing.one,
  },
  price: {
    fontSize: 18,
    fontWeight: '500',
    color: AuthPalette.NAVY,
  },
});
