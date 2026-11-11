import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Pricing } from '../components/marketing/Pricing';
import { 
  GraduationCap, 
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Database, 
  Lock, 
  Server, 
  Zap, 
  HardDrive,
  Key,
  ShieldAlert
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950/60 to-[#0A0A0A] text-indigo-200 py-2 px-4 text-xs font-medium text-center border-b border-white/[0.08] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>EduPulse SaaS V1.4 • Safe Exam Browser (SEB) OS Lockdown & Dedicated Database Routing</span>
        <button 
          onClick={() => navigate('/onboard')}
          className="underline font-bold text-white hover:text-indigo-300 transition ml-1"
        >
          Start 14-Day Free Trial →
        </button>
      </div>

      {/* 2. Header & Navigation (Glassmorphism & Tight Typography) */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/75 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center shadow-glow-subtle group-hover:border-white/[0.24] transition">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                  EduPulse <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/[0.08] text-indigo-300 font-bold tracking-widest border border-white/[0.08]">SaaS</span>
                </span>
                <span className="text-[10px] text-[#8E8E93] hidden sm:inline uppercase tracking-widest font-medium">Institutional Control Plane</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#8E8E93]">
              <a href="#hero" className="hover:text-white transition-colors">Overview</a>
              <a href="#seb-proctoring" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-400" />
                SEB Proctoring
              </a>
              <a href="#data-isolation" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400" />
                Multi-Tenant Isolation
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">Commercial Plans</a>
              <a href="#faq" className="hover:text-white transition-colors">Compliance</a>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-white hover:bg-slate-200 text-black font-semibold text-xs rounded-xl shadow-glow-subtle transition"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                  My Dashboard ({user?.role})
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="text-[#8E8E93] hover:text-white hover:bg-white/[0.06] text-xs font-medium"
                  >
                    User Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/onboard')}
                    className="bg-white hover:bg-slate-200 text-black font-bold text-xs rounded-xl shadow-glow-subtle transition"
                  >
                    Start 14-Day Trial
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="text-slate-300"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0A0A] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-xs font-semibold text-[#8E8E93]">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.06]">
                Overview
              </a>
              <a href="#seb-proctoring" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.06]">
                Safe Exam Browser (SEB) Lockdown
              </a>
              <a href="#data-isolation" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.06]">
                Multi-Tenant Data Isolation
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.06]">
                Pricing & Plans
              </a>
            </nav>
            <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2.5">
              <Button 
                onClick={() => { setMobileMenuOpen(false); navigate('/onboard'); }}
                className="w-full justify-center bg-white text-black hover:bg-slate-200 font-bold text-xs rounded-xl"
              >
                Start 14-Day Free Trial
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full justify-center border-white/[0.12] text-white hover:bg-white/[0.06] font-semibold text-xs rounded-xl"
              >
                ERP Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section (Near-Black Background, Glowing Mesh Gradient) */}
      <section id="hero" className="relative overflow-hidden bg-[#0A0A0A] py-24 lg:py-36 border-b border-white/[0.06]">
        {/* Glowing Mesh Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18)_0%,rgba(10,10,10,0)_65%)] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.05,
                },
              },
            }}
            className="text-center max-w-4xl mx-auto space-y-6"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-indigo-300 text-xs font-semibold tracking-wide shadow-glow-subtle"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              SaaS V1.4 • Autonomous Multi-Tenant Architecture
            </motion.div>

            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.08]"
            >
              Next-Gen Institutional ERP with <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">Kernel-Level Exam Proctoring</span> & Cryptographic Isolation.
            </motion.h1>

            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="text-sm sm:text-lg text-[#8E8E93] leading-relaxed max-w-3xl mx-auto font-normal"
            >
              Empower universities, colleges, and schools with autonomous tenant self-provisioning, Safe Exam Browser (SEB) OS lockdown, Razorpay B2B subscription billing, and dynamic dedicated database routing.
            </motion.p>

            {/* Hero CTAs with Magnetic Hover States */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/onboard')}
                  className="w-full sm:w-auto bg-white hover:bg-slate-200 text-black font-bold shadow-glow-card px-8 h-12 text-xs rounded-xl transition"
                >
                  <Zap className="h-4 w-4 mr-2 text-indigo-600" />
                  Start 14-Day Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('pricing');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md text-white font-semibold h-12 px-7 text-xs rounded-xl transition"
                >
                  Explore Pricing & Tiers
                </Button>
              </motion.div>

              <Button 
                size="lg" 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto text-[#8E8E93] hover:text-white hover:bg-white/[0.06] font-medium h-12 px-5 text-xs"
              >
                Sign In to Existing Tenant
              </Button>
            </motion.div>
          </motion.div>

          {/* Metrics Ribbon with Framer Motion Staggered Fade */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-white/[0.06]"
          >
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 text-center shadow-glass hover:border-white/[0.16] transition">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">99.99%</div>
              <div className="text-xs font-medium text-[#8E8E93] mt-1">SLA Reliability</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 text-center shadow-glass hover:border-white/[0.16] transition">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">100%</div>
              <div className="text-xs font-medium text-[#8E8E93] mt-1">RLS Isolation</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 text-center shadow-glass hover:border-white/[0.16] transition">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tight">Zero</div>
              <div className="text-xs font-medium text-[#8E8E93] mt-1">Cross-Tenant Leakage</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 text-center shadow-glass hover:border-white/[0.16] transition">
              <div className="text-3xl sm:text-4xl font-black text-purple-400 tracking-tight">50K+</div>
              <div className="text-xs font-medium text-[#8E8E93] mt-1">Secure Exam Sessions</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Apple-Style Bento Grid Architecture */}
      <section id="features" className="py-28 bg-[#0A0A0A] border-b border-white/[0.08] relative overflow-hidden font-sans">
        {/* Glow ambient mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,rgba(10,10,10,0)_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header with Apple-Style Punchy Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-amber-300 text-xs font-semibold tracking-wide shadow-glow-subtle">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Surgical Precision • Uncompromising Integrity
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-tight">
              Hardware-Level Security. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                Mathematical Multi-Tenancy.
              </span>
            </h2>
            <p className="text-[#8E8E93] text-sm sm:text-base leading-relaxed">
              Every system boundary is enforced at the physical, kernel, and database layers — delivering unbreachable exam integrity and absolute tenant data isolation.
            </p>
          </motion.div>

          {/* Bento Box Grid with Scroll-Linked Reveals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Large Asymmetrical Hero Card: SEB Proctoring (Spans 2 columns on lg) */}
            <motion.div 
              id="seb-proctoring"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 bg-gradient-to-br from-[#121217] via-[#0E0E12] to-[#0A0A0E] border border-white/[0.08] rounded-3xl p-8 sm:p-10 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 shadow-glass"
            >
              {/* Subtle background radial glow */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/[0.07] rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/[0.12] transition-colors" />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Anti-Cheat Technology
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] border border-white/[0.08] px-2.5 py-1 rounded-full bg-white/[0.02]">
                      Zero Trust Client
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    Safe Exam Browser OS Lockdown. <br />
                    <span className="text-amber-200">Total Kiosk Sandboxing.</span>
                  </h3>
                  <p className="text-[#8E8E93] text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl">
                    Eliminate digital exam fraud at the operating system root. EduPulse generates cryptographic SEB configuration keys that force student client machines into locked kiosk mode — severing secondary displays, neutralizing clipboard access, and blocking virtual machine hypervisors.
                  </p>
                </div>

                {/* Simulated Kiosk HUD Mockup */}
                <div className="bg-[#0A0A0A]/90 border border-white/[0.08] rounded-2xl p-5 font-mono text-xs space-y-4 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="ml-2 text-[11px] text-[#8E8E93] font-mono">SEB_Kiosk_Process.sys [LOCKED]</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      TELEMETRY SYNCED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-400" />
                        Cryptographic Hash Handshake
                      </div>
                      <div className="text-[#8E8E93] truncate text-[10px]">sha256:9f83ac027b4011e403d91782e4f014e6e0d9b62f</div>
                      <div className="text-emerald-400 font-semibold text-[10px] mt-1">ConfigKey Signature Verified</div>
                    </div>

                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <div className="text-amber-300 font-semibold mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        OS Guardrail State
                      </div>
                      <div className="text-[#8E8E93] text-[10px] space-y-0.5">
                        <div className="flex justify-between"><span>Secondary Displays:</span> <span className="text-rose-400 font-bold">DISABLED</span></div>
                        <div className="flex justify-between"><span>Clipboard Buffer:</span> <span className="text-rose-400 font-bold">WIPED</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8E8E93] pt-1">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Proctor Heartbeat: 14ms latency
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/onboard?tier=PRO')}
                        className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs h-7 px-3 rounded-lg"
                      >
                        Test Drive SEB Mode →
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Bento Card: PostgreSQL RLS Cryptographic Isolation */}
            <motion.div 
              id="data-isolation" 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-500 flex flex-col justify-between shadow-glass"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.06] rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/[0.12] transition-colors" />

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold">Row-Level Security</span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">Mathematical Isolation.</h3>
                  <p className="text-[#8E8E93] text-xs leading-relaxed mt-2">
                    Kernel-level row isolation via PostgreSQL RLS. Every database query guarantees zero cross-tenant row exposure even if an attacker executes arbitrary SQL injections.
                  </p>
                </div>
              </div>

              {/* Terminal Snippet */}
              <div className="mt-6 bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-3.5 font-mono text-[11px] text-[#8E8E93] space-y-1">
                <div className="text-indigo-400">SET app.tenant_id = 'harvard';</div>
                <div className="text-white">SELECT count(*) FROM users;</div>
                <div className="text-emerald-400 text-[10px] mt-1">↳ Result: 3,420 rows (0 leak)</div>
              </div>
            </motion.div>

            {/* 3. Bento Card: Spring Boot Dynamic DB Routing */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-500 flex flex-col justify-between shadow-glass"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/[0.06] rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/[0.12] transition-colors" />

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-semibold">Dynamic Sharding</span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">Dedicated DB Pools.</h3>
                  <p className="text-[#8E8E93] text-xs leading-relaxed mt-2">
                    AbstractRoutingDataSource dynamically swaps connection pools at runtime. High-throughput Enterprise tenants route to dedicated HikariCP clusters with zero downtime.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl">
                <div className="flex items-center justify-between text-[11px] text-purple-300 font-mono">
                  <span>EduPulseHikariCP-vip-1</span>
                  <span className="text-emerald-400 font-bold">100% ISOLATED</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-full rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* 4. Bento Card: Automated S3 Native Disaster Recovery */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 flex flex-col justify-between shadow-glass"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.06] rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/[0.12] transition-colors" />

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">Continuous DR</span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">Automated S3 Recovery.</h3>
                  <p className="text-[#8E8E93] text-xs leading-relaxed mt-2">
                    Streaming pg_dump pipelines compress and upload tenant backups to encrypted AWS S3 buckets with automated lifecycle retention and instant point-in-time recovery.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[11px] font-mono text-[#8E8E93] bg-[#0A0A0A] p-3 rounded-xl border border-white/[0.06]">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  RPO &lt; 5m • RTO &lt; 15m
                </span>
                <span className="text-white font-bold">AES-256</span>
              </div>
            </motion.div>

            {/* 5. Bento Card: Razorpay B2B Autonomous Commerce */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111111]/80 backdrop-blur-md border border-white/[0.08] rounded-3xl p-8 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-500 flex flex-col justify-between shadow-glass"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/[0.06] rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/[0.12] transition-colors" />

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">Institutional Commerce</span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">Autonomous B2B Billing.</h3>
                  <p className="text-[#8E8E93] text-xs leading-relaxed mt-2">
                    RBI-compliant Razorpay recurring subscriptions with automatic tenant trial-to-paid transitions, tiered feature entitlement locks, and webhook-driven account lifecycles.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
                <span>Webhook: subscription.charged</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. Embedded Pricing Section */}
      <Pricing />

      {/* 6. Institutional FAQ & Compliance Section */}
      <section id="faq" className="py-24 bg-[#0A0A0A] border-t border-white/[0.08] relative font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-indigo-300 text-xs font-semibold">
              Procurement & Compliance
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Frequently Asked Questions</h3>
            <p className="text-xs sm:text-sm text-[#8E8E93] max-w-xl mx-auto">Key answers for university CIOs, registrars, and IT procurement committees.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#8E8E93]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] space-y-2 hover:border-white/[0.16] transition"
            >
              <h4 className="font-bold text-white text-sm">How does the 14-day free trial work?</h4>
              <p className="text-[#8E8E93] leading-relaxed">
                When you sign up via the autonomous onboarding wizard, EduPulse immediately creates your institution's tenant namespace, registers your custom subdomain, and provisions a SUPERADMIN user. No payment info is required.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] space-y-2 hover:border-white/[0.16] transition"
            >
              <h4 className="font-bold text-white text-sm">How is billing handled after the trial?</h4>
              <p className="text-[#8E8E93] leading-relaxed">
                We support RBI-compliant Razorpay recurring B2B billing for cards, netbanking, and corporate mandate transactions. Enterprise clients can also opt for annual purchase order (PO) invoicing.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] space-y-2 hover:border-white/[0.16] transition"
            >
              <h4 className="font-bold text-white text-sm">Can we migrate from Shared to Dedicated DB later?</h4>
              <p className="text-[#8E8E93] leading-relaxed">
                Yes! Our automated Tenant Migration Engine allows Super Admins to migrate all institutional schema and data to a dedicated database instance with zero data loss.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] space-y-2 hover:border-white/[0.16] transition"
            >
              <h4 className="font-bold text-white text-sm">Are students required to install software for exams?</h4>
              <p className="text-[#8E8E93] leading-relaxed">
                For Safe Exam Browser (SEB) proctored tests, students download the open-source SEB client for Windows/macOS/iOS. EduPulse provides a 1-click encrypted config launcher for instant exam entry.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner with Magnetic Interaction */}
      <section className="py-20 bg-gradient-to-b from-[#0A0A0A] via-[#111118] to-[#0A0A0A] text-white text-center border-t border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="max-w-4xl mx-auto px-4 space-y-6 relative z-10"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Modernize Your Institution's Operations?
          </h2>
          <p className="text-xs sm:text-base text-[#8E8E93] max-w-2xl mx-auto">
            Join forward-thinking colleges and universities. Launch your self-serve institutional portal in less than 60 seconds.
          </p>
          <div className="pt-2">
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block"
            >
              <Button
                size="lg"
                onClick={() => navigate('/onboard')}
                className="bg-white hover:bg-slate-200 text-black font-bold px-8 h-12 rounded-xl shadow-glow-card text-xs transition"
              >
                Start 14-Day Free Institutional Trial →
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/[0.08] py-8 text-center text-xs text-[#8E8E93]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">EduPulse SaaS ERP</span>
            <span>• Commercial SaaS V1.4</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition">Back to Top</a>
            <Link to="/login" className="hover:text-white transition">Institutional Login</Link>
            <Link to="/onboard" className="hover:text-white transition">Self-Serve Onboarding</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
