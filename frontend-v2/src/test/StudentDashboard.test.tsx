import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StudentDashboard from '../pages/Portal/StudentDashboard';
import * as portalService from '../api/portalService';

vi.mock('../api/portalService', () => ({
  getPortalDashboard: vi.fn(),
  createFeeCheckoutOrder: vi.fn(),
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

describe('StudentDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student greeting, classes, GPA snapshot, and unpaid fee alert', async () => {
    vi.mocked(portalService.getPortalDashboard).mockResolvedValue({
      studentId: 100,
      studentName: 'Rohan Verma',
      enrollmentNumber: 'STU-2026-001',
      batchName: 'CSE 2026 Batch A',
      departmentName: 'Computer Science',
      cumulativeGpa: 3.85,
      totalUnpaidAmount: 25000.0,
      todayClasses: [
        {
          id: 1,
          courseCode: 'CS101',
          courseName: 'Data Structures and Algorithms',
          startTime: '09:00',
          endTime: '10:30',
          roomNumber: 'Lab 301',
          facultyName: 'Dr. Alan Turing',
          dayOfWeek: 'MONDAY',
        },
      ],
      unpaidInvoices: [
        {
          id: 501,
          invoiceNumber: 'INV-2026-0001',
          netAmount: 25000.0,
          outstandingBalance: 25000.0,
          status: 'UNPAID',
        },
      ],
    });

    render(<StudentDashboard />, { wrapper: createWrapper() });

    // Verify Greeting Banner
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Rohan Verma!/i)).toBeInTheDocument();
    });
    expect(screen.getByText('STU-2026-001')).toBeInTheDocument();
    expect(screen.getByText('CSE 2026 Batch A')).toBeInTheDocument();

    // Verify Academic Snapshot
    expect(screen.getByText('3.85')).toBeInTheDocument();
    expect(screen.getByText(/4.00 CGPA/i)).toBeInTheDocument();

    // Verify Action Required fee alert
    expect(screen.getByText(/Action Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Pay Outstanding Now/i)).toBeInTheDocument();

    // Verify Today's Classes
    expect(screen.getByText('Data Structures and Algorithms')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
    expect(screen.getByText(/Room Lab 301/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Alan Turing/i)).toBeInTheDocument();
  });
});
