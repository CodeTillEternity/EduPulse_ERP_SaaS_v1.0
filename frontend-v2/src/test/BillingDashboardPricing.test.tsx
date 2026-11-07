import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BillingDashboard from '../pages/Billing/BillingDashboard.jsx';
import axiosClient from '../api/axiosClient.js';

vi.mock('../api/axiosClient.js', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BillingDashboard Pricing Cards & Razorpay Modal Checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all pricing tiers with proper features and prices', () => {
    render(
      <BrowserRouter>
        <BillingDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Pro Institutional Plan')).toBeInTheDocument();
    expect(screen.getByText('$499')).toBeInTheDocument();
    expect(screen.getByText('Starter Institution')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Dedicated')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upgrade Now/i })).toBeInTheDocument();
    expect(screen.getByText(/RBI & PCI-DSS Compliant/i)).toBeInTheDocument();
  });

  it('handleUpgrade makes POST request to /api/v1/billing/razorpay-subscription and opens Razorpay modal', async () => {
    const mockOpen = vi.fn();
    (window as any).Razorpay = vi.fn().mockImplementation(function (this: any) {
      this.open = mockOpen;
      return this;
    });

    (axiosClient.post as any).mockResolvedValue({
      data: {
        subscriptionId: 'sub_rzp_mock_session_123',
        keyId: 'rzp_test_key_123',
      },
    });

    render(
      <BrowserRouter>
        <BillingDashboard />
      </BrowserRouter>
    );

    const upgradeBtn = screen.getByRole('button', { name: /Upgrade Now/i });
    fireEvent.click(upgradeBtn);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/billing/razorpay-subscription', {
        planId: 'plan_pro_institutional_499',
        priceId: 'plan_pro_institutional_499',
      });
      expect(window.Razorpay).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_id: 'sub_rzp_mock_session_123',
          name: 'EduPulse SaaS',
        })
      );
      expect(mockOpen).toHaveBeenCalled();
    });
  });
});
