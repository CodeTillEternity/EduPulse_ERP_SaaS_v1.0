import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  ChevronDown, 
  ShieldCheck, 
  Building2,
  Lock
} from 'lucide-react';

interface StudentRecord {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  rollNo: string;
  program: string;
  ledgerBalance: string;
  rlsSignature: string;
  status: 'PAID' | 'PENDING' | 'SCHOLARSHIP';
}

interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  dbPool: string;
  badge: string;
  records: StudentRecord[];
}

const TENANTS: Record<string, TenantConfig> = {
  harvard: {
    id: 'harvard',
    name: 'Harvard University',
    subdomain: 'harvard.edupulse.io',
    dbPool: 'Dedicated Pool (HikariCP-vip-harvard)',
    badge: 'Enterprise Dedicated',
    records: [
      {
        id: '1',
        name: 'Marcus Vance',
        initials: 'MV',
        avatarBg: 'bg-zinc-800 text-zinc-200',
        rollNo: 'HAR-2026-081',
        program: 'B.S. Computer Science',
        ledgerBalance: '$24,500.00',
        rlsSignature: 'rls:tenant_harvard_081',
        status: 'PAID'
      },
      {
        id: '2',
        name: 'Elena Rostova',
        initials: 'ER',
        avatarBg: 'bg-zinc-700 text-zinc-100',
        rollNo: 'HAR-2026-114',
        program: 'M.S. Artificial Intelligence',
        ledgerBalance: '$28,000.00',
        rlsSignature: 'rls:tenant_harvard_114',
        status: 'PENDING'
      },
      {
        id: '3',
        name: 'Devon Brooks',
        initials: 'DB',
        avatarBg: 'bg-zinc-800 text-zinc-300',
        rollNo: 'HAR-2026-309',
        program: 'B.A. Economics & Finance',
        ledgerBalance: '$24,500.00',
        rlsSignature: 'rls:tenant_harvard_309',
        status: 'PAID'
      },
      {
        id: '4',
        name: 'Sophia Chen',
        initials: 'SC',
        avatarBg: 'bg-zinc-700 text-zinc-200',
        rollNo: 'HAR-2026-442',
        program: 'Ph.D. Quantum Computing',
        ledgerBalance: '$0.00 (Fellowship)',
        rlsSignature: 'rls:tenant_harvard_442',
        status: 'SCHOLARSHIP'
      }
    ]
  },
  stanford: {
    id: 'stanford',
    name: 'Stanford University',
    subdomain: 'stanford.edupulse.io',
    dbPool: 'Dedicated Pool (HikariCP-vip-stanford)',
    badge: 'Enterprise Dedicated',
    records: [
      {
        id: '1',
        name: "Liam O'Connor",
        initials: 'LO',
        avatarBg: 'bg-zinc-800 text-zinc-200',
        rollNo: 'STA-2026-019',
        program: 'B.S. Symbolic Systems',
        ledgerBalance: '$26,200.00',
        rlsSignature: 'rls:tenant_stanford_019',
        status: 'PAID'
      },
      {
        id: '2',
        name: 'Aria Patel',
        initials: 'AP',
        avatarBg: 'bg-zinc-700 text-zinc-100',
        rollNo: 'STA-2026-088',
        program: 'M.S. Robotics & MechE',
        ledgerBalance: '$29,500.00',
        rlsSignature: 'rls:tenant_stanford_088',
        status: 'PENDING'
      },
      {
        id: '3',
        name: 'Kaito Tanaka',
        initials: 'KT',
        avatarBg: 'bg-zinc-800 text-zinc-300',
        rollNo: 'STA-2026-215',
        program: 'B.S. Electrical Engineering',
        ledgerBalance: '$26,200.00',
        rlsSignature: 'rls:tenant_stanford_215',
        status: 'PAID'
      },
      {
        id: '4',
        name: 'Chloe Dupont',
        initials: 'CD',
        avatarBg: 'bg-zinc-700 text-zinc-200',
        rollNo: 'STA-2026-391',
        program: 'M.D. / Ph.D. Bioengineering',
        ledgerBalance: '$32,000.00',
        rlsSignature: 'rls:tenant_stanford_391',
        status: 'SCHOLARSHIP'
      }
    ]
  },
  oxford: {
    id: 'oxford',
    name: 'Oxford Academy',
    subdomain: 'oxford.edupulse.io',
    dbPool: 'Multi-Tenant Shared Pool (RLS Filter)',
    badge: 'Pro Tier Multi-Tenant',
    records: [
      {
        id: '1',
        name: 'Alastair Sterling',
        initials: 'AS',
        avatarBg: 'bg-zinc-800 text-zinc-200',
        rollNo: 'OXF-2026-004',
        program: 'B.A. Philosophy & Politics',
        ledgerBalance: '£18,500.00',
        rlsSignature: 'rls:tenant_oxford_004',
        status: 'PAID'
      },
      {
        id: '2',
        name: 'Beatrice Ward',
        initials: 'BW',
        avatarBg: 'bg-zinc-700 text-zinc-100',
        rollNo: 'OXF-2026-067',
        program: 'M.Sc. Mathematical Finance',
        ledgerBalance: '£22,000.00',
        rlsSignature: 'rls:tenant_oxford_067',
        status: 'PENDING'
      },
      {
        id: '3',
        name: 'Jasper Finch',
        initials: 'JF',
        avatarBg: 'bg-zinc-800 text-zinc-300',
        rollNo: 'OXF-2026-142',
        program: 'B.A. Modern History',
        ledgerBalance: '£18,500.00',
        rlsSignature: 'rls:tenant_oxford_142',
        status: 'PAID'
      },
      {
        id: '4',
        name: 'Freya Lindqvist',
        initials: 'FL',
        avatarBg: 'bg-zinc-700 text-zinc-200',
        rollNo: 'OXF-2026-289',
        program: 'Ph.D. Astrophysics',
        ledgerBalance: '£0.00 (Stipend)',
        rlsSignature: 'rls:tenant_oxford_289',
        status: 'SCHOLARSHIP'
      }
    ]
  }
};

export const DashboardMockup: React.FC = () => {
  const [selectedTenantKey, setSelectedTenantKey] = useState<string>('harvard');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const currentTenant = TENANTS[selectedTenantKey];

  return (
    <div className="w-full rounded-2xl bg-[#0E0E10]/95 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden font-sans text-xs">
      
      {/* 1. Header Toolbar with Tenant Switcher (Attio-Style) */}
      <div className="p-3 sm:p-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Interactive Tenant Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-left shadow-sm group"
          >
            <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white transition">
              <Building2 className="w-3 h-3" />
            </div>
            <div>
              <div className="font-bold text-zinc-100 flex items-center gap-1.5 leading-none">
                {currentTenant.name}
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-[10px] text-zinc-400 font-mono tracking-tight">{currentTenant.subdomain}</span>
            </div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-[#141416] border border-white/10 shadow-2xl z-30 p-1.5 space-y-1 backdrop-blur-2xl"
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Switch Active Institutional Tenant
                </div>
                {Object.entries(TENANTS).map(([key, tenant]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedTenantKey(key);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                      selectedTenantKey === key 
                        ? 'bg-white/10 text-white font-semibold' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{tenant.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{tenant.subdomain}</div>
                    </div>
                    {selectedTenantKey === key && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-300" />
                    )}
                  </button>
                ))}
                <div className="pt-1 border-t border-white/5 px-2 py-1 text-[10px] text-zinc-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-zinc-400" />
                  Selecting changes RLS context in real-time
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Isolation & RLS Security Indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400">
            <Database className="w-3 h-3 text-zinc-400" />
            <span className="font-mono text-[10px] text-zinc-300">{currentTenant.dbPool}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-bold text-zinc-200">
            {currentTenant.badge}
          </span>
        </div>

      </div>

      {/* 2. Filter & Context Ribbon */}
      <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-zinc-400" />
          <span>Active RLS Barrier:</span>
          <span className="text-zinc-200 font-semibold bg-white/5 px-1.5 py-0.5 rounded">
            SET app.tenant_id = '{currentTenant.id}'
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-zinc-500">
          <span>PostgreSQL Table: public.student_ledgers</span>
          <span>•</span>
          <span className="text-zinc-400">Leakage: 0.00% Verified</span>
        </div>
      </div>

      {/* 3. Attio-Style Live Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase font-semibold text-zinc-400 bg-white/[0.01]">
              <th className="py-2.5 px-4">Student & ID</th>
              <th className="py-2.5 px-4">Degree Program</th>
              <th className="py-2.5 px-4">Ledger Balance</th>
              <th className="py-2.5 px-4">RLS Signature</th>
              <th className="py-2.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody 
              key={currentTenant.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="divide-y divide-white/[0.03]"
            >
              {currentTenant.records.map((student) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={() => setHoveredRowId(student.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  className={`transition-colors duration-150 cursor-pointer ${
                    hoveredRowId === student.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Student Name & Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${student.avatarBg} font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-sm border border-white/10`}>
                        {student.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                          {student.name}
                          {hoveredRowId === student.id && (
                            <span className="text-[10px] text-zinc-500 font-mono">#{student.id}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">{student.rollNo}</div>
                      </div>
                    </div>
                  </td>

                  {/* Degree Program */}
                  <td className="py-3 px-4 text-zinc-300 font-medium">
                    {student.program}
                  </td>

                  {/* Ledger Balance */}
                  <td className="py-3 px-4 font-mono text-zinc-200 font-semibold">
                    {student.ledgerBalance}
                  </td>

                  {/* RLS Signature */}
                  <td className="py-3 px-4 font-mono text-[10px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5">
                      {student.rlsSignature}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        student.status === 'PAID'
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          : student.status === 'PENDING'
                          ? 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          : 'bg-white/[0.06] text-zinc-200 border border-white/10'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* 4. Bottom Footer Isolation Proof */}
      <div className="p-3 bg-white/[0.015] border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>PostgreSQL Isolation: 100% Guaranteed</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Query: SELECT * FROM student_ledgers;</span>
          <span className="text-zinc-300 font-bold">↳ Returns {currentTenant.records.length} isolated rows</span>
        </div>
      </div>

    </div>
  );
};

export default DashboardMockup;
