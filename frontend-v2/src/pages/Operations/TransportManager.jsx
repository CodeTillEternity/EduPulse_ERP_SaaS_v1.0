import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bus,
  MapPin,
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Compass,
  DollarSign,
  UserCheck,
  X,
  Shield,
  Gauge,
  Navigation,
} from 'lucide-react';
import {
  getVehicles,
  createVehicle,
  getRoutes,
  createRoute,
  assignStudent,
  getAllAssignments,
} from '../../api/enterpriseOpsService';

const EMPTY_ARRAY = [];

export default function TransportManager() {
  const queryClient = useQueryClient();

  // Active Tab: 'routes' | 'vehicles' | 'assignments'
  const [activeTab, setActiveTab] = useState('routes');

  // Modal controls
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    capacity: 40,
    driverName: '',
  });

  const [routeForm, setRouteForm] = useState({
    routeName: '',
    stops: '',
    vehicleId: '',
    monthlyFee: '120.00',
  });

  const [assignForm, setAssignForm] = useState({
    routeId: '',
    studentId: '',
    pickupStop: '',
  });

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  // ==========================================
  // DATA QUERIES
  // ==========================================

  const {
    data: vehicles = EMPTY_ARRAY,
    isLoading: isLoadingVehicles,
  } = useQuery({
    queryKey: ['transportVehicles'],
    queryFn: getVehicles,
  });

  const {
    data: routes = EMPTY_ARRAY,
    isLoading: isLoadingRoutes,
  } = useQuery({
    queryKey: ['transportRoutes'],
    queryFn: getRoutes,
  });

  const {
    data: assignments = EMPTY_ARRAY,
    isLoading: isLoadingAssignments,
  } = useQuery({
    queryKey: ['transportAssignments'],
    queryFn: getAllAssignments,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  const createVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transportVehicles'] });
      toast.success(`Vehicle ${data.registrationNumber} registered in fleet!`);
      setIsVehicleModalOpen(false);
      setVehicleForm({ registrationNumber: '', capacity: 40, driverName: '' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to register vehicle';
      toast.error(msg);
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
      toast.success(`Route "${data.routeName}" created successfully!`);
      setIsRouteModalOpen(false);
      setRouteForm({ routeName: '', stops: '', vehicleId: '', monthlyFee: '120.00' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create route';
      toast.error(msg);
    },
  });

  const assignStudentMutation = useMutation({
    mutationFn: assignStudent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transportAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
      toast.success(`Student assigned to ${data.routeName} at stop "${data.pickupStop}"!`);
      setIsAssignModalOpen(false);
      setAssignForm({ routeId: '', studentId: '', pickupStop: '' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to assign student';
      toast.error(msg);
    },
  });

  // ==========================================
  // METRICS & FILTERS
  // ==========================================

  const totalCapacity = useMemo(
    () => vehicles.reduce((sum, v) => sum + (Number(v.capacity) || 0), 0),
    [vehicles]
  );

  const totalAssignedPassengers = useMemo(
    () => routes.reduce((sum, r) => sum + (Number(r.assignedCount) || 0), 0),
    [routes]
  );

  const filteredRoutes = useMemo(() => {
    if (!searchFilter.trim()) return routes;
    const q = searchFilter.toLowerCase();
    return routes.filter(
      (r) =>
        r.routeName?.toLowerCase().includes(q) ||
        r.stops?.toLowerCase().includes(q) ||
        r.vehicleRegistrationNumber?.toLowerCase().includes(q) ||
        r.driverName?.toLowerCase().includes(q)
    );
  }, [routes, searchFilter]);

  const handleOpenAssignModalForRoute = (routeId) => {
    setAssignForm((prev) => ({ ...prev, routeId: String(routeId) }));
    setIsAssignModalOpen(true);
  };

  const handleVehicleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleForm.registrationNumber.trim() || !vehicleForm.driverName.trim()) {
      toast.error('Please fill in all vehicle details');
      return;
    }
    createVehicleMutation.mutate({
      registrationNumber: vehicleForm.registrationNumber.trim().toUpperCase(),
      capacity: Number(vehicleForm.capacity),
      driverName: vehicleForm.driverName.trim(),
    });
  };

  const handleRouteSubmit = (e) => {
    e.preventDefault();
    if (!routeForm.routeName.trim() || !routeForm.stops.trim() || !routeForm.vehicleId) {
      toast.error('Please fill in route name, stops, and select a vehicle');
      return;
    }
    createRouteMutation.mutate({
      routeName: routeForm.routeName.trim(),
      stops: routeForm.stops.trim(),
      vehicleId: Number(routeForm.vehicleId),
      monthlyFee: Number(routeForm.monthlyFee),
    });
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.routeId || !assignForm.studentId) {
      toast.error('Please select a route and enter a student ID');
      return;
    }
    assignStudentMutation.mutate({
      routeId: Number(assignForm.routeId),
      studentId: Number(assignForm.studentId),
      pickupStop: assignForm.pickupStop.trim() || 'Main Campus Gate',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transport & Fleet Logistics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Vehicle fleet registry, commuter route mapping, and real-time student seating capacity management.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'routes'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            Routes ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'vehicles'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-4 h-4" />
            Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'assignments'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Passengers ({assignments.length})
          </button>
        </div>
      </div>

      {/* KPI Metrics Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fleet Vehicles</p>
            <p className="text-2xl font-bold text-slate-900">{vehicles.length} Units</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Routes</p>
            <p className="text-2xl font-bold text-slate-900">{routes.length} Routes</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Fleet Seats</p>
            <p className="text-2xl font-bold text-slate-900">{totalCapacity} Capacity</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Riders</p>
            <p className="text-2xl font-bold text-amber-600">{totalAssignedPassengers} Allocated</p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search routes by name, stop, or vehicle..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Vehicle
          </button>
          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Map Route
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Assign Student
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROUTES VIEW WITH CAPACITY KPI CARDS                                */}
      {/* ========================================================================= */}
      {activeTab === 'routes' && (
        <div>
          {isLoadingRoutes ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
              Loading transport routes...
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
              <Bus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No transport routes configured.</p>
              <p className="text-xs text-slate-400 mt-1">Register a vehicle and map your first commuter route above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => {
                const assigned = Number(route.assignedCount) || 0;
                const capacity = Number(route.vehicleCapacity) || 1;
                const percent = Math.min(100, Math.round((assigned / capacity) * 100));
                const isFull = assigned >= capacity;

                // Color coding for progress bar & occupancy badge
                let barColor = 'bg-emerald-500';
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (percent >= 90) {
                  barColor = 'bg-rose-500';
                  badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                } else if (percent >= 70) {
                  barColor = 'bg-amber-500';
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                }

                return (
                  <div
                    key={route.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow"
                  >
                    {/* Card Title & Vehicle Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{route.routeName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Driver: <span className="font-medium text-slate-700">{route.driverName || 'Unassigned'}</span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-mono font-semibold">
                        <Bus className="w-3.5 h-3.5" />
                        {route.vehicleRegistrationNumber || 'N/A'}
                      </span>
                    </div>

                    {/* Stops List */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Route Stops:</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-mono">
                        {route.stops}
                      </p>
                    </div>

                    {/* Capacity KPI Indicator with Visual Progress Bar */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Capacity Utilization</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                          {route.capacityDisplay || `${assigned}/${capacity} Seats Filled`}
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{percent}% Occupancy</span>
                        <span>{capacity - assigned} Seats Remaining</span>
                      </div>
                    </div>

                    {/* Fee & Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block">Monthly Fare</span>
                        <span className="text-sm font-bold text-slate-900">${route.monthlyFee}</span>
                      </div>

                      <button
                        disabled={isFull}
                        onClick={() => handleOpenAssignModalForRoute(route.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {isFull ? 'Route Full' : 'Assign Student'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLEET VEHICLES REGISTRY                                            */}
      {/* ========================================================================= */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Registered Fleet Vehicles</h2>
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Vehicle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Registration #</th>
                  <th className="py-3.5 px-4">Driver Name</th>
                  <th className="py-3.5 px-4 text-center">Passenger Capacity</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingVehicles ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      Loading fleet registry...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No fleet vehicles recorded yet.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {v.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{v.driverName}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {v.capacity} Seats
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Fleet
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PASSENGER SEAT ALLOCATIONS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Student Commuter Seat Assignments</h2>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Student
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Assigned Route</th>
                  <th className="py-3.5 px-4">Pickup Stop</th>
                  <th className="py-3.5 px-4">Assignment Date</th>
                  <th className="py-3.5 px-4 text-center">Active Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingAssignments ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading commuter allocations...
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No student route assignments found.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{a.studentName || `Student #${a.studentId}`}</p>
                        {a.enrollmentNumber && (
                          <p className="text-xs font-mono text-slate-500">{a.enrollmentNumber}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{a.routeName}</td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {a.pickupStop}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">{a.assignedDate}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER VEHICLE                                                 */}
      {/* ========================================================================= */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Bus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Register Vehicle</h3>
              </div>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-EQ-9876"
                  value={vehicleForm.registrationNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm uppercase font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Seating Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={vehicleForm.capacity}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Driver Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Vance"
                  value={vehicleForm.driverName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVehicleMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {createVehicleMutation.isPending ? 'Saving...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MAP ROUTE                                                        */}
      {/* ========================================================================= */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Map Commuter Route</h3>
              </div>
              <button
                onClick={() => setIsRouteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Route Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route 4 - North Campus Express"
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Vehicle *
                </label>
                <select
                  required
                  value={routeForm.vehicleId}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Choose a Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.capacity} Seats - Driver: {v.driverName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Commuter Stops (comma-separated) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Central Station, North Gate, Science Block, Main Auditorium"
                  value={routeForm.stops}
                  onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Fee ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={routeForm.monthlyFee}
                  onChange={(e) => setRouteForm({ ...routeForm, monthlyFee: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRouteMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {createRouteMutation.isPending ? 'Mapping...' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN STUDENT TO ROUTE                                          */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Assign Student to Route</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select Commuter Route *
                </label>
                <select
                  required
                  value={assignForm.routeId}
                  onChange={(e) => setAssignForm({ ...assignForm, routeId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map((r) => {
                    const isFull = (r.assignedCount || 0) >= (r.vehicleCapacity || 0);
                    return (
                      <option key={r.id} value={r.id} disabled={isFull}>
                        {r.routeName} ({r.capacityDisplay || `${r.assignedCount}/${r.vehicleCapacity} Seats`}) {isFull ? '[FULL]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Student Database ID *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 1"
                  value={assignForm.studentId}
                  onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pickup Stop
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Gate"
                  value={assignForm.pickupStop}
                  onChange={(e) => setAssignForm({ ...assignForm, pickupStop: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignStudentMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {assignStudentMutation.isPending ? 'Allocating Seat...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
