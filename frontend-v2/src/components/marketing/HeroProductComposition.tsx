import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Video,
  FileCheck
} from 'lucide-react';

type HeroTab = 'sis' | 'admissions' | 'timetable' | 'finance';

export const HeroProductComposition: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HeroTab>('sis');
  const [selectedApplicant, setSelectedApplicant] = useState<'aanya' | 'devansh'>('aanya');

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl md:rounded-3xl border border-zinc-200/90 bg-white shadow-2xl overflow-hidden font-sans text-left transition-all">
      
      {/* Top Browser / Window Chrome */}
      <div className="px-4 py-2.5 bg-zinc-100/90 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <div className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-zinc-200/80 text-[11px] text-zinc-600 font-mono">
            <span className="text-zinc-400">https://</span>
            <span className="text-zinc-900 font-semibold">demo.edupulse.io</span>
            <span className="text-zinc-400">/workspace/{activeTab}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Controlled Demonstration Environment • Seed Data Mode
          </span>
          <span className="hidden sm:inline font-mono text-zinc-500 text-[10px]">
            Tenant: demo_sandbox
          </span>
        </div>
      </div>

      {/* Main Operating Window Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[490px] bg-zinc-50/50">
        
        {/* Left Real ERP Sidebar Navigation */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-2.5 bg-white border-r border-zinc-200/80 p-3.5 flex-col justify-between text-xs space-y-6">
          <div className="space-y-4">
            
            {/* Institution Header in App */}
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                E
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-zinc-900 truncate text-[11px]">EduPulse Campus ERP</div>
                <div className="text-[10px] text-zinc-400 truncate">V1.4 Demonstration Sandbox</div>
              </div>
            </div>

            {/* Navigation links - Fully Clickable */}
            <nav className="space-y-1 text-zinc-600 font-medium text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('sis')}
                className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between transition text-left ${
                  activeTab === 'sis'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Student SIS Dossier</span>
                </span>
                {activeTab === 'sis' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admissions')}
                className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between transition text-left ${
                  activeTab === 'admissions'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Admissions Intake</span>
                </span>
                {activeTab === 'admissions' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('timetable')}
                className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between transition text-left ${
                  activeTab === 'timetable'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Class Timetable</span>
                </span>
                {activeTab === 'timetable' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between transition text-left ${
                  activeTab === 'finance'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Fee Ledger & Checkout</span>
                </span>
                {activeTab === 'finance' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>
            </nav>
          </div>

          {/* User Session pill */}
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-[10px]">
            <div>
              <span className="font-bold text-zinc-800 block">demo.evaluator</span>
              <span className="text-zinc-500 font-mono">ROLE_ADMIN (Read-Only)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Right Active Dashboard Workspace */}
        <div className="col-span-1 md:col-span-9 lg:col-span-9.5 p-4 sm:p-6 space-y-4">
          
          {/* Top Operational Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-900">Institutional ERP Demonstration Console</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-500 font-medium">Academic Year 2026–2027</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">Schema: v1.4</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Interactive Operational Experience
              </span>
            </div>
          </div>

          {/* VIEW 1: STUDENT SIS MASTER RECORD */}
          {activeTab === 'sis' && (
            <div className="space-y-3">
              <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      AS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900">Aarav Sharma</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">Enrollment #: ENR-2026-001 • Department of Computer Science</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono">
                      CGPA: 3.92 / 4.0
                    </span>
                    <div className="text-[10px] text-zinc-400 mt-1">Dean's Honor Roll</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/60">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Attendance Record</span>
                    <div className="text-base font-bold text-zinc-900 mt-0.5">96.4% Compliance</div>
                    <span className="text-[10px] text-emerald-600 font-medium">54 / 56 Sessions Attended</span>
                  </div>

                  <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/60">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Fee Voucher Settlement</span>
                    <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono">PAID (₹45,000)</div>
                    <span className="text-[10px] text-zinc-500 font-mono">Receipt: RCP-8912 via Razorpay</span>
                  </div>

                  <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/60">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Enrollment Status</span>
                    <div className="text-base font-bold text-zinc-900 mt-0.5">Verified Regular</div>
                    <span className="text-[10px] text-emerald-600 font-medium">Aadhaar & Marks Verified</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span>Source Screen: <code className="font-mono text-zinc-700">StudentProfile.tsx & StudentsList.tsx</code></span>
                  <span className="text-indigo-600 font-semibold cursor-pointer">View full dossier fields &rarr;</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ADMISSIONS REVIEW QUEUE */}
          {activeTab === 'admissions' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Intake Applicant Review Queue</h4>
                    <p className="text-[11px] text-zinc-500">Source: <code className="font-mono text-zinc-700">Admissions.tsx</code> (Undergraduate Engineering Program)</p>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    2 Seeded Queue Records
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => setSelectedApplicant('aanya')}
                    className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                      selectedApplicant === 'aanya'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                        : 'border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">Aanya Patel</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        UNDER_REVIEW
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-600">B.Tech Computer Science &bull; App #APP-2026-042</div>
                    <div className="text-[10px] text-zinc-400 font-mono">12th Marksheet: VERIFIED • Aadhaar: PENDING</div>
                  </div>

                  <div 
                    onClick={() => setSelectedApplicant('devansh')}
                    className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                      selectedApplicant === 'devansh'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                        : 'border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">Devansh Verma</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        APPROVED & ENROLLED
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-600">B.Tech Mechanical &bull; App #APP-2026-039</div>
                    <div className="text-[10px] text-zinc-400 font-mono">Roll Assigned: ENR-2026-003</div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-zinc-800">
                    <span>Selected Dossier: {selectedApplicant === 'aanya' ? 'Aanya Patel (In Review)' : 'Devansh Verma (Enrolled)'}</span>
                    <span className="text-[11px] font-mono text-zinc-500">API: /api/v1/admissions/applications</span>
                  </div>
                  <p className="text-[11px] text-zinc-600">
                    {selectedApplicant === 'aanya'
                      ? 'Applicant has passed academic eligibility criteria. Awaiting Admissions Committee clearance before generating permanent SIS roll number.'
                      : 'Committee approved credentials. Single-click enrollment was dispatched and student record created in SIS database table.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: TIMETABLE & CLASSROOM */}
          {activeTab === 'timetable' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-zinc-900">Lecture Timetable & Virtual Classroom Synchronization</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    SCHEDULE SYNCHRONIZED
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-zinc-900">CS-302: Cloud Architecture</div>
                      <div className="text-[11px] text-zinc-600">Lecture Hall 402 &bull; Instructor: Dr. Aris Thorne</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 text-white font-mono text-[11px]">
                      09:00 AM – 10:30 AM
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Meet Classroom Linked: <code className="font-mono text-zinc-600">meet.google.com/xyz-abc</code></span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Room Collision Check: PASSED</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Source: <code className="font-mono text-zinc-700">TimetableManager.jsx & Operations.tsx</code>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: FEE LEDGER & CHECKOUT */}
          {activeTab === 'finance' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-zinc-900">Student Fee Voucher & Payment Ledger</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Razorpay Gateway Connected
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block">Voucher Ref: INV-2026-089</span>
                      <span className="font-bold text-sm text-zinc-900">Fall 2026 Tuition & Laboratory Head</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-700 font-mono">₹45,000.00</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        SETTLED (PAID)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/80 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block">Payment Rail:</span>
                      <span className="font-semibold text-zinc-800">Razorpay Online Checkout (UPI / NetBanking)</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Signature Verification:</span>
                      <span className="font-mono text-indigo-700 font-semibold">HMAC-SHA256 Match Verified</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Source: <code className="font-mono text-zinc-700">FeeCenter.jsx & StudentLedger.jsx</code>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Architecture & Boundary Disclosure */}
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Architecture Preview • Isolated Tenant Context</span>
            </div>
            <div className="text-zinc-400">
              Confined via com.erp.multitenancy.TenantFilter
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default HeroProductComposition;
