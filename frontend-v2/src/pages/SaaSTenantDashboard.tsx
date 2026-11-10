import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { apiClient } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Building2,
  ShieldCheck,
  Ban,
  Clock,
  Search,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';

export interface TenantRegistryRecord {
  tenantId: string;
  institutionName: string;
  subdomain: string;
  subscriptionTier: string;
  accountStatus: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | string;
  trialEndDate?: string;
  databaseRoutingKey?: string;
  databaseMode?: string;
  adminEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SaaSTenantDashboard() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'institutionName', desc: false }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');

  // 1. Fetch all tenants from the Central SaaS Control Plane
  const {
    data: tenants = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<TenantRegistryRecord[]>({
    queryKey: ['saas-tenants'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/saas/admin/tenants');
      return res.data?.data || res.data || [];
    },
  });

  // 2. Transition Tenant Status (ACTIVE <-> SUSPENDED)
  const statusMutation = useMutation({
    mutationFn: async ({ tenantId, newStatus }: { tenantId: string; newStatus: 'ACTIVE' | 'SUSPENDED' }) => {
      const res = await apiClient.patch(`/api/v1/saas/admin/tenants/${tenantId}/status`, {
        accountStatus: newStatus,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saas-tenants'] });
      if (variables.newStatus === 'SUSPENDED') {
        toast.error(`Institution ${variables.tenantId} has been SUSPENDED. All API access blocked.`);
      } else {
        toast.success(`Institution ${variables.tenantId} is now ACTIVE.`);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update tenant account status');
    },
  });

  // 3. Provision New Institution
  const provisionMutation = useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      const res = await apiClient.post('/api/v1/saas/admin/tenants/provision', { name, email });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas-tenants'] });
      setIsProvisionModalOpen(false);
      setProvisionName('');
      setProvisionEmail('');
      toast.success('New institution successfully provisioned with 14-day trial and initial SUPERADMIN user!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to provision institution');
    },
  });

  // Filter dataset by status tab
  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return tenants;
    return tenants.filter((t) => t.accountStatus === statusFilter);
  }, [tenants, statusFilter]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<TenantRegistryRecord>[]>(
    () => [
      {
        accessorKey: 'institutionName',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Institution Name
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{tenant.institutionName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {tenant.tenantId}
                  </span>
                  {tenant.adminEmail && (
                    <span className="text-[11px] text-slate-400">· {tenant.adminEmail}</span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'subdomain',
        header: 'Subdomain / Host',
        cell: ({ getValue }) => {
          const subdomain = getValue<string>();
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50/80 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                {subdomain || 'default'}
              </span>
              <a
                href={`https://${subdomain || 'default'}.edupulse.com`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                title={`Open https://${subdomain}.edupulse.com`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        },
      },
      {
        accessorKey: 'subscriptionTier',
        header: 'Tier',
        cell: ({ getValue }) => {
          const tier = getValue<string>() || 'TRIAL';
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
              {tier}
            </span>
          );
        },
      },
      {
        accessorKey: 'accountStatus',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
          >
            Account Status
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const status = getValue<string>() || 'TRIAL';
          if (status === 'SUSPENDED') {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <Ban className="w-3.5 h-3.5" /> SUSPENDED
              </span>
            );
          }
          if (status === 'ACTIVE') {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="w-3.5 h-3.5" /> TRIAL
            </span>
          );
        },
      },
      {
        accessorKey: 'trialEndDate',
        header: 'Trial Remaining',
        cell: ({ getValue }) => {
          const dateVal = getValue<string>();
          if (!dateVal) {
            return <span className="text-xs text-slate-400 font-medium">No trial limit</span>;
          }

          const end = new Date(dateVal);
          const now = new Date();
          const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays <= 0) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" /> Expired
              </span>
            );
          }
          if (diffDays <= 3) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" /> {diffDays} {diffDays === 1 ? 'day' : 'days'} left
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" /> {diffDays} days left
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="text-right block">Administrative Control</span>,
        cell: ({ row }) => {
          const tenant = row.original;
          const isSuspended = tenant.accountStatus === 'SUSPENDED';
          const isMutating = statusMutation.isPending && statusMutation.variables?.tenantId === tenant.tenantId;

          return (
            <div className="flex items-center justify-end gap-2">
              {isSuspended ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => statusMutation.mutate({ tenantId: tenant.tenantId, newStatus: 'ACTIVE' })}
                  className="h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-bold gap-1 rounded-lg shadow-sm"
                >
                  {isMutating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Restore Access
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => statusMutation.mutate({ tenantId: tenant.tenantId, newStatus: 'SUSPENDED' })}
                  className="h-8 border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-xs font-bold gap-1 rounded-lg shadow-sm"
                >
                  {isMutating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                  Suspend Tenant
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [statusMutation]
  );

  const table = useReactTable({
    data: filteredData,
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
  });

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionName.trim() || !provisionEmail.trim()) {
      toast.error('Institution name and administrator email are required');
      return;
    }
    provisionMutation.mutate({
      name: provisionName.trim(),
      email: provisionEmail.trim(),
    });
  };

  const activeCount = tenants.filter((t) => t.accountStatus === 'ACTIVE').length;
  const trialCount = tenants.filter((t) => t.accountStatus === 'TRIAL').length;
  const suspendedCount = tenants.filter((t) => t.accountStatus === 'SUSPENDED').length;

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-8 space-y-6">
      {/* Top Banner & Control Plane Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">SaaS Central Control Plane</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Founder Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-tenant architecture governance, subdomain routing, and real-time suspension enforcement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-10 text-xs font-semibold gap-1.5 rounded-xl border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsProvisionModalOpen(true)}
            className="h-10 text-xs font-bold gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            Provision Institution
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{tenants.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">All tenant namespaces</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Active Trials
          </p>
          <p className="text-2xl font-black text-amber-900 mt-1">{trialCount}</p>
          <span className="text-[11px] text-amber-700/80 font-medium">14-day evaluation window</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Active Paid / Live
          </p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{activeCount}</p>
          <span className="text-[11px] text-emerald-700/80 font-medium">Unrestricted institutional access</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" /> Suspended Accounts
          </p>
          <p className="text-2xl font-black text-rose-900 mt-1">{suspendedCount}</p>
          <span className="text-[11px] text-rose-700/80 font-medium">Backend API traffic blocked</span>
        </div>
      </div>

      {/* Controls: Search & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {(['ALL', 'TRIAL', 'ACTIVE', 'SUSPENDED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search institution, subdomain, or ID..."
            className="h-9 pl-9 text-xs bg-slate-50 border-slate-200 rounded-xl w-full"
          />
        </div>
      </div>

      {/* TanStack Table Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200/80 bg-slate-50/70">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <p className="text-xs font-semibold">Loading Central Tenant Registry...</p>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No institutions matched your filter</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.original.accountStatus === 'SUSPENDED' ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Provision New Institution</h3>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Institution Name
                </label>
                <Input
                  value={provisionName}
                  onChange={(e) => setProvisionName(e.target.value)}
                  placeholder="e.g. Stanford University or Delhi Public School"
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Administrator Email
                </label>
                <Input
                  type="email"
                  value={provisionEmail}
                  onChange={(e) => setProvisionEmail(e.target.value)}
                  placeholder="e.g. principal@school.edu"
                  required
                  className="h-10 text-xs rounded-xl"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  An initial SUPERADMIN credential will be seeded and bound to this tenant namespace.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="text-xs font-bold h-10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={provisionMutation.isPending}
                  className="text-xs font-bold h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {provisionMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Provisioning Namespace...
                    </>
                  ) : (
                    'Confirm Provisioning'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
