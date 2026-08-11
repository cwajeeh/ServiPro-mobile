import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';

import { AuthPalette, Spacing } from '@/constants/theme';
import type { LegalWebViewParams } from '@/navigation/types';

const { NAVY } = AuthPalette;

type Props = NativeStackScreenProps<{ LegalWebView: LegalWebViewParams }, 'LegalWebView'>;

export function LegalWebViewScreen({ navigation, route }: Props) {
  const { title, uri } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const onError = useCallback((e: { nativeEvent: { description: string } }) => {
    setLoading(false);
    setError(e.nativeEvent.description || 'Could not load this page.');
  }, []);

  const onHttpError = useCallback((e: { nativeEvent: { statusCode: number; description: string } }) => {
    const code = e.nativeEvent.statusCode;
    if (code >= 400) {
      setLoading(false);
      setError(e.nativeEvent.description || `Page could not be loaded (HTTP ${code}).`);
    }
  }, []);

  const onRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Check your connection and try again.</Text>
          <Pressable style={styles.retryBtn} onPress={onRetry} accessibilityRole="button">
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          key={reloadKey}
          source={{ uri }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={onError}
          onHttpError={onHttpError}
          startInLoadingState
          setSupportMultipleWindows={false}
          style={styles.webview}
        />
      )}

      {loading && !error ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: NAVY,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,252,0.85)',
  },
  centered: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: NAVY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
