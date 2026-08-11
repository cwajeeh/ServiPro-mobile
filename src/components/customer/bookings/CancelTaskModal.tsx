import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react';
import {
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

interface CancelTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const CANCELLATION_REASONS = [
  'Change in Plans',
  'Task No Longer Needed',
  'Incorrect Task Details',
  'Budget Constraints',
  'Emergency or Personal Issue',
  'Others',
];

export function CancelTaskModal({ visible, onClose, onSubmit }: CancelTaskModalProps) {
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const handleReasonSelect = (reason: string) => {
    setCancelReason(reason);
  };

  const handleSubmit = () => {
    const finalReason = cancelReason === 'Others' ? otherReason : cancelReason;
    onSubmit(finalReason);
  };

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
              <ThemedText style={styles.modalTitle}>
                Submit Your Reason To Cancel Job
              </ThemedText>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {CANCELLATION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonItem}
                  onPress={() => handleReasonSelect(reason)}
                >
                  <ThemedText style={styles.reasonText}>{reason}</ThemedText>
                  <Ionicons
                    name={cancelReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={cancelReason === reason ? AuthPalette.NAVY : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}

              {cancelReason === 'Others' && (
                <View style={styles.otherInputWrapper}>
                  <TextInput
                    style={styles.otherInput}
                    placeholder="Write here"
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={otherReason}
                    onChangeText={setOtherReason}
                    autoFocus
                  />
                </View>
              )}

              <ThemedText style={styles.warningText}>
                Multiple job cancellations may result in permanent account suspension.
              </ThemedText>

              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!cancelReason || (cancelReason === 'Others' && !otherReason.trim())) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!cancelReason || (cancelReason === 'Others' && !otherReason.trim())}
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
  warningText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: AuthPalette.NAVY,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
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
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
});
