import { apiClient } from './client';

export type HelpSupportPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function submitHelpSupport(payload: HelpSupportPayload) {
  const { data } = await apiClient.post('/help-support', {
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
  });
  return data;
}
