import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Cpu, 
  Copy, 
  Monitor, 
  Scan, 
  Eye, 
  Activity, 
  Terminal 
} from 'lucide-react';

export const ProctoringWidget: React.FC = () => {
  const [isLockdown, setIsLockdown] = useState<boolean>(true);
  const [cpuLoad, setCpuLoad] = useState<number>(18.4);

  const toggleLockdown = () => {
    setIsLockdown((prev) => !prev);
    setCpuLoad(isLockdown ? 42.1 : 18.4);
  };

  return (
    <div
      className={`relative w-full rounded-2xl transition-all duration-500 overflow-hidden font-mono text-xs ${
        isLockdown
          ? 'bg-[#0E0B0B]/95 border border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]'
          : 'bg-[#0E0E10]/95 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
      }`}
    >
      {/* Background ambient red glow pulse when locked */}
      {isLockdown && (
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isLockdown ? 'bg-red-500 animate-ping' : 'bg-zinc-500'}`} />
            <span className={`text-[11px] font-bold tracking-tight uppercase ${isLockdown ? 'text-red-400' : 'text-zinc-400'}`}>
              {isLockdown ? 'OS KIOSK RESTRICTED' : 'STANDBY MODE'}
            </span>
          </div>
          <span className="text-zinc-600 text-[10px]">|</span>
          <span className="text-zinc-400 text-[10px] hidden sm:inline">SEB_Kiosk_Process.sys [LOCKED]</span>
        </div>

        {/* Interactive Toggle Switch */}
        <div className="flex items-center gap-3">
          <label 
            htmlFor="lockdown-toggle" 
            className="text-[11px] font-sans font-semibold text-zinc-300 cursor-pointer select-none flex items-center gap-1.5"
          >
            <span>Simulate Exam Lockdown</span>
          </label>
          <button
            id="lockdown-toggle"
            type="button"
            role="switch"
            aria-checked={isLockdown}
            onClick={toggleLockdown}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isLockdown ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-zinc-800'
            }`}
          >
            <span className="sr-only">Simulate Exam Lockdown</span>
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 ${
                isLockdown ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Status Warning Banner */}
      <AnimatePresence>
        {isLockdown ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-950/40 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-red-300"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-semibold tracking-wide">
                KERNEL LOCKDOWN ACTIVE • ALL PERIPHERAL EXPLOIT VECTORS SUPPRESSED
              </span>
            </div>
            <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-900/40 border border-red-500/30">
              STATUS: LOCKED
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-900/40 border-b border-white/5 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span>Diagnostic client listening on port 8089. Click toggle to simulate lockdown.</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
              STANDBY
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Biometric Live Feed + Telemetry Sensors */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Biometric Face Scan Viewport (md:col-span-5) */}
        <div className="md:col-span-5 rounded-xl bg-black/60 border border-white/5 p-3 flex flex-col justify-between relative overflow-hidden">
          
          {/* Viewport Top Bar */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-2 border-b border-white/5 z-10">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Scan className="w-3.5 h-3.5 text-zinc-400" />
              Biometric Feed [24 FPS]
            </span>
            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${isLockdown ? 'text-red-300 bg-red-950/60' : 'text-zinc-400 bg-white/5'}`}>
              REC • 1080P
            </span>
          </div>

          {/* Simulated Biometric Face Mesh HUD */}
          <div className="relative h-44 my-2 rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden border border-white/5">
            {/* Grid Reticle Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Target Reticle Brackets */}
            <div className="absolute inset-4 border border-dashed border-white/10 rounded-md pointer-events-none flex items-center justify-center">
              <div className={`w-28 h-36 rounded-full border-2 transition-colors duration-300 relative flex items-center justify-center ${
                isLockdown ? 'border-red-500/60' : 'border-zinc-700'
              }`}>
                {/* Crosshairs */}
                <div className="w-2 h-2 rounded-full bg-zinc-400/80" />
                <div className="absolute top-2 w-16 border-t border-dashed border-white/20" />
                <div className="absolute bottom-6 w-12 border-t border-dashed border-white/20" />
              </div>
            </div>

            {/* Vertical Scanning Laser Line */}
            {isLockdown && (
              <motion.div
                animate={{ y: [-70, 70, -70] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-full h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10 pointer-events-none"
              />
            )}

            {/* Telemetry Corner Badges */}
            <div className="absolute bottom-2 left-2 text-[9px] text-zinc-400 font-mono space-y-0.5 bg-black/80 px-2 py-1 rounded border border-white/5">
              <div>Gaze: 99.4% On-Screen</div>
              <div>Face Landmarks: 468/468</div>
            </div>
            <div className="absolute top-2 right-2 text-[9px] font-mono">
              <span className={`px-1.5 py-0.5 rounded ${isLockdown ? 'text-red-300 bg-red-900/60' : 'text-zinc-400 bg-white/5'}`}>
                {isLockdown ? 'LOCKED' : 'CALIBRATING'}
              </span>
            </div>
          </div>

          {/* Viewport Bottom Readout */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-zinc-400" />
              Candidate: Julian Thorne (Finals)
            </span>
            <span className="text-zinc-300 font-bold">Verified</span>
          </div>

        </div>

        {/* Right: Hardware Telemetry Sensors (md:col-span-7) */}
        <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
          
          {/* 1. CPU Guardrail Sensor */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                Process Execution Guard
              </span>
              <span className={`font-bold ${isLockdown ? 'text-red-400' : 'text-zinc-300'}`}>
                CPU {cpuLoad}% • {isLockdown ? 'RESTRICTED' : 'NORMAL'}
              </span>
            </div>
            <div className="text-[10px] text-zinc-500">
              {isLockdown 
                ? 'Unauthorized non-SEB sub-processes (Discord, Chrome, Slack) terminated via SIGKILL.'
                : 'Process watcher armed. SEB sandbox ready to isolate target processes.'
              }
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isLockdown ? 'bg-red-500 w-[22%]' : 'bg-zinc-500 w-[42%]'
                }`} 
              />
            </div>
          </div>

          {/* 2. Clipboard Vector Isolation */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                OS System Clipboard Buffer
              </div>
              <div className="text-[10px] text-zinc-500">
                {isLockdown ? 'Memory mapped buffer purged (0x00). Keyloggers sanitized.' : 'System clipboard monitoring standby.'}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider ${
                isLockdown
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-white/5 text-zinc-400 border border-white/10'
              }`}
            >
              {isLockdown ? 'BLOCKED' : 'ACTIVE'}
            </span>
          </div>

          {/* 3. Multi-Monitor / Secondary Display Interception */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                Secondary Display Detection
              </div>
              <div className="text-[10px] text-zinc-500">
                {isLockdown ? 'HDMI/DisplayPort handshake severed. 0 extra monitors allowed.' : 'Detecting active display outputs.'}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider ${
                isLockdown
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-white/5 text-zinc-400 border border-white/10'
              }`}
            >
              {isLockdown ? 'DISABLED' : '1 DISPLAY'}
            </span>
          </div>

          {/* 4. VM Hypervisor Shield */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                Bare-Metal Hypervisor Inspection
              </div>
              <div className="text-[10px] text-zinc-500">
                {isLockdown ? 'Zero Hypervisor Detected. VirtualBox, VMware, KVM blocked.' : 'Virtual machine check ready.'}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider ${
                isLockdown
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-white/5 text-zinc-400 border border-white/10'
              }`}
            >
              {isLockdown ? 'LOCKED' : 'PASSED'}
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Footer Telemetry */}
      <div className="px-4 py-2.5 bg-white/[0.015] border-t border-white/5 flex flex-wrap items-center justify-between text-[10px] text-zinc-500 font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLockdown ? 'bg-red-400' : 'bg-zinc-400'}`} />
          <span>ConfigKey Hash: sha256:9f83ac027b4011e403d91782e4f014e6e0d9b62f</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Proctor Heartbeat: 14ms</span>
          <span className="text-zinc-300 font-bold">100% EXAM INTEGRITY</span>
        </div>
      </div>

    </div>
  );
};

export default ProctoringWidget;
