import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PayrollDashboard from '../pages/HR/PayrollDashboard';
import * as hrService from '../api/hrService';

vi.mock('../api/hrService', () => ({
  applyForLeave: vi.fn(),
  reviewLeave: vi.fn(),
  getPendingLeaves: vi.fn(),
  getAllLeaves: vi.fn(),
  getFacultyLeaves: vi.fn(),
  generateMonthlyPayroll: vi.fn(),
  getMonthlyPayroll: vi.fn(),
  markPayrollAsPaid: vi.fn(),
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

describe('PayrollDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hrService.getMonthlyPayroll).mockResolvedValue([
      {
        id: 101,
        facultyId: 1,
        facultyName: 'Alan Turing',
        employeeId: 'FAC-001',
        departmentName: 'Computer Science',
        month: 11,
        year: 2026,
        baseSalary: 60000,
        deductions: 4000,
        netSalary: 56000,
        status: 'GENERATED',
      },
      {
        id: 102,
        facultyId: 2,
        facultyName: 'Ada Lovelace',
        employeeId: 'FAC-002',
        departmentName: 'Mathematics',
        month: 11,
        year: 2026,
        baseSalary: 65000,
        deductions: 0,
        netSalary: 65000,
        status: 'PAID',
        paymentDate: '2026-11-28',
      },
    ]);
  });

  it('renders header, month/year selector, and payroll summary cards', async () => {
    render(<PayrollDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Monthly Payroll Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Payroll Batch/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Payroll Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Payroll Year')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
  });

  it('triggers generateMonthlyPayroll when Generate Payroll Batch is clicked', async () => {
    vi.mocked(hrService.generateMonthlyPayroll).mockResolvedValue([
      {
        id: 101,
        facultyId: 1,
        facultyName: 'Alan Turing',
        month: 11,
        year: 2026,
        baseSalary: 60000,
        deductions: 4000,
        netSalary: 56000,
        status: 'GENERATED',
      },
    ]);

    render(<PayrollDashboard />, { wrapper: createWrapper() });

    const generateBtn = screen.getByRole('button', { name: /Generate Payroll Batch/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(hrService.generateMonthlyPayroll).toHaveBeenCalledWith({
        month: 11,
        year: 2026,
        defaultBaseSalary: 50000.0,
      });
    });
  });

  it('triggers markPayrollAsPaid when Mark as Paid button is clicked', async () => {
    vi.mocked(hrService.markPayrollAsPaid).mockResolvedValue({
      id: 101,
      facultyId: 1,
      facultyName: 'Alan Turing',
      month: 11,
      year: 2026,
      netSalary: 56000,
      status: 'PAID',
      paymentDate: '2026-11-30',
    });

    render(<PayrollDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    });

    const markPaidBtn = screen.getByRole('button', { name: /Mark as Paid/i });
    fireEvent.click(markPaidBtn);

    await waitFor(() => {
      expect(hrService.markPayrollAsPaid).toHaveBeenCalledWith(101);
    });
  });

  it('filters table rows based on search input', async () => {
    render(<PayrollDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search faculty name or ID/i);
    fireEvent.change(searchInput, { target: { value: 'Alan' } });

    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });
});
