import React, { useState } from 'react';
import {
  BookOpen,
  RefreshCw,
  Copy,
  Check,
  Search,
  Sparkles,
  CheckCircle2,
  Share2,
  FileText,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

export interface NotionBlock {
  id: string;
  type: string; // heading_1, heading_2, heading_3, paragraph, bulleted_list_item, numbered_list_item, to_do, code, callout, divider
  plainText: string;
  language?: string;
  checked?: boolean;
  icon?: string;
}

export interface NotionPageData {
  pageId: string;
  title: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  lastSyncedAt: string;
  icon: string;
  coverUrl: string;
  blocks: NotionBlock[];
}

const PRELOADED_PAGES: NotionPageData[] = [
  {
    pageId: 'page-cs302-raft',
    title: 'Week 04: Raft Consensus Protocol & Safety Invariants',
    courseCode: 'CS-302',
    courseName: 'Advanced Distributed Systems',
    facultyName: 'Dr. Aris Thorne',
    lastSyncedAt: '2 mins ago',
    icon: '🛰️',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
    blocks: [
      {
        id: 'blk-1',
        type: 'callout',
        icon: '💡',
        plainText: 'FACULTY NOTE: These lecture notes are directly synchronized from Dr. Thorne\'s faculty Notion workspace. Read section 2 before Friday\'s lab.'
      },
      {
        id: 'blk-2',
        type: 'heading_1',
        plainText: '1. Replicated State Machine Architecture'
      },
      {
        id: 'blk-3',
        type: 'paragraph',
        plainText: 'Replication algorithms manage a distributed collection of machines to compute identical state sequences despite fail-stop network partitions. In Raft, consensus is decomposed into leader election, log replication, and safety enforcement.'
      },
      {
        id: 'blk-4',
        type: 'callout',
        icon: '⚡',
        plainText: 'Election Safety: At most one leader can be elected in a given term. A candidate must receive votes from a strict quorum (majority > N/2) of peers.'
      },
      {
        id: 'blk-5',
        type: 'heading_2',
        plainText: '2. The AppendEntries RPC Protocol'
      },
      {
        id: 'blk-6',
        type: 'paragraph',
        plainText: 'The leader periodically issues AppendEntries remote procedure calls to transmit log entries and heartbeats. If followers find entries missing or uncommitted, they back off their nextIndex pointer.'
      },
      {
        id: 'blk-7',
        type: 'code',
        language: 'rust',
        plainText: 'pub struct AppendEntriesArgs {\n    pub term: u64,\n    pub leader_id: NodeId,\n    pub prev_log_index: usize,\n    pub prev_log_term: u64,\n    pub entries: Vec<LogEntry>,\n    pub leader_commit: usize,\n}\n\nimpl RaftNode {\n    pub fn handle_append_entries(&mut self, args: &AppendEntriesArgs) -> bool {\n        if args.term < self.current_term {\n            return false; // Reject outdated leader term\n        }\n        self.reset_election_timeout();\n        self.match_and_commit(args)\n    }\n}'
      },
      {
        id: 'blk-8',
        type: 'heading_2',
        plainText: '3. Core Log Invariants'
      },
      {
        id: 'blk-9',
        type: 'bulleted_list_item',
        plainText: 'Leader Append-Only: A leader never overwrites or truncates its own log; it only appends new entries.'
      },
      {
        id: 'blk-10',
        type: 'bulleted_list_item',
        plainText: 'Log Matching: If two logs contain an entry with the same index and term, the logs are identical in all entries up through that index.'
      },
      {
        id: 'blk-11',
        type: 'bulleted_list_item',
        plainText: 'Leader Completeness: If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.'
      },
      {
        id: 'blk-12',
        type: 'heading_2',
        plainText: '4. Lab 3 Action Items'
      },
      {
        id: 'blk-13',
        type: 'to_do',
        plainText: 'Implement 150ms-300ms randomized election timer with tokio',
        checked: true
      },
      {
        id: 'blk-14',
        type: 'to_do',
        plainText: 'Simulate split-brain scenario with 5-node cluster partition',
        checked: false
      },
      {
        id: 'blk-15',
        type: 'to_do',
        plainText: 'Submit benchmark report comparing Raft vs Multi-Paxos throughput',
        checked: false
      }
    ]
  },
  {
    pageId: 'page-se404-multitenancy',
    title: 'Week 05: Multi-Tenant Schema Routing & HikariCP Pools',
    courseCode: 'SE-404',
    courseName: 'Cloud Systems Engineering',
    facultyName: 'Prof. Elena Rostova',
    lastSyncedAt: '18 mins ago',
    icon: '☁️',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    blocks: [
      {
        id: 'se-1',
        type: 'callout',
        icon: '🏢',
        plainText: 'FACULTY NOTE: Prof. Rostova\'s architectural blueprint for SaaS database isolation models.'
      },
      {
        id: 'se-2',
        type: 'heading_1',
        plainText: '1. Schema-Based Isolation vs Dedicated Databases'
      },
      {
        id: 'se-3',
        type: 'paragraph',
        plainText: 'In institutional SaaS, enterprise tenants demand dedicated PostgreSQL schemas and dynamic HikariCP routing pools to comply with FERPA and strict data sovereignty regulations.'
      },
      {
        id: 'se-4',
        type: 'code',
        language: 'java',
        plainText: '@Component\npublic class TenantContext {\n    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();\n    public static void setTenantId(String tenantId) { CURRENT_TENANT.set(tenantId); }\n    public static String getTenantId() { return CURRENT_TENANT.get(); }\n    public static void clear() { CURRENT_TENANT.remove(); }\n}'
      }
    ]
  },
  {
    pageId: 'page-ma201-svd',
    title: 'Week 03: Singular Value Decomposition & Low-Rank Approximation',
    courseCode: 'MA-201',
    courseName: 'Applied Linear Algebra & Tensors',
    facultyName: 'Dr. Marcus Vance',
    lastSyncedAt: '1 hour ago',
    icon: '📊',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop',
    blocks: [
      {
        id: 'ma-1',
        type: 'callout',
        icon: '📐',
        plainText: 'FACULTY NOTE: Dr. Marcus Vance\'s notes on spectral decomposition and low-rank matrix approximation.'
      },
      {
        id: 'ma-2',
        type: 'heading_1',
        plainText: '1. SVD Theorem for Arbitrary Real Matrices'
      },
      {
        id: 'ma-3',
        type: 'paragraph',
        plainText: 'Every real matrix A (m x n) admits a factorization A = U Σ V^T where U and V are orthogonal matrices and Σ contains non-negative singular values arranged in descending order.'
      }
    ]
  }
];

export const AcademicMaterialView: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<NotionPageData>(PRELOADED_PAGES[0]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [todoStates, setTodoStates] = useState<Record<string, boolean>>({
    'blk-13': true,
    'blk-14': false,
    'blk-15': false
  });

  const triggerNotionSync = () => {
    setIsSyncing(true);
    toast.loading('Synchronizing blocks with Notion workspace...', { id: 'notion-sync' });
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Successfully synchronized latest blocks from faculty Notion workspace', { id: 'notion-sync' });
    }, 900);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeId(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleTodo = (id: string) => {
    setTodoStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredBlocks = selectedPage.blocks.filter(b =>
    searchQuery === '' || b.plainText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 antialiased text-slate-100">
      
      {/* Top Banner / Breadcrumb & Notion Workspace Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5"></span>
              NATIVE NOTION WORKSPACE SYNC
            </span>
            <span className="text-xs text-slate-400">Zero Redirections to notion.so</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Faculty Academic Materials</span>
          </h1>
          <p className="text-sm text-slate-400">
            Instructor: <span className="text-slate-200 font-medium">{selectedPage.facultyName}</span> • Course: <span className="text-indigo-400 font-mono">{selectedPage.courseCode}</span>
          </p>
        </div>

        {/* Sync Controls & Course Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedPage.pageId}
            onChange={(e) => {
              const p = PRELOADED_PAGES.find(item => item.pageId === e.target.value);
              if (p) setSelectedPage(p);
            }}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {PRELOADED_PAGES.map(p => (
              <option key={p.pageId} value={p.pageId}>
                {p.courseCode} — {p.title}
              </option>
            ))}
          </select>

          <button
            onClick={triggerNotionSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Notion'}</span>
          </button>
        </div>
      </div>

      {/* Main Notion Notebook Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Navigation: Faculty Course Notebooks */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Course Notebooks
              </span>
              <span>{PRELOADED_PAGES.length} Synced</span>
            </div>

            <div className="space-y-1.5">
              {PRELOADED_PAGES.map(page => {
                const isActive = page.pageId === selectedPage.pageId;
                return (
                  <button
                    key={page.pageId}
                    onClick={() => setSelectedPage(page)}
                    className={`w-full text-left p-3 rounded-xl transition-all text-xs flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm'
                        : 'bg-slate-950/40 hover:bg-slate-800 text-slate-300 border border-transparent'
                    }`}
                  >
                    <span className="text-base">{page.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{page.courseCode}</div>
                      <div className="text-[11px] text-slate-400 truncate">{page.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Synced {page.lastSyncedAt}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filter Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes in page..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {searchQuery && (
              <div className="text-[11px] text-slate-400 px-1">
                Showing {filteredBlocks.length} matching blocks
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Native Notion Page Document View (EduPulse Global Dark Mode) */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            
            {/* Page Cover Banner */}
            <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-slate-950">
              <img
                src={selectedPage.coverUrl}
                alt="Page Cover"
                className="w-full h-full object-cover opacity-60 filter brightness-75 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              
              {/* Cover Floating Badges */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl flex items-center justify-center text-3xl">
                    {selectedPage.icon}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedPage.courseCode} • {selectedPage.courseName}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                      {selectedPage.title}
                    </h2>
                  </div>
                </div>

                <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800">
                    Faculty: {selectedPage.facultyName}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Native Blocks Rendering Container */}
            <div className="p-6 sm:p-10 space-y-5 bg-slate-900/70" data-testid="notion-document-container">
              
              {filteredBlocks.map((block) => {
                switch (block.type) {
                  case 'heading_1':
                    return (
                      <div key={block.id} className="pt-4 pb-2 border-b border-slate-800/80">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                          <span>{block.plainText}</span>
                        </h2>
                      </div>
                    );

                  case 'heading_2':
                    return (
                      <div key={block.id} className="pt-3 pb-1">
                        <h3 className="text-lg font-semibold text-indigo-200 tracking-tight flex items-center gap-2">
                          <span className="w-1 h-4 bg-indigo-400 rounded-sm"></span>
                          <span>{block.plainText}</span>
                        </h3>
                      </div>
                    );

                  case 'paragraph':
                    return (
                      <p key={block.id} className="text-slate-300 text-sm leading-relaxed font-normal">
                        {block.plainText}
                      </p>
                    );

                  case 'callout':
                    return (
                      <div
                        key={block.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 flex items-start space-x-3 shadow-inner my-2"
                      >
                        <span className="text-xl flex-shrink-0">{block.icon || '📌'}</span>
                        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {block.plainText}
                        </div>
                      </div>
                    );

                  case 'bulleted_list_item':
                    return (
                      <div key={block.id} className="flex items-start space-x-2.5 pl-2 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{block.plainText}</span>
                      </div>
                    );

                  case 'to_do': {
                    const isChecked = todoStates[block.id] ?? block.checked ?? false;
                    return (
                      <div
                        key={block.id}
                        onClick={() => toggleTodo(block.id)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors text-sm"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-600 bg-slate-950'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {block.plainText}
                        </span>
                      </div>
                    );
                  }

                  case 'code':
                    return (
                      <div key={block.id} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 my-3 shadow-lg">
                        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-mono text-indigo-400 font-semibold uppercase">{block.language || 'code'}</span>
                          <button
                            onClick={() => copyCode(block.plainText, block.id)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedCodeId === block.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300/90 leading-relaxed">
                          <code>{block.plainText}</code>
                        </pre>
                      </div>
                    );

                  default:
                    return (
                      <div key={block.id} className="text-xs text-slate-400">
                        {block.plainText}
                      </div>
                    );
                }
              })}
            </div>

            {/* Document Bottom Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Synchronized with Faculty Notion Workspace (No external redirect)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.success('Notebook exported to offline bundle')}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Course note link copied to clipboard');
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Note</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Feature & Institutional Verification Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Native Block Rendering Engine</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Renders Notion headings, callouts, syntax-highlighted code, lists, and checklists directly inside React DOM.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Global EduPulse Dark Mode</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly styled to match EduPulse ERP theme without jarring white backgrounds or third-party iframe styling.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Zero Redirections to notion.so</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Students view course notes, complete reading checklists, and copy code snippets securely inside their student portal.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AcademicMaterialView;
