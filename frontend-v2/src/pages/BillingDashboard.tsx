import { useState, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Database,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

export interface PlanPricing {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  studentLimit: number;
  storageMb: number;
  hasApiAccess: boolean;
  popular?: boolean;
  features: string[];
}

export const PRICING_PLANS: PlanPricing[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 990,
    studentLimit: 500,
    storageMb: 5120,
    hasApiAccess: false,
    features: [
      'Up to 500 enrolled students',
      '5 GB document & photo storage',
      'Complete Academic & Student modules',
      'Attendance tracking & fee billing',
      'Standard community support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 299,
    annualPrice: 2990,
    studentLimit: 2500,
    storageMb: 25600,
    hasApiAccess: true,
    popular: true,
    features: [
      'Up to 2,500 enrolled students',
      '25 GB secure document storage',
      'Full ERP feature catalog',
      'External REST API access',
      'Advanced reporting & analytics',
      'Priority email & ticket support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 999,
    annualPrice: 9990,
    studentLimit: 100000,
    storageMb: 102400,
    hasApiAccess: true,
    features: [
      'Up to 100,000 enrolled students',
      '100 GB dedicated storage',
      'Custom database partitioning',
      'High-throughput API endpoints',
      'Dedicated Customer Success Manager',
      '99.9% uptime SLA guarantee',
    ],
  },
];

interface BillingDashboardProps {
  onSelectPlan?: (planName: string, billingCycle: string) => void;
  isLoadingPlan?: string | null;
}

export default function BillingDashboard({ onSelectPlan, isLoadingPlan = null }: BillingDashboardProps) {
  const { tenantId, tenantStatus } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  // Calculate days remaining (mocked or computed from trial window)
  const isTrial = tenantStatus === 'TRIAL_ACTIVE';
  const isGrace = tenantStatus === 'READ_ONLY_GRACE';
  const isActive = tenantStatus === 'ACTIVE';

  const daysRemaining = useMemo(() => {
    if (isActive) return null;
    if (isGrace) return 0;
    // Estimated 14 days default for demo/trial view
    return 12;
  }, [isActive, isGrace]);

  const handlePlanClick = (planName: string) => {
    if (onSelectPlan) {
      onSelectPlan(planName, billingCycle);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
            <CreditCard className="w-4 h-4" /> Subscription & Monetization
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Billing & Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your institutional tier, monitor trial timelines, and upgrade your partition quotas.
          </p>
        </div>

        {/* Tenant Reference Badge */}
        <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-slate-500">Tenant:</span>
          <span className="font-semibold text-slate-800">{tenantId || 'apex-univ-demo'}</span>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Current Partition Tier
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : isGrace
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {tenantStatus || 'TRIAL_ACTIVE'}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold mt-2">
              {isActive ? 'Enterprise Production Plan' : isGrace ? 'Read-Only Grace Period' : '14-Day Free Evaluation'}
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm">
              {isActive
                ? 'Your institution has an active recurring subscription with unlimited platform capability.'
                : isGrace
                ? 'Your trial has ended. Select a paid plan below to restore write operations and unfreeze records.'
                : 'Full system access enabled with standard evaluation quotas.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {!isActive && (
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Trial Time Remaining</p>
                    <p className="text-lg font-bold text-white">
                      {isGrace ? '0 Days (Expired)' : `${daysRemaining ?? 14} Days Left`}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="text-xs text-slate-400 block">Quota Quotas</span>
                  <span className="text-xs font-semibold text-indigo-300">500 Students &bull; 5 GB Storage</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              SaaS Assurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Multi-tenant row-level security & complete data partition</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Zero-downtime automated schema migration</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Stripe 256-bit SSL encrypted PCI compliance</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Seamless instant plan activations</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table Section */}
      <div className="space-y-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
            Choose the Right Plan for Your Institution
          </h2>
          <p className="text-sm text-slate-500">
            Transparent, predictable pricing designed to scale effortlessly from academies to multi-campus universities.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mt-2">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {PRICING_PLANS.map((plan) => {
            const price = billingCycle === 'ANNUAL' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            const isPlanLoading = isLoadingPlan === plan.name;

            return (
              <Card
                key={plan.id}
                className={`flex flex-col relative transition-all duration-200 ${
                  plan.popular
                    ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
                      <Sparkles className="w-3.5 h-3.5" /> Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="pt-6 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Up to {plan.studentLimit.toLocaleString()} students with {Math.round(plan.storageMb / 1024)} GB storage
                  </CardDescription>

                  <div className="pt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">${price}</span>
                    <span className="text-xs font-medium text-slate-500">/ month</span>
                  </div>
                  {billingCycle === 'ANNUAL' && (
                    <span className="text-[11px] font-medium text-emerald-600 block mt-0.5">
                      Billed annually (${plan.annualPrice}/yr)
                    </span>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-2 text-xs text-slate-600">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 pb-6 border-t border-slate-100">
                  <Button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={isPlanLoading}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isPlanLoading ? (
                      'Redirecting to Stripe...'
                    ) : (
                      <>
                        Upgrade to {plan.name} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
