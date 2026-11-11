import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  ChevronRight,
  BookOpen,
  TrendingUp,
  Lock
} from 'lucide-react';

type TabKey = 'overview' | 'students' | 'academics' | 'finance';

export const InstitutionalProductMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Active Students', value: '3,420', change: '+8.4% vs last term', trend: 'up', icon: Users },
    { label: 'Average Attendance', value: '96.2%', change: 'Biometric RFID synced', trend: 'neutral', icon: CheckCircle2 },
    { label: 'Fee Collection', value: '$2.84M', change: '91.6% of term target', trend: 'up', icon: DollarSign },
    { label: 'Exam Integrity Index', value: '100%', change: 'Safe Exam Browser active', trend: 'up', icon: Lock },
  ];

  const students = [
    { id: 'STU-2026-001', name: 'Sophia Chen', program: 'B.S. Computer Science', year: 'Year 3', gpa: '3.92', status: 'Enrolled', balance: 'Paid in Full' },
    { id: 'STU-2026-002', name: 'Marcus Vance', program: 'B.A. Economics & Finance', year: 'Year 2', gpa: '3.78', status: 'Enrolled', balance: 'Paid in Full' },
    { id: 'STU-2026-003', name: 'Elena Rostova', program: 'M.S. Data Science', year: 'Year 1', gpa: '4.00', status: 'Enrolled', balance: '$1,200 Pending' },
    { id: 'STU-2026-004', name: 'Devon Brooks', program: 'B.S. Mechanical Engineering', year: 'Year 4', gpa: '3.65', status: 'Enrolled', balance: 'Paid in Full' },
    { id: 'STU-2026-005', name: 'Aria Patel', program: 'B.S. Biomedical Computing', year: 'Year 2', gpa: '3.88', status: 'Enrolled', balance: 'Scholarship' },
  ];

  const timetable = [
    { time: '09:00 - 10:30 AM', course: 'CS-301 Distributed Systems', room: 'Lecture Hall B', faculty: 'Dr. Arthur Sterling', attendance: '98% Present' },
    { time: '11:00 - 12:30 PM', course: 'ECON-204 Macroeconomic Theory', room: 'Hall 4A', faculty: 'Prof. Margaret Hayes', attendance: '95% Present' },
    { time: '02:00 - 03:30 PM', course: 'BIO-210 Genomics & Bio-Informatics', room: 'Science Lab 3', faculty: 'Dr. Sarah Jenkins', attendance: '94% Present' },
    { time: '04:00 - 05:30 PM', course: 'MATH-102 Multivariable Calculus', room: 'Main Auditorium', faculty: 'Prof. David Thorne', attendance: '97% Present' },
  ];

  const transactions = [
    { id: 'TXN-89412', student: 'Marcus Vance', head: 'Term 2 Tuition Fee', amount: '$6,200.00', date: 'Today, 09:14 AM', method: 'Razorpay Corporate Card', status: 'Reconciled' },
    { id: 'TXN-89411', student: 'Sophia Chen', head: 'Advanced Robotics Lab Fee', amount: '$450.00', date: 'Yesterday', method: 'Netbanking Auto-Debit', status: 'Reconciled' },
    { id: 'TXN-89410', student: 'Devon Brooks', head: 'Library Resource & Tech Fee', amount: '$250.00', date: 'Nov 10, 2026', method: 'Razorpay UPI Mandate', status: 'Reconciled' },
    { id: 'TXN-89409', student: 'Aria Patel', head: 'Institutional Hostel Fee', amount: '$2,100.00', date: 'Nov 09, 2026', method: 'Direct Bank Wire', status: 'Reconciled' },
  ];

  return (
    <div className="w-full rounded-2xl bg-white border border-zinc-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] overflow-hidden font-sans text-left">
      
      {/* 1. Window Browser Chrome Header */}
      <div className="px-4 py-3 bg-zinc-50/90 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-300 inline-block" />
            <span className="w-3 h-3 rounded-full bg-zinc-300 inline-block" />
            <span className="w-3 h-3 rounded-full bg-zinc-300 inline-block" />
          </div>
          <div className="h-4 w-px bg-zinc-200 mx-1" />
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-xs font-medium text-zinc-700 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>portal.edupulse.io/harvard/admin</span>
          </div>
        </div>

        {/* Real-time sync status pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-medium text-zinc-700">Multi-Tenant PostgreSQL • RLS Enforced</span>
          </div>
          <span className="text-zinc-300">•</span>
          <span className="text-xs text-zinc-500 font-mono">v1.4 Live</span>
        </div>
      </div>

      {/* 2. Application Navigation & Header Bar */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            E
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
              Harvard College of Sciences & Humanities
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-medium border border-zinc-200">
                Institutional Core
              </span>
            </div>
            <div className="text-[11px] text-zinc-500">Academic Year 2026–2027 • Fall Term</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-zinc-100/80 rounded-lg border border-zinc-200/60 text-xs font-medium text-zinc-600">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            Campus Overview
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
            onClick={() => setActiveTab('academics')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'academics'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            Timetable & Attendance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'finance'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            Fee Collection
          </button>
        </div>
      </div>

      {/* 3. Main Product Workspace */}
      <div className="p-5 sm:p-6 bg-zinc-50/50 min-h-[460px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CAMPUS OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-xs font-medium">{item.label}</span>
                        <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-700">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 tracking-tight">{item.value}</div>
                      <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{item.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Two Column Layout: Today's Lectures & Recent Collections */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Active Academic Schedule (7 cols) */}
                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Academic Schedule</h4>
                      <div className="text-sm font-bold text-zinc-900 mt-0.5">Today's Class Sessions & Biometric Roster</div>
                    </div>
                    <span className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-0.5">
                      View full schedule <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {timetable.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-zinc-100 bg-zinc-50/60 hover:bg-zinc-50 transition flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-white border border-zinc-200 text-zinc-700 font-mono text-[11px]">
                            {item.time.split(' - ')[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900">{item.course}</div>
                            <div className="text-zinc-500 text-[11px]">{item.faculty} • {item.room}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                          {item.attendance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Real-Time Administrative Pulse (5 cols) */}
                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Institutional Activity</h4>
                      <div className="text-sm font-bold text-zinc-900 mt-0.5">Automated Workflows</div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5 pb-2.5 border-b border-zinc-100">
                      <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-700 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">Term 2 Examination Schedule Published</div>
                        <div className="text-zinc-500 text-[11px]">42 course sections locked with Safe Exam Browser config.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pb-2.5 border-b border-zinc-100">
                      <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 mt-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">Batch Payroll Reconciled for October</div>
                        <div className="text-zinc-500 text-[11px]">84 faculty & administrative staff deposits processed.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-md bg-zinc-100 text-zinc-700 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">Automated S3 Snapshot Completed</div>
                        <div className="text-zinc-500 text-[11px]">Full tenant schema backup encrypted with AES-256.</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Database Status: Dedicated HikariCP</span>
                    <span className="font-semibold text-zinc-700">99.99% Availability</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: STUDENT SIS ROSTER */}
          {activeTab === 'students' && (
            <motion.div
              key="tab-students"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Filter student directory by roll no, name, or program..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium border border-zinc-200">
                    Showing 5 of 3,420 Enrolled
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50/70 border-b border-zinc-200/80 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Student Name & ID</th>
                      <th className="py-2.5 px-4">Degree Program</th>
                      <th className="py-2.5 px-4">Class Year</th>
                      <th className="py-2.5 px-4">Academic GPA</th>
                      <th className="py-2.5 px-4">Fee Ledger Status</th>
                      <th className="py-2.5 px-4 text-right">Roster Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-900">{student.name}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{student.id}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-800">{student.program}</td>
                        <td className="py-3 px-4 text-zinc-600">{student.year}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{student.gpa}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            student.balance === 'Paid in Full' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : student.balance === 'Scholarship'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {student.balance}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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

          {/* TAB 3: TIMETABLE & ATTENDANCE */}
          {activeTab === 'academics' && (
            <motion.div
              key="tab-academics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Curriculum & Course Scheduling Engine</h4>
                  <p className="text-xs text-zinc-500">Real-time room occupancy, lecturer assignments, and biometric punch validation.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 font-medium">Monday Sessions</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">Biometric Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timetable.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-200/70 bg-zinc-50/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-900">{item.course}</span>
                      <span className="font-mono text-[11px] text-zinc-500">{item.time}</span>
                    </div>
                    <div className="text-xs text-zinc-600 flex items-center justify-between">
                      <span>Faculty: {item.faculty}</span>
                      <span className="text-zinc-500">{item.room}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-200/50 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Recorded Attendance</span>
                      <span className="font-bold text-emerald-700">{item.attendance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: FEE COLLECTION */}
          {activeTab === 'finance' && (
            <motion.div
              key="tab-finance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Institutional Bursar & Fee Ledger</h4>
                  <p className="text-xs text-zinc-500">Automated student invoices, Razorpay online gateway, and bank reconciliation.</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 font-medium">Today's Collections</div>
                  <div className="text-base font-bold text-zinc-900 font-mono">$18,450.00</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50/80 border-b border-zinc-200/80 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Voucher No</th>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Fee Head</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Payment Method</th>
                      <th className="py-2.5 px-4 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-zinc-800">{txn.id}</td>
                        <td className="py-3 px-4 font-semibold text-zinc-900">{txn.student}</td>
                        <td className="py-3 px-4 text-zinc-700">{txn.head}</td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">{txn.amount}</td>
                        <td className="py-3 px-4 text-zinc-600">{txn.method}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                            {txn.status}
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
          <span className="font-medium text-zinc-700">Autonomous Institutional Ledger • PostgreSQL RLS Verified</span>
        </div>
        <div className="text-zinc-500 font-mono text-[11px]">
          EduPulse ERP Enterprise • SOC2 & RBI B2B Compliant
        </div>
      </div>

    </div>
  );
};

export default InstitutionalProductMockup;
