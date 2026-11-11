import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OnboardingFlow from '../pages/OnboardingFlow';
import { apiClient } from '../config/api';

vi.mock('../config/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('OnboardingFlow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Step 1: Institution Details with input fields and subdomain preview', () => {
    render(<OnboardingFlow />, { wrapper: createWrapper() });

    expect(screen.getByText(/Launch Your Institutional ERP/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Institution Details/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Cambridge Academy of Sciences/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to Admin User Setup/i })).toBeInTheDocument();
  });

  it('validates Step 1 and advances to Step 2 upon entering valid institution name', async () => {
    render(<OnboardingFlow />, { wrapper: createWrapper() });

    const instInput = screen.getByPlaceholderText(/e.g. Cambridge Academy of Sciences/i);
    fireEvent.change(instInput, { target: { value: 'Oxford Science Academy' } });

    const nextBtn = screen.getByRole('button', { name: /Continue to Admin User Setup/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Administrator Credentials/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g. Dr. Arthur Pendelton/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/admin@cambridge.edu/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Launch 14-Day Institutional Trial/i })).toBeInTheDocument();
    });
  });

  it('submits onboarding form and triggers backend provisioning and auto-login', async () => {
    const mockProvisionRes = {
      data: {
        success: true,
        data: {
          tenantId: 'tenant-oxford-science-academy',
          status: 'TRIAL_ACTIVE',
          trialEndDate: '2026-11-25T00:00:00',
        },
      },
    };

    const mockLoginRes = {
      data: {
        accessToken: 'mock_jwt_access_token_123',
        refreshToken: 'mock_refresh_token_456',
        username: 'provost@oxford.edu',
        role: 'SUPER_ADMIN',
        permissions: ['ALL_PERMISSIONS'],
      },
    };

    (apiClient.post as any).mockImplementation((url: string) => {
      if (url.includes('onboard') || url.includes('register')) {
        return Promise.resolve(mockProvisionRes);
      }
      if (url.includes('login')) {
        return Promise.resolve(mockLoginRes);
      }
      return Promise.resolve({ data: {} });
    });

    render(<OnboardingFlow />, { wrapper: createWrapper() });

    // Step 1
    fireEvent.change(screen.getByPlaceholderText(/e.g. Cambridge Academy of Sciences/i), {
      target: { value: 'Oxford Science Academy' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Admin User Setup/i }));

    // Step 2
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/e.g. Dr. Arthur Pendelton/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/e.g. Dr. Arthur Pendelton/i), {
      target: { value: 'Dr. Arthur Pendelton' },
    });
    fireEvent.change(screen.getByPlaceholderText(/admin@cambridge.edu/i), {
      target: { value: 'provost@oxford.edu' },
    });

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'SecretPass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'SecretPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Launch 14-Day Institutional Trial/i }));

    // Step 3
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringMatching(/onboard|register/),
        expect.objectContaining({
          institutionName: 'Oxford Science Academy',
          adminEmail: 'provost@oxford.edu',
          adminName: 'Dr. Arthur Pendelton',
        })
      );
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          username: 'provost@oxford.edu',
          password: 'SecretPass123!',
          role: 'SUPER_ADMIN',
        })
      );
    });
  });
});
