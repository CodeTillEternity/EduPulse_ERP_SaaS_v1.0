import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeeCenter from '../pages/Portal/FeeCenter';
import * as portalService from '../api/portalService';

vi.mock('../api/portalService', () => ({
  getStudentInvoices: vi.fn(),
  createFeeCheckoutOrder: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('FeeCenter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invoice table and initiates Razorpay checkout on Pay Now click', async () => {
    const mockInvoices = [
      {
        id: 501,
        invoiceNumber: 'INV-2026-0001',
        feeStructureName: 'Tuition Fee 2026',
        dueDate: '2026-11-15',
        netAmount: 25000.0,
        amountPaid: 0.0,
        outstandingBalance: 25000.0,
        status: 'UNPAID',
      },
      {
        id: 502,
        invoiceNumber: 'INV-2026-0002',
        feeStructureName: 'Library Fee',
        dueDate: '2026-10-15',
        netAmount: 2000.0,
        amountPaid: 2000.0,
        outstandingBalance: 0.0,
        status: 'PAID',
      },
    ];

    vi.mocked(portalService.getStudentInvoices).mockResolvedValue(mockInvoices);
    vi.mocked(portalService.createFeeCheckoutOrder).mockResolvedValue({
      orderId: 'order_test_99999',
      amount: 2500000,
      currency: 'INR',
      keyId: 'rzp_test_key_123',
      invoiceId: 501,
      invoiceNumber: 'INV-2026-0001',
      studentName: 'Rohan Verma',
      studentEmail: 'rohan@edupulse.edu',
    });

    render(<FeeCenter />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('INV-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-0002')).toBeInTheDocument();
    });

    // Check status tags
    expect(screen.getByText('Unpaid')).toBeInTheDocument();
    expect(screen.getByText('Settled')).toBeInTheDocument();

    // Find and click Pay Now button for the unpaid invoice
    const payNowBtn = screen.getByRole('button', { name: /Pay Now/i });
    expect(payNowBtn).toBeInTheDocument();
    fireEvent.click(payNowBtn);

    await waitFor(() => {
      expect(portalService.createFeeCheckoutOrder).toHaveBeenCalledWith(501);
    });
  });
});
