import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchTaskerTaskDetail, placeBid } from '@/api/taskerJobs';
import { TaskerSubHeader } from '@/components/tasker/TaskerSubHeader';
import { AuthPalette, Spacing, TaskerPalette } from '@/constants/theme';
import type { TaskerStackParamList } from '@/navigation/types';

const { NAVY, GRAY, PRIMARY_TEXT } = AuthPalette;
const { BG_LIGHT } = TaskerPalette;

type TaskerPlaceBidRouteProp = RouteProp<TaskerStackParamList, 'TaskerPlaceBid'>;

export function TaskerPlaceBidScreen() {
  const navigation = useNavigation();
  const route = useRoute<TaskerPlaceBidRouteProp>();
  const { jobId } = route.params;
  const queryClient = useQueryClient();

  const [rate, setRate] = useState('');
  const [message, setMessage] = useState('');

  const detailQuery = useQuery({
    queryKey: ['tasker', 'task', jobId],
    queryFn: () => fetchTaskerTaskDetail(jobId),
  });

  const job = detailQuery.data?.job;

  const mutation = useMutation({
    mutationFn: async () => {
      const amount = Number(rate);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Enter a valid bid amount.');
      }
      return placeBid(jobId, {
        amount,
        message: message.trim(),
        portfolio: [],
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasker', 'bidding'] });
      Alert.alert('Bid submitted', 'Your bid was sent to the customer.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios shape
            err.response?.data?.message
          : err instanceof Error
            ? err.message
            : 'Could not place bid.';
      Alert.alert('Bid failed', String(msg || 'Could not place bid.'));
    },
  });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TaskerSubHeader
          title="Place A Bid"
          subtitle=""
          onBack={() => navigation.goBack()}
          showSwitch={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {detailQuery.isLoading ? (
              <ActivityIndicator color={NAVY} style={{ marginTop: Spacing.six }} />
            ) : (
              <View style={styles.card}>
                <SectionLabel label="Title" />
                <Text style={styles.mainTitle}>{job?.title ?? 'Job'}</Text>

                <SectionLabel label="Description" style={styles.mt} />
                <Text style={styles.description}>{job?.description || '—'}</Text>

                <SectionLabel label="Category" style={styles.mt} />
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{job?.category ?? 'General'} Services</Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <SectionLabel label="Working Hours" />
                    <Text style={styles.statValue}>{job?.workingHours ?? job?.estimatedTime ?? '—'}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <SectionLabel label="Job Budget" />
                    <Text style={styles.statValue}>{job?.budget || job?.price || '—'}</Text>
                  </View>
                </View>

                <SectionLabel label="Date & Time" style={styles.mt} />
                <Text style={styles.dateTimeText}>{job?.dateTime || job?.time || '—'}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Place Your Bid</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.rateInput}
                  placeholder="Enter your rate here"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={rate}
                  onChangeText={setRate}
                />
                <Text style={styles.currencySymbol}>£</Text>
              </View>

              <TextInput
                style={styles.messageInput}
                placeholder="Write your message to the customer here"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <Pressable
              style={[styles.submitBtn, mutation.isPending && { opacity: 0.7 }]}
              disabled={mutation.isPending}
              onPress={() => mutation.mutate()}>
              {mutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function SectionLabel({ label, style }: { label: string; style?: object }) {
  return <Text style={[styles.sectionLabel, style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_LIGHT },
  safe: { flex: 1 },
  scroll: { padding: Spacing.four, paddingBottom: Spacing.six },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.five,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 4 },
  mt: { marginTop: Spacing.three },
  mainTitle: { fontSize: 20, fontWeight: '500', color: PRIMARY_TEXT },
  description: { fontSize: 16, color: PRIMARY_TEXT, lineHeight: 24 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryText: { fontSize: 14, fontWeight: '500', color: NAVY },
  statsRow: { flexDirection: 'row', marginTop: Spacing.three },
  statCol: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '500', color: NAVY },
  dateTimeText: { fontSize: 20, fontWeight: '500', color: NAVY },
  formContainer: { marginBottom: Spacing.five },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: PRIMARY_TEXT,
    marginBottom: Spacing.four,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.three,
    height: 56,
    marginBottom: Spacing.three,
  },
  rateInput: { flex: 1, fontSize: 16, color: PRIMARY_TEXT },
  currencySymbol: { fontSize: 16, color: '#94A3B8' },
  messageInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.three,
    height: 150,
    fontSize: 16,
    color: PRIMARY_TEXT,
    marginBottom: Spacing.four,
  },
  submitBtn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
