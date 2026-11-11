import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  RotateCw, 
  CheckCircle2, 
  Database, 
  ShieldCheck, 
  Copy, 
  Check, 
  Code2, 
  Activity 
} from 'lucide-react';

interface ProvisionStep {
  text: string;
  type: 'info' | 'db' | 'security' | 'success' | 'highlight';
  time: string;
}

const INITIAL_LOGS: ProvisionStep[] = [
  { time: '09:42:01.102', text: '> Handshake received: subdomain request "harvard.edupulse.io"', type: 'info' },
  { time: '09:42:01.320', text: '> Generating cryptographic tenant namespace: org_harvard_production', type: 'info' },
  { time: '09:42:01.780', text: '> Allocating Dedicated PostgreSQL Pool (HikariCP-vip-1)...', type: 'db' },
  { time: '09:42:02.140', text: '> Executing Flyway schema migration: V1__baseline_erp.sql (42 tables)', type: 'db' },
  { time: '09:42:02.510', text: '> Enforcing Row-Level Security: ALTER TABLE users ENABLE ROW LEVEL SECURITY;', type: 'security' },
  { time: '09:42:02.890', text: '> Initializing dynamic datasource routing key: VIP_TENANT_HARVARD', type: 'security' },
  { time: '09:42:03.220', text: '> Minting SEB cryptographic config key: sha256:9f83ac027b4011e403d9...', type: 'highlight' },
  { time: '09:42:03.580', text: '> Creating root institutional administrator: admin@harvard.edupulse.io', type: 'info' },
  { time: '09:42:03.890', text: '✔ Autonomous Provisioning Complete: 2.78s total latency [14-Day Trial LIVE]', type: 'success' },
];

const TENANT_MANIFEST = {
  tenantId: "harvard",
  subdomain: "harvard.edupulse.io",
  infrastructure: {
    poolType: "DEDICATED_HIKARICP",
    routingKey: "vip-harvard-primary",
    maxPoolSize: 20,
    minIdle: 5
  },
  security: {
    rowLevelSecurity: "STRICT_ENFORCED",
    sebLockdown: true,
    sebConfigHash: "sha256:9f83ac027b4011e403d91782e4f014e6e0d9b62f",
    disasterRecovery: "S3_CONTINUOUS_STREAM"
  },
  commercial: {
    tier: "ENTERPRISE",
    status: "ACTIVE",
    trialDaysRemaining: 14
  }
};

export const ProvisioningTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'manifest' | 'metrics'>('terminal');
  const [visibleStepCount, setVisibleStepCount] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Typewriter sequence logic
  useEffect(() => {
    if (!isRunning) return;

    if (visibleStepCount < INITIAL_LOGS.length) {
      const timer = setTimeout(() => {
        setVisibleStepCount((prev) => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [visibleStepCount, isRunning]);

  const handleRestart = () => {
    setVisibleStepCount(0);
    setIsRunning(true);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(TENANT_MANIFEST, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl bg-[#0E0E10]/90 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden font-mono text-xs">
      
      {/* Top macOS-style Window Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-yellow-500/80 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-green-500/80 transition-colors cursor-pointer" />
          <span className="ml-2 text-[11px] text-zinc-400 font-medium tracking-tight flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-zinc-400" />
            edupulse-cli • tenant-provision
          </span>
        </div>

        {/* Tab selection controls */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition ${
              activeTab === 'terminal' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Logs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 ${
              activeTab === 'manifest' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-2.5 h-2.5" />
            Manifest
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 ${
              activeTab === 'metrics' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-2.5 h-2.5" />
            Pool
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestart}
            title="Re-run Autonomous Provisioning"
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="p-4 sm:p-5 h-[340px] overflow-y-auto space-y-2 select-text text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence mode="wait">
          {activeTab === 'terminal' && (
            <motion.div
              key="terminal-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-1.5"
            >
              {/* Fake Prompt */}
              <div className="text-zinc-400 flex items-center gap-1.5 pb-1 border-b border-white/[0.04]">
                <span className="text-zinc-300 font-semibold">edu@control-plane:~$</span>
                <span className="text-zinc-200">edupulse tenant provision --id=harvard --tier=enterprise</span>
              </div>

              {/* Streaming Logs */}
              {INITIAL_LOGS.slice(0, visibleStepCount).map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-zinc-600 text-[10px] select-none flex-shrink-0 mt-0.5">
                    {step.time.split('.')[0]}
                  </span>

                  {step.type === 'info' && (
                    <span className="text-zinc-400">{step.text}</span>
                  )}
                  {step.type === 'db' && (
                    <span className="text-zinc-300 flex items-center gap-1">
                      <Database className="w-3 h-3 text-zinc-400 flex-shrink-0 inline" />
                      {step.text}
                    </span>
                  )}
                  {step.type === 'security' && (
                    <span className="text-zinc-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-zinc-300 flex-shrink-0 inline" />
                      {step.text}
                    </span>
                  )}
                  {step.type === 'highlight' && (
                    <span className="text-zinc-100 font-semibold bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
                      {step.text}
                    </span>
                  )}
                  {step.type === 'success' && (
                    <span className="text-white font-bold flex items-center gap-1 mt-1 bg-white/[0.06] p-1.5 rounded-lg border border-white/10">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 inline flex-shrink-0" />
                      {step.text}
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Live Blinking Cursor */}
              {isRunning && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-zinc-600 text-[10px]">executing...</span>
                  <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse" />
                </div>
              )}

              {!isRunning && visibleStepCount >= INITIAL_LOGS.length && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pt-3 flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/[0.04] mt-3"
                >
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-ping inline-block" />
                    Tenant Gateway: Ready at https://harvard.edupulse.io
                  </span>
                  <button 
                    onClick={handleRestart}
                    className="text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Replay Provisioning
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'manifest' && (
            <motion.div
              key="manifest-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-500 text-[10px]">tenant_spec_v1.json (read-only)</span>
                <button
                  type="button"
                  onClick={handleCopyManifest}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] transition"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-white" /> : <Copy className="w-2.5 h-2.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="text-zinc-300 bg-black/50 p-3 rounded-lg border border-white/5 overflow-x-auto text-[10px]">
                {JSON.stringify(TENANT_MANIFEST, null, 2)}
              </pre>
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              <div className="text-[10px] text-zinc-400">Dedicated HikariCP Cluster: Pool-vip-harvard-01</div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-zinc-500 text-[10px]">Active Pool Connections</div>
                  <div className="text-lg font-bold text-white mt-1">4 <span className="text-xs font-normal text-zinc-500">/ 20 max</span></div>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-zinc-400 h-full w-[20%]" />
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-zinc-500 text-[10px]">Query Acquisition Latency</div>
                  <div className="text-lg font-bold text-white mt-1">1.2ms</div>
                  <div className="text-[10px] text-zinc-400 mt-1">99.9th percentile</div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-zinc-500 text-[10px]">RLS Isolation State</div>
                  <div className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                    STRICT_ENFORCED
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">0 cross-tenant leaks</div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-zinc-500 text-[10px]">Disaster Recovery Stream</div>
                  <div className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                    S3 Pipeline Synced
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">RPO &lt; 5m • AES-256</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-t border-white/5 text-[10px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span>Status: 200 OK</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Region: ap-south-1</span>
          <span>Latency: 14ms</span>
        </div>
      </div>

    </div>
  );
};

export default ProvisioningTerminal;

