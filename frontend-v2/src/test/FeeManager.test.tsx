import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeeManager from '../pages/Finance/FeeManager';
import * as financeService from '../api/financeService';

vi.mock('../api/financeService', () => ({
  getFeeHeads: vi.fn(),
  createFeeHead: vi.fn(),
  getFeeStructures: vi.fn(),
  createFeeStructure: vi.fn(),
  getFeeStructuresByBatch: vi.fn(),
  generateInvoicesForBatch: vi.fn(),
  recordPayment: vi.fn(),
  getStudentLedger: vi.fn(),
  getInvoicesByStudent: vi.fn(),
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

describe('FeeManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(financeService.getFeeHeads).mockResolvedValue([
      { id: 1, name: 'Tuition Fee', description: 'Tuition charges', active: true },
      { id: 2, name: 'Lab Fee', description: 'Lab charges', active: true },
    ]);

    vi.mocked(financeService.getFeeStructures).mockResolvedValue([
      {
        id: 10,
        name: 'B.Tech CS 2026 Annual Blueprint',
        batchId: 1,
        batchName: 'Batch 1 (CS 2026-A)',
        totalAmount: 55000,
        items: [
          { id: 1, feeHeadId: 1, feeHeadName: 'Tuition Fee', amount: 45000 },
          { id: 2, feeHeadId: 2, feeHeadName: 'Lab Fee', amount: 10000 },
        ],
      },
    ]);
  });

  it('renders fee structure blueprint cards and fee heads tab', async () => {
    render(<FeeManager />, { wrapper: createWrapper() });

    expect(screen.getByText('Fee Management & Invoicing')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('B.Tech CS 2026 Annual Blueprint')).toBeInTheDocument();
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument();
      expect(screen.getByText('Lab Fee')).toBeInTheDocument();
    });

    // Switch to Fee Heads tab
    const headsTabBtn = screen.getByRole('button', { name: /Fee Heads/i });
    fireEvent.click(headsTabBtn);

    expect(screen.getByText('Configured Fee Heads')).toBeInTheDocument();
  });

  it('opens New Fee Head modal and submits new category', async () => {
    vi.mocked(financeService.createFeeHead).mockResolvedValue({
      id: 3,
      name: 'Hostel Fee',
      description: 'Accommodation',
      active: true,
    });

    render(<FeeManager />, { wrapper: createWrapper() });

    const openHeadBtn = screen.getByRole('button', { name: /New Fee Head/i });
    fireEvent.click(openHeadBtn);

    expect(screen.getByText('Define New Fee Head')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. Tuition Fee, Hostel Fee');
    fireEvent.change(nameInput, { target: { value: 'Hostel Fee' } });

    const saveBtn = screen.getByRole('button', { name: /Save Fee Head/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(financeService.createFeeHead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Hostel Fee',
        })
      );
    });
  });

  it('triggers Generate Invoices for Batch mutation from modal', async () => {
    vi.mocked(financeService.generateInvoicesForBatch).mockResolvedValue([
      { id: 101, invoiceNumber: 'INV-2026-001' },
      { id: 102, invoiceNumber: 'INV-2026-002' },
    ]);

    render(<FeeManager />, { wrapper: createWrapper() });

    // Wait for fee structures to load
    await waitFor(() => {
      expect(screen.getByText('B.Tech CS 2026 Annual Blueprint')).toBeInTheDocument();
    });

    const openGenBtn = screen.getByRole('button', { name: /^Generate Invoices$/i });
    fireEvent.click(openGenBtn);

    expect(screen.getByRole('heading', { name: /Generate Invoices for Batch/i })).toBeInTheDocument();

    const structureSelect = screen.getByLabelText(/Select Fee Structure Blueprint/i);
    fireEvent.change(structureSelect, { target: { value: '10' } });

    const submitBtn = screen.getByRole('button', { name: /Generate Invoices Now/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(financeService.generateInvoicesForBatch).toHaveBeenCalledWith(
        expect.objectContaining({
          feeStructureId: 10,
          batchId: 1,
        })
      );
    });
  });
});
