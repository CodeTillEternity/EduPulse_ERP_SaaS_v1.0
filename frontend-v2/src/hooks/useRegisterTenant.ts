import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

export interface TenantRegistrationPayload {
  institutionName: string;
  adminEmail: string;
  adminName: string;
  adminPassword?: string;
}

export interface TenantRegistrationResponse {
  tenantId: string;
  status: string;
  trialEndDate: string;
  institutionName: string;
  adminEmail: string;
  message: string;
}

export const useRegisterTenant = () => {
  const queryClient = useQueryClient();

  return useMutation<TenantRegistrationResponse, Error, TenantRegistrationPayload>({
    mutationFn: async (payload: TenantRegistrationPayload) => {
      const response = await apiClient.post<TenantRegistrationResponse>('/api/v1/saas/register', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};
