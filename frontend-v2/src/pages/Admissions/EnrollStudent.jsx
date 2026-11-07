import React, { useState } from 'react';
import { toast } from 'sonner';
import { enrollStudent } from '../../services/studentService';

export default function EnrollStudent() {
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    batchId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEnrolled, setLastEnrolled] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.enrollmentNumber.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (!formData.departmentId || !formData.batchId) {
      toast.error('Department ID and Batch ID are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        enrollmentNumber: formData.enrollmentNumber.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        departmentId: Number(formData.departmentId),
        batchId: Number(formData.batchId),
      };

      const result = await enrollStudent(payload);
      toast.success(`Student enrolled successfully! Enrollment #: ${result.enrollmentNumber || payload.enrollmentNumber}`);
      setLastEnrolled(result);

      // Reset form
      setFormData({
        enrollmentNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        batchId: '',
      });
    } catch (err) {
      console.error('Enrollment error:', err);
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to enroll student. Please check input details.';

      if (err.response?.status === 400 || err.response?.status === 409) {
        toast.error(`Enrollment Conflict: ${errorMsg}`);
      } else if (err.response?.status === 403) {
        toast.error('Access Denied: You do not have permissions to enroll students.');
      } else {
        toast.error(`Error: ${errorMsg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admissions Registry</h1>
              <p className="text-sm text-slate-500">Enroll new student records scoped to the current institutional tenant.</p>
            </div>
          </div>
        </div>

        {/* Enrollment Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-800">Student Profile Information</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/50 px-2.5 py-1 rounded-full font-medium">
              Multi-Tenant Scoped
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Enrollment Number */}
              <div className="sm:col-span-2">
                <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-slate-700 mb-1">
                  Enrollment / Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="enrollmentNumber"
                  id="enrollmentNumber"
                  required
                  value={formData.enrollmentNumber}
                  onChange={handleChange}
                  placeholder="e.g. ENR-2026-001"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <p className="mt-1 text-xs text-slate-500">Must be unique per institutional tenant partition.</p>
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Ada"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Lovelace"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. ada.lovelace@institution.edu"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Department ID */}
              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-slate-700 mb-1">
                  Department ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="departmentId"
                  id="departmentId"
                  required
                  min="1"
                  value={formData.departmentId}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Batch ID */}
              <div>
                <label htmlFor="batchId" className="block text-sm font-medium text-slate-700 mb-1">
                  Batch ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="batchId"
                  id="batchId"
                  required
                  min="1"
                  value={formData.batchId}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    enrollmentNumber: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    departmentId: '',
                    batchId: '',
                  })
                }
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Enrolling...
                  </>
                ) : (
                  'Enroll Student'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recently Enrolled Confirmation Banner */}
        {lastEnrolled && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-900">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold">Student Enrolled Successfully</h3>
                <div className="mt-1 text-xs text-emerald-700">
                  <p>
                    <span className="font-medium">Name:</span> {lastEnrolled.firstName} {lastEnrolled.lastName} |{' '}
                    <span className="font-medium">Enrollment #:</span> {lastEnrolled.enrollmentNumber} |{' '}
                    <span className="font-medium">Email:</span> {lastEnrolled.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
