import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  Search
} from 'lucide-react';

export type PillarKey = 'all' | 'academics' | 'students' | 'operations' | 'finance' | 'hr' | 'platform';

export interface DomainItem {
  id: number;
  name: string;
  pillar: PillarKey;
  pillarLabel: string;
  status: 'OPERATIONAL' | 'ROADMAP';
  operationalVersion?: string;
  route?: string;
  summary: string;
  keyModules: string[];
}

export const ERP_DOMAINS: DomainItem[] = [
  // Pillar 1: Academics & Curricular Core
  {
    id: 1,
    name: 'Degree Programs & Academic Departments',
    pillar: 'academics',
    pillarLabel: 'Academics & Curricula',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/dashboard/departments',
    summary: 'Manage academic departments, degree programs (B.S., M.S., Ph.D.), accreditation mappings, and departmental chair assignments.',
    keyModules: ['Department Directory', 'Degree Track Registry', 'Program Requirements', 'Chair Allocations']
  },
  {
    id: 2,
    name: 'Course Catalog & Credit Frameworks',
    pillar: 'academics',
    pillarLabel: 'Academics & Curricula',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/academic/courses',
    summary: 'Master course definitions with code allocations, credit weighting algorithms, lecture/lab hour ratios, and syllabus bindings.',
    keyModules: ['Master Course Catalog', 'Credit Hours Engine', 'Syllabus Repository', 'Course Level Tagging']
  },
  {
    id: 3,
    name: 'Curriculum Structures & Prerequisites',
    pillar: 'academics',
    pillarLabel: 'Academics & Curricula',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/academic/courses',
    summary: 'Multi-term prerequisite chains, co-requisite rules, elective group clusters, and degree progression auditing.',
    keyModules: ['Prerequisite Validation', 'Co-Requisite Mapping', 'Elective Distribution', 'Progression Tracking']
  },
  {
    id: 4,
    name: 'Academic Years, Semesters & Terms',
    pillar: 'academics',
    pillarLabel: 'Academics & Curricula',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/dashboard/academics',
    summary: 'Define institutional academic calendars, semester term boundaries (Fall, Spring, Summer), and course registration windows.',
    keyModules: ['Academic Calendar', 'Term Lifecycle Gates', 'Add/Drop Windows', 'Registration Periods']
  },

  // Pillar 2: Student Lifecycle, Admissions & SIS
  {
    id: 5,
    name: 'Public Admissions & Application Portal',
    pillar: 'students',
    pillarLabel: 'Student SIS & Admissions',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/admissions',
    summary: 'Public prospective student application form, candidate inquiry pipelines, credential submissions, and applicant tracking.',
    keyModules: ['Public Intake Gateway', 'Inquiry Management', 'Document Uploads', 'Application Review Queue']
  },
  {
    id: 6,
    name: 'Enrollment Approval & Roll Number Registry',
    pillar: 'students',
    pillarLabel: 'Student SIS & Admissions',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/admissions/enroll',
    summary: 'Registrar committee evaluation, one-click applicant approval, batch cohort assignment, and deterministic Roll Number generation.',
    keyModules: ['Registrar Approval Action', 'Roll Number Algorithm', 'Cohort Allocation', 'Credential Provisioning']
  },
  {
    id: 7,
    name: 'Student Information System (Permanent SIS)',
    pillar: 'students',
    pillarLabel: 'Student SIS & Admissions',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/students',
    summary: 'Permanent institutional student profiles, biographical records, academic standing (Good Standing, Dean\'s List), and document repositories.',
    keyModules: ['Permanent SIS Registry', 'Standing Evaluator', 'Biographical Records', 'Student Status Logs']
  },
  {
    id: 8,
    name: 'Guardians & Emergency Contacts',
    pillar: 'students',
    pillarLabel: 'Student SIS & Admissions',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/dashboard/guardians',
    summary: 'Maintain verified parent and guardian profiles with emergency contact details, relationship mappings, and communication preferences.',
    keyModules: ['Guardian Directory', 'Parent Relationship Map', 'Emergency Protocols', 'Contact Verification']
  },
  {
    id: 9,
    name: 'Alumni Network & Degree Conferral',
    pillar: 'students',
    pillarLabel: 'Student SIS & Admissions',
    status: 'ROADMAP',
    summary: 'Graduation audit clearances, degree conferral registers, verified diploma generation, and alumni association relations.',
    keyModules: ['Graduation Auditing', 'Degree Conferral', 'Digital Diploma Ledger', 'Alumni Engagement']
  },

  // Pillar 3: Campus Operations & Resource Scheduling
  {
    id: 10,
    name: 'Timetable Scheduling & Room Allocation',
    pillar: 'operations',
    pillarLabel: 'Campus Operations',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/operations/timetable',
    summary: 'Conflict-free classroom schedule matrix, day-of-week slots, lecture hall capacity enforcement, and Google Meet integration.',
    keyModules: ['Schedule Clash Detection', 'Room Allocation Matrix', 'Google Meet Linkage', 'Batch Slot Calendars']
  },
  {
    id: 11,
    name: 'Attendance Tracking & Biometric Sync',
    pillar: 'operations',
    pillarLabel: 'Campus Operations',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/operations/attendance',
    summary: 'Daily lecture attendance logs, hardware punch sync via REST API, percentage calculations, and minimum threshold deficit alerts.',
    keyModules: ['Daily Lecture Registers', 'Biometric Hardware API', 'Attendance Percentages', 'Deficit Warning Engine']
  },
  {
    id: 12,
    name: 'Library Catalog & Circulation Lending',
    pillar: 'operations',
    pillarLabel: 'Campus Operations',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/operations/library',
    summary: 'Physical and digital book inventory by ISBN, student checkouts, loan return due dates, reservation queues, and overdue penalty logging.',
    keyModules: ['ISBN Catalog System', 'Loan Circulation Engine', 'Copy Inventory Decrement', 'Overdue Penalty Logs']
  },
  {
    id: 13,
    name: 'Campus Transport & Fleet Management',
    pillar: 'operations',
    pillarLabel: 'Campus Operations',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/operations/transport',
    summary: 'Institutional bus routes, pickup stops, vehicle capacity utilization indicators (e.g. 42/50 seats), and passenger allocations.',
    keyModules: ['Route Stop Mapping', 'Vehicle Fleet Registry', 'Real-Time Capacity KPIs', 'Student Seat Booking']
  },
  {
    id: 14,
    name: 'Hostel & Residential Housing Management',
    pillar: 'operations',
    pillarLabel: 'Campus Operations',
    status: 'ROADMAP',
    summary: 'Dormitory block configuration, room occupant check-ins, maintenance request ticketing, and residential meal plan billing.',
    keyModules: ['Room Allocation Engine', 'Check-In/Check-Out', 'Maintenance Work Orders', 'Residential Billing']
  },

  // Pillar 4: Examinations & Assessment Security
  {
    id: 15,
    name: 'Exam Scheduling & Hall Allocations',
    pillar: 'academics',
    pillarLabel: 'Exams & Security',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/academic/exams',
    summary: 'Schedule midterms, practicals, and semester finals with max mark definitions, examination hall assignments, and invigilator rosters.',
    keyModules: ['Assessment Scheduling', 'Exam Hall Assignments', 'Invigilator Allocation', 'Max Mark Thresholds']
  },
  {
    id: 16,
    name: 'Safe Exam Browser (SEB) Assessment Security',
    pillar: 'academics',
    pillarLabel: 'Exams & Security',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/academic/exams',
    summary: 'Open-source ETH Zurich SEB integration generating encrypted configuration keys, kiosk sandboxing, and BrowserExamKey handshake verification.',
    keyModules: ['SEB Profile Generator', 'BrowserExamKey Validator', 'Kiosk Sandbox Locking', 'Integrity Handshake']
  },
  {
    id: 17,
    name: 'Grading Scales, GPA & Marksheets',
    pillar: 'academics',
    pillarLabel: 'Exams & Security',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/academic/transcripts',
    summary: 'Configurable grading scales (Letter Grade, GPA points), cumulative GPA (CGPA) weighting, and digital mark compilation.',
    keyModules: ['GPA / CGPA Computation', 'Grading Scale Matrices', 'Marksheet Generation', 'Pass/Fail Thresholds']
  },
  {
    id: 18,
    name: 'Official Digital Transcripts & Verifications',
    pillar: 'academics',
    pillarLabel: 'Exams & Security',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/academic/transcripts',
    summary: 'Institutional transcript viewer, semester grade breakdown, cumulative credit summaries, and tamper-evident audit timestamps.',
    keyModules: ['Transcript Viewer (/portal)', 'Credit Completion Audit', 'Official PDF Export', 'Tamper-Evident Signatures']
  },

  // Pillar 5: Finance, Bursar & Fee Collection
  {
    id: 19,
    name: 'Fee Structures & Itemized Fee Heads',
    pillar: 'finance',
    pillarLabel: 'Finance & Ledgers',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/finance/fees',
    summary: 'Modular fee blueprint defining tuition, laboratory access, athletics, and campus fee heads mapped to academic cohorts.',
    keyModules: ['Modular Fee Blueprint', 'Multi-Head Configuration', 'Cohort Batch Mapping', 'Due Date Schedules']
  },
  {
    id: 20,
    name: 'Student Ledgers & Audit Accounting',
    pillar: 'finance',
    pillarLabel: 'Finance & Ledgers',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/finance/ledger',
    summary: 'Double-entry debit/credit student accounting ledgers, transaction histories, outstanding balance tracking, and audit statements.',
    keyModules: ['Double-Entry Ledger', 'Debit/Credit Statements', 'Outstanding Balances', 'Fiscal Audit Trails']
  },
  {
    id: 21,
    name: 'Razorpay Institutional Fee Collection Gateway',
    pillar: 'finance',
    pillarLabel: 'Finance & Ledgers',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/portal/fees',
    summary: 'Student fee payment checkout via Razorpay Checkout.js modal, HMAC-SHA256 server webhook settlement, and digital receipts.',
    keyModules: ['Razorpay Checkout Modal', 'Webhook Signature Check', 'Instant Ledger Settlement', 'Digital Tax Receipts']
  },
  {
    id: 22,
    name: 'Campus Procurement & Capital Budgeting',
    pillar: 'finance',
    pillarLabel: 'Finance & Ledgers',
    status: 'ROADMAP',
    summary: 'Departmental purchase requisition approvals, vendor bidding comparisons, purchase order dispatch, and capital asset depreciation.',
    keyModules: ['Purchase Requisitions', 'Vendor Bidding Matrix', 'Purchase Order Dispatch', 'Asset Depreciation']
  },

  // Pillar 6: Human Capital, Payroll & SaaS Platform
  {
    id: 23,
    name: 'Faculty Workloads & Teaching Allocations',
    pillar: 'hr',
    pillarLabel: 'Faculty & HR',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/dashboard/sections',
    summary: 'Faculty instructor profiles, departmental appointments, course section allocations, and weekly teaching workload caps.',
    keyModules: ['Faculty Registry', 'Workload Calculation', 'Section Assignments', 'Lecturer Schedules']
  },
  {
    id: 24,
    name: 'Staff Leave Approval & Accrual Registers',
    pillar: 'hr',
    pillarLabel: 'Faculty & HR',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/hr/leaves',
    summary: 'Faculty and staff leave applications, entitlement balances, multi-level department head approvals, and leave history logs.',
    keyModules: ['Leave Application Portal', 'Balance Accrual Ledger', 'Department Approvals', 'Absence Reconciliations']
  },
  {
    id: 25,
    name: 'Automated Monthly Payroll & Salary Vouchers',
    pillar: 'hr',
    pillarLabel: 'Faculty & HR',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/hr/payroll',
    summary: 'Salary grade formulations, unpaid leave deductions, monthly payroll generation, and itemized pay slip distributions.',
    keyModules: ['Salary Grade Formulas', 'Unpaid Leave Deductions', 'Monthly Payroll Batch', 'Itemized Pay Slips']
  },
  {
    id: 26,
    name: 'Multi-Tenant SaaS Control Plane & DB Routing',
    pillar: 'platform',
    pillarLabel: 'Platform & Tenancy',
    status: 'OPERATIONAL',
    operationalVersion: 'V1.4 Operational',
    route: '/saas-admin',
    summary: 'Super Admin tenant registry, lifecycle state enforcement, PostgreSQL Row-Level Security, and dynamic dedicated database pool migrations.',
    keyModules: ['Tenant Namespace Registry', 'Dedicated DB Routing', 'PostgreSQL RLS Engine', 'Dynamic Pool Migrations']
  }
];

export const ERPDomainsBlueprint: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<PillarKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPERATIONAL' | 'ROADMAP'>('ALL');

  const pillars = [
    { key: 'all' as PillarKey, label: 'All Functional Suites' },
    { key: 'academics' as PillarKey, label: 'Academics & Curricula' },
    { key: 'students' as PillarKey, label: 'Student SIS & Admissions' },
    { key: 'operations' as PillarKey, label: 'Campus Operations' },
    { key: 'finance' as PillarKey, label: 'Finance & Bursar' },
    { key: 'hr' as PillarKey, label: 'Faculty & HR' },
    { key: 'platform' as PillarKey, label: 'Platform Architecture' }
  ];

  const filteredDomains = ERP_DOMAINS.filter((item) => {
    const matchesPillar = selectedPillar === 'all' || item.pillar === selectedPillar;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keyModules.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPillar && matchesStatus && matchesSearch;
  });

  const operationalCount = ERP_DOMAINS.filter(d => d.status === 'OPERATIONAL').length;
  const roadmapCount = ERP_DOMAINS.filter(d => d.status === 'ROADMAP').length;

  return (
    <section id="domains" className="py-24 sm:py-32 bg-[#FBFBFA] border-t border-zinc-200/80 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>259-Module Functional Architecture Across 23 Institutional Suites</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Complete Institutional ERP Breadth.
          </h2>

          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-normal">
            EduPulse replaces fragmented single-purpose tools with one unified institutional operating system. Explore the operational depth of each functional domain below, with clear verification of currently active capabilities versus enterprise roadmap areas.
          </p>

          {/* Verification KPI Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{operationalCount} Core Domains Operational in V1.4</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{roadmapCount} Enterprise Extension Suites</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-700 border border-zinc-200 shadow-2xs font-mono text-[11px]">
              <span>52 PostgreSQL RLS Scoped Tables</span>
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-white rounded-2xl border border-zinc-200/90 shadow-xs space-y-4">
          
          {/* Search and Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search institutional modules and capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-zinc-500 font-medium hidden md:inline">Operational Status:</span>
              <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                  All Suites
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('OPERATIONAL')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'OPERATIONAL' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                  Active Only ({operationalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ROADMAP')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'ROADMAP' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                  Roadmap Only ({roadmapCount})
                </button>
              </div>
            </div>
          </div>

          {/* Pillar Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium pt-1 border-t border-zinc-100">
            {pillars.map((p) => {
              const isSelected = selectedPillar === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelectedPillar(p.key)}
                  className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-zinc-900 text-white font-bold shadow-2xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* 23-Domain Structured Blueprint Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDomains.map((domain) => {
            const isOperational = domain.status === 'OPERATIONAL';
            return (
              <div 
                key={domain.id}
                className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-2xs hover:shadow-sm transition flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-3">
                  {/* Top Domain ID & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {domain.pillarLabel}
                    </span>

                    {isOperational ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>V1.4 Operational</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-medium">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>Blueprint Roadmap</span>
                      </span>
                    )}
                  </div>

                  {/* Domain Title */}
                  <h3 className="font-bold text-sm text-zinc-900 leading-snug">
                    {domain.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    {domain.summary}
                  </p>

                  {/* Key Module Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {domain.keyModules.map((mod, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200/70 text-[10px] text-zinc-600 font-medium"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Operational Status */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                  {isOperational ? (
                    <div className="text-zinc-800 font-medium text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Operational Module</span>
                    </div>
                  ) : (
                    <span className="text-zinc-400">Enterprise Expansion Suite</span>
                  )}

                  <span className="text-[10px] text-zinc-400 font-medium">
                    {isOperational ? 'Ready to Deploy' : 'Planned'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Scope Assurance Card */}
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-bold text-zinc-900 text-sm block">Authentic Institutional Software</span>
            <p className="max-w-2xl text-zinc-500 text-[11px] leading-relaxed">
              Every operational module is live and fully accessible in your self-serve institutional evaluation environment.
            </p>
          </div>
          <a
            href="#pricing"
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs whitespace-nowrap hover:bg-zinc-800 transition"
          >
            Review Institutional Tiers
          </a>
        </div>

      </div>
    </section>
  );
};

export default ERPDomainsBlueprint;
