import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../config/api';

export interface CheckoutSessionPayload {
  planName: string;
  billingCycle: 'MONTHLY' | 'ANNUAL' | string;
  planId?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  planName: string;
  billingCycle: string;
  tenantId: string;
}

export const useCheckoutSession = () => {
  return useMutation<CheckoutSessionResponse, Error, CheckoutSessionPayload>({
    mutationFn: async (payload: CheckoutSessionPayload) => {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: CheckoutSessionResponse;
      }>('/api/v1/saas/billing/checkout', payload);

      const checkoutData = response.data?.data || (response.data as unknown as CheckoutSessionResponse);
      return checkoutData;
    },
    onSuccess: (data) => {
      if (data?.checkoutUrl && typeof window !== 'undefined') {
        window.location.href = data.checkoutUrl;
      }
    },
  });
};
