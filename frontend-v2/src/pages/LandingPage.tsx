import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  HardDrive
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-indigo-100 py-2 px-4 text-xs font-medium text-center border-b border-indigo-800/50 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>EduPulse SaaS V1.4 is Live • Safe Exam Browser (SEB) OS Lockdown & Dedicated Database Sharding</span>
        <button 
          onClick={() => navigate('/onboard')}
          className="underline font-bold text-white hover:text-amber-200 transition ml-1"
        >
          Claim 14-Day Free Institutional Trial →
        </button>
      </div>

      {/* 2. Header & Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  EduPulse <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold tracking-wide border border-indigo-500/30">SaaS</span>
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline uppercase tracking-widest font-semibold">Institutional Control Plane</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#hero" className="hover:text-indigo-400 transition-colors">Overview</a>
              <a href="#seb-proctoring" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                SEB Proctoring
              </a>
              <a href="#data-isolation" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Multi-Tenant Isolation
              </a>
              <a href="#pricing" className="hover:text-indigo-400 transition-colors">Commercial Plans</a>
              <a href="#faq" className="hover:text-indigo-400 transition-colors">Compliance</a>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
                >
                  <UserCheck className="h-4 w-4 mr-2 text-amber-300" />
                  My Dashboard ({user?.role})
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold"
                  >
                    User Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/onboard')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25"
                  >
                    Start 14-Day Trial
                    <ArrowRight className="h-4 w-4 ml-1.5" />
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
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-slate-800">
                Overview
              </a>
              <a href="#seb-proctoring" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-slate-800">
                Safe Exam Browser (SEB) Lockdown
              </a>
              <a href="#data-isolation" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-slate-800">
                Multi-Tenant Data Isolation
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-lg hover:bg-slate-800">
                Pricing & Plans
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
              <Button 
                onClick={() => { setMobileMenuOpen(false); navigate('/onboard'); }}
                className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
              >
                Start 14-Day Free Trial
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full justify-center border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs"
              >
                ERP Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-slate-950 py-20 lg:py-32 border-b border-slate-900">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-semibold uppercase tracking-wider shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              SaaS V1.4 • Autonomous Multi-Tenant Architecture
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
              Next-Gen Institutional ERP with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Kernel-Level Exam Proctoring</span> & Cryptographic Isolation.
            </h1>

            <p className="text-base sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Empower universities, colleges, and schools with autonomous tenant self-provisioning, Safe Exam Browser (SEB) OS lockdown, Razorpay B2B subscription billing, and dynamic dedicated database routing.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/onboard')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-xl shadow-indigo-600/30 px-8 h-13 text-sm rounded-xl"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  const el = document.getElementById('pricing');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold h-13 px-7 text-sm rounded-xl"
              >
                Explore Pricing & Tiers
              </Button>
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-slate-900 font-medium h-13 px-5 text-sm"
              >
                Sign In to Existing Tenant
              </Button>
            </div>
          </div>

          {/* Metrics Ribbon */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-900">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-black text-white">99.99%</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">SLA Reliability</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">100%</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">RLS Cryptographic Isolation</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400">Zero</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Cross-Tenant Leakage</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-black text-purple-400">50K+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Secure Exam Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Showcase: Safe Exam Browser (SEB) OS Lockdown */}
      <section id="seb-proctoring" className="py-24 bg-slate-900 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                Anti-Cheat Technology
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Safe Exam Browser (SEB) OS Lockdown & Cryptographic Proctoring
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Eliminate digital exam fraud. EduPulse generates cryptographic SEB configuration keys that force student client machines into locked kiosk mode, preventing unauthorized apps, external monitors, or virtual machines during proctored tests.
              </p>

              <div className="space-y-3.5 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Kiosk OS Mode:</strong> Disables keyboard shortcuts (Alt+Tab, Ctrl+C, PrintScreen) and task managers.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Virtual Machine Detection:</strong> Automatically flags and blocks running under VMware, VirtualBox, or RDP.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Cryptographic Hash Handshake:</strong> Backend validates client browser config signature before admitting to exam room.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Live Audit Telemetry:</strong> Real-time alerts for window defocus or attempted clipboard injection.</span>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={() => navigate('/onboard?tier=PRO')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Experience SEB Proctoring →
                </Button>
              </div>
            </div>

            {/* Visual Simulated Mockup of SEB Mode */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 text-xs font-mono text-slate-400">SafeExamBrowser_Kiosk.exe [LOCKED]</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  ENFORCED
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-indigo-400 font-bold mb-1">// Cryptographic Hash Verification</div>
                  <div className="text-slate-400 text-[11px] truncate">ConfigKey: sha256:9f83ac027b4011e403d91782e4f014e6e0d9b62f</div>
                  <div className="text-emerald-400 text-[11px] mt-1">Status: Signature Verified • Exam Session #EX-8904 ACTIVE</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">// OS Security Guardrails</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>• Secondary Displays: <span className="text-red-400">DISABLED</span></div>
                    <div>• Clipboard Access: <span className="text-red-400">WIPED</span></div>
                    <div>• Task Manager: <span className="text-red-400">BLOCKED</span></div>
                    <div>• Network Whitelist: <span className="text-emerald-400">ISOLATED</span></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-400 text-[11px]">
                  <span className="text-purple-400 font-bold">Proctor Heartbeat:</span> Synchronized with Spring Boot event bus (latency: 18ms).
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Showcase: Multi-Tenant Data Isolation & Dedicated DB Routing */}
      <section id="data-isolation" className="py-24 bg-slate-950 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Visual Architecture Diagram */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 order-2 lg:order-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Dynamic AbstractRoutingDataSource
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  Spring Boot 3.3
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Router Node */}
                <div className="p-3 bg-indigo-950/40 border border-indigo-700/50 rounded-xl">
                  <div className="font-bold text-indigo-300">TenantRoutingDataSource (ThreadLocal)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Intercepts tenantId header & resolves databaseRoutingKey from Redis</div>
                </div>

                {/* Branches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Shared Multi-Tenant</span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">TRIAL / PRO</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">PostgreSQL Row-Level Security (RLS) enforcement at connection level.</p>
                  </div>

                  <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-700/60">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-200 text-xs">Dedicated Database</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">ENTERPRISE</span>
                    </div>
                    <p className="text-[11px] text-purple-300 mt-1">Independent HikariCP pool (`EduPulseHikariCP-vip-1`) & physical storage.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Automated 5-step tenant migration with zero data loss or connection thread bleeding.</span>
                </div>
              </div>
            </div>

            {/* Text description */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Database className="w-3.5 h-3.5" />
                Military-Grade Isolation
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Multi-Tenant Data Isolation & Dynamic Connection Routing
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                EduPulse guarantees absolute tenant boundary safety. Standard tenants enjoy PostgreSQL Row-Level Security (RLS) with connection pool thread confinement, while Enterprise clients get dynamically routed to dedicated physical database shards.
              </p>

              <div className="space-y-3.5 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Cryptographic RLS Boundary:</strong> Hardware-level mathematical proof that Tenant A can never read Tenant B rows.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>HikariCP Pool Confinement:</strong> Wipes ThreadLocal tenant context in `finally` blocks, eliminating pool bleed.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Automated S3 Disaster Recovery:</strong> Streaming native pg_dump backups with automated S3 lifecycle rotation.</span>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={() => navigate('/onboard?tier=ENTERPRISE')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Request Dedicated DB Shard →
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Embedded Pricing Section */}
      <Pricing />

      {/* 7. Institutional FAQ & Compliance Section */}
      <section id="faq" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
            <p className="text-sm text-slate-400 mt-2">Answers to common institutional and procurement inquiries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">How does the 14-day free trial work?</h4>
              <p className="text-slate-400 leading-relaxed">
                When you sign up via the autonomous onboarding wizard, EduPulse immediately creates your institution's tenant namespace, registers your custom subdomain, and provisions a SUPERADMIN user. No payment info is required.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">How is billing handled after the trial?</h4>
              <p className="text-slate-400 leading-relaxed">
                We support RBI-compliant Razorpay recurring B2B billing for both card, netbanking, and corporate mandate transactions. Enterprise clients can also opt for annual purchase order (PO) invoicing.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">Can we migrate from Shared to Dedicated DB later?</h4>
              <p className="text-slate-400 leading-relaxed">
                Yes! Our automated Tenant Migration Engine allows Super Admins to migrate all institutional schema and data to a dedicated database instance with zero data loss.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">Are students required to install software for exams?</h4>
              <p className="text-slate-400 leading-relaxed">
                For Safe Exam Browser (SEB) proctored tests, students download the open-source SEB client for Windows/macOS/iOS. EduPulse provides a 1-click encrypted config launcher for instant exam entry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white text-center border-t border-indigo-800/40">
        <div className="max-w-4xl mx-auto px-4 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Modernize Your Institution's Operations?
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-2xl mx-auto">
            Join forward-thinking colleges and universities. Launch your self-serve institutional portal in less than 60 seconds.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/onboard')}
              className="bg-white hover:bg-slate-100 text-indigo-950 font-bold px-8 py-3 rounded-xl shadow-2xl text-sm"
            >
              Start 14-Day Free Institutional Trial →
            </Button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-300">EduPulse SaaS ERP</span>
            <span>• Commercial SaaS V1.4</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-slate-400">Back to Top</a>
            <Link to="/login" className="hover:text-slate-400">Institutional Login</Link>
            <Link to="/onboard" className="hover:text-slate-400">Self-Serve Onboarding</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
