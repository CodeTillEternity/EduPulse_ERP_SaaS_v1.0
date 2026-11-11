import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Search,
  Clock,
  Check,
  Lock,
  Video
} from 'lucide-react';

type ConsoleTab = 'students' | 'timetable' | 'finance' | 'exams';

export const InstitutionalProductMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('students');
  const [searchFilter, setSearchFilter] = useState('');

  // Real world institutional student data
  const students = [
    {
      rollNo: 'ENR-2026-0104',
      name: 'Aarav Mehta',
      program: 'B.Tech Computer Science',
      semester: 'Semester V',
      standing: "Dean's List",
      cgpa: '3.92',
      feeStatus: 'PAID',
      receiptNo: 'RCP-8912',
      attendance: '96.4%'
    },
    {
      rollNo: 'ENR-2026-0105',
      name: 'Sophia Chen',
      program: 'B.S. Biomedical Engineering',
      semester: 'Semester III',
      standing: 'Good Standing',
      cgpa: '3.78',
      feeStatus: 'PAID',
      receiptNo: 'RCP-8913',
      attendance: '94.2%'
    },
    {
      rollNo: 'ENR-2026-0106',
      name: 'Marcus Vance',
      program: 'B.B.A. Financial Economics',
      semester: 'Semester V',
      standing: 'Good Standing',
      cgpa: '3.65',
      feeStatus: 'PAID',
      receiptNo: 'RCP-8914',
      attendance: '91.8%'
    },
    {
      rollNo: 'ENR-2026-0107',
      name: 'Ananya Sharma',
      program: 'B.Tech Data Science & AI',
      semester: 'Semester I',
      standing: "Dean's List",
      cgpa: '3.95',
      feeStatus: 'PAID',
      receiptNo: 'RCP-8915',
      attendance: '98.1%'
    },
    {
      rollNo: 'ENR-2026-0108',
      name: 'Liam O\'Connor',
      program: 'B.S. Electrical & Electronics',
      semester: 'Semester III',
      standing: 'Good Standing',
      cgpa: '3.52',
      feeStatus: 'PENDING',
      receiptNo: 'INV-2026-094',
      attendance: '88.5%'
    }
  ];

  // Real world timetable lecture slots
  const timetableSlots = [
    {
      time: '09:00 AM – 10:30 AM',
      courseCode: 'CS-301',
      courseTitle: 'Distributed Systems & Cloud Computing',
      hall: 'Lecture Hall 402 (Cap: 60)',
      faculty: 'Dr. Aris Thorne',
      badge: 'Google Meet Connected',
      isOnline: true,
      batch: 'Batch 2024-A'
    },
    {
      time: '10:45 AM – 12:15 PM',
      courseCode: 'MATH-204',
      courseTitle: 'Multivariable Calculus & Linear Algebra',
      hall: 'Auditorium Hall A (Cap: 120)',
      faculty: 'Prof. Elena Rostova',
      badge: 'In-Person Lecture',
      isOnline: false,
      batch: 'Batch 2025-Common'
    },
    {
      time: '01:30 PM – 03:00 PM',
      courseCode: 'CS-205',
      courseTitle: 'Data Structures & Algorithms Laboratory',
      hall: 'Advanced Computing Lab 2',
      faculty: 'Dr. Rajiv Raman',
      badge: 'Practical Session',
      isOnline: false,
      batch: 'Batch 2025-CS'
    },
    {
      time: '03:15 PM – 04:45 PM',
      courseCode: 'EE-210',
      courseTitle: 'Digital Logic & Microprocessor Architecture',
      hall: 'Room 308 (Cap: 50)',
      faculty: 'Prof. Sarah Jenkins',
      badge: 'Google Meet Connected',
      isOnline: true,
      batch: 'Batch 2024-EE'
    }
  ];

  // Real world institutional fee heads & settled transactions
  const feeVouchers = [
    {
      id: 'TXN-8921',
      student: 'Aarav Mehta',
      rollNo: 'ENR-2026-0104',
      head: 'Fall 2026 Tuition & Computing Fee',
      amount: '₹65,000.00',
      mode: 'Razorpay UPI (Instant)',
      date: 'Today, 10:14 AM',
      status: 'SETTLED'
    },
    {
      id: 'TXN-8922',
      student: 'Sophia Chen',
      rollNo: 'ENR-2026-0105',
      head: 'Biomedical Laboratory & Term Tuition',
      amount: '₹72,500.00',
      mode: 'Razorpay Netbanking',
      date: 'Today, 09:32 AM',
      status: 'SETTLED'
    },
    {
      id: 'TXN-8923',
      student: 'Marcus Vance',
      rollNo: 'ENR-2026-0106',
      head: 'Economics Term Fee & Athletics Head',
      amount: '₹58,000.00',
      mode: 'Razorpay Card (Visa)',
      date: 'Yesterday, 04:45 PM',
      status: 'SETTLED'
    },
    {
      id: 'TXN-8924',
      student: 'Ananya Sharma',
      rollNo: 'ENR-2026-0107',
      head: 'Freshman Academic Term Registration',
      amount: '₹80,000.00',
      mode: 'Razorpay UPI (PhonePe)',
      date: 'Yesterday, 02:18 PM',
      status: 'SETTLED'
    }
  ];

  const filteredStudents = students.filter(s => 
    searchFilter === '' || 
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.program.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full rounded-2xl bg-white border border-zinc-200/90 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.07)] overflow-hidden font-sans text-left">
      
      {/* 1. Authentic Application Chrome Header */}
      <div className="px-4 py-3 bg-zinc-900 text-white flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          {/* Mac style dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Real application path & Tenant scope */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">
              <span className="text-emerald-400 font-bold">app.edupulse.io</span>
              <span className="text-zinc-500">/admin/dashboard</span>
            </div>
            <span className="text-zinc-500 hidden md:inline">•</span>
            <span className="text-zinc-400 text-xs font-medium hidden md:inline">
              Apex Institute of Technology • Fall 2026 Semester
            </span>
          </div>
        </div>

        {/* Operational Security Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-zinc-300 font-medium font-mono">
            PostgreSQL RLS Active • Scoped
          </span>
        </div>
      </div>

      {/* 2. Campus Console Navigation Strip */}
      <div className="px-5 py-3.5 border-b border-zinc-200/80 bg-zinc-50/70 flex flex-wrap items-center justify-between gap-4">
        
        {/* Workspace Identity */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            EP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900">EduPulse Institutional Operating System</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200">
                Registrar Core
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 block -mt-0.5">
              1,248 Enrolled Students • 14 Accredited Programs • 42 Faculty Members
            </span>
          </div>
        </div>

        {/* Console View Switcher Tabs */}
        <div className="flex items-center p-1 bg-zinc-200/70 rounded-xl border border-zinc-300/60 text-xs font-medium text-zinc-700">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-white text-zinc-900 shadow-xs font-bold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student SIS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'timetable'
                ? 'bg-white text-zinc-900 shadow-xs font-bold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable & Meet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'finance'
                ? 'bg-white text-zinc-900 shadow-xs font-bold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Razorpay Fees</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'exams'
                ? 'bg-white text-zinc-900 shadow-xs font-bold'
                : 'hover:text-zinc-900 text-zinc-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Exams & SEB</span>
          </button>
        </div>

      </div>

      {/* 3. Main Workspace Display */}
      <div className="p-6 bg-white min-h-[440px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: STUDENT INFORMATION SYSTEM (SIS) */}
          {activeTab === 'students' && (
            <motion.div
              key="tab-students"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, roll no, or program..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-zinc-500">
                  <span className="font-medium">Active Cohort: Fall 2026</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700">
                    Registrar Dossier Index
                  </span>
                </div>
              </div>

              {/* Real World Student Data Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Roll Number</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Degree Track / Major</th>
                      <th className="py-2.5 px-4">Academic Standing</th>
                      <th className="py-2.5 px-4">Attendance</th>
                      <th className="py-2.5 px-4">Tuition Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filteredStudents.map((student) => (
                      <tr key={student.rollNo} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                          {student.rollNo}
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-900">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          <div>{student.program}</div>
                          <span className="text-[10px] text-zinc-400">{student.semester}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.standing.includes("Dean") 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}>
                            {student.standing} ({student.cgpa})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-700">
                          {student.attendance}
                        </td>
                        <td className="py-3 px-4">
                          {student.feeStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <Check className="w-3 h-3" />
                              <span>PAID • {student.receiptNo}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              <span>PENDING • Due Soon</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            type="button"
                            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-[11px] transition shadow-2xs"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Summary Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-zinc-500">
                <span>Showing 1–5 of 1,248 permanent institutional student records</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>PostgreSQL RLS Filter: tenant_id = 'apex_university'</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TIMETABLE & GOOGLE MEET */}
          {activeTab === 'timetable' && (
            <motion.div
              key="tab-timetable"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Day selector & Route info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-lg text-xs font-semibold">
                  <span className="px-3 py-1 bg-white text-zinc-900 rounded-md shadow-2xs">Monday Schedule</span>
                  <span className="px-3 py-1 text-zinc-500">Tuesday</span>
                  <span className="px-3 py-1 text-zinc-500">Wednesday</span>
                  <span className="px-3 py-1 text-zinc-500">Thursday</span>
                  <span className="px-3 py-1 text-zinc-500">Friday</span>
                </div>

                <div className="text-xs text-zinc-500 font-mono">
                  Module: TimetableManager (/operations/timetable)
                </div>
              </div>

              {/* Timetable Lecture Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timetableSlots.map((slot, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-zinc-50 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {slot.time}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-200/80 font-mono text-[10px] font-bold text-zinc-700">
                        {slot.courseCode}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{slot.courseTitle}</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{slot.hall} • Faculty: {slot.faculty}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-medium">{slot.batch}</span>
                      {slot.isOnline ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shadow-2xs">
                          <Video className="w-3 h-3 text-emerald-600" />
                          <span>Google Meet Ready</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-medium">In-Person Attendance</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
                <span>Synchronized with enrolled student timetables inside <span className="font-mono text-zinc-900">/portal/schedule</span></span>
                <span className="text-emerald-700 font-medium">Clash Detection: 0 Conflicts</span>
              </div>
            </motion.div>
          )}

          {/* TAB 3: BURSAR & RAZORPAY FEE COLLECTION */}
          {activeTab === 'finance' && (
            <motion.div
              key="tab-finance"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Financial Metrics Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Term Obligation</span>
                  <div className="text-lg font-bold text-zinc-900 mt-1">₹42,85,000</div>
                  <span className="text-[10px] text-zinc-500">Fall 2026 Term Invoiced</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Razorpay Settled</span>
                  <div className="text-lg font-bold text-emerald-900 mt-1">₹39,20,000</div>
                  <span className="text-[10px] text-emerald-700">91.5% Collection Ratio</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pending Receivables</span>
                  <div className="text-lg font-bold text-amber-900 mt-1">₹3,65,000</div>
                  <span className="text-[10px] text-amber-700">Due before Nov 15</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Reconciliation Rate</span>
                  <div className="text-lg font-bold text-zinc-900 mt-1">100% Auto</div>
                  <span className="text-[10px] text-zinc-500">Zero Unmatched Challans</span>
                </div>
              </div>

              {/* Real World Payment Voucher Ledger */}
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-800">
                  <span>Recent Settled Transactions via Razorpay Gateway</span>
                  <span className="text-[11px] font-medium text-zinc-600">Bursar Ledger Audit Trail</span>
                </div>
                <div className="divide-y divide-zinc-100 text-xs">
                  {feeVouchers.map((voucher) => (
                    <div key={voucher.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-zinc-50/80 transition">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{voucher.student}</span>
                          <span className="font-mono text-[10px] text-zinc-500">({voucher.rollNo})</span>
                          <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            {voucher.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600">{voucher.head} • {voucher.mode}</p>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-zinc-900">{voucher.amount}</div>
                        <div className="text-[10px] text-zinc-400">{voucher.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: EXAM SECURITY & SAFE EXAM BROWSER */}
          {activeTab === 'exams' && (
            <motion.div
              key="tab-exams"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* SEB Integrity Banner */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">Safe Exam Browser (SEB 3.x) Active Lockdown</h4>
                    <p className="text-[11px] text-indigo-800/80">Tamper-resistant testing environment configured for high-stakes assessments.</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-white text-indigo-900 font-mono text-[10px] font-bold border border-indigo-200 shadow-2xs">
                  BrowserExamKey Handshake Verified
                </span>
              </div>

              {/* Assessment details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Active Test</span>
                  <div className="text-xs font-bold text-zinc-900">CS-301 Midterm Examination</div>
                  <p className="text-[11px] text-zinc-600">60 Enrolled Candidates • Duration: 120 Mins</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Kiosk Sandboxing</span>
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Enforced &amp; Locked
                  </div>
                  <p className="text-[11px] text-zinc-600">Secondary displays &amp; shortcuts suppressed</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gradebook Sync</span>
                  <div className="text-xs font-bold text-zinc-900">Automated CGPA Grading</div>
                  <p className="text-[11px] text-zinc-600">Syncs directly to official student transcript</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
                <span>Registrar grade sheet compilation &amp; credit auditing</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Instant Transcript Sync
                </span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 4. Real World Console Footer */}
      <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-sans">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium text-zinc-700">Enterprise Operating Console</span>
          <span className="text-zinc-400">•</span>
          <span>Multi-Tenant Enterprise Isolation • RLS Bound</span>
        </div>
        <div className="font-medium text-zinc-600">
          EduPulse ERP Core v1.4
        </div>
      </div>

    </div>
  );
};

export default InstitutionalProductMockup;
