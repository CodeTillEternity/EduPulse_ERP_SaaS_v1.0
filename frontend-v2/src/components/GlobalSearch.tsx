import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { apiClient } from '../config/api';
import {
  Search,
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  Clock,
  BookOpen,
  Truck,
  Building2,
  ShieldCheck,
  CreditCard,
  UserPlus,
  FileCheck2,
  FileText,
  BadgeAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface StudentSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  enrollmentNumber?: string;
  department?: string;
}

interface InvoiceSearchResult {
  id: number;
  invoiceNumber: string;
  studentName?: string;
  grossAmount?: number;
  status?: string;
}

const STATIC_MODULES = [
  {
    name: 'Dashboard Overview',
    path: '/dashboard',
    category: 'General',
    icon: LayoutDashboard,
    keywords: ['home', 'overview', 'stats', 'analytics'],
  },
  {
    name: 'Student Directory',
    path: '/dashboard/students',
    category: 'Academic Operations',
    icon: Users,
    keywords: ['students', 'directory', 'profiles', 'enrollment'],
  },
  {
    name: 'Admissions & Student Enrollment',
    path: '/dashboard/admissions',
    category: 'Academic Operations',
    icon: UserPlus,
    keywords: ['admissions', 'enroll', 'applicant', 'onboarding'],
  },
  {
    name: 'Course Catalog & Programs',
    path: '/dashboard/academics',
    category: 'Academics',
    icon: GraduationCap,
    keywords: ['courses', 'curriculum', 'degrees', 'syllabus'],
  },
  {
    name: 'Examination & SEB Proctoring',
    path: '/dashboard/academic/exams',
    category: 'Academics',
    icon: FileCheck2,
    keywords: ['exams', 'proctoring', 'seb', 'tests', 'assessments'],
  },
  {
    name: 'Academic Transcripts',
    path: '/dashboard/academic/transcripts',
    category: 'Academics',
    icon: BookOpen,
    keywords: ['transcripts', 'grades', 'report card', 'cgpa'],
  },
  {
    name: 'Timetable & Class Schedules',
    path: '/dashboard/operations/timetable',
    category: 'Campus Operations',
    icon: Clock,
    keywords: ['timetable', 'schedule', 'slots', 'periods', 'routine'],
  },
  {
    name: 'Attendance Tracker & Register',
    path: '/dashboard/operations/attendance',
    category: 'Campus Operations',
    icon: CalendarCheck,
    keywords: ['attendance', 'present', 'absent', 'rollcall'],
  },
  {
    name: 'Transport Routing & Fleets',
    path: '/dashboard/operations/transport',
    category: 'Campus Operations',
    icon: Truck,
    keywords: ['transport', 'bus', 'routes', 'fleet', 'driver', 'pickup'],
  },
  {
    name: 'Library Management',
    path: '/dashboard/operations/library',
    category: 'Campus Operations',
    icon: BookOpen,
    keywords: ['library', 'books', 'borrow', 'isbn', 'catalog'],
  },
  {
    name: 'Fee Management & Invoicing',
    path: '/dashboard/finance/fees',
    category: 'Financial Operations',
    icon: Wallet,
    keywords: ['fees', 'invoices', 'billing', 'tuition', 'finance'],
  },
  {
    name: 'Student Fee Ledger',
    path: '/dashboard/finance/ledger',
    category: 'Financial Operations',
    icon: FileText,
    keywords: ['ledger', 'payments', 'balance', 'receipts'],
  },
  {
    name: 'Leave Management & Approvals',
    path: '/dashboard/hr/leaves',
    category: 'Human Resources',
    icon: BadgeAlert,
    keywords: ['leaves', 'vacation', 'sick leave', 'hr', 'approval'],
  },
  {
    name: 'Staff Payroll & Disbursements',
    path: '/dashboard/hr/payroll',
    category: 'Human Resources',
    icon: CreditCard,
    keywords: ['payroll', 'salary', 'wages', 'disbursement', 'payslip'],
  },
  {
    name: 'Departments & Faculties',
    path: '/dashboard/departments',
    category: 'System Setup',
    icon: Building2,
    keywords: ['departments', 'faculties', 'divisions', 'campus'],
  },
  {
    name: 'Access Control & Staff Users',
    path: '/dashboard/admin/users',
    category: 'System Setup',
    icon: ShieldCheck,
    keywords: ['users', 'roles', 'permissions', 'rbac', 'staff'],
  },
  {
    name: 'SaaS Subscription & Billing',
    path: '/dashboard/billing',
    category: 'System Setup',
    icon: CreditCard,
    keywords: ['subscription', 'plan', 'upgrade', 'saas', 'invoices'],
  },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [invoices, setInvoices] = useState<InvoiceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Dynamic server queries for students and invoices
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setStudents([]);
      setInvoices([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [studentsRes, invoicesRes] = await Promise.allSettled([
          apiClient.get('/api/v1/students', {
            params: { search: query.trim(), page: 0, size: 5 },
          }),
          apiClient.get('/api/v1/finance/invoices', {
            params: { search: query.trim(), page: 0, size: 5 },
          }),
        ]);

        if (studentsRes.status === 'fulfilled') {
          const list = studentsRes.value.data?.data?.content || studentsRes.value.data?.content || [];
          setStudents(list.slice(0, 5));
        }

        if (invoicesRes.status === 'fulfilled') {
          const raw = invoicesRes.value.data;
          const list = Array.isArray(raw) ? raw : raw?.content || [];
          setInvoices(list.slice(0, 5));
        }
      } catch {
        // Silently tolerate search error
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery('');
      navigate(path);
    },
    [navigate]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95">
        <Command
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
          className="w-full flex flex-col"
        >
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search student names, invoice IDs, or jump to module..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="flex items-center space-x-1.5 ml-2">
              {isSearching && (
                <span className="text-[11px] text-indigo-600 animate-pulse font-medium">Searching...</span>
              )}
              <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results List */}
          <Command.List className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
            <Command.Empty className="py-8 text-center text-xs text-slate-500">
              No matching modules, students, or invoices found.
            </Command.Empty>

            {/* Dynamic Students Results */}
            {students.length > 0 && (
              <Command.Group
                heading="Students"
                className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5"
              >
                {students.map((student) => (
                  <Command.Item
                    key={`student-${student.id}`}
                    value={`student ${student.firstName} ${student.lastName} ${student.enrollmentNumber || ''}`}
                    onSelect={() => handleSelect(`/dashboard/students/${student.id}`)}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors text-slate-700 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900 group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                        {student.firstName[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600">
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="ml-2 font-mono text-[10px] text-slate-400">
                          {student.enrollmentNumber || `#${student.id}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 flex items-center">
                      View Profile <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Dynamic Invoices Results */}
            {invoices.length > 0 && (
              <Command.Group
                heading="Fee Invoices"
                className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5"
              >
                {invoices.map((inv) => (
                  <Command.Item
                    key={`inv-${inv.id}`}
                    value={`invoice ${inv.invoiceNumber} ${inv.studentName || ''}`}
                    onSelect={() => handleSelect('/dashboard/finance/fees')}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors text-slate-700 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900 group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                        {inv.studentName && (
                          <span className="ml-2 text-slate-600 text-xs">({inv.studentName})</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 flex items-center">
                      Open Billing <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Core Modules & Quick Routing */}
            <Command.Group
              heading="ERP Modules & Pages"
              className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5"
            >
              {STATIC_MODULES.map((mod) => {
                const Icon = mod.icon;
                const searchString = `${mod.name} ${mod.category} ${mod.keywords.join(' ')}`;
                return (
                  <Command.Item
                    key={mod.path}
                    value={searchString}
                    onSelect={() => handleSelect(mod.path)}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors text-slate-700 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900 group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-data-[selected=true]:text-indigo-600 shrink-0" />
                      <span className="font-medium text-slate-800 group-data-[selected=true]:text-indigo-900">
                        {mod.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 group-data-[selected=true]:bg-indigo-100/60 group-data-[selected=true]:text-indigo-700">
                        {mod.category}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-data-[selected=true]:opacity-100 transition-opacity" />
                    </div>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          {/* Palette Footer Help Text */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Use <kbd className="font-mono bg-white border border-slate-200 px-1 rounded">↑</kbd> <kbd className="font-mono bg-white border border-slate-200 px-1 rounded">↓</kbd> to navigate</span>
              <span>•</span>
              <span><kbd className="font-mono bg-white border border-slate-200 px-1 rounded">↵</kbd> to select</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Press <kbd className="font-mono bg-white border border-slate-200 px-1 rounded">ESC</kbd> to close</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}

export default GlobalSearch;
