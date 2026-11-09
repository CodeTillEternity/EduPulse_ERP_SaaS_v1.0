import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DollarSign,
  Plus,
  FileText,
  Layers,
  Send,
  Trash2,
  Calendar,
  Building2,
  Tag,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  getFeeHeads,
  createFeeHead,
  getFeeStructures,
  createFeeStructure,
  generateInvoicesForBatch,
} from '../../api/financeService';
import FeeInvoiceList from '../../components/FeeInvoiceList';

export default function FeeManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('structures'); // 'structures' | 'heads'

  // Modal Visibility States
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Fee Head Form State
  const [headForm, setHeadForm] = useState({
    name: '',
    description: '',
    active: true,
  });

  // Fee Structure Form State
  const [structureForm, setStructureForm] = useState({
    name: '',
    batchId: 1,
    items: [{ feeHeadId: '', amount: '' }],
  });

  // Generate Invoices Form State
  const [generateForm, setGenerateForm] = useState({
    batchId: 1,
    feeStructureId: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discount: '0',
  });

  // Queries
  const { data: feeHeads = [], isLoading: isHeadsLoading } = useQuery({
    queryKey: ['feeHeads'],
    queryFn: getFeeHeads,
  });

  const { data: feeStructures = [], isLoading: isStructuresLoading } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: getFeeStructures,
  });

  // Mutations
  const createHeadMutation = useMutation({
    mutationFn: (data) => createFeeHead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeHeads'] });
      toast.success('Fee Head created successfully!');
      setShowHeadModal(false);
      setHeadForm({ name: '', description: '', active: true });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create fee head';
      toast.error(msg);
    },
  });

  const createStructureMutation = useMutation({
    mutationFn: (data) => createFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      toast.success('Fee Structure blueprint configured successfully!');
      setShowStructureModal(false);
      setStructureForm({
        name: '',
        batchId: 1,
        items: [{ feeHeadId: '', amount: '' }],
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create fee structure';
      toast.error(msg);
    },
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: (data) => generateInvoicesForBatch(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      toast.success(`Successfully generated ${data?.length || 'batch'} student invoices!`);
      setShowGenerateModal(false);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to generate batch invoices';
      toast.error(msg);
    },
  });

  // Structure dynamic line items helpers
  const handleAddItem = () => {
    setStructureForm((prev) => ({
      ...prev,
      items: [...prev.items, { feeHeadId: '', amount: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (structureForm.items.length <= 1) return;
    setStructureForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setStructureForm((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const calculatedTotal = structureForm.items.reduce((sum, item) => {
    const val = parseFloat(item.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Form Submissions
  const handleHeadSubmit = (e) => {
    e.preventDefault();
    if (!headForm.name.trim()) {
      toast.error('Fee head name is required');
      return;
    }
    createHeadMutation.mutate(headForm);
  };

  const handleStructureSubmit = (e) => {
    e.preventDefault();
    if (!structureForm.name.trim()) {
      toast.error('Fee structure name is required');
      return;
    }
    const validItems = structureForm.items.filter(
      (item) => item.feeHeadId && parseFloat(item.amount) > 0
    );
    if (validItems.length === 0) {
      toast.error('Please add at least one line item with a valid fee head and amount');
      return;
    }

    createStructureMutation.mutate({
      name: structureForm.name.trim(),
      batchId: Number(structureForm.batchId),
      items: validItems.map((item) => ({
        feeHeadId: Number(item.feeHeadId),
        amount: parseFloat(item.amount),
      })),
    });
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!generateForm.feeStructureId) {
      toast.error('Please select an active Fee Structure blueprint');
      return;
    }

    generateInvoicesMutation.mutate({
      batchId: Number(generateForm.batchId),
      feeStructureId: Number(generateForm.feeStructureId),
      dueDate: generateForm.dueDate,
      discount: parseFloat(generateForm.discount) || 0,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <DollarSign className="w-3.5 h-3.5" /> Institutional Finance &amp; Student Invoicing
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fee Management &amp; Invoicing
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Define fee ledger categories, construct cohort fee blueprints, and trigger automated student invoicing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowHeadModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-slate-500" /> New Fee Head
            </button>
            <button
              type="button"
              onClick={() => setShowStructureModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Layers className="w-4 h-4" /> Create Fee Structure
            </button>
            <button
              type="button"
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Send className="w-4 h-4" /> Generate Invoices
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('structures')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'structures'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Fee Structures ({feeStructures.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('heads')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'heads'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Fee Heads ({feeHeads.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Student Invoices
          </button>
        </div>

        {/* Tab 1: Fee Structures Blueprint List */}
        {activeTab === 'structures' && (
          <div className="space-y-4">
            {isStructuresLoading ? (
              <div className="py-12 text-center text-xs text-slate-500 font-medium">
                Loading fee structures...
              </div>
            ) : feeStructures.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <Layers className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5] mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Fee Structures Configured</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Construct your first fee structure blueprint to define tuition, lab, and examination fee schedules for a cohort.
                </p>
                <button
                  type="button"
                  onClick={() => setShowStructureModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create Fee Structure
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {feeStructures.map((structure) => (
                  <div
                    key={structure.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between hover:border-indigo-200 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold font-mono uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/50">
                          {structure.batchName || 'Academic Batch'}
                        </span>
                        <span className="text-lg font-extrabold text-slate-900">
                          ₹{Number(structure.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1">{structure.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Batch Blueprint &bull; {structure.items?.length || 0} Line Items
                      </p>

                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        {structure.items && structure.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs text-slate-600">
                            <span>{item.feeHeadName || `Head #${item.feeHeadId}`}</span>
                            <span className="font-semibold text-slate-800">
                              ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setGenerateForm((prev) => ({
                            ...prev,
                            batchId: structure.batchId || 1,
                            feeStructureId: structure.id,
                          }));
                          setShowGenerateModal(true);
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> Generate Invoices for Batch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fee Heads Table */}
        {activeTab === 'heads' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Configured Fee Heads</h2>
                <p className="text-xs text-slate-500">Categories used to define ledger fee line items</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHeadModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Fee Head
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-4 py-3">#</th>
                    <th scope="col" className="px-4 py-3">Category Name</th>
                    <th scope="col" className="px-4 py-3">Description</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feeHeads.map((head, idx) => (
                    <tr key={head.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{head.name}</td>
                      <td className="px-4 py-3 text-slate-500">{head.description || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {head.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {feeHeads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        No fee heads created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Student Invoices Enterprise Data Grid */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <FeeInvoiceList />
          </div>
        )}

        {/* Modal: New Fee Head */}
        {showHeadModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Define New Fee Head</h3>
                    <p className="text-xs text-slate-500">Add a new fee category (e.g. Tuition, Lab Fee)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHeadModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleHeadSubmit} className="space-y-4">
                <div>
                  <label htmlFor="feeHeadNameInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Fee Head Name *
                  </label>
                  <input
                    id="feeHeadNameInput"
                    type="text"
                    placeholder="e.g. Tuition Fee, Hostel Fee"
                    value={headForm.name}
                    onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="feeHeadDescInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    id="feeHeadDescInput"
                    type="text"
                    placeholder="Brief description of the fee category"
                    value={headForm.description}
                    onChange={(e) => setHeadForm({ ...headForm, description: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowHeadModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createHeadMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {createHeadMutation.isPending ? 'Saving...' : 'Save Fee Head'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Fee Structure */}
        {showStructureModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Construct Fee Structure</h3>
                    <p className="text-xs text-slate-500">Configure batch line items and total charges</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleStructureSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="structureNameInput" className="block text-xs font-semibold text-slate-700 mb-1">
                      Structure Name *
                    </label>
                    <input
                      id="structureNameInput"
                      type="text"
                      placeholder="e.g. CS 2026 Annual Fee"
                      value={structureForm.name}
                      onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="structureBatchSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Batch *
                    </label>
                    <select
                      id="structureBatchSelect"
                      value={structureForm.batchId}
                      onChange={(e) => setStructureForm({ ...structureForm, batchId: Number(e.target.value) })}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value={1}>Batch 1 (CS 2026-A)</option>
                      <option value={2}>Batch 2 (EE 2026-B)</option>
                      <option value={3}>Batch 3 (ME 2026-C)</option>
                      <option value={4}>Batch 4 (CS 2027)</option>
                    </select>
                  </div>
                </div>

                {/* Line Items List */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Fee Breakdown Line Items</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>

                  {structureForm.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        aria-label={`Fee Head Item ${idx + 1}`}
                        value={item.feeHeadId}
                        onChange={(e) => handleItemChange(idx, 'feeHeadId', e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        required
                      >
                        <option value="">-- Select Fee Head --</option>
                        {feeHeads.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                        {feeHeads.length === 0 && (
                          <option value="1">Tuition Fee (Default)</option>
                        )}
                      </select>

                      <div className="w-32 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          aria-label={`Amount Item ${idx + 1}`}
                          placeholder="Amount"
                          min="1"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                          className="w-full pl-6 pr-2 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={structureForm.items.length <= 1}
                        className="text-slate-400 hover:text-rose-600 p-1 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Calculated Total preview */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-bold text-slate-800">
                    <span>Total Computed Fee:</span>
                    <span className="text-sm font-extrabold text-indigo-700 font-mono">
                      ₹{calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowStructureModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createStructureMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {createStructureMutation.isPending ? 'Saving...' : 'Save Structure'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Generate Invoices for Batch */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Generate Invoices for Batch</h3>
                    <p className="text-xs text-slate-500">Automate assessment generation for all active students</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleGenerateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="invoiceBatchSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Target Batch *
                  </label>
                  <select
                    id="invoiceBatchSelect"
                    value={generateForm.batchId}
                    onChange={(e) => setGenerateForm({ ...generateForm, batchId: Number(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={1}>Batch 1 (CS 2026-A)</option>
                    <option value={2}>Batch 2 (EE 2026-B)</option>
                    <option value={3}>Batch 3 (ME 2026-C)</option>
                    <option value={4}>Batch 4 (CS 2027)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="invoiceStructureSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Fee Structure Blueprint *
                  </label>
                  <select
                    id="invoiceStructureSelect"
                    value={generateForm.feeStructureId}
                    onChange={(e) => setGenerateForm({ ...generateForm, feeStructureId: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Choose Fee Structure --</option>
                    {feeStructures.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - ₹{Number(s.totalAmount).toLocaleString('en-IN')} ({s.batchName || `Batch ${s.batchId}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="invoiceDueDateInput" className="block text-xs font-semibold text-slate-700 mb-1">
                      Due Date *
                    </label>
                    <input
                      id="invoiceDueDateInput"
                      type="date"
                      value={generateForm.dueDate}
                      onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="invoiceDiscountInput" className="block text-xs font-semibold text-slate-700 mb-1">
                      Batch Discount (₹)
                    </label>
                    <input
                      id="invoiceDiscountInput"
                      type="number"
                      min="0"
                      step="0.01"
                      value={generateForm.discount}
                      onChange={(e) => setGenerateForm({ ...generateForm, discount: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generateInvoicesMutation.isPending}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {generateInvoicesMutation.isPending ? 'Generating...' : 'Generate Invoices Now'}
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
