import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  Zap, 
  Lock, 
  Server
} from 'lucide-react';
import { Button } from '../ui/button';

export interface PricingProps {
  onSelectTier?: (tier: string) => void;
  showTrialCta?: boolean;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectTier }) => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const handleCta = (tier: string) => {
    if (onSelectTier) {
      onSelectTier(tier);
      return;
    }
    navigate('/onboard?tier=' + tier);
  };

  const isAnnual = billingCycle === 'annual';

  const prices = {
    TRIAL: {
      INR: '₹0',
      USD: '$0',
      subtext: '14-day full access trial'
    },
    PRO: {
      INR: isAnnual ? '₹15,999' : '₹19,999',
      USD: isAnnual ? '$199' : '$249',
      subtext: isAnnual ? 'per month, billed annually' : 'per month, billed monthly'
    },
    ENTERPRISE: {
      INR: isAnnual ? '₹39,999' : '₹49,999',
      USD: isAnnual ? '$499' : '$599',
      subtext: isAnnual ? 'per month, billed annually' : 'per month, billed monthly'
    }
  };

  return (
    <section id="pricing" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" />
            Transparent Commercial Tiers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Simple, Predictable Institutional Pricing
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Choose the tier tailored to your institution's scale and security needs. Every tier is powered by autonomous multi-tenant isolation.
          </p>

          {/* Toggle Controls */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {/* Billing cycle toggle */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Currency toggle */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currency === 'INR' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                INR (₹)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currency === 'USD' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* TIER 1: FREE TRIAL */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 flex flex-col justify-between hover:border-slate-600 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Starter Trial</h3>
                  <p className="text-xs text-slate-400 mt-1">Full evaluation for institutions</p>
                </div>
                <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">{prices.TRIAL[currency]}</span>
                <span className="ml-2 text-sm text-slate-400">/ 14 days</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-1">No credit card required</p>

              <div className="my-6 border-t border-slate-700" />

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Up to 100 students & 15 faculty accounts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Complete Academic, Attendance & HR modules</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>PostgreSQL Row-Level Security (RLS) isolation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Dual-Factor reset & audit logs</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <Lock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="line-through">Safe Exam Browser OS Lockdown</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <Lock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="line-through">Dedicated Database Routing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <Button
                onClick={() => handleCta('TRIAL')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 text-xs rounded-xl"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* TIER 2: PRO */}
          <div className="bg-gradient-to-b from-indigo-900/60 to-slate-800/90 border-2 border-indigo-500 rounded-2xl p-8 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-wider shadow">
              Most Popular
            </span>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Pro Institution</h3>
                  <p className="text-xs text-indigo-300 mt-1">Colleges & established schools</p>
                </div>
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">{prices.PRO[currency]}</span>
                <span className="ml-2 text-xs text-slate-400">{prices.PRO.subtext}</span>
              </div>
              <p className="text-xs text-indigo-300 font-medium mt-1">Razorpay RBI-compliant recurring billing</p>

              <div className="my-6 border-t border-indigo-500/30" />

              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Unlimited student enrollment & faculty staff</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Safe Exam Browser (SEB) proctoring & lockdown keys</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Custom institution subdomain & custom branding</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Automated daily S3 backup snapshots</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Razorpay student fee collection & ledger settlement</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Prometheus APM metrics & uptime dashboard</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-indigo-500/30">
              <Button
                onClick={() => handleCta('PRO')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Get Started with Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* TIER 3: ENTERPRISE */}
          <div className="bg-slate-800/80 border border-purple-500/50 rounded-2xl p-8 flex flex-col justify-between hover:border-purple-400 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Enterprise High-Sec</h3>
                  <p className="text-xs text-purple-300 mt-1">Multi-campus university networks</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">{prices.ENTERPRISE[currency]}</span>
                <span className="ml-2 text-xs text-slate-400">{prices.ENTERPRISE.subtext}</span>
              </div>
              <p className="text-xs text-purple-300 font-medium mt-1">Dedicated DB sharding & custom SLA</p>

              <div className="my-6 border-t border-slate-700" />

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5 font-medium text-white">
                  <Database className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Dynamic Dedicated Database Routing (Dedicated HikariCP Pool)</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium text-white">
                  <Server className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Zero-Downtime Tenant Migration Engine</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Kernel-Level SEB Proctoring with Process Lockdown</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Branded document watermark removal</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Automated native S3 disaster recovery streaming</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>24/7 dedicated enterprise reliability engineer & 99.99% SLA</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <Button
                onClick={() => handleCta('ENTERPRISE')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 text-xs rounded-xl shadow-lg"
              >
                Deploy Enterprise Infrastructure
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

        </div>

        {/* Feature Entitlement Summary Table */}
        <div className="mt-16 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 sm:p-8">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Security & Entitlement Matrix
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Capability</th>
                  <th className="pb-3 text-center">Starter Trial</th>
                  <th className="pb-3 text-center">Pro</th>
                  <th className="pb-3 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 font-medium">Tenant Data Architecture</td>
                  <td className="py-3 text-center text-slate-400">Shared Multi-Tenant (RLS)</td>
                  <td className="py-3 text-center text-indigo-300 font-medium">Shared Multi-Tenant (RLS)</td>
                  <td className="py-3 text-center text-purple-300 font-bold">Dedicated Database Shard</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Safe Exam Browser (SEB) Lockdown</td>
                  <td className="py-3 text-center text-slate-500">—</td>
                  <td className="py-3 text-center text-emerald-400 font-semibold">Included</td>
                  <td className="py-3 text-center text-emerald-400 font-semibold">High-Sec Configured</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Automated S3 Disaster Recovery</td>
                  <td className="py-3 text-center text-slate-500">—</td>
                  <td className="py-3 text-center text-slate-300">Daily Snapshots</td>
                  <td className="py-3 text-center text-purple-300 font-bold">Real-time GZIP Stream</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">B2B Recurring Billing Engine</td>
                  <td className="py-3 text-center text-slate-400">14-Day Auto-Expiry</td>
                  <td className="py-3 text-center text-indigo-300">Razorpay Recurring</td>
                  <td className="py-3 text-center text-purple-300">Razorpay / Invoiced PO</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Uptime Guarantee</td>
                  <td className="py-3 text-center text-slate-400">Standard Best-Effort</td>
                  <td className="py-3 text-center text-slate-300">99.9% Uptime</td>
                  <td className="py-3 text-center text-purple-300 font-bold">99.99% Financial SLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
