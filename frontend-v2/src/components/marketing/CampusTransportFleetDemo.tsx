import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Navigation, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  Pause, 
  Fuel, 
  Activity, 
  Wifi, 
  Phone, 
  Radio, 
  Compass
} from 'lucide-react';

export type TransportStepId = 'dispatch' | 'corridor' | 'manifest' | 'telemetry' | 'boarding';

interface TransportStepConfig {
  id: TransportStepId;
  label: string;
  badge: string;
  description: string;
}

interface FleetVehicle {
  id: string;
  routeNumber: string;
  routeName: string;
  plate: string;
  model: string;
  driver: {
    name: string;
    phone: string;
    license: string;
    rating: string;
    photo: string;
  };
  capacityTotal: number;
  capacityFilled: number;
  status: string;
  nextStop: string;
  nextStopEta: string;
  color: string;
  speed: string;
  fuel: string;
}

interface PassengerRecord {
  id: string;
  name: string;
  enrollment: string;
  program: string;
  stopName: string;
  seatNumber: string;
  pickupTime: string;
  photo: string;
  isBoardedInitial: boolean;
}

export const CampusTransportFleetDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState<TransportStepId>('telemetry');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('vh-04');

  const steps: TransportStepConfig[] = [
    {
      id: 'dispatch',
      label: '1. Fleet Dispatch',
      badge: 'Vehicle Registry',
      description: 'Institutional fleet vehicles inspected, driver authenticated, and route roster activated.'
    },
    {
      id: 'corridor',
      label: '2. Route Geometry',
      badge: 'Corridor & Geofence',
      description: 'Scheduled transit stops, optimal lane paths, and speed-restricted school zones mapped.'
    },
    {
      id: 'manifest',
      label: '3. Seat Manifest',
      badge: 'Passenger Roster',
      description: 'Students mapped to designated stops and fixed seats with RFID boarding credentials.'
    },
    {
      id: 'telemetry',
      label: '4. En-Route GPS Telemetry',
      badge: 'Live Operations',
      description: 'Real-time vehicle movement, speed monitoring (42 km/h), and dynamic arrival ETAs.'
    },
    {
      id: 'boarding',
      label: '5. RFID Boarding Sync',
      badge: 'Safety Reconciliation',
      description: 'Stop 3 reached: RFID scans reconcile passenger manifest and trigger guardian alerts.'
    }
  ];

  const vehicles: FleetVehicle[] = [
    {
      id: 'vh-04',
      routeNumber: 'Route 4',
      routeName: 'North Campus Express',
      plate: 'DL-01-AB-1234',
      model: 'Tata Starbus Ultra (48+2 AC)',
      driver: {
        name: 'Rajesh Kumar',
        phone: '+91 98112 45678',
        license: 'DL-1420110098234',
        rating: '4.9',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      capacityTotal: 50,
      capacityFilled: 42,
      status: 'En Route',
      nextStop: 'Metro Station Sec 62',
      nextStopEta: '4 min (09:05 AM)',
      color: '#10b981',
      speed: '42 km/h',
      fuel: '78%'
    },
    {
      id: 'vh-02',
      routeNumber: 'Route 2',
      routeName: 'South Metro Feeder',
      plate: 'DL-01-CD-5678',
      model: 'Ashok Leyland Oyster (40 Seater)',
      driver: {
        name: 'Suresh Verma',
        phone: '+91 98711 34567',
        license: 'DL-1420150034123',
        rating: '4.8',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      capacityTotal: 40,
      capacityFilled: 35,
      status: 'En Route',
      nextStop: 'Green Park Outer Ring',
      nextStopEta: '9 min (09:12 AM)',
      color: '#6366f1',
      speed: '38 km/h',
      fuel: '64%'
    },
    {
      id: 'vh-07',
      routeNumber: 'Route 7',
      routeName: 'East Tech Corridor',
      plate: 'DL-01-EF-9012',
      model: 'Eicher Skyline Pro (45 Seater)',
      driver: {
        name: 'Vikram Singh',
        phone: '+91 99100 87654',
        license: 'DL-1420180076543',
        rating: '4.9',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      },
      capacityTotal: 45,
      capacityFilled: 28,
      status: 'En Route',
      nextStop: 'Knowledge Park Gate 3',
      nextStopEta: '14 min (09:18 AM)',
      color: '#06b6d4',
      speed: '45 km/h',
      fuel: '82%'
    }
  ];

  const passengers: PassengerRecord[] = [
    {
      id: 'p-01',
      name: 'Aarav Sharma',
      enrollment: 'ENR-2026-001',
      program: 'B.Tech CSE — Sem 5',
      stopName: 'Metro Station Sec 62',
      seatNumber: '#23 (Window)',
      pickupTime: '09:05 AM',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isBoardedInitial: false
    },
    {
      id: 'p-02',
      name: 'Sophia Chen',
      enrollment: 'ENR-2026-002',
      program: 'B.Tech AI & Data — Sem 3',
      stopName: 'North Gate Sector 18',
      seatNumber: '#12 (Aisle)',
      pickupTime: '08:48 AM',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      isBoardedInitial: true
    },
    {
      id: 'p-03',
      name: 'Marcus Vance',
      enrollment: 'ENR-2026-003',
      program: 'B.Tech ECE — Sem 7',
      stopName: 'North Gate Sector 18',
      seatNumber: '#14 (Window)',
      pickupTime: '08:50 AM',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isBoardedInitial: true
    },
    {
      id: 'p-04',
      name: 'Aanya Patel',
      enrollment: 'ENR-2026-004',
      program: 'B.Sc Data Science — Sem 1',
      stopName: 'Metro Station Sec 62',
      seatNumber: '#24 (Aisle)',
      pickupTime: '09:05 AM',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isBoardedInitial: false
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

  const handleSelectStep = (stepId: TransportStepId) => {
    setActiveStep(stepId);
    setProgress(0);
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const currentStep = steps.find(s => s.id === activeStep) || steps[3];

  // Dynamic occupancy and boarding status based on active step
  const isBoardingStage = activeStep === 'boarding';
  const effectiveOccupancy = isBoardingStage ? selectedVehicle.capacityFilled + 2 : selectedVehicle.capacityFilled;
  const occupancyPercentage = Math.round((effectiveOccupancy / selectedVehicle.capacityTotal) * 100);

  // Position coordinates along Route 4 SVG path:
  // Stop 1: (60, 220) - EduPulse Main Campus
  // Stop 2: (190, 160) - North Gate Sec 18
  // Stop 3: (340, 110) - Metro Sec 62
  // Stop 4: (470, 70) - City Center Hub
  const busPosition = 
    activeStep === 'dispatch' ? { x: 75, y: 215, label: 'Origin Depot' } :
    activeStep === 'corridor' ? { x: 190, y: 160, label: 'North Gate' } :
    activeStep === 'manifest' ? { x: 250, y: 138, label: 'Approaching Sec 62' } :
    activeStep === 'telemetry' ? { x: 305, y: 120, label: '1.8 km to Sec 62' } :
    { x: 340, y: 110, label: 'Arrived: Metro Sec 62' };

  return (
    <div 
      className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden text-left font-sans text-zinc-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Header Banner with Live Operational Telemetry Stats */}
      <div className="p-6 sm:p-8 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Bus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Transport & Routes</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-normal">Real-Time Fleet Operations Center</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
              High-density fleet management with live GPS telemetry, multi-route tracking, and passenger manifest sync.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Observe institutional fleet operations in motion: route corridors, moving vehicle telemetry, scheduled stop arrival ETAs, and student RFID boarding reconciliation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
            {/* Auto Sequence Play/Pause Pill */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-2xs"
            >
              {isPlaying && !isHovered ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Auto-Playing (5s per stage)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{isHovered ? 'Paused on Hover' : 'Resume Operations'}</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>3 Vehicles Active &bull; 0 Delays</span>
            </div>
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
                    ? 'bg-white border-emerald-600 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
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
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  ) : null}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">{st.label.split('. ')[1]}</div>

                {isCurrent && (
                  <div 
                    className="absolute bottom-0 left-0 h-0.5 bg-emerald-600 transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main High-Density 3-Pane Fleet Operations Center */}
      <div className="p-4 sm:p-6 lg:p-8 bg-zinc-950 text-white">
        
        {/* Top Operational Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Samsara-Grade Telemetry Grid
            </span>
            <span className="hidden sm:inline text-zinc-500 font-mono">
              Vehicle: <strong className="text-white">{selectedVehicle.plate}</strong> ({selectedVehicle.routeNumber})
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" /> 10 Hz Telemetry
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3 h-3 text-amber-400" /> {selectedVehicle.fuel}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Activity className="w-3 h-3" /> {selectedVehicle.speed}
            </span>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: VEHICLE REGISTRY & ROUTE SELECTOR (3 COLS)                   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Active Fleet Roster ({vehicles.length})
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Live GPS</span>
            </div>

            <div className="space-y-2.5">
              {vehicles.map((v) => {
                const isSelected = v.id === selectedVehicleId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition relative ${
                      isSelected
                        ? 'bg-zinc-900/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: v.color }}
                        />
                        <span className="text-xs font-bold text-white">{v.routeNumber}</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        {v.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-zinc-300 mt-1.5 truncate">
                      {v.routeName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-2 pt-2 border-t border-zinc-800/60">
                      <span>{v.plate}</span>
                      <span className="text-zinc-300">{v.capacityFilled}/{v.capacityTotal} Seats</span>
                    </div>

                    <div className="text-[10px] text-zinc-500 mt-1 flex items-center justify-between">
                      <span className="truncate">Next: {v.nextStop.split(' ')[0]}</span>
                      <span className="text-emerald-400 font-semibold">{v.nextStopEta.split(' ')[0]} {v.nextStopEta.split(' ')[1]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Authenticated Driver Profile Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-zinc-400">Assigned Driver</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ★ {selectedVehicle.driver.rating}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img 
                  src={selectedVehicle.driver.photo} 
                  alt={selectedVehicle.driver.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{selectedVehicle.driver.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">{selectedVehicle.driver.license}</div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-2.5 h-2.5 text-zinc-400" />
                    <span>{selectedVehicle.driver.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Model & Telemetry Unit */}
            <div className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-[11px] text-zinc-400 space-y-1">
              <div className="flex justify-between">
                <span>Chassis / Bus:</span>
                <span className="text-zinc-200 font-medium truncate max-w-[140px]">{selectedVehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span>GPS Telemetry Unit:</span>
                <span className="text-emerald-400 font-mono">OBD-II IoT 5G</span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* CENTER COLUMN: LARGE HIGH-DENSITY INTERACTIVE MAP CANVAS (6 COLS)         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Institutional Route Geometry & Live Marker
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Corridor: {selectedVehicle.routeName}
              </span>
            </div>

            {/* SVG Cartographic Map Container */}
            <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl bg-[#0c1017] border border-zinc-800 overflow-hidden shadow-inner flex items-center justify-center">
              
              {/* GIS Cartographic Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#161e2e_1px,transparent_1px),linear-gradient(to_bottom,#161e2e_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />
              
              {/* Secondary decorative road lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 540 320" fill="none">
                {/* Secondary Background Arterials */}
                <path d="M 20 80 Q 150 120 320 60 T 520 180" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
                <path d="M 80 300 Q 220 200 400 240 T 520 280" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
                <path d="M 240 20 L 260 300" stroke="#1e293b" strokeWidth="4" strokeDasharray="6 6" />
                <path d="M 420 10 L 400 310" stroke="#1e293b" strokeWidth="4" strokeDasharray="6 6" />

                {/* Route 2 (South Metro Feeder - Indigo) */}
                <path 
                  d="M 60 220 C 120 250, 240 280, 480 260" 
                  stroke="#4f46e5" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeDasharray="4 4"
                  opacity={selectedVehicleId === 'vh-02' ? 1 : 0.4}
                />

                {/* Route 7 (East Tech Corridor - Cyan) */}
                <path 
                  d="M 60 220 C 180 180, 360 220, 500 120" 
                  stroke="#06b6d4" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeDasharray="4 4"
                  opacity={selectedVehicleId === 'vh-07' ? 1 : 0.4}
                />

                {/* Route 4 Primary Active Path (North Campus Express - Emerald) */}
                <path 
                  d="M 60 220 C 120 200, 160 170, 190 160 C 230 145, 290 125, 340 110 C 390 95, 430 80, 470 70" 
                  stroke="#10b981" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  className={selectedVehicleId === 'vh-04' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'opacity-40'}
                />

                {/* Sequenced Bus Stops on Route 4 */}
                {/* Stop 1: EduPulse Campus (Origin) */}
                <g>
                  <circle cx="60" cy="220" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <text x="65" y="240" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">01. Campus (Dep 08:30)</text>
                </g>

                {/* Stop 2: North Gate Sec 18 */}
                <g>
                  <circle cx="190" cy="160" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <text x="180" y="180" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">02. North Gate (08:48)</text>
                </g>

                {/* Stop 3: Metro Station Sec 62 (Destination Target) */}
                <g>
                  <circle cx="340" cy="110" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="animate-ping opacity-75" />
                  <circle cx="340" cy="110" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <text x="320" y="92" fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">03. Metro Sec 62 (09:05)</text>
                </g>

                {/* Stop 4: City Center Hub (Terminal) */}
                <g>
                  <circle cx="470" cy="70" r="6" fill="#64748b" stroke="#ffffff" strokeWidth="2" />
                  <text x="430" y="60" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">04. City Center (09:25)</text>
                </g>

                {/* Moving Bus Marker */}
                <g 
                  style={{
                    transform: `translate(${busPosition.x}px, ${busPosition.y}px)`,
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Glowing Radar Waves */}
                  <circle cx="0" cy="0" r="18" fill="#10b981" opacity="0.2" className="animate-ping" />
                  <circle cx="0" cy="0" r="12" fill="#10b981" opacity="0.4" />
                  <circle cx="0" cy="0" r="7" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
                </g>
              </svg>

              {/* Floating Dynamic Callout for Moving Vehicle */}
              <div 
                className="absolute z-10 pointer-events-none transition-all duration-700 ease-out"
                style={{
                  left: `${(busPosition.x / 540) * 100}%`,
                  top: `${(busPosition.y / 320) * 100}%`,
                  transform: 'translate(-50%, -135%)'
                }}
              >
                <div className="bg-zinc-900/95 border border-emerald-500/80 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-xl text-center whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-white font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{selectedVehicle.plate}</span>
                    <span className="text-emerald-400 font-mono">42 km/h</span>
                  </div>
                  <div className="text-[9px] text-zinc-400 font-mono">{busPosition.label}</div>
                </div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45 mx-auto -mt-1" />
              </div>

              {/* In-Map Telemetry HUD Overlay (Top Right) */}
              <div className="absolute top-3 right-3 bg-zinc-950/80 border border-zinc-800 backdrop-blur-md p-2.5 rounded-xl text-[10px] font-mono space-y-1 text-zinc-300 pointer-events-none">
                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Target Stop Metric</div>
                <div className="text-white font-bold flex items-center justify-between gap-3">
                  <span>Next: Metro Sec 62</span>
                  <span className="text-amber-400">ETA 4 min</span>
                </div>
                <div className="flex justify-between gap-3 text-zinc-400">
                  <span>Distance: 1.8 km</span>
                  <span>Heading: 042° NE</span>
                </div>
              </div>

              {/* In-Map Map Legend (Bottom Left) */}
              <div className="absolute bottom-3 left-3 bg-zinc-950/80 border border-zinc-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Route 4 Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Approaching Stop
                </span>
              </div>
            </div>

            {/* Bottom Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Current Speed</span>
                <span className="text-white font-bold">{selectedVehicle.speed}</span>
                <span className="text-emerald-400 text-[9px] block">School Zone Compliant</span>
              </div>

              <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Fuel / Battery</span>
                <span className="text-white font-bold">{selectedVehicle.fuel} Tank</span>
                <span className="text-zinc-400 text-[9px] block">Est Range: 240 km</span>
              </div>

              <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Next Stop ETA</span>
                <span className="text-amber-400 font-bold">09:05 AM (4 min)</span>
                <span className="text-zinc-400 text-[9px] block">Metro Station Sec 62</span>
              </div>

              <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Geofence Boundary</span>
                <span className="text-emerald-400 font-bold">Within Corridor</span>
                <span className="text-zinc-400 text-[9px] block">Deviation: 0.0 m</span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: PASSENGER MANIFEST & LIVE BOARDING (3 COLS)                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Passenger Manifest
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {effectiveOccupancy} / {selectedVehicle.capacityTotal} Seats
              </span>
            </div>

            {/* Live Occupancy Meter */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">Seat Occupancy</span>
                <span className="text-emerald-400 font-bold">{occupancyPercentage}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>{effectiveOccupancy} Confirmed</span>
                <span>{selectedVehicle.capacityTotal - effectiveOccupancy} Vacant</span>
              </div>
            </div>

            {/* Student Passenger Roster */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Pickup Roster for Stop 2 & 3
              </span>

              {passengers.map((p) => {
                // In 'boarding' step, Stop 3 students (Aarav & Aanya) transition to 'Boarded'
                const isBoarded = p.isBoardedInitial || (isBoardingStage && p.stopName.includes('Sec 62'));

                return (
                  <div 
                    key={p.id}
                    className={`p-3 rounded-2xl border transition ${
                      isBoarded
                        ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'
                        : 'bg-zinc-900/90 border-amber-500/40 text-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={p.photo} 
                        alt={p.name}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{p.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400">{p.seatNumber}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate font-mono">{p.enrollment}</div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 truncate max-w-[130px]">{p.stopName.split(' ')[0]} {p.stopName.split(' ')[1]}</span>
                      {isBoarded ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Boarded ({p.pickupTime})
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1 animate-pulse">
                          <Radio className="w-3 h-3" />
                          Awaiting Pickup
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Institutional RFID & SIS Ledger Integration Note */}
            <div className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-[10px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>RFID Boarding Verification</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                RFID smart card tap writes instant timestamps into <span className="font-mono text-zinc-400">TransportManager.jsx</span> and triggers automated SMS pickup notifications to authorized guardians.
              </p>
            </div>

          </div>

        </div>

        {/* Bottom State Bar */}
        <div className="pt-5 mt-5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500 font-mono">
          <span>Active State: {currentStep.label} &bull; {currentStep.description}</span>
          <span className="text-zinc-400">EduPulse Institutional Fleet Engine &bull; TransportManager.jsx</span>
        </div>

      </div>

      {/* 3. Three Technical Infrastructure Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 border-t border-zinc-200/80 bg-zinc-50/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Route Geofencing</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Institutional bus routes follow strictly defined road geometry corridors. Automatic alerts trigger if vehicles deviate more than 250 meters from assigned pathways.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Dynamic ETA Countdown</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Stop arrival estimations recompute on every 10-second GPS interval using historical traffic pacing, keeping parents and administrators precisely informed.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>SIS Seat Manifest Binding</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Transport rosters link directly with student enrollment records, ensuring only authorized fee-cleared riders are issued bus passes and allocated seating.
          </p>
        </div>
      </div>

    </div>
  );
};

export default CampusTransportFleetDemo;