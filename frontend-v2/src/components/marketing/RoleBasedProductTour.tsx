import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  User, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Layers, 
  X
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

  // Interactive controls for live demonstrations
  const [tenantFilter, setTenantFilter] = useState<'ALL' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [selectedAdminApplicant, setSelectedAdminApplicant] = useState<'aanya' | 'devansh'>('aanya');
  const [facultyAttendanceMarked, setFacultyAttendanceMarked] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({
    'ENR-01': 'PRESENT',
    'ENR-02': 'PRESENT',
    'ENR-03': 'LATE',
    'ENR-04': 'ABSENT'
  });
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  const roleDefinitions: RoleTourItem[] = [
    {
      id: 'super-admin',
      label: 'Platform Super Admin',
      badge: 'Platform Tenant Control Console',
      icon: ShieldCheck,
      headline: 'Central tenant governance, database pool isolation, and institutional lifecycle control.',
      responsibilities: [
        'Provision new institutional partitions with automated 14-day evaluation windows',
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

  // Sanitized seeded demonstration tenants matching TenantRegistryRecord
  const demoTenants = [
    {
      tenantId: 'tenant-demo-01',
      institutionName: 'Apex Institute of Technology (Demo)',
      subdomain: 'apex',
      subscriptionTier: 'ENTERPRISE',
      accountStatus: 'ACTIVE',
      databaseRoutingKey: 'dedicated-vip-1',
      trialEndDate: '2027-12-31'
    },
    {
      tenantId: 'tenant-demo-02',
      institutionName: 'Cambridge Science Academy (Demo)',
      subdomain: 'cambridge',
      subscriptionTier: 'PRO',
      accountStatus: 'TRIAL',
      databaseRoutingKey: 'SHARED',
      trialEndDate: '12 Days Remaining'
    },
    {
      tenantId: 'tenant-demo-03',
      institutionName: 'Greenwood Global School (Demo)',
      subdomain: 'greenwood',
      subscriptionTier: 'STARTER',
      accountStatus: 'SUSPENDED',
      databaseRoutingKey: 'SHARED',
      trialEndDate: 'Expired'
    }
  ];

  const filteredTenants = demoTenants.filter(t => 
    tenantFilter === 'ALL' ? true : t.accountStatus === tenantFilter
  );

  return (
    <section id="tour" className="py-20 md:py-28 bg-[#FBFBFA] border-y border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Layers className="w-3.5 h-3.5" />
            Role-Based Operational Workspaces
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Engineered for every stakeholder in your institution.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            Interact with the authentic software interfaces that power daily institutional operations across administrators, faculty, students, and bursars.
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

            <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-500 flex items-center justify-between">
              <span>Primary Screen: <code className="font-mono text-zinc-800">{currentRole.sourceModule}</code></span>
              <span className="font-mono text-[10px] text-zinc-400">Route: {currentRole.routePath}</span>
            </div>
          </div>

          {/* Right Column: Live Interactive ERP Workspace */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-zinc-950 text-white flex flex-col justify-between overflow-x-auto">
            
            {/* Top Workspace Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-zinc-300">Demonstration Session • {currentRole.sourceModule}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Sanitized Seed Data
              </span>
            </div>

            {/* SCREEN 1: SUPER ADMIN CONTROL PLANE */}
            {activeRole === 'super-admin' && (
              <div className="py-6 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-zinc-400">Filter Tenants:</span>
                    {(['ALL', 'TRIAL', 'ACTIVE', 'SUSPENDED'] as const).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setTenantFilter(status)}
                        className={`px-2 py-0.5 rounded text-[10px] transition ${
                          tenantFilter === status
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-500">API: /api/v1/saas/admin/tenants</span>
                </div>

                <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                      <tr>
                        <th className="p-3">Tenant Identifier</th>
                        <th className="p-3">Institution Name</th>
                        <th className="p-3">Database Pool</th>
                        <th className="p-3">Account State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredTenants.map(t => (
                        <tr key={t.tenantId} className="hover:bg-zinc-900/40">
                          <td className="p-3 font-semibold text-indigo-300">{t.tenantId}</td>
                          <td className="p-3 font-sans text-zinc-200">{t.institutionName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              t.databaseRoutingKey === 'dedicated-vip-1'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}>
                              {t.databaseRoutingKey}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              t.accountStatus === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : t.accountStatus === 'TRIAL'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {t.accountStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Routing: Dynamic HikariCP connection dispatch</span>
                  <span className="text-emerald-400 font-mono">Pool Status: CONNECTED</span>
                </div>
              </div>
            )}

            {/* SCREEN 2: INSTITUTION ADMINISTRATOR */}
            {activeRole === 'admin' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200">Admissions Review Queue (Admissions.tsx)</span>
                    <span className="font-mono text-[10px] text-zinc-500">Route: /admissions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div 
                      onClick={() => setSelectedAdminApplicant('aanya')}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedAdminApplicant === 'aanya'
                          ? 'border-indigo-500 bg-indigo-950/40'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Aanya Patel</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px]">UNDER_REVIEW</span>
                      </div>
                      <div className="text-zinc-400 text-[10px] mt-1">B.Tech Computer Science</div>
                    </div>

                    <div 
                      onClick={() => setSelectedAdminApplicant('devansh')}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedAdminApplicant === 'devansh'
                          ? 'border-indigo-500 bg-indigo-950/40'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Devansh Verma</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">APPROVED & ENROLLED</span>
                      </div>
                      <div className="text-zinc-400 text-[10px] mt-1">B.Tech Mechanical Engineering</div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-[11px] space-y-1.5 font-mono">
                    <div className="text-zinc-300 font-bold font-sans">
                      Dossier Verification: {selectedAdminApplicant === 'aanya' ? 'Aanya Patel' : 'Devansh Verma'}
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>12th Grade Transcript:</span>
                      <span className="text-emerald-400">VERIFIED (94.2%)</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Government ID Proof:</span>
                      <span className="text-emerald-400">VERIFIED (Aadhaar)</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Assigned Roll Number:</span>
                      <span className="text-indigo-300">{selectedAdminApplicant === 'aanya' ? 'Pending Approval' : 'ENR-2026-0042'}</span>
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
                    <span className="font-bold text-zinc-100">Schedule • Dr. Aris Thorne</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Fall 2026
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">CS-303: High-Performance Computing</span>
                      <div className="text-[11px] text-zinc-400">Hall 402 • Google Meet Connected</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                      09:00 - 10:30 AM
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 text-[11px] space-y-2">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Interactive Attendance Register (Click to toggle):</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      {[
                        { id: 'ENR-01', name: 'Aarav Sharma' },
                        { id: 'ENR-02', name: 'Sophia Chen' },
                        { id: 'ENR-03', name: 'Marcus Vance' },
                        { id: 'ENR-04', name: 'Ananya Sharma' }
                      ].map(std => {
                        const status = facultyAttendanceMarked[std.id];
                        return (
                          <div 
                            key={std.id}
                            onClick={() => {
                              const nextStatus = status === 'PRESENT' ? 'ABSENT' : status === 'ABSENT' ? 'LATE' : 'PRESENT';
                              setFacultyAttendanceMarked(prev => ({ ...prev, [std.id]: nextStatus }));
                            }}
                            className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between cursor-pointer hover:border-zinc-700"
                          >
                            <span className="truncate">{std.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              status === 'PRESENT'
                                ? 'bg-emerald-950 text-emerald-400'
                                : status === 'ABSENT'
                                ? 'bg-rose-950 text-rose-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}>
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 4: STUDENT */}
            {activeRole === 'student' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Aarav Sharma (ENR-2026-001)</span>
                    <span className="text-[11px] text-zinc-400">B.Tech Computer Science • Semester V</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800">
                    CGPA: 3.92
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">Term Fee Invoice #INV-2026-089</span>
                      <div className="text-[11px] text-zinc-400">Due: 2026-11-30 • Tuition & Lab Head</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">₹45,000.00</div>
                      <span className="text-[10px] text-zinc-500">Unsettled</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400">Razorpay Online Gateway:</span>
                    <button
                      type="button"
                      onClick={() => setIsRazorpayModalOpen(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Launch Razorpay Checkout</span>
                    </button>
                  </div>
                </div>

                {isRazorpayModalOpen && (
                  <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-700 text-zinc-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">Razorpay Payment Window Modal</span>
                      <button 
                        type="button" 
                        onClick={() => setIsRazorpayModalOpen(false)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-300">
                      Order: <code className="font-mono text-white">order_Rzp8921829</code> • Amount: ₹45,000.00<br />
                      Verification: Server verifies HMAC-SHA256 signature upon checkout completion.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 5: PARENT */}
            {activeRole === 'parent' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Parent Oversight • Ward: Aarav Sharma</span>
                    <span className="text-[11px] text-zinc-400">Academic Standing: Dean's Honor Roll</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800">
                    Compliant (96.4%)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-300 block">Attendance Threshold Policy:</span>
                  <p className="text-[11px] text-zinc-400">
                    Mandatory 75% attendance enforced across all registered courses. Ward currently has 54 / 56 lecture attendances recorded.
                  </p>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500">Official Settlement Receipt:</span>
                    <span className="text-emerald-400 font-mono">RCP-8912 Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 6: FINANCE */}
            {activeRole === 'finance' && (
              <div className="py-6 space-y-4 font-sans text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Bursar Double-Entry Ledger (StudentLedger.jsx)</span>
                    <span className="text-[11px] text-zinc-400">Student: ENR-2026-001 (Aarav Sharma)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800">
                    Ledger Balanced
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/60 font-mono text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-right">Debit</th>
                        <th className="p-2.5 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-[10px]">
                      <tr>
                        <td className="p-2.5 text-zinc-400">2026-10-01</td>
                        <td className="p-2.5 font-sans">Fall 2026 Tuition Voucher (INV-089)</td>
                        <td className="p-2.5 text-right text-rose-400">₹45,000</td>
                        <td className="p-2.5 text-right text-zinc-500">-</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-zinc-400">2026-10-04</td>
                        <td className="p-2.5 font-sans">Razorpay Settlement (RCP-8912)</td>
                        <td className="p-2.5 text-right text-zinc-500">-</td>
                        <td className="p-2.5 text-right text-emerald-400">₹45,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom State Bar */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Environment: Controlled Demonstration</span>
              <span className="text-zinc-400 font-mono">React v18 &bull; Tailwind CSS &bull; Spring Boot REST</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default RoleBasedProductTour;
