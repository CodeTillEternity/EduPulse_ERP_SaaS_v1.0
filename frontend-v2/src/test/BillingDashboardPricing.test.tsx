import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('BillingDashboard Pricing Cards & Upgrade UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('renders all pricing tiers with proper features and prices', () => {
    render(<BillingDashboard />);

    expect(screen.getByText('Pro Institutional Plan')).toBeInTheDocument();
    expect(screen.getByText('$499')).toBeInTheDocument();
    expect(screen.getByText('Starter Institution')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Dedicated')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upgrade Now/i })).toBeInTheDocument();
  });

  it('handleUpgrade makes POST request to checkout and redirects window.location.href', async () => {
    const mockCheckoutUrl = 'https://checkout.stripe.com/c/pay/cs_test_mock_session_123';
    (axiosClient.post as any).mockResolvedValue({
      data: { checkoutUrl: mockCheckoutUrl },
    });

    render(<BillingDashboard />);

    const upgradeBtn = screen.getByRole('button', { name: /Upgrade Now/i });
    fireEvent.click(upgradeBtn);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/billing/checkout', {
        priceId: 'price_pro_institutional_499',
      });
      expect(window.location.href).toBe(mockCheckoutUrl);
    });
  });
});
