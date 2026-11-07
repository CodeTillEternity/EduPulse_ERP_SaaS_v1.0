import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  BookOpen,
  UserCheck,
  Plus,
  GraduationCap,
  Briefcase,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import academicService from '../../api/academicService';

export default function CourseManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('faculty'); // 'faculty' | 'courses'

  // Faculty form state
  const [facultyForm, setFacultyForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    designation: 'Assistant Professor',
    departmentId: '1',
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    credits: '3',
    departmentId: '1',
  });

  // Offering form state
  const [offeringForm, setOfferingForm] = useState({
    courseId: '',
    facultyId: '',
    batchId: '1',
    semester: 'Fall 2026',
  });

  // Queries
  const { data: facultyList = [], isLoading: isLoadingFaculty } = useQuery({
    queryKey: ['academic', 'faculty'],
    queryFn: academicService.getFaculty,
  });

  const { data: courseList = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['academic', 'courses'],
    queryFn: academicService.getCourses,
  });

  const { data: offeringList = [], isLoading: isLoadingOfferings } = useQuery({
    queryKey: ['academic', 'offerings'],
    queryFn: academicService.getCourseOfferings,
  });

  // Mutations
  const createFacultyMutation = useMutation({
    mutationFn: (data) =>
      academicService.createFaculty({
        ...data,
        departmentId: Number(data.departmentId),
      }),
    onSuccess: (newFaculty) => {
      queryClient.invalidateQueries({ queryKey: ['academic', 'faculty'] });
      toast.success(
        `Faculty member ${newFaculty.firstName} ${newFaculty.lastName} (${newFaculty.employeeId}) registered successfully!`
      );
      setFacultyForm({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        designation: 'Assistant Professor',
        departmentId: '1',
      });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to register faculty member.';
      toast.error(msg);
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) =>
      academicService.createCourse({
        ...data,
        credits: Number(data.credits),
        departmentId: Number(data.departmentId),
      }),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['academic', 'courses'] });
      toast.success(`Course ${newCourse.code} - ${newCourse.name} created successfully!`);
      setCourseForm({
        code: '',
        name: '',
        credits: '3',
        departmentId: '1',
      });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to create course.';
      toast.error(msg);
    },
  });

  const assignOfferingMutation = useMutation({
    mutationFn: (data) =>
      academicService.assignCourseOffering({
        courseId: Number(data.courseId),
        facultyId: Number(data.facultyId),
        batchId: Number(data.batchId),
        semester: data.semester.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic', 'offerings'] });
      toast.success('Instructor successfully assigned to Course Offering!');
      setOfferingForm({
        courseId: '',
        facultyId: '',
        batchId: '1',
        semester: 'Fall 2026',
      });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to assign course offering.';
      toast.error(msg);
    },
  });

  const handleFacultySubmit = (e) => {
    e.preventDefault();
    if (
      !facultyForm.employeeId.trim() ||
      !facultyForm.firstName.trim() ||
      !facultyForm.lastName.trim() ||
      !facultyForm.email.trim()
    ) {
      toast.error('All faculty fields are required.');
      return;
    }
    createFacultyMutation.mutate(facultyForm);
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.name.trim() || !courseForm.credits) {
      toast.error('Course code, name, and credits are required.');
      return;
    }
    createCourseMutation.mutate(courseForm);
  };

  const handleOfferingSubmit = (e) => {
    e.preventDefault();
    if (!offeringForm.courseId || !offeringForm.facultyId || !offeringForm.batchId || !offeringForm.semester.trim()) {
      toast.error('Please select a course, faculty instructor, batch, and semester.');
      return;
    }
    assignOfferingMutation.mutate(offeringForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
              <GraduationCap className="h-4 w-4" />
              <span>Academic Core Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Faculty & Curriculum Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Onboard institutional instructors, publish courses, and manage semester teaching assignments.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('faculty')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'faculty'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Faculty Directory</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'courses'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Courses & Curriculum</span>
            </button>
          </div>
        </div>

        {/* TAB 1: FACULTY DIRECTORY & REGISTRATION */}
        {activeTab === 'faculty' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Faculty Registration Form */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center space-x-2 mb-6 text-slate-900">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold">Register Faculty Member</h2>
              </div>

              <form onSubmit={handleFacultySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.employeeId}
                    onChange={(e) => setFacultyForm({ ...facultyForm, employeeId: e.target.value })}
                    placeholder="FAC-2026-001"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facultyForm.firstName}
                      onChange={(e) => setFacultyForm({ ...facultyForm, firstName: e.target.value })}
                      placeholder="Alan"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facultyForm.lastName}
                      onChange={(e) => setFacultyForm({ ...facultyForm, lastName: e.target.value })}
                      placeholder="Turing"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    placeholder="alan.turing@university.edu"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Designation
                    </label>
                    <select
                      value={facultyForm.designation}
                      onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Head of Department">Head of Department (HOD)</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Department ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={facultyForm.departmentId}
                      onChange={(e) => setFacultyForm({ ...facultyForm, departmentId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createFacultyMutation.isPending}
                  className="w-full mt-4 flex items-center justify-center py-2.5 px-4 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  {createFacultyMutation.isPending ? 'Registering...' : 'Add Faculty Member'}
                </button>
              </form>
            </div>

            {/* Faculty List Table */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 text-slate-900">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-bold">Faculty Roster</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {facultyList.length} Members
                </span>
              </div>

              {isLoadingFaculty ? (
                <div className="py-12 text-center text-slate-400 text-sm">Loading faculty records...</div>
              ) : facultyList.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">No faculty members registered yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Use the form to register your first instructor.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Employee ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Designation</th>
                        <th className="px-4 py-3">Dept</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {facultyList.map((faculty) => (
                        <tr key={faculty.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900 text-xs">
                            {faculty.employeeId}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">
                              {faculty.firstName} {faculty.lastName}
                            </div>
                            <div className="text-xs text-slate-400">{faculty.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                              {faculty.designation}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {faculty.departmentName || `Dept #${faculty.departmentId}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & CURRICULUM ASSIGNMENT */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Form A: Create Course */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center space-x-2 mb-6 text-slate-900">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-bold">Create Academic Course</h2>
                </div>

                <form onSubmit={handleCourseSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={courseForm.code}
                        onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                        placeholder="CS101"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Course Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                        placeholder="Data Structures & Algorithms"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Credits <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        required
                        value={courseForm.credits}
                        onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Department ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={courseForm.departmentId}
                        onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createCourseMutation.isPending}
                    className="w-full mt-4 flex items-center justify-center py-2.5 px-4 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    {createCourseMutation.isPending ? 'Publishing...' : 'Publish Course'}
                  </button>
                </form>
              </div>

              {/* Form B: Assign Instructor to CourseOffering */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center space-x-2 mb-6 text-slate-900">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-bold">Assign Faculty to Course</h2>
                </div>

                <form onSubmit={handleOfferingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Course <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={offeringForm.courseId}
                      onChange={(e) => setOfferingForm({ ...offeringForm, courseId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">-- Select Course --</option>
                      {courseList.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.name} ({course.credits} Credits)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Instructor (Faculty) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={offeringForm.facultyId}
                      onChange={(e) => setOfferingForm({ ...offeringForm, facultyId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">-- Select Faculty Instructor --</option>
                      {facultyList.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.firstName} {faculty.lastName} ({faculty.employeeId} - {faculty.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Batch ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={offeringForm.batchId}
                        onChange={(e) => setOfferingForm({ ...offeringForm, batchId: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Semester <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={offeringForm.semester}
                        onChange={(e) => setOfferingForm({ ...offeringForm, semester: e.target.value })}
                        placeholder="Fall 2026"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={assignOfferingMutation.isPending}
                    className="w-full mt-4 flex items-center justify-center py-2.5 px-4 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    <UserCheck className="h-4 w-4 mr-1.5" />
                    {assignOfferingMutation.isPending ? 'Assigning...' : 'Assign Instructor'}
                  </button>
                </form>
              </div>
            </div>

            {/* Offerings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 text-slate-900">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-bold">Curriculum Offerings & Instructor Assignments</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {offeringList.length} Active Offerings
                </span>
              </div>

              {isLoadingOfferings ? (
                <div className="py-12 text-center text-slate-400 text-sm">Loading course offerings...</div>
              ) : offeringList.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">No course offerings assigned yet.</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Select a course and assign an instructor above to populate the semester offerings.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Instructor</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3">Semester</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {offeringList.map((offering) => (
                        <tr key={offering.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-2">
                              {offering.courseCode}
                            </span>
                            <span className="font-semibold text-slate-900">{offering.courseName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{offering.facultyName}</div>
                            <div className="text-xs text-slate-400">{offering.facultyEmployeeId}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {offering.batchAcademicYear || `Batch #${offering.batchId}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {offering.semester}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
