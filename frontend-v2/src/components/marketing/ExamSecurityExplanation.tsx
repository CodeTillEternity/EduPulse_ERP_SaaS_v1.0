import React, { useState } from 'react';
import { 
  Lock, 
  Monitor, 
  ShieldCheck, 
  Laptop
} from 'lucide-react';

export const ExamSecurityExplanation: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: 'Assessment Configuration',
      role: 'Institutional Administrator',
      description: 'Faculty schedule the examination in ExamManager, establishing start time, duration, permitted tools, and hall room allocations.',
      technical: 'Persisted to examination and assessment_session tables with tenant_id isolation.'
    },
    {
      num: 2,
      title: 'SEB Profile Generation',
      role: 'Safe Exam Browser Integration',
      description: 'EduPulse generates an encrypted .seb configuration file containing cryptographic hashes that mandate client kiosk lockdown.',
      technical: 'Enforces full-screen kiosk mode, terminates secondary displays, and disables clipboard access on macOS and Windows.'
    },
    {
      num: 3,
      title: 'Browser Exam Key Verification',
      role: 'Backend Validation Handshake',
      description: 'When the student begins the test, the open-source SEB application transmits a SHA-256 BrowserExamKey in the HTTP header.',
      technical: 'SEB client transmits BrowserExamKey in HTTP headers; automated filter enforcement is on the security roadmap.'
    },
    {
      num: 4,
      title: 'Grading & Transcript Recording',
      role: 'Academic Registrar',
      description: 'Upon test submission, marks compile into the grade book, relative GPA curves calculate, and digital marksheets publish to the SIS.',
      technical: 'Directly updates student_academic_history with tamper-evident audit timestamps.'
    }
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden text-left font-sans">
      
      {/* Top Banner */}
      <div className="p-6 border-b border-zinc-200 bg-zinc-50/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-1.5">
              <Lock className="w-3.5 h-3.5" />
              Assessment Integrity
            </div>
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
              Safe Exam Browser (SEB) & Assessment Security
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl">
              Understand how EduPulse integrates with the open-source Safe Exam Browser (ETH Zurich) to prevent unauthorized application switching and monitor high-stakes assessments.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <span>Open-Source Integration</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-zinc-700">SEB 3.x Compatible</span>
          </div>
        </div>
      </div>

      {/* 4-Step Architecture Flow */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step) => {
            const isSelected = activeStep === step.num;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-600/10' 
                    : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {step.num}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{step.role}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 mb-1">{step.title}</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">{step.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[10px] font-mono text-indigo-700">
                  {step.technical}
                </div>
              </div>
            );
          })}
        </div>

        {/* Realistic Technical Safeguards Row */}
        <div className="mt-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-600">
          <div className="flex items-start gap-2.5">
            <Monitor className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-900 block">Kiosk Sandboxing</span>
              <span>Disables secondary screens, screen capture tools, and shortcut keys (Alt+Tab, Cmd+Tab).</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-900 block">Browser Exam Key</span>
              <span>Verifies that requests originate strictly from an authorized, unmodified SEB client instance.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Laptop className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-900 block">Cross-Platform Client</span>
              <span>Students install the official SEB open-source desktop software for Windows, macOS, or iOS.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ExamSecurityExplanation;
