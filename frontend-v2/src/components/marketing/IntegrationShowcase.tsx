import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Video, 
  FileText, 
  Server,
  Building2,
  Lock,
  Globe
} from 'lucide-react';

export const IntegrationShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'razorpay' | 'google-meet' | 'notion'>('razorpay');

  return (
    <section id="integrations" className="py-24 sm:py-32 bg-[#FBFBFA] border-t border-zinc-200/80 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <span>Confirmed Integrations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Your institution's tools. Working together.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            EduPulse connects institutional workflows with the services your faculty and students already use.
          </p>

          {/* Integration Selector Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('razorpay')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeTab === 'razorpay'
                  ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm ring-1 ring-zinc-300/50'
                  : 'bg-zinc-100/70 border-zinc-200/70 text-zinc-600 hover:text-zinc-900 hover:bg-white'
              }`}
            >
              <RazorpayLogo className="w-4 h-4" />
              <span>Razorpay Fee Collection</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('google-meet')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeTab === 'google-meet'
                  ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm ring-1 ring-zinc-300/50'
                  : 'bg-zinc-100/70 border-zinc-200/70 text-zinc-600 hover:text-zinc-900 hover:bg-white'
              }`}
            >
              <GoogleMeetLogo className="w-4 h-4" />
              <span>Google Meet Classrooms</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notion')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeTab === 'notion'
                  ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm ring-1 ring-zinc-300/50'
                  : 'bg-zinc-100/70 border-zinc-200/70 text-zinc-600 hover:text-zinc-900 hover:bg-white'
              }`}
            >
              <NotionLogo className="w-4 h-4" />
              <span>Notion Course Notes</span>
            </button>
          </div>
        </div>

        {/* 1. RAZORPAY INTEGRATION SHOWCASE */}
        {activeTab === 'razorpay' && (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10 text-left space-y-10">
            
            {/* Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#002970]/5 border border-[#002970]/15 flex items-center justify-center p-2.5">
                  <RazorpayLogo className="w-full h-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#002970] uppercase tracking-wider">Institutional Fee Collection</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      Production Integrated
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    Accept institutional fee payments through an integrated online payment experience.
                  </h3>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 max-w-md">
                <span className="font-semibold text-zinc-800">Architectural Boundary:</span> Student Fee Collection operates as an institutional bursar workflow integrated via Razorpay Checkout, separate from EduPulse's own B2B SaaS platform subscription licensing.
              </div>
            </div>

            {/* Horizontal 5-Stage Operational Workflow */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Institutional Payment Journey & Settlement Pipeline
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700">Student Portal &rarr; Bursar Settlement Pipeline</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        01
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Setup</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Fee Schedule Formulation</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Bursar defines tuition schedules, lab charges, and amenities in <span className="font-mono text-zinc-800">FeeManager</span>.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-zinc-500">
                    Bursar Fee Engine
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        02
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Invoicing</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Student Voucher Issuance</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Itemized fee obligations calculate automatically and populate student portal accounts.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-zinc-500">
                    Automated Student Voucher
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        03
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Checkout</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Online Payment Option</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Student or parent opens Fee Center and launches secure Razorpay modal (UPI, cards, netbanking).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-semibold text-indigo-700">
                    UPI • Cards • Netbanking
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        04
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Verification</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Server Webhook Handshake</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      EduPulse backend verifies cryptographic signature against Razorpay secret key.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-semibold text-indigo-700">
                    Bank-Grade Webhook Verification
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        05
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Settlement</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Ledger Settlement & Receipts</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Status transitions to PAID, debit/credit ledger reconciles, and digital receipts generate.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-semibold text-emerald-700">
                    Instant Reconciled Receipt
                  </div>
                </div>

              </div>
            </div>

            {/* 3 Technical Integration Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Direct Bank Settlement</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Fee payments route directly into your institution's verified merchant bank account. EduPulse never holds tuition escrow funds.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Automated Reconciliation</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Eliminates manual bank challan verification. Invoices, student ledgers, and transaction references match automatically.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Universal Payment Rails</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Support for UPI intent, dynamic QR codes, international and domestic cards, EMI options, and over 50 netbanking institutions.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* 2. GOOGLE MEET INTEGRATION SHOWCASE */}
        {activeTab === 'google-meet' && (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10 text-left space-y-10">
            
            {/* Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center p-2.5 shadow-xs">
                  <GoogleMeetLogo className="w-full h-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Online Classrooms</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      Production Integrated
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    Connect institutional academic schedules with online classroom experiences.
                  </h3>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 max-w-md">
                <span className="font-semibold text-zinc-800">Architectural Boundary:</span> Real-time video/audio streaming is handled by Google's secure infrastructure, while EduPulse manages academic timetables, course enrollment validation, and attendance logs.
              </div>
            </div>

            {/* Horizontal 5-Stage Operational Workflow */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  Virtual Lecture Delivery & Academic Timetable Synchronization
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700">Master Timetable &rarr; Student Schedule Sync</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        01
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Schedule</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Lecture Scheduling</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Faculty schedules lectures in <span className="font-mono text-zinc-800">TimetableManager</span> with assigned days and time slots.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-zinc-500">
                    Conflict-Free Scheduling
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        02
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Association</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Meeting Link Binding</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      The Google Meet session URL binds directly to the scheduled course offering section.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-semibold text-indigo-700">
                    Encrypted Class Link
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        03
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Access</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Student Timetable Sync</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Enrolled students access the live session directly from their portal timetable without email link clutter.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-zinc-500">
                    One-Click Student Launch
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        04
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Delivery</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Secure Video Session</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Faculty conducts interactive lectures with screen sharing, breakout rooms, and real-time chat.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-semibold text-indigo-700">
                    High-Definition Video Stream
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        05
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Tracking</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Topic & Attendance Log</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Lecture completion and topic coverage are logged into the institutional curriculum ledger.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-semibold text-emerald-700">
                    Lecture Topic & Attendance Log
                  </div>
                </div>

              </div>
            </div>

            {/* 3 Technical Integration Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Enrollment-Restricted Access</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Only authenticated students actively registered in the specific course section see the meeting join button, preventing unauthorized room access.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Collision-Free Scheduling</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Timetable conflict algorithms prevent double-booking faculty lecturers or scheduling overlapping lecture periods for student cohorts.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Global High-Bandwidth Cloud</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Offloads demanding media traffic to Google's content delivery network, ensuring reliable video streaming regardless of local campus server capacity.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* 3. NOTION INTEGRATION SHOWCASE */}
        {activeTab === 'notion' && (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10 text-left space-y-10">
            
            {/* Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center p-2.5 shadow-xs">
                  <NotionLogo className="w-full h-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">Learning Resources</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      Production Integrated
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    Bring academic notes and learning resources closer to the courses students study.
                  </h3>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 max-w-md">
                <span className="font-semibold text-zinc-800">Architectural Boundary:</span> Instructors curate collaborative notes and dynamic study documents in Notion, while EduPulse enforces accredited credit requirements, grading policies, and prerequisite gates.
              </div>
            </div>

            {/* Horizontal 4-Stage Operational Workflow */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Curriculum Repository & Notion Workspace Linking
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700">Course Catalog &rarr; Student Learning Portal</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        01
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Curation</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Faculty Workspace Setup</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Faculty organize syllabi, reading lists, lecture handouts, and lab assignments in collaborative Notion workspaces.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-zinc-600">
                    Faculty Collaborative Canvas
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        02
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Linkage</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Catalog Binding in CourseManager</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Instructors bind the Notion resource URL to the master course definition in Course Management.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-indigo-700">
                    Accredited Course Linkage
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        03
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Access</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Contextual Student Access</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Enrolled students access live workspaces directly from their course dashboard alongside credit requirements.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-zinc-600">
                    Contextual Student Access
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                        04
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Alignment</span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-900 mt-2.5">Syllabus Pacing Synchronization</h5>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Academic resources remain organized alongside credit hours, prerequisites, and examination calendars.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/60 text-[10px] font-medium text-emerald-700">
                    Degree Milestone Pacing
                  </div>
                </div>

              </div>
            </div>

            {/* 3 Technical Integration Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Rich Collaborative Canvas</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Leverage Notion's real-time document editing, mathematical KaTeX formulas, and syntax-highlighted code blocks for modern coursework.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Zero ERP File Storage Bloat</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Heavy lecture slide decks, PDFs, and multimedia attachments stay housed in Notion, keeping institutional ERP database instances lean.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Structured Degree Alignment</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Combines the flexibility of collaborative documentation with the rigor of accredited departmental degree requirements.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

// Official Razorpay Logo SVG
function RazorpayLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path
        d="M26.2 92.5L52.8 55.4H36.4L58.2 7.5H23.5L8.5 73.1L26.2 92.5ZM55.2 7.5L42.1 36.3H56.5L34.1 67.5L55.2 90.5L91.5 39.7H74.3L91.5 7.5H55.2Z"
        fill="#002970"
      />
    </svg>
  );
}

// Official Google Meet Logo SVG
function GoogleMeetLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 88 88" fill="none" {...props}>
      <path d="M50 44L66 56V32L50 44Z" fill="#00AA47" />
      <path d="M12 28C12 21.3726 17.3726 16 24 16H42C48.6274 16 54 21.3726 54 28V60C54 66.6274 48.6274 72 42 72H24C17.3726 72 12 66.6274 12 60V28Z" fill="#EA4335" />
      <path d="M54 28L42 16H24C17.3726 16 12 21.3726 12 28L28 44L54 28Z" fill="#4285F4" />
      <path d="M12 60L28 44L54 60V28L12 60Z" fill="#00832D" />
      <path d="M12 60C12 66.6274 17.3726 72 24 72H42C48.6274 72 54 66.6274 54 60L36 44L12 60Z" fill="#2684FC" />
      <path d="M54 44L66 32V56L54 44Z" fill="#00832D" />
      <path d="M66 32L54 44V28C54 23.5817 57.5817 20 62 20C64.2091 20 66 21.7909 66 24V32Z" fill="#00AC47" />
      <path d="M66 56V64C66 66.2091 64.2091 68 62 68C57.5817 68 54 64.4183 54 60V44L66 56Z" fill="#00832D" />
      <path d="M42 16H24C17.3726 16 12 21.3726 12 28H54V28C54 21.3726 48.6274 16 42 16Z" fill="#FFBA00" />
    </svg>
  );
}

// Official Notion Monogram Logo SVG
function NotionLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path
        d="M6.3 18.2C5.3 17 5.9 15.6 7.4 15.4L78.6 10.3C80.8 10.1 82.8 11.7 83.1 14.1L92.7 80.4C93 82.5 91.8 84.1 89.8 84.4L18.8 89.6C17.2 89.7 15.6 88.9 14.9 87.4L6.3 18.2ZM24.6 27.9L22.9 28.1C21.7 28.2 21.4 29 21.5 29.8L28.3 75.7C28.4 76.5 29.2 77.1 30.2 77L40.7 76.3C41.7 76.2 42 75.4 41.9 74.6L40.7 66.1L60.8 64.6L62.7 74.7C62.9 75.5 63.6 76.1 64.6 76L75.3 75.2C76.3 75.1 76.6 74.3 76.5 73.5L66.7 25.1C66.5 24.3 65.7 23.7 64.8 23.8L54.7 24.5C53.7 24.6 53.4 25.4 53.5 26.2L55.8 42.6L39.8 43.8L37.5 27.2C37.3 26.4 36.6 25.8 35.6 25.9L24.6 27.9Z"
        fill="#000000"
      />
    </svg>
  );
}

export default IntegrationShowcase;
