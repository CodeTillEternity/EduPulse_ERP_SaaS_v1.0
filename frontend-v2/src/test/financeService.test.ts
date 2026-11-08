import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import {
  createFeeHead,
  getFeeHeads,
  createFeeStructure,
  getFeeStructures,
  getFeeStructuresByBatch,
  generateInvoicesForBatch,
  recordPayment,
  getStudentLedger,
  getInvoicesByStudent,
} from '../api/financeService';

vi.mock('../api/axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('financeService API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createFeeHead sends POST request to /api/v1/finance/heads', async () => {
    const payload = { name: 'Tuition Fee', description: 'Tuition charges', active: true };
    const mockResponse = { id: 1, ...payload };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await createFeeHead(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/finance/heads', payload);
    expect(result).toEqual(mockResponse);
  });

  it('getFeeHeads sends GET request to /api/v1/finance/heads', async () => {
    const mockList = [{ id: 1, name: 'Tuition Fee', active: true }];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockList });

    const result = await getFeeHeads();
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/finance/heads');
    expect(result).toEqual(mockList);
  });

  it('createFeeStructure sends POST request to /api/v1/finance/structures', async () => {
    const payload = {
      name: 'B.Tech CS 2026 Annual',
      batchId: 1,
      items: [{ feeHeadId: 1, amount: 50000 }],
    };
    const mockResponse = { id: 10, ...payload, totalAmount: 50000 };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await createFeeStructure(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/finance/structures', payload);
    expect(result).toEqual(mockResponse);
  });

  it('generateInvoicesForBatch sends POST request to /api/v1/finance/invoices/batch', async () => {
    const payload = { batchId: 1, feeStructureId: 10, dueDate: '2026-12-08', discount: 0 };
    const mockList = [{ id: 100, invoiceNumber: 'INV-2026-001', studentId: 1 }];
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockList });

    const result = await generateInvoicesForBatch(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/finance/invoices/batch', payload);
    expect(result).toEqual(mockList);
  });

  it('recordPayment sends POST request to /api/v1/finance/payments', async () => {
    const payload = { invoiceId: 100, amount: 25000, paymentMethod: 'UPI' };
    const mockReceipt = { id: 500, ...payload, invoiceStatus: 'PARTIAL' };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockReceipt });

    const result = await recordPayment(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/finance/payments', payload);
    expect(result).toEqual(mockReceipt);
  });

  it('getStudentLedger sends GET request to /api/v1/finance/ledger/student/:enrollmentNumber', async () => {
    const mockLedger = { studentId: 1, enrollmentNumber: 'ENR-001', totalInvoiced: 50000, totalPaid: 25000 };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockLedger });

    const result = await getStudentLedger('ENR-001');
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/finance/ledger/student/ENR-001');
    expect(result).toEqual(mockLedger);
  });
});
