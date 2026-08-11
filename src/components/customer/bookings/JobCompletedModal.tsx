import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthPalette } from '@/constants/theme';

interface JobCompletedModalProps {
  visible: boolean;
  onJobComplete: () => void;
  onReportIssue: () => void;
}

export function JobCompletedModal({ visible, onJobComplete, onReportIssue }: JobCompletedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // Non-dismissable by back button usually for final confirmation
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <ThemedText style={styles.title}>Job Completed!</ThemedText>
            <ThemedText style={styles.description}>
              Your task has been successfully completed. If you are satisfied with the job then click on the “Job Complete” for task payment.
            </ThemedText>

            <Pressable 
              style={styles.primaryButton}
              onPress={onJobComplete}
            >
              <ThemedText style={styles.primaryButtonText}>Job Complete</ThemedText>
            </Pressable>

            <Pressable 
              style={styles.secondaryButton}
              onPress={onReportIssue}
            >
              <ThemedText style={styles.secondaryButtonText}>Report Issue</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  content: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: AuthPalette.NAVY,
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  secondaryButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
