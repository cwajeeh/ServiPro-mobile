import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthPalette, Spacing, TaskerPalette, Typography } from '@/constants/theme';
import type { TaskerStackParamList } from '@/navigation/types';

const { NAVY, GRAY, PRIMARY_TEXT } = AuthPalette;
const { ACCENT_BLUE } = TaskerPalette;

export interface JobItem {
  id: string;
  title: string;
  price: string;
  category?: string;
  description?: string;
  estimatedTime: string;
  distance: string;
  time: string;
  timer?: string;
  status?: 'In Progress' | 'Completed' | 'Upcoming';
  dateGroup?: string;
  tasker: {
    name: string;
    avatar: string;
    rating?: number;
    address?: string;
  };
  budget?: string;
  workingHours?: number;
  dateTime?: string;
  media?: {
    images: string[];
    videoThumbnail?: string;
  };
}

interface JobCardProps {
  job: JobItem;
  isOngoing?: boolean;
}

export function JobCard({ job, isOngoing }: JobCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<TaskerStackParamList>>();

  const statusColor = job.status === 'In Progress' ? '#BE4418' : '#00B365';

  return (
    <Pressable
      onPress={() => navigation.navigate('TaskerJobDetails', { jobId: job.id })}
      style={[styles.card, isOngoing && styles.ongoingCard]}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: job.tasker.avatar }} style={styles.avatar} />
          <Text style={styles.taskerName}>{job.tasker.name}</Text>
        </View>
        <View style={styles.infoCol}>
          <View style={styles.badgeRow}>
            {job.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{job.category}</Text>
              </View>
            )}
            {job.status && (
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{job.status}</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{job.title}</Text>
          {job.description && (
            <Text style={styles.description} numberOfLines={2}>
              {job.description}
            </Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Estimated Time: </Text>
            <Text style={styles.metaValue}>{job.estimatedTime}</Text>
            <Text style={styles.metaDivider}> | </Text>
            <Text style={styles.metaValue}>{job.distance}</Text>
            <Text style={styles.metaDivider}> | </Text>
            <Text style={styles.metaValue}>{job.time}</Text>
          </View>
        </View>
        <Text style={styles.price}>{job.price}</Text>
      </View>

      {isOngoing && job.timer && (
        <View style={styles.timerBtn}>
          <Text style={styles.timerText}>Time : {job.timer}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Increased for history design
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#F1F5F9', // Updated border color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  ongoingCard: {
    borderColor: 'rgba(50, 119, 241, 0.2)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatar: {
    width: 56, // Increased for history design
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
  },
  taskerName: {
    ...Typography.tiny,
    color: '#000',
    marginTop: 6,
  },
  infoCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...Typography.tinyBold,
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.tinyBold,
    color: '#FFF',
  },
  title: {
    ...Typography.h4,
    color: '#0F172A',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaLabel: {
    ...Typography.tiny,
    color: '#64748B',
  },
  metaValue: {
    ...Typography.tiny,
    fontWeight: '500',
    color: '#0F172A',
  },
  metaDivider: {
    ...Typography.tiny,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  price: {
    ...Typography.h4,
    color: NAVY,
    marginTop: 4,
  },
  timerBtn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  timerText: {
    color: '#FFF',
    ...Typography.bodyBold,
  },
});
