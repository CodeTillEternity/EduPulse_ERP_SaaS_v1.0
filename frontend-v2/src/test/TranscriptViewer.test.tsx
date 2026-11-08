import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TranscriptViewer from '../pages/Academic/TranscriptViewer';
import * as examService from '../api/examService';

vi.mock('../api/examService', () => ({
  createExam: vi.fn(),
  getExams: vi.fn(),
  getExamById: vi.fn(),
  getExamsByOffering: vi.fn(),
  defineGradeScale: vi.fn(),
  getGradeScales: vi.fn(),
  recordStudentResults: vi.fn(),
  getExamResults: vi.fn(),
  getStudentsForExam: vi.fn(),
  getStudentTranscript: vi.fn(),
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

describe('TranscriptViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(examService.getStudentTranscript).mockResolvedValue({
      studentId: 101,
      enrollmentNumber: 'ENR-2026-001',
      studentName: 'Alan Turing',
      email: 'alan.turing@edupulse.edu',
      batchId: 1,
      batchName: 'CS 2026 Batch A',
      cumulativeGpa: 3.85,
      totalExams: 2,
      results: [
        {
          id: 1,
          examId: 10,
          examName: 'Midterm 1',
          studentId: 101,
          studentName: 'Alan Turing',
          enrollmentNumber: 'ENR-2026-001',
          marksObtained: 95.0,
          totalMarks: 100.0,
          gradeLabel: 'A+',
          gradePoint: 4.0,
          remarks: 'Excellent work',
          courseCode: 'CS-101',
          courseName: 'Intro to Computer Systems',
        },
        {
          id: 2,
          examId: 20,
          examName: 'Midterm 2',
          studentId: 101,
          studentName: 'Alan Turing',
          enrollmentNumber: 'ENR-2026-001',
          marksObtained: 85.0,
          totalMarks: 100.0,
          gradeLabel: 'A',
          gradePoint: 3.7,
          remarks: 'Good progress',
          courseCode: 'CS-201',
          courseName: 'Algorithms & Data Structures',
        },
      ],
    });
  });

  it('renders search input and initial guidance message', () => {
    render(<TranscriptViewer />, { wrapper: createWrapper() });

    expect(screen.getByText('Official Academic Transcripts')).toBeInTheDocument();
    expect(screen.getByLabelText('Student Enrollment Number')).toBeInTheDocument();
    expect(screen.getByText('Search for a Student Transcript')).toBeInTheDocument();
  });

  it('searches for a student transcript and displays demographic info and cumulative GPA', async () => {
    render(<TranscriptViewer />, { wrapper: createWrapper() });

    const searchInput = screen.getByLabelText('Student Enrollment Number');
    fireEvent.change(searchInput, { target: { value: 'ENR-2026-001' } });

    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    await waitFor(() => {
      expect(examService.getStudentTranscript).toHaveBeenCalledWith('ENR-2026-001');
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
      expect(screen.getByText('3.85')).toBeInTheDocument();
      expect(screen.getByText('CS 2026 Batch A')).toBeInTheDocument();
      expect(screen.getByText('CS-101')).toBeInTheDocument();
      expect(screen.getByText('Algorithms & Data Structures')).toBeInTheDocument();
    });
  });

  it('triggers window.print when Print Transcript button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<TranscriptViewer />, { wrapper: createWrapper() });

    const searchInput = screen.getByLabelText('Student Enrollment Number');
    fireEvent.change(searchInput, { target: { value: 'ENR-2026-001' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Print Transcript/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Print Transcript/i }));
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
