import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { getInvoices } from '../api/financeService';
import { Input } from './ui/input';
import {
  Search,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Printer,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export interface FeeInvoiceItem {
  id: number;
  invoiceNumber: string;
  studentId: number;
  studentName: string;
  studentEnrollmentNumber: string;
  feeStructureId: number;
  feeStructureName: string;
  grossAmount: number | string;
  discount: number | string;
  netAmount: number | string;
  amountPaid: number | string;
  outstandingBalance: number | string;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  createdAt: string;
}

function formatINR(val: any): string {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(val: any): string {
  if (!val) return '—';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d] = val;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
}

function InvoiceStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Paid
        </span>
      );
    case 'PARTIAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          <Clock className="w-3 h-3 mr-1 text-amber-600" /> Partial
        </span>
      );
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
          <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" /> Overdue
        </span>
      );
    case 'UNPAID':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <XCircle className="w-3 h-3 mr-1 text-slate-500" /> Unpaid
        </span>
      );
  }
}

export function FeeInvoiceList() {
  // Server-side state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [serverSearch, setServerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(serverSearch);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [serverSearch]);

  const sortBy = sorting.length > 0 ? sorting[0].id : 'createdAt';
  const sortDir = sorting.length > 0 && sorting[0].desc ? 'desc' : 'asc';

  // Server Query
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['fee-invoices', page, size, debouncedSearch, statusFilter, sortBy, sortDir],
    queryFn: () =>
      getInvoices({
        page,
        size,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortDir,
      }),
  });

  const invoices = useMemo<FeeInvoiceItem[]>(() => {
    const raw = data as any;
    if (Array.isArray(raw)) return raw;
    if (raw?.content && Array.isArray(raw.content)) return raw.content;
    return [];
  }, [data]);

  const rawData = data as any;
  const totalPages = rawData?.totalPages ?? 1;
  const totalElements = rawData?.totalElements ?? invoices.length;

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<FeeInvoiceItem>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        id: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ getValue }) => (
          <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-indigo-700">
            <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{String(getValue())}</span>
          </div>
        ),
      },
      {
        accessorKey: 'studentName',
        id: 'studentName',
        header: 'Student Name',
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div>
              <p className="font-semibold text-slate-900">{inv.studentName || 'Student #' + inv.studentId}</p>
              <p className="text-[11px] font-mono text-slate-500">{inv.studentEnrollmentNumber || '—'}</p>
            </div>
          );
        },
      },
      {
        accessorKey: 'feeStructureName',
        id: 'feeStructureName',
        header: 'Fee Structure',
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-700 font-medium truncate max-w-[160px] block">
            {String(getValue() || 'Tuition & Batch Fees')}
          </span>
        ),
      },
      {
        accessorKey: 'grossAmount',
        id: 'grossAmount',
        header: () => <span className="text-right block w-full">Gross</span>,
        cell: ({ getValue }) => (
          <div className="text-right font-mono tabular-nums text-xs font-semibold text-slate-900">
            {formatINR(getValue())}
          </div>
        ),
      },
      {
        accessorKey: 'discount',
        id: 'discount',
        header: () => <span className="text-right block w-full">Discount</span>,
        cell: ({ getValue }) => {
          const val = Number(getValue()) || 0;
          return (
            <div className="text-right font-mono tabular-nums text-xs text-emerald-600 font-medium">
              {val > 0 ? `-${formatINR(val)}` : '₹0.00'}
            </div>
          );
        },
      },
      {
        accessorKey: 'amountPaid',
        id: 'amountPaid',
        header: () => <span className="text-right block w-full">Paid</span>,
        cell: ({ getValue }) => (
          <div className="text-right font-mono tabular-nums text-xs font-semibold text-slate-800">
            {formatINR(getValue())}
          </div>
        ),
      },
      {
        accessorKey: 'outstandingBalance',
        id: 'outstandingBalance',
        header: () => <span className="text-right block w-full">Balance</span>,
        cell: ({ getValue }) => {
          const bal = Number(getValue()) || 0;
          return (
            <div
              className={`text-right font-mono tabular-nums text-xs font-bold ${
                bal > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatINR(bal)}
            </div>
          );
        },
      },
      {
        accessorKey: 'dueDate',
        id: 'dueDate',
        header: 'Due Date',
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-600 font-mono">{formatDate(getValue())}</span>
        ),
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: 'Status',
        cell: ({ getValue }) => <InvoiceStatusBadge status={String(getValue())} />,
      },
      {
        id: 'actions',
        header: () => <span className="text-right block w-full">Action</span>,
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex items-center justify-end space-x-1.5">
              <a
                href={`/api/v1/finance/invoices/${inv.id}/html`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-2xs transition-colors"
                title="View printable branded invoice"
              >
                <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Print
              </a>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="flex flex-col min-h-[520px] border border-slate-200 bg-white rounded-lg shadow-xs overflow-hidden">
      {/* Top Controls */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search invoices (ID, name)..."
              className="pl-9 h-8 text-xs bg-white border-slate-300 focus:ring-1 focus:ring-indigo-500"
              value={serverSearch}
              onChange={(e) => setServerSearch(e.target.value)}
            />
          </div>

          <div className="relative flex-1 md:max-w-xs">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Live filter visible rows..."
              className="pl-9 h-8 text-xs bg-white border-slate-300 focus:ring-1 focus:ring-indigo-500"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            className="bg-white border border-slate-300 text-xs rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNPAID">Unpaid</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <select
            className="bg-white border border-slate-300 text-xs rounded px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>

      {/* TanStack Table Data Grid */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left whitespace-nowrap border-collapse">
          <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider sticky top-0 backdrop-blur-xs z-10 shadow-2xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`px-3.5 py-2.5 border-r border-slate-200/60 select-none ${
                        canSort ? 'cursor-pointer hover:bg-slate-200/70 transition-colors' : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center justify-between space-x-1.5">
                        <span className="truncate">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {canSort && (
                          <span className="text-slate-400">
                            {isSorted === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-100 text-[13px]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-medium">Loading fee invoices...</p>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-red-500 text-xs font-medium">
                  Failed to load fee invoices from server.
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="even:bg-slate-50/50 hover:bg-indigo-50/40 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3.5 py-2.5 border-r border-slate-100/60">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-semibold text-sm">No invoices found</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Try adjusting your search criteria, live filters, or invoice status.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <p className="text-[11px] text-slate-600 uppercase tracking-wide">
            Showing <span className="font-bold text-slate-900">{invoices.length > 0 ? page * size + 1 : 0}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min((page + 1) * size, totalElements)}</span> of{' '}
            <span className="font-bold text-slate-900">{totalElements}</span> results
          </p>
          {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            className="p-1.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            onClick={() => setPage(0)}
            disabled={page === 0 || isLoading}
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center shadow-2xs"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </button>
          <div className="text-xs font-semibold text-slate-700 px-2.5">
            Page {page + 1} of {Math.max(1, totalPages)}
          </div>
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center shadow-2xs"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isLoading}
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </button>
          <button
            type="button"
            className="p-1.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            onClick={() => setPage(Math.max(0, totalPages - 1))}
            disabled={page >= totalPages - 1 || isLoading}
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeeInvoiceList;
