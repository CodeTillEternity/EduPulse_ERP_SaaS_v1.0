import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AttendanceTracker from '../pages/Operations/AttendanceTracker';
import * as operationsService from '../api/operationsService';

vi.mock('../api/operationsService', () => ({
  getTimetableByBatch: vi.fn(),
  scheduleClass: vi.fn(),
  markAttendance: vi.fn(),
  getAttendanceByTimetableAndDate: vi.fn(),
  getStudentsForBatch: vi.fn(),
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AttendanceTracker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(operationsService.getTimetableByBatch).mockResolvedValue([
      {
        id: 10,
        courseOfferingId: 1,
        courseCode: 'CS101',
        courseName: 'Algorithms',
        facultyName: 'Dr. Turing',
        batchName: 'Batch 1 (CS 2026-A)',
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '10:30:00',
        roomNumber: 'LH-101',
        semester: 'Semester 1',
      },
    ]);

    vi.mocked(operationsService.getStudentsForBatch).mockResolvedValue([
      {
        id: 101,
        enrollmentNumber: 'ENR-101',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@university.edu',
      },
      {
        id: 102,
        enrollmentNumber: 'ENR-102',
        firstName: 'Charles',
        lastName: 'Babbage',
        email: 'charles@university.edu',
      },
    ]);

    vi.mocked(operationsService.getAttendanceByTimetableAndDate).mockResolvedValue([]);
  });

  it('renders student roster and attendance stats summary', async () => {
    render(<AttendanceTracker />, { wrapper: createWrapper() });

    expect(screen.getByText('Class Attendance Tracker')).toBeInTheDocument();
    expect(screen.getByText('Total Roster')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('Charles Babbage')).toBeInTheDocument();
      expect(screen.getByText('ENR-101')).toBeInTheDocument();
      expect(screen.getByText('ENR-102')).toBeInTheDocument();
    });
  });

  it('marks attendance status and submits batch attendance payload', async () => {
    vi.mocked(operationsService.markAttendance).mockResolvedValue([
      { id: 1, studentId: 101, timetableEntryId: 10, date: '2026-11-08', status: 'PRESENT' },
      { id: 2, studentId: 102, timetableEntryId: 10, date: '2026-11-08', status: 'ABSENT' },
    ]);

    render(<AttendanceTracker />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });

    // Mark Charles Babbage as ABSENT
    // Each row has Present, Absent, Late, Excused buttons
    const absentButtons = screen.getAllByRole('button', { name: /^Absent$/i });
    expect(absentButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(absentButtons[1]); // Click Absent for 2nd student (Charles)

    // Save attendance
    const saveBtn = screen.getByRole('button', { name: /Save Attendance/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(operationsService.markAttendance).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            studentId: 101,
            timetableEntryId: 10,
            status: 'PRESENT',
          }),
          expect.objectContaining({
            studentId: 102,
            timetableEntryId: 10,
            status: 'ABSENT',
          }),
        ])
      );
    });
  });

  it('executes Mark All Present shortcut', async () => {
    render(<AttendanceTracker />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });

    const markAllPresentBtn = screen.getByRole('button', { name: /Mark All Present/i });
    fireEvent.click(markAllPresentBtn);

    // Save attendance
    const saveBtn = screen.getByRole('button', { name: /Save Attendance/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(operationsService.markAttendance).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ studentId: 101, status: 'PRESENT' }),
          expect.objectContaining({ studentId: 102, status: 'PRESENT' }),
        ])
      );
    });
  });
});
