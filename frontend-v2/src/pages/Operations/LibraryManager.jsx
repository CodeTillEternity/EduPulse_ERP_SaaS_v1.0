import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BookOpen,
  BookMarked,
  Plus,
  Search,
  RotateCcw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Hash,
  X,
  BookmarkCheck,
  Library,
} from 'lucide-react';
import {
  getBooks,
  addBook,
  getActiveIssues,
  issueBook,
  returnBook,
} from '../../api/enterpriseOpsService';

const EMPTY_ARRAY = [];

export default function LibraryManager() {
  const queryClient = useQueryClient();

  // Active Tab: 'inventory' | 'circulation'
  const [activeTab, setActiveTab] = useState('inventory');

  // Search filter for inventory
  const [searchQuery, setSearchQuery] = useState('');

  // Add Book Modal state
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 5,
  });

  // Issue Book Form state
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
  });

  // ==========================================
  // DATA QUERIES
  // ==========================================

  const {
    data: books = EMPTY_ARRAY,
    isLoading: isLoadingBooks,
    isError: isErrorBooks,
  } = useQuery({
    queryKey: ['libraryBooks'],
    queryFn: getBooks,
  });

  const {
    data: activeIssues = EMPTY_ARRAY,
    isLoading: isLoadingIssues,
  } = useQuery({
    queryKey: ['libraryIssues'],
    queryFn: getActiveIssues,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  const addBookMutation = useMutation({
    mutationFn: addBook,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      toast.success(`Book "${data.title}" added to inventory successfully!`);
      setIsAddBookModalOpen(false);
      setNewBookForm({ title: '', author: '', isbn: '', totalCopies: 5 });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to catalog book';
      toast.error(msg);
    },
  });

  const issueBookMutation = useMutation({
    mutationFn: issueBook,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['libraryIssues'] });
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      toast.success(`Book issued successfully! Due date: ${data.dueDate}`);
      setIssueForm({ bookId: '', studentId: '' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to issue book';
      toast.error(msg);
    },
  });

  const returnBookMutation = useMutation({
    mutationFn: returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryIssues'] });
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      toast.success('Book returned successfully and inventory updated!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to process book return';
      toast.error(msg);
    },
  });

  // ==========================================
  // DERIVED STATE & METRICS
  // ==========================================

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  const totalTitlesCount = books.length;
  const totalVolumeCopies = useMemo(
    () => books.reduce((sum, b) => sum + (Number(b.totalCopies) || 0), 0),
    [books]
  );
  const totalAvailableCopies = useMemo(
    () => books.reduce((sum, b) => sum + (Number(b.availableCopies) || 0), 0),
    [books]
  );
  const activeCirculationCount = activeIssues.length;

  // Handler to quickly jump from inventory to issue form
  const handleQuickIssue = (bookId) => {
    setIssueForm((prev) => ({ ...prev, bookId: String(bookId) }));
    setActiveTab('circulation');
  };

  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    if (!newBookForm.title.trim() || !newBookForm.author.trim() || !newBookForm.isbn.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    addBookMutation.mutate({
      title: newBookForm.title.trim(),
      author: newBookForm.author.trim(),
      isbn: newBookForm.isbn.trim(),
      totalCopies: Number(newBookForm.totalCopies),
    });
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.bookId || !issueForm.studentId) {
      toast.error('Please select a book and specify the student ID');
      return;
    }
    issueBookMutation.mutate({
      bookId: Number(issueForm.bookId),
      studentId: Number(issueForm.studentId),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library & Resource Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Catalog asset tracking, automated circulation, and multi-tenant student lending management.
            </p>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Inventory ({totalTitlesCount})
          </button>
          <button
            onClick={() => setActiveTab('circulation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'circulation'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Circulation ({activeCirculationCount})
          </button>
        </div>
      </div>

      {/* KPI Metrics Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catalog Titles</p>
            <p className="text-2xl font-bold text-slate-900">{totalTitlesCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Volume</p>
            <p className="text-2xl font-bold text-slate-900">{totalVolumeCopies} Copies</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Available on Shelf</p>
            <p className="text-2xl font-bold text-emerald-600">{totalAvailableCopies} Copies</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Loans</p>
            <p className="text-2xl font-bold text-amber-600">{activeCirculationCount} Borrowed</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVENTORY TAB                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by title, author, or ISBN..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setIsAddBookModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Book Asset
            </button>
          </div>

          {/* Catalog Inventory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Book Title & Details</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">ISBN</th>
                    <th className="py-3.5 px-4 text-center">Total Copies</th>
                    <th className="py-3.5 px-4 text-center">Available</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoadingBooks ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2" />
                        Loading catalog inventory...
                      </td>
                    </tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No books found in catalog. Click "Add Book Asset" to register your first volume.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => {
                      const isAvailable = (book.availableCopies || 0) > 0;
                      return (
                        <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{book.title}</p>
                                <p className="text-xs text-slate-500">ID: #{book.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{book.author}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{book.isbn}</td>
                          <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                            {book.totalCopies}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              {book.availableCopies} available
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              disabled={!isAvailable}
                              onClick={() => handleQuickIssue(book.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isAvailable
                                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              Issue Copy
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CIRCULATION TAB                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'circulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Book Form Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Issue Book to Student</h2>
                <p className="text-xs text-slate-500">Record a loan with a 14-day return window</p>
              </div>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Book Volume
                </label>
                <select
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">-- Choose a Catalog Book --</option>
                  {books.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.availableCopies <= 0}
                    >
                      {b.title} ({b.availableCopies} avail / ISBN: {b.isbn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Database ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Student ID (e.g. 1)"
                    value={issueForm.studentId}
                    onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Default circulation loan term is <strong>14 days</strong> from issuance date.</span>
              </div>

              <button
                type="submit"
                disabled={issueBookMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {issueBookMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Recording Issue...
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Confirm Book Issue
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Loans Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Lending Circulation</h2>
                <p className="text-xs text-slate-500">Currently borrowed books awaiting return</p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full border border-indigo-200">
                {activeIssues.length} Active Loans
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Book Title</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoadingIssues ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2" />
                        Loading active circulation loans...
                      </td>
                    </tr>
                  ) : activeIssues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                        No active loans. All library volumes are accounted for on shelves.
                      </td>
                    </tr>
                  ) : (
                    activeIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>
                            <p className="font-semibold text-slate-900">{issue.bookTitle || `Book #${issue.bookId}`}</p>
                            <p className="text-xs font-mono text-slate-500">{issue.isbn}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div>
                            <p className="font-medium text-slate-900">{issue.studentName || `Student #${issue.studentId}`}</p>
                            {issue.enrollmentNumber && (
                              <p className="text-xs font-mono text-slate-500">{issue.enrollmentNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">{issue.issueDate}</td>
                        <td className="py-3.5 px-4 text-slate-900 font-medium text-xs">
                          {issue.dueDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {issue.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            disabled={returnBookMutation.isPending}
                            onClick={() => returnBookMutation.mutate(issue.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Return Book
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

      {/* ========================================================================= */}
      {/* MODAL: ADD BOOK ASSET                                                     */}
      {/* ========================================================================= */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Catalog New Book</h3>
              </div>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Author / Authors *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas H. Cormen"
                  value={newBookForm.author}
                  onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="978-0262033848"
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBookForm.totalCopies}
                    onChange={(e) => setNewBookForm({ ...newBookForm, totalCopies: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addBookMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {addBookMutation.isPending ? 'Cataloging...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
