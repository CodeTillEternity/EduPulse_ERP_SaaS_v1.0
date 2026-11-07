import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CheckoutSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100 text-center">
          {/* Success Badge */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            Payment Completed
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Subscription activated successfully!
          </h2>

          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            Thank you for upgrading. Your institutional subscription plan is now active. All core ERP modules, admissions registries, and enterprise limits are unlocked.
          </p>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 mb-8 text-left">
            <div className="flex items-center space-x-3 text-sm text-slate-700">
              <ShieldCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <span>Multi-tenant isolation and dedicated quota applied</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
