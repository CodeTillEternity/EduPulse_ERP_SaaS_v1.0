import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CourseManager from '../pages/Academic/CourseManager';
import academicService from '../api/academicService';

vi.mock('../api/academicService', () => ({
  default: {
    getFaculty: vi.fn(),
    createFaculty: vi.fn(),
    getCourses: vi.fn(),
    createCourse: vi.fn(),
    getCourseOfferings: vi.fn(),
    assignCourseOffering: vi.fn(),
  },
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

describe('CourseManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(academicService.getFaculty).mockResolvedValue([
      {
        id: 1,
        employeeId: 'FAC-001',
        firstName: 'Alan',
        lastName: 'Turing',
        email: 'alan@univ.edu',
        designation: 'Professor',
        departmentId: 1,
        departmentName: 'Computer Science',
      },
    ]);
    vi.mocked(academicService.getCourses).mockResolvedValue([
      {
        id: 1,
        code: 'CS101',
        name: 'Data Structures',
        credits: 4,
        departmentId: 1,
        departmentName: 'Computer Science',
      },
    ]);
    vi.mocked(academicService.getCourseOfferings).mockResolvedValue([
      {
        id: 1,
        courseId: 1,
        courseCode: 'CS101',
        courseName: 'Data Structures',
        facultyId: 1,
        facultyName: 'Alan Turing',
        facultyEmployeeId: 'FAC-001',
        batchId: 1,
        batchAcademicYear: '2026-2027',
        semester: 'Fall 2026',
      },
    ]);
  });

  it('renders faculty directory by default and switches tabs cleanly', async () => {
    render(<CourseManager />, { wrapper: createWrapper() });

    expect(screen.getByText('Faculty & Curriculum Manager')).toBeInTheDocument();
    expect(screen.getByText('Register Faculty Member')).toBeInTheDocument();

    // Verify loaded faculty
    await waitFor(() => {
      expect(screen.getByText('FAC-001')).toBeInTheDocument();
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    });

    // Switch to Courses & Curriculum tab
    const coursesTabButton = screen.getByRole('button', { name: /Courses & Curriculum/i });
    fireEvent.click(coursesTabButton);

    expect(screen.getByText('Create Academic Course')).toBeInTheDocument();
    expect(screen.getByText('Assign Faculty to Course')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Data Structures')).toBeInTheDocument();
      expect(screen.getByText('Fall 2026')).toBeInTheDocument();
    });
  });

  it('submits new faculty member and calls academicService.createFaculty', async () => {
    vi.mocked(academicService.createFaculty).mockResolvedValue({
      id: 2,
      employeeId: 'FAC-002',
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@univ.edu',
      designation: 'Professor',
      departmentId: 1,
    });

    render(<CourseManager />, { wrapper: createWrapper() });

    const empInput = screen.getByPlaceholderText('FAC-2026-001');
    const firstInput = screen.getByPlaceholderText('Alan');
    const lastInput = screen.getByPlaceholderText('Turing');
    const emailInput = screen.getByPlaceholderText('alan.turing@university.edu');

    fireEvent.change(empInput, { target: { value: 'FAC-002' } });
    fireEvent.change(firstInput, { target: { value: 'Grace' } });
    fireEvent.change(lastInput, { target: { value: 'Hopper' } });
    fireEvent.change(emailInput, { target: { value: 'grace@univ.edu' } });

    const submitBtn = screen.getByRole('button', { name: /Add Faculty Member/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(academicService.createFaculty).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'FAC-002',
          firstName: 'Grace',
          lastName: 'Hopper',
          email: 'grace@univ.edu',
          departmentId: 1,
        })
      );
    });
  });
});
