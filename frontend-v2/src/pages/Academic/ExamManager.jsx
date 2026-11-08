import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  BookOpen,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  createExam,
  getExams,
  getStudentsForExam,
  getExamResults,
  recordStudentResults,
} from '../../api/examService';
import { getCourseOfferings } from '../../api/academicService';

export default function ExamManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'grades'

  // Exam Creation Form State
  const [examForm, setExamForm] = useState({
    name: '',
    examDate: new Date().toISOString().split('T')[0],
    totalMarks: '100',
    courseOfferingId: '',
  });

  // Grade Entry State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marksState, setMarksState] = useState({}); // { [studentId]: { marksObtained: '', remarks: '' } }

  // Queries
  const { data: exams = [], isLoading: isExamsLoading } = useQuery({
    queryKey: ['academicExams'],
    queryFn: getExams,
  });

  const { data: courseOfferings = [] } = useQuery({
    queryKey: ['courseOfferings'],
    queryFn: getCourseOfferings,
  });

  const { data: enrolledStudents = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['examStudents', selectedExamId],
    queryFn: () => getStudentsForExam(selectedExamId),
    enabled: Boolean(selectedExamId),
  });

  const { data: existingResults = [] } = useQuery({
    queryKey: ['examResults', selectedExamId],
    queryFn: () => getExamResults(selectedExamId),
    enabled: Boolean(selectedExamId),
  });

  // Pre-fill existing marks when exam or existingResults change
  useEffect(() => {
    if (existingResults && existingResults.length > 0) {
      const initialMarks = {};
      existingResults.forEach((res) => {
        initialMarks[res.studentId] = {
          marksObtained: String(res.marksObtained || ''),
          remarks: res.remarks || '',
        };
      });
      setMarksState((prev) => ({ ...initialMarks, ...prev }));
    }
  }, [existingResults]);

  // Create Exam Mutation
  const createExamMutation = useMutation({
    mutationFn: (data) => createExam(data),
    onSuccess: (newExam) => {
      queryClient.invalidateQueries({ queryKey: ['academicExams'] });
      toast.success(`Exam "${newExam.name}" scheduled successfully!`);
      setExamForm({
        name: '',
        examDate: new Date().toISOString().split('T')[0],
        totalMarks: '100',
        courseOfferingId: '',
      });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to schedule exam';
      toast.error(msg);
    },
  });

  // Submit Grades Mutation
  const submitGradesMutation = useMutation({
    mutationFn: ({ examId, payload }) => recordStudentResults(examId, payload),
    onSuccess: (savedResults) => {
      queryClient.invalidateQueries({ queryKey: ['examResults', selectedExamId] });
      toast.success(`Successfully recorded grades for ${savedResults.length} students!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to submit grades';
      toast.error(msg);
    },
  });

  const handleCreateExam = (e) => {
    e.preventDefault();
    if (!examForm.name.trim()) {
      toast.error('Please provide an exam name');
      return;
    }
    if (!examForm.courseOfferingId) {
      toast.error('Please select a Course Offering');
      return;
    }
    if (!examForm.totalMarks || Number(examForm.totalMarks) <= 0) {
      toast.error('Total marks must be greater than zero');
      return;
    }

    createExamMutation.mutate({
      name: examForm.name.trim(),
      examDate: examForm.examDate,
      totalMarks: Number(examForm.totalMarks),
      courseOfferingId: Number(examForm.courseOfferingId),
    });
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmitGrades = () => {
    if (!selectedExamId) {
      toast.error('Please select an exam first');
      return;
    }

    const payload = [];
    enrolledStudents.forEach((student) => {
      const entry = marksState[student.id];
      if (entry && entry.marksObtained !== '' && entry.marksObtained !== undefined) {
        payload.push({
          studentId: student.id,
          marksObtained: Number(entry.marksObtained),
          remarks: entry.remarks || '',
        });
      }
    });

    if (payload.length === 0) {
      toast.error('Please enter marks for at least one student');
      return;
    }

    submitGradesMutation.mutate({ examId: Number(selectedExamId), payload });
  };

  const activeExam = exams.find((e) => String(e.id) === String(selectedExamId));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Examinations & Grade Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule course assessments, record student marks, and process automated grade classifications.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'exams'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Exams
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'grades'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            Grade Entry
          </button>
        </div>
      </div>

      {/* TAB 1: EXAM SCHEDULING & LIST */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scheduling Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Schedule New Exam
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Define a test or exam for an active course offering.
            </p>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Exam Name <span className="text-rose-500">*</span>
                </label>
                <input
                  aria-label="Exam Name"
                  type="text"
                  placeholder="e.g. Midterm 1, Final Exam"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Course Offering <span className="text-rose-500">*</span>
                </label>
                <select
                  aria-label="Course Offering"
                  value={examForm.courseOfferingId}
                  onChange={(e) => setExamForm({ ...examForm, courseOfferingId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">-- Select Course Offering --</option>
                  {courseOfferings.map((co) => (
                    <option key={co.id} value={co.id}>
                      {co.courseCode || 'Course'} - {co.courseName || co.courseTitle || `Offering #${co.id}`} ({co.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Exam Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    aria-label="Exam Date"
                    type="date"
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    aria-label="Total Marks"
                    type="number"
                    step="0.01"
                    min="1"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createExamMutation.isPending}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {createExamMutation.isPending ? 'Scheduling Exam...' : 'Schedule Exam'}
              </button>
            </form>
          </div>

          {/* Scheduled Exams List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Scheduled Examinations</h3>
                <p className="text-xs text-slate-500">Upcoming and completed assessments</p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {exams.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Exam Name</th>
                    <th className="py-3 px-4 font-semibold">Course</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Marks</th>
                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isExamsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Loading scheduled examinations...
                      </td>
                    </tr>
                  ) : exams.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium text-slate-600">No exams scheduled yet</p>
                        <p className="text-xs text-slate-400">Use the form on the left to schedule an exam.</p>
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{exam.name}</div>
                          <div className="text-xs text-slate-500">{exam.semester || 'Semester'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-medium text-slate-800">{exam.courseCode || 'Course'}</div>
                          <div className="text-slate-500">{exam.courseName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                          {exam.examDate}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-right text-indigo-700">
                          {exam.totalMarks} pts
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedExamId(String(exam.id));
                              setActiveTab('grades');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                            Enter Grades
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRADE ENTRY */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Control Bar */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Examination to Grade
              </label>
              <select
                aria-label="Select Exam"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Exam --</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} - {exam.courseCode || 'Course'} (Max: {exam.totalMarks} pts)
                  </option>
                ))}
              </select>
            </div>

            {activeExam && (
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block">Course</span>
                  <span className="font-semibold text-slate-800">{activeExam.courseCode}</span>
                </div>
                <div className="border-l pl-4 border-slate-200">
                  <span className="text-slate-400 block">Total Marks</span>
                  <span className="font-semibold text-indigo-700">{activeExam.totalMarks}</span>
                </div>
                <div className="border-l pl-4 border-slate-200">
                  <span className="text-slate-400 block">Exam Date</span>
                  <span className="font-semibold text-slate-800">{activeExam.examDate}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitGrades}
              disabled={submitGradesMutation.isPending || !selectedExamId || enrolledStudents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitGradesMutation.isPending ? 'Submitting Grades...' : 'Submit Grades'}
            </button>
          </div>

          {/* Students Grading Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Enrollment #</th>
                  <th className="py-3 px-4 font-semibold w-40">Marks Obtained</th>
                  <th className="py-3 px-4 font-semibold text-center">Grade Assigned</th>
                  <th className="py-3 px-4 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!selectedExamId ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-600">No exam selected</p>
                      <p className="text-xs text-slate-400">Please select an exam from the dropdown above to load enrolled students.</p>
                    </td>
                  </tr>
                ) : isStudentsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading enrolled students...
                    </td>
                  </tr>
                ) : enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-600">No enrolled students found</p>
                      <p className="text-xs text-slate-400">No active students enrolled in this offering's batch.</p>
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map((student) => {
                    const studentMarks = marksState[student.id]?.marksObtained ?? '';
                    const studentRemarks = marksState[student.id]?.remarks ?? '';
                    const existingRes = existingResults.find((r) => r.studentId === student.id);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                          {student.enrollmentNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            aria-label={`Marks for ${student.firstName} ${student.lastName}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max={activeExam ? activeExam.totalMarks : 100}
                            placeholder="0.00"
                            value={studentMarks}
                            onChange={(e) =>
                              handleMarkChange(student.id, 'marksObtained', e.target.value)
                            }
                            className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {existingRes ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {existingRes.gradeLabel} ({existingRes.gradePoint} pts)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Auto-calculated</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            aria-label={`Remarks for ${student.firstName} ${student.lastName}`}
                            type="text"
                            placeholder="Optional feedback..."
                            value={studentRemarks}
                            onChange={(e) =>
                              handleMarkChange(student.id, 'remarks', e.target.value)
                            }
                            className="w-full max-w-xs px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
