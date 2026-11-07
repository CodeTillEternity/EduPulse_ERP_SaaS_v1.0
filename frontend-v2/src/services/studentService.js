import axiosClient from '../api/axiosClient';

/**
 * Enrolls a new student profile into the institutional registry.
 *
 * @param {Object} studentData Student profile and academic enrollment parameters
 * @returns {Promise<Object>} Persisted student record
 */
export const enrollStudent = async (studentData) => {
  const response = await axiosClient.post('/api/v1/students', studentData);
  return response.data;
};

/**
 * Retrieves student profile by record identifier.
 *
 * @param {number|string} id Student primary record ID
 * @returns {Promise<Object>} Student profile record
 */
export const getStudentById = async (id) => {
  const response = await axiosClient.get(`/api/v1/students/${id}`);
  return response.data;
};

/**
 * Retrieves student profile by tenant-unique enrollment number.
 *
 * @param {string} enrollmentNumber Institutional enrollment number
 * @returns {Promise<Object>} Student profile record
 */
export const getStudentByEnrollment = async (enrollmentNumber) => {
  const response = await axiosClient.get(`/api/v1/students/enrollment/${enrollmentNumber}`);
  return response.data;
};

const studentService = {
  enrollStudent,
  getStudentById,
  getStudentByEnrollment,
};

export default studentService;
