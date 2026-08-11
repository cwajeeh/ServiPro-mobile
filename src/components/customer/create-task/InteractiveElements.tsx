import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { pickImagesFromLibrary } from '@/utils/nativeImagePicker';

interface FormRadioProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function FormRadio({ label, isSelected, onPress }: FormRadioProps) {
  return (
    <TouchableOpacity style={styles.radioRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.outerCircle, isSelected && styles.activeOuterCircle]}>
        {isSelected && <View style={styles.innerCircle} />}
      </View>
      <ThemedText style={[styles.radioLabel, isSelected && styles.activeRadioLabel]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

export interface UploadedImage {
  uri: string;
  base64?: string | null;
  mimeType?: string;
}

interface ImageUploadAreaProps {
  images?: UploadedImage[];
  onImagesChange?: (images: UploadedImage[]) => void;
}

export function ImageUploadArea({ images = [], onImagesChange }: ImageUploadAreaProps) {
  const handlePick = async () => {
    const picked = await pickImagesFromLibrary({ quality: 0.8, selectionLimit: 10 });
    if (picked.length > 0) {
      const newImages: UploadedImage[] = picked.map((asset) => ({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
      }));
      onImagesChange?.([...images, ...newImages]);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange?.(updated);
  };

  return (
    <View style={styles.uploadContainer}>
      {/* Thumbnails Row */}
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbsRow}>
          {images.map((img, idx) => (
            <View key={idx} style={styles.thumbWrapper}>
              <Image source={{ uri: img.uri }} style={styles.thumb} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(idx)}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadBox} onPress={handlePick} activeOpacity={0.7}>
        <MaterialCommunityIcons name="cloud-upload-outline" size={32} color="#94A3B8" />
        <ThemedText style={styles.uploadTitle}>
          {images.length > 0 ? 'Add More Images' : 'Upload Images of Your Work'}
        </ThemedText>
        <ThemedText style={styles.uploadSubtitle}>JPEG, PNG,MP4 up to 10MB</ThemedText>
        <View style={styles.browseButton}>
          <ThemedText style={styles.browseButtonText}>Browse/Capture</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.four,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
  activeOuterCircle: {
    borderColor: AuthPalette.NAVY,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AuthPalette.NAVY,
  },
  radioLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  activeRadioLabel: {
    color: '#333',
  },
  uploadContainer: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  thumbsRow: {
    marginBottom: Spacing.two,
  },
  thumbWrapper: {
    marginRight: Spacing.two,
    position: 'relative',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: Spacing.two,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: Spacing.three,
  },
  browseButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  browseButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
});



