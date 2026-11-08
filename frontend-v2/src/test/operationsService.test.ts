import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import {
  scheduleClass,
  getTimetableByBatch,
  markAttendance,
  getAttendanceByTimetableAndDate,
  getStudentsForBatch,
} from '../api/operationsService';

vi.mock('../api/axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('operationsService API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scheduleClass sends POST request to /api/v1/operations/timetable', async () => {
    const payload = {
      courseOfferingId: 1,
      dayOfWeek: 'MONDAY',
      startTime: '09:00:00',
      endTime: '10:30:00',
      roomNumber: 'LH-101',
    };
    const mockResponse = { id: 10, ...payload };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await scheduleClass(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/operations/timetable', payload);
    expect(result).toEqual(mockResponse);
  });

  it('getTimetableByBatch sends GET request to /api/v1/operations/timetable/batch/:batchId', async () => {
    const mockList = [
      { id: 1, dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '10:30:00', roomNumber: 'LH-101' },
    ];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockList });

    const result = await getTimetableByBatch(1);
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/operations/timetable/batch/1');
    expect(result).toEqual(mockList);
  });

  it('markAttendance sends POST request to /api/v1/operations/attendance', async () => {
    const payload = [
      { studentId: 1, timetableEntryId: 10, date: '2026-11-08', status: 'PRESENT' },
      { studentId: 2, timetableEntryId: 10, date: '2026-11-08', status: 'ABSENT' },
    ];
    const mockResponse = payload.map((p, idx) => ({ id: idx + 1, ...p }));
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await markAttendance(payload);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/operations/attendance', payload);
    expect(result).toEqual(mockResponse);
  });

  it('getAttendanceByTimetableAndDate sends GET request with date query parameter', async () => {
    const mockRecords = [
      { id: 1, studentId: 1, timetableEntryId: 10, date: '2026-11-08', status: 'PRESENT' },
    ];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockRecords });

    const result = await getAttendanceByTimetableAndDate(10, '2026-11-08');
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/operations/attendance/timetable/10', {
      params: { date: '2026-11-08' },
    });
    expect(result).toEqual(mockRecords);
  });

  it('getStudentsForBatch sends GET request to /api/v1/operations/students/batch/:batchId', async () => {
    const mockStudents = [
      { id: 1, enrollmentNumber: 'ENR-001', firstName: 'John', lastName: 'Doe', email: 'john@edupulse.com' },
    ];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockStudents });

    const result = await getStudentsForBatch(1);
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/operations/students/batch/1');
    expect(result).toEqual(mockStudents);
  });
});
