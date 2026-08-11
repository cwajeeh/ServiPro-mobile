import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deletePaymentMethod,
  fetchPaymentMethods,
  setDefaultPaymentMethod,
  type PaymentMethod,
} from '@/api/payment';
import { processInvoicePayment } from '@/api/invoices';
import { StripeAddCardModal } from '@/components/customer/wallet/StripeAddCardModal';
import { nativeEnv } from '@/config/nativeEnv';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useCustomerTabNavigation } from '@/navigation/hooks';
import type { CustomerTabParamList } from '@/navigation/types';

const { NAVY, PRIMARY_TEXT, GRAY, BORDER } = AuthPalette;

export function CustomerAddCardsScreen() {
  const navigation = useNavigation();
  const tabNavigation = useCustomerTabNavigation();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerAddCards'>>();
  const invoiceId = route.params?.invoiceId;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading, refetch } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
  });

  React.useEffect(() => {
    if (cards.length && selectedId == null) {
      const def = cards.find((c) => c.is_default) ?? cards[0];
      setSelectedId(def.id);
    }
  }, [cards, selectedId]);

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => setDefaultPaymentMethod(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (e: unknown) => {
      Alert.alert('Card', e instanceof Error ? e.message : 'Could not set default card.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePaymentMethod(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (e: unknown) => {
      Alert.alert('Card', e instanceof Error ? e.message : 'Could not delete card.');
    },
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!invoiceId) throw new Error('No invoice to pay.');
      const card = cards.find((c) => c.id === selectedId) ?? cards.find((c) => c.is_default) ?? cards[0];
      if (!card) throw new Error('Add a payment card first.');
      return processInvoicePayment(invoiceId, card.stripe_payment_method_id);
    },
    onSuccess: () => {
      Alert.alert('Payment', 'Payment submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (e: unknown) => {
      Alert.alert('Payment failed', e instanceof Error ? e.message : 'Could not process payment.');
    },
  });

  const defaultCard = cards.find((c) => c.is_default);
  const otherCards = cards.filter((c) => !c.is_default);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{invoiceId ? 'Pay Invoice' : 'Select Card'}</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={{ marginTop: 40 }}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        ) : cards.length > 0 ? (
          <>
            {defaultCard ? (
              <>
                <Text style={styles.sectionTitle}>Default</Text>
                <CardItem
                  card={defaultCard}
                  selected={selectedId === defaultCard.id}
                  onSelect={() => setSelectedId(defaultCard.id)}
                  onMakeDefault={() => setDefaultMutation.mutate(defaultCard.id)}
                  onDelete={() =>
                    Alert.alert('Delete card', 'Remove this payment method?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteMutation.mutate(defaultCard.id),
                      },
                    ])
                  }
                />
              </>
            ) : null}

            {otherCards.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Other Cards</Text>
                {otherCards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    selected={selectedId === card.id}
                    onSelect={() => setSelectedId(card.id)}
                    onMakeDefault={() => setDefaultMutation.mutate(card.id)}
                    onDelete={() =>
                      Alert.alert('Delete card', 'Remove this payment method?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => deleteMutation.mutate(card.id),
                        },
                      ])
                    }
                  />
                ))}
              </>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No payment cards added yet.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addCardBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={GRAY} style={{ marginRight: 8 }} />
          <Text style={styles.addCardText}>Add Payment Card</Text>
        </TouchableOpacity>

        <Text style={styles.paymentLegal}>
          Payments are processed securely. See our{' '}
          <Text
            style={styles.paymentLegalLink}
            onPress={() =>
              tabNavigation.navigate('LegalWebView', { title: 'Terms of use', uri: nativeEnv.termsUrl })
            }
            accessibilityRole="link">
            Terms of use
          </Text>
          .
        </Text>
      </ScrollView>

      {invoiceId ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            style={[styles.payNowBtn, payMutation.isPending && { opacity: 0.7 }]}
            disabled={payMutation.isPending || cards.length === 0}
            onPress={() => payMutation.mutate()}>
            <Text style={styles.payNowText}>
              {payMutation.isPending ? 'Processing…' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : null}

      <StripeAddCardModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          void refetch();
        }}
      />
    </View>
  );
}

function CardItem({
  card,
  selected,
  onSelect,
  onMakeDefault,
  onDelete,
}: {
  card: PaymentMethod;
  selected?: boolean;
  onSelect?: () => void;
  onMakeDefault?: () => void;
  onDelete?: () => void;
}) {
  const brand = card.card_brand.toLowerCase();

  return (
    <TouchableOpacity
      style={[styles.cardItem, (card.is_default || selected) && styles.cardItemDefault]}
      onPress={onSelect}
      onLongPress={() => {
        Alert.alert(card.card_brand.toUpperCase(), 'Choose an action', [
          { text: 'Cancel', style: 'cancel' },
          ...(card.is_default
            ? []
            : [{ text: 'Set as default', onPress: onMakeDefault }]),
          { text: 'Delete', style: 'destructive' as const, onPress: onDelete },
        ]);
      }}
      activeOpacity={0.85}>
      <View style={styles.iconBox}>
        <Ionicons
          name={brand === 'visa' ? 'card' : 'card-outline'}
          size={24}
          color={card.is_default || selected ? NAVY : GRAY}
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.bankName}>{card.card_brand.toUpperCase()} Card</Text>
        <Text style={styles.cardNumber}>**** **** **** {card.card_last4}</Text>
      </View>
      {card.is_default ? (
        <View style={styles.defaultBadge}>
          <Ionicons name="star" size={12} color="#22C55E" style={{ marginRight: 4 }} />
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      ) : selected ? (
        <Ionicons name="checkmark-circle" size={22} color={NAVY} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    backgroundColor: NAVY,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: Spacing.four,
  },
  headerContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    marginTop: 8,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardItemDefault: {
    borderColor: NAVY,
    borderWidth: 1.5,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY_TEXT,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 13,
    color: GRAY,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  addCardBtn: {
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#FFF',
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY,
  },
  paymentLegal: {
    marginTop: Spacing.four,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  paymentLegalLink: {
    color: NAVY,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    padding: Spacing.four,
    backgroundColor: '#FFF',
  },
  payNowBtn: {
    backgroundColor: NAVY,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payNowText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
