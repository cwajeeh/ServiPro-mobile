import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  createTaskInvoice,
  getTaskInvoice,
  submitInvoice,
  type TaskInvoiceData,
} from '@/api/invoices';
import {
  acceptTask,
  fetchTaskerTaskDetail,
  ignoreTask,
  rejectTask,
} from '@/api/taskerJobs';
import { InteractiveMap } from '@/components/shared/InteractiveMap';
import { TaskerSubHeader } from '@/components/tasker/TaskerSubHeader';
import { AuthPalette, Spacing, TaskerPalette } from '@/constants/theme';
import { useTaskerLiveLocationPublish } from '@/hooks/useLiveLocation';
import type { TaskerStackParamList } from '@/navigation/types';
import { useTaskSocketStore } from '@/store/taskSocketStore';
import { getCurrentPosition, requestLocationPermission } from '@/utils/nativeLocation';

const { NAVY, GRAY, PRIMARY_TEXT, ERROR_RED } = AuthPalette;
const { BG_LIGHT } = TaskerPalette;

type TaskerJobDetailsRouteProp = RouteProp<TaskerStackParamList, 'TaskerJobDetails'>;

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    // @ts-expect-error axios shape
    const msg = err.response?.data?.message;
    if (typeof msg === 'string' && msg) return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function normalizeStatus(raw: Record<string, unknown> | undefined, jobStatus?: string): string {
  const log = raw?.statusLog;
  const logStatus =
    log && typeof log === 'object' && 'status' in log
      ? String((log as { status?: string }).status ?? '')
      : '';
  return (
    logStatus ||
    String(raw?.assignmentStatus ?? raw?.status ?? jobStatus ?? 'open')
  ).toLowerCase();
}

function isOpenOrBidding(status: string): boolean {
  return ['open', 'bidding', 'pending', 'available', ''].includes(status);
}

function isAssigned(status: string): boolean {
  return ['assigned', 'accepted'].includes(status);
}

export function TaskerJobDetailsScreen() {
  const navigation = useNavigation<NavigationProp<TaskerStackParamList>>();
  const route = useRoute<TaskerJobDetailsRouteProp>();
  const { jobId } = route.params;
  const queryClient = useQueryClient();
  const taskIdNum = Number(jobId);

  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [hoursWorked, setHoursWorked] = useState('1');
  const [extraDesc, setExtraDesc] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [invoice, setInvoice] = useState<TaskInvoiceData | null>(null);

  const markOnTheWay = useTaskSocketStore((s) => s.markOnTheWay);
  const markArrived = useTaskSocketStore((s) => s.markArrived);
  const markStarted = useTaskSocketStore((s) => s.markStarted);
  const markCompleted = useTaskSocketStore((s) => s.markCompleted);
  const subscribeTask = useTaskSocketStore((s) => s.subscribeTask);
  const unsubscribeTask = useTaskSocketStore((s) => s.unsubscribeTask);
  const onTaskStatusChanged = useTaskSocketStore((s) => s.onTaskStatusChanged);
  const connect = useTaskSocketStore((s) => s.connect);

  const detailQuery = useQuery({
    queryKey: ['tasker', 'task', jobId],
    queryFn: () => fetchTaskerTaskDetail(jobId),
  });

  const job = detailQuery.data?.job;
  const raw = detailQuery.data?.raw as Record<string, unknown> | undefined;
  const status = useMemo(
    () => normalizeStatus(raw, job?.status),
    [raw, job?.status],
  );

  useTaskerLiveLocationPublish(status, Boolean(job));

  useEffect(() => {
    if (!Number.isFinite(taskIdNum)) return undefined;
    connect();
    subscribeTask(taskIdNum);
    const unsub = onTaskStatusChanged((payload) => {
      if (payload.taskId != null && Number(payload.taskId) !== taskIdNum) return;
      void detailQuery.refetch();
      void queryClient.invalidateQueries({ queryKey: ['tasker'] });
    });
    return () => {
      unsubscribeTask(taskIdNum);
      unsub();
    };
  }, [
    connect,
    detailQuery.refetch,
    onTaskStatusChanged,
    queryClient,
    subscribeTask,
    taskIdNum,
    unsubscribeTask,
  ]);

  useEffect(() => {
    if (!Number.isFinite(taskIdNum)) return;
    void getTaskInvoice(taskIdNum).then((inv) => setInvoice(inv));
  }, [taskIdNum, status]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tasker'] });
    await detailQuery.refetch();
  };

  const acceptMutation = useMutation({
    mutationFn: () => acceptTask(jobId),
    onSuccess: async () => {
      await invalidate();
      Alert.alert('Accepted', 'You accepted this task.');
    },
    onError: (e) => Alert.alert('Accept failed', apiErrorMessage(e, 'Could not accept task.')),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectTask(jobId),
    onSuccess: async () => {
      await invalidate();
      Alert.alert('Rejected', 'Task rejected.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    },
    onError: (e) => Alert.alert('Reject failed', apiErrorMessage(e, 'Could not reject task.')),
  });

  const ignoreMutation = useMutation({
    mutationFn: () => ignoreTask(jobId),
    onSuccess: async () => {
      await invalidate();
      navigation.goBack();
    },
    onError: (e) => Alert.alert('Ignore failed', apiErrorMessage(e, 'Could not ignore task.')),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const hours = Number(hoursWorked);
      if (!Number.isFinite(hours) || hours <= 0) {
        throw new Error('Enter valid hours worked.');
      }
      const additional_charges: { description: string; amount: number }[] = [];
      const amt = Number(extraAmount);
      if (extraDesc.trim() && Number.isFinite(amt) && amt > 0) {
        additional_charges.push({ description: extraDesc.trim(), amount: amt });
      }
      const created = await createTaskInvoice(taskIdNum, {
        hours_worked: hours,
        additional_charges,
      });
      const submitted = await submitInvoice(created.id);
      return submitted;
    },
    onSuccess: async (inv) => {
      setInvoice(inv);
      setInvoiceModalVisible(false);
      Alert.alert('Invoice submitted', 'Waiting for customer approval.');
      await invalidate();
    },
    onError: (e) => Alert.alert('Invoice failed', apiErrorMessage(e, 'Could not submit invoice.')),
  });

  const lat = Number(raw?.latitude);
  const lng = Number(raw?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const region = {
    latitude: hasCoords ? lat : 51.5074,
    longitude: hasCoords ? lng : -0.1278,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const clientId = Number(raw?.ClientId);
  const busy =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    ignoreMutation.isPending ||
    createInvoiceMutation.isPending;

  const handleOnTheWay = async () => {
    try {
      const granted = await requestLocationPermission();
      let startLat: number | undefined;
      let startLng: number | undefined;
      if (granted) {
        const pos = await getCurrentPosition();
        startLat = pos.latitude;
        startLng = pos.longitude;
      }
      markOnTheWay({ taskId: taskIdNum, startLat, startLng });
      await invalidate();
    } catch (e) {
      Alert.alert('Error', apiErrorMessage(e, 'Could not update status.'));
    }
  };

  if (detailQuery.isLoading) {
    return (
      <View style={[styles.root, styles.centerFull]}>
        <ActivityIndicator color={NAVY} size="large" />
      </View>
    );
  }

  if (detailQuery.isError || !job) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <TaskerSubHeader
            title="Job Details"
            subtitle=""
            onBack={() => navigation.goBack()}
            showSwitch={false}
          />
          <View style={styles.centerFull}>
            <Text style={{ color: ERROR_RED }}>Could not load job details.</Text>
            <Pressable onPress={() => void detailQuery.refetch()} style={styles.acceptBtn}>
              <Text style={styles.acceptBtnText}>Retry</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const invoiceStatus = (invoice?.status ?? '').toLowerCase();
  const invoicePending =
    invoiceStatus === 'submitted' ||
    invoiceStatus === 'pending_approval' ||
    invoiceStatus === 'draft';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TaskerSubHeader
          title="Job Details"
          subtitle={status.replace(/_/g, ' ')}
          onBack={() => navigation.goBack()}
          showSwitch={false}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <SectionLabel label="Title" />
            <Text style={styles.mainTitle}>{job.title}</Text>

            <SectionLabel label="Description" style={styles.mt} />
            <Text style={styles.description}>{job.description || '—'}</Text>

            <SectionLabel label="Category" style={styles.mt} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{job.category ?? 'General'} Services</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <SectionLabel label="Working Hours" />
                <Text style={styles.statValue}>{job.workingHours ?? job.estimatedTime}</Text>
              </View>
              <View style={styles.statCol}>
                <SectionLabel label="Job Budget" />
                <Text style={styles.statValue}>{job.budget || job.price}</Text>
              </View>
            </View>

            <SectionLabel label="Date & Time" style={styles.mt} />
            <Text style={styles.dateTimeText}>{job.dateTime || job.time}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.mapContainer}>
              <InteractiveMap region={region} />
            </View>
            <Pressable
              style={styles.getDirectionBtn}
              onPress={() => {
                if (!hasCoords) {
                  Alert.alert('No location', 'This job has no map coordinates.');
                  return;
                }
                void Linking.openURL(PlatformSelectMaps(lat, lng));
              }}>
              <Text style={styles.getDirectionText}>Get Direction</Text>
            </Pressable>
          </View>

          {job.media?.images?.length ? (
            <View style={styles.mediaContainer}>
              <View style={styles.mediaGrid}>
                {job.media.images.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={styles.mediaThumb} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.clientRow}>
              <Image source={{ uri: job.tasker.avatar }} style={styles.clientAvatar} />
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{job.tasker.name}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Svg
                      key={s}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={s <= (job.tasker.rating || 0) ? '#FFD500' : '#E0E0E0'}>
                      <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </Svg>
                  ))}
                  <Text style={styles.ratingText}>
                    {job.tasker.rating != null && Number.isFinite(Number(job.tasker.rating))
                      ? Number(job.tasker.rating).toFixed(1)
                      : '—'}
                  </Text>
                </View>
                {job.tasker.address ? (
                  <View style={styles.addressRow}>
                    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2">
                      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <Circle cx="12" cy="10" r="3" />
                    </Svg>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {job.tasker.address}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.clientActions}>
              <Pressable
                style={styles.clientActionBtn}
                onPress={() => {
                  if (!Number.isFinite(clientId)) {
                    Alert.alert('Chat unavailable', 'Customer id missing for this job.');
                    return;
                  }
                  navigation.navigate('TaskerChat', {
                    taskId: jobId,
                    receiverId: clientId,
                    title: job.tasker.name,
                  });
                }}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2">
                  <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </Svg>
                <Text style={styles.clientActionText}>Message</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            {isOpenOrBidding(status) ? (
              <>
                <Pressable
                  style={[styles.acceptBtn, busy && { opacity: 0.7 }]}
                  disabled={busy}
                  onPress={() =>
                    Alert.alert('Accept task', 'Accept this job now?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Accept', onPress: () => acceptMutation.mutate() },
                    ])
                  }>
                  <Text style={styles.acceptBtnText}>Accept Task</Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('TaskerPlaceBid', { jobId })}
                  style={[styles.backListBtn, { backgroundColor: NAVY }]}>
                  <Text style={[styles.backListBtnText, { color: '#FFF' }]}>Place a Bid</Text>
                </Pressable>
                <Pressable onPress={() => navigation.goBack()} style={styles.backListBtn}>
                  <Text style={styles.backListBtnText}>Back To Job Listing</Text>
                </Pressable>
                <Pressable
                  style={styles.rejectLink}
                  disabled={busy}
                  onPress={() =>
                    Alert.alert('Hide job', "Don't show this job again?", [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Hide',
                        style: 'destructive',
                        onPress: () => ignoreMutation.mutate(),
                      },
                    ])
                  }>
                  <Text style={styles.rejectText}>{"I don't want to see this job again."}</Text>
                </Pressable>
                <Pressable
                  style={styles.rejectLink}
                  disabled={busy}
                  onPress={() =>
                    Alert.alert('Reject task', 'Reject this task?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reject',
                        style: 'destructive',
                        onPress: () => rejectMutation.mutate(),
                      },
                    ])
                  }>
                  <Text style={styles.rejectText}>Reject task</Text>
                </Pressable>
              </>
            ) : null}

            {isAssigned(status) ? (
              <Pressable style={styles.acceptBtn} disabled={busy} onPress={() => void handleOnTheWay()}>
                <Text style={styles.acceptBtnText}>On the Way</Text>
              </Pressable>
            ) : null}

            {status === 'on_the_way' ? (
              <Pressable
                style={styles.acceptBtn}
                disabled={busy}
                onPress={() => {
                  markArrived(taskIdNum);
                  void invalidate();
                }}>
                <Text style={styles.acceptBtnText}>Arrived</Text>
              </Pressable>
            ) : null}

            {status === 'arrived' ? (
              <Pressable
                style={styles.acceptBtn}
                disabled={busy}
                onPress={() => {
                  markStarted(taskIdNum);
                  void invalidate();
                }}>
                <Text style={styles.acceptBtnText}>Start Job</Text>
              </Pressable>
            ) : null}

            {status === 'started' || status === 'in_progress' ? (
              <>
                <Pressable
                  style={styles.acceptBtn}
                  disabled={busy || invoicePending}
                  onPress={() => setInvoiceModalVisible(true)}>
                  <Text style={styles.acceptBtnText}>
                    {invoicePending ? 'Invoice Pending' : 'Create / Submit Invoice'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.backListBtn}
                  disabled={busy}
                  onPress={() => {
                    Alert.alert('Complete job', 'Mark this job as completed?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Complete',
                        onPress: () => {
                          markCompleted(taskIdNum);
                          void invalidate();
                        },
                      },
                    ]);
                  }}>
                  <Text style={styles.backListBtnText}>Mark Completed</Text>
                </Pressable>
              </>
            ) : null}

            {invoice ? (
              <Text style={styles.invoiceHint}>
                Invoice #{invoice.id} · {String(invoice.status)}
                {invoice.breakdown?.total != null
                  ? ` · £${Number(invoice.breakdown.total).toFixed(2)}`
                  : ''}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={invoiceModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Invoice</Text>
            <Text style={styles.modalLabel}>Hours worked</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={hoursWorked}
              onChangeText={setHoursWorked}
              placeholder="1"
            />
            <Text style={styles.modalLabel}>Extra charge description (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={extraDesc}
              onChangeText={setExtraDesc}
              placeholder="Materials, etc."
            />
            <Text style={styles.modalLabel}>Extra amount (optional)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={extraAmount}
              onChangeText={setExtraAmount}
              placeholder="0"
            />
            <Pressable
              style={[styles.acceptBtn, createInvoiceMutation.isPending && { opacity: 0.7 }]}
              disabled={createInvoiceMutation.isPending}
              onPress={() => createInvoiceMutation.mutate()}>
              <Text style={styles.acceptBtnText}>
                {createInvoiceMutation.isPending ? 'Submitting…' : 'Submit Invoice'}
              </Text>
            </Pressable>
            <Pressable style={styles.backListBtn} onPress={() => setInvoiceModalVisible(false)}>
              <Text style={styles.backListBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PlatformSelectMaps(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function SectionLabel({ label, style }: { label: string; style?: object }) {
  return <Text style={[styles.sectionLabel, style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_LIGHT },
  safe: { flex: 1 },
  centerFull: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  scroll: { padding: Spacing.four, paddingBottom: Spacing.six },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
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
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  getDirectionBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  getDirectionText: { fontSize: 14, fontWeight: '500', color: GRAY },
  mediaContainer: { marginBottom: Spacing.four },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  mediaThumb: { width: '31%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#F1F5F9' },
  clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.three },
  clientAvatar: { width: 80, height: 80, borderRadius: 40, marginRight: Spacing.three },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 22, fontWeight: '500', color: PRIMARY_TEXT },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 4 },
  ratingText: { fontSize: 12, fontWeight: '500', color: NAVY, marginLeft: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressText: { fontSize: 12, color: GRAY, lineHeight: 16, flex: 1 },
  clientActions: { flexDirection: 'row', gap: Spacing.two },
  clientActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  clientActionText: { fontSize: 14, fontWeight: '500', color: GRAY },
  footer: { marginTop: Spacing.two, gap: Spacing.two },
  acceptBtn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  acceptBtnText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  backListBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backListBtnText: { color: NAVY, fontSize: 16, fontWeight: '500' },
  rejectLink: { alignItems: 'center', marginTop: Spacing.one },
  rejectText: { color: ERROR_RED, fontSize: 14, fontWeight: '600' },
  invoiceHint: { textAlign: 'center', color: GRAY, fontSize: 13, marginTop: Spacing.two },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: PRIMARY_TEXT, marginBottom: 8 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: GRAY },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: PRIMARY_TEXT,
    marginBottom: 8,
  },
});
