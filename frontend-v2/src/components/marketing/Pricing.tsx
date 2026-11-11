import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <section id="pricing" className="py-28 bg-[#0A0A0A] text-white relative overflow-hidden font-sans border-b border-white/5">
      {/* Soft Ambient Mesh Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,rgba(10,10,10,0)_70%)] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,rgba(10,10,10,0)_65%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-zinc-400 text-xs font-semibold tracking-wide">
            <Zap className="h-3.5 w-3.5 text-zinc-400" />
            Institutional Commercial Licensing
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Predictable Tiers for Every Institution
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Scalable multi-tenant infrastructure with mathematical RLS isolation, dedicated database sharding, and automated compliance.
          </p>

          {/* Glassmorphic Toggle Controls */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {/* Billing cycle toggle */}
            <div className="bg-white/[0.03] backdrop-blur-md p-1 rounded-xl border border-white/10 flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-violet-200/10 text-violet-200 border border-violet-300/20 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-violet-200/10 text-violet-200 border border-violet-300/20 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="bg-white/[0.06] text-zinc-300 border border-white/10 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Currency toggle */}
            <div className="bg-white/[0.03] backdrop-blur-md p-1 rounded-xl border border-white/10 flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currency === 'INR' ? 'bg-violet-200/10 text-violet-200 border border-violet-300/20' : 'text-zinc-400 hover:text-white'
                }`}
              >
                INR (₹)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currency === 'USD' ? 'bg-violet-200/10 text-violet-200 border border-violet-300/20' : 'text-zinc-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards Grid with Framer Motion Staggered Scroll Reveals */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* TIER 1: FREE TRIAL */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 flex flex-col justify-between hover:border-white/10 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Starter Evaluation</h3>
                  <p className="text-xs text-zinc-400 mt-1">Self-serve institutional trial</p>
                </div>
                <div className="p-2 bg-white/[0.04] rounded-lg border border-white/10">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white tracking-tight">{prices.TRIAL[currency]}</span>
                <span className="ml-2 text-xs text-zinc-400">/ 14 days</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-semibold mt-1">Autonomous setup • No card required</p>

              <div className="my-6 border-t border-white/[0.06]" />

              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Up to 100 students & 15 faculty accounts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Academics, Biometric Attendance & Fee Ledgers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>PostgreSQL Row-Level Security (RLS) isolation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Dual-Factor reset & security audit log</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-40">
                  <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                  <span className="line-through">Safe Exam Browser OS Lockdown</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-40">
                  <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                  <span className="line-through">Dedicated Database Routing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => handleCta('TRIAL')}
                  className="w-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-semibold py-2.5 text-xs rounded-xl transition"
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="w-4 h-4 ml-2 text-zinc-400" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* TIER 2: PRO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col justify-between relative hover:border-white/20 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-violet-200/15 border border-violet-300/30 text-violet-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </span>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Pro Institution</h3>
                  <p className="text-xs text-zinc-400 mt-1">Colleges & established schools</p>
                </div>
                <div className="p-2 bg-white/[0.04] rounded-lg border border-white/10">
                  <Zap className="w-4 h-4 text-zinc-400" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white tracking-tight">{prices.PRO[currency]}</span>
                <span className="ml-2 text-xs text-zinc-400">{prices.PRO.subtext}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-semibold mt-1">Razorpay recurring B2B invoicing</p>

              <div className="my-6 border-t border-white/[0.06]" />

              <ul className="space-y-3.5 text-xs text-zinc-200">
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited student enrollment & faculty staff</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Safe Exam Browser (SEB) OS proctoring keys</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Custom institution subdomain & white-label colors</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Automated daily S3 backup snapshots</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Razorpay student fee payment portal</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Prometheus APM metrics & uptime dashboard</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => handleCta('PRO')}
                  className="w-full bg-violet-200 hover:bg-white text-zinc-950 font-semibold py-2.5 text-xs rounded-xl shadow-sm transition"
                >
                  Get Started with Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* TIER 3: ENTERPRISE */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 flex flex-col justify-between hover:border-white/10 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Enterprise High-Sec</h3>
                  <p className="text-xs text-zinc-400 mt-1">Multi-campus university systems</p>
                </div>
                <div className="p-2 bg-white/[0.04] rounded-lg border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-zinc-400" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-white tracking-tight">{prices.ENTERPRISE[currency]}</span>
                <span className="ml-2 text-xs text-zinc-400">{prices.ENTERPRISE.subtext}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-semibold mt-1">Dedicated DB sharding & custom SLA</p>

              <div className="my-6 border-t border-white/[0.06]" />

              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5 font-medium text-white">
                  <Database className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <span>Dedicated Database Routing (Dedicated HikariCP Pool)</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium text-white">
                  <Server className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <span>Zero-Downtime Tenant Migration Engine</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Kernel-Level SEB Proctoring with Process Lockdown</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Branded document watermark removal</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Automated native S3 disaster recovery streaming</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>24/7 dedicated enterprise reliability engineer & 99.99% SLA</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => handleCta('ENTERPRISE')}
                  className="w-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-semibold py-2.5 text-xs rounded-xl transition"
                >
                  Deploy Enterprise Infrastructure
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Feature Entitlement Summary Table with Glassmorphism */}
        <div className="mt-16 bg-[#111111]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            Security & Entitlement Matrix
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400 uppercase font-semibold">
                  <th className="pb-3">Capability</th>
                  <th className="pb-3 text-center">Starter Trial</th>
                  <th className="pb-3 text-center">Pro</th>
                  <th className="pb-3 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                <tr>
                  <td className="py-3 font-medium">Tenant Data Architecture</td>
                  <td className="py-3 text-center text-zinc-400">Shared Multi-Tenant (RLS)</td>
                  <td className="py-3 text-center text-zinc-200 font-medium">Shared Multi-Tenant (RLS)</td>
                  <td className="py-3 text-center text-white font-bold">Dedicated Database Shard</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Safe Exam Browser (SEB) Lockdown</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-zinc-200 font-semibold">Included</td>
                  <td className="py-3 text-center text-white font-semibold">High-Sec Configured</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Automated S3 Disaster Recovery</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-zinc-300">Daily Snapshots</td>
                  <td className="py-3 text-center text-white font-bold">Real-time GZIP Stream</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">B2B Recurring Billing Engine</td>
                  <td className="py-3 text-center text-zinc-400">14-Day Auto-Expiry</td>
                  <td className="py-3 text-center text-zinc-200">Razorpay Recurring</td>
                  <td className="py-3 text-center text-white font-semibold">Razorpay / Invoiced PO</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Uptime Guarantee</td>
                  <td className="py-3 text-center text-zinc-400">Standard Best-Effort</td>
                  <td className="py-3 text-center text-zinc-300">99.9% Uptime</td>
                  <td className="py-3 text-center text-white font-bold">99.99% Financial SLA</td>
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
