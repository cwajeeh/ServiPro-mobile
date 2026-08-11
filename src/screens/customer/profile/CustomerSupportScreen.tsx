import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { submitHelpSupport } from '@/api/helpSupport';
import { nativeEnv } from '@/config/nativeEnv';
import { AuthPalette, Spacing } from '@/constants/theme';
import { asLegalNavigation } from '@/navigation/legalNavigate';
import { useAuthStore } from '@/store/authStore';

const { NAVY } = AuthPalette;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function CustomerSupportScreen() {
  const navigation = useNavigation();
  const legalNav = asLegalNavigation(navigation);
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
    setForm((prev) => ({
      ...prev,
      name: prev.name || name,
      email: prev.email || user?.email || '',
    }));
  }, [user?.email, user?.first_name, user?.last_name]);

  const onSubmit = useCallback(async () => {
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      Alert.alert('Help & support', 'Please fill in all fields, including your message.');
      return;
    }
    if (!emailOk(form.email)) {
      Alert.alert('Help & support', 'Please enter a valid email address.');
      return;
    }
    try {
      setSubmitting(true);
      await submitHelpSupport(form);
      Alert.alert(
        'Thank you',
        'Thanks for your message. You can also browse the FAQ for quick answers.',
        [{ text: 'OK', onPress: () => setForm({ name: '', email: '', subject: '', message: '' }) }],
      );
    } catch (e) {
      Alert.alert('Help & support', e instanceof Error ? e.message : 'Could not submit your request.');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AuthToolPattern />
      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.faqCard}
            onPress={() => legalNav.navigate('LegalWebView', { title: 'FAQ', uri: nativeEnv.faqUrl })}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Open frequently asked questions">
            <Ionicons name="help-circle-outline" size={24} color={NAVY} />
            <View style={styles.faqCardTextWrap}>
              <Text style={styles.faqTitle}>Browse FAQ</Text>
              <Text style={styles.faqSubtitle}>Common questions on our website.</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.title}>Looking for Some Help?</Text>
          <Text style={styles.subtitle}>We are here to answer you.</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Name *"
                placeholderTextColor="#94A3B8"
                value={form.name}
                onChangeText={(val) => setForm({ ...form, name: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="email *"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(val) => setForm({ ...form, email: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Subject *"
                placeholderTextColor="#94A3B8"
                value={form.subject}
                onChangeText={(val) => setForm({ ...form, subject: val })}
              />
            </View>

            <View style={[styles.inputGroup, styles.messageGroup]}>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Your message *"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={form.message}
                onChangeText={(val) => setForm({ ...form, message: val })}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={() => void onSubmit()}
              disabled={submitting}
              accessibilityRole="button">
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit'}</Text>
            </TouchableOpacity>

            <View style={styles.legalFooter}>
              <Text style={styles.legalFooterText}>
                <Text
                  style={styles.legalFooterLink}
                  onPress={() =>
                    legalNav.navigate('LegalWebView', { title: 'Terms of use', uri: nativeEnv.termsUrl })
                  }
                  accessibilityRole="link">
                  Terms of use
                </Text>
                <Text style={styles.legalFooterText}>{' · '}</Text>
                <Text
                  style={styles.legalFooterLink}
                  onPress={() =>
                    legalNav.navigate('LegalWebView', { title: 'Privacy policy', uri: nativeEnv.privacyUrl })
                  }
                  accessibilityRole="link">
                  Privacy policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFF',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.three,
    marginBottom: Spacing.four,
    gap: 4,
  },
  faqCardTextWrap: {
    flex: 1,
    marginLeft: Spacing.two,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: NAVY,
  },
  faqSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: NAVY,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  messageGroup: {
    height: 180,
    paddingVertical: 16,
  },
  input: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  messageInput: {
    height: '100%',
  },
  submitBtn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  legalFooter: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  legalFooterText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  legalFooterLink: {
    fontSize: 13,
    color: NAVY,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
