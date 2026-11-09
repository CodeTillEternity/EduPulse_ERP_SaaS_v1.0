import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import axiosClient, { getBaseURL } from '../api/axiosClient.js';

describe('axiosClient interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('injects Authorization Bearer and X-Tenant-ID headers from localStorage', async () => {
      localStorage.setItem('token', 'mock_jwt_token_123');
      localStorage.setItem('tenantId', 'tenant-stanford');

      const config = {
        headers: {} as Record<string, string>,
      };

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

  describe('Response Interceptor & Token Rotation', () => {
    it('passes successful responses through untouched', async () => {
      // @ts-expect-error interceptor handlers access
      const interceptor = axiosClient.interceptors.response.handlers[0];
      const mockResponse = { data: { success: true }, status: 200 };

      const result = await interceptor.fulfilled(mockResponse);
      expect(result).toBe(mockResponse);
    });

    it('passes non-401 errors through without attempting token refresh', async () => {
      // @ts-expect-error interceptor handlers access
      const interceptor = axiosClient.interceptors.response.handlers[0];
      const postSpy = vi.spyOn(axios, 'post');

      const error = {
        response: { status: 404, data: { message: 'Not Found' } },
        config: { url: '/api/v1/students/999' },
      };

      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('rejects immediately without refresh if error came from /auth/login or /api/auth/refresh', async () => {
      // @ts-expect-error interceptor handlers access
      const interceptor = axiosClient.interceptors.response.handlers[0];
      const postSpy = vi.spyOn(axios, 'post');

      const loginError = {
        response: { status: 401 },
        config: { url: '/auth/login' },
      };

      await expect(interceptor.rejected(loginError)).rejects.toEqual(loginError);

      const refreshError = {
        response: { status: 401 },
        config: { url: '/api/auth/refresh' },
      };

      await expect(interceptor.rejected(refreshError)).rejects.toEqual(refreshError);
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('rejects immediately without refresh if request was already retried', async () => {
      // @ts-expect-error interceptor handlers access
      const interceptor = axiosClient.interceptors.response.handlers[0];
      const postSpy = vi.spyOn(axios, 'post');

      const retriedError = {
        response: { status: 401 },
        config: { url: '/api/v1/courses', _retry: true },
      };

      await expect(interceptor.rejected(retriedError)).rejects.toEqual(retriedError);
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('silently refreshes token on 401, updates storage, and retries original request', async () => {
      // @ts-expect-error interceptor handlers access
      const interceptor = axiosClient.interceptors.response.handlers[0];

      const newAccessToken = 'new_refreshed_jwt_token_xyz';
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { accessToken: newAccessToken, tokenType: 'Bearer' },
      });

      // Mock replay call through axiosClient
      const retryResponse = { data: { success: true }, status: 200 };
      // @ts-expect-error mock callable axios instance
      const clientSpy = vi.spyOn(axiosClient, 'request').mockResolvedValueOnce(retryResponse);

      const originalConfig = {
        url: '/api/v1/finance/invoices',
        headers: { Authorization: 'Bearer expired_token' } as Record<string, string>,
      };

      const error = {
        response: { status: 401 },
        config: originalConfig,
      };

      // Set initial auth-storage
      localStorage.setItem('token', 'expired_token');
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token: 'expired_token', tenantId: 'tenant-1' } })
      );

      const result = await interceptor.rejected(error);

      // Verify POST /api/auth/refresh was called with credentials
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        {},
        expect.objectContaining({ withCredentials: true })
      );

      // Verify token in localStorage was updated
      expect(localStorage.getItem('token')).toBe(newAccessToken);
      const parsedStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      expect(parsedStorage.state?.token).toBe(newAccessToken);

      // Verify Authorization header was updated on original config
      expect(originalConfig.headers.Authorization).toBe(`Bearer ${newAccessToken}`);
      expect(result).toBeDefined();
    });

    it('clears storage and redirects on refresh failure', async () => {
      // @ts-expect-error interceptor handlers access
      const interceptor = axiosClient.interceptors.response.handlers[0];

      vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Refresh token invalid'));

      const originalConfig = {
        url: '/api/v1/finance/invoices',
        headers: {} as Record<string, string>,
      };

      const error = {
        response: { status: 401 },
        config: originalConfig,
      };

      localStorage.setItem('token', 'expired_token');
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token: 'expired_token', isAuthenticated: true } })
      );

      await expect(interceptor.rejected(error)).rejects.toThrow('Refresh token invalid');

      // Verify tokens were cleared
      expect(localStorage.getItem('token')).toBeNull();
      const parsedStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      expect(parsedStorage.state?.token).toBeNull();
      expect(parsedStorage.state?.isAuthenticated).toBe(false);
    });

    it('queues concurrent 401 requests and replays all upon single refresh resolution', async () => {
      // @ts-expect-error interceptor handlers access
      const interceptor = axiosClient.interceptors.response.handlers[0];

      const newAccessToken = 'concurrent_refreshed_token_456';
      let resolveRefresh: any;
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });

      const postSpy = vi.spyOn(axios, 'post').mockReturnValueOnce(refreshPromise as any);

      // Mock replay calls
      // @ts-expect-error mock callable axios instance
      const clientSpy = vi.spyOn(axiosClient, 'request').mockImplementation((cfg: any) =>
        Promise.resolve({ data: `success-${cfg.url}`, status: 200 })
      );

      const request1Config = {
        url: '/api/v1/operations/timetable',
        headers: { Authorization: 'Bearer old_token' } as Record<string, string>,
      };
      const request2Config = {
        url: '/api/v1/academic/courses',
        headers: { Authorization: 'Bearer old_token' } as Record<string, string>,
      };

      const error1 = { response: { status: 401 }, config: request1Config };
      const error2 = { response: { status: 401 }, config: request2Config };

      // Dispatch request 1 (triggers refresh)
      const p1 = interceptor.rejected(error1);
      // Dispatch request 2 immediately (should enter queue)
      const p2 = interceptor.rejected(error2);

      // Resolve refresh call
      resolveRefresh({ data: { accessToken: newAccessToken } });

      const [res1, res2] = await Promise.all([p1, p2]);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(request1Config.headers.Authorization).toBe(`Bearer ${newAccessToken}`);
      expect(request2Config.headers.Authorization).toBe(`Bearer ${newAccessToken}`);
      expect(res1.data).toBe('success-/api/v1/operations/timetable');
      expect(res2.data).toBe('success-/api/v1/academic/courses');
    });
  });

  describe('baseURL resolution', () => {
    it('resolves baseURL according to environment settings', () => {
      const resolvedUrl = getBaseURL();
      expect(typeof resolvedUrl).toBe('string');
      expect(resolvedUrl).toBeTruthy();
    });
  });
});
