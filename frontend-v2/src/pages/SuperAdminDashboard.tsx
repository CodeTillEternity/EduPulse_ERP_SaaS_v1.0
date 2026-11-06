import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Ban, 
  Filter,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export interface SaaSAdminTenant {
  tenantId: string;
  institutionName: string;
  adminEmail: string;
  status: 'REGISTERED' | 'PROVISIONING' | 'TRIAL_ACTIVE' | 'ACTIVE' | 'READ_ONLY_GRACE' | 'SUSPENDED' | 'PENDING_DELETION' | 'DELETED' | string;
  databaseMode: string;
  trialEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SuperAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: tenantsResponse, isLoading, error, refetch, isFetching } = useQuery<{
    success: boolean;
    data: SaaSAdminTenant[];
  }>({
    queryKey: ['super-admin-tenants'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/saas/admin/tenants');
      return res.data;
    },
  });

  const tenants: SaaSAdminTenant[] = tenantsResponse?.data || [];

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.tenantId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE' || t.status === 'TRIAL_ACTIVE').length;
  const graceTenants = tenants.filter((t) => t.status === 'READ_ONLY_GRACE').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'SUSPENDED' || t.status === 'PENDING_DELETION').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TRIAL_ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Clock className="w-3 h-3" /> Trial Active
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        );
      case 'READ_ONLY_GRACE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3" /> Read-Only Grace
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Ban className="w-3 h-3" /> Suspended
          </span>
        );
      case 'PENDING_DELETION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
            <Ban className="w-3 h-3" /> Pending Deletion
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" /> SaaS Control Plane
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Super Admin Tenant Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global governance of registered institutions, database partitions, and subscription lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Institutions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalTenants}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active / In Trial</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{activeTenants}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Grace Period</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{graceTenants}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Suspended / Deletion</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{suspendedTenants}</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Ban className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by institution name, tenant ID, or admin email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="TRIAL_ACTIVE">Trial Active</option>
            <option value="ACTIVE">Active</option>
            <option value="READ_ONLY_GRACE">Read-Only Grace</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_DELETION">Pending Deletion</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              Loading SaaS tenant partitions...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600 space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto" />
              <p className="font-semibold">Failed to load tenant registry</p>
              <p className="text-xs text-slate-500">Ensure your session has SUPER_ADMIN permissions.</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-medium text-slate-700">No institutions found matching criteria</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Institution Name</th>
                  <th className="px-6 py-3.5 font-semibold">Tenant ID</th>
                  <th className="px-6 py-3.5 font-semibold">Admin Email</th>
                  <th className="px-6 py-3.5 font-semibold">Database Mode</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Trial End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      {tenant.institutionName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {tenant.tenantId}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {tenant.adminEmail || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        <Database className="w-3 h-3 text-slate-500" />
                        {tenant.databaseMode || 'SHARED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {tenant.trialEndDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(tenant.trialEndDate).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
