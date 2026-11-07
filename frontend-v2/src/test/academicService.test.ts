import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import {
  createFaculty,
  getFaculty,
  createCourse,
  getCourses,
  assignCourseOffering,
  getCourseOfferings,
} from '../api/academicService';

vi.mock('../api/axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('academicService API layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createFaculty sends POST request to /api/v1/academic/faculty', async () => {
    const payload = {
      employeeId: 'FAC-001',
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@univ.edu',
      designation: 'Professor',
      departmentId: 1,
    };
    const mockResponse = { id: 10, ...payload };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await createFaculty(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/academic/faculty', payload);
    expect(result).toEqual(mockResponse);
  });

  it('getFaculty sends GET request to /api/v1/academic/faculty', async () => {
    const mockList = [{ id: 1, employeeId: 'FAC-001', firstName: 'Alan' }];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockList });

    const result = await getFaculty();
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/academic/faculty');
    expect(result).toEqual(mockList);
  });

  it('createCourse sends POST request to /api/v1/academic/courses', async () => {
    const payload = {
      code: 'CS101',
      name: 'Intro to CS',
      credits: 4,
      departmentId: 1,
    };
    const mockResponse = { id: 5, ...payload };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await createCourse(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/academic/courses', payload);
    expect(result).toEqual(mockResponse);
  });

  it('getCourses sends GET request to /api/v1/academic/courses', async () => {
    const mockList = [{ id: 5, code: 'CS101', name: 'Intro to CS' }];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockList });

    const result = await getCourses();
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/academic/courses');
    expect(result).toEqual(mockList);
  });

  it('assignCourseOffering sends POST request to /api/v1/academic/offerings', async () => {
    const payload = {
      courseId: 5,
      facultyId: 10,
      batchId: 1,
      semester: 'Fall 2026',
    };
    const mockResponse = { id: 20, ...payload };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await assignCourseOffering(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/academic/offerings', payload);
    expect(result).toEqual(mockResponse);
  });

  it('getCourseOfferings sends GET request to /api/v1/academic/offerings', async () => {
    const mockList = [{ id: 20, semester: 'Fall 2026', courseName: 'Intro to CS' }];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockList });

    const result = await getCourseOfferings();
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/academic/offerings');
    expect(result).toEqual(mockList);
  });
});
