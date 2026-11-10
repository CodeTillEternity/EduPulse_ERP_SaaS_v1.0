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
    databaseMode: 'SHARED',
    databaseRoutingKey: 'SHARED_DEFAULT',
    createdAt: new Date().toISOString(),
  },
  {
    tenantId: 'tenant-oxford',
    institutionName: 'Oxford University',
    subdomain: 'oxford',
    subscriptionTier: 'ENTERPRISE',
    accountStatus: 'ACTIVE',
    trialEndDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    adminEmail: 'chancellor@oxford.edu',
    databaseMode: 'DEDICATED',
    databaseRoutingKey: 'dedicated-vip-1',
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
    databaseMode: 'SHARED',
    databaseRoutingKey: 'SHARED_DEFAULT',
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
    databaseMode: 'SHARED',
    databaseRoutingKey: 'SHARED_DEFAULT',
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
      expect(screen.getByText('Oxford University')).toBeInTheDocument();
      expect(screen.getByText('Delhi Public School')).toBeInTheDocument();
      expect(screen.getByText('Rogue Academy')).toBeInTheDocument();
    });

    // Check account status badges
    expect(screen.getAllByText('ACTIVE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TRIAL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SUSPENDED').length).toBeGreaterThan(0);
  });

  it('renders the Infrastructure column with Shared Pool and Dedicated DB badges', async () => {
    renderWithClient(<SaaSTenantDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
      // Check for Dedicated DB badge for Oxford
      expect(screen.getByText('Dedicated DB')).toBeInTheDocument();
      // Check for Shared Pool badges for standard tenants
      expect(screen.getAllByText('Shared Pool').length).toBeGreaterThan(0);
    });
  });

  it('shows Migrate to Dedicated Infrastructure action button for Enterprise tenant on shared pool', async () => {
    renderWithClient(<SaaSTenantDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Stanford University')).toBeInTheDocument();
    });

    const migrateButtons = screen.getAllByRole('button', { name: /Migrate to Dedicated Infrastructure/i });
    expect(migrateButtons.length).toBe(1); // Stanford only (Oxford is already dedicated, DPS is trial)
  });

  it('opens migration confirmation modal and executes migration with loading skeleton', async () => {
    let resolveMigrationPromise: any;
    const migrationPromise = new Promise((resolve) => {
      resolveMigrationPromise = resolve;
    });

    (apiClient.post as any).mockImplementation((url: string) => {
      if (url.includes('/migrate')) {
        return migrationPromise;
      }
      return Promise.resolve({ data: { success: true } });
    });

    renderWithClient(<SaaSTenantDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Stanford University')).toBeInTheDocument();
    });

    // Click Migrate button for Stanford University
    const migrateBtn = screen.getByRole('button', { name: /Migrate to Dedicated Infrastructure/i });
    fireEvent.click(migrateBtn);

    // Verify modal header and content
    expect(screen.getByRole('heading', { name: /Migrate to Dedicated Infrastructure/i })).toBeInTheDocument();
    expect(screen.getByText('Automated 5-Step Pipeline Notice:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('dedicated-vip-1')).toBeInTheDocument();

    // Confirm migration
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Execute Migration/i });
    fireEvent.click(confirmBtn);

    // Check endpoint called
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/saas/admin/tenants/tenant-stanford/migrate',
        { targetRoutingKey: 'dedicated-vip-1' }
      );
    });

    // Verify loading skeleton appears while pending
    expect(screen.getByTestId('migration-loading-skeleton')).toBeInTheDocument();
    expect(screen.getByText(/Automated Migration In Progress/i)).toBeInTheDocument();

    // Resolve migration
    resolveMigrationPromise({
      data: {
        success: true,
        data: {
          tenantId: 'tenant-stanford',
          databaseRoutingKey: 'dedicated-vip-1',
          databaseMode: 'DEDICATED',
        },
      },
    });

    // Modal closes upon completion
    await waitFor(() => {
      expect(screen.queryByTestId('migration-loading-skeleton')).not.toBeInTheDocument();
    });
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

    // Click to suspend the first active institution
    fireEvent.click(suspendButtons[0]);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalled();
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
