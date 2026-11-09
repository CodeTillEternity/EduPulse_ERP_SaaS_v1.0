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
import { Link } from 'react-router-dom';
import { apiClient } from '../config/api';
import { StudentAvatar } from './StudentAvatar';
import { StatusBadge } from './ui/StatusBadge';
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
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import type { PaginatedResponse, Student } from '../types/student';

function formatDateDisplay(val: any): string {
  if (!val) return 'N/A';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d] = val;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
}

interface StudentDirectoryProps {
  onSelectStudent?: (student: Student) => void;
}

export function StudentDirectory({ onSelectStudent }: StudentDirectoryProps) {
  // Server-side state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [serverSearch, setServerSearch] = useState('');
  const [debouncedServerSearch, setDebouncedServerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Client-side table state (React Table v8)
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Debounce server search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServerSearch(serverSearch);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [serverSearch]);

  // Derive sort params for backend query
  const backendSortBy = sorting.length > 0 ? sorting[0].id : 'id';
  const backendSortDir = sorting.length > 0 && sorting[0].desc ? 'desc' : 'asc';

  // Server Query
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['students-directory', page, size, debouncedServerSearch, statusFilter, backendSortBy, backendSortDir],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/students', {
        params: {
          page,
          size,
          search: debouncedServerSearch || undefined,
          status: statusFilter || undefined,
          sortBy: backendSortBy,
          sortDir: backendSortDir,
        },
      });
      return res.data?.data;
    },
  });

  const students = useMemo(() => (data as PaginatedResponse<Student>)?.content || [], [data]);
  const totalPages = (data as PaginatedResponse<Student>)?.totalPages || 0;
  const totalElements = (data as PaginatedResponse<Student>)?.totalElements || 0;

  // React Table Column Definitions
  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        accessorKey: 'firstName',
        id: 'student',
        header: 'Student (Internal ID)',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <div className="flex items-center space-x-3 py-1">
              <StudentAvatar
                studentId={student.id}
                firstName={student.firstName}
                lastName={student.lastName}
                sizeClassName="h-8 w-8 rounded-lg shadow-xs"
                textClassName="text-[11px] font-bold"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {student.firstName} {student.lastName}
                  </p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                    #{student.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enrolled {formatDateDisplay(student.enrollmentDate || student.createdAt)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'enrollmentNumber',
        id: 'enrollmentNumber',
        header: 'Enrollment No',
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? (
            <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/70 px-2 py-0.5 rounded">
              {val}
            </span>
          ) : (
            <span className="text-slate-400 italic text-xs">Pending Allocation</span>
          );
        },
      },
      {
        accessorKey: 'rollNumber',
        id: 'rollNumber',
        header: 'Roll Number',
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return (
            <span className="font-mono text-xs text-slate-700">
              {val || <span className="text-slate-400 italic">—</span>}
            </span>
          );
        },
      },
      {
        accessorKey: 'department',
        id: 'department',
        header: 'Department / Contact',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <div>
              <p className="text-slate-800 text-xs font-medium">{student.department || 'General'}</p>
              <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{student.email}</p>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as any} />,
      },
      {
        id: 'actions',
        header: () => <span className="text-right block w-full">Action</span>,
        cell: ({ row }) => {
          const student = row.original;
          return (
            <div className="flex items-center justify-end space-x-2">
              <Link
                to={`/dashboard/students/${student.id}`}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-2xs transition-colors"
                onClick={(e) => {
                  if (onSelectStudent) {
                    e.preventDefault();
                    onSelectStudent(student);
                  }
                }}
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                View
              </Link>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [onSelectStudent]
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: students,
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
      {/* Top Filter and Search Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Server-Side Deep Search */}
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Server search (name, email, ID)..."
              className="pl-9 h-8 text-xs bg-white border-slate-300 focus:ring-1 focus:ring-indigo-500"
              value={serverSearch}
              onChange={(e) => setServerSearch(e.target.value)}
            />
          </div>

          {/* Client-side Live Filter */}
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

        {/* Status Filter & Page Size */}
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
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="GRADUATED">Graduated</option>
            <option value="ALUMNI">Alumni</option>
            <option value="DROPPED">Dropped</option>
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
          {/* Sticky Header with Sort Indicators */}
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

          {/* Table Body with Alternating Rows and Hover States */}
          <tbody className="divide-y divide-slate-100 text-[13px]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-medium">Loading student directory...</p>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-red-500 text-xs font-medium">
                  Failed to load student directory from server.
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
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-semibold text-sm">No students found</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Try adjusting your search criteria, live filters, or status filter.
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
            Showing <span className="font-bold text-slate-900">{students.length > 0 ? page * size + 1 : 0}</span> to{' '}
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

export default StudentDirectory;
