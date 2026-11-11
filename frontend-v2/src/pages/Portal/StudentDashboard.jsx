import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPortalDashboard } from '../../api/portalService';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Award,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Video
} from 'lucide-react';

export default function StudentDashboard() {
  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: getPortalDashboard,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading your academic dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto my-8">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-900">Unable to load dashboard</h3>
        <p className="text-sm text-rose-600 mt-1">
          {error?.response?.data?.message || error?.message || 'Could not retrieve your student metrics.'}
        </p>
      </div>
    );
  }

  const {
    studentName = 'Student',
    enrollmentNumber = 'N/A',
    batchName = 'N/A',
    departmentName = 'N/A',
    cumulativeGpa = 0.0,
    todayClasses = [],
    unpaidInvoices = [],
    totalUnpaidAmount = 0
  } = dashboard || {};

  const formattedGpa = Number(cumulativeGpa || 0).toFixed(2);
  const formattedUnpaid = Number(totalUnpaidAmount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">
      {/* 1. Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Active Semester Cohort</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl">
              Enrollment No: <span className="font-semibold text-white">{enrollmentNumber}</span> • Batch: <span className="font-semibold text-white">{batchName}</span> • Dept: <span className="font-semibold text-white">{departmentName}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-2">
            <Link
              to="/portal/classroom"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all"
            >
              <Video className="w-3.5 h-3.5 text-emerald-300" />
              <span>Live Classroom</span>
            </Link>
            <Link
              to="/portal/materials"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
              <span>Faculty Notes</span>
            </Link>
            <Link
              to="/portal/fee-ledger"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-sm transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-900" />
              <span>Fee Ledger</span>
            </Link>
            <Link
              to="/portal/schedule"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 shadow-sm transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Schedule</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Top Metric Cards (Action Required & Academic Snapshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Snapshot Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Academic Snapshot
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {formattedGpa}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 4.00 CGPA</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Cumulative grade point average computed across all published examination results.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Good Academic Standing
            </span>
            <Link
              to="/portal/academics"
              className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>View Transcripts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Action Required / Finance Alert Card */}
        <div
          className={`rounded-2xl p-6 border shadow-xs flex flex-col justify-between ${
            unpaidInvoices.length > 0
              ? 'bg-amber-50/60 border-amber-200/80'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fee Assessment Status
              </span>
              <div
                className={`p-2 rounded-xl ${
                  unpaidInvoices.length > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {unpaidInvoices.length > 0 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
            </div>

            {unpaidInvoices.length > 0 ? (
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    ₹{formattedUnpaid}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  You have <span className="font-bold text-slate-900">{unpaidInvoices.length}</span> unpaid institutional invoice(s) due for settlement.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-slate-900">All Cleared</span>
                <p className="text-xs text-slate-500 mt-2">
                  All semester fee installments are settled. No pending payment dues.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">Razorpay RBI-Compliant Gateway</span>
            <Link
              to="/portal/fees"
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors ${
                unpaidInvoices.length > 0
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{unpaidInvoices.length > 0 ? 'Pay Outstanding Now' : 'View Invoices'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Today's Classes Chronological List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Today's Classes</h2>
              <p className="text-xs text-slate-500">Chronological daily lecture schedule</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {todayClasses.length} Scheduled
          </span>
        </div>

        {todayClasses.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No classes scheduled for today</h4>
            <p className="text-xs text-slate-400 mt-1">Enjoy your study break or prepare for upcoming assessments.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayClasses.map((item, index) => (
              <div
                key={item.id || index}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {item.courseCode || 'CLS'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.courseName}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="inline-flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </span>
                      <span className="inline-flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Room {item.roomNumber}</span>
                      </span>
                      {item.facultyName && (
                        <span className="inline-flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.facultyName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {item.dayOfWeek}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
