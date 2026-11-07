import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export default function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100 text-center">
          {/* Cancellation Badge */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-6">
            <XCircle className="h-10 w-10 text-rose-600" />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
            Checkout Discontinued
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Payment cancelled. No charges were made.
          </h2>

          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            Your Stripe checkout session was cancelled. You can review available plans and restart the upgrade process at any time.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/billing')}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Return to Billing</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
