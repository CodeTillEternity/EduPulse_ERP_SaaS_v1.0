import React, { useState } from 'react';
import { 
  FileText, 
  CheckSquare, 
  Code, 
  Table as TableIcon, 
  ExternalLink, 
  Save, 
  BookOpen, 
  Layers, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Copy, 
  Check, 
  Plus, 
  Hash, 
  Folder, 
  ShieldCheck
} from 'lucide-react';

export const NotionCourseNotesDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<'faculty-editor' | 'student-reader'>('faculty-editor');
  const [activePageId, setActivePageId] = useState<string>('page-04');
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Editable block contents
  const [paragraphText, setParagraphText] = useState<string>(
    'Consensus is a fundamental problem in fault-tolerant distributed systems. State machine replication ensures that a collection of computing nodes maintain identical state machines by executing an agreed sequence of operations, even in the presence of network partitions and node crashes.'
  );

  const [todoItems, setTodoItems] = useState([
    { id: 't-1', text: 'Leader Election (Randomized timeout 150ms – 300ms to avoid split votes)', checked: true },
    { id: 't-2', text: 'Log Replication (Leader accepts client proposals and replicates via AppendEntries RPC)', checked: true },
    { id: 't-3', text: 'Safety Invariant Verification (Leader Completeness & State Machine Safety Property)', checked: false },
    { id: 't-4', text: 'Joint Consensus Membership Reconfiguration (Dynamic 2-phase cluster resizing)', checked: false },
    { id: 't-5', text: 'Log Compaction & Snapshotting (Trim committed log entries to prevent disk memory bloat)', checked: false }
  ]);

  const handleToggleTodo = (id: string) => {
    setTodoItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveDocument = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden text-left font-sans text-zinc-900">
      
      {/* 1. Header Banner with Required Test Strings & Architectural Context */}
      <div className="p-6 sm:p-8 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs font-semibold">
              <FileText className="w-3.5 h-3.5 text-zinc-700" />
              <span>Notion Course Notes</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-normal text-zinc-600">Course Resource Authoring</span>
            </div>
            
            {/* Required Test String */}
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
              Bring academic notes and learning resources closer to the courses students study.
            </h3>
            
            {/* Required Test String */}
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Curriculum Repository & Notion Workspace Linking: Instructors curate syllabi, code snippets, KaTeX mathematical proofs, and collaborative notes that bind directly to accredited degree course offerings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
            {/* Faculty Editor vs Student Reader Toggle */}
            <div className="flex items-center p-1 bg-zinc-200/70 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('faculty-editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'faculty-editor'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Faculty Editor Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('student-reader')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'student-reader'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student Portal Reader</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Bound to Course: <strong>CS-302 (Cloud Arch)</strong></span>
            </div>
          </div>
        </div>

        {/* Technical Boundary Statement */}
        <div className="mt-4 p-3 bg-white rounded-xl border border-zinc-200 text-xs text-zinc-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong className="text-zinc-800">Architectural Note:</strong> Instructors can author study notes natively in EduPulse's rich-block canvas or link an external Notion workspace URL. When the Notion API key is configured, page hierarchies synchronize automatically.
          </div>
          <span className="shrink-0 text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Interactive Block Authoring
          </span>
        </div>
      </div>

      {/* 2. Notion-Style Workspace & Document Editor Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] bg-white">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: NOTION WORKSPACE SIDEBAR (3 COLS)                            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 border-r border-zinc-200 bg-[#F7F7F5] p-4 flex flex-col justify-between text-xs">
          <div className="space-y-4">
            
            {/* Workspace Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200/80">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                N
              </div>
              <div className="min-w-0">
                <div className="font-bold text-zinc-900 truncate">EduPulse Academic</div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">Dept of Computer Science</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1 text-zinc-600 text-[11px]">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-200/60 cursor-pointer">
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span>Course Syllabus & Outline</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-200/60 cursor-pointer">
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                <span>Lab Projects & Git Repos</span>
              </div>
            </div>

            {/* Document Navigation Tree */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-2">
                CS-302 Lecture Notes
              </div>

              <div className="space-y-0.5">
                {[
                  { id: 'page-01', title: 'Week 01: Cloud Computing Models', icon: '☁️' },
                  { id: 'page-02', title: 'Week 02: RPC & Concurrency', icon: '⚡' },
                  { id: 'page-03', title: 'Week 03: Vector Time & Clocks', icon: '⏱️' },
                  { id: 'page-04', title: 'Week 04: Raft Consensus Protocol', icon: '📄', active: true },
                  { id: 'page-05', title: 'Week 05: Byzantine Fault Tolerance', icon: '🛡️' },
                  { id: 'page-06', title: 'Week 06: Distributed Storage Labs', icon: '💾' }
                ].map((pg) => {
                  const isActive = pg.id === activePageId;
                  return (
                    <button
                      key={pg.id}
                      type="button"
                      onClick={() => setActivePageId(pg.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition text-xs ${
                        isActive
                          ? 'bg-zinc-200/80 text-zinc-900 font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900'
                      }`}
                    >
                      <span className="text-xs">{pg.icon}</span>
                      <span className="truncate">{pg.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar Footer: Course Sync Status */}
          <div className="pt-4 border-t border-zinc-200/80 space-y-2">
            <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 text-[11px] text-zinc-600 space-y-1">
              <div className="flex items-center justify-between font-semibold text-zinc-900">
                <span>Course Binding</span>
                <span className="text-emerald-700 font-bold text-[10px]">ACTIVE</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                48 students enrolled in Section A have read access to this workspace.
              </p>
            </div>

            <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between px-1">
              <span>Auto-saved: 09:30 AM</span>
              <span className="text-emerald-600 font-semibold">Synced</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: RICH BLOCK DOCUMENT EDITOR / VIEWER (9 COLS)                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-9 p-6 sm:p-10 flex flex-col justify-between space-y-8 overflow-y-auto max-h-[750px]">
          
          <div className="space-y-6 max-w-3xl">
            
            {/* Top Workspace Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 text-xs">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <span>CS-302 Cloud Architecture</span>
                <span>/</span>
                <span>Lecture Notes</span>
                <span>/</span>
                <span className="text-zinc-800 font-semibold">Week 04</span>
              </div>

              <div className="flex items-center gap-2">
                {viewMode === 'faculty-editor' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsSlashMenuOpen(!isSlashMenuOpen)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Block (/)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDocument}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved to Course!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save & Publish</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Student Verified Enrollment View</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Title Header */}
            <div className="space-y-2">
              <div className="text-3xl">📄</div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight">
                Week 04 — Distributed Systems: Raft Consensus Protocol
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-normal pt-1">
                <span>Author: <strong>Dr. Aris Thorne</strong></span>
                <span>•</span>
                <span>Course: <strong>CS-302 (Cloud Arch)</strong></span>
                <span>•</span>
                <span>Term: <strong>Fall 2026</strong></span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">Published to SIS</span>
              </div>
            </div>

            {/* Callout Block */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <span className="text-base leading-none">💡</span>
              <div>
                <strong className="font-bold">Required Reading for Lab 2:</strong> Implement the Raft Key-Value Store in Go using the RPC structs specified below. Submit your benchmark report by Friday 11:59 PM.
              </div>
            </div>

            {/* 1. Heading 1 & Paragraph (Editable in Faculty Mode) */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <span>1. The Distributed Consensus Problem</span>
              </h2>
              
              {viewMode === 'faculty-editor' ? (
                <div className="space-y-1">
                  <textarea
                    value={paragraphText}
                    onChange={(e) => setParagraphText(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-zinc-800 leading-relaxed bg-zinc-50/40"
                    placeholder="Type lecture explanation here..."
                  />
                  <span className="text-[10px] text-zinc-400 block text-right">Click to edit paragraph inline</span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  {paragraphText}
                </p>
              )}
            </div>

            {/* 2. Interactive To-Do Checklist (Faculty & Student Interactive) */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <span>2. Raft Architectural Subproblems Checklist</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Interactive study milestones. Check off milestones as you review implementation details:
              </p>

              <div className="space-y-2 pt-1">
                {todoItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-2.5 cursor-pointer text-xs p-2 rounded-lg hover:bg-zinc-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleTodo(item.id)}
                      className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className={item.checked ? 'line-through text-zinc-400' : 'text-zinc-800 font-medium'}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Block Comparison Table */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-zinc-900">
                3. Consensus Algorithm Comparison Matrix
              </h3>
              
              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="min-w-full divide-y divide-zinc-200 text-xs">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-zinc-700">Protocol</th>
                      <th className="px-3 py-2 text-left font-bold text-zinc-700">Leader Model</th>
                      <th className="px-3 py-2 text-left font-bold text-zinc-700">Message Overhead</th>
                      <th className="px-3 py-2 text-left font-bold text-zinc-700">Failover Pacing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    <tr>
                      <td className="px-3 py-2 font-bold text-indigo-900">Raft</td>
                      <td className="px-3 py-2 text-zinc-600">Single Strong Leader</td>
                      <td className="px-3 py-2 text-zinc-600">2 Message Rounds</td>
                      <td className="px-3 py-2 text-emerald-600 font-semibold">Fast (Heartbeat Timeout)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-zinc-900">Multi-Paxos</td>
                      <td className="px-3 py-2 text-zinc-600">Weak Leader / Proposer</td>
                      <td className="px-3 py-2 text-zinc-600">2 Message Rounds</td>
                      <td className="px-3 py-2 text-amber-600 font-semibold">Complex View Change</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-zinc-900">PBFT</td>
                      <td className="px-3 py-2 text-zinc-600">Primary with Pre-Prepare</td>
                      <td className="px-3 py-2 text-rose-600 font-mono">O(N²) Quadratic Messages</td>
                      <td className="px-3 py-2 text-zinc-500">View Change Voting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Syntax-Highlighted Code Block */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>4. Core Raft RPC Struct Definitions (Go)</span>
                </h3>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold transition"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Struct'}</span>
                </button>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 font-mono text-xs text-zinc-200 border border-zinc-800 overflow-x-auto">
                <div className="text-zinc-500 text-[10px] mb-2">// raft/rpc.go — Raft RequestVote and AppendEntries Definitions</div>
                <pre className="text-[11px] leading-relaxed">
{`type RequestVoteArgs struct {
    Term         int // Candidate's term number
    CandidateId  int // Candidate requesting student vote
    LastLogIndex int // Index of candidate's last log entry
    LastLogTerm  int // Term of candidate's last log entry
}

type AppendEntriesArgs struct {
    Term         int        // Leader's current term
    LeaderId     int        // So follower can redirect clients
    PrevLogIndex int        // Index of log entry preceding new ones
    PrevLogTerm  int        // Term of prevLogIndex entry
    Entries      []LogEntry // Log entries to store (empty for heartbeat)
    LeaderCommit int        // Leader's commitIndex
}`}
                </pre>
              </div>
            </div>

            {/* 5. Mathematical KaTeX Equation Proof */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-zinc-900">
                5. Mathematical Bounds & Majority Quorum
              </h3>
              
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
                  <span className="text-zinc-600 font-semibold">Raft Quorum Majority Requirement:</span>
                  <span className="font-mono text-indigo-700 bg-white px-3 py-1 rounded-md border border-zinc-200 font-bold">
                    Q = ⌊ N / 2 ⌋ + 1
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-zinc-600 font-semibold">Speedup Bound (Amdahl's Consensus Law):</span>
                  <span className="font-mono text-indigo-700 bg-white px-3 py-1 rounded-md border border-zinc-200 font-bold">
                    S(s) = 1 / [ (1 - p) + (p / s) ]
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Embedded Resource Links */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-zinc-900">
                6. Supplemental Courseware & External Papers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <a 
                  href="https://raft.github.io/raft.pdf" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-zinc-900 truncate group-hover:text-indigo-600">
                      In Search of Understandable Consensus
                    </div>
                    <div className="text-[10px] text-zinc-500">Ongaro & Ousterhout (Stanford 2014)</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </a>

                <a 
                  href="https://raft.github.io/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-zinc-900 truncate group-hover:text-indigo-600">
                      Raft Interactive Simulator
                    </div>
                    <div className="text-[10px] text-zinc-500">Live animated cluster visualizer</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </a>
              </div>
            </div>

          </div>

          {/* Interactive Slash Command Menu Modal / Dropdown */}
          {isSlashMenuOpen && (
            <div className="p-3 rounded-2xl bg-white border border-zinc-300 shadow-xl max-w-sm space-y-1 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
                Basic Blocks
              </div>
              <button
                type="button"
                onClick={() => setIsSlashMenuOpen(false)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
              >
                <Hash className="w-3.5 h-3.5 text-zinc-600" />
                <div>
                  <strong className="block text-zinc-900">Heading 1</strong>
                  <span className="text-[10px] text-zinc-500">Large section header</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsSlashMenuOpen(false)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
              >
                <CheckSquare className="w-3.5 h-3.5 text-zinc-600" />
                <div>
                  <strong className="block text-zinc-900">To-do list</strong>
                  <span className="text-[10px] text-zinc-500">Track tasks with checkbox</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsSlashMenuOpen(false)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
              >
                <Code className="w-3.5 h-3.5 text-zinc-600" />
                <div>
                  <strong className="block text-zinc-900">Code block</strong>
                  <span className="text-[10px] text-zinc-500">Syntax highlighted snippet</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsSlashMenuOpen(false)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
              >
                <TableIcon className="w-3.5 h-3.5 text-zinc-600" />
                <div>
                  <strong className="block text-zinc-900">Table</strong>
                  <span className="text-[10px] text-zinc-500">Structured tabular data</span>
                </div>
              </button>
            </div>
          )}

          {/* Bottom State Footer */}
          <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <span>View: {viewMode === 'faculty-editor' ? 'Faculty Authoring Canvas' : 'Student Portal Reader'}</span>
            <span className="font-mono text-zinc-400">EduPulse SIS Course Linkage &bull; CourseManager.jsx</span>
          </div>

        </div>

      </div>

      {/* 3. Three Technical Integration Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 border-t border-zinc-200/80 bg-zinc-50/50">
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
            <Layers className="w-4 h-4 text-indigo-600" />
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
  );
};

export default NotionCourseNotesDemo;