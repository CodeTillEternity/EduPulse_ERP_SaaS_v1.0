import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Building2,
  TrendingDown,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import {
  getMonthlyPayroll,
  generateMonthlyPayroll,
  markPayrollAsPaid,
} from '../../api/hrService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollDashboard() {
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(11); // Default November
  const [selectedYear, setSelectedYear] = useState(2026); // Academic year 2026
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'GENERATED' | 'PAID'

  // Fetch Monthly Payroll
  const {
    data: payrollRecords = [],
    isLoading: isPayrollLoading,
    refetch,
  } = useQuery({
    queryKey: ['monthlyPayroll', selectedMonth, selectedYear],
    queryFn: () => getMonthlyPayroll(Number(selectedMonth), Number(selectedYear)),
  });

  // Generate Payroll Batch Mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      generateMonthlyPayroll({
        month: Number(selectedMonth),
        year: Number(selectedYear),
        defaultBaseSalary: 50000.0,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['monthlyPayroll', selectedMonth, selectedYear],
      });
      toast.success(
        `Successfully generated payroll batch for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} (${data.length} records)`
      );
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to generate payroll batch';
      toast.error(msg);
    },
  });

  // Mark As Paid Mutation
  const payMutation = useMutation({
    mutationFn: (payrollId) => markPayrollAsPaid(payrollId),
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({
        queryKey: ['monthlyPayroll', selectedMonth, selectedYear],
      });
      toast.success(
        `Marked payslip as PAID for ${updatedRecord.facultyName || 'Faculty member'}`
      );
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to disburse salary';
      toast.error(msg);
    },
  });

  const handleGenerateBatch = () => {
    generateMutation.mutate();
  };

  const handleMarkAsPaid = (payrollId) => {
    payMutation.mutate(payrollId);
  };

  // Filter records
  const filteredRecords = payrollRecords.filter((record) => {
    const matchesSearch =
      (record.facultyName && record.facultyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.employeeId && record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregated totals
  const totalBase = filteredRecords.reduce((sum, r) => sum + Number(r.baseSalary || 0), 0);
  const totalDeductions = filteredRecords.reduce((sum, r) => sum + Number(r.deductions || 0), 0);
  const totalNet = filteredRecords.reduce((sum, r) => sum + Number(r.netSalary || 0), 0);
  const paidCount = filteredRecords.filter((r) => r.status === 'PAID').length;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Monthly Payroll Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated compensation calculation, unpaid leave deduction processing, and salary disbursement.
          </p>
        </div>

        {/* Period Selector & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-300 rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              aria-label="Payroll Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              aria-label="Payroll Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm font-medium text-slate-700 bg-transparent focus:outline-none border-l pl-2 border-slate-200"
            >
              {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateBatch}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generateMutation.isPending ? 'Calculating Batch...' : 'Generate Payroll Batch'}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Payable</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalNet)}</h3>
          <p className="text-xs text-slate-500 mt-1">Disbursable monthly liability</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Leave Deductions</p>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-600 mt-2">-{formatCurrency(totalDeductions)}</h3>
          <p className="text-xs text-slate-500 mt-1">Calculated from approved absences</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Base Salary Sum</p>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalBase)}</h3>
          <p className="text-xs text-slate-500 mt-1">Standard gross compensation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Disbursement Rate</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {payrollRecords.length > 0
              ? `${Math.round((paidCount / payrollRecords.length) * 100)}%`
              : '0%'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {paidCount} of {payrollRecords.length} records marked PAID
          </p>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              aria-label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="GENERATED">Pending Disbursement (GENERATED)</option>
              <option value="PAID">Disbursed (PAID)</option>
            </select>
          </div>
        </div>

        {/* Interactive Payroll Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Faculty Name</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold text-right">Base Salary</th>
                <th className="py-3 px-4 font-semibold text-right">Unpaid Deductions</th>
                <th className="py-3 px-4 font-semibold text-right">Net Payable</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Disbursement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isPayrollLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading monthly payroll batch...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No payroll records found for this period</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Click the "Generate Payroll Batch" button above to calculate salaries and leave deductions for{' '}
                      {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{record.facultyName}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {record.employeeId || 'ID: ' + record.facultyId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {record.departmentName || 'General Academic'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-right font-medium text-slate-800">
                      {formatCurrency(record.baseSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-right font-semibold text-rose-600">
                      {Number(record.deductions) > 0 ? `-${formatCurrency(record.deductions)}` : '₹0.00'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-right font-bold text-emerald-700">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {record.status === 'PAID' ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            PAID
                          </span>
                          {record.paymentDate && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {record.paymentDate}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          GENERATED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {record.status === 'PAID' ? (
                        <span className="text-xs font-medium text-emerald-600 inline-flex items-center gap-1">
                          <Check className="w-4 h-4" /> Disbursed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkAsPaid(record.id)}
                          disabled={payMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
