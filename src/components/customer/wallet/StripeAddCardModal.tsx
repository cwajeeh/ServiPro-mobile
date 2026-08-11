import Ionicons from 'react-native-vector-icons/Ionicons';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { attachPaymentMethod } from '@/api/payment';
import { AuthPalette, Spacing } from '@/constants/theme';

const { NAVY, BORDER, GRAY, PRIMARY_TEXT } = AuthPalette;

interface StripeAddCardModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StripeAddCardModal({ visible, onClose }: StripeAddCardModalProps) {
  const { createPaymentMethod } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [isDefault, setIsDefault] = useState(false);

  // Address State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('GB');

  const handleAddCard = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    if (!address || !city || !postalCode) {
      Alert.alert('Error', 'Please enter complete address details');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Payment Method with Stripe
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else if (paymentMethod) {
        // 2. Call backend API to attach the payment method
        await attachPaymentMethod({
          payment_method_id: paymentMethod.id,
          address_line1: address,
          address_city: city,
          address_postal_code: postalCode,
          address_country: country,
        });

        Alert.alert(
          'Success',
          'Card attached successfully!',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Payment Card</Text>
          </View>

          <ScrollView 
            style={styles.formScroll} 
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Card Details</Text>
            <View style={styles.cardFieldWrapper}>
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '1234 5678 9012 3456',
                }}
                cardStyle={{
                  backgroundColor: '#F8FAFC',
                  textColor: '#1E293B',
                  placeholderColor: '#94A3B8',
                  fontSize: 16,
                }}
                style={styles.cardField}
                onCardChange={(details) => {
                  setCardDetails(details);
                }}
              />
            </View>

            {/* Address Fields */}
            <Text style={styles.label}>Billing Address</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Address Line 1"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Postal Code"
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Country (e.g. GB)"
                value={country}
                onChangeText={setCountry}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity 
              style={styles.defaultOption}
              onPress={() => setIsDefault(!isDefault)}
            >
              <Text style={styles.defaultText}>Set as default payment method</Text>
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
            </TouchableOpacity>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addBtn, (!cardDetails?.complete || loading) && styles.disabledBtn]}
                onPress={handleAddCard}
                disabled={!cardDetails?.complete || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.addBtnText}>Add Card</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    backgroundColor: NAVY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  formScroll: {
    flexGrow: 0,
  },
  form: {
    padding: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    marginTop: 8,
  },
  cardFieldWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  cardField: {
    width: '100%',
    height: 56,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    fontSize: 16,
    color: PRIMARY_TEXT,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  defaultOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    marginTop: 8,
  },
  defaultText: {
    fontSize: 15,
    color: PRIMARY_TEXT,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: GRAY,
    fontSize: 16,
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    backgroundColor: NAVY,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
