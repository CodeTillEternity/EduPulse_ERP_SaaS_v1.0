import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TenantBillingSettings from '../pages/TenantBillingSettings';
import { axiosClient } from '../api/axiosClient';
import toast from 'react-hot-toast';

vi.mock('../api/axiosClient', () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'user-admin',
      username: 'principal@oxford.edu',
      role: 'SUPER_ADMIN',
      tenantId: 'tenant-oxford',
    },
    isAuthenticated: true,
  }),
}));

describe('TenantBillingSettings View & Stripe Upgrade Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders institutional subscription status, trial countdown and upcoming invoice date', async () => {
    const mockSubscription = {
      tenantId: 'tenant-oxford',
      institutionName: 'Oxford Preparatory School',
      subscriptionTier: 'TRIAL',
      accountStatus: 'TRIAL',
      trialDaysRemaining: 9,
      trialEndDate: '2026-11-19T10:00:00Z',
      upcomingInvoiceDate: '2026-11-19T10:00:00Z',
    };

    (axiosClient.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockSubscription,
      },
    });

    render(
      <BrowserRouter>
        <TenantBillingSettings />
      </BrowserRouter>
    );

    expect(screen.getByText(/Subscription & Billing Settings/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('TRIAL PLAN')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getAllByText(/Days Remaining/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Oxford Preparatory School/i)).toBeInTheDocument();
    });
  });

  it('initiates Razorpay Subscription checkout when upgrading to PRO plan', async () => {
    (axiosClient.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          tenantId: 'tenant-oxford',
          institutionName: 'Oxford Preparatory School',
          subscriptionTier: 'TRIAL',
          trialDaysRemaining: 7,
        },
      },
    });

    (axiosClient.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          subscriptionId: 'sub_test_mock_pro_123',
          keyId: 'rzp_test_1234567890',
          tier: 'PRO',
        },
      },
    });

    render(
      <BrowserRouter>
        <TenantBillingSettings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Commercial Pro')).toBeInTheDocument();
    });

    const proButton = screen.getByRole('button', { name: /Upgrade to Pro via Razorpay/i });
    fireEvent.click(proButton);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/saas/billing/razorpay-subscription',
        expect.objectContaining({
          tier: 'PRO',
        })
      );
    });
  });

  it('initiates Razorpay Subscription checkout when upgrading to ENTERPRISE plan', async () => {
    (axiosClient.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          tenantId: 'tenant-oxford',
          institutionName: 'Oxford Preparatory School',
          subscriptionTier: 'TRIAL',
          trialDaysRemaining: 7,
        },
      },
    });

    (axiosClient.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          subscriptionId: 'sub_test_mock_ent_999',
          keyId: 'rzp_test_1234567890',
          tier: 'ENTERPRISE',
        },
      },
    });

    render(
      <BrowserRouter>
        <TenantBillingSettings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise High-Sec')).toBeInTheDocument();
    });

    const enterpriseButton = screen.getByRole('button', { name: /Upgrade to Enterprise via Razorpay/i });
    fireEvent.click(enterpriseButton);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/saas/billing/razorpay-subscription',
        expect.objectContaining({
          tier: 'ENTERPRISE',
        })
      );
    });
  });

  it('triggers enterprise watermark removal test endpoint', async () => {
    (axiosClient.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          tenantId: 'tenant-oxford',
          institutionName: 'Oxford Preparatory School',
          subscriptionTier: 'TRIAL',
          trialDaysRemaining: 7,
        },
      },
    });

    (axiosClient.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: { watermarkRemoved: true },
      },
    });

    render(
      <BrowserRouter>
        <TenantBillingSettings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Enterprise Watermark Removal/i)).toBeInTheDocument();
    });

    const testBtn = screen.getByRole('button', { name: /Test Enterprise Watermark Removal/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/finance/documents/watermark/remove');
    });
  });
});
