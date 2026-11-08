import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  UserCheck,
  CalendarRange,
  FileText,
  AlertCircle,
  Filter,
} from 'lucide-react';
import {
  applyForLeave,
  reviewLeave,
  getPendingLeaves,
  getAllLeaves,
} from '../../api/hrService';
import { getFaculty } from '../../api/academicService';

export default function LeaveManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my-leaves'); // 'my-leaves' | 'pending'

  // Application form state
  const [leaveForm, setLeaveForm] = useState({
    facultyId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Queries
  const { data: pendingLeaves = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ['pendingLeaves'],
    queryFn: getPendingLeaves,
  });

  const { data: allLeaves = [], isLoading: isAllLoading } = useQuery({
    queryKey: ['allLeaves'],
    queryFn: getAllLeaves,
  });

  const { data: facultyList = [] } = useQuery({
    queryKey: ['facultyList'],
    queryFn: getFaculty,
  });

  // Apply Leave Mutation
  const applyMutation = useMutation({
    mutationFn: (data) => applyForLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
      toast.success('Leave application submitted successfully!');
      setLeaveForm({
        facultyId: facultyList.length > 0 ? String(facultyList[0].id) : '',
        startDate: '',
        endDate: '',
        reason: '',
      });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to submit leave';
      toast.error(msg);
    },
  });

  // Review Leave Mutation
  const reviewMutation = useMutation({
    mutationFn: ({ leaveId, status, reviewNotes }) =>
      reviewLeave(leaveId, { status, reviewNotes, reviewedBy: 'HR Manager' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['allLeaves'] });
      const action = variables.status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Leave request ${action} successfully!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to update leave';
      toast.error(msg);
    },
  });

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.facultyId) {
      toast.error('Please select a faculty member');
      return;
    }
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    if (!leaveForm.reason.trim()) {
      toast.error('Please specify a reason for leave');
      return;
    }

    applyMutation.mutate({
      facultyId: Number(leaveForm.facultyId),
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason.trim(),
    });
  };

  const handleReview = (leaveId, status) => {
    reviewMutation.mutate({
      leaveId,
      status,
      reviewNotes: status === 'APPROVED' ? 'Approved by HR Manager' : 'Rejected by HR Manager',
    });
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarRange className="w-7 h-7 text-indigo-600" />
            Staff Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit leave requests, review department absences, and maintain institutional HR records.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('my-leaves')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'my-leaves'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            My Leaves
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'pending'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Pending Approvals
            {pendingLeaves.length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                {pendingLeaves.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Decision</p>
            <h3 className="text-2xl font-bold text-slate-900">{pendingLeaves.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approved Requests</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {allLeaves.filter((l) => l.status === 'APPROVED').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-bold text-slate-900">{allLeaves.length}</h3>
          </div>
        </div>
      </div>

      {/* TAB 1: MY LEAVES (Application & History) */}
      {activeTab === 'my-leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Apply for Leave
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Submit your absence request for administrative review and deduction tracking.
            </p>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Faculty Member <span className="text-rose-500">*</span>
                </label>
                {facultyList.length > 0 ? (
                  <select
                    aria-label="Faculty Member"
                    name="facultyId"
                    value={leaveForm.facultyId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, facultyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.firstName} {f.lastName} ({f.employeeId || `ID: ${f.id}`})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    aria-label="Faculty Member"
                    name="facultyId"
                    type="number"
                    placeholder="Enter Faculty ID (e.g. 1)"
                    value={leaveForm.facultyId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, facultyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    aria-label="Start Date"
                    name="startDate"
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    aria-label="End Date"
                    name="endDate"
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason for Leave <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Medical leave, personal matters, research conference..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {applyMutation.isPending ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          </div>

          {/* Leave History List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Recent Applications</h3>
                <p className="text-xs text-slate-500">History of submitted staff leaves and review outcomes</p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {allLeaves.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Faculty</th>
                    <th className="py-3 px-4 font-semibold">Dates</th>
                    <th className="py-3 px-4 font-semibold">Duration</th>
                    <th className="py-3 px-4 font-semibold">Reason</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isAllLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Loading leave records...
                      </td>
                    </tr>
                  ) : allLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No leave records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    allLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{leave.facultyName}</div>
                          <div className="text-xs text-slate-500">{leave.employeeId || 'ID: ' + leave.facultyId}</div>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <div>{leave.startDate}</div>
                          <div className="text-slate-400">to {leave.endDate}</div>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                          {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="py-3 px-4">{renderStatusBadge(leave.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Leave Approvals
              </h2>
              <p className="text-xs text-slate-500">
                Review and approve or reject faculty leave applications with real-time payroll deduction linkage.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full w-fit">
              {pendingLeaves.length} Pending Decision
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Faculty Details</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Dates</th>
                  <th className="py-3 px-4 font-semibold">Days</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold text-right">Decision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isPendingLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading pending approval queue...
                    </td>
                  </tr>
                ) : pendingLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-75" />
                      <p className="font-medium text-slate-600">All caught up!</p>
                      <p className="text-xs text-slate-400">No pending leave requests awaiting approval.</p>
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{leave.facultyName}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {leave.employeeId || 'ID: ' + leave.facultyId}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {leave.departmentName || 'General Academic'}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium">
                        <div>{leave.startDate}</div>
                        <div className="text-slate-400">to {leave.endDate}</div>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-indigo-700">
                        {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-sm">
                        <p className="line-clamp-2" title={leave.reason}>
                          {leave.reason}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleReview(leave.id, 'APPROVED')}
                            disabled={reviewMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(leave.id, 'REJECTED')}
                            disabled={reviewMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
