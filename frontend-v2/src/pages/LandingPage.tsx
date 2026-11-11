import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Pricing } from '../components/marketing/Pricing';
import { InstitutionalProductMockup } from '../components/marketing/InstitutionalProductMockup';
import { DashboardMockup } from '../components/marketing/DashboardMockup';
import { ProctoringWidget } from '../components/marketing/ProctoringWidget';
import { 
  GraduationCap, 
  ArrowRight, 
  ArrowDown,
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
  ShieldCheck,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Award,
  Layers,
  FileCheck,
  Building2,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-zinc-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* 1. Minimal Premium Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-zinc-900">EduPulse</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    SaaS
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 hidden sm:inline font-medium -mt-0.5">
                  Institutional Operating System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-600">
              <a href="#overview" onClick={(e) => { e.preventDefault(); scrollToSection('overview'); }} className="hover:text-zinc-900 transition-colors">
                Overview
              </a>
              <a href="#modules" onClick={(e) => { e.preventDefault(); scrollToSection('modules'); }} className="hover:text-zinc-900 transition-colors">
                Capabilities
              </a>
              <a href="#workflows" onClick={(e) => { e.preventDefault(); scrollToSection('workflows'); }} className="hover:text-zinc-900 transition-colors">
                Workflows
              </a>
              <a href="#architecture" onClick={(e) => { e.preventDefault(); scrollToSection('architecture'); }} className="hover:text-zinc-900 transition-colors">
                Architecture
              </a>
              <a href="#security" onClick={(e) => { e.preventDefault(); scrollToSection('security'); }} className="hover:text-zinc-900 transition-colors">
                Security & Exams
              </a>
              <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} className="hover:text-zinc-900 transition-colors">
                Pricing
              </a>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-xl transition shadow-sm h-9 px-4"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                  Dashboard ({user?.role})
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 text-xs font-medium h-9 px-3.5"
                  >
                    Sign in
                  </Button>
                  <Button 
                    onClick={() => navigate('/onboard')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-sm h-9 px-4"
                  >
                    Start free trial
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-zinc-600">
              <a href="#overview" onClick={() => { setMobileMenuOpen(false); scrollToSection('overview'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Overview
              </a>
              <a href="#modules" onClick={() => { setMobileMenuOpen(false); scrollToSection('modules'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Capabilities & Modules
              </a>
              <a href="#workflows" onClick={() => { setMobileMenuOpen(false); scrollToSection('workflows'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Workflows
              </a>
              <a href="#architecture" onClick={() => { setMobileMenuOpen(false); scrollToSection('architecture'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Multi-Tenant Architecture
              </a>
              <a href="#security" onClick={() => { setMobileMenuOpen(false); scrollToSection('security'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Security & Exams
              </a>
              <a href="#pricing" onClick={() => { setMobileMenuOpen(false); scrollToSection('pricing'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Pricing
              </a>
            </nav>
            <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
              <Button 
                onClick={() => { setMobileMenuOpen(false); navigate('/onboard'); }}
                className="w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs rounded-xl h-9"
              >
                Start free trial
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full justify-center border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-xs rounded-xl h-9"
              >
                Sign in
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Strong Product-Focused Hero */}
      <section id="overview" className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-indigo-50/50 via-zinc-50/20 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Subtle Institutional Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs font-semibold text-zinc-700"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>EduPulse SaaS V1.4 • Autonomous Multi-Tenant Architecture</span>
          </motion.div>

          {/* Primary Hero Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-[1.08]"
          >
            One platform to run your entire institution.
          </motion.h1>

          {/* Primary Hero Subcopy */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Bring academics, student management, finance and institutional operations together in one connected platform.
          </motion.p>

          {/* Hero Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/onboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 h-11 text-xs rounded-xl transition shadow-sm"
            >
              Start free trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollToSection('showcase')}
              className="border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold h-11 px-6 text-xs rounded-xl transition shadow-sm"
            >
              Explore platform
              <ArrowDown className="h-3.5 w-3.5 ml-2 text-zinc-400" />
            </Button>
          </motion.div>

          {/* Trust Markers */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Role-Based Multi-Tenancy
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Zero Setup Fees
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              14-Day Free Evaluation
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              FERPA & Data Compliant
            </span>
          </motion.div>

        </div>
      </section>

      {/* 3. Actual Product Showcase */}
      <section id="showcase" className="py-12 md:py-16 bg-white border-y border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              A unified operating environment built for higher education
            </h2>
            <p className="text-sm text-zinc-600">
              Interactive preview of the EduPulse institutional control plane — click between modules to inspect student registers, class schedules, and tuition reconciliation.
            </p>
          </div>

          {/* The High-Fidelity Realistic Product Mockup */}
          <InstitutionalProductMockup />

        </div>
      </section>

      {/* 4. Institutional Capabilities and ERP Modules */}
      <section id="modules" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Comprehensive Core Modules
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Every department, synchronized in real time.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              EduPulse replaces fragmented point solutions with an integrated institutional operating system designed to meet modern accreditation and auditing standards.
            </p>
          </div>

          {/* 6 Structured Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Academics & Curriculum Planning */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Academics & Curriculum Planning</h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Design complex credit frameworks, map course syllabi repositories, enforce prerequisites, and coordinate department-wide academic calendars with zero scheduling friction.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Credit and GPA weighting algorithms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Prerequisite checking & audit trails</span>
                </li>
              </ul>
            </div>

            {/* 2. Student Lifecycle & Admissions (SIS) */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Student Lifecycle & Admissions (SIS)</h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Autonomous online application portals, digital document verification, permanent student records, roll number allocation, and comprehensive cohort tracking.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Self-serve applicant onboarding portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Digital student profiles & records</span>
                </li>
              </ul>
            </div>

            {/* 3. Fee Management & Recurring Invoicing */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Fee Management & Recurring Invoicing</h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Automated term fee schedules, integrated Razorpay B2B payment gateway, multi-head fee structures, scholarship adjustments, and real-time reconciliation.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Instant fee voucher & receipt generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>RBI-compliant recurring autopay support</span>
                </li>
              </ul>
            </div>

            {/* 4. Biometric & Class Attendance */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Biometric & Class Attendance</h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Hardware-agnostic RFID and biometric reader synchronization, faculty mobile attendance registers, threshold warnings, and automated parent notifications.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Real-time hardware sync & punch logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Automated attendance deficit flagging</span>
                </li>
              </ul>
            </div>

            {/* 5. Examinations & Grade Books */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Examinations & Grade Books</h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Configure formative quizzes and summative proctored finals, compute relative and absolute GPA/CGPA curves, and generate tamper-proof digital transcripts.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Official marksheets & digital transcripts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Safe Exam Browser (SEB) lockdown support</span>
                </li>
              </ul>
            </div>

            {/* 6. Staff Payroll & HR Operations */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Staff Payroll & HR Operations</h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Faculty workload assignment, biometric leave accruals, statutory tax deductions, automated salary disbursement vouchers, and institutional departmental budgeting.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Automated payroll computation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Faculty research & teaching workload tracking</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Connected Academic and Administrative Workflows */}
      <section id="workflows" className="py-24 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
              <Zap className="w-3.5 h-3.5" />
              Unified Institutional Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Eliminate information silos between departments.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              When a student is enrolled, every relevant department updates instantly — from course registration to fee vouchers and examination eligibility.
            </p>
          </div>

          {/* Connected 4-Step Process Visual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="relative bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="font-bold text-zinc-900 text-sm">Admissions & Enrollment</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Prospective applicant submits credentials. Upon acceptance, EduPulse auto-provisions a student ID, assigns a cohort, and creates their central profile.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] font-medium text-indigo-700">
                Trigger: Application Approved
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="font-bold text-zinc-900 text-sm">Academic Scheduling</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Enrolled credits automatically populate student timetables, book faculty lecture halls, and configure biometric attendance scanners for every class.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] font-medium text-indigo-700">
                Auto: Timetable & Rosters Populated
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="font-bold text-zinc-900 text-sm">Fee Generation & Invoicing</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Tuition invoices generate based on enrolled course credits and lab fees. Razorpay payment links are dispatched to parents with instant receipt reconciliation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] font-medium text-indigo-700">
                Auto: Term Invoices Dispatched
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                  04
                </div>
                <h3 className="font-bold text-zinc-900 text-sm">Examination & Certification</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Upon fee and attendance clearance, digital hall tickets are issued with Safe Exam Browser launch keys. Final grades compile into verified digital transcripts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] font-medium text-indigo-700">
                Result: Verified Degree Transcripts
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Multi-Tenant SaaS Architecture */}
      <section id="architecture" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              Enterprise Infrastructure
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Engineered for massive university scale.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Whether running a single campus or a statewide multi-college university network, EduPulse provides flexible data topologies and automated infrastructure management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Dynamic Subdomain Routing */}
            <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Custom Subdomain Routing</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Every client institution receives a dedicated subdomain (e.g. <span className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded">harvard.edupulse.io</span>). Spring filters extract the tenant slug on every request, routing compute seamlessly without code forks.
              </p>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600">
                HTTP Host Header → TenantContextFilter → ThreadLocal
              </div>
            </div>

            {/* Dedicated Database Routing */}
            <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Dedicated Database Pools</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Enterprise institutions with strict regulatory mandates can route to isolated PostgreSQL instances via Spring's <span className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded">AbstractRoutingDataSource</span> with dedicated HikariCP connection pools.
              </p>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600">
                RoutingKey Lookup: SHARED vs DEDICATED_VIP
              </div>
            </div>

            {/* Automated S3 Disaster Recovery */}
            <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                <HardDrive className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Automated S3 Disaster Recovery</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Automated background jobs execute streaming database dumps, compress archives with AES-256 encryption, and upload to AWS S3 multi-region storage with automated lifecycle policies.
              </p>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600">
                Recovery Point Objective: &lt; 5m • AES-256 Storage
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Security and Data Isolation (PostgreSQL RLS Deep Dive + Live Attio Mockup) */}
      <section id="security" className="py-24 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Mathematical Isolation
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              PostgreSQL Row-Level Security (RLS)
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Instead of relying on fragile application-level SQL <span className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded">WHERE</span> clauses, EduPulse enforces data boundaries directly inside the PostgreSQL database engine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-zinc-600">
            <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200">
              <h4 className="font-bold text-zinc-900 text-sm mb-1.5">Kernel-Level Enforcement</h4>
              <p className="leading-relaxed">
                Every database transaction executes <span className="font-mono text-zinc-800">SET LOCAL app.tenant_id</span>. Any query attempting to access another institution's data returns zero rows at the storage engine level.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200">
              <h4 className="font-bold text-zinc-900 text-sm mb-1.5">Role-Based Access Control (RBAC)</h4>
              <p className="leading-relaxed">
                Fine-grained security principals ensure that Super Admins, Institutional Registrars, Faculty, Students, and Parents only see the records authorized for their role.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200">
              <h4 className="font-bold text-zinc-900 text-sm mb-1.5">Cryptographic Audit Logging</h4>
              <p className="leading-relaxed">
                Every administrative configuration change, grade alteration, and fee concession is permanently logged with actor timestamps for FERPA compliance.
              </p>
            </div>
          </div>

          {/* Interactive RLS Demonstration Card */}
          <div id="data-isolation" className="pt-2">
            <div className="bg-zinc-50 rounded-2xl p-6 sm:p-8 border border-zinc-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                    Interactive RLS Verification Console
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Switch the active institution below to inspect how the PostgreSQL runtime dynamically isolates student ledgers:
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Isolation Proof: 100% Active</span>
                </div>
              </div>

              {/* The Live Interactive Attio-Style Data Table */}
              <DashboardMockup />
            </div>
          </div>

        </div>
      </section>

      {/* 8. Safe Exam Browser and Examination Security */}
      <section id="seb-proctoring" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              High-Stakes Examination Security
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Safe Exam Browser (SEB) OS Lockdown
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Eliminate digital exam fraud at the operating system root. EduPulse generates cryptographic SEB configuration keys that force student client machines into locked kiosk mode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-600">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Monitor className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">Dual-Screen & VM Neutralization</h4>
              <p className="leading-relaxed">
                SEB terminates unauthorized secondary monitors, blocks virtual machines (VMware, VirtualBox), and detects remote desktop tools.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">Clipboard & Process Lockdown</h4>
              <p className="leading-relaxed">
                Clears the system clipboard, intercepts print-screen commands, and disables hotkeys (Alt+Tab, Cmd+Tab) to prevent browser switching.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">Cryptographic Handshake</h4>
              <p className="leading-relaxed">
                Every request contains a SHA-256 browser exam key. The backend rejects any attempt to take the assessment through a standard browser.
              </p>
            </div>
          </div>

          {/* Interactive SEB Hardware Lockdown Demonstration Widget */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                  Interactive SEB Lockdown Simulator
                </h3>
                <p className="text-xs text-zinc-600">
                  Toggle the switch inside the proctoring widget below to simulate an active exam kiosk lockdown:
                </p>
              </div>
              <div className="text-xs font-medium text-zinc-500">
                Safe Exam Browser (SEB) v3.x Compatible
              </div>
            </div>

            {/* Embed Proctoring Widget */}
            <ProctoringWidget />
          </div>

        </div>
      </section>

      {/* 9. Subscription Plans and Pricing (Light-First Component) */}
      <Pricing />

      {/* 10. Final Conversion Section */}
      <section className="py-20 md:py-28 bg-white border-t border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
            Instant Autonomous Provisioning
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Ready to modernize your institution's operations?
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Join forward-thinking colleges and universities. Launch your self-serve institutional portal in less than 60 seconds.
          </p>
          
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/onboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 rounded-xl text-xs transition shadow-sm"
            >
              Start free trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <a 
              href="mailto:contact@edupulse.io?subject=Enterprise%20Institutional%20Demo%20Request"
              className="inline-flex items-center justify-center border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold h-12 px-6 text-xs rounded-xl transition shadow-sm"
            >
              Schedule an institutional demo
            </a>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <span>• 14-day free trial</span>
            <span>• No credit card required</span>
            <span>• Dedicated tenant subdomain</span>
            <span>• FERPA compliant</span>
          </div>
        </div>
      </section>

      {/* 11. Professional Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-200/80 pt-16 pb-12 text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-bold text-base text-zinc-900">EduPulse SaaS ERP</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                The unified institutional operating system for universities, colleges, and educational groups. Scalable multi-tenancy, Row-Level Security, and Safe Exam Browser proctoring.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-medium text-zinc-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All Systems Operational • 99.99% SLA</span>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">Core Modules</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#modules" className="hover:text-zinc-900 transition">Academic Planning</a></li>
                <li><a href="#modules" className="hover:text-zinc-900 transition">Student Lifecycle SIS</a></li>
                <li><a href="#modules" className="hover:text-zinc-900 transition">Fee & Invoicing</a></li>
                <li><a href="#modules" className="hover:text-zinc-900 transition">Biometric Attendance</a></li>
                <li><a href="#modules" className="hover:text-zinc-900 transition">Exam Proctoring (SEB)</a></li>
                <li><a href="#modules" className="hover:text-zinc-900 transition">Staff Payroll & HR</a></li>
              </ul>
            </div>

            {/* Architecture & Security */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">Architecture</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#architecture" className="hover:text-zinc-900 transition">Multi-Tenant Routing</a></li>
                <li><a href="#architecture" className="hover:text-zinc-900 transition">Dedicated DB Pools</a></li>
                <li><a href="#security" className="hover:text-zinc-900 transition">PostgreSQL RLS</a></li>
                <li><a href="#seb-proctoring" className="hover:text-zinc-900 transition">Safe Exam Browser</a></li>
                <li><a href="#architecture" className="hover:text-zinc-900 transition">Automated S3 Backups</a></li>
                <li><a href="#pricing" className="hover:text-zinc-900 transition">Razorpay B2B Billing</a></li>
              </ul>
            </div>

            {/* Compliance & Legal */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">Governance</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#security" className="hover:text-zinc-900 transition">FERPA Compliance</a></li>
                <li><a href="#security" className="hover:text-zinc-900 transition">GDPR Data Privacy</a></li>
                <li><a href="#security" className="hover:text-zinc-900 transition">Security Whitepaper</a></li>
                <li><a href="#pricing" className="hover:text-zinc-900 transition">Service Level Agreement</a></li>
                <li><Link to="/login" className="hover:text-zinc-900 transition">Institutional Sign In</Link></li>
                <li><Link to="/onboard" className="hover:text-zinc-900 transition">14-Day Free Onboarding</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <div>
              © 2026 EduPulse Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="#overview" onClick={(e) => { e.preventDefault(); scrollToSection('overview'); }} className="hover:text-zinc-900 transition">Back to top</a>
              <Link to="/login" className="hover:text-zinc-900 transition">Institutional Portal</Link>
              <Link to="/onboard" className="hover:text-zinc-900 transition">Self-Serve Onboarding</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Icon helper components for any missed lucide icons
function Globe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function Monitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}
