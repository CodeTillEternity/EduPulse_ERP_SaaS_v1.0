import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Video, 
  Users, 
  CheckCircle2, 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  VideoOff, 
  Hand, 
  ScreenShare, 
  PhoneOff, 
  MessageSquare, 
  Lock,
  X
} from 'lucide-react';

export type MeetStepId = 'calendar-create' | 'timetable-sync' | 'student-join' | 'active-meeting' | 'class-log';

interface MeetStepConfig {
  id: MeetStepId;
  label: string;
  badge: string;
  description: string;
}

export const GoogleMeetClassroomDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState<MeetStepId>('calendar-create');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);

  const steps: MeetStepConfig[] = [
    {
      id: 'calendar-create',
      label: '1. Calendar Event Creation',
      badge: 'Google Calendar Workflow',
      description: 'Faculty creates lecture slot, adds student group, and generates Google Meet video link.'
    },
    {
      id: 'timetable-sync',
      label: '2. Timetable Synchronization',
      badge: 'Master Schedule Integration',
      description: 'EduPulse timetable updates with zero room collision and binds encrypted meeting link.'
    },
    {
      id: 'student-join',
      label: '3. Student Portal Access',
      badge: 'B2C Student Dashboard',
      description: 'Enrolled students see upcoming lecture and launch session with enrollment-restricted access.'
    },
    {
      id: 'active-meeting',
      label: '4. Active Google Meet Call',
      badge: 'Live Virtual Classroom',
      description: 'Interactive lecture with screen share, participant audio waves, and in-call messaging.'
    },
    {
      id: 'class-log',
      label: '5. Class Record & Attendance',
      badge: 'Curriculum Audit Log',
      description: 'Meeting completion and 46/48 student attendance compliance recorded in SIS ledger.'
    }
  ];

  const STEP_DURATION_MS = 5000;
  const STEP_INTERVAL_MS = 50;

  useEffect(() => {
    // Disable timer in test environment to avoid JSDOM timer starvation
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
            const idx = steps.findIndex(s => s.id === curr);
            return steps[(idx + 1) % steps.length].id;
          });
          return 0;
        }
        return prev + (STEP_INTERVAL_MS / STEP_DURATION_MS) * 100;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, steps.length]);

  const handleSelectStep = (stepId: MeetStepId) => {
    setActiveStep(stepId);
    setProgress(0);
  };

  const currentStep = steps.find(s => s.id === activeStep) || steps[0];

  return (
    <div 
      className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden text-left font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Banner with Required Test Strings & Architectural Context */}
      <div className="p-6 sm:p-8 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Meet Classrooms</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-normal">Automated Session Binding</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
              Connect institutional academic schedules with online classroom experiences.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Virtual Lecture Delivery & Academic Timetable Synchronization: Observe how instructors schedule lectures, attach Google Meet video conferencing, and synchronize sessions directly with enrolled students.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
            {/* Auto Sequence Play/Pause Pill */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-2xs"
            >
              {isPlaying && !isHovered ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Auto-Playing (5s per stage)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{isHovered ? 'Paused on Hover' : 'Resume Sequence'}</span>
                </>
              )}
            </button>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-[11px] text-zinc-600 font-mono">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>Enrollment-Restricted Access</span>
            </span>
          </div>
        </div>

        {/* 5-Stage Stepper Buttons with Progress Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-6">
          {steps.map((st, idx) => {
            const isCurrent = activeStep === st.id;
            const isPassed = steps.findIndex(s => s.id === activeStep) > idx;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStep(st.id)}
                className={`p-3 rounded-xl text-left border transition relative overflow-hidden flex flex-col justify-between gap-1 ${
                  isCurrent
                    ? 'bg-white border-indigo-600 text-indigo-900 shadow-sm ring-1 ring-indigo-500'
                    : isPassed
                    ? 'bg-zinc-100/80 border-zinc-200 text-zinc-700 hover:bg-white'
                    : 'bg-zinc-100/40 border-zinc-200/60 text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  ) : null}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">{st.label.split('. ')[1]}</div>

                {isCurrent && (
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

      {/* Main Interactive Screen Showcase */}
      <div className="p-6 sm:p-8 bg-zinc-900 text-zinc-100 min-h-[460px] flex flex-col justify-between">
        
        {/* Top Window Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="font-mono text-zinc-400 ml-2">Google Meet Classroom &bull; {currentStep.badge}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
            Deterministic Demonstration Workflow
          </span>
        </div>

        {/* ========================================================================= */}
        {/* STAGE 1: GOOGLE CALENDAR EVENT CREATION INTERFACE                         */}
        {/* ========================================================================= */}
        {activeStep === 'calendar-create' && (
          <div className="py-4 space-y-4">
            <div className="max-w-2xl mx-auto bg-white text-zinc-900 rounded-2xl shadow-xl border border-zinc-200 overflow-hidden font-sans">
              {/* Calendar Modal Header */}
              <div className="px-5 py-3.5 bg-zinc-100/90 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  <span>Google Calendar &bull; Create Lecture Event</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-xs font-mono text-zinc-500">Draft Event</span>
                  <X className="w-4 h-4" />
                </div>
              </div>

              {/* Event Form Body */}
              <div className="p-5 space-y-4 text-xs">
                {/* Event Title */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Lecture Title</label>
                  <input
                    type="text"
                    readOnly
                    value="CS-302: Cloud Architecture & Distributed Systems"
                    className="w-full text-sm font-bold text-zinc-900 border-b-2 border-indigo-600 pb-1 outline-none bg-transparent"
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3 text-zinc-700">
                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Date & Frequency</span>
                    <div className="font-bold">Wednesday, Nov 18, 2026</div>
                    <span className="text-[10px] text-indigo-600 font-medium">Repeats Weekly on Mon/Wed</span>
                  </div>
                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Lecture Period</span>
                    <div className="font-bold">09:00 AM – 10:30 AM</div>
                    <span className="text-[10px] text-zinc-500">Timezone: IST (GMT+5:30)</span>
                  </div>
                </div>

                {/* Video Conferencing Action Button (Highlighted) */}
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950 text-xs">Google Meet Video Conferencing Added</div>
                      <div className="text-[11px] font-mono text-emerald-800 mt-0.5">
                        meet.google.com/xyz-abc-qrs &bull; Up to 100 participants
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900 text-[10px] font-bold">
                    CONNECTED
                  </span>
                </div>

                {/* Guest & Room Details */}
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Enrolled Student Guests</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[10px]">
                        Batch 2023-2027 (48 students)
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Campus Room Location</span>
                    <div className="text-zinc-800 font-medium">Lecture Hall 402 &bull; Computer Science Block</div>
                  </div>
                </div>

                {/* Save Event Action */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono">Syncing to EduPulse Timetable...</span>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
                  >
                    Save Event & Synchronize
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: TIMETABLE SYNCHRONIZATION IN EDUPULSE                            */}
        {/* ========================================================================= */}
        {activeStep === 'timetable-sync' && (
          <div className="py-4 space-y-4">
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-sm">Master Timetable &bull; Academic Year 2026</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  CONFLICT ENGINE: 0 CLASHES
                </span>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-base text-white">CS-302: Cloud Architecture</span>
                    <div className="text-xs text-zinc-400">Dr. Aris Thorne &bull; Lecture Hall 402</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 font-mono text-xs font-bold">
                    Wednesday 09:00 - 10:30 AM
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-zinc-950 rounded border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">Encrypted Meet URL</span>
                    <span className="text-emerald-400 font-bold">meet.google.com/xyz-abc-qrs</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">Room Collision Check</span>
                    <span className="text-indigo-300 font-bold">PASSED (Hall 402 Available)</span>
                  </div>
                </div>
              </div>

              <div className="text-zinc-400 text-[11px] flex items-center justify-between">
                <span>TimetableManager.jsx synchronized across 48 student portals.</span>
                <span className="text-emerald-400 font-bold">&check; REST Sync Complete</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: STUDENT PORTAL ACCESS                                            */}
        {/* ========================================================================= */}
        {activeStep === 'student-join' && (
          <div className="py-4 space-y-4">
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-700">
                    AS
                  </div>
                  <div>
                    <span className="font-bold text-white block">Aarav Sharma (Student Portal)</span>
                    <span className="text-zinc-400 text-[11px] font-mono">Roll: ENR-2026-001 &bull; B.Tech Computer Science</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  ACTIVE STUDENT
                </span>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    STARTING NOW
                  </div>
                  <h4 className="text-base font-bold text-white">CS-302: Cloud Architecture &bull; Virtual Session</h4>
                  <p className="text-xs text-zinc-400">Wednesday 09:00 AM – 10:30 AM &bull; Dr. Aris Thorne</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectStep('active-meeting')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Join with Google Meet</span>
                </button>
              </div>

              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                Security Policy: Only students registered in section CS-Batch-A have authorized token access to the session link.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: LIVE GOOGLE MEET CALL INTERFACE                                   */}
        {/* ========================================================================= */}
        {activeStep === 'active-meeting' && (
          <div className="py-2 space-y-3 font-sans">
            <div className="bg-[#202124] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-between">
              
              {/* Meeting Header */}
              <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">CS-302 Cloud Architecture Lecture</span>
                  <span className="text-zinc-500">&bull;</span>
                  <span className="font-mono text-zinc-400">meet.google.com/xyz-abc-qrs</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live (48 Participants)
                  </span>
                </div>
              </div>

              {/* 4-Participant Video Call Grid with Real Human Portraits */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[220px]">
                
                {/* Tile 1: Instructor (Active Speaker) */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-800 border-2 border-emerald-500 flex flex-col justify-between p-3 min-h-[120px]">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt="Dr. Aris Thorne"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-white text-[10px] font-bold">
                      INSTRUCTOR
                    </span>
                    <span className="p-1 rounded-full bg-emerald-500 text-zinc-900">
                      <Mic className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="relative z-10 flex justify-between items-end">
                    <span className="font-bold text-white text-xs bg-zinc-900/80 px-2 py-0.5 rounded">
                      Dr. Aris Thorne (Speaking)
                    </span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                      Screen Sharing
                    </span>
                  </div>
                </div>

                {/* Tile 2: Student Aarav Sharma */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex flex-col justify-between p-3 min-h-[120px]">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
                    alt="Aarav Sharma"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 text-[10px]">
                      ENR-2026-001
                    </span>
                    <span className="p-1 rounded-full bg-zinc-800/80 text-zinc-400">
                      <MicOff className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="relative z-10">
                    <span className="font-bold text-white text-xs bg-zinc-900/80 px-2 py-0.5 rounded">
                      Aarav Sharma
                    </span>
                  </div>
                </div>

                {/* Tile 3: Student Sophia Chen */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex flex-col justify-between p-3 min-h-[120px]">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
                    alt="Sophia Chen"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 text-[10px]">
                      ENR-2026-002
                    </span>
                    <span className="p-1 rounded-full bg-zinc-800/80 text-zinc-400">
                      <MicOff className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="relative z-10">
                    <span className="font-bold text-white text-xs bg-zinc-900/80 px-2 py-0.5 rounded">
                      Sophia Chen
                    </span>
                  </div>
                </div>

                {/* Tile 4: Student Aanya Patel */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex flex-col justify-between p-3 min-h-[120px]">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
                    alt="Aanya Patel"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 text-[10px]">
                      ENR-2026-0042
                    </span>
                    <span className="p-1 rounded-full bg-zinc-800/80 text-zinc-400">
                      <MicOff className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="relative z-10">
                    <span className="font-bold text-white text-xs bg-zinc-900/80 px-2 py-0.5 rounded">
                      Aanya Patel
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Meeting Controls Bar */}
              <div className="px-6 py-3 bg-[#1e1e1e] border-t border-zinc-800 flex items-center justify-between">
                <div className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                  09:42 AM &bull; Session Duration: 42:15
                </div>

                {/* Center Audio/Video Buttons */}
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2.5 rounded-full transition ${isMuted ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    className={`p-2.5 rounded-full transition ${isCameraOff ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
                    title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                  >
                    {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHandRaised(!isHandRaised)}
                    className={`p-2.5 rounded-full transition ${isHandRaised ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
                    title="Raise hand"
                  >
                    <Hand className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    className="p-2.5 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
                    title="Share screen"
                  >
                    <ScreenShare className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStep('class-log')}
                    className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 ml-2 transition"
                    title="End lecture session"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Leave</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-zinc-400 text-xs hidden sm:flex">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> 48
                  </span>
                  <span className="flex items-center gap-1 ml-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: CLASS RECORD & ATTENDANCE LOGGED                                 */}
        {/* ========================================================================= */}
        {activeStep === 'class-log' && (
          <div className="py-4 space-y-4">
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-bold text-white text-sm">Post-Lecture Academic Audit Record</span>
                <span className="text-emerald-400 font-bold">SESSION COMPLETED & RECORDED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Lecture Attendance</span>
                  <div className="text-base font-bold text-white mt-1">46 / 48 (95.8%)</div>
                  <span className="text-emerald-400 text-[10px]">2 Excused Absences</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Curriculum Topic</span>
                  <div className="text-base font-bold text-white mt-1">Raft Consensus</div>
                  <span className="text-indigo-400 text-[10px]">Unit 4 Pacing Complete</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Recording Attachment</span>
                  <div className="text-base font-bold text-white mt-1">Recorded (1.2 GB)</div>
                  <span className="text-zinc-400 text-[10px]">S3 Stream Available</span>
                </div>
              </div>

              <div className="pt-2 text-zinc-400 text-[11px] flex justify-between items-center">
                <span>Integrated into AttendanceTracker.jsx and Student Dossier registers.</span>
                <button
                  type="button"
                  onClick={() => handleSelectStep('calendar-create')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Restart Sequence &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom State Bar */}
        <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
          <span>Active State: {currentStep.label}</span>
          <span className="text-zinc-400 font-mono">Google Calendar &bull; Google Meet &bull; EduPulse Rest Sync</span>
        </div>

      </div>

    </div>
  );
};

export default GoogleMeetClassroomDemo;
