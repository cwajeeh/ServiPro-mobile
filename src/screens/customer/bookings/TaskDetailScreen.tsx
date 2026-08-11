import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useTaskDetail } from '@/hooks/useTaskDetail';
import type { CustomerTabParamList } from '@/navigation/types';
import { formatDate } from '@/utils/dateFormatter';
import { resolveMediaUrl } from '@/utils/mediaUrl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - Spacing.four * 2 - 8) / 3;

export function TaskDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerTabParamList>>();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerBookingDetail'>>();
  const { taskId } = route.params;

  const { data: task, isLoading, isError, refetch } = useTaskDetail(taskId);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={AuthPalette.NAVY} />
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <ThemedText style={styles.errorText}>Failed to load task details</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // Split media into images and videos
  const images = (task.beforeImages ?? []).filter(
    (m) => !m.media_type?.startsWith('video')
  );
  const videos = (task.beforeImages ?? []).filter((m) =>
    m.media_type?.startsWith('video')
  );

  const hasLocation =
    task.latitude !== undefined &&
    task.latitude !== null &&
    task.longitude !== undefined &&
    task.longitude !== null;

  const priceLabel =
    task.amount_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <ThemedText style={styles.headerTitle}>Task Details</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Info Card ─────────────────────────────────── */}
        <View style={styles.infoCard}>
          <InfoRow label="Title" value={task.title} />
          <InfoRow label="Description" value={task.description || '—'} />

          {/* Category pill */}
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Category</ThemedText>
            {task.category ? (
              <View style={styles.categoryPill}>
                <ThemedText style={styles.categoryPillText}>{task.category}</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.infoValue}>N/A</ThemedText>
            )}
          </View>

          <InfoRow
            label="Working Hours"
            value={task.taskLength || '—'}
            accent
          />
          <InfoRow
            label={priceLabel}
            value={`£${task.price ?? task.amount ?? 0}`}
            accent
          />
          <InfoRow
            label="Date & Time"
            value={formatDate(task.scheduledDate)}
            accent
            noBorder
          />
        </View>

        {/* ── Map ───────────────────────────────────────── */}
        {hasLocation && (
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              scrollEnabled={false}
              zoomEnabled={false}
              initialRegion={{
                latitude: task.latitude ?? 0,
                longitude: task.longitude ?? 0,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker
                coordinate={{
                  latitude: task.latitude ?? 0,
                  longitude: task.longitude ?? 0
                }}
                title={task.title}
              >
                <View style={styles.markerWrap}>
                  <Ionicons name="location" size={32} color={AuthPalette.NAVY} />
                </View>
              </Marker>
            </MapView>
          </View>
        )}

        {/* ── Image Gallery ─────────────────────────────── */}
        {images.length > 0 && (
          <View style={styles.galleryGrid}>
            {images.map((img, idx) => (
              <Image
                key={`img-${idx}`}
                source={{ uri: resolveMediaUrl(img.image_url) ?? " " }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {/* ── Video ─────────────────────────────────────── */}
        {videos.length > 0 && (
          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => {
              const url = resolveMediaUrl(videos[0].image_url);
              if (url) {
                Linking.openURL(url);
              }
            }}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: resolveMediaUrl(videos[0].image_url) ?? '' }}
              style={styles.videoThumb}
              resizeMode="cover"
            />
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={30} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Action Buttons ────────────────────────────── */}
        <View style={styles.actions}>
          {/* Find Professionals / Track Order */}
          {task.status === 'accepted' || task.status === 'in_progress' ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                navigation.navigate('CustomerTaskDetail', { taskId: task.id })
              }
            >
              <ThemedText style={styles.primaryBtnText}>Track Order</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('CustomerFindPro')}
            >
              <ThemedText style={styles.primaryBtnText}>Find Professionals</ThemedText>
            </TouchableOpacity>
          )}

          {/* Update */}
          <TouchableOpacity style={styles.outlineBtn}>
            <ThemedText style={styles.outlineBtnText}>Update</ThemedText>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity style={styles.deleteBtnWrap}>
            <ThemedText style={styles.deleteText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ── Small helper component ─────────────────────────── */
function InfoRow({
  label,
  value,
  accent = false,
  noBorder = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  noBorder?: boolean;
}) {
  return (
    <View style={[styles.infoRow, noBorder && { borderBottomWidth: 0 }]}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, accent && styles.infoValueAccent]}>
        {value}
      </ThemedText>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F2F3F7',
  },
  /* Header */
  headerContainer: {
    backgroundColor: AuthPalette.NAVY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 20,
  },

  /* Info Card */
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
    overflow: 'hidden',
  },
  infoRow: {
    paddingVertical: 14,

  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  infoValueAccent: {
    color: AuthPalette.NAVY,
    fontWeight: '700',
    fontSize: 16,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8ECF8',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 2,
  },
  categoryPillText: {
    fontSize: 13,
    color: AuthPalette.NAVY,
    fontWeight: '600',
  },

  /* Map */
  mapCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Gallery */
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.three,
  },
  galleryImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
  },

  /* Video */
  videoCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: Spacing.three,
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },

  /* Action Buttons */
  actions: {
    gap: 12,
    marginTop: 4,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: AuthPalette.NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AuthPalette.NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  outlineBtnText: {
    color: AuthPalette.NAVY,
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtnWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Error / Retry */
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AuthPalette.NAVY,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
