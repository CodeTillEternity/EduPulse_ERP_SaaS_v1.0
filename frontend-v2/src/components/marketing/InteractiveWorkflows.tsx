import React, { useState } from 'react';
import { 
  Zap, 
  UserPlus, 
  CreditCard, 
  BookOpen, 
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Building2
} from 'lucide-react';

type ExperienceType = 'admission' | 'finance' | 'academic' | 'hr' | 'saas';

export const InteractiveWorkflows: React.FC = () => {
  const [activeExperience, setActiveExperience] = useState<ExperienceType>('admission');
  const [activeStep, setActiveStep] = useState<number>(0);

  // 5-Step Connected Operational Pipeline
  const connectedPipeline = [
    {
      step: '01',
      title: 'Admissions & Inquiry',
      badge: 'Public Intake Portal',
      desc: 'Applicant registers bio-data, intended major, and academic certificates.',
      targetExp: 'admission' as ExperienceType,
      targetStep: 0
    },
    {
      step: '02',
      title: 'Enrollment Registry',
      badge: 'SIS Roll Allocation',
      desc: 'Committee approves applicant; system assigns permanent Roll Number.',
      targetExp: 'admission' as ExperienceType,
      targetStep: 2
    },
    {
      step: '03',
      title: 'Course & Timetable',
      badge: 'Curriculum & Hall Allocation',
      desc: 'Conflict-free lecture scheduling with integrated Google Meet links.',
      targetExp: 'academic' as ExperienceType,
      targetStep: 0
    },
    {
      step: '04',
      title: 'Fee Voucher Issuance',
      badge: 'Bursar Invoicing Run',
      desc: 'Batch invoice generation and online Razorpay payment checkout.',
      targetExp: 'finance' as ExperienceType,
      targetStep: 1
    },
    {
      step: '05',
      title: 'Exams & Transcripts',
      badge: 'Grading & Official GPA',
      desc: 'Grade compilation against institutional bands and transcript issue.',
      targetExp: 'academic' as ExperienceType,
      targetStep: 2
    }
  ];

  // Detailed Experience Steps
  const admissionSteps = [
    {
      title: 'Applicant Portal Intake',
      subhead: 'Applicant Portal Submission',
      api: 'POST /api/v1/admissions/applications',
      component: 'PublicAdmissions.tsx & NewApplicationDialog.tsx',
      headline: 'Applicant Inquiry & Credential Intake',
      description: 'Prospective students register their biographical details, intended degree program, and upload initial academic transcripts and government IDs.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Intake Form: /admissions/apply</span>
            <span className="text-emerald-400">STATUS: SUBMITTED</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><span className="text-zinc-500">Applicant:</span> Aanya Patel</div>
            <div><span className="text-zinc-500">Program:</span> B.Tech Computer Science</div>
            <div><span className="text-zinc-500">Application #:</span> APP-2026-042</div>
            <div><span className="text-zinc-500">Date:</span> 2026-10-14 11:20 AM</div>
          </div>
        </div>
      )
    },
    {
      title: 'Review Queue & Verification',
      subhead: 'Admissions Committee Review',
      api: 'GET /api/v1/admissions/applications',
      component: 'Admissions.tsx',
      headline: 'Document Verification & Eligibility Review',
      description: 'The admissions office reviews high school marksheets and Aadhaar attachments in the central intake queue to verify eligibility before committee approval.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Review Queue • Program: B.Tech CS</span>
            <span className="text-amber-400">UNDER_REVIEW</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span>12th Standard Marksheet (CBSE 94.2%)</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Aadhaar Identity Proof Document</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Admissions Committee Clearance</span>
              <span className="text-amber-400">PENDING_FINAL_SIGN</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Registry SIS Enrollment',
      subhead: 'Institutional Roll Allocation',
      api: 'POST /api/v1/students/admissions/{id}/enroll',
      component: 'EnrollStudent.jsx',
      headline: 'Automated Student Registry Enrollment',
      description: 'Upon approval, single-click enrollment generates a permanent institutional enrollment roll number and partitions student records into the active SIS directory.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Enrollment Generator • Batch 2026–2030</span>
            <span className="text-emerald-400">ENROLLED</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><span className="text-zinc-500">Permanent Roll:</span> ENR-2026-0042</div>
            <div><span className="text-zinc-500">Assigned Cohort:</span> CS-Batch-A</div>
            <div><span className="text-zinc-500">Student Status:</span> ACTIVE</div>
            <div><span className="text-zinc-500">Portal Access:</span> CREDENTIALS_DISPATCHED</div>
          </div>
        </div>
      )
    },
    {
      title: 'Student Dossier & SIS',
      subhead: 'Master Academic Profile',
      api: 'GET /api/v1/students/{id}',
      component: 'StudentProfile.tsx & StudentsList.tsx',
      headline: 'Master Student Information System (SIS) Dossier',
      description: 'Complete centralized record housing attendance records, fee payment ledgers, guardian contacts, and term-by-term transcripts.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Student Profile • ENR-2026-0042</span>
            <span className="text-emerald-400">GOOD_STANDING</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Aanya Patel • Department of Computer Science & Engineering<br />
            <span className="text-zinc-500">Parent/Guardian: Rajesh Patel (+91 98765 43210) • Active Fee Voucher: PENDING</span>
          </div>
        </div>
      )
    }
  ];

  const financeSteps = [
    {
      title: 'Fee Head Blueprint',
      subhead: 'Structure Formulation',
      api: 'POST /api/v1/fees/structures',
      component: 'FeeManager.jsx',
      headline: 'Institutional Fee Structure Formulation',
      description: 'Finance bursars configure itemized fee schedules linked to degree programs (Tuition, Laboratory, Library, Examination, and Caution Deposits).',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Fee Blueprint: Fall 2026 CS Batch</span>
            <span className="text-indigo-400">SAVED</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between"><span>Tuition Fee:</span> <span>₹35,000</span></div>
            <div className="flex justify-between"><span>Laboratory & Computing:</span> <span>₹10,000</span></div>
            <div className="flex justify-between"><span>Examination Fee:</span> <span>₹2,500</span></div>
            <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-zinc-800">
              <span>Total Term Assessment:</span> <span>₹47,500</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Batch Invoicing Run',
      subhead: 'Batch Cohort Invoicing',
      api: 'POST /api/v1/fees/invoices/batch',
      component: 'CreateInvoiceDialog.tsx & FeeManager.jsx',
      headline: 'Automated Bulk Invoicing Run',
      description: 'Batch invoicing generates individual payable vouchers for entire student cohorts with distinct due dates and penalty enforcement dates.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Batch Invoicing Run #B-2026-11</span>
            <span className="text-emerald-400">DISPATCHED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            64 Student Invoices Generated • Total Invoiced: ₹30,40,000<br />
            <span className="text-zinc-500">Due Date: 2026-11-30 • Invoice Sample: INV-2026-089</span>
          </div>
        </div>
      )
    },
    {
      title: 'Student Portal Checkout',
      subhead: 'Razorpay Gateway Modal',
      api: 'POST /api/v1/portal/fees/checkout/create-order',
      component: 'FeeCenter.jsx',
      headline: 'Online Razorpay Payment Initiation',
      description: 'Students inspect outstanding vouchers in their fee portal and launch the integrated Razorpay checkout modal supporting UPI, Cards, and NetBanking.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Razorpay Standard Checkout Modal</span>
            <span className="text-indigo-400">ORDER CREATED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Order ID: order_Rzp9128301 • Amount: ₹47,500.00<br />
            <span className="text-zinc-500">Prefill: Aarav Sharma (student@apex.edu)</span>
          </div>
        </div>
      )
    },
    {
      title: 'Signature & Ledger Settlement',
      subhead: 'Cryptographic Settlement',
      api: 'POST /api/v1/portal/fees/checkout/verify',
      component: 'StudentLedger.jsx',
      headline: 'Server-Side Verification & Double-Entry Ledger',
      description: 'The backend verifies HMAC-SHA256 signature tokens (razorpay_signature), marks the voucher PAID, and appends a credit line to the student ledger.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Student Ledger Entry • ENR-2026-001</span>
            <span className="text-emerald-400">SETTLED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Credit: ₹47,500.00 • Receipt: RCP-8912 • Balance: ₹0.00<br />
            <span className="text-zinc-500">Payment ID: pay_Rzp8921829 • Verified via HMAC-SHA256</span>
          </div>
        </div>
      )
    }
  ];

  const academicSteps = [
    {
      title: 'Curriculum & Class Schedule',
      subhead: 'Curriculum & Hall Allocation',
      api: 'POST /api/v1/academics/timetable',
      component: 'CourseManager.jsx & TimetableManager.jsx',
      headline: 'Conflict-Free Lecture Scheduling',
      description: 'Administrators map faculty, lecture halls, and degree programs while integrating virtual Google Meet links to prevent double-booking.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Course Catalog & Schedule</span>
            <span className="text-emerald-400">CONFLICT FREE</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            CS-402 Advanced Distributed Algorithms • Hall 402<br />
            <span className="text-zinc-500">Instructor: Dr. Aris Thorne • Meet Link: meet.google.com/xyz-abc</span>
          </div>
        </div>
      )
    },
    {
      title: 'Classroom Attendance',
      subhead: 'Roster Attendance Tracking',
      api: 'POST /api/v1/operations/attendance/mark',
      component: 'AttendanceTracker.jsx',
      headline: 'Batch Roster Attendance Marking',
      description: 'Faculty record lecture attendance with one-click toggles (Present, Absent, Late, Excused) with automatic deficit alerts when compliance drops below 75%.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Lecture Attendance Register</span>
            <span className="text-emerald-400">RECORDED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Present: 46 • Absent: 2 • Late: 0 • Attendance Rate: 95.8%<br />
            <span className="text-zinc-500">Session Date: 2026-11-10 09:00 AM</span>
          </div>
        </div>
      )
    },
    {
      title: 'Grade Compilation & Transcripts',
      subhead: 'Grading & Official Transcript',
      api: 'GET /api/v1/exams/transcripts/{rollNo}',
      component: 'ExamManager.jsx & TranscriptViewer.jsx',
      headline: 'Letter Grade Compilation & Academic Transcripts',
      description: 'Exam marks are compiled against institutional GradeScale bands (A+, A, B, F) to compute semester GPAs and render verifiable print-ready transcripts.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Official Academic Transcript</span>
            <span className="text-emerald-400">CONFERRED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            CS-402: Grade A+ (94/100) • SGPA: 3.94 • CGPA: 3.92<br />
            <span className="text-zinc-500">Standing: First Class with Distinction • Print Ready</span>
          </div>
        </div>
      )
    }
  ];

  const hrSteps = [
    {
      title: 'Faculty Leave Request',
      subhead: 'Leave Application Submission',
      api: 'POST /api/v1/hr/leaves/apply',
      component: 'LeaveManager.jsx',
      headline: 'Staff Leave Submission & Balance Check',
      description: 'Faculty apply for Medical, Casual, or Academic leaves with automatic deduction from annual leave quotas.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Leave Application: Dr. Thorne</span>
            <span className="text-amber-400">PENDING_REVIEW</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Dates: 2026-11-18 to 2026-11-19 (2 days) • Type: Casual Leave<br />
            <span className="text-zinc-500">Reason: Academic conference presentation</span>
          </div>
        </div>
      )
    },
    {
      title: 'HR Review & Approval',
      subhead: 'Administrative Decision',
      api: 'PUT /api/v1/hr/leaves/{id}/status',
      component: 'LeaveManager.jsx',
      headline: 'Administrative Review & Leave Balance Deduction',
      description: 'HR administrators approve requests, which updates faculty absence registries and feeds into monthly payroll salary calculations.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>HR Leave Decision</span>
            <span className="text-emerald-400">APPROVED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Remaining Casual Leave Balance: 8 / 12 Days<br />
            <span className="text-zinc-500">Approval Note: Substitute lecture arranged in Hall 402</span>
          </div>
        </div>
      )
    },
    {
      title: 'Payroll Batch Generation',
      subhead: 'Deductions & Payslips',
      api: 'POST /api/v1/hr/payroll/generate',
      component: 'PayrollDashboard.jsx',
      headline: 'Monthly Salary Calculation with Automatic Deductions',
      description: 'Generates payroll runs calculating base pay, allowances, and unpaid leave deductions with itemized payslip generation.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Monthly Payroll: November 2026</span>
            <span className="text-emerald-400">GENERATED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Base: ₹85,000 • Allowances: ₹15,000 • Deductions (Unpaid): ₹0<br />
            <span className="text-emerald-400 font-bold">Net Salary Payable: ₹1,00,000.00</span>
          </div>
        </div>
      )
    }
  ];

  const saasSteps = [
    {
      title: 'Tenant Registration',
      subhead: 'Institutional Onboarding',
      api: 'POST /api/v1/saas/public/register',
      component: 'RegisterInstitution.tsx',
      headline: 'Institutional Self-Registration & Onboarding',
      description: 'New institutions submit organization credentials and administrator contact information to request a 14-day evaluation environment.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Public Registration /onboard</span>
            <span className="text-indigo-400">PENDING_APPROVAL</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Institution: St. Jude College of Engineering<br />
            <span className="text-zinc-500">Subdomain: stjude.edupulse.io • Admin: admin@stjude.edu</span>
          </div>
        </div>
      )
    },
    {
      title: 'Trial Partition Provisioning',
      subhead: '14-Day Evaluation Sandbox',
      api: 'PATCH /api/v1/saas/admin/tenants/{id}/status',
      component: 'SaaSTenantDashboard.tsx',
      headline: '14-Day Trial Partition Activation',
      description: 'Platform administrators review verification documents, approve the tenant partition, and provision a shared PostgreSQL pool under RLS isolation.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Tenant Status: TRIAL (14 Days)</span>
            <span className="text-amber-400">EVALUATION_ACTIVE</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Partition: tenant-stjude • Pool: Shared PostgreSQL Pool<br />
            <span className="text-zinc-500">State: TRIAL • Trial Expiration: 14 Days Remaining</span>
          </div>
        </div>
      )
    },
    {
      title: 'Dedicated Pool Migration',
      subhead: 'VIP Infrastructure Allocation',
      api: 'POST /api/v1/saas/tenants/{id}/migrate-db',
      component: 'SaaSTenantDashboard.tsx',
      headline: 'Dynamic Database Pool Re-Routing',
      description: 'Enterprise institutions can be migrated at runtime from the SHARED pool to dedicated HikariCP database pools (dedicated-vip-1) without system downtime.',
      preview: (
        <div className="space-y-3 bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Database Migration: SHARED &rarr; DEDICATED</span>
            <span className="text-emerald-400">MIGRATED</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Target Routing Key: dedicated-vip-1 • Status: ACTIVE<br />
            <span className="text-zinc-500">Routed via dynamic pool connection router</span>
          </div>
        </div>
      )
    }
  ];

  const experienceConfigs = {
    admission: {
      name: 'Experience A: Student Admission Lifecycle',
      badge: 'Admissions to SIS Registry',
      icon: UserPlus,
      steps: admissionSteps
    },
    finance: {
      name: 'Experience B: Fee Collection & Razorpay',
      badge: 'Bursar Invoicing to Double-Entry Ledger',
      icon: CreditCard,
      steps: financeSteps
    },
    academic: {
      name: 'Experience C: Academic Operations & Transcripts',
      badge: 'Timetable to GPA Transcript',
      icon: BookOpen,
      steps: academicSteps
    },
    hr: {
      name: 'Experience D: Staff HR & Payroll',
      badge: 'Faculty Leave to Salary Disbursement',
      icon: Briefcase,
      steps: hrSteps
    },
    saas: {
      name: 'Experience E: SaaS Institution Management',
      badge: 'Registration to Dedicated DB Pool',
      icon: Building2,
      steps: saasSteps
    }
  };

  const currentConfig = experienceConfigs[activeExperience];
  const safeActiveStep = Math.min(activeStep, currentConfig.steps.length - 1);
  const currentStep = currentConfig.steps[safeActiveStep];

  return (
    <section id="workflows" className="py-24 bg-white border-y border-zinc-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Zap className="w-3.5 h-3.5" />
            Verified Operational Workflows
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            How data connects across institutional departments.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            Follow the real step-by-step state machine progressions powering admissions, fee collection, academic schedules, payroll, and multi-tenant provisioning.
          </p>
        </div>

        {/* 5-Step Connected Operational Pipeline Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {connectedPipeline.map((pipe, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveExperience(pipe.targetExp);
                setActiveStep(pipe.targetStep);
              }}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2.5 ${
                activeExperience === pipe.targetExp && safeActiveStep === pipe.targetStep
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-400">Step {pipe.step}</span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  {pipe.badge}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900">{pipe.title}</h4>
                <p className="text-[11px] text-zinc-600 leading-snug mt-1">{pipe.desc}</p>
              </div>
              <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 pt-1">
                <span>Inspect Operational View</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Experience Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80">
          {(Object.keys(experienceConfigs) as ExperienceType[]).map((expKey) => {
            const exp = experienceConfigs[expKey];
            const Icon = exp.icon;
            const isSelected = activeExperience === expKey;
            return (
              <button
                key={expKey}
                type="button"
                onClick={() => {
                  setActiveExperience(expKey);
                  setActiveStep(0);
                }}
                className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-zinc-500'}`} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-indigo-600' : 'text-zinc-400'}`}>
                    {exp.badge}
                  </span>
                </div>
                <div className="text-xs font-bold mt-1 truncate">{exp.name.split(':')[1]}</div>
              </button>
            );
          })}
        </div>

        {/* Interactive Workspace Container */}
        <div className="bg-zinc-50 rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          
          {/* Top Workflow Stepper Strip */}
          <div className="bg-white border-b border-zinc-200 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                  {currentConfig.name}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-0.5">
                  Step {safeActiveStep + 1} of {currentConfig.steps.length}: {currentStep.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span>API Endpoint:</span>
                <code className="px-2 py-0.5 bg-zinc-100 rounded text-zinc-800 font-semibold">{currentStep.api}</code>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
              {currentConfig.steps.map((st, idx) => {
                const isActive = safeActiveStep === idx;
                const isPassed = safeActiveStep > idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`p-3 rounded-xl text-left border transition flex items-center justify-between ${
                      isActive
                        ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-1 ring-indigo-500'
                        : isPassed
                        ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        : 'bg-zinc-50/60 border-zinc-200/60 text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono block opacity-70">0{idx + 1}. STAGE</span>
                      <span className="text-xs font-bold block truncate">{st.title}</span>
                    </div>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operational View: Details & Real Screen Simulation */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Operational Explanation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Workflow Execution & Logic
                </span>
                <h4 className="text-xl font-bold text-zinc-900 leading-snug">
                  {currentStep.headline}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {currentStep.description}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-500 font-mono text-[11px]">
                  <span>Connected Component</span>
                  <span className="text-indigo-600 font-semibold">{currentStep.component}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 font-mono text-[11px]">
                  <span>Backend REST Target</span>
                  <span className="text-zinc-800 font-semibold">{currentStep.api}</span>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2 pt-2">
                {safeActiveStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(safeActiveStep - 1)}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    &larr; Previous Stage
                  </button>
                )}
                {safeActiveStep < currentConfig.steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(safeActiveStep + 1)}
                    className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <span>Proceed to Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Operational Workflow Complete
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Authentic Output State Preview */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                <span>Sanitized Seed Execution Preview</span>
                <span className="font-mono text-[10px]">Read-Only Sandbox</span>
              </div>
              {currentStep.preview}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default InteractiveWorkflows;
