import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TimetableManager from '../pages/Operations/TimetableManager';
import * as operationsService from '../api/operationsService';
import * as academicService from '../api/academicService';

vi.mock('../api/operationsService', () => ({
  getTimetableByBatch: vi.fn(),
  scheduleClass: vi.fn(),
  markAttendance: vi.fn(),
  getAttendanceByTimetableAndDate: vi.fn(),
  getStudentsForBatch: vi.fn(),
}));

vi.mock('../api/academicService', () => ({
  getCourseOfferings: vi.fn(),
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

describe('TimetableManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(operationsService.getTimetableByBatch).mockResolvedValue([
      {
        id: 1,
        courseOfferingId: 1,
        courseCode: 'CS101',
        courseName: 'Algorithms',
        facultyName: 'Dr. Alan Turing',
        batchName: 'Batch 1 (CS 2026-A)',
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '10:30:00',
        roomNumber: 'LH-101',
        semester: 'Semester 1',
      },
    ]);

    vi.mocked(academicService.getCourseOfferings).mockResolvedValue([
      {
        id: 1,
        course: { code: 'CS101', name: 'Algorithms' },
        faculty: { firstName: 'Alan', lastName: 'Turing' },
        batch: { id: 1 },
      },
    ]);
  });

  it('renders weekly timetable grid and displays scheduled slots', async () => {
    render(<TimetableManager />, { wrapper: createWrapper() });

    expect(screen.getByText('Class Timetable Manager')).toBeInTheDocument();
    expect(screen.getByText('MONDAY')).toBeInTheDocument();
    expect(screen.getByText('TUESDAY')).toBeInTheDocument();
    expect(screen.getByText('SATURDAY')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Algorithms')).toBeInTheDocument();
      expect(screen.getByText('LH-101')).toBeInTheDocument();
      expect(screen.getByText('Dr. Alan Turing')).toBeInTheDocument();
    });
  });

  it('opens modal and submits new class schedule', async () => {
    vi.mocked(operationsService.scheduleClass).mockResolvedValue({
      id: 2,
      courseOfferingId: 1,
      courseCode: 'CS101',
      courseName: 'Algorithms',
      dayOfWeek: 'MONDAY',
      startTime: '11:00:00',
      endTime: '12:30:00',
      roomNumber: 'LH-202',
    });

    render(<TimetableManager />, { wrapper: createWrapper() });

    const openModalBtn = screen.getByRole('button', { name: /Schedule Class/i });
    fireEvent.click(openModalBtn);

    expect(screen.getByText('Schedule Class Session')).toBeInTheDocument();

    const roomInput = screen.getByPlaceholderText('e.g. Hall 301, Lab 4B');
    fireEvent.change(roomInput, { target: { value: 'LH-202' } });

    // Select course offering
    const courseSelect = screen.getByLabelText(/Course Offering/i);
    fireEvent.change(courseSelect, { target: { value: '1' } });

    const saveBtn = screen.getByRole('button', { name: /Save Schedule/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(operationsService.scheduleClass).toHaveBeenCalledWith(
        expect.objectContaining({
          courseOfferingId: 1,
          dayOfWeek: 'MONDAY',
          roomNumber: 'LH-202',
        })
      );
    });
  });
});
