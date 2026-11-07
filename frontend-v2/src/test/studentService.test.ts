import { describe, it, expect, vi, beforeEach } from 'vitest';
import studentService from '../services/studentService.js';
import axiosClient from '../api/axiosClient.js';

vi.mock('../api/axiosClient.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('studentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enrollStudent sends POST request to /api/v1/students and returns data', async () => {
    const payload = {
      enrollmentNumber: 'CS-2026-001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@institution.edu',
      departmentId: 1,
      batchId: 2,
    };

    const mockResponse = { data: { id: 10, ...payload } };
    (axiosClient.post as any).mockResolvedValue(mockResponse);

    const result = await studentService.enrollStudent(payload);

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/students', payload);
    expect(result).toEqual(mockResponse.data);
  });

  it('getStudentById sends GET request to /api/v1/students/:id', async () => {
    const mockStudent = { id: 42, firstName: 'Grace', lastName: 'Hopper' };
    (axiosClient.get as any).mockResolvedValue({ data: mockStudent });

    const result = await studentService.getStudentById(42);

    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/students/42');
    expect(result).toEqual(mockStudent);
  });

  it('getStudentByEnrollment sends GET request to /api/v1/students/enrollment/:enrollmentNumber', async () => {
    const mockStudent = { id: 99, enrollmentNumber: 'ENR-999', firstName: 'Alan' };
    (axiosClient.get as any).mockResolvedValue({ data: mockStudent });

    const result = await studentService.getStudentByEnrollment('ENR-999');

    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/students/enrollment/ENR-999');
    expect(result).toEqual(mockStudent);
  });
});
