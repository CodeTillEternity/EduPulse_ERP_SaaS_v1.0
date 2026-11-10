import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import SaaSTenantDashboard from '../pages/SaaSTenantDashboard';
import { apiClient } from '../config/api';

vi.mock('../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

const mockTenants = [
  {
    tenantId: 'tenant-stanford',
    institutionName: 'Stanford University',
    subdomain: 'stanford',
    subscriptionTier: 'ENTERPRISE',
    accountStatus: 'ACTIVE',
    trialEndDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    adminEmail: 'provost@stanford.edu',
    createdAt: new Date().toISOString(),
  },
  {
    tenantId: 'tenant-dps',
    institutionName: 'Delhi Public School',
    subdomain: 'dps',
    subscriptionTier: 'TRIAL',
    accountStatus: 'TRIAL',
    trialEndDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    adminEmail: 'principal@dps.edu',
    createdAt: new Date().toISOString(),
  },
  {
    tenantId: 'tenant-rogue',
    institutionName: 'Rogue Academy',
    subdomain: 'rogue',
    subscriptionTier: 'TRIAL',
    accountStatus: 'SUSPENDED',
    trialEndDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    adminEmail: 'admin@rogue.edu',
    createdAt: new Date().toISOString(),
  },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('SaaS Super Admin Control Plane - SaaSTenantDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({
      data: { success: true, data: mockTenants },
    });
  });

  it('renders the central control plane and TanStack table with institutions and subdomains', async () => {
    renderWithClient(<SaaSTenantDashboard />);

    await waitFor(() => {
      expect(screen.getByText('SaaS Central Control Plane')).toBeInTheDocument();
      expect(screen.getByText('Stanford University')).toBeInTheDocument();
      expect(screen.getByText('Delhi Public School')).toBeInTheDocument();
      expect(screen.getByText('Rogue Academy')).toBeInTheDocument();
      expect(screen.getByText('stanford')).toBeInTheDocument();
      expect(screen.getByText('dps')).toBeInTheDocument();
      expect(screen.getByText('rogue')).toBeInTheDocument();
    });

    // Check account status badges
    expect(screen.getAllByText('ACTIVE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TRIAL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SUSPENDED').length).toBeGreaterThan(0);
  });

  it('allows founder to instantly toggle a tenant to SUSPENDED status', async () => {
    (apiClient.patch as any).mockResolvedValue({
      data: { success: true, message: 'Status updated' },
    });

    renderWithClient(<SaaSTenantDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Stanford University')).toBeInTheDocument();
    });

    const suspendButtons = screen.getAllByRole('button', { name: /Suspend Tenant/i });
    expect(suspendButtons.length).toBeGreaterThan(0);

    // Click to suspend the first active institution in alphabetical order (Delhi Public School)
    fireEvent.click(suspendButtons[0]);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/v1/saas/admin/tenants/tenant-dps/status',
        { accountStatus: 'SUSPENDED' }
      );
    });
  });

  it('allows founder to restore access for a SUSPENDED tenant', async () => {
    (apiClient.patch as any).mockResolvedValue({
      data: { success: true, message: 'Status updated' },
    });

    renderWithClient(<SaaSTenantDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Rogue Academy')).toBeInTheDocument();
    });

    const restoreButton = screen.getByRole('button', { name: /Restore Access/i });
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/v1/saas/admin/tenants/tenant-rogue/status',
        { accountStatus: 'ACTIVE' }
      );
    });
  });

  it('opens provisioning modal and creates a new institution', async () => {
    (apiClient.post as any).mockResolvedValue({
      data: { success: true, message: 'Provisioned' },
    });

    renderWithClient(<SaaSTenantDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Provision Institution')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Provision Institution'));

    expect(screen.getByText('Provision New Institution')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Stanford University or Delhi Public School/i), {
      target: { value: 'Oxford International' },
    });
    fireEvent.change(screen.getByPlaceholderText(/principal@school.edu/i), {
      target: { value: 'rector@oxford.edu' },
    });

    const submitBtn = screen.getByRole('button', { name: /Confirm Provisioning/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/saas/admin/tenants/provision', {
        name: 'Oxford International',
        email: 'rector@oxford.edu',
      });
    });
  });
});
