import axiosClient from './axiosClient';

/**
 * Submits a new leave request for a faculty member.
 *
 * @param {Object} leaveData Payload { facultyId, startDate, endDate, reason }
 * @returns {Promise<Object>} Created leave request response
 */
export const applyForLeave = async (leaveData) => {
  const response = await axiosClient.post('/api/v1/hr/leaves', leaveData);
  return response.data;
};

/**
 * Reviews a faculty leave application (approves or rejects).
 *
 * @param {number|string} leaveId Leave Request ID
 * @param {Object} reviewData Payload { status: 'APPROVED' | 'REJECTED', reviewNotes: string, reviewedBy?: string }
 * @returns {Promise<Object>} Updated leave request response
 */
export const reviewLeave = async (leaveId, reviewData) => {
  const response = await axiosClient.put(`/api/v1/hr/leaves/${leaveId}/review`, reviewData);
  return response.data;
};

/**
 * Retrieves all pending faculty leave requests awaiting administrative decision.
 *
 * @returns {Promise<Array>} List of pending leave requests
 */
export const getPendingLeaves = async () => {
  const response = await axiosClient.get('/api/v1/hr/leaves/pending');
  return response.data;
};

/**
 * Retrieves leave application history for a specific faculty member.
 *
 * @param {number|string} facultyId Faculty ID
 * @returns {Promise<Array>} List of leave requests
 */
export const getFacultyLeaves = async (facultyId) => {
  const response = await axiosClient.get(`/api/v1/hr/leaves/faculty/${facultyId}`);
  return response.data;
};

/**
 * Retrieves all leave applications across the institution for the current tenant.
 *
 * @returns {Promise<Array>} List of all leave requests
 */
export const getAllLeaves = async () => {
  const response = await axiosClient.get('/api/v1/hr/leaves');
  return response.data;
};

/**
 * Generates monthly payroll records for all faculty members with unpaid leave deductions.
 *
 * @param {Object} payrollData Payload { month: number, year: number, defaultBaseSalary?: number }
 * @returns {Promise<Array>} List of generated payslip records
 */
export const generateMonthlyPayroll = async (payrollData) => {
  const response = await axiosClient.post('/api/v1/hr/payroll/generate', payrollData);
  return response.data;
};

/**
 * Retrieves monthly payroll records for a specific billing month and year.
 *
 * @param {number} month Month (1-12)
 * @param {number} year Year (e.g. 2026)
 * @returns {Promise<Array>} List of monthly payslip records
 */
export const getMonthlyPayroll = async (month, year) => {
  const response = await axiosClient.get('/api/v1/hr/payroll', {
    params: { month, year },
  });
  return response.data;
};

/**
 * Marks a generated payslip as PAID and stamps disbursement date.
 *
 * @param {number|string} payrollId Payroll Record ID
 * @returns {Promise<Object>} Updated payslip record
 */
export const markPayrollAsPaid = async (payrollId) => {
  const response = await axiosClient.put(`/api/v1/hr/payroll/${payrollId}/pay`);
  return response.data;
};

/**
 * Retrieves payroll disbursement history for a specific faculty member.
 *
 * @param {number|string} facultyId Faculty ID
 * @returns {Promise<Array>} List of payslip records
 */
export const getFacultyPayroll = async (facultyId) => {
  const response = await axiosClient.get(`/api/v1/hr/payroll/faculty/${facultyId}`);
  return response.data;
};

const hrService = {
  applyForLeave,
  reviewLeave,
  getPendingLeaves,
  getFacultyLeaves,
  getAllLeaves,
  generateMonthlyPayroll,
  getMonthlyPayroll,
  markPayrollAsPaid,
  getFacultyPayroll,
};

export default hrService;
