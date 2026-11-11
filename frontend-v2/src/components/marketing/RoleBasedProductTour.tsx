import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  User, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  CreditCard, 
  Layers, 
  Database
} from 'lucide-react';

export type ProductRole = 
  | 'super-admin'
  | 'admin'
  | 'faculty'
  | 'student'
  | 'parent'
  | 'finance';

interface RoleTourItem {
  id: ProductRole;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  responsibilities: string[];
  operationalWorkflows: string[];
  routePath: string;
  sourceModule: string;
}

export const RoleBasedProductTour: React.FC = () => {
  const [activeRole, setActiveRole] = useState<ProductRole>('super-admin');

  const roleDefinitions: RoleTourItem[] = [
    {
      id: 'super-admin',
      label: 'Platform Super Admin',
      badge: 'Platform Multi-Tenant Control Hub',
      icon: ShieldCheck,
      headline: 'Central tenant governance, database pool isolation, and institutional lifecycle control.',
      responsibilities: [
        'Provision new school partitions with automated 14-day evaluation windows',
        'Dynamically route enterprise tenants to dedicated PostgreSQL database pools (HikariCP)',
        'Execute immediate tenant suspension locks to block API traffic on billing defaults',
        'Audit cross-institutional infrastructure utilization and system uptime'
      ],
      operationalWorkflows: [
        'Automated multi-tenant onboarding via /api/v1/saas/public/onboard',
        'Runtime connection pool migration from SHARED to dedicated-vip-1',
        'State transition enforcement (TRIAL -> ACTIVE -> SUSPENDED)'
      ],
      routePath: '/saas-admin',
      sourceModule: 'SaaSTenantDashboard.tsx'
    },
    {
      id: 'admin',
      label: 'Institution Administrator',
      badge: 'Institutional Governance & Operations',
      icon: Building2,
      headline: 'Campus operations, admissions committee review, and academic department governance.',
      responsibilities: [
        'Review and approve prospective student applications with document verification',
        'Enroll admitted candidates and assign institutional Roll Numbers and batch cohorts',
        'Configure academic department catalogs, degree programs, and semester calendars',
        'Manage staff user accounts, role-based access permissions, and campus directories'
      ],
      operationalWorkflows: [
        'Applicant intake review and single-click student registry enrollment',
        'Department credit allocation and curriculum structure publishing',
        'Institutional user administration and audit trail supervision'
      ],
      routePath: '/dashboard',
      sourceModule: 'ManagementDashboard.tsx & Admissions.tsx'
    },
    {
      id: 'faculty',
      label: 'Faculty Member',
      badge: 'Academic Instruction & Classrooms',
      icon: GraduationCap,
      headline: 'Weekly timetable execution, student attendance registers, and continuous grading.',
      responsibilities: [
        'Access conflict-free weekly lecture schedules with integrated Google Meet classroom links',
        'Record daily lecture attendance by batch with immediate absence and shortage alerts',
        'Input examination marks evaluated against institutional GradeScale bands (A+, A, B, F)',
        'Submit faculty leave applications for administrative approval and payroll tracking'
      ],
      operationalWorkflows: [
        'Weekly lecture schedule inspection and virtual classroom dispatch',
        'Batch roster attendance marking with one-click full-present shortcuts',
        'Automated grade-point compilation syncing directly to transcripts'
      ],
      routePath: '/dashboard/operations/timetable',
      sourceModule: 'FacultyDashboard.tsx & AttendanceTracker.jsx'
    },
    {
      id: 'student',
      label: 'Student',
      badge: 'Student Self-Service Portal (B2C)',
      icon: User,
      headline: 'Personalized course schedule, real-time GPA tracking, and online fee checkout.',
      responsibilities: [
        'Review daily lecture schedules and launch virtual classroom video sessions',
        'Inspect term examination marks, credit weights, and cumulative GPA (CGPA)',
        'View institutional tuition fee vouchers and outstanding ledger balances',
        'Settle term fee invoices securely online through the integrated Razorpay checkout modal'
      ],
      operationalWorkflows: [
        'Real-time lecture timetable inspection via /portal/schedule',
        'Official academic transcript inspection via /portal/academics',
        'Razorpay checkout modal launch and instant receipt confirmation'
      ],
      routePath: '/portal',
      sourceModule: 'StudentDashboard.jsx & FeeCenter.jsx'
    },
    {
      id: 'parent',
      label: 'Parent / Guardian',
      badge: 'Guardian Oversight Portal',
      icon: Users,
      headline: 'Student attendance transparency, fee clearance verification, and faculty contact.',
      responsibilities: [
        'Monitor daily attendance percentages against the mandatory 75% academic threshold',
        'Inspect itemized tuition fee invoices, outstanding dues, and official settlement receipts',
        'Maintain emergency contact numbers and residential address verification',
        'Receive automated absence notifications and institutional term announcements'
      ],
      operationalWorkflows: [
        'Real-time attendance deficit alerting via /dashboard/attendance',
        'Historical student fee ledger and tax receipt verification',
        'Direct institutional communication with academic advisors'
      ],
      routePath: '/dashboard',
      sourceModule: 'ParentDashboard.tsx & StudentProfile.tsx'
    },
    {
      id: 'finance',
      label: 'Finance & Bursar',
      badge: 'Fee Formulation & Double-Entry Ledger',
      icon: DollarSign,
      headline: 'Comprehensive fee schedule formulation, batch invoice runs, and payment reconciliation.',
      responsibilities: [
        'Formulate institutional fee structures linked to specific batches and programs',
        'Generate automated term invoices in bulk for entire student cohorts',
        'Maintain student debit/credit ledgers with transaction references and payment rails',
        'Reconcile online Razorpay payment settlements against institutional bank accounts'
      ],
      operationalWorkflows: [
        'Multi-head fee blueprint creation (Tuition, Lab, Caution, Exam)',
        'Batch invoice generation with custom due dates and discount policies',
        'Cashier counter payment recording and double-entry ledger audits'
      ],
      routePath: '/dashboard/finance/fees',
      sourceModule: 'FeeManager.jsx & StudentLedger.jsx'
    }
  ];

  const currentRole = roleDefinitions.find(r => r.id === activeRole) || roleDefinitions[0];

  return (
    <section id="tour" className="py-20 md:py-28 bg-[#FBFBFA] border-y border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Layers className="w-3.5 h-3.5" />
            Interactive Product Tour
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Engineered for every stakeholder in your institution.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            Explore the authentic, role-tailored software interfaces that power daily institutional operations across administrators, faculty, students, and bursars.
          </p>
        </div>

        {/* Role Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-zinc-200/60 p-1.5 rounded-2xl border border-zinc-200">
          {roleDefinitions.map((role) => {
            const Icon = role.icon;
            const isSelected = activeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`py-3 px-3 rounded-xl text-left transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-zinc-500'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </div>
                <div className="text-xs font-bold truncate">{role.label}</div>
              </button>
            );
          })}
        </div>

        {/* Role Workspace Showcase Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Responsibilities & Workflows */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-200/80 bg-zinc-50/40 space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-700 border border-zinc-200">
                {currentRole.badge}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
                {currentRole.label}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                {currentRole.headline}
              </p>

              <div className="space-y-3 pt-3 border-t border-zinc-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Core Responsibilities
                </span>
                <ul className="space-y-2 text-xs text-zinc-700">
                  {currentRole.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Operational Backend Workflows
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-600 font-mono">
                  {currentRole.operationalWorkflows.map((flow, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="truncate">{flow}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-[11px]">Source: {currentRole.sourceModule}</span>
              <a
                href="#pricing"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                <span>Evaluate this role</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Column: Genuine Application Interface Representation */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-[#0F172A] text-zinc-100 flex flex-col justify-between overflow-x-auto">
            
            {/* macOS-style Window Frame Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-zinc-400">
                  EduPulse Operating Console • {currentRole.routePath}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-emerald-400 border border-zinc-700">
                AUTHENTICATED • {currentRole.id.toUpperCase()}
              </span>
            </div>

            {/* SCREEN 1: SUPER ADMIN CONTROL PLANE */}
            {activeRole === 'super-admin' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-zinc-100">Central SaaS Multi-Tenant Registry</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Total Tenants: 28</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Active: 24</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Trial: 4</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/80 text-zinc-400 font-semibold border-b border-zinc-800 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Tenant Identifier</th>
                        <th className="p-3">Institution Name</th>
                        <th className="p-3">Infrastructure Mode</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                      <tr className="hover:bg-zinc-900/40">
                        <td className="p-3 font-semibold text-indigo-300">tenant-apex</td>
                        <td className="p-3 font-sans text-zinc-200">Apex Institute of Technology</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                            Dedicated Pool (HikariCP)
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-3 text-right font-sans">
                          <span className="text-[11px] text-zinc-400 hover:text-white cursor-pointer">Manage</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-zinc-900/40">
                        <td className="p-3 font-semibold text-indigo-300">tenant-cambridge</td>
                        <td className="p-3 font-sans text-zinc-200">Cambridge Science Academy</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                            Shared Pool (RLS)
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                            TRIAL (12d left)
                          </span>
                        </td>
                        <td className="p-3 text-right font-sans">
                          <span className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold">Migrate to VIP</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-zinc-900/40">
                        <td className="p-3 font-semibold text-indigo-300">tenant-greenwood</td>
                        <td className="p-3 font-sans text-zinc-200">Greenwood Global School</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                            Shared Pool (RLS)
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                            SUSPENDED
                          </span>
                        </td>
                        <td className="p-3 text-right font-sans">
                          <span className="text-[11px] text-zinc-400 hover:text-white cursor-pointer">Reactivate</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>AbstractRoutingDataSource dynamic pool re-routing: 0ms downtime</span>
                  <span className="text-emerald-400 font-mono">Status: ALL_POOLS_HEALTHY</span>
                </div>
              </div>
            )}

            {/* SCREEN 2: INSTITUTION ADMINISTRATOR */}
            {activeRole === 'admin' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">System Users</span>
                    <div className="text-xl font-bold text-white mt-1">14</div>
                    <span className="text-[10px] text-emerald-400">14 Active • 0 Locked</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Departments</span>
                    <div className="text-xl font-bold text-white mt-1">8</div>
                    <span className="text-[10px] text-zinc-400">Undergrad & Postgrad</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total Students</span>
                    <div className="text-xl font-bold text-white mt-1">1,248</div>
                    <span className="text-[10px] text-zinc-400">Across 16 Batches</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Admissions</span>
                    <div className="text-xl font-bold text-white mt-1">19</div>
                    <span className="text-[10px] text-amber-400">Awaiting Committee</span>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200">Recent Applicant Intake Queue</span>
                    <span className="font-mono text-[10px] text-zinc-500">Route: /admissions</span>
                  </div>
                  <div className="divide-y divide-zinc-800/80 text-[11px]">
                    <div className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-zinc-100">Aanya Patel</span>
                        <span className="text-zinc-500 ml-2">B.Tech Computer Science</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px]">UNDER_REVIEW</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-zinc-100">Devansh Verma</span>
                        <span className="text-zinc-500 ml-2">B.Tech Mechanical Engineering</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">APPROVED & ENROLLED</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: FACULTY MEMBER */}
            {activeRole === 'faculty' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-zinc-100">Weekly Schedule • Dr. Aris Thorne</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Active Term: Fall 2026
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">CS-303: High-Performance Computing</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Hall 402</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">Google Meet Connected</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Monday & Wednesday • 09:00 - 10:30 AM • 48 Students Enrolled</p>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-500 transition">
                      Mark Attendance
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">CS-305: Database Internals</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Lab 201</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Tuesday & Thursday • 11:00 - 12:30 PM • 42 Students Enrolled</p>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-medium text-[11px] hover:bg-zinc-700 transition">
                      Grade Book
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 4: STUDENT PORTAL */}
            {activeRole === 'student' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Student Dossier</span>
                    <div className="text-base font-bold text-white mt-0.5">Aarav Sharma</div>
                    <span className="text-[11px] text-zinc-400 font-mono">Roll: 23CSM001 • B.Tech Computer Science</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Cumulative GPA</span>
                    <div className="text-xl font-bold text-emerald-400 mt-0.5">3.88 / 4.00</div>
                    <span className="text-[10px] text-zinc-400">Dean's Honor List</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-zinc-200">Outstanding Tuition Invoice #INV-2026-0842</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                      DUE IN 5 DAYS
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <div>
                      <span className="text-xs text-zinc-400">Payable Balance</span>
                      <div className="text-lg font-bold text-white">₹42,500</div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5">
                      <span>Pay via Razorpay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 5: PARENT PORTAL */}
            {activeRole === 'parent' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Linked Student</span>
                    <span className="font-bold text-white text-sm">Aarav Sharma</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                    Guardian: Rajesh Sharma (Father)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Attendance Rate</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">94.2%</div>
                    <span className="text-[10px] text-zinc-500">Above mandatory 75% rule</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Financial Status</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">Settled</div>
                    <span className="text-[10px] text-zinc-500">Term 4 Paid • RCP-8912</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Emergency SMS & Email Alerts: Active</span>
                  <span className="text-emerald-400">Verified Mobile: +91 9811223344</span>
                </div>
              </div>
            )}

            {/* SCREEN 6: FINANCE & BURSAR */}
            {activeRole === 'finance' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Term Invoiced</span>
                    <div className="text-lg font-bold text-white mt-1">₹42,85,000</div>
                    <span className="text-[10px] text-zinc-400">120 Students</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Settled (Razorpay)</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">₹39,20,000</div>
                    <span className="text-[10px] text-emerald-400">91.5% Collection</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Outstanding</span>
                    <div className="text-lg font-bold text-amber-400 mt-1">₹3,65,000</div>
                    <span className="text-[10px] text-amber-400">8 Vouchers Due</span>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span className="font-bold text-zinc-200">Recent Settled Transactions</span>
                    <span className="font-mono text-[10px]">Route: /finance/ledger</span>
                  </div>
                  <div className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="font-sans text-zinc-200">Aarav Sharma (23CSM001)</span>
                      <span className="text-zinc-400">Razorpay UPI</span>
                      <span className="text-emerald-400 font-bold">₹42,500 [RCP-8912]</span>
                    </div>
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="font-sans text-zinc-200">Diya Mehta (23CSF002)</span>
                      <span className="text-zinc-400">Razorpay Netbanking</span>
                      <span className="text-emerald-400 font-bold">₹42,500 [RCP-8913]</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Console Footer */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Tenant Partition: tenant-apex</span>
              <span>PostgreSQL RLS: ACTIVE</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default RoleBasedProductTour;

