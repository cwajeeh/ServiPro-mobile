import { StatusBar } from '@/components/shared/RnStatusBar';
import * as Sentry from '@sentry/react-native';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>
            <ThemedText type="subtitle" style={styles.title}>Oops! Something went wrong</ThemedText>
            <ThemedText style={styles.message}>
              {
                "We've encountered an unexpected error. You can try again; if this keeps happening, contact support."
              }
            </ThemedText>

            {__DEV__ && (
              <View style={styles.errorBox}>
                <ThemedText type="code" style={styles.errorText}>
                  {this.state.error?.toString()}
                </ThemedText>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRestart}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#1E293B',
  },
  message: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 32,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
