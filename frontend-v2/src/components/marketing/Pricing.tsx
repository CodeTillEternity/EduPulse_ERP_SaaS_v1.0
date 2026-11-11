import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
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
      subtext: '14-day full access evaluation'
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
    <section id="pricing" className="py-24 sm:py-32 bg-zinc-50/60 border-t border-zinc-200/80 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
            <Zap className="h-3.5 w-3.5" />
            Predictable Institutional Licensing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Predictable Tiers for Every Institution
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Scalable multi-tenant architecture with PostgreSQL Row-Level Security isolation, dynamic database routing, and tiered feature entitlements.
          </p>

          {/* Clean Segmented Controls */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {/* Billing cycle toggle */}
            <div className="bg-zinc-200/70 p-1 rounded-xl flex items-center border border-zinc-300/60 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>Annual</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Currency toggle */}
            <div className="bg-zinc-200/70 p-1 rounded-xl flex items-center border border-zinc-300/60 shadow-inner">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currency === 'INR' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                INR (₹)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currency === 'USD' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* TIER 1: FREE TRIAL */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl border border-zinc-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Starter Evaluation</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Self-serve institutional trial</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">{prices.TRIAL[currency]}</span>
                <span className="ml-2 text-xs text-zinc-500 font-medium">/ 14 days</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-1">Autonomous setup • No payment required</p>

              <div className="my-6 border-t border-zinc-100" />

              <ul className="space-y-3.5 text-xs text-zinc-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Up to 100 students & 15 faculty accounts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Academics, Biometric Attendance & Fee Ledgers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>PostgreSQL Row-Level Security (RLS) isolation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Dual-Factor reset & security audit log</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-400">
                  <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <span className="line-through">Safe Exam Browser OS Lockdown</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-400">
                  <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <span className="line-through">Dedicated Database Routing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <Button
                onClick={() => handleCta('TRIAL')}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 font-semibold py-2.5 text-xs rounded-xl transition"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2 text-zinc-600" />
              </Button>
            </div>
          </motion.div>

          {/* TIER 2: PRO (Featured) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-indigo-600 p-8 flex flex-col justify-between relative shadow-lg text-left"
          >
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </span>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Pro Institution</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Colleges & established schools</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Zap className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">{prices.PRO[currency]}</span>
                <span className="ml-2 text-xs text-zinc-500 font-medium">{prices.PRO.subtext}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-1">Razorpay recurring B2B invoicing</p>

              <div className="my-6 border-t border-zinc-100" />

              <ul className="space-y-3.5 text-xs text-zinc-800">
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Unlimited student enrollment & faculty staff</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Safe Exam Browser (SEB) OS proctoring keys</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Custom institution subdomain & white-label branding</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Automated daily S3 backup snapshots</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Razorpay student fee payment portal</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Prometheus APM metrics & uptime monitoring</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <Button
                onClick={() => handleCta('PRO')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 text-xs rounded-xl shadow-sm transition"
              >
                Get Started with Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* TIER 3: ENTERPRISE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl border border-zinc-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Enterprise High-Sec</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Multi-campus university systems</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600">
                  <Database className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">{prices.ENTERPRISE[currency]}</span>
                <span className="ml-2 text-xs text-zinc-500 font-medium">{prices.ENTERPRISE.subtext}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-1">Dedicated DB sharding & custom SLA</p>

              <div className="my-6 border-t border-zinc-100" />

              <ul className="space-y-3.5 text-xs text-zinc-700">
                <li className="flex items-start gap-2.5 font-medium text-zinc-900">
                  <Database className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated HikariCP Database Pool Routing (Add-on Available)</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium text-zinc-900">
                  <Server className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Zero-Downtime Tenant Migration Tooling</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Safe Exam Browser (SEB) Assessment Integration</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Branded document watermark removal</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Automated database backup pipeline</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Direct technical onboarding & enterprise support SLA</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <Button
                onClick={() => handleCta('ENTERPRISE')}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 font-semibold py-2.5 text-xs rounded-xl transition"
              >
                Deploy Enterprise Infrastructure
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

        </div>

        {/* Feature Entitlement Summary Table */}
        <div className="mt-16 bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 text-left">
          <h4 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Security & Entitlement Matrix
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-3">Capability</th>
                  <th className="py-3 px-3 text-center">Starter Trial</th>
                  <th className="py-3 px-3 text-center font-bold text-indigo-700">Pro</th>
                  <th className="py-3 px-3 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr>
                  <td className="py-3.5 px-3 font-medium text-zinc-900">Tenant Data Architecture</td>
                  <td className="py-3.5 px-3 text-center text-zinc-600">Shared Multi-Tenant (RLS)</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-900">Shared Multi-Tenant (RLS)</td>
                  <td className="py-3.5 px-3 text-center font-bold text-indigo-700">Dedicated Pool Add-on Ready</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-zinc-900">Safe Exam Browser (SEB) Profiles</td>
                  <td className="py-3.5 px-3 text-center text-zinc-400">—</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-emerald-700">XML Profile Generation</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-emerald-700">Custom Exam Key Enforcement</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-zinc-900">Automated S3 Disaster Recovery</td>
                  <td className="py-3.5 px-3 text-center text-zinc-400">—</td>
                  <td className="py-3.5 px-3 text-center font-medium">Daily Snapshots</td>
                  <td className="py-3.5 px-3 text-center font-bold text-indigo-700">Continuous Backup Stream</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-zinc-900">B2B Recurring Billing Engine</td>
                  <td className="py-3.5 px-3 text-center text-zinc-600">14-Day Evaluation</td>
                  <td className="py-3.5 px-3 text-center font-medium">Razorpay Recurring</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-900">Razorpay / Invoiced PO</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-zinc-900">Technical Support</td>
                  <td className="py-3.5 px-3 text-center text-zinc-600">Community & Docs</td>
                  <td className="py-3.5 px-3 text-center font-medium">Priority Email Support</td>
                  <td className="py-3.5 px-3 text-center font-bold text-indigo-700">Dedicated Account Manager</td>
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
