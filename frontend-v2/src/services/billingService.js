import axiosClient from '../api/axiosClient';

/**
 * Creates a Razorpay recurring subscription for the specified plan ID.
 *
 * @param {string|Object} planData Plan identifier or payload object containing planId
 * @returns {Promise<Object>} Response containing subscriptionId and keyId
 */
export const createRazorpaySubscription = async (planData) => {
  const payload = typeof planData === 'string'
    ? { planId: planData }
    : (planData || {});

  const response = await axiosClient.post('/api/v1/billing/razorpay-subscription', payload);
  return response.data;
};

const billingService = {
  createRazorpaySubscription,
};

export default billingService;
