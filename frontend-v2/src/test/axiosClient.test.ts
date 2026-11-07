import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosClient from '../api/axiosClient.js';

describe('axiosClient interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('injects Authorization Bearer and X-Tenant-ID headers from localStorage', async () => {
    localStorage.setItem('token', 'mock_jwt_token_123');
    localStorage.setItem('tenantId', 'tenant-stanford');

    const config = {
      headers: {} as Record<string, string>,
    };

    // Trigger the request interceptor directly
    // @ts-expect-error interceptor handlers access
    const interceptor = axiosClient.interceptors.request.handlers[0];
    const updatedConfig = await interceptor.fulfilled(config);

    expect(updatedConfig.headers.Authorization).toBe('Bearer mock_jwt_token_123');
    expect(updatedConfig.headers['X-Tenant-ID']).toBe('tenant-stanford');
  });

  it('extracts token and tenantId from auth-storage if individual keys are missing', async () => {
    const authStorage = JSON.stringify({
      state: {
        token: 'mock_stored_token',
        tenantId: 'tenant-oxford',
      },
    });
    localStorage.setItem('auth-storage', authStorage);

    const config = {
      headers: {} as Record<string, string>,
    };

    // @ts-expect-error interceptor handlers access
    const interceptor = axiosClient.interceptors.request.handlers[0];
    const updatedConfig = await interceptor.fulfilled(config);

    expect(updatedConfig.headers.Authorization).toBe('Bearer mock_stored_token');
    expect(updatedConfig.headers['X-Tenant-ID']).toBe('tenant-oxford');
  });

  it('leaves headers unchanged if no credentials exist in storage', async () => {
    const config = {
      headers: {} as Record<string, string>,
    };

    // @ts-expect-error interceptor handlers access
    const interceptor = axiosClient.interceptors.request.handlers[0];
    const updatedConfig = await interceptor.fulfilled(config);

    expect(updatedConfig.headers.Authorization).toBeUndefined();
    expect(updatedConfig.headers['X-Tenant-ID']).toBeUndefined();
  });
});
