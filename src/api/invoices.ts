import { apiClient } from './client';

export type InvoiceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'pending_approval'
  | 'rejected'
  | 'approved'
  | 'paid'
  | 'succeeded'
  | string;

export type TaskInvoiceData = {
  id: number;
  status: InvoiceStatus;
  task?: {
    id?: number;
    title?: string;
    amount?: string | number;
    isPaid?: boolean;
    invoice_id?: number;
  };
  breakdown?: {
    subtotal?: string | number;
    platform_fee?: string | number;
    trust_safety_fee?: string | number;
    total?: string | number;
  };
};

type InvoiceEnvelope = {
  statusCode?: number;
  data?: TaskInvoiceData;
  message?: string;
};

function unwrapInvoice(body: unknown): TaskInvoiceData | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as InvoiceEnvelope & TaskInvoiceData;
  if (b.data && typeof b.data === 'object' && b.data.id != null) return b.data;
  if (b.id != null) return b as TaskInvoiceData;
  return null;
}

export async function getTaskInvoice(taskId: number | string): Promise<TaskInvoiceData | null> {
  try {
    const { data } = await apiClient.get<unknown>(`/invoices/task/${taskId}`);
    return unwrapInvoice(data);
  } catch {
    return null;
  }
}

export async function createTaskInvoice(
  taskId: number | string,
  payload: {
    hours_worked: number;
    additional_charges: { description: string; amount: number }[];
  },
): Promise<TaskInvoiceData> {
  const { data } = await apiClient.post<unknown>(`/invoices/task/${taskId}`, payload);
  const invoice = unwrapInvoice(data);
  if (!invoice) throw new Error('Could not create invoice.');
  return invoice;
}

export async function submitInvoice(invoiceId: number): Promise<TaskInvoiceData> {
  const { data } = await apiClient.post<unknown>(`/invoices/${invoiceId}/submit`, {});
  const invoice = unwrapInvoice(data);
  if (!invoice) throw new Error('Could not submit invoice.');
  return invoice;
}

export async function approveInvoice(invoiceId: number): Promise<TaskInvoiceData> {
  const { data } = await apiClient.put<unknown>(`/invoices/${invoiceId}/approve`, {});
  const invoice = unwrapInvoice(data);
  if (!invoice) throw new Error('Could not approve invoice.');
  return invoice;
}

export async function rejectInvoice(invoiceId: number, reason?: string): Promise<TaskInvoiceData> {
  const { data } = await apiClient.put<unknown>(`/invoices/${invoiceId}/reject`, { reason });
  const invoice = unwrapInvoice(data);
  if (!invoice) throw new Error('Could not reject invoice.');
  return invoice;
}

export async function processInvoicePayment(
  invoiceId: number,
  paymentMethodId?: string,
): Promise<unknown> {
  const { data } = await apiClient.post(`/payments/invoice/${invoiceId}/process`, {
    payment_method_id: paymentMethodId,
  });
  return data;
}
