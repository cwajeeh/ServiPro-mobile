import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from '@/components/shared/RnStatusBar';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CancelTaskModal } from '@/components/customer/bookings/CancelTaskModal';
import { JobCompletedModal } from '@/components/customer/bookings/JobCompletedModal';
import { ReportIssueModal } from '@/components/customer/bookings/ReportIssueModal';
import { ThemedText } from '@/components/themed-text';
import { AuthPalette, Spacing } from '@/constants/theme';
import { useCustomerTaskDetail } from '@/hooks/useTaskDetail';
import { useCustomerLiveLocation } from '@/hooks/useLiveLocation';
import type { CustomerTabParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { useTaskSocketStore } from '@/store/taskSocketStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  approveInvoice,
  getTaskInvoice,
  rejectInvoice,
  type TaskInvoiceData,
} from '@/api/invoices';
import { createDispute } from '@/api/tasks';
import { postReview } from '@/api/review';
import { uploadFiles } from '@/api/uploads';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── status → stepper index mapping ──────────────────────────────────────────
const STATUS_STEP_MAP: Record<string, number> = {
  // assignmentStatus values
  accepted: 0,
  // statusLog.status values
  on_the_way: 1,
  arrived: 1,
  // terminal
  in_progress: 1,
  completed: 2,
};

function resolveStepIndex(task: {
  assignmentStatus: string;
  status: string;
  statusLog: { status: string } | null;
}): number {
  // highest priority: explicit status-log status
  if (task.statusLog?.status) {
    const idx = STATUS_STEP_MAP[task.statusLog.status];
    if (idx !== undefined) return idx;
  }
  // fall back to overall task status
  const idx = STATUS_STEP_MAP[task.status] ?? STATUS_STEP_MAP[task.assignmentStatus] ?? 0;
  return idx;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} · ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: full }).map((_, i) => (
        <Ionicons key={`f${i}`} name="star" size={14} color="#F59E0B" />
      ))}
      {half && <Ionicons name="star-half" size={14} color="#F59E0B" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Ionicons key={`e${i}`} name="star-outline" size={14} color="#CBD5E1" />
      ))}
    </View>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function CustomerTaskDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerTabParamList>>();
  const route = useRoute<RouteProp<CustomerTabParamList, 'CustomerTaskDetail'>>();
  const { taskId } = route.params;
  const myUserId = useAuthStore((s) => s.user?.id);

  const { data: task, isLoading, isError, refetch } = useCustomerTaskDetail(taskId);
  const { cancelTask, markCompleted, onTaskStatusChanged, subscribeTask, unsubscribeTask } = useTaskSocketStore();

  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
  const [jobCompletedModalVisible, setJobCompletedModalVisible] = React.useState(false);
  const [reportIssueModalVisible, setReportIssueModalVisible] = React.useState(false);
  const [invoice, setInvoice] = React.useState<TaskInvoiceData | null>(null);

  const trackingEnabled = ['on_the_way', 'arrived', 'started', 'in_progress', 'accepted', 'assigned'].includes(
    (task?.statusLog?.status || task?.status || task?.assignmentStatus || '').toLowerCase(),
  );
  const { providerLocation } = useCustomerLiveLocation(
    task?.providerId,
    Boolean(task && trackingEnabled && task.providerId),
  );

  React.useEffect(() => {
    if (!taskId) return;
    void getTaskInvoice(taskId).then((inv) => setInvoice(inv));
  }, [taskId, task?.status]);

  // ── Socket Integration ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (taskId) {
      subscribeTask(Number(taskId));

      const unsub = onTaskStatusChanged((payload) => {
        if (payload.taskId === Number(taskId)) {
          refetch(); // Refresh UI data

          if (payload.status === 'completed') {
            setJobCompletedModalVisible(true);
          }
        }
      });

      return () => {
        unsubscribeTask(Number(taskId));
        unsub();
      };
    }
  }, [taskId]);

  // Handle case where task is already completed on mount
  React.useEffect(() => {
    if (task?.status === 'completed' || task?.status === 'assignment_completed') {
      // Optional: show modal if not already paid? 
      // For now, let's just show it if status is completed and it's not paid yet.
      if (!task.is_paid) {
        setJobCompletedModalVisible(true);
      }
    }
  }, [task?.status, task?.is_paid]);

  const handleCancelSubmit = (finalReason: string) => {
    cancelTask({ taskId: Number(taskId), reason: finalReason });
    setCancelModalVisible(false);
    Alert.alert('Success', 'Cancellation request submitted.');
    navigation.goBack();
  };

  const handleJobComplete = async () => {
    markCompleted(Number(taskId));
    setJobCompletedModalVisible(false);

    const revieweeId = task?.providerUserId;
    if (revieweeId) {
      Alert.alert('Leave a review?', 'Would you like to rate this professional now?', [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Rate 5★',
          onPress: () => {
            void postReview({
              revieweeId,
              rating: 5,
              comment: 'Great job!',
              reviewAs: 'customer',
              taskId,
            })
              .then(() => Alert.alert('Thanks', 'Your review was submitted.'))
              .catch((e) =>
                Alert.alert('Review', e instanceof Error ? e.message : 'Could not submit review.'),
              );
          },
        },
      ]);
    } else {
      Alert.alert('Success', 'Job completion confirmed.');
    }
    refetch();
  };

  const handleReportIssue = () => {
    setJobCompletedModalVisible(false);
    setReportIssueModalVisible(true);
  };

  const handleReportSubmit = async (data: { reason: string; description: string; images: string[] }) => {
    try {
      let image_urls: string[] = [];
      if (data.images.length > 0) {
        const uploaded = await uploadFiles(
          data.images.map((uri, i) => ({
            uri,
            mimeType: 'image/jpeg',
            fileName: `dispute_${i}.jpg`,
          })),
          { rootFolder: 'disputes' },
        );
        image_urls = uploaded.map((f) => f.url).filter(Boolean);
      }
      const description = [data.reason, data.description].filter(Boolean).join('\n');
      await createDispute(taskId, {
        description,
        reason: data.reason,
        image_urls,
      });
      setReportIssueModalVisible(false);
      Alert.alert('Report Submitted', 'Our support team will review your case shortly.');
    } catch (e) {
      Alert.alert('Dispute failed', e instanceof Error ? e.message : 'Could not submit dispute.');
    }
  };

  const steps = [
    { label: 'Accepted', icon: 'checkmark-circle' as const },
    { label: 'On the Way', icon: 'checkmark-circle' as const },
    { label: 'Completed', icon: 'checkmark-circle' as const },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={AuthPalette.NAVY} />
        <ThemedText style={styles.centerText}>Loading task details…</ThemedText>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !task) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Ionicons name="cloud-offline-outline" size={52} color="#CBD5E1" />
        <ThemedText style={styles.errorText}>Could not load task details</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <ThemedText style={styles.retryBtnText}>Try Again</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStepIndex = resolveStepIndex(task);
  const hasLocation =
    typeof task.latitude === 'number' && typeof task.longitude === 'number';
  const clientRating = parseFloat(task.clientRating) || 0;
  const amountLabel = task.amountType === 'hourly' ? '/hr' : ' fixed';

  const mapLat = providerLocation?.lat ?? task.latitude;
  const mapLng = providerLocation?.lng ?? task.longitude;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Task Details</ThemedText>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Status Stepper ────────────────────────────────────────────── */}
        <View style={styles.stepperContainer}>
          {/* progress track */}
          <View style={styles.trackBase} />
          <View
            style={[
              styles.trackProgress,
              {
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              },
            ]}
          />
          {/* step nodes */}
          <View style={styles.stepsWrapper}>
            {steps.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <View key={step.label} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isActive ? styles.stepCircleActive : styles.stepCircleInactive,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={18}
                      color={isActive ? '#FFF' : '#CBD5E1'}
                    />
                  </View>
                  <ThemedText
                    style={[
                      styles.stepLabel,
                      isActive ? styles.stepLabelActive : styles.stepLabelInactive,
                    ]}
                  >
                    {step.label}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Map ───────────────────────────────────────────────────────── */}
        {hasLocation && (
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              region={{
                latitude: mapLat,
                longitude: mapLng,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: task.latitude, longitude: task.longitude }}
                title={task.taskTitle}
                pinColor={AuthPalette.NAVY}
              >
                <View style={styles.markerContainer}>
                  <Ionicons name="location" size={32} color={AuthPalette.NAVY} />
                </View>
              </Marker>
              {providerLocation ? (
                <Marker
                  coordinate={{ latitude: providerLocation.lat, longitude: providerLocation.lng }}
                  title="Professional"
                  pinColor="#10B981"
                >
                  <View style={[styles.markerContainer, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Ionicons name="car" size={28} color="#059669" />
                  </View>
                </Marker>
              ) : null}
            </MapView>
          </View>
        )}

        {/* ── Client Card ───────────────────────────────────────────────── */}
        <View style={styles.proCard}>
          <View style={styles.proHeader}>
            {task.clientProfileImage ? (
              <Image source={{ uri: task.clientProfileImage }} style={styles.proAvatar} />
            ) : (
              <View style={[styles.proAvatar, styles.proAvatarFallback]}>
                <Ionicons name="person" size={36} color="#94A3B8" />
              </View>
            )}
            <View style={styles.proInfo}>
              <ThemedText style={styles.proName}>{task.clientName}</ThemedText>
              <ThemedText style={styles.proCategory}>
                {task.categoryName}
              </ThemedText>
              <View style={styles.ratingRow}>
                {renderStars(clientRating)}
                <ThemedText style={styles.ratingText}>{task.clientRating}</ThemedText>
              </View>
              {task.clientAddress ? (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={13} color="#64748B" />
                  <ThemedText style={styles.addressText} numberOfLines={2}>
                    {task.clientAddress}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.proActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                const receiverId =
                  task.providerUserId ??
                  (task.ClientId && Number(task.ClientId) !== Number(myUserId)
                    ? Number(task.ClientId)
                    : null);
                if (!receiverId || !Number.isFinite(receiverId)) {
                  Alert.alert('Chat unavailable', 'Professional contact is not available yet.');
                  return;
                }
                navigation.navigate('CustomerChat', {
                  taskId,
                  receiverId,
                  title: task.clientName,
                });
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color={AuthPalette.NAVY} />
              <ThemedText style={styles.actionButtonText}>Message</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={20} color={AuthPalette.NAVY} />
              <ThemedText style={styles.actionButtonText}>Call</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Task Details Card ─────────────────────────────────────────── */}
        <View style={styles.detailsCard}>
          {/* Title */}
          <View style={styles.detailSection}>
            <ThemedText style={styles.detailLabel}>Title</ThemedText>
            <ThemedText style={styles.detailTitle}>{task.taskTitle}</ThemedText>
          </View>

          {/* Description */}
          {task.description ? (
            <View style={styles.detailSection}>
              <ThemedText style={styles.detailLabel}>Description</ThemedText>
              <ThemedText style={styles.detailDesc}>{task.description}</ThemedText>
            </View>
          ) : null}

          {/* Category */}
          <View style={styles.detailSection}>
            <ThemedText style={styles.detailLabel}>Category</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              <View style={styles.categoryBadge}>
                <ThemedText style={styles.categoryBadgeText}>{task.categoryName}</ThemedText>
              </View>
              {task.subCategory ? (
                <View style={[styles.categoryBadge, styles.subCategoryBadge]}>
                  <ThemedText style={styles.subCategoryBadgeText}>{task.subCategory}</ThemedText>
                </View>
              ) : null}
            </View>
          </View>

          {/* Scheduled Date */}
          {task.scheduledDate ? (
            <View style={styles.detailSection}>
              <ThemedText style={styles.detailLabel}>Scheduled Date</ThemedText>
              <View style={styles.iconValueRow}>
                <Ionicons name="calendar-outline" size={16} color={AuthPalette.NAVY} />
                <ThemedText style={styles.detailValue}>
                  {formatDate(task.scheduledDate)}
                </ThemedText>
              </View>
            </View>
          ) : null}

          {/* Working Hours + Budget */}
          <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 }]}>
            <View style={styles.detailHalf}>
              <ThemedText style={styles.detailLabel}>Working Hours</ThemedText>
              <View style={styles.iconValueRow}>
                <Ionicons name="time-outline" size={16} color={AuthPalette.NAVY} />
                <ThemedText style={styles.detailValue}>{task.working_hours || '—'}</ThemedText>
              </View>
            </View>
            <View style={styles.detailHalf}>
              <ThemedText style={styles.detailLabel}>
                {task.amountType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
              </ThemedText>
              <View style={styles.iconValueRow}>
                <MaterialCommunityIcons name="currency-gbp" size={16} color={AuthPalette.NAVY} />
                <ThemedText style={styles.detailValue}>
                  £{task.amount}
                  {amountLabel}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* ── Payment Status Banner ─────────────────────────────────────── */}
        <View style={[styles.paymentBanner, task.is_paid ? styles.paymentPaid : styles.paymentUnpaid]}>
          <Ionicons
            name={task.is_paid ? 'checkmark-circle' : 'time-outline'}
            size={18}
            color={task.is_paid ? '#10B981' : '#F59E0B'}
          />
          <ThemedText style={[styles.paymentText, task.is_paid ? styles.paymentTextPaid : styles.paymentTextUnpaid]}>
            {task.is_paid ? 'Payment Completed' : 'Payment Pending'}
          </ThemedText>
        </View>

        {invoice ? (
          <View style={styles.invoiceCard}>
            <ThemedText style={styles.detailLabel}>Invoice</ThemedText>
            <ThemedText style={styles.detailTitle}>
              #{invoice.id} · {String(invoice.status)}
              {invoice.breakdown?.total != null
                ? ` · £${Number(invoice.breakdown.total).toFixed(2)}`
                : ''}
            </ThemedText>
            {['submitted', 'pending_approval', 'SUBMITTED'].includes(String(invoice.status)) ? (
              <View style={styles.invoiceActions}>
                <TouchableOpacity
                  style={styles.invoiceRejectBtn}
                  onPress={() => {
                    Alert.alert('Reject invoice', 'Reject this invoice?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reject',
                        style: 'destructive',
                        onPress: () => {
                          void rejectInvoice(invoice.id)
                            .then((inv) => {
                              setInvoice(inv);
                              Alert.alert('Rejected', 'Invoice rejected.');
                              refetch();
                            })
                            .catch((e) =>
                              Alert.alert(
                                'Error',
                                e instanceof Error ? e.message : 'Could not reject invoice.',
                              ),
                            );
                        },
                      },
                    ]);
                  }}
                >
                  <ThemedText style={styles.invoiceRejectText}>Reject</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.invoiceApproveBtn}
                  onPress={() => {
                    void approveInvoice(invoice.id)
                      .then((inv) => {
                        setInvoice(inv);
                        Alert.alert('Approved', 'Invoice approved. Continue to payment.', [
                          {
                            text: 'Pay Now',
                            onPress: () =>
                              navigation.navigate('CustomerAddCards', { invoiceId: invoice.id }),
                          },
                          { text: 'Later', style: 'cancel' },
                        ]);
                        refetch();
                      })
                      .catch((e) =>
                        Alert.alert(
                          'Error',
                          e instanceof Error ? e.message : 'Could not approve invoice.',
                        ),
                      );
                  }}
                >
                  <ThemedText style={styles.invoiceApproveText}>Approve</ThemedText>
                </TouchableOpacity>
              </View>
            ) : null}
            {['approved', 'APPROVED'].includes(String(invoice.status)) && !task.is_paid ? (
              <TouchableOpacity
                style={styles.invoiceApproveBtn}
                onPress={() => navigation.navigate('CustomerAddCards', { invoiceId: invoice.id })}
              >
                <ThemedText style={styles.invoiceApproveText}>Pay Invoice</ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* ── Cancel ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setCancelModalVisible(true)}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel Job</ThemedText>
        </TouchableOpacity>

        {/* ── Cancellation Modal ────────────────────────────────────────── */}
        <CancelTaskModal
          visible={cancelModalVisible}
          onClose={() => setCancelModalVisible(false)}
          onSubmit={handleCancelSubmit}
        />

        {/* ── Job Completed Modal ───────────────────────────────────────── */}
        <JobCompletedModal
          visible={jobCompletedModalVisible}
          onJobComplete={handleJobComplete}
          onReportIssue={handleReportIssue}
        />

        {/* ── Report Issue Modal ────────────────────────────────────────── */}
        <ReportIssueModal
          visible={reportIssueModalVisible}
          onClose={() => setReportIssueModalVisible(false)}
          onSubmit={(data) => {
            void handleReportSubmit(data);
          }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Loading / Error
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  centerText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AuthPalette.NAVY,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Header
  headerContainer: {
    backgroundColor: AuthPalette.NAVY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: Spacing.four,
  },
  headerContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFF',
  },
  scrollContent: {
    padding: Spacing.four,
  },

  // Stepper
  stepperContainer: {
    marginVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  trackBase: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 0,
  },
  trackProgress: {
    position: 'absolute',
    top: 20,
    left: 40,
    height: 2,
    backgroundColor: AuthPalette.NAVY,
    zIndex: 1,
  },
  stepsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  stepItem: {
    alignItems: 'center',
    width: 80,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  stepCircleInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  stepCircleActive: {
    backgroundColor: AuthPalette.NAVY,
    borderColor: AuthPalette.NAVY,
  },
  stepCircleCurrent: {
    shadowColor: AuthPalette.NAVY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLabelInactive: { color: '#94A3B8' },
  stepLabelActive: { color: AuthPalette.NAVY },

  // Map
  mapCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  map: { ...StyleSheet.absoluteFillObject },
  markerContainer: {
    padding: 4,
    backgroundColor: 'rgba(0, 26, 110, 0.08)',
    borderRadius: 20,
  },

  // Client Card
  proCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  proHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  proAvatar: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  proAvatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  proInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 3,
  },
  proName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  proCategory: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'flex-start',
    gap: 3,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    flex: 1,
  },
  proActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: AuthPalette.NAVY,
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  detailSection: { marginBottom: 18 },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  detailDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuthPalette.NAVY,
  },
  subCategoryBadge: {
    backgroundColor: '#F0FDF4',
  },
  subCategoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailHalf: { flex: 1 },
  iconValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Payment Banner
  paymentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginBottom: Spacing.four,
    borderWidth: 1,
  },
  paymentPaid: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  paymentUnpaid: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  paymentTextPaid: { color: '#065F46' },
  paymentTextUnpaid: { color: '#92400E' },

  invoiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  invoiceActions: { flexDirection: 'row', gap: 10 },
  invoiceRejectBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceRejectText: { color: '#EF4444', fontWeight: '700' },
  invoiceApproveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthPalette.NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceApproveText: { color: '#FFF', fontWeight: '700' },

  // Cancel
  cancelButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginTop: Spacing.two,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
});
