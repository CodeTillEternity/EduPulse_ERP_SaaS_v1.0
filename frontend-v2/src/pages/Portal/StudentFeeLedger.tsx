import React, { useState, useEffect } from 'react';
import { PageFrame } from '../../components/ui/PageFrame';
import {
  CheckCircle2,
  Clock,
  Download,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Receipt,
  Mail,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';

export interface FeeItemBreakdown {
  head: string;
  amount: number;
}

export interface StudentInvoice {
  invoiceNumber: string;
  title: string;
  term: string;
  totalAmount: number;
  amountInPaise: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidAt?: string;
  paymentReference?: string;
  breakdown: FeeItemBreakdown[];
}

const INITIAL_INVOICES: StudentInvoice[] = [
  {
    invoiceNumber: 'INV-2026-FALL-0842',
    title: 'Fall Semester 2026 — Tuition & Academic Fee',
    term: 'Fall 2026',
    totalAmount: 90000.0,
    amountInPaise: 9000000,
    status: 'PENDING',
    dueDate: 'Dec 15, 2026',
    breakdown: [
      { head: 'Academic Tuition Fee', amount: 75000.0 },
      { head: 'Institutional Development Fund', amount: 10000.0 },
      { head: 'Student Welfare & Library Access', amount: 5000.0 }
    ]
  },
  {
    invoiceNumber: 'INV-2026-LAB-0192',
    title: 'Advanced Distributed Systems — Special Lab Fee',
    term: 'Fall 2026',
    totalAmount: 15000.0,
    amountInPaise: 1500000,
    status: 'PENDING',
    dueDate: 'Dec 20, 2026',
    breakdown: [
      { head: 'GPU Cloud Cluster Allocation', amount: 10000.0 },
      { head: 'Hardware Embedded Lab Consumables', amount: 5000.0 }
    ]
  },
  {
    invoiceNumber: 'INV-2026-HOSTEL-0044',
    title: 'Hostel Accommodation & Campus Boarding Fee',
    term: 'Fall 2026',
    totalAmount: 45000.0,
    amountInPaise: 4500000,
    status: 'PAID',
    dueDate: 'Oct 01, 2026',
    paidAt: 'Oct 01, 2026',
    paymentReference: 'PAY_SETTLED_H982134',
    breakdown: [
      { head: 'Room Maintenance & Power Utility', amount: 30000.0 },
      { head: 'Campus Dining Services (Term 1)', amount: 15000.0 }
    ]
  }
];

export const StudentFeeLedger: React.FC = () => {
  const [invoices, setInvoices] = useState<StudentInvoice[]>(INITIAL_INVOICES);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceForManual, setSelectedInvoiceForManual] = useState<StudentInvoice | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>('BANK_WIRE');
  const [manualReference, setManualReference] = useState<string>('');

  // Fetch student invoices from backend if available
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/v1/finance/invoices', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setInvoices(data);
          }
        }
      } catch {
        // Fallback to seeded demo invoices
      }
    };
    fetchInvoices();
  }, []);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'PAID').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const outstandingBalance = invoices.filter(inv => inv.status !== 'PAID').reduce((acc, inv) => acc + inv.totalAmount, 0);

  const toggleExpand = (invoiceNumber: string) => {
    setExpandedInvoiceId(prev => prev === invoiceNumber ? null : invoiceNumber);
  };

  const handleOpenManualPayment = (invoice: StudentInvoice) => {
    setSelectedInvoiceForManual(invoice);
    setManualReference(`MAN-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForManual) return;

    const ref = manualReference.trim() || `MAN-${Date.now().toString().slice(-6)}`;
    const invoiceNum = selectedInvoiceForManual.invoiceNumber;

    setInvoices(prev =>
      prev.map(inv => {
        if (inv.invoiceNumber === invoiceNum) {
          return {
            ...inv,
            status: 'PAID',
            paidAt: 'Just now',
            paymentReference: ref
          };
        }
        return inv;
      })
    );

    toast.success(`Manual payment recorded! Invoice ${invoiceNum} marked as PAID. Ref: ${ref}`);
    setSelectedInvoiceForManual(null);
  };

  const handleSendReminder = (invoice: StudentInvoice) => {
    toast.success(`Payment reminder email sent to student guardian for ${invoice.invoiceNumber}.`);
  };

  const downloadReceipt = (invoice: StudentInvoice) => {
    toast.success(`Tax invoice & official receipt for ${invoice.invoiceNumber} downloaded.`);
  };

  return (
    <PageFrame
      title="Student Tuition & Fee Ledger"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Finance', href: '/dashboard/finance' },
        { label: 'Tuition Fee Ledger' }
      ]}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Academic Year 2026-2027</span>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Profile Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-semibold">
                Student ID: STU-2026-0842
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Aarav Sharma — Student Fee Account
            </h2>
            <p className="text-xs text-slate-600">
              Program: <strong className="text-slate-900">B.Tech Computer Science (2024-2028)</strong> • Section: <span className="font-mono text-indigo-600 font-semibold">CS-Fall-2026-A</span>
            </p>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoiced</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₹{totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">3 Institutional Vouchers</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Outstanding Balance</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                ₹{outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-amber-600 mt-1">Pending Clearance</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Settled & Paid</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-600 mt-1">Reconciled Payments</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Invoice Ledger Vouchers Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Academic Vouchers & Fee Invoices</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.map(invoice => {
              const isExpanded = expandedInvoiceId === invoice.invoiceNumber;
              const isPaid = invoice.status === 'PAID';

              return (
                <div key={invoice.invoiceNumber} className="transition-colors hover:bg-slate-50/50">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Invoice Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {invoice.invoiceNumber}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          {invoice.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{invoice.title}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>Term: <strong className="text-slate-700">{invoice.term}</strong></span>
                        <span>Due: <strong className="text-slate-700">{invoice.dueDate}</strong></span>
                        {invoice.paymentReference && (
                          <span>Ref: <strong className="font-mono text-indigo-600">{invoice.paymentReference}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount & Administrative Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-base font-bold text-slate-900">
                          ₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <button
                          data-testid="toggle-breakdown-btn"
                          onClick={() => toggleExpand(invoice.invoiceNumber)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 justify-end mt-0.5"
                        >
                          <span>Breakdown</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPaid ? (
                          <button
                            onClick={() => downloadReceipt(invoice)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          /* Admin Action Group: Record Manual Payment + Send Reminder */
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenManualPayment(invoice)}
                              data-testid={`manual-pay-${invoice.invoiceNumber}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Record Manual Payment</span>
                            </button>
                            <button
                              onClick={() => handleSendReminder(invoice)}
                              data-testid={`send-reminder-${invoice.invoiceNumber}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>Send Reminder</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Collapsible Fee Breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 bg-slate-50/70 border-t border-slate-100 text-xs">
                      <div className="max-w-md space-y-2 py-2">
                        <div className="font-semibold text-slate-700 pb-1 border-b border-slate-200">
                          Institutional Fee Head Itemization:
                        </div>
                        {invoice.breakdown.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600">
                            <span>{item.head}</span>
                            <span className="font-mono font-medium text-slate-900">
                              ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Record Manual Payment Dialog Modal */}
      <Dialog
        open={selectedInvoiceForManual !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoiceForManual(null);
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
            <DialogDescription>
              Record offline cash, cheque, or bank wire payment for {selectedInvoiceForManual?.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoiceForManual && (
            <form onSubmit={handleConfirmManualPayment} className="space-y-4 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedInvoiceForManual.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Payable Amount:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{selectedInvoiceForManual.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="BANK_WIRE">Bank Wire / NEFT / RTGS</option>
                  <option value="CASH">Cash Deposit</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                  <option value="POS">Campus POS Machine</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Receipt / Transaction Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-202611-98213 or CHQ-00291"
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForManual(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="confirm-manual-payment"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  Confirm Manual Payment
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
};

export default StudentFeeLedger;
