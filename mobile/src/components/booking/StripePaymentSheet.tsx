import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Colors, Spacing, Typography } from '@/constants';
import { Button } from '@/components/common/Button';

interface StripePaymentSheetProps {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onLoading?: (isLoading: boolean) => void;
  disabled?: boolean;
}

export const StripePaymentSheet: React.FC<StripePaymentSheetProps> = ({
  clientSecret,
  publishableKey,
  amount,
  onSuccess,
  onError,
  onLoading,
  disabled = false,
}) => {
  const { initPaymentSheet: initPS, presentPaymentSheet: presentPS } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializePaymentSheet();
  }, [clientSecret, publishableKey]);

  const initializePaymentSheet = async () => {
    try {
      setIsLoading(true);
      onLoading?.(true);

      const { error } = await initPS({
        merchantDisplayName: 'CasusApp',
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Guest',
        },
      });

      if (error) {
        console.error('Payment Sheet initialization error:', error);
        onError(`Initialization failed: ${error.message}`);
        return;
      }

      setIsInitialized(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize payment';
      console.error('Payment Sheet error:', err);
      onError(errorMsg);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      onLoading?.(true);

      const { error: presentError } = await presentPS();

      if (presentError) {
        if ((presentError as any).code === 'Canceled' || (presentError as any).code === 'Cancelled') {
          // User closed the payment sheet
          return;
        }
        throw new Error(presentError.message);
      }

      // Payment successful
      onSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed';
      console.error('Payment error:', err);
      onError(errorMsg);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Preparing payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>
          €{(amount / 100).toFixed(2)}
        </Text>
      </View>

      <Button
        onPress={handlePayment}
        disabled={disabled || isLoading}
        loading={isLoading}
        style={styles.payButton}
      >
        Pay Now
      </Button>

      <Text style={styles.secureText}>
        🔒 Payment processed securely by Stripe
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.md,
    color: Colors.light.textSecondary,
  },
  amountBox: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 36,
    color: Colors.primary,
  },
  payButton: {
    marginTop: Spacing.md,
  },
  secureText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
