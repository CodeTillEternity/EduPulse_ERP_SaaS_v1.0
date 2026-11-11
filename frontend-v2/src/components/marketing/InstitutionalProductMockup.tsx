import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  BookOpen, 
  Calendar
} from 'lucide-react';

type TabKey = 'overview' | 'students' | 'courses' | 'fees';

export const InstitutionalProductMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Real data schemas matching ManagementDashboard.tsx and StudentsList.tsx
  const kpis = [
    { label: 'Enrolled Students', value: '1,248', desc: 'Across 6 active departments', icon: Users },
    { label: 'Academic Programs', value: '14', desc: 'Accredited degree tracks', icon: BookOpen },
    { label: 'Term Courses Active', value: '42', desc: 'Fall 2026 Semester', icon: Calendar },
    { label: 'Admissions In Review', value: '18', desc: 'Pending registrar review', icon: CheckCircle2 },
  ];

  const students = [
    { rollNo: 'STU-2026-001', name: 'Alex Morgan', program: 'Computer Science & Engineering', year: 'Year 3', status: 'ACTIVE', standing: 'Good Standing' },
    { rollNo: 'STU-2026-002', name: 'David Kim', program: 'Business Administration', year: 'Year 2', status: 'ACTIVE', standing: 'Dean\'s List' },
    { rollNo: 'STU-2026-003', name: 'Emma Watson', program: 'Electrical Engineering', year: 'Year 4', status: 'ACTIVE', standing: 'Good Standing' },
    { rollNo: 'STU-2026-004', name: 'Priya Sharma', program: 'Life Sciences & Biotechnology', year: 'Year 1', status: 'ACTIVE', standing: 'Good Standing' },
    { rollNo: 'STU-2026-005', name: 'Michael Chen', program: 'Applied Mathematics', year: 'Year 2', status: 'ACTIVE', standing: 'Dean\'s List' },
  ];

  const courses = [
    { code: 'CS-201', title: 'Data Structures & Algorithms', department: 'Computer Science', credits: '4 Credits', faculty: 'Dr. R. Vance', schedule: 'Mon / Wed 10:00 AM' },
    { code: 'BUS-104', title: 'Principles of Financial Accounting', department: 'Business Admin', credits: '3 Credits', faculty: 'Prof. M. Jenkins', schedule: 'Tue / Thu 02:00 PM' },
    { code: 'EE-302', title: 'Signals, Systems & DSP', department: 'Electrical Eng', credits: '4 Credits', faculty: 'Dr. K. Patel', schedule: 'Mon / Wed 01:30 PM' },
    { code: 'MATH-201', title: 'Multivariable Calculus & Linear Algebra', department: 'Mathematics', credits: '4 Credits', faculty: 'Prof. A. Thorne', schedule: 'Tue / Thu 09:00 AM' },
  ];

  const fees = [
    { voucher: 'VCH-2026-081', head: 'Semester Tuition Fee', program: 'Undergraduate Engineering', amount: '$4,500.00', dueDate: 'Oct 15, 2026', status: 'PAID' },
    { voucher: 'VCH-2026-082', head: 'Laboratory & Computing Resource', program: 'Computer Science', amount: '$350.00', dueDate: 'Oct 15, 2026', status: 'PAID' },
    { voucher: 'VCH-2026-083', head: 'Campus Health & Athletics', program: 'All Institutional Programs', amount: '$180.00', dueDate: 'Oct 15, 2026', status: 'PAID' },
    { voucher: 'VCH-2026-084', head: 'Library Access & Digital Licences', program: 'All Institutional Programs', amount: '$120.00', dueDate: 'Nov 01, 2026', status: 'PENDING' },
  ];

  return (
    <div className="w-full rounded-2xl bg-white border border-zinc-200/90 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.06)] overflow-hidden font-sans text-left">
      
      {/* 1. Realistic Browser Chrome Frame */}
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
          </div>
          <div className="h-4 w-px bg-zinc-200 mx-1" />
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-xs font-medium text-zinc-700 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono text-[11px] text-zinc-600">app.edupulse.io/admin/dashboard</span>
          </div>
        </div>

        {/* Real architectural status */}
        <div className="flex items-center gap-2.5 text-xs text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="font-medium text-zinc-700">Tenant Context Bound: PostgreSQL RLS</span>
        </div>
      </div>

      {/* 2. Institutional Application Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
              EduPulse Institutional Operations
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-medium border border-zinc-200">
                Core Admin View
              </span>
            </div>
            <div className="text-[11px] text-zinc-500">Academic Year 2026–2027 • Fall Semester</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-zinc-100 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            Operations Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'students'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            Student SIS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'courses'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            Course Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'fees'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            Fee Structure
          </button>
        </div>
      </div>

      {/* 3. Main Product Workspace */}
      <div className="p-5 sm:p-6 bg-zinc-50/50 min-h-[420px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OPERATIONS OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-medium">{kpi.label}</span>
                        <Icon className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="text-2xl font-bold text-zinc-900">{kpi.value}</div>
                      <div className="text-[11px] text-zinc-500">{kpi.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Admissions Review Table */}
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-xs font-bold text-zinc-900">Recent Admission Inquiries & Status</span>
                  <span className="text-[11px] text-zinc-500">Live API Endpoint: /api/v1/admission-applications</span>
                </div>
                <div className="divide-y divide-zinc-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-zinc-900">Julian Hayes</span>
                      <span className="text-zinc-500 ml-2">B.S. Computer Science • Applied 2 days ago</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200">
                      APPROVED
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-zinc-900">Clara Sterling</span>
                      <span className="text-zinc-500 ml-2">M.S. Data Analytics • Applied yesterday</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                      UNDER_REVIEW
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-zinc-900">Ethan Zhao</span>
                      <span className="text-zinc-500 ml-2">B.A. Business Administration • Applied today</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                      UNDER_REVIEW
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: STUDENT SIS */}
          {activeTab === 'students' && (
            <motion.div
              key="tab-students"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Student Information Register</h4>
                  <p className="text-xs text-zinc-500">Permanent institutional records mapped to tenant partition</p>
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  Total Active Records: 1,248
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Roll Number</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Program / Major</th>
                      <th className="py-2.5 px-4">Cohort Year</th>
                      <th className="py-2.5 px-4">Academic Standing</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {students.map((student) => (
                      <tr key={student.rollNo} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-zinc-800">{student.rollNo}</td>
                        <td className="py-3 px-4 font-semibold text-zinc-900">{student.name}</td>
                        <td className="py-3 px-4 text-zinc-600">{student.program}</td>
                        <td className="py-3 px-4 text-zinc-600">{student.year}</td>
                        <td className="py-3 px-4 text-zinc-600">{student.standing}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: COURSE CATALOG */}
          {activeTab === 'courses' && (
            <motion.div
              key="tab-courses"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 space-y-4"
            >
              <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Curriculum & Course Allocation</h4>
                  <p className="text-xs text-zinc-500">Configured course definitions and assigned faculty lecturers</p>
                </div>
                <span className="text-xs font-mono text-zinc-500">Model: com.erp.academic</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.code} className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900">{course.code}</span>
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{course.credits}</span>
                    </div>
                    <div className="text-xs font-medium text-zinc-800">{course.title}</div>
                    <div className="text-xs text-zinc-500 flex items-center justify-between pt-1">
                      <span>Faculty: {course.faculty}</span>
                      <span>{course.schedule}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: FEE STRUCTURE */}
          {activeTab === 'fees' && (
            <motion.div
              key="tab-fees"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Institutional Fee Heads & Billing Vouchers</h4>
                  <p className="text-xs text-zinc-500">Automated student invoices and voucher tracking</p>
                </div>
                <div className="text-xs font-mono text-zinc-500">Model: com.erp.finance</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Voucher No</th>
                      <th className="py-2.5 px-4">Fee Head</th>
                      <th className="py-2.5 px-4">Applies To</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {fees.map((fee) => (
                      <tr key={fee.voucher} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-zinc-800">{fee.voucher}</td>
                        <td className="py-3 px-4 font-semibold text-zinc-900">{fee.head}</td>
                        <td className="py-3 px-4 text-zinc-600">{fee.program}</td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">{fee.amount}</td>
                        <td className="py-3 px-4 text-zinc-600">{fee.dueDate}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] border ${
                            fee.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 4. Footer Readout */}
      <div className="px-5 py-2.5 bg-zinc-50 border-t border-zinc-200/70 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-zinc-700">EduPulse SaaS ERP Core v1.4</span>
        </div>
        <div className="text-zinc-500 text-[11px]">
          Verified against backend modules: academic • admission • attendance • examination • finance • student
        </div>
      </div>

    </div>
  );
};

export default InstitutionalProductMockup;
