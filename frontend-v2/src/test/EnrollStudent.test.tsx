import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnrollStudent from '../pages/Admissions/EnrollStudent.jsx';
import * as studentService from '../services/studentService.js';
import { toast } from 'sonner';

vi.mock('../services/studentService.js', () => ({
  enrollStudent: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EnrollStudent Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders enrollment form inputs correctly', () => {
    render(<EnrollStudent />);

    expect(screen.getByLabelText(/Enrollment \/ Roll Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Institutional Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Department ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Batch ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enroll Student/i })).toBeInTheDocument();
  });

  it('submits form data and fires success toast on 201 Created', async () => {
    const mockStudent = {
      id: 101,
      enrollmentNumber: 'ENR-2026-001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@institution.edu',
    };

    (studentService.enrollStudent as any).mockResolvedValue(mockStudent);

    render(<EnrollStudent />);

    fireEvent.change(screen.getByLabelText(/Enrollment \/ Roll Number/i), {
      target: { value: 'ENR-2026-001' },
    });
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Ada' },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'Lovelace' },
    });
    fireEvent.change(screen.getByLabelText(/Institutional Email/i), {
      target: { value: 'ada@institution.edu' },
    });
    fireEvent.change(screen.getByLabelText(/Department ID/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Batch ID/i), {
      target: { value: '2' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Enroll Student/i }));

    await waitFor(() => {
      expect(studentService.enrollStudent).toHaveBeenCalledWith({
        enrollmentNumber: 'ENR-2026-001',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@institution.edu',
        departmentId: 1,
        batchId: 2,
      });
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Student enrolled successfully')
      );
    });
  });

  it('triggers error toast on conflict or bad request response', async () => {
    (studentService.enrollStudent as any).mockRejectedValue({
      response: {
        status: 400,
        data: { message: "Student with enrollment number 'ENR-2026-001' already exists" },
      },
    });

    render(<EnrollStudent />);

    fireEvent.change(screen.getByLabelText(/Enrollment \/ Roll Number/i), {
      target: { value: 'ENR-2026-001' },
    });
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Ada' },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'Lovelace' },
    });
    fireEvent.change(screen.getByLabelText(/Institutional Email/i), {
      target: { value: 'ada@institution.edu' },
    });
    fireEvent.change(screen.getByLabelText(/Department ID/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Batch ID/i), {
      target: { value: '2' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Enroll Student/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('already exists')
      );
    });
  });
});
