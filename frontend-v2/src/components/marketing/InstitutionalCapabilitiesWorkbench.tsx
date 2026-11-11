import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Clock, 
  Award, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';

export type CapabilityModuleId = 'academics' | 'sis' | 'finance' | 'attendance' | 'exams' | 'hr';

interface CapabilityConfig {
  id: CapabilityModuleId;
  name: string;
  code: string;
  route: string;
  backendController: string;
  icon: React.ComponentType<{ className?: string }>;
  kpiStats: { label: string; value: string }[];
  summary: string;
  operationalTable: {
    headers: string[];
    rows: string[][];
  };
}

export const InstitutionalCapabilitiesWorkbench: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<CapabilityModuleId>('academics');

  const capabilities: CapabilityConfig[] = [
    {
      id: 'academics',
      name: 'Academics & Curriculum Planning',
      code: 'ACAD-01',
      route: '/academic/courses (CourseManager.jsx)',
      backendController: 'com.erp.academic.CourseController.java',
      icon: BookOpen,
      kpiStats: [
        { label: 'Active Courses', value: '348' },
        { label: 'Degree Programs', value: '14' },
        { label: 'Syllabus Coverage', value: '100%' }
      ],
      summary: 'Configure multi-semester credit frameworks, departmental course catalogs, prerequisites, and syllabus repositories with structured course codes.',
      operationalTable: {
        headers: ['Course Code', 'Title', 'Dept', 'Credits', 'Prerequisites', 'Status'],
        rows: [
          ['CS-305', 'Distributed Systems & Cloud', 'CSE', '4.0', 'CS-201 (OS)', 'Active • Fall 2026'],
          ['CS-308', 'Cloud Architecture Labs', 'CSE', '3.0', 'CS-305', 'Active • Fall 2026'],
          ['MATH-204', 'Multivariable Calculus', 'Math', '4.0', 'MATH-101', 'Active • Fall 2026'],
          ['AI-401', 'Deep Neural Networks', 'AI/DS', '4.0', 'CS-204 (Algo)', 'Active • Fall 2026']
        ]
      }
    },
    {
      id: 'sis',
      name: 'Student Lifecycle & Admissions (SIS)',
      code: 'SIS-02',
      route: '/students & /admissions (StudentsList.tsx)',
      backendController: 'com.erp.admissions.ApplicationController.java',
      icon: Users,
      kpiStats: [
        { label: 'Total Enrolled', value: '4,850' },
        { label: 'Intake Queue', value: '124' },
        { label: 'Retention Rate', value: '98.2%' }
      ],
      summary: 'Manage prospective applicant queues, review application statuses, assign unique Roll Numbers, and maintain permanent academic profile records.',
      operationalTable: {
        headers: ['Roll Number', 'Student Name', 'Program', 'Semester', 'CGPA', 'Dossier Status'],
        rows: [
          ['ENR-2026-001', 'Aarav Sharma', 'B.Tech CSE', 'Sem V', '3.92', 'Dean\'s List • Active'],
          ['ENR-2026-002', 'Sophia Chen', 'B.S. Biotech', 'Sem III', '3.78', 'Good Standing • Active'],
          ['ENR-2026-003', 'Marcus Vance', 'B.B.A. Finance', 'Sem V', '3.65', 'Good Standing • Active'],
          ['ENR-2026-004', 'Aanya Patel', 'B.Sc Data Sci', 'Sem I', '3.95', 'Dean\'s List • Active']
        ]
      }
    },
    {
      id: 'finance',
      name: 'Fee Management & Recurring Invoicing',
      code: 'FIN-03',
      route: '/finance/fees & /finance/ledger (FeeManager.jsx)',
      backendController: 'com.erp.finance.FeeController.java',
      icon: DollarSign,
      kpiStats: [
        { label: 'Term Invoiced', value: '₹4.36 Cr' },
        { label: 'Collection Rate', value: '94.8%' },
        { label: 'Reconciled', value: '100%' }
      ],
      summary: 'Formulate fee structures, schedule term tuition fees, generate automated student fee vouchers, and reconcile Razorpay digital gateway transactions.',
      operationalTable: {
        headers: ['Voucher ID', 'Student', 'Term Obligation', 'Amount Due', 'Gateway Status', 'Ledger'],
        rows: [
          ['INV-2026-FALL-0842', 'Aarav Mehta', 'Fall 2026 Tuition & Labs', '₹90,000.00', 'Captured (pay_RPZ842)', 'Settled (0 Bal)'],
          ['INV-2026-FALL-0843', 'Sophia Chen', 'Fall 2026 Biotech Fee', '₹85,000.00', 'Captured (pay_RPZ843)', 'Settled (0 Bal)'],
          ['INV-2026-FALL-0844', 'Marcus Vance', 'Fall 2026 B.B.A. Fee', '₹75,000.00', 'Captured (pay_RPZ844)', 'Settled (0 Bal)'],
          ['INV-2026-FALL-0845', 'Liam O\'Connor', 'Fall 2026 EEE Term Fee', '₹88,000.00', 'Pending', 'Due Nov 30']
        ]
      }
    },
    {
      id: 'attendance',
      name: 'Biometric & Class Attendance',
      code: 'ATT-04',
      route: '/operations/attendance (AttendanceTracker.jsx)',
      backendController: 'com.erp.attendance.AttendanceController.java',
      icon: Clock,
      kpiStats: [
        { label: 'Avg Attendance', value: '95.4%' },
        { label: 'RFID Daily Taps', value: '12,400' },
        { label: 'Deficit Alerts', value: '18' }
      ],
      summary: 'Record course lecture attendance with faculty entry tools, integrate RFID campus transit boarding, and automate threshold alerts for parent portals.',
      operationalTable: {
        headers: ['Lecture Session', 'Course', 'Faculty', 'Capacity', 'Present', 'Compliance Rate'],
        rows: [
          ['Wed 09:00 AM (Hall 402)', 'CS-302 Cloud Arch', 'Dr. Aris Thorne', '48 Students', '46 Present', '95.8% (Compliant)'],
          ['Wed 10:45 AM (Hall A)', 'MATH-204 Calculus', 'Prof. Elena Rostova', '120 Students', '116 Present', '96.7% (Compliant)'],
          ['Wed 01:30 PM (Lab 2)', 'CS-302 Go Sandbox', 'Dr. Aris Thorne', '48 Students', '47 Present', '97.9% (Compliant)'],
          ['Wed 03:00 PM (Hall 105)', 'EE-201 Circuits', 'Dr. Rajesh Rao', '60 Students', '54 Present', '90.0% (Compliant)']
        ]
      }
    },
    {
      id: 'exams',
      name: 'Examinations & Grade Books',
      code: 'EXAM-05',
      route: '/academic/exams (ExamManager.jsx)',
      backendController: 'com.erp.exam.ExamController.java',
      icon: Award,
      kpiStats: [
        { label: 'Exams Configured', value: '96' },
        { label: 'SEB Verified', value: '100%' },
        { label: 'Average GPA', value: '3.71' }
      ],
      summary: 'Schedule formative assessments and semester finals, assign exam halls, record subject scores, and publish official digital transcripts.',
      operationalTable: {
        headers: ['Assessment', 'Course Code', 'Exam Hall', 'SEB Lockdown', 'Enrolled', 'Grade Scale'],
        rows: [
          ['Midterm Assessment', 'CS-301 (Cloud Computing)', 'Hall 402', 'Enforced (SEB 3.4)', '48 Students', 'Letter (A+ to F)'],
          ['Midterm Assessment', 'MATH-204 (Calculus)', 'Auditorium A', 'Enforced (SEB 3.4)', '120 Students', 'Letter (A+ to F)'],
          ['Final Lab Practicum', 'CS-302 (Go Raft Store)', 'Computing Lab 2', 'Enforced (SEB 3.4)', '48 Students', 'Rubric (100 Pts)'],
          ['Semester Final', 'AI-401 (Neural Nets)', 'Hall 301', 'Enforced (SEB 3.4)', '42 Students', 'Letter (A+ to F)']
        ]
      }
    },
    {
      id: 'hr',
      name: 'Staff Payroll & HR Operations',
      code: 'HR-06',
      route: '/hr/payroll & /hr/leave (LeaveManager.jsx)',
      backendController: 'com.erp.hr.PayrollController.java',
      icon: Cpu,
      kpiStats: [
        { label: 'Faculty & Staff', value: '284' },
        { label: 'Workload Balance', value: '96%' },
        { label: 'Disbursement Status', value: 'Processed' }
      ],
      summary: 'Manage faculty leave balances, process pending leave approvals, allocate teaching workloads, and disburse monthly institutional payroll.',
      operationalTable: {
        headers: ['Faculty Member', 'Department', 'Designation', 'Teaching Workload', 'Leave Balance', 'Payroll Status'],
        rows: [
          ['Dr. Aris Thorne', 'Computer Science', 'Professor & Chair', '14 Credit Hrs/Wk', '18 Days', 'Disbursed (Direct NEFT)'],
          ['Prof. Elena Rostova', 'Mathematics', 'Associate Professor', '16 Credit Hrs/Wk', '14 Days', 'Disbursed (Direct NEFT)'],
          ['Dr. Rajesh Rao', 'Electrical Engg', 'Assistant Professor', '12 Credit Hrs/Wk', '20 Days', 'Disbursed (Direct NEFT)'],
          ['Dr. Sarah Al-Mansoor', 'AI & Data Science', 'Senior Lecturer', '14 Credit Hrs/Wk', '16 Days', 'Disbursed (Direct NEFT)']
        ]
      }
    }
  ];

  const activeCapability = capabilities.find(c => c.id === activeModuleId) || capabilities[0];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-left font-sans text-zinc-900">
      
      {/* Odoo-Style Top Operations Breadcrumb & Action Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-400 font-bold uppercase text-[10px]">Odoo-Standard ERP Operations</span>
          <span className="text-zinc-300">/</span>
          <span className="font-bold text-zinc-800">Operational Subsystems</span>
          <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono text-[10px]">
            {activeCapability.code}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span>Route: <strong className="text-zinc-800">{activeCapability.route}</strong></span>
        </div>
      </div>

      {/* Main Split Layout: Left Module Directory (4 cols) & Right Operational Table (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* Left Side: 6 Capability Module Tabs */}
        <div className="lg:col-span-4 border-r border-zinc-200 bg-[#F9F9F8] p-3 sm:p-4 space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-1 font-mono">
            Institutional Modules ({capabilities.length})
          </div>

          {capabilities.map((cap) => {
            const isSelected = cap.id === activeModuleId;
            const Icon = cap.icon;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => setActiveModuleId(cap.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                  isSelected
                    ? 'bg-white border-indigo-600 text-zinc-900 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-transparent border-transparent text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-zinc-200/70 text-zinc-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{cap.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{cap.code}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {cap.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Operational Records & Live Table View */}
        <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-x-auto">
          
          <div className="space-y-6">
            
            {/* Capability Header & KPI Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900">{activeCapability.code} Subsystem Records</h3>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-xl">
                  {activeCapability.summary}
                </p>
              </div>

              {/* Smart Odoo-Style KPI Badges */}
              <div className="flex items-center gap-2 shrink-0">
                {activeCapability.kpiStats.map((kpi, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center min-w-[70px]">
                    <span className="block text-[10px] font-mono text-zinc-500">{kpi.label}</span>
                    <span className="text-xs font-bold text-zinc-900 font-mono">{kpi.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Density Data Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700">Subsystem Records ({activeCapability.operationalTable.rows.length})</span>
                <span className="font-mono text-[10px]">Backend: {activeCapability.backendController}</span>
              </div>

              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="min-w-full divide-y divide-zinc-200 text-xs">
                  <thead className="bg-zinc-50">
                    <tr>
                      {activeCapability.operationalTable.headers.map((h, i) => (
                        <th key={i} className="px-3.5 py-2.5 text-left font-bold text-zinc-700">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {activeCapability.operationalTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50/60 transition">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`px-3.5 py-2.5 ${
                            cIdx === 0 ? 'font-mono font-bold text-zinc-900' : 'text-zinc-600'
                          }`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Bottom Operational Integration Bar */}
          <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <span className="font-mono text-[11px]">Enforces Tenant RLS & Single-Tenant Schema Isolation</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Operational Coverage in V1.4</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default InstitutionalCapabilitiesWorkbench;