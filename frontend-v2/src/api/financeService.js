import axiosClient from './axiosClient';

/**
 * Creates a new fee ledger head category.
 *
 * @param {Object} headData Fee head payload { name, description, active }
 * @returns {Promise<Object>} Created fee head details
 */
export const createFeeHead = async (headData) => {
  const response = await axiosClient.post('/api/v1/finance/heads', headData);
  return response.data;
};

/**
 * Retrieves all defined fee head categories for the current tenant.
 *
 * @returns {Promise<Array>} List of fee heads
 */
export const getFeeHeads = async () => {
  const response = await axiosClient.get('/api/v1/finance/heads');
  return response.data;
};

/**
 * Creates a new fee structure blueprint with line items for a batch.
 *
 * @param {Object} structureData Fee structure payload { name, batchId, items: [{ feeHeadId, amount }] }
 * @returns {Promise<Object>} Created fee structure details
 */
export const createFeeStructure = async (structureData) => {
  const response = await axiosClient.post('/api/v1/finance/structures', structureData);
  return response.data;
};

/**
 * Retrieves all fee structure blueprints for the tenant.
 *
 * @returns {Promise<Array>} List of fee structures
 */
export const getFeeStructures = async () => {
  const response = await axiosClient.get('/api/v1/finance/structures');
  return response.data;
};

/**
 * Retrieves fee structures configured for a specific academic batch.
 *
 * @param {number|string} batchId Batch ID
 * @returns {Promise<Array>} List of fee structures
 */
export const getFeeStructuresByBatch = async (batchId) => {
  const response = await axiosClient.get(`/api/v1/finance/structures/batch/${batchId}`);
  return response.data;
};

/**
 * Generates student invoices for all active students in a batch based on a fee structure.
 *
 * @param {Object} batchInvoiceData Payload { batchId, feeStructureId, dueDate, discount }
 * @returns {Promise<Array>} Created student invoices
 */
export const generateInvoicesForBatch = async (batchInvoiceData) => {
  const response = await axiosClient.post('/api/v1/finance/invoices/batch', batchInvoiceData);
  return response.data;
};

/**
 * Records a payment against an outstanding student fee invoice.
 *
 * @param {Object} paymentData Payload { invoiceId, amount, paymentMethod, referenceNumber, notes }
 * @returns {Promise<Object>} Payment receipt transaction details
 */
export const recordPayment = async (paymentData) => {
  const response = await axiosClient.post('/api/v1/finance/payments', paymentData);
  return response.data;
};

/**
 * Retrieves the comprehensive student fee ledger and payment history by enrollment number.
 *
 * @param {string} enrollmentNumber Student enrollment number
 * @returns {Promise<Object>} Student ledger details
 */
export const getStudentLedger = async (enrollmentNumber) => {
  const response = await axiosClient.get(`/api/v1/finance/ledger/student/${enrollmentNumber}`);
  return response.data;
};

/**
 * Retrieves all invoices issued for a specific student ID.
 *
 * @param {number|string} studentId Student ID
 * @returns {Promise<Array>} List of student invoices
 */
export const getInvoicesByStudent = async (studentId) => {
  const response = await axiosClient.get(`/api/v1/finance/invoices/student/${studentId}`);
  return response.data;
};

const financeService = {
  createFeeHead,
  getFeeHeads,
  createFeeStructure,
  getFeeStructures,
  getFeeStructuresByBatch,
  generateInvoicesForBatch,
  recordPayment,
  getStudentLedger,
  getInvoicesByStudent,
};

export default financeService;
