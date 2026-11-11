import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  BookOpen, 
  Users, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Table,
  Workflow,
  Key,
  Layers
} from 'lucide-react';

type DomainKey = 'academics' | 'students' | 'finance' | 'operations';

interface DomainSpec {
  key: DomainKey;
  label: string;
  moduleRoute: string;
  domainTitle: string;
  domainSubtitle: string;
  leadRole: string;
  icon: React.ComponentType<{ className?: string }>;
  tables: Array<{
    name: string;
    description: string;
    primaryKeys: string;
    foreignKeys?: string;
  }>;
  workflows: Array<{
    step: string;
    action: string;
    detail: string;
  }>;
  interconnects: Array<{
    target: string;
    flow: string;
  }>;
  isolationPolicy: string;
}

export const InstitutionalProductMockup: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<DomainKey>('academics');

  const domains: Record<DomainKey, DomainSpec> = {
    academics: {
      key: 'academics',
      label: 'Academics & Curricula',
      moduleRoute: '/academic/courses',
      domainTitle: 'Curriculum Framework & Course Catalog',
      domainSubtitle: 'Defines degree programs, credit distributions, course offerings, and multi-term academic syllabi.',
      leadRole: 'Dean of Academic Affairs & Registrar',
      icon: BookOpen,
      tables: [
        {
          name: 'course',
          description: 'Departmental master course definitions with credit weightings and descriptions',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'department_id &rarr; department.id'
        },
        {
          name: 'course_offering',
          description: 'Term-specific lecture sections scheduled with faculty and room allocations',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'course_id &rarr; course.id, term_id &rarr; academic_term.id'
        },
        {
          name: 'academic_term',
          description: 'Semester lifecycle boundaries (Fall, Spring, Summer) with enrollment windows',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'tenant_id &rarr; tenant_registry.id'
        },
        {
          name: 'transcript_record',
          description: 'Permanent grade history with cumulative GPA and earned credit totals',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'student_id &rarr; student.id, course_id &rarr; course.id'
        }
      ],
      workflows: [
        {
          step: '01',
          action: 'Course Definition & Credit Weighting',
          detail: 'Bursar and Academic Board define course codes (e.g., CS-201), lecture hours, lab hours, and credit units.'
        },
        {
          step: '02',
          action: 'Offering & Faculty Assignment',
          detail: 'Assign designated faculty lecturers and define maximum classroom seat capacities per section.'
        },
        {
          step: '03',
          action: 'Syllabus & Notion Workspace Binding',
          detail: 'Associate verified course syllabus links and collaborative Notion resources for enrolled students.'
        },
        {
          step: '04',
          action: 'Grade Book & Transcript Compilation',
          detail: 'Calculate weighted term GPA and generate digital academic transcripts upon final exam clearance.'
        }
      ],
      interconnects: [
        {
          target: 'Student SIS',
          flow: 'Enrolled student cohorts auto-populate class rosters and attendance registers'
        },
        {
          target: 'Finance Ledger',
          flow: 'Enrolled credit hours dynamically calculate tuition fee voucher amounts'
        },
        {
          target: 'Operations Timetable',
          flow: 'Course offerings generate weekly conflict-free lecture slots and room reservations'
        }
      ],
      isolationPolicy: 'tenant_isolation_policy ON course USING (tenant_id = NULLIF(current_setting(\'app.current_tenant\', true), \'\'))'
    },
    students: {
      key: 'students',
      label: 'Student Information (SIS)',
      moduleRoute: '/students',
      domainTitle: 'Student Lifecycle, Admissions & Permanent SIS',
      domainSubtitle: 'Manages candidate intake, enrollment verification, unique roll number allocation, and permanent profiles.',
      leadRole: 'Registrar & Admissions Directorate',
      icon: Users,
      tables: [
        {
          name: 'student',
          description: 'Permanent institutional student profiles with verified bio data and cohort mapping',
          primaryKeys: 'id (UUID), roll_number (VARCHAR UNIQUE)',
          foreignKeys: 'tenant_id &rarr; tenant_registry.id'
        },
        {
          name: 'admission_application',
          description: 'Public applicant submissions with status tracking (SUBMITTED, UNDER_REVIEW, APPROVED)',
          primaryKeys: 'id (UUID), application_number (VARCHAR)',
          foreignKeys: 'program_id &rarr; academic_program.id'
        },
        {
          name: 'student_academic_history',
          description: 'Semester-by-semester academic standing records (Good Standing, Dean\'s List, Academic Warning)',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'student_id &rarr; student.id, term_id &rarr; academic_term.id'
        },
        {
          name: 'guardian',
          description: 'Verified guardian profiles with emergency contact details and portal credentials',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'student_id &rarr; student.id'
        }
      ],
      workflows: [
        {
          step: '01',
          action: 'Public Admissions Intake',
          detail: 'Prospective students submit applications via the public admission portal (/admissions).'
        },
        {
          step: '02',
          action: 'Committee Verification & Approval',
          detail: 'Admissions staff review academic credentials and verify eligibility criteria.'
        },
        {
          step: '03',
          action: 'Roll Number Generation & Enrollment',
          detail: 'Approved applicants receive a deterministic Roll Number, cohort batch, and student portal credentials.'
        },
        {
          step: '04',
          action: 'Continuous Standing Monitoring',
          detail: 'Academic history updates each semester to ensure attendance thresholds and graduation eligibility.'
        }
      ],
      interconnects: [
        {
          target: 'Academic Catalog',
          flow: 'Enrolled students register for available term course offerings according to degree track'
        },
        {
          target: 'Fee Management',
          flow: 'Approved enrollment triggers automated semester fee invoice generation in the student ledger'
        },
        {
          target: 'Assessment Security',
          flow: 'Verified active student credentials authorize Safe Exam Browser assessment sessions'
        }
      ],
      isolationPolicy: 'tenant_isolation_policy ON student USING (tenant_id = NULLIF(current_setting(\'app.current_tenant\', true), \'\'))'
    },
    finance: {
      key: 'finance',
      label: 'Fee & Ledger Engine',
      moduleRoute: '/finance/fees',
      domainTitle: 'Institutional Invoicing, Ledgers & Online Fee Settlement',
      domainSubtitle: 'Configures multi-head fee structures, automates student vouchers, and reconciles payments via Razorpay.',
      leadRole: 'Campus Bursar & Comptroller',
      icon: DollarSign,
      tables: [
        {
          name: 'fee_structure',
          description: 'Departmental fee blueprints segmented by academic program and cohort year',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'program_id &rarr; academic_program.id'
        },
        {
          name: 'fee_head',
          description: 'Modular fee components (Tuition, Lab Access, Library, Campus Facilities)',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'fee_structure_id &rarr; fee_structure.id'
        },
        {
          name: 'student_invoice',
          description: 'Itemized student payment vouchers with status tracking (UNPAID, PARTIAL, PAID)',
          primaryKeys: 'id (UUID), invoice_number (VARCHAR UNIQUE)',
          foreignKeys: 'student_id &rarr; student.id, fee_structure_id &rarr; fee_structure.id'
        },
        {
          name: 'student_ledger',
          description: 'Immutable debit/credit accounting entries with Razorpay transaction references',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'invoice_id &rarr; student_invoice.id, student_id &rarr; student.id'
        }
      ],
      workflows: [
        {
          step: '01',
          action: 'Fee Head & Structure Configuration',
          detail: 'Bursar defines recurring and one-time fee heads categorized by tuition, labs, and amenities.'
        },
        {
          step: '02',
          action: 'Term Voucher Batch Generation',
          detail: 'Generate individual student invoices mapped directly to enrolled degree credit requirements.'
        },
        {
          step: '03',
          action: 'Online Checkout & Razorpay Settlement',
          detail: 'Students or parents initiate instant payment via Razorpay Checkout modal in /portal/fees.'
        },
        {
          step: '04',
          action: 'Webhook Reconciliation & Receipt Issuance',
          detail: 'Server-side webhook verifies payment signature, updates invoice to PAID, and issues audit receipt.'
        }
      ],
      interconnects: [
        {
          target: 'Student SIS',
          flow: 'Fee payment clearance automatically unlocks semester exam hall ticket generation'
        },
        {
          target: 'Razorpay Gateway',
          flow: 'Direct merchant settlement into the verified institutional bank account'
        },
        {
          target: 'Auditing Ledger',
          flow: 'Double-entry debit/credit ledger provides immutable financial audit trails'
        }
      ],
      isolationPolicy: 'tenant_isolation_policy ON student_invoice USING (tenant_id = NULLIF(current_setting(\'app.current_tenant\', true), \'\'))'
    },
    operations: {
      key: 'operations',
      label: 'Campus Operations',
      moduleRoute: '/operations/timetable',
      domainTitle: 'Lecture Timetables, Attendance & Campus Logistics',
      domainSubtitle: 'Coordinates weekly timetables, Google Meet classrooms, biometric attendance, and transport fleets.',
      leadRole: 'Campus Operations Director & Facilities Manager',
      icon: Calendar,
      tables: [
        {
          name: 'timetable_slot',
          description: 'Scheduled lecture periods with room assignments, day of week, and virtual link',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'course_offering_id &rarr; course_offering.id, batch_id &rarr; batch.id'
        },
        {
          name: 'attendance_record',
          description: 'Daily lecture attendance logs tracking presence, absence, and medical leaves',
          primaryKeys: 'id (UUID)',
          foreignKeys: 'student_id &rarr; student.id, timetable_slot_id &rarr; timetable_slot.id'
        },
        {
          name: 'transport_route',
          description: 'Campus bus routes with designated passenger stops, vehicles, and seat limits',
          primaryKeys: 'id (UUID), route_code (VARCHAR UNIQUE)',
          foreignKeys: 'tenant_id &rarr; tenant_registry.id'
        },
        {
          name: 'library_book',
          description: 'Resource catalog items with ISBN tracking, loan circulation, and return dates',
          primaryKeys: 'id (UUID), isbn (VARCHAR)',
          foreignKeys: 'tenant_id &rarr; tenant_registry.id'
        }
      ],
      workflows: [
        {
          step: '01',
          action: 'Conflict-Free Timetable Scheduling',
          detail: 'Generate weekly class schedules, preventing room collisions and lecturer double-booking.'
        },
        {
          step: '02',
          action: 'Google Meet Virtual Classroom Binding',
          detail: 'Associate verified video conference links for hybrid and remote lecture sections.'
        },
        {
          step: '03',
          action: 'Biometric & Lecture Attendance Recording',
          detail: 'Faculty mark attendance or sync automated biometric punch logs via hardware REST API.'
        },
        {
          step: '04',
          action: 'Deficit Alerting & Threshold Enforcement',
          detail: 'Automated warnings trigger when student attendance drops below institutional requirement (e.g. 75%).'
        }
      ],
      interconnects: [
        {
          target: 'Academic Catalog',
          flow: 'Timetable slots strictly enforce course offering capacity and faculty allocations'
        },
        {
          target: 'Google Meet',
          flow: 'Enrolled students join scheduled lecture streams directly from their timetable view'
        },
        {
          target: 'Student SIS',
          flow: 'Attendance records factor directly into semester examination eligibility'
        }
      ],
      isolationPolicy: 'tenant_isolation_policy ON timetable_slot USING (tenant_id = NULLIF(current_setting(\'app.current_tenant\', true), \'\'))'
    }
  };

  const active = domains[activeDomain];
  const DomainIcon = active.icon;

  return (
    <div className="w-full rounded-2xl bg-white border border-zinc-200/90 shadow-sm overflow-hidden font-sans text-left">
      
      {/* 1. System Inspector Top Header */}
      <div className="px-5 py-4 bg-zinc-50/80 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 flex items-center gap-2">
              System Architecture & Data Entity Blueprint
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                PostgreSQL RLS Active
              </span>
            </div>
            <div className="text-[11px] text-zinc-500">
              Verified domain data schemas, relational foreign keys, and administrative state transitions.
            </div>
          </div>
        </div>

        {/* Domain Selector Tabs */}
        <div className="flex items-center p-1 bg-zinc-200/60 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600">
          {(Object.keys(domains) as DomainKey[]).map((key) => {
            const isSelected = activeDomain === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDomain(key)}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'hover:text-zinc-900 text-zinc-600'
                }`}
              >
                {domains[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Domain Detailed Blueprint */}
      <div className="p-6 sm:p-8 space-y-8 bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDomain}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-8"
          >
            {/* Domain Overview Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-100">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <DomainIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-900">{active.domainTitle}</h3>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      Route: {active.moduleRoute}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
                    {active.domainSubtitle}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-zinc-100 sm:pl-6 text-xs text-zinc-500">
                <span className="block font-medium text-zinc-400 text-[10px] uppercase tracking-wider">Domain Authority</span>
                <span className="font-semibold text-zinc-800">{active.leadRole}</span>
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (7 Cols): Verified Database Tables & Schemas */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-600" />
                    Verified Relational Entities & Data Schema
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500">PostgreSQL Engine</span>
                </div>

                <div className="space-y-2.5">
                  {active.tables.map((tbl) => (
                    <div key={tbl.name} className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-zinc-400" />
                          table: {tbl.name}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">PK: {tbl.primaryKeys}</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        {tbl.description}
                      </p>
                      {tbl.foreignKeys && (
                        <div className="text-[10px] font-mono text-indigo-700 pt-0.5">
                          FK: <span dangerouslySetInnerHTML={{ __html: tbl.foreignKeys }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Database Isolation Callout */}
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/70 text-xs text-zinc-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-semibold text-[11px]">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    Row-Level Security Confinement
                  </div>
                  <div className="font-mono text-[10px] text-zinc-700 break-all">
                    {active.isolationPolicy}
                  </div>
                </div>
              </div>

              {/* Right Column (5 Cols): Administrative Workflows & Cross-Domain Interconnects */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Workflows */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-indigo-600" />
                    Administrative Lifecycle Workflows
                  </h4>

                  <div className="space-y-2">
                    {active.workflows.map((wf) => (
                      <div key={wf.step} className="p-3 rounded-xl border border-zinc-200/80 bg-white space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-zinc-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {wf.step}
                          </span>
                          <span className="text-xs font-bold text-zinc-900">{wf.action}</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 pl-7 leading-relaxed">
                          {wf.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inter-Module State Propagation */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Cross-Module State Synchronization
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {active.interconnects.map((conn, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-600">
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-zinc-800">{conn.target}: </span>
                          <span className="text-[11px]">{conn.flow}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Footer Bar */}
      <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL 16 Multi-Tenant Isolation with Zero Leakage</span>
        </div>
        <div className="font-mono text-zinc-600">
          Source: /src/pages/{activeDomain === 'academics' ? 'Academic/CourseManager.jsx' : activeDomain === 'students' ? 'StudentsList.tsx' : activeDomain === 'finance' ? 'Finance/FeeManager.jsx' : 'Operations/TimetableManager.jsx'}
        </div>
      </div>

    </div>
  );
};

export default InstitutionalProductMockup;
