import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Pricing } from '../components/marketing/Pricing';
import { InstitutionalProductMockup } from '../components/marketing/InstitutionalProductMockup';
import { ArchitectureExplorer } from '../components/marketing/ArchitectureExplorer';
import { ExamSecurityExplanation } from '../components/marketing/ExamSecurityExplanation';
import { IntegrationShowcase } from '../components/marketing/IntegrationShowcase';
import { 
  GraduationCap, 
  ArrowRight, 
  ArrowDown,
  Menu, 
  X, 
  CheckCircle2, 
  UserCheck, 
  Lock, 
  Server, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  DollarSign, 
  Calendar, 
  Award, 
  Layers, 
  Building2, 
  Cpu, 
  Bus, 
  Library
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
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
              <a href="#overview" onClick={(e) => { e.preventDefault(); scrollToSection('overview'); }} className="hover:text-zinc-900 transition-colors">
                Overview
              </a>
              <a href="#showcase" onClick={(e) => { e.preventDefault(); scrollToSection('showcase'); }} className="hover:text-zinc-900 transition-colors">
                Blueprint
              </a>
              <a href="#capabilities" onClick={(e) => { e.preventDefault(); scrollToSection('capabilities'); }} className="hover:text-zinc-900 transition-colors">
                Capabilities
              </a>
              <a href="#workflows" onClick={(e) => { e.preventDefault(); scrollToSection('workflows'); }} className="hover:text-zinc-900 transition-colors">
                Workflows
              </a>
              <a href="#operations" onClick={(e) => { e.preventDefault(); scrollToSection('operations'); }} className="hover:text-zinc-900 transition-colors">
                Operations
              </a>
              <a href="#integrations" onClick={(e) => { e.preventDefault(); scrollToSection('integrations'); }} className="hover:text-zinc-900 transition-colors">
                Integrations
              </a>
              <a href="#architecture" onClick={(e) => { e.preventDefault(); scrollToSection('architecture'); }} className="hover:text-zinc-900 transition-colors">
                Architecture
              </a>
              <a href="#exam-security" onClick={(e) => { e.preventDefault(); scrollToSection('exam-security'); }} className="hover:text-zinc-900 transition-colors">
                Exam Security
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
              <a href="#capabilities" onClick={() => { setMobileMenuOpen(false); scrollToSection('capabilities'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Capabilities & Modules
              </a>
              <a href="#workflows" onClick={() => { setMobileMenuOpen(false); scrollToSection('workflows'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Workflows
              </a>
              <a href="#operations" onClick={() => { setMobileMenuOpen(false); scrollToSection('operations'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Operations
              </a>
              <a href="#integrations" onClick={() => { setMobileMenuOpen(false); scrollToSection('integrations'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Integrations (Razorpay, Meet, Notion)
              </a>
              <a href="#architecture" onClick={() => { setMobileMenuOpen(false); scrollToSection('architecture'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                SaaS Architecture
              </a>
              <a href="#exam-security" onClick={() => { setMobileMenuOpen(false); scrollToSection('exam-security'); }} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Exam Security & SEB
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-indigo-50/50 via-zinc-50/20 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Authentic Architecture Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs font-semibold text-zinc-700"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
            <span>EduPulse SaaS V1.4 • Institutional ERP Platform</span>
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

          {/* Authentic Proof Points */}
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
              PostgreSQL Row-Level Security
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              14-Day Free Evaluation
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Zero Setup Fees
            </span>
          </motion.div>

        </div>
      </section>

      {/* 3. Actual Product Showcase (Authentic System Architecture & Blueprint) */}
      <section id="showcase" className="py-12 md:py-16 bg-white border-y border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              System Architecture &amp; Data Model
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              The EduPulse Institutional System Core
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              An authentic architectural breakdown of the verified relational tables, administrative workflows, and isolation policies operating inside <span className="font-mono text-zinc-800">/dashboard</span>.
            </p>
          </div>

          {/* Genuine System Architecture Inspector */}
          <InstitutionalProductMockup />

        </div>
      </section>

      {/* 4. Core Institutional Capabilities */}
      <section id="capabilities" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Implemented Modules
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Integrated systems for institutional governance.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Every capability below corresponds directly to a functioning subsystem in the EduPulse codebase with dedicated controllers, repositories, and interfaces.
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
                  Configure multi-semester credit frameworks, departmental course catalogs, prerequisites, and syllabus repositories with structured course codes.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Module: CourseManager (/academic/courses)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Credit and GPA weighting algorithms</span>
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
                  Manage prospective applicant queues, review application statuses, assign unique Roll Numbers, and maintain permanent academic profile records.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Module: StudentsList & Admissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Applicant intake: PublicAdmissions (/admissions)</span>
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
                  Define fee structures with multiple fee heads, issue automated term vouchers, track individual debit/credit student ledgers, and reconcile payments.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Module: FeeManager & StudentLedger</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Razorpay B2B payment gateway integration</span>
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
                  Record daily lecture attendance by batch, reconcile hardware punch logs via REST API, and track individual student attendance thresholds.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Module: AttendanceTracker (/operations/attendance)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Attendance percentages and deficit alerts</span>
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
                  Schedule formative assessments and semester finals, assign exam halls, record subject scores, and publish official digital transcripts.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Module: ExamManager & TranscriptViewer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Safe Exam Browser (SEB) configuration support</span>
                </li>
              </ul>
            </div>

            {/* 6. Staff Payroll & HR Operations */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Staff Payroll & HR Operations</h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Manage faculty leave balances, process pending leave approvals, allocate teaching workloads, and disburse monthly institutional payroll.
                </p>
              </div>
              <ul className="text-xs text-zinc-500 space-y-1.5 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Module: LeaveManager & PayrollDashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Salary vouchers and leave accrual registers</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Real Academic and Administrative Workflows */}
      <section id="workflows" className="py-24 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
              <Zap className="w-3.5 h-3.5" />
              End-to-End Operational Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              How data connects across institutional departments.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              From the moment an applicant submits credentials to graduation day, EduPulse synchronizes records across academic, operations, and finance teams.
            </p>
          </div>

          {/* 5-Step Connected Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                  01
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Admissions & Inquiry</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Prospective student applies via the public admission portal. Application is saved to the admission queue for committee evaluation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /admissions
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                  02
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Enrollment Registry</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Registrar approves application. Student profile is allocated a permanent Roll Number, batch assignment, and student portal credentials.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /admissions/enroll
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                  03
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Course & Timetable</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Credits allocate to enrolled courses. Lecture timetables, room assignments, and faculty attendance registers populate automatically.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /academic/courses
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                  04
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Fee Voucher Issuance</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Tuition invoices generate based on enrolled credit hours and program fee structures. Students pay via the portal or Razorpay gateway.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /finance/fees
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                  05
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Exams & Transcripts</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Final exam hall tickets issue upon fee clearance. Course marks compile into cumulative GPA/CGPA and verified digital transcripts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /academic/transcripts
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Institutional Operations & Departmental Coverage */}
      <section id="operations" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Bus className="w-3.5 h-3.5 text-indigo-600" />
              Campus Operations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Complete administrative coverage across campus services.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Beyond academic registers, EduPulse manages transport routes, library resource lending, and multi-tenant SaaS control planes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Library Management */}
            <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                <Library className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Library Resource Circulation</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Track physical and digital book catalogs by ISBN. Manage student loan checkouts, return dates, reservation queues, and overdue penalty fee integration.
              </p>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600">
                Module: LibraryManager (/operations/library)
              </div>
            </div>

            {/* Campus Transportation */}
            <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                <Bus className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Campus Transport & Routes</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Define institutional transport bus routes, designate pickup stops, register institutional fleet vehicles, and allocate student passenger seats.
              </p>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600">
                Module: TransportManager (/operations/transport)
              </div>
            </div>

            {/* Central SaaS Control Plane */}
            <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                <Server className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">SaaS Multi-Tenant Control Plane</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Super administrators monitor tenant namespaces, transition account states (ACTIVE to SUSPENDED), and trigger database pool migrations via the central control panel.
              </p>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600">
                Module: SaaSTenantDashboard (/saas-admin)
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Confirmed Third-Party Integrations: Razorpay, Google Meet, Notion */}
      <IntegrationShowcase />

      {/* 8. SaaS Architecture and Tenant Isolation (Verifiable Explorer) */}
      <section id="architecture" className="py-24 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Database & Security Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              How EduPulse Enforces Tenant Data Isolation
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Instead of relying on application-level filtering where a missed WHERE clause leaks records, EduPulse enforces tenant isolation across four distinct architectural boundaries.
            </p>
          </div>

          {/* Interactive Verifiable Architecture Explorer */}
          <ArchitectureExplorer />

        </div>
      </section>

      {/* 8. Safe Exam Browser and Examination Security */}
      <section id="exam-security" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              Assessment Security
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Exam Security with Safe Exam Browser (SEB)
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              EduPulse integrates with the open-source Safe Exam Browser (ETH Zurich) to provide tamper-resistant testing environments for high-stakes examinations.
            </p>
          </div>

          {/* Authentic Examination Security Workflow */}
          <ExamSecurityExplanation />

        </div>
      </section>

      {/* 9. Subscription Plans and Pricing */}
      <Pricing />

      {/* 10. Final Conversion Section */}
      <section className="py-20 md:py-28 bg-white border-t border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Zap className="w-3.5 h-3.5" />
            14-Day Free Evaluation
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Ready to modernize your institution's operations?
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Launch your self-serve institutional portal in less than 60 seconds. Evaluate the full EduPulse ERP platform with zero setup fees or long-term commitment.
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
              href="mailto:contact@edupulse.io?subject=EduPulse%20Institutional%20Inquiry"
              className="inline-flex items-center justify-center border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold h-12 px-6 text-xs rounded-xl transition shadow-sm"
            >
              Schedule an institutional demo
            </a>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <span>• 14-day full feature trial</span>
            <span>• No credit card required</span>
            <span>• Self-serve onboarding</span>
            <span>• Instant tenant partition</span>
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
                The unified institutional operating system for universities, colleges, and educational groups. Multi-tenant database routing, PostgreSQL Row-Level Security, and integrated assessment workflows.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-medium text-zinc-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All Core Services Operational</span>
              </div>
            </div>

            {/* Core Modules */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">Core Modules</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#capabilities" className="hover:text-zinc-900 transition">Academic Planning</a></li>
                <li><a href="#capabilities" className="hover:text-zinc-900 transition">Student Lifecycle (SIS)</a></li>
                <li><a href="#capabilities" className="hover:text-zinc-900 transition">Fee & Invoicing</a></li>
                <li><a href="#capabilities" className="hover:text-zinc-900 transition">Class Attendance</a></li>
                <li><a href="#capabilities" className="hover:text-zinc-900 transition">Examinations & Transcripts</a></li>
                <li><a href="#capabilities" className="hover:text-zinc-900 transition">Staff Payroll & HR</a></li>
              </ul>
            </div>

            {/* Architecture & Security */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">Integrations & Infra</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#integrations" className="hover:text-zinc-900 transition">Razorpay Fee Collection</a></li>
                <li><a href="#integrations" className="hover:text-zinc-900 transition">Google Meet Classrooms</a></li>
                <li><a href="#integrations" className="hover:text-zinc-900 transition">Notion Course Resources</a></li>
                <li><a href="#architecture" className="hover:text-zinc-900 transition">PostgreSQL RLS Engine</a></li>
                <li><a href="#architecture" className="hover:text-zinc-900 transition">Dynamic Routing DataSource</a></li>
                <li><a href="#exam-security" className="hover:text-zinc-900 transition">Safe Exam Browser Support</a></li>
              </ul>
            </div>

            {/* Administrative Access */}
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">Portals & Access</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><Link to="/login" className="hover:text-zinc-900 transition">Institutional Sign In</Link></li>
                <li><Link to="/onboard" className="hover:text-zinc-900 transition">14-Day Free Onboarding</Link></li>
                <li><Link to="/admissions" className="hover:text-zinc-900 transition">Public Admissions</Link></li>
                <li><a href="#pricing" className="hover:text-zinc-900 transition">Commercial Plans</a></li>
                <li><a href="#overview" className="hover:text-zinc-900 transition">System Overview</a></li>
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
