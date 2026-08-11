import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { AuthToolPattern } from '@/components/shared/auth-tool-pattern';
import { mockCertificates, taskerDevMock } from '@/constants/taskerMockData';
import { AuthPalette, Spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';

const { NAVY, PRIMARY_TEXT, BORDER, MAIN_BLUE, GRAY, ERROR_RED } = AuthPalette;

type Props = NativeStackScreenProps<AuthStackParamList, 'TaskerCertificates'>;

export function TaskerCertificatesScreen({ navigation }: Props) {
  const [certs, setCerts] = useState(() => taskerDevMock(mockCertificates, []));
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString();
  };

  const onSaveItem = () => {
    if (!name || !type) return;
    const newCert = {
      id: Date.now().toString(),
      name: `${type} - ${name}`,
      date: formatDate(issueDate) || 'Today',
      description: desc || 'No description provided.',
    };
    setCerts([newCert, ...certs]);
    // Reset form
    setType('');
    setName('');
    setDesc('');
    setIssueDate(null);
    setHasExpiry(false);
    setExpiryDate(null);
  };

  const removeCert = (id: string) => {
    setCerts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthToolPattern />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Create Your Profile</Text>
            <Text style={styles.subtitle}>Add Your Certificates</Text>

            <View style={styles.formCard}>
              <TextInput style={styles.input} placeholder="Certificate Type*" placeholderTextColor={GRAY} value={type} onChangeText={setType} />
              <TextInput style={styles.input} placeholder="Certificate Name*" placeholderTextColor={GRAY} value={name} onChangeText={setName} />
              <TextInput style={[styles.input, styles.inputArea]} placeholder="Description" placeholderTextColor={GRAY} multiline numberOfLines={3} value={desc} onChangeText={setDesc} />
              <Pressable style={styles.dateInput} onPress={() => setShowIssuePicker(true)}>
                <Text style={{ fontSize: 14, color: issueDate ? PRIMARY_TEXT : GRAY }}>
                  {issueDate ? formatDate(issueDate) : 'Issue Date*'}
                </Text>
              </Pressable>

              <Pressable style={styles.checkboxRow} onPress={() => setHasExpiry(!hasExpiry)}>
                <View style={[styles.checkbox, hasExpiry && styles.checkboxActive]}>
                  {hasExpiry && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Add Expiry Date</Text>
              </Pressable>

              {hasExpiry && (
                <Pressable style={styles.dateInput} onPress={() => setShowExpiryPicker(true)}>
                  <Text style={{ fontSize: 14, color: expiryDate ? PRIMARY_TEXT : GRAY }}>
                    {expiryDate ? formatDate(expiryDate) : 'Expiry Date'}
                  </Text>
                </Pressable>
              )}

              <View style={styles.uploadRow}>
                <View style={styles.uploadTextCol}>
                  <Text style={styles.uploadLabel}>Upload Documents</Text>
                  <Text style={styles.uploadSubLabel}>Add your certificates</Text>
                </View>
                <View style={styles.uploadBtnCol}>
                  <Pressable style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>Upload</Text>
                  </Pressable>
                  <Text style={styles.uploadHint}>JPEG, PNG.</Text>
                </View>
              </View>

              <Pressable style={styles.saveBtn} onPress={onSaveItem}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>

            {showIssuePicker && (
              <DateTimePicker
                value={issueDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowIssuePicker(false);
                  if (selectedDate) {
                    setIssueDate(selectedDate);
                  }
                }}
              />
            )}

            {showExpiryPicker && (
              <DateTimePicker
                value={expiryDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowExpiryPicker(false);
                  if (selectedDate) {
                    setExpiryDate(selectedDate);
                  }
                }}
              />
            )}

            {certs.length > 0 && (
              <View style={styles.listContainer}>
                {certs.map((c) => (
                  <View key={c.id} style={styles.certCard}>
                    <View style={styles.certIconWrap}>
                      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Rect x="4" y="2" width="16" height="20" rx="2" stroke={MAIN_BLUE} strokeWidth="1.5" />
                        <Path d="M8 6h8M8 10h8M8 14h4" stroke={MAIN_BLUE} strokeWidth="1.5" strokeLinecap="round" />
                      </Svg>
                    </View>
                    <View style={styles.certInfo}>
                      <Text style={styles.certName}>{c.name}</Text>
                      <Text style={styles.certDate}>{c.date}</Text>
                      <Text style={styles.certDesc} numberOfLines={2}>{c.description}</Text>
                    </View>
                    <View style={styles.certActions}>
                      <Pressable style={styles.actionBtn}>
                        <Text style={styles.actionIconEdit}>✎</Text>
                      </Pressable>
                      <Pressable style={styles.actionBtnRed} onPress={() => removeCert(c.id)}>
                        <Text style={styles.actionIconDelete}>🗑</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
              onPress={() => {
                const signIn = useAuthStore.getState().signIn;
                signIn('tasker');
                navigation.navigate('TaskerHome' as never);
              }}>
              <Text style={styles.primaryBtnText}>Continue To Home Screen</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1, zIndex: 1 },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.four,
  },
  progressTrack: { flex: 1, height: 4, backgroundColor: BORDER, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: MAIN_BLUE },
  content: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  title: { fontSize: 24, fontWeight: '700', color: PRIMARY_TEXT, marginBottom: Spacing.four },
  subtitle: { fontSize: 16, color: PRIMARY_TEXT, fontWeight: '600', marginBottom: Spacing.three },
  formCard: { marginBottom: Spacing.six },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    fontSize: 14,
    color: PRIMARY_TEXT,
    backgroundColor: '#FAFAFA',
    marginBottom: Spacing.three,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    backgroundColor: '#FAFAFA',
    marginBottom: Spacing.three,
    justifyContent: 'center',
  },
  inputArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.three, gap: Spacing.two },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF'
  },
  checkboxActive: { backgroundColor: NAVY, borderColor: NAVY },
  checkMark: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  checkboxLabel: { fontSize: 14, color: '#444' },
  uploadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.four, marginTop: Spacing.two },
  uploadTextCol: { flex: 1 },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: PRIMARY_TEXT },
  uploadSubLabel: { fontSize: 12, color: GRAY },
  uploadBtnCol: { alignItems: 'center', width: 100 },
  secondaryBtn: { backgroundColor: '#E0E0E0', paddingVertical: 8, paddingHorizontal: Spacing.three, borderRadius: 4, width: '100%', alignItems: 'center' },
  secondaryBtnText: { fontSize: 13, color: '#555', fontWeight: '600' },
  uploadHint: { fontSize: 10, color: GRAY, marginTop: 4 },
  saveBtn: { backgroundColor: NAVY, borderRadius: 6, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  listContainer: { marginBottom: Spacing.six },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: Spacing.two,
    marginBottom: Spacing.three,
  },
  certIconWrap: { width: 40, alignItems: 'center', justifyContent: 'center' },
  certInfo: { flex: 1, paddingHorizontal: Spacing.two },
  certName: { fontSize: 13, fontWeight: '700', color: PRIMARY_TEXT, marginBottom: 2 },
  certDate: { fontSize: 11, color: GRAY, marginBottom: 4 },
  certDesc: { fontSize: 11, color: '#666' },
  certActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  actionBtnRed: { width: 32, height: 32, borderRadius: 16, backgroundColor: ERROR_RED, alignItems: 'center', justifyContent: 'center' },
  actionIconEdit: { fontSize: 14, color: '#444' },
  actionIconDelete: { fontSize: 14, color: '#FFF' },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  primaryBtn: { backgroundColor: NAVY, borderRadius: Spacing.two, paddingVertical: Spacing.three, alignItems: 'center' },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
