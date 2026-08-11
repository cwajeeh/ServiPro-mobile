import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

export function NotificationsScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.sub}>Shared notifications placeholder.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.two },
  sub: { fontSize: 16, color: '#555' },
});
