import React, { useState } from 'react';
import { 
  ExternalLink, 
  Clock,
  Check
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
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
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Positioning & Workflow */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#002970]/5 border border-[#002970]/15 flex items-center justify-center p-2">
                    <RazorpayLogo className="w-full h-full" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#002970] uppercase tracking-wider">Payments & Bursar</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Razorpay Fee Collection</h3>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                  "Accept institutional fee payments through an integrated online payment experience."
                </p>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  EduPulse bridges student accounting and banking infrastructure through Razorpay. Institutional bursars configure tuition schedules, lab charges, and campus fees in <span className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded">FeeManager</span>, which automatically populate student accounts with online settlement links.
                </p>

                {/* 7-Step Institutional Workflow */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Institutional Payment Journey</h4>
                  <ol className="space-y-2 text-xs text-zinc-600">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span>Institution configures multi-head fee structures by program and term.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span>Student fee obligations and invoice vouchers generate automatically.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span>Student or parent accesses the payment option inside the student portal (<span className="font-mono text-[10px]">/portal/fees</span>).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                      <span>Razorpay processes the online payment via UPI, netbanking, or cards.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">5</span>
                      <span>EduPulse receives and processes payment confirmation via server-to-server webhook.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">6</span>
                      <span>Institutional payment records and debit/credit ledgers update instantly to settled status.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">7</span>
                      <span>Digital receipts and audited financial vouchers become immediately downloadable.</span>
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-500">
                  <span className="font-semibold text-zinc-700">Important distinction:</span> Razorpay integration for institutional student fee collection operates independently from EduPulse's own B2B SaaS platform subscription licensing.
                </div>
              </div>

              {/* Right Column: Connected Interface Preview */}
              <div className="lg:col-span-6 bg-zinc-50/80 rounded-2xl border border-zinc-200/90 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-200 pb-2">
                  <span className="font-semibold text-zinc-700">Student Portal — Fee Center View</span>
                  <span className="font-mono text-[11px]">INV-2026-0001</span>
                </div>

                {/* Simulated Invoice Card */}
                <div className="bg-white rounded-xl p-4 border border-zinc-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-zinc-900 text-xs">Fall 2026 Semester Tuition & Lab Fee</h5>
                      <span className="text-[11px] text-zinc-500">Department of Computer Science & Engineering</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                      UNPAID
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-zinc-500">Amount Due:</span>
                    <span className="text-xl font-bold font-mono text-zinc-900">$4,500.00</span>
                  </div>

                  {/* Razorpay Trigger Button */}
                  <div className="pt-2 border-t border-zinc-100">
                    <div className="w-full py-2.5 px-4 rounded-xl bg-[#002970] text-white font-semibold text-xs flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <RazorpayLogo className="w-4 h-4 fill-white text-white" />
                        <span>Pay with Razorpay</span>
                      </div>
                      <span className="text-[11px] opacity-90 font-mono">UPI • Cards • Netbanking</span>
                    </div>
                  </div>
                </div>

                {/* Modal preview overlay */}
                <div className="p-4 bg-white rounded-xl border border-zinc-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="font-semibold text-zinc-800">Payment Flow Integration</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Webhook Connected
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 font-mono text-[10px] text-zinc-600 border border-zinc-200/60">
                    <div>order_id: "order_H89v1k92La"</div>
                    <div>status: "captured" &rarr; update student_ledger set status = 'PAID'</div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* 2. GOOGLE MEET INTEGRATION SHOWCASE */}
        {activeTab === 'google-meet' && (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Interface Preview */}
              <div className="lg:col-span-6 order-2 lg:order-1 bg-zinc-50/80 rounded-2xl border border-zinc-200/90 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-200 pb-2">
                  <span className="font-semibold text-zinc-700">Course Schedule — Timetable View</span>
                  <span className="font-mono text-[11px]">CS-301 • Room: Virtual</span>
                </div>

                {/* Timetable Slot Card */}
                <div className="bg-white rounded-xl p-4 border border-zinc-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-zinc-900 text-xs">CS-301: Distributed Systems</h5>
                      <span className="text-[11px] text-zinc-500">Lecture: Raft Consensus & Byzantine Faults</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                      LIVE CLASS
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      10:00 AM – 11:30 AM
                    </span>
                    <span>•</span>
                    <span>Faculty: Dr. Robert Vance</span>
                  </div>

                  {/* Google Meet Action Button */}
                  <div className="pt-2 border-t border-zinc-100">
                    <a
                      href="#google-meet"
                      onClick={(e) => e.preventDefault()}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-semibold text-xs flex items-center justify-between transition shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <GoogleMeetLogo className="w-4 h-4" />
                        <span>Join Session with Google Meet</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                  <div className="font-semibold text-zinc-800">Faculty-to-Student Calendar Binding</div>
                  <p className="text-zinc-500 text-[10px]">
                    Meeting URL is automatically accessible to enrolled students via <span className="font-mono">/portal/schedule</span> without manual link emailing.
                  </p>
                </div>
              </div>

              {/* Right Column: Positioning & Workflow */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-2 shadow-sm">
                    <GoogleMeetLogo className="w-full h-full" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Online Classrooms</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Google Meet Integration</h3>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                  "Connect institutional academic schedules with online classroom experiences."
                </p>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  Faculty and students seamlessly link course schedules with interactive video lectures. Virtual lecture sessions scheduled in EduPulse generate direct meeting access points for enrolled students, ensuring lecture timetables and video conference rooms stay unified.
                </p>

                {/* 5-Step Academic Workflow */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Virtual Class Workflow</h4>
                  <ol className="space-y-2 text-xs text-zinc-600">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span>Faculty schedules an online or hybrid lecture in <span className="font-mono text-[10px]">TimetableManager</span>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span>The relevant course syllabus and timetable entry is associated with the meeting link.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span>Enrolled students access the live session directly through their EduPulse student timetable.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                      <span>Faculty conducts the lecture session securely within Google Meet.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">5</span>
                      <span>Course records and lecture topic completion are tracked inside EduPulse.</span>
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-500">
                  <span className="font-semibold text-zinc-700">Implementation Note:</span> Google Meet conducts the real-time audio/video stream while EduPulse enforces course registration checks and schedule mapping.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. NOTION INTEGRATION SHOWCASE */}
        {activeTab === 'notion' && (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Positioning & Workflow */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-2 shadow-sm">
                    <NotionLogo className="w-full h-full" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">Learning Resources</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Notion Workspace Integration</h3>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                  "Bring academic notes and learning resources closer to the courses students study."
                </p>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  Connect departmental course definitions with rich collaborative course notes. Instructors organize lecture notes, reading lists, and lab assignments in Notion, linking them directly to corresponding courses in EduPulse so students always have study materials in context.
                </p>

                {/* 4-Step Learning Workflow */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Course Resource Workflow</h4>
                  <ol className="space-y-2 text-xs text-zinc-600">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span>Faculty organizes relevant course materials, syllabus notes, and reading guides in Notion.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span>Resources are linked directly to the course in EduPulse's <span className="font-mono text-[10px]">CourseManager</span>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span>Enrolled students access available notes and materials through their course view.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                      <span>Academic resources remain organized alongside credit hours, prerequisites, and attendance.</span>
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-500">
                  <span className="font-semibold text-zinc-700">Implementation Note:</span> Notion provides the collaborative document space while EduPulse maintains academic credit frameworks and student enrollment boundaries.
                </div>
              </div>

              {/* Right Column: Connected Interface Preview */}
              <div className="lg:col-span-6 bg-zinc-50/80 rounded-2xl border border-zinc-200/90 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-200 pb-2">
                  <span className="font-semibold text-zinc-700">Academic Catalog — Course View</span>
                  <span className="font-mono text-[11px]">CS-201 • 4 Credits</span>
                </div>

                {/* Course Resource Card */}
                <div className="bg-white rounded-xl p-4 border border-zinc-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-zinc-900 text-xs">CS-201: Data Structures & Algorithms</h5>
                      <span className="text-[11px] text-zinc-500">Department of Computer Science</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-semibold">
                      FALL TERM
                    </span>
                  </div>

                  {/* Connected Notion Document Card */}
                  <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-white border border-zinc-200 flex items-center justify-center p-1 shadow-xs">
                        <NotionLogo className="w-full h-full" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 text-xs">CS201 — Lecture Notes & Binary Trees</div>
                        <div className="text-[10px] text-zinc-500 font-mono">notion.so/edupulse/cs201-algorithms</div>
                      </div>
                    </div>
                    <a
                      href="#notion"
                      onClick={(e) => e.preventDefault()}
                      className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium">Syllabus Pacing</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium">Reading Lists</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium">Lab Handouts</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                  <div className="font-semibold text-zinc-800">Contextual Learning Experience</div>
                  <p className="text-zinc-500 text-[10px]">
                    Students review course notes and study guides in their personal or shared Notion workspaces directly linked from their academic course enrollment.
                  </p>
                </div>
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
