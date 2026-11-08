import axiosClient from './axiosClient';

/**
 * Schedules a new examination tied to a CourseOffering.
 *
 * @param {Object} examData Payload { name, examDate, totalMarks, courseOfferingId }
 * @returns {Promise<Object>} Created exam details
 */
export const createExam = async (examData) => {
  const response = await axiosClient.post('/api/v1/academic/exams', examData);
  return response.data;
};

/**
 * Retrieves all scheduled examinations across the tenant institution.
 *
 * @returns {Promise<Array>} List of exams
 */
export const getExams = async () => {
  const response = await axiosClient.get('/api/v1/academic/exams');
  return response.data;
};

/**
 * Retrieves details for a specific examination.
 *
 * @param {number|string} id Exam ID
 * @returns {Promise<Object>} Exam details
 */
export const getExamById = async (id) => {
  const response = await axiosClient.get(`/api/v1/academic/exams/${id}`);
  return response.data;
};

/**
 * Retrieves scheduled examinations for a specific course offering.
 *
 * @param {number|string} offeringId CourseOffering ID
 * @returns {Promise<Array>} List of exams
 */
export const getExamsByOffering = async (offeringId) => {
  const response = await axiosClient.get(`/api/v1/academic/exams/offering/${offeringId}`);
  return response.data;
};

/**
 * Defines or updates a grading scale bracket (grade, minMarks, maxMarks, gradePoint).
 *
 * @param {Object} scaleData Payload { grade, minMarks, maxMarks, gradePoint }
 * @returns {Promise<Object>} Created grade scale
 */
export const defineGradeScale = async (scaleData) => {
  const response = await axiosClient.post('/api/v1/academic/grade-scales', scaleData);
  return response.data;
};

/**
 * Retrieves all configured grade scales for the tenant.
 *
 * @returns {Promise<Array>} List of grade scales
 */
export const getGradeScales = async () => {
  const response = await axiosClient.get('/api/v1/academic/grade-scales');
  return response.data;
};

/**
 * Submits student marks in bulk for an exam, automatically evaluating against GradeScale bands.
 *
 * @param {number|string} examId Exam ID
 * @param {Array<Object>} results Payload [{ studentId, marksObtained, remarks }]
 * @returns {Promise<Array>} Recorded results
 */
export const recordStudentResults = async (examId, results) => {
  const response = await axiosClient.post(`/api/v1/academic/exams/${examId}/results`, results);
  return response.data;
};

/**
 * Retrieves recorded student results for a specific examination.
 *
 * @param {number|string} examId Exam ID
 * @returns {Promise<Array>} List of student results
 */
export const getExamResults = async (examId) => {
  const response = await axiosClient.get(`/api/v1/academic/exams/${examId}/results`);
  return response.data;
};

/**
 * Retrieves enrolled students for the batch associated with an examination's course offering.
 *
 * @param {number|string} examId Exam ID
 * @returns {Promise<Array>} List of enrolled students
 */
export const getStudentsForExam = async (examId) => {
  const response = await axiosClient.get(`/api/v1/academic/exams/${examId}/students`);
  return response.data;
};

/**
 * Generates and fetches an official academic transcript for a student by enrollment number.
 *
 * @param {string} enrollmentNumber Student enrollment number
 * @returns {Promise<Object>} Student transcript
 */
export const getStudentTranscript = async (enrollmentNumber) => {
  const response = await axiosClient.get(`/api/v1/academic/transcripts/${enrollmentNumber}`);
  return response.data;
};

const examService = {
  createExam,
  getExams,
  getExamById,
  getExamsByOffering,
  defineGradeScale,
  getGradeScales,
  recordStudentResults,
  getExamResults,
  getStudentsForExam,
  getStudentTranscript,
};

export default examService;
