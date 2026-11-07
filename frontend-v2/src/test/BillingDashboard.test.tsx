import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BillingDashboard from '../pages/BillingDashboard';
import { useAuthStore } from '../store/useAuthStore';

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

describe('BillingDashboard Component', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    useAuthStore.setState({
      tenantId: 'apex-global-tech',
      tenantStatus: 'TRIAL_ACTIVE',
      isAuthenticated: true,
    });
  });

  it('renders the pricing plans and current trial status', () => {
    render(<BillingDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/Billing & Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/apex-global-tech/i)).toBeInTheDocument();
    expect(screen.getByText(/14-Day Free Evaluation/i)).toBeInTheDocument();

    // Verify all 3 pricing tiers render
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();

    // Verify default monthly prices
    expect(screen.getByText('$99')).toBeInTheDocument();
    expect(screen.getByText('$299')).toBeInTheDocument();
    expect(screen.getByText('$999')).toBeInTheDocument();
  });

  it('switches to annual pricing when annual billing toggle is selected', () => {
    render(<BillingDashboard />, { wrapper: createWrapper() });

    const annualToggle = screen.getByRole('button', { name: /Annual Billing/i });
    fireEvent.click(annualToggle);

    expect(screen.getByText(/Billed annually \(\$990\/yr\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Billed annually \(\$2990\/yr\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Billed annually \(\$9990\/yr\)/i)).toBeInTheDocument();
  });

  it('triggers onSelectPlan callback with plan name and billing cycle when Upgrade is clicked', () => {
    const handleSelectPlan = vi.fn();
    render(<BillingDashboard onSelectPlan={handleSelectPlan} />, { wrapper: createWrapper() });

    const growthButton = screen.getByRole('button', { name: /Upgrade to Growth/i });
    fireEvent.click(growthButton);

    expect(handleSelectPlan).toHaveBeenCalledTimes(1);
    expect(handleSelectPlan).toHaveBeenCalledWith('Growth', 'MONTHLY');
  });

  it('displays Read-Only Grace banner state when tenant is in READ_ONLY_GRACE', () => {
    useAuthStore.setState({
      tenantStatus: 'READ_ONLY_GRACE',
    });

    render(<BillingDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/Read-Only Grace Period/i)).toBeInTheDocument();
    expect(screen.getByText(/0 Days \(Expired\)/i)).toBeInTheDocument();
  });
});
