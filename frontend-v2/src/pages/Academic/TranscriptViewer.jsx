import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Printer,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  User,
  Building2,
} from 'lucide-react';
import { getStudentTranscript } from '../../api/examService';

export default function TranscriptViewer() {
  const [searchInput, setSearchInput] = useState('');
  const [activeEnrollmentNumber, setActiveEnrollmentNumber] = useState('');

  const {
    data: transcript,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['studentTranscript', activeEnrollmentNumber],
    queryFn: () => getStudentTranscript(activeEnrollmentNumber),
    enabled: Boolean(activeEnrollmentNumber),
    retry: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error('Please enter a student enrollment number');
      return;
    }
    setActiveEnrollmentNumber(searchInput.trim());
  };

  const handlePrint = () => {
    window.print();
  };

  const results = transcript?.results || [];

  // Compute summary stats
  const totalMarksSum = results.reduce((acc, r) => acc + Number(r.totalMarks || 0), 0);
  const marksObtainedSum = results.reduce((acc, r) => acc + Number(r.marksObtained || 0), 0);
  const averagePercentage =
    totalMarksSum > 0 ? ((marksObtainedSum / totalMarksSum) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Non-printable Search & Action Toolbar */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Official Academic Transcripts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search student records by enrollment number to review course evaluations and print official transcripts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                aria-label="Student Enrollment Number"
                type="text"
                placeholder="Enter enrollment # (e.g. ENR-2026-001)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-72 pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
            >
              Search
            </button>
          </form>

          {transcript && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Transcript
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-medium text-slate-600">Retrieving official academic transcript...</p>
        </div>
      )}

      {isError && (
        <div className="py-16 text-center bg-rose-50 rounded-2xl border border-rose-200 p-6">
          <p className="text-rose-700 font-semibold mb-1">Transcript Record Not Found</p>
          <p className="text-xs text-rose-500">
            {error?.response?.data?.message || `No enrolled student matches enrollment number "${activeEnrollmentNumber}".`}
          </p>
        </div>
      )}

      {!activeEnrollmentNumber && !transcript && !isLoading && (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Search for a Student Transcript</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Input a valid enrollment number in the search bar above to generate the cumulative GPA, course assessment history, and official grading records.
          </p>
        </div>
      )}

      {/* Official Printable Transcript Container */}
      {transcript && !isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 print:p-0 print:border-none print:shadow-none space-y-8">
          {/* Institution Transcript Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                <span className="text-xs font-bold tracking-widest text-indigo-700 uppercase">
                  EduPulse Institutional ERP
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                OFFICIAL ACADEMIC TRANSCRIPT
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive Grade History & Cumulative Grade Point Evaluation
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p className="font-mono">Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Institutional Record
              </p>
            </div>
          </div>

          {/* Student Demographic Card & Cumulative GPA Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Details */}
            <div className="md:col-span-2 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Student Full Name</span>
                <span className="font-bold text-slate-900 text-base">{transcript.studentName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Enrollment Identifier</span>
                <span className="font-mono font-bold text-indigo-700 text-base">{transcript.enrollmentNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Email Address</span>
                <span className="text-slate-700 font-medium">{transcript.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Academic Batch</span>
                <span className="text-slate-700 font-medium">{transcript.batchName || 'Default Batch'}</span>
              </div>
            </div>

            {/* TOP-LEVEL CUMULATIVE GPA KPI CARD */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-200">
                  Cumulative GPA
                </span>
                <Award className="w-6 h-6 text-indigo-200" />
              </div>
              <div className="my-2">
                <div className="text-4xl font-extrabold tracking-tight">
                  {Number(transcript.cumulativeGpa).toFixed(2)}
                </div>
                <p className="text-xs text-indigo-200 mt-1">Scale: 4.00 Maximum Quality Points</p>
              </div>
              <div className="pt-2 border-t border-indigo-500/50 flex justify-between text-xs text-indigo-200">
                <span>Evaluations: {transcript.totalExams}</span>
                <span>Avg: {averagePercentage}%</span>
              </div>
            </div>
          </div>

          {/* Detailed Course & Exam Results Table */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Course Assessment Breakdown
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/75 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Course Code</th>
                    <th className="py-3 px-4 font-semibold">Course Title</th>
                    <th className="py-3 px-4 font-semibold">Exam Assessment</th>
                    <th className="py-3 px-4 font-semibold text-right">Max Marks</th>
                    <th className="py-3 px-4 font-semibold text-right">Marks Obtained</th>
                    <th className="py-3 px-4 font-semibold text-center">Grade</th>
                    <th className="py-3 px-4 font-semibold text-right">Grade Point</th>
                    <th className="py-3 px-4 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No examination results recorded for this student.
                      </td>
                    </tr>
                  ) : (
                    results.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          {res.courseCode || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {res.courseName || 'General Academic'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                          {res.examName}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 text-right">
                          {res.totalMarks}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-900 text-right">
                          {res.marksObtained}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {res.gradeLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono font-bold text-indigo-700 text-right">
                          {Number(res.gradePoint).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 italic">
                          {res.remarks || 'Satisfactory'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transcript Footer Signatures for Print */}
          <div className="pt-12 mt-12 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs text-slate-600">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Academic Dean / Registrar</p>
              <p className="text-[11px] text-slate-400">Office of Academic Affairs</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Controller of Examinations</p>
              <p className="text-[11px] text-slate-400">Institutional Evaluation Board</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
