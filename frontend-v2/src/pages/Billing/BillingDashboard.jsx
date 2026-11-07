import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '../../api/axiosClient';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Institution',
    price: '$199',
    period: '/month',
    priceId: 'plan_starter_institutional_199',
    description: 'Perfect for small academies and specialized training schools.',
    features: [
      'Up to 1,000 enrolled students',
      'Standard Admissions & Gradebook',
      'Daily automated database backups',
      'Email support (24hr SLA)',
    ],
    popular: false,
    cta: 'Upgrade to Starter',
  },
  {
    id: 'pro',
    name: 'Pro Institutional Plan',
    price: '$499',
    period: '/month',
    priceId: 'plan_pro_institutional_499',
    description: 'Comprehensive ERP architecture for expanding colleges and universities.',
    features: [
      'Up to 5,000 enrolled students',
      'Full REST API & Webhook Access',
      'Advanced Student Analytics & Transcripts',
      'Multi-campus management',
      'Priority 24/7 technical support',
    ],
    popular: true,
    cta: 'Upgrade Now',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Dedicated',
    price: '$999',
    period: '/month',
    priceId: 'plan_enterprise_dedicated_999',
    description: 'Hardware-isolated dedicated PostgreSQL database routing for large campuses.',
    features: [
      'Unlimited student enrollments',
      'Dedicated database routing mode',
      'Custom subdomains & white-labeling',
      '99.99% uptime enterprise SLA',
      'Dedicated customer success engineer',
    ],
    popular: false,
    cta: 'Upgrade to Enterprise',
  },
];

export default function BillingDashboard() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(null);

  const handleUpgrade = async (priceId = 'plan_pro_institutional_499') => {
    setIsProcessing(priceId);
    try {
      const response = await axiosClient.post('/api/v1/billing/razorpay-subscription', {
        planId: priceId,
        priceId,
      });

      const subscriptionId = response.data?.subscriptionId || response.data?.subscription_id;
      const keyId = response.data?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

      if (!subscriptionId) {
        toast.error('Razorpay subscription ID was not returned by server.');
        return;
      }

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: keyId,
          subscription_id: subscriptionId,
          name: 'EduPulse SaaS',
          description: 'Institutional SaaS Recurring Subscription',
          handler: function (paymentResponse) {
            toast.success('Subscription activated successfully!');
            navigate('/payment-success?session_id=' + (paymentResponse?.razorpay_payment_id || subscriptionId));
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(null);
            },
          },
          theme: {
            color: '#4f46e5',
          },
        });
        rzp.open();
      } else {
        toast.error('Razorpay Checkout SDK is not loaded. Please refresh and try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to initialize Razorpay checkout. Please try again.';
      toast.error(message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50 mb-3">
            SaaS Subscription & Licensing
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Institutional Billing & Plans
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Scale your educational platform with RBI-compliant Razorpay recurring subscriptions, real-time quota upgrades, and multi-tenant isolation.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const isTarget = isProcessing === plan.priceId;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-white border p-8 shadow-sm transition-all duration-200 hover:shadow-md ${
                  plan.popular
                    ? 'border-indigo-600 ring-2 ring-indigo-600 ring-opacity-20 scale-105 z-10'
                    : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  </div>

                  <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.description}</p>

                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="ml-1 text-slate-500 text-sm font-medium">{plan.period}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-6 mb-8">
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                      Plan Inclusions
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-600">
                          <svg
                            className="h-5 w-5 text-indigo-500 flex-shrink-0 mr-2.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleUpgrade(plan.priceId)}
                    disabled={isProcessing !== null}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-sm transition duration-150 flex justify-center items-center ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-4 focus:ring-indigo-100'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isTarget ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Opening Razorpay Checkout...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-16 bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>All transactions are secured via 256-bit TLS Razorpay Checkout. RBI-compliant e-mandate and recurring SaaS billing.</span>
          </div>
          <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg font-mono text-slate-700">
            RBI & PCI-DSS Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
