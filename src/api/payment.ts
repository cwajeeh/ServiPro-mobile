import { apiClient } from './client';

export interface AttachPaymentMethodPayload {
  payment_method_id: string;
  address_line1: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
}

export interface PaymentMethod {
  id: number;
  user_id: number;
  stripe_payment_method_id: string;
  stripe_customer_id: string;
  card_last4: string;
  card_brand: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export async function attachPaymentMethod(payload: AttachPaymentMethodPayload) {
  const { data } = await apiClient.post('/payment/methods', payload);
  return data;
}

export async function fetchPaymentMethods() {
  const { data } = await apiClient.get<{ data: PaymentMethod[] }>('/payment/methods');
  return data.data;
}

export async function setDefaultPaymentMethod(id: number) {
  const { data } = await apiClient.put(`/payment/methods/${id}/default`);
  return data;
}

export async function deletePaymentMethod(id: number) {
  const { data } = await apiClient.delete(`/payment/methods/${id}`);
  return data;
}

