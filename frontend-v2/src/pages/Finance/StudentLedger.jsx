import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  DollarSign,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  ArrowUpRight,
  PlusCircle,
  FileText,
  Calendar,
  X,
} from 'lucide-react';
import { getStudentLedger, recordPayment } from '../../api/financeService';

const STATUS_BADGES = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  UNPAID: 'bg-rose-50 text-rose-700 border-rose-200',
  OVERDUE: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function StudentLedger() {
  const queryClient = useQueryClient();

  // Search state
  const [searchInput, setSearchInput] = useState('ENR-2026-001');
  const [activeEnrollment, setActiveEnrollment] = useState('ENR-2026-001');

  // Active view tab: 'invoices' | 'payments'
  const [activeTab, setActiveTab] = useState('invoices');

  // Collect Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'UPI',
    referenceNumber: '',
    notes: '',
  });

  // Query: Student Ledger details
  const {
    data: ledger,
    isLoading: isLedgerLoading,
    error: ledgerError,
  } = useQuery({
    queryKey: ['studentLedger', activeEnrollment],
    queryFn: () => getStudentLedger(activeEnrollment),
    enabled: Boolean(activeEnrollment),
    retry: false,
  });

  // Mutation: Record payment
  const paymentMutation = useMutation({
    mutationFn: (data) => recordPayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentLedger', activeEnrollment] });
      toast.success(
        `Payment of ₹${Number(data.amount).toLocaleString('en-IN')} recorded successfully!`
      );
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentForm({
        amount: '',
        paymentMethod: 'UPI',
        referenceNumber: '',
        notes: '',
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to record payment transaction';
      toast.error(msg);
    },
  });

  // Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error('Please enter a student enrollment number');
      return;
    }
    setActiveEnrollment(searchInput.trim());
  };

  // Open Payment Modal for an invoice
  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.outstandingBalance ? String(invoice.outstandingBalance) : '',
      paymentMethod: 'UPI',
      referenceNumber: '',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  // Submit payment
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payment amount greater than zero');
      return;
    }
    if (selectedInvoice && amt > Number(selectedInvoice.outstandingBalance)) {
      toast.error(`Payment amount cannot exceed outstanding balance of ₹${selectedInvoice.outstandingBalance}`);
      return;
    }

    paymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      amount: amt,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber.trim() || undefined,
      notes: paymentForm.notes.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <Receipt className="w-3.5 h-3.5" /> B2C Student Ledger &amp; Collections
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Fee Ledger
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Audit student billing assessments, track balance settlements, and collect offline or digital fee payments.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Student Enrollment Number"
                placeholder="Search Enrollment (e.g. ENR-2026-001)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              Search Ledger
            </button>
          </form>
        </div>

        {/* Loading / Error States */}
        {isLedgerLoading && (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <Clock className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            <p className="text-xs font-medium">Fetching student ledger and assessment history...</p>
          </div>
        )}

        {ledgerError && !isLedgerLoading && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-rose-900">Student Account Not Found</h3>
            <p className="text-xs text-rose-700 mt-1">
              No registered student profile matches enrollment number "{activeEnrollment}".
            </p>
          </div>
        )}

        {/* Ledger Content */}
        {ledger && !isLedgerLoading && (
          <div className="space-y-6">
            {/* Student Profile & KPI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <User className="w-4 h-4 text-indigo-600" /> Student Profile
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{ledger.studentName}</h3>
                  <div className="mt-1 font-mono text-xs font-bold text-indigo-700 bg-indigo-50 inline-block px-2 py-0.5 rounded">
                    {ledger.enrollmentNumber}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                    <p>Cohort: <strong className="text-slate-700">{ledger.batchName}</strong></p>
                    <p className="truncate">Email: {ledger.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Total Invoiced */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assessed</span>
                <div className="mt-2 text-2xl font-extrabold text-slate-900">
                  ₹{Number(ledger.totalInvoiced || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Across {ledger.invoices?.length || 0} issued fee invoices
                </p>
              </div>

              {/* Total Paid */}
              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-5 shadow-sm">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Collected</span>
                <div className="mt-2 text-2xl font-extrabold text-emerald-700">
                  ₹{Number(ledger.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-emerald-600 mt-1">
                  {ledger.totalInvoiced > 0
                    ? `${Math.round((ledger.totalPaid / ledger.totalInvoiced) * 100)}% Settled`
                    : '100% Settled'}
                </p>
              </div>

              {/* Outstanding Balance */}
              <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-5 shadow-sm">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Outstanding Due</span>
                <div className="mt-2 text-2xl font-extrabold text-rose-700">
                  ₹{Number(ledger.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-rose-600 mt-1">
                  {Number(ledger.totalOutstanding) === 0 ? 'Clear balance' : 'Pending payment collection'}
                </p>
              </div>
            </div>

            {/* Invoices & Payments Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-4 pt-3 flex gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'invoices'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Fee Invoices ({ledger.invoices?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'payments'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Payment History ({ledger.payments?.length || 0})
                </button>
              </div>

              {/* Tab 1: Invoices Table */}
              {activeTab === 'invoices' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                      <tr>
                        <th scope="col" className="px-4 py-3">Invoice #</th>
                        <th scope="col" className="px-4 py-3">Fee Blueprint</th>
                        <th scope="col" className="px-4 py-3">Gross</th>
                        <th scope="col" className="px-4 py-3">Discount</th>
                        <th scope="col" className="px-4 py-3">Net Payable</th>
                        <th scope="col" className="px-4 py-3">Paid</th>
                        <th scope="col" className="px-4 py-3">Outstanding</th>
                        <th scope="col" className="px-4 py-3">Due Date</th>
                        <th scope="col" className="px-4 py-3 text-center">Status</th>
                        <th scope="col" className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledger.invoices && ledger.invoices.map((inv) => {
                        const isFullyPaid = inv.status === 'PAID' || Number(inv.outstandingBalance) === 0;
                        const badgeClass = STATUS_BADGES[inv.status] || STATUS_BADGES.UNPAID;

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{inv.feeStructureName}</td>
                            <td className="px-4 py-3 text-slate-600">₹{Number(inv.grossAmount).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-emerald-600">₹{Number(inv.discount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">₹{Number(inv.netAmount).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-emerald-700 font-semibold">₹{Number(inv.amountPaid).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 font-extrabold text-rose-700">₹{Number(inv.outstandingBalance).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-slate-500">{inv.dueDate}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenPaymentModal(inv)}
                                disabled={isFullyPaid}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <CreditCard className="w-3 h-3" /> Collect Payment
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!ledger.invoices || ledger.invoices.length === 0) && (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                            No fee invoices generated for this student.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Payments Table */}
              {activeTab === 'payments' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                      <tr>
                        <th scope="col" className="px-4 py-3">Receipt / Ref #</th>
                        <th scope="col" className="px-4 py-3">Invoice #</th>
                        <th scope="col" className="px-4 py-3">Payment Date</th>
                        <th scope="col" className="px-4 py-3">Payment Method</th>
                        <th scope="col" className="px-4 py-3">Amount Collected</th>
                        <th scope="col" className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledger.payments && ledger.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-indigo-700">{p.referenceNumber || `RCP-${p.id}`}</td>
                          <td className="px-4 py-3 font-mono text-slate-700">{p.invoiceNumber}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {p.paymentDate ? p.paymentDate.substring(0, 10) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-extrabold text-emerald-700 text-sm">
                            ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{p.notes || '—'}</td>
                        </tr>
                      ))}
                      {(!ledger.payments || ledger.payments.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            No payment transactions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Collect Payment */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Collect Fee Payment</h3>
                    <p className="text-xs text-slate-500">Invoice: {selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invoice Breakdown Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Fee Category:</span>
                  <span className="font-semibold text-slate-900">{selectedInvoice.feeStructureName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Net Invoice Total:</span>
                  <span className="font-semibold text-slate-900">₹{Number(selectedInvoice.netAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Already Paid:</span>
                  <span className="font-semibold text-emerald-700">₹{Number(selectedInvoice.amountPaid).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold pt-1 border-t border-slate-200">
                  <span>Outstanding Balance:</span>
                  <span>₹{Number(selectedInvoice.outstandingBalance).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="paymentAmountInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Collection Amount (₹) *
                  </label>
                  <input
                    id="paymentAmountInput"
                    type="number"
                    step="0.01"
                    min="1"
                    max={selectedInvoice.outstandingBalance}
                    placeholder="Enter amount"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="paymentMethodSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethodSelect"
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NET_BANKING">Net Banking / NEFT</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentRefInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction / Reference Number
                  </label>
                  <input
                    id="paymentRefInput"
                    type="text"
                    placeholder="e.g. UPI-99882244, CHQ-1049"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="paymentNotesInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Notes / Remarks
                  </label>
                  <input
                    id="paymentNotesInput"
                    type="text"
                    placeholder="Optional collection notes"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {paymentMutation.isPending ? 'Processing...' : 'Process Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
