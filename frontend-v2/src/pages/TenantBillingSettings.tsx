import React, { useState, useEffect } from 'react';
import { axiosClient } from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  RefreshCw,
  Building2,
  AlertCircle
} from 'lucide-react';

interface SubscriptionData {
  tenantId: string;
  institutionName: string;
  subdomain?: string;
  subscriptionTier: string;
  accountStatus: string;
  trialDaysRemaining: number;
  trialEndDate?: string;
  currentPeriodEnd?: string;
  upcomingInvoiceDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export const TenantBillingSettings: React.FC = () => {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/v1/saas/billing/subscription');
      if (res.data?.success && res.data.data) {
        setSubscription(res.data.data);
      } else {
        // Fallback baseline for local display
        setSubscription({
          tenantId: user?.tenantId || 'tenant-current',
          institutionName: user?.username ? `${user.username}'s Institution` : 'Institutional Workspace',
          subscriptionTier: 'TRIAL',
          accountStatus: 'TRIAL',
          trialDaysRemaining: 12,
          trialEndDate: new Date(Date.now() + 12 * 86400000).toISOString(),
          upcomingInvoiceDate: new Date(Date.now() + 12 * 86400000).toISOString(),
        });
      }
    } catch {
      // Set sensible defaults if offline or sandbox mock
      setSubscription({
        tenantId: user?.tenantId || 'tenant-current',
        institutionName: 'Institutional Workspace',
        subscriptionTier: 'TRIAL',
        accountStatus: 'TRIAL',
        trialDaysRemaining: 14,
        trialEndDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        upcomingInvoiceDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const handleUpgrade = async (targetTier: 'PRO' | 'ENTERPRISE') => {
    try {
      setUpgradingTier(targetTier);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const payload = {
        tier: targetTier,
        successUrl: `${origin}/billing/success`,
        cancelUrl: `${origin}/dashboard/billing/settings`
      };

      const res = await axiosClient.post('/api/v1/saas/billing/stripe-checkout', payload);
      const checkoutUrl = res.data?.data?.checkoutUrl || res.data?.checkoutUrl;

      if (checkoutUrl) {
        toast.loading(`Redirecting to secure Stripe Checkout for ${targetTier}...`, { duration: 2500 });
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1000);
      } else {
        toast.error('Unable to initialize Stripe Checkout session. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Upgrade session error:', err);
      toast.error('Failed to initiate Stripe Checkout.');
    } finally {
      setUpgradingTier(null);
    }
  };

  // Test trigger to demonstrate HTTP 402 interceptor with react-hot-toast
  const handleTestEnterpriseFeature = async () => {
    try {
      setTestingEndpoint(true);
      await axiosClient.post('/api/v1/finance/documents/watermark/remove');
      toast.success('Enterprise feature executed successfully!');
    } catch {
      // 402 is intercepted by axiosClient to show react-hot-toast upgrade prompt
    } finally {
      setTestingEndpoint(false);
    }
  };

  const currentTier = (subscription?.subscriptionTier || 'TRIAL').toUpperCase();
  const isTrial = currentTier === 'TRIAL';
  const isPro = currentTier === 'PRO';
  const isEnterprise = currentTier === 'ENTERPRISE';

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            Institutional Control Plane
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Subscription & Billing Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your institution's SaaS license tier, corporate payment methods, and automated billing cycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubscriptionDetails}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Tier
            </span>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
              isEnterprise
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : isPro
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            }`}>
              {currentTier}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {currentTier} PLAN
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Institution: <strong className="text-slate-800 dark:text-slate-200">{subscription?.institutionName || 'Active School'}</strong>
          </p>
        </div>

        {/* Trial Days Remaining Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trial Window
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {subscription?.trialDaysRemaining ?? 0}
            </span>
            <span className="text-sm font-medium text-slate-500">Days Remaining</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {isTrial
              ? `Trial expires on ${formatDate(subscription?.trialEndDate)}`
              : 'Full commercial license active'}
          </p>
        </div>

        {/* Upcoming Invoice Date Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Next Invoice Date
            </span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatDate(subscription?.upcomingInvoiceDate || subscription?.currentPeriodEnd)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            Auto-billed via Stripe corporate billing
          </p>
        </div>
      </div>

      {/* Trial Expiration Alert (if in Trial) */}
      {isTrial && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                14-Day Institutional Trial Active ({subscription?.trialDaysRemaining} days remaining)
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Your institution is currently on the free trial period. Upgrade to Pro or Enterprise to prevent service interruption, unlock unrestricted student enrollment, and access Safe Exam Browser OS lockdown.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Upgrade Plans Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available Institutional SaaS Tiers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select a commercial plan to securely link your institution's corporate credit card via Stripe Checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* TRIAL / STARTER TIER */}
          <div className={`relative flex flex-col justify-between rounded-2xl border p-7 bg-white dark:bg-slate-900 transition-all ${
            isTrial ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-200 dark:border-slate-800'
          }`}>
            {isTrial && (
              <span className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500 text-white">
                Current Plan
              </span>
            )}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trial / Starter</h3>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="ml-1 text-sm font-medium text-slate-500">/14 days</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Free 14-day evaluation environment for small schools and pilot deployments.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Up to 100 enrolled students
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Core Student Information System (SIS)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Standard attendance & gradebook
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  No Safe Exam Browser proctoring
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  Includes EduPulse footer watermark
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={isTrial}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed text-center"
              >
                {isTrial ? 'Currently Active' : 'Default Trial'}
              </button>
            </div>
          </div>

          {/* PRO TIER */}
          <div className={`relative flex flex-col justify-between rounded-2xl border p-7 bg-white dark:bg-slate-900 shadow-md transition-all ${
            isPro ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
          }`}>
            {isPro && (
              <span className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-600 text-white">
                Current Plan
              </span>
            )}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Commercial Pro</h3>
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$99</span>
                <span className="ml-1 text-sm font-medium text-slate-500">/month</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Full-featured enterprise ERP for growing private colleges and universities.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <strong>Unlimited</strong> student enrollment capacity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Automated fee billing & payment gateways
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Dual-factor identity verification & password reset
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Priority email & ticket support (4h SLA)
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  Standard proctoring (no SEB OS lockdown)
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleUpgrade('PRO')}
                disabled={isPro || upgradingTier === 'PRO'}
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                  isPro
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow hover:shadow-indigo-500/25'
                }`}
              >
                {upgradingTier === 'PRO' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting Stripe...
                  </>
                ) : isPro ? (
                  'Active Plan'
                ) : (
                  <>
                    Upgrade to Pro via Stripe
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ENTERPRISE TIER */}
          <div className={`relative flex flex-col justify-between rounded-2xl border p-7 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-900 shadow-lg transition-all ${
            isEnterprise
              ? 'border-purple-600 ring-2 ring-purple-500/40'
              : 'border-purple-300 dark:border-purple-800/80 hover:border-purple-500'
          }`}>
            <span className="absolute -top-3 right-6 px-3 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow">
              {isEnterprise ? 'Current Plan' : 'Recommended'}
            </span>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">Enterprise High-Sec</h3>
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$299</span>
                <span className="ml-1 text-sm font-medium text-slate-500">/month</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Institutional accreditation tier with Safe Exam Browser lockdown & white-label control.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  Safe Exam Browser (SEB) OS Lockdown configuration
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  Branded document watermark removal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  Dedicated physical IP subnet whitelisting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  Multi-campus database routing & dedicated tenant shards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  24/7 dedicated enterprise support manager
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-purple-100 dark:border-purple-900/50">
              <button
                onClick={() => handleUpgrade('ENTERPRISE')}
                disabled={isEnterprise || upgradingTier === 'ENTERPRISE'}
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                  isEnterprise
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 cursor-default'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-purple-500/25'
                }`}
              >
                {upgradingTier === 'ENTERPRISE' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting Stripe...
                  </>
                ) : isEnterprise ? (
                  'Active Enterprise Plan'
                ) : (
                  <>
                    Upgrade to Enterprise via Stripe
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Entitlement Guard Verification Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              SaaS Entitlement Engine Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Advanced SEB proctoring and document watermark removal are locked behind the ENTERPRISE tier.
              Test the entitlement guard to verify live HTTP 402 error interception.
            </p>
          </div>
          <button
            onClick={handleTestEnterpriseFeature}
            disabled={testingEndpoint}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition shadow-sm"
          >
            {testingEndpoint ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
            Test Enterprise Watermark Removal
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantBillingSettings;
