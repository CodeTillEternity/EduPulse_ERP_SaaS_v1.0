import axiosClient from './axiosClient';

/**
 * Schedules a new class timetable entry.
 *
 * @param {Object} timetableData Timetable payload { courseOfferingId, dayOfWeek, startTime, endTime, roomNumber }
 * @returns {Promise<Object>} Created timetable slot details
 */
export const scheduleClass = async (timetableData) => {
  const response = await axiosClient.post('/api/v1/operations/timetable', timetableData);
  return response.data;
};

/**
 * Retrieves all scheduled timetable entries for an academic batch.
 *
 * @param {number|string} batchId Academic batch identifier
 * @returns {Promise<Array>} List of scheduled class sessions
 */
export const getTimetableByBatch = async (batchId) => {
  const response = await axiosClient.get(`/api/v1/operations/timetable/batch/${batchId}`);
  return response.data;
};

/**
 * Records or updates daily attendance records for a list of students.
 *
 * @param {Array<Object>} attendanceList List of attendance items { studentId, timetableEntryId, date, status }
 * @returns {Promise<Array>} Persisted attendance records
 */
export const markAttendance = async (attendanceList) => {
  const response = await axiosClient.post('/api/v1/operations/attendance', attendanceList);
  return response.data;
};

/**
 * Retrieves attendance records for a specific timetable entry and date.
 *
 * @param {number|string} timetableEntryId Timetable entry ID
 * @param {string} date Date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Array>} List of attendance records
 */
export const getAttendanceByTimetableAndDate = async (timetableEntryId, date) => {
  const response = await axiosClient.get(`/api/v1/operations/attendance/timetable/${timetableEntryId}`, {
    params: { date },
  });
  return response.data;
};

/**
 * Retrieves all enrolled student profiles for an academic batch.
 *
 * @param {number|string} batchId Academic batch identifier
 * @returns {Promise<Array>} List of students in the batch
 */
export const getStudentsForBatch = async (batchId) => {
  const response = await axiosClient.get(`/api/v1/operations/students/batch/${batchId}`);
  return response.data;
};

const operationsService = {
  scheduleClass,
  getTimetableByBatch,
  markAttendance,
  getAttendanceByTimetableAndDate,
  getStudentsForBatch,
};

export default operationsService;
