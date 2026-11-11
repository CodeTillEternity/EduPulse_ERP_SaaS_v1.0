import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  CreditCard, 
  GraduationCap, 
  Video,
  Play,
  Pause,
  ShieldCheck
} from 'lucide-react';

export type HeroScreenId = 'dashboard' | 'sis' | 'timetable' | 'finance' | 'exams';

interface ScreenConfig {
  id: HeroScreenId;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  urlPath: string;
}

export const HeroProductComposition: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<HeroScreenId>('dashboard');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const screens: ScreenConfig[] = [
    {
      id: 'dashboard',
      label: 'Campus Overview',
      sublabel: 'Management Console',
      icon: Building2,
      urlPath: '/dashboard'
    },
    {
      id: 'sis',
      label: 'Student Dossier',
      sublabel: 'Aarav Sharma (ENR-001)',
      icon: Users,
      urlPath: '/students/ENR-2026-001'
    },
    {
      id: 'timetable',
      label: 'Academic Schedule',
      sublabel: 'Lectures & Google Meet',
      icon: Calendar,
      urlPath: '/operations/timetable'
    },
    {
      id: 'finance',
      label: 'Student Fee Ledger',
      sublabel: 'Invoice & Razorpay',
      icon: CreditCard,
      urlPath: '/finance/ledger/ENR-2026-001'
    },
    {
      id: 'exams',
      label: 'Exam Transcript',
      sublabel: 'GPA & Letter Grades',
      icon: GraduationCap,
      urlPath: '/exams/transcripts/ENR-2026-001'
    }
  ];

  const DURATION_MS = 5000;
  const INTERVAL_MS = 50;

  useEffect(() => {
    // Disable auto-play timer in test environment to avoid timer starvation in JSDOM
    if ((globalThis as any).process?.env?.NODE_ENV === 'test' || (import.meta as any).env?.MODE === 'test') {
      setIsPlaying(false);
      return;
    }

    // Check user preference for reduced motion
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
          // Transition to next screen
          setActiveScreen((curr) => {
            const currIdx = screens.findIndex((s) => s.id === curr);
            const nextIdx = (currIdx + 1) % screens.length;
            return screens[nextIdx].id;
          });
          return 0;
        }
        return prev + (INTERVAL_MS / DURATION_MS) * 100;
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, screens.length]);

  const handleSelectScreen = (screenId: HeroScreenId) => {
    setActiveScreen(screenId);
    setProgress(0);
  };

  const currentScreenConfig = screens.find((s) => s.id === activeScreen) || screens[0];

  return (
    <div 
      className="w-full max-w-6xl mx-auto rounded-2xl md:rounded-3xl border border-zinc-200/90 bg-white shadow-2xl overflow-hidden font-sans text-left transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Application Header / Window Chrome */}
      <div className="px-4 py-2.5 bg-zinc-100/95 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
          </div>

          <div className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-zinc-200/80 text-[11px] text-zinc-600 font-mono">
            <span className="text-zinc-400">https://</span>
            <span className="text-zinc-900 font-semibold">demo.edupulse.io</span>
            <span className="text-indigo-600">{currentScreenConfig.urlPath}</span>
          </div>
        </div>

        {/* Auto-Sequence Controls & Demonstration Badge */}
        <div className="flex items-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition text-[10px] font-medium"
            title={isPlaying ? 'Pause Auto Sequence' : 'Resume Auto Sequence'}
          >
            {isPlaying && !isHovered ? (
              <>
                <Pause className="w-3 h-3 text-indigo-600" />
                <span>Auto-Playing (5s)</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-zinc-500" />
                <span>{isHovered ? 'Paused on Hover' : 'Sequence Paused'}</span>
              </>
            )}
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Live Demonstration Sandbox
          </span>
        </div>
      </div>

      {/* Screen Sequence Step Indicators */}
      <div className="grid grid-cols-5 border-b border-zinc-200/80 bg-zinc-50/80">
        {screens.map((screen) => {
          const isCurrent = activeScreen === screen.id;
          const Icon = screen.icon;
          return (
            <button
              key={screen.id}
              type="button"
              onClick={() => handleSelectScreen(screen.id)}
              className={`p-2.5 text-left transition relative border-r last:border-r-0 border-zinc-200/80 flex flex-col justify-between ${
                isCurrent ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {screen.id.toUpperCase()}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-600' : 'text-zinc-400'}`} />
              </div>
              <div className="text-xs font-bold truncate mt-1">{screen.label}</div>

              {/* Progress bar line for active item */}
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

      {/* Main Operating Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] bg-zinc-50/40">
        
        {/* Left Real Sidebar Navigation */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-2.5 bg-white border-r border-zinc-200/80 p-3.5 flex-col justify-between text-xs space-y-6">
          <div className="space-y-4">
            
            {/* Institution Brand */}
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                E
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-zinc-900 truncate text-[11px]">EduPulse ERP</div>
                <div className="text-[10px] text-zinc-400 truncate">V1.4 Operational System</div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1 text-zinc-600 font-medium text-[11px]">
              {screens.map((screen) => {
                const isSelected = activeScreen === screen.id;
                const Icon = screen.icon;
                return (
                  <button
                    key={screen.id}
                    type="button"
                    onClick={() => handleSelectScreen(screen.id)}
                    className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between transition text-left ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{screen.label}</span>
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Session Pill */}
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-[10px]">
            <div>
              <span className="font-bold text-zinc-800 block">admin.registrar</span>
              <span className="text-zinc-500 font-mono">ROLE_ADMIN</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Right Active Screen Content */}
        <div className="col-span-1 md:col-span-9 lg:col-span-9.5 p-4 sm:p-6 space-y-4">
          
          {/* Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-900">{currentScreenConfig.label}</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-500 font-medium">{currentScreenConfig.sublabel}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">Academic Year 2026–2027</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                RLS ISOLATED
              </span>
            </div>
          </div>

          {/* SCREEN 1: INSTITUTIONAL DASHBOARD */}
          {activeScreen === 'dashboard' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Active Students</span>
                  <div className="text-lg font-bold text-zinc-900">1,248</div>
                  <span className="text-[10px] text-emerald-600 font-medium">16 Cohort Batches</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Faculty Members</span>
                  <div className="text-lg font-bold text-zinc-900">48</div>
                  <span className="text-[10px] text-zinc-500">Across 8 Departments</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Fee Collection Rate</span>
                  <div className="text-lg font-bold text-emerald-700">91.5%</div>
                  <span className="text-[10px] text-indigo-600 font-medium">Settled via Razorpay</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Campus Attendance</span>
                  <div className="text-lg font-bold text-zinc-900">96.4%</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Above 75% Threshold</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="font-bold text-zinc-900">Admissions Review Intake Queue</span>
                  <span className="font-mono text-[10px] text-zinc-400">Source: Admissions.tsx</span>
                </div>
                <div className="divide-y divide-zinc-100 text-[11px]">
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-900">Aanya Patel</span>
                      <span className="text-zinc-500 ml-2">B.Tech Computer Science &bull; App #APP-2026-042</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      UNDER_REVIEW
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-900">Devansh Verma</span>
                      <span className="text-zinc-500 ml-2">B.Tech Mechanical &bull; App #APP-2026-039</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      APPROVED & ENROLLED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: STUDENT SIS DOSSIER */}
          {activeScreen === 'sis' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-4 text-xs">
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
                    <p className="text-xs text-zinc-500 font-mono">Roll: ENR-2026-001 &bull; B.Tech Computer Science (Batch 2023–2027)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono">
                    CGPA: 3.92 / 4.0
                  </span>
                  <div className="text-[10px] text-zinc-400 mt-1">Dean's Honor Roll</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Attendance Record</span>
                  <div className="text-base font-bold text-zinc-900 mt-0.5">96.4% Compliance</div>
                  <span className="text-[10px] text-emerald-600 font-medium">54 / 56 Sessions Attended</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Fee Voucher Settlement</span>
                  <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono">PAID (₹45,000)</div>
                  <span className="text-[10px] text-zinc-500 font-mono">Receipt: RCP-8912 via Razorpay</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Identity & Documents</span>
                  <div className="text-base font-bold text-zinc-900 mt-0.5">Aadhaar Verified</div>
                  <span className="text-[10px] text-emerald-600 font-medium">12th Marksheet On Record</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Guardian: Rajesh Sharma (+91 98765 43210)</span>
                <span className="font-mono text-indigo-600 font-medium">Component: StudentProfile.tsx</span>
              </div>
            </div>
          )}

          {/* SCREEN 3: TIMETABLE & CLASSROOM */}
          {activeScreen === 'timetable' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-xs text-zinc-900">Weekly Lecture Schedule & Meet Integration</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  SCHEDULE SYNCHRONIZED
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-zinc-900">CS-302: Cloud Architecture</div>
                    <div className="text-[11px] text-zinc-600">Lecture Hall 402 &bull; Instructor: Dr. Aris Thorne</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-white font-mono text-[11px]">
                    09:00 AM – 10:30 AM (Mon/Wed)
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <Video className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Meet Ready: <code className="font-mono text-zinc-600">meet.google.com/xyz-abc</code></span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Room Collision Check: PASSED</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Enrolled Batch: B.Tech CS-2023 (48 Students)</span>
                <span className="font-mono text-indigo-600">Component: TimetableManager.jsx</span>
              </div>
            </div>
          )}

          {/* SCREEN 4: FINANCE & PAYMENT LEDGER */}
          {activeScreen === 'finance' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs text-zinc-900">Student Fee Voucher & Double-Entry Ledger</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Razorpay Verified
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">Voucher: INV-2026-089</span>
                    <span className="font-bold text-sm text-zinc-900">Fall 2026 Tuition & Laboratory Fee</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-700 font-mono">₹45,000.00</div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      PAID & RECONCILED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/80 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block">Receipt Token:</span>
                    <span className="font-mono font-bold text-zinc-800">RCP-8912 (Order: order_Rzp8921829)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Signature Check:</span>
                    <span className="font-mono text-indigo-700 font-semibold">HMAC-SHA256 Match Confirmed</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Outstanding Balance: ₹0.00</span>
                <span className="font-mono text-indigo-600">Component: StudentLedger.jsx</span>
              </div>
            </div>
          )}

          {/* SCREEN 5: EXAMS & RESULTS */}
          {activeScreen === 'exams' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-xs text-zinc-900">Official Academic Transcript & Grading</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  DEAN VERIFIED
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50/60 font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-zinc-100 text-zinc-600 border-b border-zinc-200">
                    <tr>
                      <th className="p-2.5">Course Code</th>
                      <th className="p-2.5">Course Title</th>
                      <th className="p-2.5 text-center">Marks</th>
                      <th className="p-2.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800">
                    <tr>
                      <td className="p-2.5 font-bold text-indigo-700">CS-302</td>
                      <td className="p-2.5 font-sans">Cloud Architecture</td>
                      <td className="p-2.5 text-center">94 / 100</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">A+</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-indigo-700">CS-402</td>
                      <td className="p-2.5 font-sans">Advanced Distributed Algorithms</td>
                      <td className="p-2.5 text-center">91 / 100</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">A</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-zinc-100/60 rounded-xl flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-zinc-500">Cumulative GPA: </span>
                  <span className="font-bold font-mono text-zinc-900">3.92 / 4.00</span>
                </div>
                <div className="text-zinc-500 font-mono">
                  Standing: <span className="text-emerald-700 font-bold">First Class with Distinction</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Enterprise Architecture Strip */}
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Architecture Preview • Thread-Confined RLS Session</span>
            </div>
            <div className="text-zinc-400">
              Validated via com.erp.multitenancy.TenantFilter
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default HeroProductComposition;
