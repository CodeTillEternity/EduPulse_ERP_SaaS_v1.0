import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeaveManager from '../pages/HR/LeaveManager';
import * as hrService from '../api/hrService';
import * as academicService from '../api/academicService';

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

vi.mock('../api/academicService', () => ({
  getFaculty: vi.fn(),
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

describe('LeaveManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(academicService.getFaculty).mockResolvedValue([
      { id: 1, firstName: 'Alan', lastName: 'Turing', employeeId: 'FAC-001', designation: 'Professor' },
      { id: 2, firstName: 'Ada', lastName: 'Lovelace', employeeId: 'FAC-002', designation: 'Associate Professor' },
    ]);

    vi.mocked(hrService.getAllLeaves).mockResolvedValue([
      {
        id: 10,
        facultyId: 1,
        facultyName: 'Alan Turing',
        employeeId: 'FAC-001',
        startDate: '2026-11-10',
        endDate: '2026-11-14',
        daysCount: 5,
        reason: 'Conference attendance',
        status: 'APPROVED',
      },
    ]);

    vi.mocked(hrService.getPendingLeaves).mockResolvedValue([
      {
        id: 20,
        facultyId: 2,
        facultyName: 'Ada Lovelace',
        employeeId: 'FAC-002',
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        daysCount: 3,
        reason: 'Medical appointment',
        status: 'PENDING',
        departmentName: 'Computer Science',
      },
    ]);
  });

  it('renders header, tabs, and initial leave history', async () => {
    render(<LeaveManager />, { wrapper: createWrapper() });

    expect(screen.getByText('Staff Leave Management')).toBeInTheDocument();
    expect(screen.getByText('My Leaves')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
      expect(screen.getByText('Conference attendance')).toBeInTheDocument();
    });
  });

  it('submits a new leave application in My Leaves tab', async () => {
    vi.mocked(hrService.applyForLeave).mockResolvedValue({
      id: 30,
      facultyId: 1,
      facultyName: 'Alan Turing',
      startDate: '2026-12-01',
      endDate: '2026-12-03',
      daysCount: 3,
      reason: 'Winter break research',
      status: 'PENDING',
    });

    render(<LeaveManager />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('-- Select Faculty --')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Faculty Member'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-12-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-12-03' } });
    fireEvent.change(screen.getByPlaceholderText(/Medical leave, personal matters/i), {
      target: { value: 'Winter break research' },
    });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(hrService.applyForLeave).toHaveBeenCalledWith({
        facultyId: 1,
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        reason: 'Winter break research',
      });
    });
  });

  it('switches to Pending Approvals and triggers Approve action', async () => {
    vi.mocked(hrService.reviewLeave).mockResolvedValue({
      id: 20,
      facultyId: 2,
      facultyName: 'Ada Lovelace',
      status: 'APPROVED',
    });

    render(<LeaveManager />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Pending Approvals'));

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('Medical appointment')).toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(hrService.reviewLeave).toHaveBeenCalledWith(20, {
        status: 'APPROVED',
        reviewNotes: 'Approved by HR Manager',
        reviewedBy: 'HR Manager',
      });
    });
  });
});
