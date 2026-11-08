import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExamManager from '../pages/Academic/ExamManager';
import * as examService from '../api/examService';
import * as academicService from '../api/academicService';

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

vi.mock('../api/academicService', () => ({
  getCourseOfferings: vi.fn(),
  getFaculty: vi.fn(),
  getCourses: vi.fn(),
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

describe('ExamManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(academicService.getCourseOfferings).mockResolvedValue([
      {
        id: 10,
        courseCode: 'CS-101',
        courseName: 'Intro to Programming',
        facultyName: 'Alan Turing',
        semester: 'Fall 2026',
      },
    ]);

    vi.mocked(examService.getExams).mockResolvedValue([
      {
        id: 1,
        name: 'Midterm 1',
        examDate: '2026-10-20',
        totalMarks: 100,
        courseOfferingId: 10,
        courseCode: 'CS-101',
        courseName: 'Intro to Programming',
        semester: 'Fall 2026',
      },
    ]);

    vi.mocked(examService.getStudentsForExam).mockResolvedValue([
      {
        id: 50,
        firstName: 'Ada',
        lastName: 'Lovelace',
        enrollmentNumber: 'ENR-2026-001',
      },
    ]);

    vi.mocked(examService.getExamResults).mockResolvedValue([]);
  });

  it('renders header, tabs, and scheduled exams table', async () => {
    render(<ExamManager />, { wrapper: createWrapper() });

    expect(screen.getByText('Examinations & Grade Management')).toBeInTheDocument();
    expect(screen.getByText('Exams')).toBeInTheDocument();
    expect(screen.getByText('Grade Entry')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Midterm 1')).toBeInTheDocument();
      expect(screen.getByText('CS-101')).toBeInTheDocument();
    });
  });

  it('schedules a new exam via the form in the Exams tab', async () => {
    vi.mocked(examService.createExam).mockResolvedValue({
      id: 2,
      name: 'Final Exam',
      examDate: '2026-12-15',
      totalMarks: 100,
      courseOfferingId: 10,
    });

    render(<ExamManager />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText('Course Offering')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Exam Name'), { target: { value: 'Final Exam' } });
    fireEvent.change(screen.getByLabelText('Course Offering'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Exam Date'), { target: { value: '2026-12-15' } });
    fireEvent.change(screen.getByLabelText('Total Marks'), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Schedule Exam/i }));

    await waitFor(() => {
      expect(examService.createExam).toHaveBeenCalledWith({
        name: 'Final Exam',
        examDate: '2026-12-15',
        totalMarks: 100,
        courseOfferingId: 10,
      });
    });
  });

  it('navigates to Grade Entry, selects an exam, inputs marks, and submits grades', async () => {
    vi.mocked(examService.recordStudentResults).mockResolvedValue([
      {
        id: 1,
        examId: 1,
        studentId: 50,
        studentName: 'Ada Lovelace',
        marksObtained: 95,
        gradeLabel: 'A+',
        gradePoint: 4.0,
      },
    ]);

    render(<ExamManager />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Midterm 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Grade Entry'));

    await waitFor(() => {
      expect(screen.getByLabelText('Select Exam')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Midterm 1/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Select Exam'), { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('ENR-2026-001')).toBeInTheDocument();
    });

    const marksInput = screen.getByLabelText('Marks for Ada Lovelace');
    fireEvent.change(marksInput, { target: { value: '95' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Grades/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(examService.recordStudentResults).toHaveBeenCalledWith(1, [
        {
          studentId: 50,
          marksObtained: 95,
          remarks: '',
        },
      ]);
    });
  });
});
