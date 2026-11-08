import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Filter,
  Save,
  Users,
  CheckCheck,
  Clock3,
  HelpCircle,
  Search,
} from 'lucide-react';
import {
  getTimetableByBatch,
  getStudentsForBatch,
  getAttendanceByTimetableAndDate,
  markAttendance,
} from '../../api/operationsService';

const EMPTY_ARRAY = [];

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Present',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBtn: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30',
    inactiveBtn: 'bg-white text-emerald-700 hover:bg-emerald-50 border-slate-200',
  },
  ABSENT: {
    label: 'Absent',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    activeBtn: 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30',
    inactiveBtn: 'bg-white text-rose-700 hover:bg-rose-50 border-slate-200',
  },
  LATE: {
    label: 'Late',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    activeBtn: 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30',
    inactiveBtn: 'bg-white text-amber-700 hover:bg-amber-50 border-slate-200',
  },
  EXCUSED: {
    label: 'Excused',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBtn: 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30',
    inactiveBtn: 'bg-white text-blue-700 hover:bg-blue-50 border-slate-200',
  },
};

export default function AttendanceTracker() {
  const queryClient = useQueryClient();

  // Selection Filters
  const [selectedBatchId, setSelectedBatchId] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Attendance user overrides: { [studentId]: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }
  const [attendanceOverrides, setAttendanceOverrides] = useState({});

  // 1. Fetch Timetable Entries for selected Batch
  const timetableQuery = useQuery({
    queryKey: ['timetable', selectedBatchId],
    queryFn: () => getTimetableByBatch(selectedBatchId),
    enabled: Boolean(selectedBatchId),
  });
  const timetable = timetableQuery.data || EMPTY_ARRAY;

  // Active timetable slot (user selection or first available slot)
  const activeTimetableId = useMemo(() => {
    if (selectedTimetableId && timetable.some((t) => t.id === Number(selectedTimetableId))) {
      return selectedTimetableId;
    }
    return timetable.length > 0 ? String(timetable[0].id) : '';
  }, [selectedTimetableId, timetable]);

  // 2. Fetch Students enrolled in the Batch
  const studentsQuery = useQuery({
    queryKey: ['students', selectedBatchId],
    queryFn: () => getStudentsForBatch(selectedBatchId),
    enabled: Boolean(selectedBatchId),
  });
  const students = studentsQuery.data || EMPTY_ARRAY;

  // 3. Fetch Existing Attendance for current Timetable + Date
  const attendanceQuery = useQuery({
    queryKey: ['attendance', activeTimetableId, selectedDate],
    queryFn: () => getAttendanceByTimetableAndDate(activeTimetableId, selectedDate),
    enabled: Boolean(activeTimetableId) && Boolean(selectedDate),
  });
  const existingAttendance = attendanceQuery.data || EMPTY_ARRAY;

  // Derive status for a student (Override -> Existing -> Default PRESENT)
  const getStudentStatus = (studentId) => {
    if (attendanceOverrides[studentId]) {
      return attendanceOverrides[studentId];
    }
    const found = existingAttendance.find((rec) => rec.studentId === studentId);
    if (found && found.status) {
      return found.status;
    }
    return 'PRESENT';
  };

  // Mutation to persist attendance records
  const saveMutation = useMutation({
    mutationFn: (payload) => markAttendance(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', activeTimetableId, selectedDate],
      });
      setAttendanceOverrides({});
      toast.success(
        `Attendance successfully saved for ${data?.length || students.length} students!`
      );
    },
    onError: (err) => {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save attendance records';
      toast.error(message);
    },
  });

  // Action: Toggle individual student status
  const handleStatusChange = (studentId, status) => {
    setAttendanceOverrides((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Action: Mark all students as PRESENT
  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = 'PRESENT';
    });
    setAttendanceOverrides(updated);
    toast.info('Marked all students as Present');
  };

  // Action: Mark all students as ABSENT
  const handleMarkAllAbsent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = 'ABSENT';
    });
    setAttendanceOverrides(updated);
    toast.info('Marked all students as Absent');
  };

  // Action: Save attendance
  const handleSaveAttendance = () => {
    if (!activeTimetableId) {
      toast.error('Please select an active class timetable slot');
      return;
    }
    if (students.length === 0) {
      toast.error('No enrolled students found in this batch');
      return;
    }

    const payload = students.map((s) => ({
      studentId: s.id,
      timetableEntryId: Number(activeTimetableId),
      date: selectedDate,
      status: getStudentStatus(s.id),
    }));

    saveMutation.mutate(payload);
  };

  // Filtered student list for search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.enrollmentNumber?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    students.forEach((s) => {
      const status = getStudentStatus(s.id);
      if (status === 'PRESENT') present++;
      else if (status === 'ABSENT') absent++;
      else if (status === 'LATE') late++;
      else if (status === 'EXCUSED') excused++;
    });

    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, excused, presentPercentage };
  }, [students, attendanceOverrides, existingAttendance]);

  // Currently active timetable slot info
  const activeSlot = useMemo(() => {
    return timetable.find((t) => t.id === Number(activeTimetableId));
  }, [timetable, activeTimetableId]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <UserCheck className="w-3.5 h-3.5" /> Operations &amp; Daily Attendance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Class Attendance Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Record daily lecture attendance, track real-time attendance ratios, and audit student presence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Present
            </button>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saveMutation.isPending || students.length === 0 || !activeTimetableId}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* Batch Selector */}
          <div>
            <label htmlFor="batchSelectInput" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Academic Batch
            </label>
            <select
              id="batchSelectInput"
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(Number(e.target.value));
                setSelectedTimetableId('');
                setAttendanceOverrides({});
              }}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value={1}>Batch 1 (CS 2026-A)</option>
              <option value={2}>Batch 2 (EE 2026-B)</option>
              <option value={3}>Batch 3 (ME 2026-C)</option>
              <option value={4}>Batch 4 (CS 2027)</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="datePickerInput" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Attendance Date
            </label>
            <input
              id="datePickerInput"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setAttendanceOverrides({});
              }}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Timetable Session Picker */}
          <div>
            <label htmlFor="timetableSelectInput" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Scheduled Class Session
            </label>
            <select
              id="timetableSelectInput"
              value={activeTimetableId}
              onChange={(e) => {
                setSelectedTimetableId(e.target.value);
                setAttendanceOverrides({});
              }}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {timetable.length === 0 ? (
                <option value="">No classes scheduled for this batch</option>
              ) : (
                timetable.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.dayOfWeek} ({slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}) : {slot.courseCode || 'CS'} - {slot.courseName || 'Course'} ({slot.roomNumber || 'Room'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Roster</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Enrolled students</div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
              <span>Present</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">
              {stats.present}{' '}
              <span className="text-xs font-normal text-emerald-600/80">
                ({stats.presentPercentage}%)
              </span>
            </div>
            <div className="text-[11px] text-emerald-600/70 mt-0.5">In attendance</div>
          </div>

          <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
              <span>Absent</span>
              <UserX className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-1 text-2xl font-bold text-rose-700">{stats.absent}</div>
            <div className="text-[11px] text-rose-600/70 mt-0.5">Not present</div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
              <span>Late</span>
              <Clock3 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1 text-2xl font-bold text-amber-700">{stats.late}</div>
            <div className="text-[11px] text-amber-600/70 mt-0.5">Tardy arrival</div>
          </div>

          <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-blue-700 text-xs font-semibold">
              <span>Excused</span>
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-700">{stats.excused}</div>
            <div className="text-[11px] text-blue-600/70 mt-0.5">Approved leave</div>
          </div>
        </div>

        {/* Active Session Banner */}
        {activeSlot && (
          <div className="bg-indigo-50 border border-indigo-200/70 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-800 uppercase px-2 py-0.5 rounded bg-indigo-100 font-mono">
                {activeSlot.courseCode || 'COURSE'}
              </span>
              <span className="font-semibold text-slate-800">{activeSlot.courseName || 'Lecture'}</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-600">Instructor: {activeSlot.facultyName || 'Faculty Assigned'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <span>Room: <strong className="text-slate-800">{activeSlot.roomNumber}</strong></span>
              <span>Time: <strong className="text-slate-800">{activeSlot.startTime?.substring(0, 5)} - {activeSlot.endTime?.substring(0, 5)}</strong></span>
            </div>
          </div>
        )}

        {/* Student Roster Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Enrolled Student Roster</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Table Body */}
          {studentsQuery.isLoading || attendanceQuery.isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <Clock className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <p className="text-xs font-medium">Loading student roster and attendance...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center px-4">
              <Users className="w-10 h-10 mb-2 text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-700">No students found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery ? 'Try adjusting your search criteria.' : 'No students enrolled in this academic batch yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-4 py-3">#</th>
                    <th scope="col" className="px-4 py-3">Enrollment No.</th>
                    <th scope="col" className="px-4 py-3">Student Name</th>
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3 text-center">Status</th>
                    <th scope="col" className="px-4 py-3 text-right">Attendance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, idx) => {
                    const currentStatus = getStudentStatus(student.id);
                    const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PRESENT;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                          {student.enrollmentNumber || `ENR-${student.id}`}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {student.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.badge}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/60 p-0.5 gap-0.5">
                            {Object.keys(STATUS_CONFIG).map((statusKey) => {
                              const isActive = currentStatus === statusKey;
                              const statusItem = STATUS_CONFIG[statusKey];
                              return (
                                <button
                                  key={statusKey}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, statusKey)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                                    isActive
                                      ? statusItem.activeBtn
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                  }`}
                                >
                                  {statusItem.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
