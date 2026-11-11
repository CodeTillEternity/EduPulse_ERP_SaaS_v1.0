import React from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  GraduationCap, 
  Layers, 
  Video
} from 'lucide-react';

export const HeroProductComposition: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl md:rounded-3xl border border-zinc-200/90 bg-white shadow-2xl overflow-hidden font-sans text-left transition-all">
      
      {/* Top Browser / macOS Window Chrome */}
      <div className="px-4 py-2.5 bg-zinc-100/90 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <div className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-zinc-200/80 text-[11px] text-zinc-600 font-mono">
            <span className="text-zinc-400">https://</span>
            <span className="text-zinc-900 font-semibold">apex.edupulse.io</span>
            <span className="text-zinc-400">/dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Institutional Instance
          </span>
          <span className="hidden sm:inline font-mono text-zinc-500">Tenant: tenant-apex</span>
        </div>
      </div>

      {/* Main Operating Window Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] bg-zinc-50/50">
        
        {/* Left Simulated Sidebar Navigation */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-2.5 bg-white border-r border-zinc-200/80 p-3.5 flex-col justify-between text-xs space-y-6">
          <div className="space-y-4">
            
            {/* Institution Header in App */}
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-zinc-900 truncate text-[11px]">Apex Institute of Tech</div>
                <div className="text-[10px] text-zinc-400 truncate">V1.4 Production</div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1 text-zinc-600 font-medium text-[11px]">
              <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              </div>
              <div className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2 text-zinc-600">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>Student SIS (1,248)</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2 text-zinc-600">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Departments (8)</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2 text-zinc-600">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Timetable & Meet</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2 text-zinc-600">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Finance & Fees</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2 text-zinc-600">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Exams & Grades</span>
              </div>
            </nav>
          </div>

          {/* User Session pill */}
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-[10px]">
            <div>
              <span className="font-bold text-zinc-800 block">superadmin</span>
              <span className="text-zinc-500 font-mono">SUPER_ADMIN</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Right Active Dashboard Workspace */}
        <div className="col-span-1 md:col-span-9 lg:col-span-9.5 p-4 sm:p-6 space-y-4">
          
          {/* Top Operational Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-900">Institutional Governance Console</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-500 font-medium">Academic Year 2026–2027</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">RLS: ENFORCED</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                DATABASE: DEDICATED-VIP-1
              </span>
            </div>
          </div>

          {/* 3 Real-World KPI Summary Strips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span className="font-semibold uppercase tracking-wider">Active Enrollment</span>
                <Users className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">1,248 Students</div>
              <div className="text-[11px] text-emerald-600 font-medium">100% Profile Verified</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span className="font-semibold uppercase tracking-wider">Fee Collection</span>
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">₹39,20,000</div>
              <div className="text-[11px] text-indigo-600 font-medium">91.5% Settled via Razorpay</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span className="font-semibold uppercase tracking-wider">Campus Attendance</span>
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">96.4% Rate</div>
              <div className="text-[11px] text-zinc-500">Above 75% Mandatory Policy</div>
            </div>
          </div>

          {/* Dual Operating Panels: Live SIS Dossier & Timetable Meet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            
            {/* Student SIS Master Record (Real seeded record) */}
            <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-xs text-zinc-900">Student Dossier Registry</span>
                </div>
                <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  23CSM001
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-zinc-900">Aarav Sharma</div>
                  <div className="text-[11px] text-zinc-500">B.Tech Computer Science &bull; Batch 2023–2027</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Dean's List (3.92 CGPA)
                  </span>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Status: ACTIVE</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 text-[11px]">
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Attendance</span>
                  <span className="font-bold text-zinc-800">96.4% (54/56)</span>
                </div>
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Fee Voucher</span>
                  <span className="font-bold text-emerald-700 font-mono">PAID [RCP-8912]</span>
                </div>
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <span className="text-[10px] text-zinc-400 block">Verification</span>
                  <span className="font-bold text-zinc-800">Aadhaar Verified</span>
                </div>
              </div>
            </div>

            {/* Live Lecture Schedule & Meet Integration */}
            <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Class Session</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    NOW ACTIVE
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-xs text-zinc-900">CS-302: Cloud Architecture</div>
                  <div className="text-[11px] text-zinc-600">Lecture Hall 402 &bull; Dr. Aris Thorne</div>
                  <div className="text-[10px] text-zinc-500 font-mono">09:00 AM – 10:30 AM (Mon/Wed)</div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Meet Linked</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">meet.google.com/xyz-abc</span>
              </div>
            </div>

          </div>

          {/* Bottom Security Assurance Strip */}
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PostgreSQL RLS Active: tenant_id = 'tenant-apex'</span>
            </div>
            <div className="text-zinc-400">
              Zero cross-institutional record leakage
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default HeroProductComposition;

