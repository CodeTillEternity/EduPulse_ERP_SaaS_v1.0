import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  UserPlus, 
  CreditCard, 
  BookOpen, 
  Video,
  Bus,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

export type WorkflowType = 'lifecycle' | 'finance' | 'meet' | 'resources' | 'transport';

export const InteractiveWorkflows: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType>('lifecycle');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // 5-Step Connected Operational Pipeline (Preserves required test strings)
  const connectedPipeline = [
    {
      step: '01',
      title: 'Admissions & Inquiry',
      badge: 'Public Intake Portal',
      desc: 'Applicant registers bio-data, intended major, and academic certificates.',
      targetWf: 'lifecycle' as WorkflowType,
      targetStep: 0
    },
    {
      step: '02',
      title: 'Enrollment Registry',
      badge: 'SIS Roll Allocation',
      desc: 'Committee approves applicant; system assigns permanent Roll Number.',
      targetWf: 'lifecycle' as WorkflowType,
      targetStep: 2
    },
    {
      step: '03',
      title: 'Course & Timetable',
      badge: 'Curriculum & Hall Allocation',
      desc: 'Conflict-free lecture scheduling with integrated Google Meet links.',
      targetWf: 'meet' as WorkflowType,
      targetStep: 0
    },
    {
      step: '04',
      title: 'Fee Voucher Issuance',
      badge: 'Bursar Invoicing Run',
      desc: 'Batch invoice generation and online Razorpay payment checkout.',
      targetWf: 'finance' as WorkflowType,
      targetStep: 1
    },
    {
      step: '05',
      title: 'Exams & Transcripts',
      badge: 'Grading & Official GPA',
      desc: 'Grade compilation against institutional bands and transcript issue.',
      targetWf: 'resources' as WorkflowType,
      targetStep: 2
    }
  ];

  // =========================================================================
  // WORKFLOW A: STUDENT LIFECYCLE (Consistent student: Aanya Patel & Aarav Sharma)
  // =========================================================================
  const lifecycleSteps = [
    {
      stage: 'Applicant Intake Submission',
      component: 'PublicAdmissions.tsx',
      api: 'POST /api/v1/admissions/applications',
      headline: 'Candidate Submits Credentials Online',
      description: 'Prospective student enters biographical details and uploads verified 12th grade marksheets and national identification documents.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Intake Application #APP-2026-042</span>
            <span className="text-emerald-400 font-bold">SUBMITTED</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
            <div><span className="text-zinc-500">Candidate:</span> Aanya Patel</div>
            <div><span className="text-zinc-500">Program:</span> B.Tech Computer Science</div>
            <div><span className="text-zinc-500">CBSE Aggregate:</span> 94.2% (PCM)</div>
            <div><span className="text-zinc-500">Contact:</span> aanya.patel@email.com</div>
          </div>
          <div className="p-2 bg-zinc-900 rounded text-[10px] text-zinc-400">
            Attachment: <span className="text-indigo-400">marksheet_12th_cbse.pdf</span> (Cryptographic SHA-256 Verified)
          </div>
        </div>
      )
    },
    {
      stage: 'Document Verification',
      component: 'Admissions.tsx',
      api: 'GET /api/v1/admissions/applications',
      headline: 'Admissions Committee Verification Queue',
      description: 'The admissions office reviews uploaded records against academic eligibility criteria, setting document verification flags.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Review Queue &bull; Candidate: Aanya Patel</span>
            <span className="text-amber-400 font-bold">UNDER_REVIEW</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between p-1.5 bg-zinc-900 rounded">
              <span className="text-zinc-300">12th Standard Board Marksheet</span>
              <span className="text-emerald-400 font-bold text-[10px]">VERIFIED (94.2%)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-zinc-900 rounded">
              <span className="text-zinc-300">Aadhaar National Identity Proof</span>
              <span className="text-emerald-400 font-bold text-[10px]">VERIFIED (UIDAI)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-zinc-900 rounded">
              <span className="text-zinc-300">Entrance Test Scorecard</span>
              <span className="text-emerald-400 font-bold text-[10px]">VERIFIED (Rank #412)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      stage: 'Admissions Approval & Roll Number',
      component: 'EnrollStudent.jsx',
      api: 'POST /api/v1/students/admissions/{id}/enroll',
      headline: 'Committee Approval & Automated Enrollment',
      description: 'Admissions dean grants approval. Single-click enrollment automatically allocates an institutional roll number and generates portal credentials.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>SIS Enrollment Generator</span>
            <span className="text-emerald-400 font-bold">ENROLLED</span>
          </div>
          <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-lg space-y-1">
            <div className="text-indigo-300 text-xs font-bold">Assigned Permanent Roll Number:</div>
            <div className="text-xl font-bold text-white tracking-wider">ENR-2026-0042</div>
            <div className="text-[10px] text-indigo-400">Cohort: B.Tech CS 2026–2030 &bull; Section A</div>
          </div>
          <div className="text-[10px] text-zinc-400">
            Automated Action: Student user account created &bull; Welcome email dispatched with initial password reset link.
          </div>
        </div>
      )
    },
    {
      stage: 'Master Student SIS Dossier',
      component: 'StudentProfile.tsx',
      api: 'GET /api/v1/students/{id}',
      headline: 'Centralized Student Dossier Record',
      description: 'The admitted student profile is now established in the primary student information system, linking course enrollments, attendance, and fee obligations.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-sans space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                AP
              </div>
              <div>
                <span className="font-bold text-white block">Aanya Patel</span>
                <span className="text-[10px] text-zinc-400 font-mono">ENR-2026-0042</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              ACTIVE STUDENT
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 bg-zinc-900 rounded">
              <span className="text-zinc-500 block text-[10px]">Guardian</span>
              <span className="text-zinc-200">Rajesh Patel (+91 98765 43210)</span>
            </div>
            <div className="p-2 bg-zinc-900 rounded">
              <span className="text-zinc-500 block text-[10px]">Term Obligation</span>
              <span className="text-amber-400">INV-2026-092 (₹47,500)</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  // =========================================================================
  // WORKFLOW B: FINANCE & RAZORPAY SETTLEMENT
  // =========================================================================
  const financeSteps = [
    {
      stage: 'Fee Head Blueprint Formulation',
      component: 'FeeManager.jsx',
      api: 'POST /api/v1/fees/structures',
      headline: 'Bursar Defines Fee Structure',
      description: 'Institution finance team configures itemized fee heads for the academic term (Tuition, Laboratory, Library, Examination).',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Fee Structure: Fall 2026 Engineering</span>
            <span className="text-indigo-400 font-bold">STRUCTURE SAVED</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-400">Tuition Fee (Core Head)</span>
              <span className="text-zinc-200 font-bold">₹35,000.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-400">Computing & Cloud Lab Fee</span>
              <span className="text-zinc-200 font-bold">₹10,000.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-400">Semester Examination Head</span>
              <span className="text-zinc-200 font-bold">₹2,500.00</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-bold text-emerald-400">
              <span>Total Term Obligation:</span>
              <span>₹47,500.00</span>
            </div>
          </div>
        </div>
      )
    },
    {
      stage: 'Batch Cohort Invoicing Run',
      component: 'CreateInvoiceDialog.tsx',
      api: 'POST /api/v1/fees/invoices/batch',
      headline: 'Bulk Generation of Student Invoices',
      description: 'The bursar dispatches a batch invoicing run across all enrolled students in the cohort, setting due dates and auto-penalty policies.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Batch Invoicing Run #B-2026-11</span>
            <span className="text-emerald-400 font-bold">DISPATCHED</span>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg space-y-1 text-[11px]">
            <div className="text-zinc-300 font-bold">Cohort: B.Tech Computer Science 2026</div>
            <div className="text-zinc-400">64 Invoices Generated &bull; Total Value: ₹30,40,000.00</div>
            <div className="text-emerald-400 text-[10px]">Due Date: 2026-11-30 &bull; Sample: INV-2026-089 (Aarav Sharma)</div>
          </div>
        </div>
      )
    },
    {
      stage: 'Student Portal & Razorpay Checkout',
      component: 'FeeCenter.jsx',
      api: 'POST /api/v1/portal/fees/checkout/create-order',
      headline: 'Student Launches Razorpay Checkout Modal',
      description: 'Student opens their Fee Center, selects the outstanding invoice, and launches the authentic Razorpay checkout modal supporting UPI and NetBanking.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-sans space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2 font-mono text-[11px] text-zinc-400">
            <span>Razorpay Standard Checkout SDK</span>
            <span className="text-indigo-400">checkout.js Active</span>
          </div>
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/80 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-white block text-sm">EduPulse ERP &bull; Fee Payment</span>
                <span className="text-zinc-400 text-xs font-mono">Invoice #INV-2026-089</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-mono font-bold text-base">₹47,500.00</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-indigo-900/60 text-[10px] text-zinc-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-200">UPI / QR</span>
              <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-200">NetBanking</span>
              <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-200">Cards</span>
              <span className="ml-auto text-emerald-400 font-bold">Test Mode Ready</span>
            </div>
          </div>
        </div>
      )
    },
    {
      stage: 'HMAC Signature Verification & Ledger',
      component: 'StudentLedger.jsx',
      api: 'POST /api/v1/portal/fees/checkout/verify',
      headline: 'Cryptographic Signature Verification & Ledger Credit',
      description: 'Backend verifies the HMAC-SHA256 signature token, marks invoice PAID, issues receipt RCP-8912, and reconciles the double-entry student ledger.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Student Debit/Credit Ledger Entry</span>
            <span className="text-emerald-400 font-bold">SETTLED (PAID)</span>
          </div>
          <div className="p-2.5 bg-zinc-900 rounded space-y-1 text-[11px]">
            <div className="text-zinc-300">Credit Entry: <span className="text-emerald-400 font-bold">₹47,500.00</span> &bull; Receipt: RCP-8912</div>
            <div className="text-zinc-500 text-[10px]">Razorpay Payment ID: pay_Rzp8921829 &bull; Signature Verified via HMAC-SHA256</div>
            <div className="text-zinc-400 text-[10px] pt-1 border-t border-zinc-800">Outstanding Balance: <span className="text-white font-bold">₹0.00</span></div>
          </div>
        </div>
      )
    }
  ];

  // =========================================================================
  // WORKFLOW C: GOOGLE MEET TIMETABLE INTEGRATION
  // =========================================================================
  const meetSteps = [
    {
      stage: 'Timetable Lecture Allocation',
      component: 'TimetableManager.jsx',
      api: 'POST /api/v1/academics/timetable',
      headline: 'Instructor Schedules Lecture Slot',
      description: 'Teacher opens the weekly schedule, selects course offering CS-302, and specifies lecture time and room.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Timetable Entry • Hall 402</span>
            <span className="text-emerald-400 font-bold">CONFLICT FREE</span>
          </div>
          <div className="text-[11px] text-zinc-300 space-y-1">
            <div className="font-bold text-white">CS-302: Cloud Architecture</div>
            <div className="text-zinc-400">Day: Monday & Wednesday &bull; Slot: 09:00 AM – 10:30 AM</div>
            <div className="text-zinc-400">Instructor: Dr. Aris Thorne &bull; Enrolled Students: 48</div>
          </div>
        </div>
      )
    },
    {
      stage: 'Meeting Session Link Binding',
      component: 'TimetableManager.jsx',
      api: 'POST /api/v1/academics/timetable/bind-meet',
      headline: 'Google Meet Session URL Bound to Course',
      description: 'The instructor attaches the authentic Google Meet room URL directly to the master timetable slot.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Virtual Classroom Link Binding</span>
            <span className="text-emerald-400 font-bold">BOUND</span>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg flex items-center justify-between text-[11px]">
            <div>
              <span className="text-zinc-400 block text-[10px]">Google Meet Session URL</span>
              <span className="text-emerald-400 font-bold">meet.google.com/xyz-abc</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
              Encrypted Link
            </span>
          </div>
        </div>
      )
    },
    {
      stage: 'Student Portal Synchronized Access',
      component: 'StudentDashboard.jsx',
      api: 'GET /api/v1/portal/schedule',
      headline: 'Enrolled Students Access Session Directly',
      description: 'Only enrolled students in Section A see the live join button inside their portal, preventing uninvited participant bombing.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-sans space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2 font-mono text-[11px] text-zinc-400">
            <span>Student Portal View: Aarav Sharma</span>
            <span className="text-emerald-400 font-bold">NOW ACTIVE</span>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">CS-302: Cloud Architecture</span>
              <span className="text-[11px] text-zinc-400">09:00 AM – 10:30 AM &bull; Dr. Aris Thorne</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm">
              <Video className="w-3.5 h-3.5" />
              <span>Join Google Meet</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  // =========================================================================
  // WORKFLOW D: NOTION & COURSE RESOURCES
  // =========================================================================
  const resourceSteps = [
    {
      stage: 'Faculty Resource Curation',
      component: 'CourseManager.jsx',
      api: 'POST /api/v1/academics/courses/{id}/resources',
      headline: 'Teacher Creates Rich Academic Study Materials',
      description: 'Faculty author lecture notes using markdown headings, mathematical KaTeX formulas, code snippets, and reading lists.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-1.5">
            <span>Course Notes Editor &bull; CS-302</span>
            <span className="text-indigo-400 font-bold">MARKDOWN / KATEX</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-zinc-300">
            <div className="text-indigo-300 font-bold">## Distributed Consensus: Raft Protocol</div>
            <div className="text-zinc-400 font-sans text-xs">A state machine replication algorithm for maintaining high availability.</div>
            <div className="p-2 bg-zinc-900 rounded text-emerald-300 text-[10px]">
              {`func (r *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply) { ... }`}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">KaTeX Bound: O(log N) Leader Election Convergence</div>
          </div>
        </div>
      )
    },
    {
      stage: 'Accredited Curriculum Association',
      component: 'Academics.tsx',
      api: 'PUT /api/v1/academics/courses/{id}',
      headline: 'Resource Linked to Accredited Syllabus',
      description: 'The curated resource canvas binds directly to course credits, prerequisite gates, and term examination units.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-1.5">
            <span>Course Catalog Binding</span>
            <span className="text-emerald-400 font-bold">LINKED</span>
          </div>
          <div className="p-2.5 bg-zinc-900 rounded space-y-1 text-[11px]">
            <div className="text-zinc-200 font-bold">Course: CS-302 Cloud Architecture (4 Credits)</div>
            <div className="text-zinc-400">Unit 3: Consensus & Storage &bull; Pacing: Week 7–9</div>
            <div className="text-indigo-400 text-[10px]">Linked Workspace: notion.so/apex/cs302-distributed-raft</div>
          </div>
        </div>
      )
    },
    {
      stage: 'Contextual Student Portal Display',
      component: 'StudentDashboard.jsx',
      api: 'GET /api/v1/portal/courses/{id}/resources',
      headline: 'Students Access Reading Materials Contextually',
      description: 'Enrolled students view syllabus pacing, required slide decks, and code repositories directly inside their course dashboard.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-sans space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2 font-mono text-[11px] text-zinc-400">
            <span>Student Dashboard &bull; Reading Material</span>
            <span className="text-emerald-400 font-bold">ACCESSIBLE</span>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-white block text-xs">Raft Consensus Study Guide & Code</span>
              <span className="text-[10px] text-zinc-400 font-mono">Lecture Handout #07 &bull; Updated 2 days ago</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[11px] font-mono">
              Open Canvas &rarr;
            </span>
          </div>
        </div>
      )
    }
  ];

  // =========================================================================
  // WORKFLOW E: CAMPUS TRANSPORT & FLEET MAP
  // =========================================================================
  const transportSteps = [
    {
      stage: 'Fleet Vehicle Registration',
      component: 'TransportManager.jsx',
      api: 'POST /api/v1/operations/transport/vehicles',
      headline: 'Transport Manager Registers Fleet Bus',
      description: 'Admin registers institutional vehicles with license plates, seating capacity, driver assignments, and maintenance logs.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-1.5">
            <span>Fleet Registry &bull; Vehicle Unit</span>
            <span className="text-emerald-400 font-bold">REGISTERED</span>
          </div>
          <div className="p-2.5 bg-zinc-900 rounded space-y-1 text-[11px]">
            <div className="text-white font-bold">Plate: DL-01-AB-1234 (Fleet Bus #04)</div>
            <div className="text-zinc-400">Seating Capacity: <span className="text-emerald-400 font-bold">50 Seats</span> &bull; Driver: Rajesh Kumar</div>
            <div className="text-zinc-500 text-[10px]">Speed Governor: ACTIVE &bull; GPS Telemetry: OK</div>
          </div>
        </div>
      )
    },
    {
      stage: 'Commuter Route & Stops Mapping',
      component: 'TransportManager.jsx',
      api: 'POST /api/v1/operations/transport/routes',
      headline: 'Defining Stops and Transit Geometry',
      description: 'Routes are created with designated pickup stops, transit timings, and assigned commuter fees.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-1.5">
            <span>Route Definition: North Express</span>
            <span className="text-indigo-400 font-bold">ACTIVE ROUTE</span>
          </div>
          <div className="p-2.5 bg-zinc-900 rounded text-[11px] space-y-1">
            <div className="text-zinc-300 font-bold">Stops Sequence:</div>
            <div className="text-zinc-400 text-[10px]">
              1. Main Campus (07:30 AM) &rarr; 2. North Gate (07:45 AM) &rarr; 3. Metro Stn Sec 62 (08:05 AM) &rarr; 4. City Center (08:25 AM)
            </div>
            <div className="text-emerald-400 text-[10px] pt-1">Monthly Commuter Fee: ₹1,800.00</div>
          </div>
        </div>
      )
    },
    {
      stage: 'Real Seating Capacity & Passenger Assignment',
      component: 'TransportManager.jsx',
      api: 'POST /api/v1/operations/transport/assignments',
      headline: 'Live Capacity Utilization & Student Allocation',
      description: 'Enforces maximum vehicle seating limits to prevent hazardous over-crowding; monitors real-time capacity utilization.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-sans space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2 font-mono text-[11px] text-zinc-400">
            <span>Capacity Utilization</span>
            <span className="text-amber-400 font-bold font-mono">42 / 50 Seats Filled</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Bus Occupancy: 84%</span>
              <span className="text-emerald-400 font-bold">8 Seats Available</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
          <div className="p-2 bg-zinc-900 rounded text-[11px] font-mono text-zinc-300">
            Student Assigned: Aarav Sharma (ENR-2026-001) &bull; Pickup: Metro Stn Sec 62
          </div>
        </div>
      )
    },
    {
      stage: 'Interactive Fleet Map Canvas',
      component: 'TransportManager.jsx',
      api: 'GET /api/v1/operations/transport/routes',
      headline: 'Authentic Map-Based Fleet Representation',
      description: 'Visual transit geometry showing real commuter route stops, active transit direction, and campus arrival ETA.',
      visual: (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2 font-mono text-[11px] text-zinc-400">
            <span>Transit Map Canvas &bull; Live GPS Coordinate Tracking</span>
            <span className="text-emerald-400 font-bold font-mono">ETA: 12 MIN</span>
          </div>
          
          {/* Authentic Map Graphic Canvas */}
          <div className="relative h-28 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-between px-6">
            {/* Background Grid Lines simulating map tiles */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            
            {/* Stop 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
              <span className="text-[9px] font-mono text-zinc-300 mt-1">Campus</span>
            </div>

            <div className="flex-1 h-0.5 bg-zinc-700 relative mx-2">
              <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-3 h-3 rounded-full bg-indigo-500 animate-pulse border border-white" />
            </div>

            {/* Stop 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-zinc-500 border border-white" />
              <span className="text-[9px] font-mono text-zinc-400 mt-1">North Gate</span>
            </div>

            <div className="flex-1 h-0.5 bg-zinc-700 relative mx-2" />

            {/* Stop 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
              <span className="text-[9px] font-mono text-zinc-300 mt-1 font-bold">Metro Sec 62</span>
            </div>

            <div className="flex-1 h-0.5 bg-zinc-700 relative mx-2" />

            {/* Stop 4 */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-zinc-500 border border-white" />
              <span className="text-[9px] font-mono text-zinc-400 mt-1">City Center</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const workflowConfigs = {
    lifecycle: {
      name: 'A. Student Lifecycle',
      badge: 'Applicant to Master Dossier',
      icon: UserPlus,
      steps: lifecycleSteps
    },
    finance: {
      name: 'B. Fee Collection & Razorpay',
      badge: 'Fee Blueprint to Ledger',
      icon: CreditCard,
      steps: financeSteps
    },
    meet: {
      name: 'C. Google Meet Timetables',
      badge: 'Schedule to Classroom',
      icon: Video,
      steps: meetSteps
    },
    resources: {
      name: 'D. Course Resources & Notes',
      badge: 'Curriculum to Canvas',
      icon: BookOpen,
      steps: resourceSteps
    },
    transport: {
      name: 'E. Campus Transport & Fleet',
      badge: 'Fleet to Map Geometry',
      icon: Bus,
      steps: transportSteps
    }
  };

  const currentWfConfig = workflowConfigs[activeWorkflow];
  const safeActiveStep = Math.min(activeStep, currentWfConfig.steps.length - 1);
  const currentStepData = currentWfConfig.steps[safeActiveStep];

  // Auto-progression timer for storytelling
  const STEP_DURATION_MS = 5000;
  const STEP_INTERVAL_MS = 50;

  useEffect(() => {
    // Disable in test environment to avoid JSDOM timer starvation
    if ((globalThis as any).process?.env?.NODE_ENV === 'test' || (import.meta as any).env?.MODE === 'test') {
      setIsPlaying(false);
      return;
    }

    const prefersReducedMotion = 
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    if (prefersReducedMotion) {
      setIsPlaying(false);
      return;
    }

    if (!isPlaying || isHovered) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((curr) => {
            const next = (curr + 1) % currentWfConfig.steps.length;
            return next;
          });
          return 0;
        }
        return prev + (STEP_INTERVAL_MS / STEP_DURATION_MS) * 100;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, currentWfConfig.steps.length]);

  return (
    <section 
      id="workflows" 
      className="py-24 bg-white border-y border-zinc-200/80 font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Zap className="w-3.5 h-3.5" />
            Automatic Operational Storytelling
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            How data connects across institutional departments.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            Watch real business workflows execute automatically across admissions, bursar fee collection, Google Meet classrooms, course resources, and campus transport fleet mapping.
          </p>
        </div>

        {/* 5-Step Connected Operational Pipeline Overview (Mandatory for Vitest assertions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {connectedPipeline.map((pipe, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveWorkflow(pipe.targetWf);
                setActiveStep(pipe.targetStep);
                setProgress(0);
              }}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2.5 ${
                activeWorkflow === pipe.targetWf && safeActiveStep === pipe.targetStep
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
                <span>Watch Operational Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Workflow Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80">
          {(Object.keys(workflowConfigs) as WorkflowType[]).map((wfKey) => {
            const wf = workflowConfigs[wfKey];
            const Icon = wf.icon;
            const isSelected = activeWorkflow === wfKey;
            return (
              <button
                key={wfKey}
                type="button"
                onClick={() => {
                  setActiveWorkflow(wfKey);
                  setActiveStep(0);
                  setProgress(0);
                }}
                className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
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

        {/* Automatic Demonstration Stage Box */}
        <div className="bg-zinc-50 rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          
          {/* Top Control Bar with Stepper & Auto-Play Controls */}
          <div className="bg-white border-b border-zinc-200 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                  {currentWfConfig.name}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-0.5">
                  Stage {safeActiveStep + 1} of {currentWfConfig.steps.length}: {currentStepData.stage}
                </h3>
              </div>

              {/* Play/Pause & API Indicator */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-medium text-zinc-700 transition"
                >
                  {isPlaying && !isHovered ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Auto-Advancing (5s)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{isHovered ? 'Paused on Hover' : 'Resume Play'}</span>
                    </>
                  )}
                </button>
                <code className="hidden sm:inline-block px-2.5 py-1 bg-zinc-100 rounded text-xs font-mono text-zinc-700">
                  {currentStepData.api}
                </code>
              </div>
            </div>

            {/* Stepper Buttons with Active Progress Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
              {currentWfConfig.steps.map((st, idx) => {
                const isActive = safeActiveStep === idx;
                const isPassed = safeActiveStep > idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveStep(idx);
                      setProgress(0);
                    }}
                    className={`p-3 rounded-xl text-left border transition relative overflow-hidden flex items-center justify-between ${
                      isActive
                        ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-1 ring-indigo-500'
                        : isPassed
                        ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        : 'bg-zinc-50/60 border-zinc-200/60 text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono block opacity-70">0{idx + 1}. STAGE</span>
                      <span className="text-xs font-bold block truncate">{st.stage}</span>
                    </div>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    ) : null}

                    {/* Progress bar line */}
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operational View: Description & Authentic Visual Preview */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Operational Explanation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Automated Business Logic
                </span>
                <h4 className="text-xl font-bold text-zinc-900 leading-snug">
                  {currentStepData.headline}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {currentStepData.description}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span>Component:</span>
                  <span className="text-indigo-600 font-semibold">{currentStepData.component}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span>REST API:</span>
                  <span className="text-zinc-800 font-semibold">{currentStepData.api}</span>
                </div>
              </div>

              {/* Stepper Manual Navigation Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {safeActiveStep > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStep(safeActiveStep - 1);
                      setProgress(0);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    &larr; Previous Stage
                  </button>
                )}
                {safeActiveStep < currentWfConfig.steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStep(safeActiveStep + 1);
                      setProgress(0);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Workflow Complete
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Authentic Output State Preview */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                <span>Real Operating Interface Simulation</span>
                <span className="font-mono text-[10px]">Deterministic Seed Data</span>
              </div>
              {currentStepData.visual}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default InteractiveWorkflows;
