import axiosClient from './axiosClient';

/**
 * Fetches the aggregated dashboard metrics for the currently authenticated student:
 * today's scheduled classes, unpaid invoices, and cumulative GPA.
 *
 * @returns {Promise<Object>} PortalDashboardDTO
 */
export const getPortalDashboard = async () => {
  const response = await axiosClient.get('/api/v1/portal/dashboard/me');
  return response.data;
};

/**
 * Retrieves all historical and pending fee invoices for the authenticated student.
 *
 * @returns {Promise<Array>} List of StudentInvoiceResponseDTO
 */
export const getStudentInvoices = async () => {
  const response = await axiosClient.get('/api/v1/portal/fees/invoices');
  return response.data;
};

/**
 * Initializes a Razorpay order for an unpaid fee invoice owned by the student.
 *
 * @param {number|string} invoiceId Target StudentInvoice ID
 * @returns {Promise<Object>} FeeCheckoutResponseDTO with orderId, amount, and keyId
 */
export const createFeeCheckoutOrder = async (invoiceId) => {
  const response = await axiosClient.post(`/api/v1/portal/fees/${invoiceId}/checkout`);
  return response.data;
};
