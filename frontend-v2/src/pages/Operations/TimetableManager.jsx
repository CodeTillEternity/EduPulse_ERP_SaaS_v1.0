import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  User,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import { getTimetableByBatch, scheduleClass } from '../../api/operationsService';
import { getCourseOfferings } from '../../api/academicService';

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export default function TimetableManager() {
  const queryClient = useQueryClient();
  const [selectedBatchId, setSelectedBatchId] = useState(1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    courseOfferingId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:30',
    roomNumber: '',
  });

  // Queries
  const {
    data: timetable = [],
    isLoading: isTimetableLoading,
    error: timetableError,
  } = useQuery({
    queryKey: ['timetable', selectedBatchId],
    queryFn: () => getTimetableByBatch(selectedBatchId),
    enabled: Boolean(selectedBatchId),
  });

  const { data: offerings = [] } = useQuery({
    queryKey: ['courseOfferings'],
    queryFn: getCourseOfferings,
  });

  // Mutation
  const scheduleMutation = useMutation({
    mutationFn: (data) => scheduleClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable', selectedBatchId] });
      toast.success('Class session scheduled successfully!');
      setShowScheduleModal(false);
      setFormData({
        courseOfferingId: '',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '10:30',
        roomNumber: '',
      });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to schedule class session. Room collision detected.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.courseOfferingId) {
      toast.error('Please select an active Course Offering');
      return;
    }
    if (!formData.roomNumber.trim()) {
      toast.error('Room number is required');
      return;
    }

    scheduleMutation.mutate({
      courseOfferingId: Number(formData.courseOfferingId),
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
      roomNumber: formData.roomNumber.trim(),
    });
  };

  // Group entries by day
  const timetableByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = timetable
      .filter((entry) => entry.dayOfWeek?.toUpperCase() === day)
      .sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <CalendarDays className="w-3.5 h-3.5" /> Operations &amp; Academic Scheduling
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Class Timetable Manager
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage weekly lecture sessions, classroom assignments, and prevent room overlap collisions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Batch Selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-300 rounded-lg shadow-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <label htmlFor="batchSelect" className="text-xs font-medium text-slate-600">
                Batch:
              </label>
              <select
                id="batchSelect"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                className="text-xs font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value={1}>Batch 1 (CS 2026-A)</option>
                <option value={2}>Batch 2 (EE 2026-B)</option>
                <option value={3}>Batch 3 (ME 2026-C)</option>
                <option value={4}>Batch 4 (CS 2027)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4" /> Schedule Class
            </button>
          </div>
        </div>

        {/* Schedule Form Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Schedule Class Session</h3>
                    <p className="text-xs text-slate-500">Assign course offering, slot time, and room</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="courseOfferingSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Offering *
                  </label>
                  <select
                    id="courseOfferingSelect"
                    value={formData.courseOfferingId}
                    onChange={(e) => setFormData({ ...formData, courseOfferingId: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Select Course Offering --</option>
                    {offerings.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.course?.code || `Offering #${off.id}`} - {off.course?.name} ({off.faculty?.firstName} {off.faculty?.lastName})
                      </option>
                    ))}
                    {offerings.length === 0 && (
                      <option value={1}>CS101 - Intro to Programming (Default)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="dayOfWeekSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                    Day of the Week *
                  </label>
                  <select
                    id="dayOfWeekSelect"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startTimeInput" className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      id="startTimeInput"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endTimeInput" className="block text-xs font-semibold text-slate-700 mb-1">
                      End Time *
                    </label>
                    <input
                      id="endTimeInput"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="roomNumberInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Number / Lecture Hall *
                  </label>
                  <input
                    id="roomNumberInput"
                    type="text"
                    placeholder="e.g. Hall 301, Lab 4B"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {scheduleMutation.isPending ? 'Scheduling...' : 'Save Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Weekly Calendar Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {DAYS_OF_WEEK.map((day) => {
            const entries = timetableByDay[day] || [];
            return (
              <div
                key={day}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[360px]"
              >
                {/* Day Header */}
                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    {day}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                    {entries.length} {entries.length === 1 ? 'class' : 'classes'}
                  </span>
                </div>

                {/* Day Entries List */}
                <div className="p-3 space-y-3 flex-1">
                  {entries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                      <Clock className="w-7 h-7 mb-1.5 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs">No classes scheduled</p>
                    </div>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/80 rounded-xl p-3 text-xs transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-1 text-indigo-700 font-bold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {entry.startTime?.substring(0, 5)} - {entry.endTime?.substring(0, 5)}
                          </span>
                          <span className="bg-indigo-200/60 text-indigo-900 text-[10px] px-1.5 py-0.2 rounded font-mono">
                            {entry.courseCode || 'CORE'}
                          </span>
                        </div>

                        <div className="font-semibold text-slate-800 text-xs mb-1 line-clamp-1">
                          {entry.courseName || 'Course Session'}
                        </div>

                        <div className="flex items-center gap-1 text-slate-600 text-[11px] mb-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{entry.facultyName || 'Faculty Assigned'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-indigo-100/60 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-emerald-700">
                            <MapPin className="w-3 h-3 text-emerald-600" /> {entry.roomNumber}
                          </span>
                          {entry.semester && (
                            <span className="text-[10px] text-slate-400">{entry.semester}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
