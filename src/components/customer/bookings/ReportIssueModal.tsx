import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette } from '@/constants/theme';
import { pickImagesFromLibrary } from '@/utils/nativeImagePicker';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; description: string; images: string[] }) => void;
}

const REPORT_REASONS = [
  'Work Not as Expected',
  'Job Completed Incorrectly',
  'Job Not Fully Resolved',
  'Wrong Service Delivered',
  'Emergency or Personal Issue',
  'Others',
];

export function ReportIssueModal({ visible, onClose, onSubmit }: ReportIssueModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handlePickImage = async () => {
    if (images.length >= 5) return;

    const remaining = 5 - images.length;
    const picked = await pickImagesFromLibrary({ selectionLimit: remaining, quality: 0.8 });
    if (picked.length > 0) {
      const newImages = picked.map((p) => p.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const finalReason = selectedReason === 'Others' ? description : selectedReason;
    onSubmit({
      reason: selectedReason,
      description: description,
      images: images,
    });
  };

  const isFormValid = selectedReason && (selectedReason !== 'Others' || description.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Submit Your Reason</ThemedText>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.scrollContent}
            >
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonItem}
                  onPress={() => setSelectedReason(reason)}
                >
                  <ThemedText style={styles.reasonText}>{reason}</ThemedText>
                  <Ionicons
                    name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selectedReason === reason ? AuthPalette.NAVY : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}

              {selectedReason === 'Others' && (
                <View style={styles.otherInputWrapper}>
                  <TextInput
                    style={styles.otherInput}
                    placeholder="Write here"
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    autoFocus
                  />
                </View>
              )}

            <View style={styles.photoSection}>
              <ThemedText style={styles.sectionTitle}>Add Photos (Optional)</ThemedText>

              {images.length > 0 && (
                <View style={styles.imageGrid}>
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handlePickImage}
                disabled={images.length >= 5}
              >
                <Ionicons name="cloud-upload-outline" size={32} color="#64748B" />
                <ThemedText style={styles.uploadText}>
                  Click to upload images ({images.length}/5)
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!isFormValid}
            >
              <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'left',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reasonText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  otherInputWrapper: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
  },
  otherInput: {
    fontSize: 15,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: '100%',
  },
  photoSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  uploadBtn: {
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  uploadText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: AuthPalette.NAVY,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
});
