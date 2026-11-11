import React, { useState } from 'react';
import { 
  Zap, 
  UserPlus, 
  CreditCard, 
  BookOpen, 
  Briefcase 
} from 'lucide-react';

type WorkflowId = 'lifecycle' | 'finance' | 'academic' | 'hr';

export const InteractiveWorkflows: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowId>('lifecycle');

  const workflows = [
    {
      id: 'lifecycle' as WorkflowId,
      name: 'Student Lifecycle',
      badge: 'Admission to Degree Conferral',
      icon: UserPlus,
      description: 'Prospective applicant intake, committee review, permanent roll number assignment, and cumulative transcript publishing.'
    },
    {
      id: 'finance' as WorkflowId,
      name: 'Fee Collection & Settlement',
      badge: 'Bursar Invoicing to Razorpay',
      icon: CreditCard,
      description: 'Term fee schedule creation, automated bulk student invoicing, student portal checkout, and cryptographic Razorpay signature verification.'
    },
    {
      id: 'academic' as WorkflowId,
      name: 'Academic Management',
      badge: 'Curriculum to Official GPA',
      icon: BookOpen,
      description: 'Course catalog formulation, room collision-free scheduling, daily roster attendance, and letter grade evaluations.'
    },
    {
      id: 'hr' as WorkflowId,
      name: 'Staff HR & Payroll',
      badge: 'Leave Accrual to Disbursement',
      icon: Briefcase,
      description: 'Faculty leave submissions, administrative review queues, unpaid leave deduction calculations, and monthly salary disbursement.'
    }
  ];

  return (
    <section id="workflows" className="py-24 bg-white border-y border-zinc-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
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

        {/* Workflow Switcher Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80">
          {workflows.map((wf) => {
            const Icon = wf.icon;
            const isSelected = activeWorkflow === wf.id;
            return (
              <button
                key={wf.id}
                type="button"
                onClick={() => setActiveWorkflow(wf.id)}
                className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between gap-1 ${
                  isSelected
                    ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-zinc-500'}`} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-indigo-600' : 'text-zinc-400'}`}>
                    {wf.badge}
                  </span>
                </div>
                <div className="text-xs font-bold mt-1 truncate">{wf.name}</div>
              </button>
            );
          })}
        </div>

        {/* WORKFLOW 1: STUDENT LIFECYCLE (PRESERVES EXISTING TEST QUERY STRINGS) */}
        {activeWorkflow === 'lifecycle' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between hover:bg-zinc-100/60 transition space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                    01
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Inquiry</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Admissions & Inquiry</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Prospective student applies via the public admission portal. Application is saved to the admission queue for committee evaluation.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 text-[10px] text-zinc-600 space-y-1">
                <div className="font-semibold text-zinc-900">Application #APP-8021</div>
                <div>Status: <span className="text-amber-600 font-bold">UNDER_REVIEW</span></div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /admissions
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between hover:bg-zinc-100/60 transition space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                    02
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Enrollment</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Enrollment Registry</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Registrar approves application. Student profile is allocated a permanent Roll Number, batch assignment, and student portal credentials.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 text-[10px] text-zinc-600 space-y-1">
                <div className="font-semibold text-zinc-900">Aarav Sharma</div>
                <div className="font-mono text-emerald-700 font-bold">Roll: 23CSM001</div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /admissions/enroll
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between hover:bg-zinc-100/60 transition space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                    03
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Academics</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Course & Timetable</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Credits allocate to enrolled courses. Lecture timetables, room assignments, and faculty attendance registers populate automatically.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 text-[10px] text-zinc-600 space-y-1">
                <div className="font-semibold text-zinc-900">CS-402 Advanced Distributed Algorithms</div>
                <div>Hall 402 • 09:00 - 10:30 AM</div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /academic/courses
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between hover:bg-zinc-100/60 transition space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                    04
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Treasury</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Fee Voucher Issuance</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Tuition invoices generate based on enrolled credit hours and program fee structures. Students pay via the portal or Razorpay gateway.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 text-[10px] text-zinc-600 space-y-1">
                <div className="font-semibold text-zinc-900">Invoice #INV-2026-0842</div>
                <div className="text-emerald-700 font-bold">₹42,500 • Razorpay Ready</div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /finance/fees
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between hover:bg-zinc-100/60 transition space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                    05
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Graduation</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Exams & Transcripts</h3>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Final exam hall tickets issue upon fee clearance. Course marks compile into cumulative GPA/CGPA and verified digital transcripts.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 text-[10px] text-zinc-600 space-y-1">
                <div className="font-semibold text-zinc-900">Official Transcript</div>
                <div className="text-emerald-700 font-bold">3.88 CGPA • Degree Cleared</div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                Route: /academic/transcripts
              </div>
            </div>

          </div>
        )}

        {/* WORKFLOW 2: FEE COLLECTION & SETTLEMENT */}
        {activeWorkflow === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">01</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Fee Blueprint Formulation</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Bursar configures itemized fee heads (Tuition, Lab, Caution, Exams) and bundles them into batch-specific blueprints.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/finance/structures</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">02</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Batch Invoice Generation</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Finance engine generates itemized student fee vouchers for entire cohort batches in a single transactional run.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/finance/invoices/batch</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">03</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Student Fee Center Access</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Enrolled students inspect outstanding dues, due dates, fee breakdown heads, and click "Pay Now" on their dashboard.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">GET /api/v1/portal/fees/invoices</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">04</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Razorpay Checkout Modal</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Frontend loads Checkout.js, creates signed order with amount in paise, and opens UPI/Card/Netbanking payment modal.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-emerald-700">window.Razorpay(options)</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">05</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Cryptographic Ledger Sync</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Backend validates HMAC-SHA256 signature against Razorpay secret, marks invoice PAID, and appends payment to student ledger.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-emerald-700">HMAC-SHA256 Verified</div>
            </div>

          </div>
        )}

        {/* WORKFLOW 3: ACADEMIC & EXAMS */}
        {activeWorkflow === 'academic' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">01</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Course & Prerequisite Catalog</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Deans configure course offerings, required credit points, and mandatory prerequisites in the academic catalog.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/academic/courses</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">02</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Collision-Free Scheduling</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Timetable matrix assigns faculty, day of week, time window, and room numbers with server-enforced clash detection.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/operations/timetable</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">03</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Daily Roster Attendance</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Instructors log attendance status per lecture session. Deficit flags trigger when student falls below 75% threshold.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/operations/attendance</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">04</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Exam Scheduling & Grading</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Exams link to course offerings. Faculty input raw marks that automatically resolve to institutional grade scale points.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/academic/exams/{'{id}'}/results</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">05</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Cumulative CGPA Compilation</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Academic transcript compiles weighted grade points across all completed terms into official digital transcripts.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">GET /api/v1/academic/transcripts/{'{enrollment}'}</div>
            </div>

          </div>
        )}

        {/* WORKFLOW 4: HR & PAYROLL */}
        {activeWorkflow === 'hr' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">01</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Faculty Leave Application</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Faculty submit leave dates and justification in LeaveManager. Balance validation checks remaining accrued days.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/hr/leaves</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">02</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Administrative Review Queue</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Department chairs and HR review pending applications, appending approval or rejection notes to the audit history.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">PUT /api/v1/hr/leaves/{'{id}'}/review</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">03</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Leave Deduction Calculation</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Unpaid or unapproved leaves are automatically computed as prorated deductions against faculty base compensation.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">Deduction Rule Engine</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">04</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Monthly Payroll Batch Generation</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  HR generates payslip records for all active faculty members for the selected billing month and fiscal year.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-indigo-700">POST /api/v1/hr/payroll/generate</div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center mb-3">05</div>
                <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">Salary Disbursement Stamping</h4>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Upon institutional treasury clearance, payslips are stamped as PAID with official disbursement audit timestamps.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-emerald-700">PUT /api/v1/hr/payroll/{'{id}'}/pay</div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default InteractiveWorkflows;

