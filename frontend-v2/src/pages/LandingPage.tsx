import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Pricing } from '../components/marketing/Pricing';
import { ProvisioningTerminal } from '../components/marketing/ProvisioningTerminal';
import { DashboardMockup } from '../components/marketing/DashboardMockup';
import { ProctoringWidget } from '../components/marketing/ProctoringWidget';
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
  HardDrive
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      {/* 1. Top Announcement Bar */}
      <div className="bg-zinc-950 text-zinc-400 py-2 px-4 text-xs font-medium text-center border-b border-white/5 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
        <span>EduPulse SaaS V1.4 • Safe Exam Browser (SEB) OS Lockdown & Dedicated Database Routing</span>
        <button 
          onClick={() => navigate('/onboard')}
          className="underline font-bold text-white hover:text-zinc-300 transition ml-1"
        >
          Start 14-Day Free Trial →
        </button>
      </div>

      {/* 2. Header & Navigation (Glassmorphism & Tight Typography) */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/75 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-white/20 transition">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                  EduPulse <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 font-bold tracking-widest border border-white/10">SaaS</span>
                </span>
                <span className="text-[10px] text-zinc-400 hidden sm:inline uppercase tracking-widest font-medium">Institutional Control Plane</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
              <a href="#hero" className="hover:text-white transition-colors">Overview</a>
              <a href="#seb-proctoring" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-zinc-500" />
                SEB Proctoring
              </a>
              <a href="#data-isolation" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Database className="w-3 h-3 text-zinc-500" />
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
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl transition"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5 text-zinc-950" />
                  My Dashboard ({user?.role})
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs font-medium"
                  >
                    User Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/onboard')}
                    className="bg-violet-200 hover:bg-white text-zinc-950 font-semibold text-xs rounded-xl transition shadow-sm"
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
                className="text-zinc-300"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0A0A] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-xs font-semibold text-zinc-400">
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
                className="w-full justify-center bg-violet-200 text-zinc-950 hover:bg-white font-semibold text-xs rounded-xl"
              >
                Start 14-Day Free Trial
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full justify-center border-white/10 text-white hover:bg-white/[0.06] font-semibold text-xs rounded-xl"
              >
                ERP Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section (Near-Black Background, Glowing Mesh Gradient) */}
      <section id="hero" className="relative overflow-hidden bg-[#0A0A0A] py-24 lg:py-36 border-b border-white/5">
        {/* Soft Ambient Mesh Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,rgba(10,10,10,0)_70%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[700px] h-[400px] bg-white/[0.02] blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Tracked-Tight Geist Typography & High-Contrast CTAs */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.05,
                  },
                },
              }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md text-zinc-400 text-xs font-semibold tracking-wide"
              >
                <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                SaaS V1.4 • Autonomous Multi-Tenant Architecture
              </motion.div>

              <motion.h1 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-50 tracking-tighter leading-[1.06]"
              >
                Next-Gen Institutional ERP with <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-50 via-zinc-200 to-zinc-400">Kernel-Level Exam Proctoring</span> & Cryptographic Isolation.
              </motion.h1>

              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal max-w-xl"
              >
                Empower universities, colleges, and schools with autonomous tenant self-provisioning, Safe Exam Browser (SEB) OS lockdown, Razorpay B2B subscription billing, and dynamic dedicated database routing.
              </motion.p>

              {/* Hero CTAs with Magnetic Hover States */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="pt-2 flex flex-wrap items-center gap-3.5"
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/onboard')}
                    className="bg-violet-200 hover:bg-white text-zinc-950 font-semibold px-7 h-11 text-xs rounded-xl transition shadow-sm"
                  >
                    <Zap className="h-4 w-4 mr-2 text-zinc-950" />
                    Start 14-Day Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById('pricing');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="border-white/10 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md text-white font-semibold h-11 px-6 text-xs rounded-xl transition"
                  >
                    Explore Pricing & Tiers
                  </Button>
                </motion.div>

                <Button 
                  size="lg" 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="text-zinc-400 hover:text-white hover:bg-white/[0.06] font-medium h-11 px-4 text-xs"
                >
                  Sign In to Existing Tenant
                </Button>
              </motion.div>

              {/* Micro-trust line */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { delay: 0.4 } },
                }}
                className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500 font-medium flex-wrap"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  Zero Cross-Tenant Leakage
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  SEB Kiosk Lockdown
                </span>
                <span>•</span>
                <span>Autonomous Setup &lt; 60s</span>
              </motion.div>
            </motion.div>

            {/* Right Column: Clerk-Style Live Interactive Provisioning Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative w-full"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-white/[0.02] to-white/[0.04] rounded-3xl blur-2xl pointer-events-none" />
              <ProvisioningTerminal />
            </motion.div>

          </div>

          {/* Metrics Ribbon with Monochromatic Metallic Numbers */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-white/5"
          >
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-white/10 transition">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">99.99%</div>
              <div className="text-xs font-medium text-zinc-400 mt-1">SLA Reliability</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-white/10 transition">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">100%</div>
              <div className="text-xs font-medium text-zinc-400 mt-1">RLS Isolation</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-white/10 transition">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">Zero</div>
              <div className="text-xs font-medium text-zinc-400 mt-1">Cross-Tenant Leakage</div>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-white/10 transition">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">50K+</div>
              <div className="text-xs font-medium text-zinc-400 mt-1">Secure Exam Sessions</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Apple-Style Bento Grid Architecture */}
      <section id="features" className="py-28 bg-[#0A0A0A] border-b border-white/5 relative overflow-hidden font-sans">
        {/* Soft Ambient Mesh Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,rgba(10,10,10,0)_75%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header with Apple-Style Punchy Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-zinc-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              Surgical Precision • Uncompromising Integrity
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-zinc-50 tracking-tighter leading-tight">
              Hardware-Level Security. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-50 via-zinc-200 to-zinc-400">
                Mathematical Multi-Tenancy.
              </span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Every system boundary is enforced at the physical, kernel, and database layers — delivering unbreachable exam integrity and absolute tenant data isolation.
            </p>
          </motion.div>

          {/* Bento Box Grid with Scroll-Linked Reveals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Large Asymmetrical Hero Card: SEB Proctoring (Spans 3 columns on lg) */}
            <motion.div 
              id="seb-proctoring"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-3 bg-[#111111]/80 border border-white/5 rounded-3xl p-8 sm:p-10 relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              {/* Subtle background radial glow */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none transition-colors" />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-semibold mb-3">
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      Anti-Cheat Technology
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-zinc-50 tracking-tight leading-snug">
                      Safe Exam Browser OS Lockdown. <br />
                      <span className="text-zinc-300">Total Kiosk Sandboxing.</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl">
                      Eliminate digital exam fraud at the operating system root. EduPulse generates cryptographic SEB configuration keys that force student client machines into locked kiosk mode — severing secondary displays, neutralizing clipboard access, and blocking virtual machine hypervisors.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-auto">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/onboard?tier=PRO')}
                        className="bg-violet-200 hover:bg-white text-zinc-950 font-semibold text-xs h-8 px-4 rounded-xl transition shadow-sm"
                      >
                        Test Drive SEB Mode →
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Live Biometric & OS Hardware Lockdown Widget */}
                <ProctoringWidget />
              </div>
            </motion.div>

            {/* 2. Bento Card: PostgreSQL RLS Cryptographic Isolation (Attio-Style Live Data Grid) */}
            <motion.div 
              id="data-isolation" 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-3 bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] space-y-6"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl pointer-events-none transition-colors" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-semibold">
                    <Database className="w-3.5 h-3.5 text-zinc-400" />
                    Row-Level Security (RLS) Engine
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-zinc-50 tracking-tight leading-snug">
                    Cryptographic Multi-Tenancy. <br />
                    <span className="text-zinc-300">Mathematical Isolation.</span>
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                    Kernel-level row isolation via PostgreSQL Row-Level Security. Switch institutions using the interactive dropdown below to watch the database runtime isolate student ledger records with zero cross-tenant bleeding.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto font-mono text-[11px] text-zinc-400 bg-white/[0.03] px-3 py-2 rounded-xl border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  <span>Isolation Proof: 100% Active</span>
                </div>
              </div>

              {/* The Live Attio-Style Data Grid Showcase */}
              <DashboardMockup />
            </motion.div>

            {/* 3. Bento Card: Spring Boot Dynamic DB Routing */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-all duration-500 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-2xl pointer-events-none transition-colors" />

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Dynamic Sharding</span>
                  <h3 className="text-xl font-bold text-zinc-50 tracking-tight mt-1">Dedicated DB Pools.</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-2">
                    AbstractRoutingDataSource dynamically swaps connection pools at runtime. High-throughput Enterprise tenants route to dedicated HikariCP clusters with zero downtime.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono">
                  <span>EduPulseHikariCP-vip-1</span>
                  <span className="text-zinc-300 font-bold">100% ISOLATED</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-zinc-500 to-zinc-300 h-full w-full rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* 4. Bento Card: Automated S3 Native Disaster Recovery */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-all duration-500 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-2xl pointer-events-none transition-colors" />

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Continuous DR</span>
                  <h3 className="text-xl font-bold text-zinc-50 tracking-tight mt-1">Automated S3 Recovery.</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-2">
                    Streaming pg_dump pipelines compress and upload tenant backups to encrypted AWS S3 buckets with automated lifecycle retention and instant point-in-time recovery.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-[#0A0A0A] p-3 rounded-xl border border-white/5">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
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
              className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-all duration-500 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-2xl pointer-events-none transition-colors" />

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Institutional Commerce</span>
                  <h3 className="text-xl font-bold text-zinc-50 tracking-tight mt-1">Autonomous B2B Billing.</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-2">
                    RBI-compliant Razorpay recurring subscriptions with automatic tenant trial-to-paid transitions, tiered feature entitlement locks, and webhook-driven account lifecycles.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[11px] font-mono text-zinc-300 bg-white/[0.02] p-3 rounded-xl border border-white/10">
                <span>Webhook: subscription.charged</span>
                <span className="text-zinc-300 font-bold">ACTIVE</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. Embedded Pricing Section */}
      <Pricing />

      {/* 6. Institutional FAQ & Compliance Section */}
      <section id="faq" className="py-24 bg-[#0A0A0A] border-t border-white/5 relative font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 text-xs font-semibold">
              Procurement & Compliance
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-zinc-50 tracking-tight">Frequently Asked Questions</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">Key answers for university CIOs, registrars, and IT procurement committees.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-400">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-2 hover:border-white/10 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <h4 className="font-bold text-zinc-50 text-sm">How does the 14-day free trial work?</h4>
              <p className="text-zinc-400 leading-relaxed">
                When you sign up via the autonomous onboarding wizard, EduPulse immediately creates your institution's tenant namespace, registers your custom subdomain, and provisions a SUPERADMIN user. No payment info is required.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-2 hover:border-white/10 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <h4 className="font-bold text-zinc-50 text-sm">How is billing handled after the trial?</h4>
              <p className="text-zinc-400 leading-relaxed">
                We support RBI-compliant Razorpay recurring B2B billing for cards, netbanking, and corporate mandate transactions. Enterprise clients can also opt for annual purchase order (PO) invoicing.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-2 hover:border-white/10 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <h4 className="font-bold text-zinc-50 text-sm">Can we migrate from Shared to Dedicated DB later?</h4>
              <p className="text-zinc-400 leading-relaxed">
                Yes! Our automated Tenant Migration Engine allows Super Admins to migrate all institutional schema and data to a dedicated database instance with zero data loss.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="bg-[#111111]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-2 hover:border-white/10 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <h4 className="font-bold text-zinc-50 text-sm">Are students required to install software for exams?</h4>
              <p className="text-zinc-400 leading-relaxed">
                For Safe Exam Browser (SEB) proctored tests, students download the open-source SEB client for Windows/macOS/iOS. EduPulse provides a 1-click encrypted config launcher for instant exam entry.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner with Magnetic Interaction */}
      <section className="py-20 bg-gradient-to-b from-[#0A0A0A] via-[#111118] to-[#0A0A0A] text-white text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[140px] rounded-full pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="max-w-4xl mx-auto px-4 space-y-6 relative z-10"
        >
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-50 tracking-tight leading-tight drop-shadow-sm">
            Ready to Modernize Your Institution's Operations?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
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
                className="bg-violet-200 hover:bg-white text-zinc-950 font-semibold px-8 h-12 rounded-xl text-xs transition shadow-sm"
              >
                Start 14-Day Free Institutional Trial →
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/5 py-8 text-center text-xs text-zinc-400">
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
