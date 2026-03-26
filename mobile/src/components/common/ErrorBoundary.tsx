import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'app' | 'route' | 'section';
  maxRetries?: number;
  enableAutoRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

// Helper to detect network errors
const isNetworkError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' // Fetch API often throws TypeError
  );
};

/**
 * ErrorBoundary - Catches rendering errors in subtree
 * Levels:
 * - 'app': Global app-level boundary (shows full fallback)
 * - 'route': Individual route boundary (shows retry + home button)
 * - 'section': Component section boundary (minimal fallback)
 * 
 * Features:
 * - Automatic retry for network errors (with exponential backoff)
 * - Manual retry via button
 * - Retry limits (default: 3 attempts)
 * - Loading state during retry
 */
export class ErrorBoundary extends React.Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES: number;
  private readonly ENABLE_AUTO_RETRY: boolean;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      retryCount: 0,
      isRetrying: false,
    };
    this.MAX_RETRIES = props.maxRetries ?? 3;
    this.ENABLE_AUTO_RETRY = props.enableAutoRetry ?? true;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`ErrorBoundary [${this.props.level || 'app'}] caught error:`, {
      message: error.message,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for network errors (only once per error)
    if (
      this.ENABLE_AUTO_RETRY &&
      this.state.retryCount < this.MAX_RETRIES &&
      isNetworkError(error)
    ) {
      this.autoRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  autoRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 8000); // 1s, 2s, 4s, 8s max

    logger.info(`ErrorBoundary auto-retry in ${delay}ms (attempt ${this.state.retryCount + 1}/${this.MAX_RETRIES})`);

    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
      });
    }, delay);
  };

  reset = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.setState({ 
      hasError: false, 
      error: null,
      retryCount: 0,
      isRetrying: false,
    });
  };

  render() {
    if (this.state.hasError) {
      const isDark = true; // Use dark for error screens
      const theme = isDark ? Colors.dark : Colors.light;
      const level = this.props.level || 'app';
      const canRetry = this.state.retryCount < this.MAX_RETRIES;
      const isNetwork = this.state.error ? isNetworkError(this.state.error) : false;

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show loading during auto-retry
      if (this.state.isRetrying) {
        return (
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.retryingText, { color: theme.textSecondary }]}>
                Retrying... (Attempt {this.state.retryCount + 1}/{this.MAX_RETRIES})
              </Text>
            </View>
          </View>
        );
      }

      // Default fallback UI based on level
      if (level === 'section') {
        return (
          <View style={[styles.sectionContainer, { backgroundColor: theme.background }]}>
            <View style={styles.sectionContent}>
              <Ionicons name="alert-circle-outline" size={24} color={Colors.error} />
              <Text
                style={[styles.sectionText, { color: theme.text }]}
                numberOfLines={2}
              >
                Something went wrong
              </Text>
              {canRetry && (
                <Pressable
                  style={({ pressed }) => [
                    styles.sectionRetryButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={this.reset}
                >
                  <Text style={styles.sectionRetryText}>Retry</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      }

      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.content}>
            <Ionicons name="alert-circle-outline" size={56} color={Colors.error} />

            <Text style={[styles.title, { color: theme.text }]}>
              {level === 'route' ? 'Page Error' : 'App Error'}
            </Text>

            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>

            {isNetwork && (
              <Text style={[styles.hint, { color: theme.textSecondary }]}>
                This appears to be a network issue. Check your connection.
              </Text>
            )}

            {this.state.retryCount > 0 && (
              <Text style={[styles.retryInfo, { color: theme.textSecondary }]}>
                Retry attempts: {this.state.retryCount}/{this.MAX_RETRIES}
              </Text>
            )}

            {__DEV__ && (
              <View
                style={[
                  styles.devBox,
                  { backgroundColor: Colors.error + '15', borderColor: Colors.error },
                ]}
              >
                <Text style={[styles.devText, { color: Colors.error }]}>
                  {this.state.error?.toString()}
                </Text>
              </View>
            )}

            <View style={level === 'app' ? styles.buttonRow : styles.routeButtonRow}>
              {canRetry && (
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={this.reset}
                >
                  <Text style={styles.primaryButtonText}>
                    {level === 'route' ? 'Try Again' : 'Restart App'}
                  </Text>
                </Pressable>
              )}

              {!canRetry && level === 'route' && (
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: pressed ? 0.7 : 1, backgroundColor: Colors.error },
                  ]}
                  onPress={() => {
                    // Reset retry count and try again
                    this.setState({ retryCount: 0 }, this.reset);
                  }}
                >
                  <Text style={styles.primaryButtonText}>
                    Force Retry
                  </Text>
                </Pressable>
              )}

              {level === 'route' && (
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { opacity: pressed ? 0.7 : 1, borderColor: theme.border },
                  ]}
                  onPress={() => {
                    // Navigate home (parent should handle this)
                    this.reset();
                  }}
                >
                  <Text style={[styles.secondaryButtonText, { color: Colors.primary }]}>
                    Go Home
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  retryInfo: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.md,
  },
  retryingText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.md,
  },
  devBox: {
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    maxHeight: 100,
  },
  devText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  buttonRow: {
    width: '100%',
  },
  routeButtonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.md,
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  secondaryButton: {
    borderWidth: 2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.md,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  sectionContainer: {
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    marginBottom: Spacing.md,
  },
  sectionContent: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  sectionRetryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.sm,
  },
  sectionRetryText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
});
