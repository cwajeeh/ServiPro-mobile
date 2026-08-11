import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AuthPalette } from '@/constants/theme';

const { NAVY, WHITE } = { ...AuthPalette, WHITE: '#FFFFFF' };

interface AddBankModalProps {
  visible: boolean;
  onClose: () => void;
  beneficiaryName: string;
  setBeneficiaryName: (v: string) => void;
  iban: string;
  setIban: (v: string) => void;
}

export function AddBankModal({
  visible,
  onClose,
  beneficiaryName,
  setBeneficiaryName,
  iban,
  setIban,
}: AddBankModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalCloseBtn} onPress={onClose}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
              <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Your Bank Details</Text>
            <Text style={styles.modalSubtitle}>
              Complete your profile by adding a bank account for smooth payouts.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Beneficiary Name *"
              placeholderTextColor="#94A3B8"
              value={beneficiaryName}
              onChangeText={setBeneficiaryName}
            />

            <Pressable style={styles.modalSelect}>
              <Text style={styles.modalSelectText}>Select Bank *</Text>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>

            <TextInput
              style={styles.modalInput}
              placeholder="Account IBAN Number *"
              placeholderTextColor="#94A3B8"
              value={iban}
              onChangeText={setIban}
            />

            <Pressable
              style={styles.modalConnectBtn}
              onPress={onClose}
            >
              <Text style={styles.modalConnectText}>Connect My Bank</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: -48,
    right: 0,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: WHITE,
    borderRadius: 32,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 16,
  },
  modalSelect: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalSelectText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  modalConnectBtn: {
    backgroundColor: NAVY,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalConnectText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
});
