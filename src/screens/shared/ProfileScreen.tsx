import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export function ProfileScreen() {
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>Shared profile placeholder.</Text>
      <Pressable style={styles.out} onPress={() => void signOut()} accessibilityRole="button">
        <Text style={styles.outText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 16, color: '#555' },
  out: {
    marginTop: Spacing.four,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#EEE',
    borderRadius: Spacing.two,
  },
  outText: { fontSize: 16, fontWeight: '600' },
});
