import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StudentLedger from '../pages/Finance/StudentLedger';
import * as financeService from '../api/financeService';

vi.mock('../api/financeService', () => ({
  getStudentLedger: vi.fn(),
  recordPayment: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('StudentLedger Component', () => {
  const mockLedgerData = {
    studentId: 101,
    studentName: 'Ada Lovelace',
    enrollmentNumber: 'ENR-2026-001',
    email: 'ada@university.edu',
    batchName: 'Batch 1 (CS 2026-A)',
    totalInvoiced: 50000,
    totalPaid: 20000,
    totalOutstanding: 30000,
    invoices: [
      {
        id: 501,
        invoiceNumber: 'INV-2026-001',
        feeStructureName: 'Annual Tech 2026',
        grossAmount: 50000,
        discount: 0,
        netAmount: 50000,
        amountPaid: 20000,
        outstandingBalance: 30000,
        dueDate: '2026-12-08',
        status: 'PARTIAL',
      },
    ],
    payments: [
      {
        id: 1001,
        invoiceNumber: 'INV-2026-001',
        amount: 20000,
        paymentMethod: 'UPI',
        referenceNumber: 'UPI-REF-001',
        paymentDate: '2026-11-08T10:00:00',
        notes: 'First installment',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeService.getStudentLedger).mockResolvedValue(mockLedgerData);
  });

  it('renders student ledger KPIs, invoice records, and switches to payment history', async () => {
    render(<StudentLedger />, { wrapper: createWrapper() });

    expect(screen.getByText('Student Fee Ledger')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('ENR-2026-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
      expect(screen.getByText('PARTIAL')).toBeInTheDocument();
    });

    // Switch to Payment History tab
    const paymentsTab = screen.getByRole('button', { name: /Payment History/i });
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(screen.getByText('UPI-REF-001')).toBeInTheDocument();
      expect(screen.getByText('UPI')).toBeInTheDocument();
    });
  });

  it('opens Collect Payment modal and submits payment transaction', async () => {
    vi.mocked(financeService.recordPayment).mockResolvedValue({
      id: 1002,
      invoiceId: 501,
      invoiceNumber: 'INV-2026-001',
      amount: 15000,
      paymentMethod: 'CASH',
      referenceNumber: 'RCP-1002',
      paymentDate: '2026-11-08T12:00:00',
      remainingInvoiceBalance: 15000,
      invoiceStatus: 'PARTIAL',
    });

    render(<StudentLedger />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
    });

    // Click Collect Payment button in table
    const collectBtn = screen.getByRole('button', { name: /Collect Payment/i });
    fireEvent.click(collectBtn);

    expect(screen.getByText('Collect Fee Payment')).toBeInTheDocument();
    expect(screen.getByText(/Invoice: INV-2026-001/i)).toBeInTheDocument();

    // Change amount to 15000
    const amountInput = screen.getByLabelText(/Payment Collection Amount/i);
    fireEvent.change(amountInput, { target: { value: '15000' } });

    // Change payment method to CASH
    const methodSelect = screen.getByLabelText(/Payment Method/i);
    fireEvent.change(methodSelect, { target: { value: 'CASH' } });

    // Submit payment
    const processBtn = screen.getByRole('button', { name: /Process Payment/i });
    fireEvent.click(processBtn);

    await waitFor(() => {
      expect(financeService.recordPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId: 501,
          amount: 15000,
          paymentMethod: 'CASH',
        })
      );
    });
  });

  it('searches for different student enrollment number', async () => {
    render(<StudentLedger />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/Search Enrollment/i);
    fireEvent.change(searchInput, { target: { value: 'ENR-2026-002' } });

    const searchBtn = screen.getByRole('button', { name: /Search Ledger/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(financeService.getStudentLedger).toHaveBeenCalledWith('ENR-2026-002');
    });
  });
});
