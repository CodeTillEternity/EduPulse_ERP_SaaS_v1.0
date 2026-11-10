import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import * as useTenantThemeModule from '../hooks/useTenantTheme';
import { apiClient } from '../config/api';

vi.mock('../config/api', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('Dual-Factor Account Recovery UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useTenantThemeModule, 'useTenantTheme').mockReturnValue({
      subdomain: 'stanford',
      branding: {
        tenantId: 'tenant-stanford',
        institutionName: 'Stanford University',
        customSubdomain: 'stanford',
        logoUrl: 'https://cdn.stanford.edu/logo.png',
        faviconUrl: 'https://cdn.stanford.edu/favicon.ico',
        primaryColorHex: '#8C1515',
        secondaryColorHex: '#B1040E',
      },
      loading: false,
      error: null,
    });
  });

  describe('ForgotPassword Component', () => {
    it('renders branding and dual-factor form inputs', () => {
      render(
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      );

      expect(screen.getByText('Stanford University')).toBeInTheDocument();
      expect(screen.getByText('Dual-Factor Identity Recovery')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/student@institution.edu/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ENR-2026-001/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Recovery Link/i })).toBeInTheDocument();
    });

    it('submits dual-factor credentials and displays anti-enumeration success screen', async () => {
      (apiClient.post as any).mockResolvedValueOnce({
        data: { message: 'Recovery instructions sent.' },
      });

      render(
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/student@institution.edu/i), {
        target: { value: 'student@stanford.edu' },
      });
      fireEvent.change(screen.getByPlaceholderText(/ENR-2026-001/i), {
        target: { value: 'ENR-2026-001' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Send Recovery Link/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
          email: 'student@stanford.edu',
          institutionalId: 'ENR-2026-001',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
        expect(screen.getByText('Security Guarantee')).toBeInTheDocument();
      });
    });

    it('displays generic anti-enumeration success even if API call fails/errors', async () => {
      (apiClient.post as any).mockRejectedValueOnce(new Error('Network error or not found'));

      render(
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/student@institution.edu/i), {
        target: { value: 'nonexistent@stanford.edu' },
      });
      fireEvent.change(screen.getByPlaceholderText(/ENR-2026-001/i), {
        target: { value: 'FAKE-ID' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Send Recovery Link/i }));

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });
  });

  describe('ResetPassword Component', () => {
    it('shows missing token warning when no token param exists in URL', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <ResetPassword />
        </MemoryRouter>
      );

      expect(screen.getByText('Missing Reset Token')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Request New Recovery Link/i })).toBeInTheDocument();
    });

    it('renders password input form when token param is present', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password?token=a8e2fd40-96ef-466a-939e-436154564883']}>
          <ResetPassword />
        </MemoryRouter>
      );

      expect(screen.getByText('Create New Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Minimum 8 characters/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Re-type your new password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update Password/i })).toBeInTheDocument();
    });

    it('submits new password with token and shows success confirmation screen', async () => {
      (apiClient.post as any).mockResolvedValueOnce({
        data: { message: 'Password reset successfully.' },
      });

      render(
        <MemoryRouter initialEntries={['/reset-password?token=a8e2fd40-96ef-466a-939e-436154564883']}>
          <ResetPassword />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/Minimum 8 characters/i), {
        target: { value: 'SecureP@ssw0rd123' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Re-type your new password/i), {
        target: { value: 'SecureP@ssw0rd123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/reset-password', {
          token: 'a8e2fd40-96ef-466a-939e-436154564883',
          newPassword: 'SecureP@ssw0rd123',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Password Reset Complete')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In with New Password/i })).toBeInTheDocument();
      });
    });
  });
});

