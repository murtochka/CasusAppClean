import { apiClient } from './api';

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
}

export interface CreateBookingPaymentRequest {
  bookingId: string;
  amount: number;
  currency?: string;
}

class PaymentService {
  private publishableKey: string | null = null;

  async initializeStripe() {
    // In production, fetch from backend
    // For now, use env variable
    try {
      const key = (globalThis as any)?.process?.env?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY as string | undefined;
      if (!key) {
        throw new Error('Stripe publishable key not configured');
      }
      this.publishableKey = key;
      return key;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }

  async createPaymentIntent(data: {
    bookingId: string;
    amount: number;
    currency?: string;
  }): Promise<PaymentIntentResponse> {
    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        '/payments/create-intent',
        {
          bookingId: data.bookingId,
          amount: data.amount,
          currency: data.currency || 'EUR',
        }
      );

      if (!response.clientSecret) {
        throw new Error('No client secret in response');
      }

      return response;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string, paymentMethodId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        '/payments/confirm',
        {
          clientSecret,
          paymentMethodId,
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      throw error;
    }
  }

  async handlePaymentError(error: Error): Promise<string> {
    if (error.message.includes('card_declined')) {
      return 'Your card was declined. Please try another payment method.';
    }
    if (error.message.includes('insufficient_funds')) {
      return 'Insufficient funds on your card.';
    }
    if (error.message.includes('expired_card')) {
      return 'Your card has expired.';
    }
    return 'Payment failed. Please try again or use another payment method.';
  }

  getPublishableKey(): string | null {
    return this.publishableKey;
  }
}

export const paymentService = new PaymentService();
