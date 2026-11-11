import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { ShieldAlert, Users, Store, UserCheck, Loader2, Video, BookOpen, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import type { Student, PaginatedResponse } from '../types/student';
import { CardSkeleton, TableSkeleton, Skeleton } from '../components/ui/SkeletonLoader';

interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
}

interface Department {
  id: number;
  name: string;
  code: string;
}

interface Application {
  id: number;
  applicantName: string;
  status: string;
  appliedAt: string;
  programName: string;
}

export default function ManagementDashboard() {
  const { user } = useAuthStore();
  const role = user?.role || '';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN';

  const { data: usersData, isLoading: loadingUsers } = useQuery<UserDTO[]>({
    queryKey: ['dashboard-users'],
    enabled: isSuperAdmin,
    queryFn: async () => (await apiClient.get('/api/v1/admin/users')).data
  });

  const { data: departmentsData } = useQuery<Department[]>({
    queryKey: ['dashboard-depts'],
    queryFn: async () => (await apiClient.get('/api/v1/departments')).data
  });

  const { data: studentsData, isLoading: loadingStudents } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['dashboard-students'],
    queryFn: async () => (await apiClient.get('/api/v1/students', { params: { page: 0, size: 5 } })).data?.data
  });

  const { data: appsData, isLoading: loadingApps } = useQuery<Application[]>({
    queryKey: ['dashboard-apps'],
    enabled: isAdmin,
    queryFn: async () => (await apiClient.get('/api/v1/admission-applications')).data
  });

  const totalUsersCount = usersData ? usersData.length : null;
  const activeUsers = usersData ? usersData.filter(u => u.enabled).length : null;
  const lockedUsers = usersData ? usersData.filter(u => !u.enabled).length : null;
  const totalDepts = departmentsData?.length || 0;
  const totalStudents = studentsData?.totalElements || 0;
  const pendingApps = appsData?.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')?.length || 0;

  const adminName = user?.username || (isSuperAdmin ? 'Super Admin' : 'Admin');

  return (
    <PageFrame 
      title={`${isSuperAdmin ? "System Governance" : "Institutional Operations"} — Welcome, ${adminName}`} 
      description={isSuperAdmin ? "Monitor system health, access control, and master configuration." : "Overview of daily operations, admissions, and student activities."}
    >
      {(isSuperAdmin && loadingUsers) || (isAdmin && loadingStudents) ? (
        <CardSkeleton count={4} className="mb-8" />
      ) : (
        <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4 mb-8 bg-slate-200 border border-slate-200">
          {isSuperAdmin && (
            <>
              <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">System Users</h3>
                  <ShieldAlert className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">{totalUsersCount !== null ? totalUsersCount : '-'}</div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {activeUsers !== null && lockedUsers !== null ? `${activeUsers} active, ${lockedUsers} locked` : 'User status unavailable'}
                </p>
              </div>
              <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Departments</h3>
                  <Store className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">{departmentsData ? totalDepts : '-'}</div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Configured Academic Programs</p>
              </div>
            </>
          )}

          {isAdmin && (
            <>
              <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Students</h3>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">{studentsData ? totalStudents : '-'}</div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Enrolled across all programs</p>
              </div>
              <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Admissions</h3>
                  <UserCheck className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">{appsData ? pendingApps : '-'}</div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Requires review or verification</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Operational Ecosystem Quick Access (Video, Notion, Razorpay) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Integrated Learning & Billing Hub</h3>
              <p className="text-xs text-slate-400">Direct in-app access to virtual lectures, curriculum notes, and tuition collection.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/classroom"
            className="group p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Virtual Classroom</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native WebRTC video streams with isolated room generation and in-app chat.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
              <span>Launch Classroom</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/dashboard/materials"
            className="group p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Faculty Notes (Notion)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native Notion blocks, interactive code snippets, and checklists without redirects.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>Browse Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/dashboard/tuition-collection"
            className="group p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Tuition Ledger (B2C)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                In-app Razorpay modal overlay checkout with automatic webhook reconciliation.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
              <span>Open Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Recent Enrollments</h3>
            <Link to="/dashboard/students" className="text-xs font-semibold text-slate-500 hover:text-primary">View Directory &rarr;</Link>
          </div>
          
          {loadingStudents ? (
            <div className="border border-slate-200 bg-white divide-y divide-slate-100 p-3 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : studentsData?.content && studentsData.content.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
              {studentsData.content.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {s.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-[11px] font-medium text-slate-500">{s.rollNumber || 'Pending ID'}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
              No students found.
            </div>
          )}
        </div>

        {isSuperAdmin ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">System Access Log</h3>
            </div>
            {loadingUsers ? (
              <TableSkeleton rows={4} cols={2} />
            ) : usersData ? (
              <div className="border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">User</th>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersData.slice(0, 5).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2 py-1">{u.role.replace('ROLE_', '')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                Could not load access data.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Admissions Pipeline</h3>
              <Link to="/dashboard/admissions" className="text-xs font-semibold text-slate-500 hover:text-primary">Review Applications &rarr;</Link>
            </div>
            {loadingApps ? (
              <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : appsData && appsData.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
                {appsData.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 hover:bg-slate-50">
                    <div>
                      <span className="font-semibold text-slate-900 block text-sm">{a.applicantName}</span>
                      <span className="text-[11px] font-medium text-slate-500">{a.programName || 'Unknown Program'}</span>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                No pending applications.
              </div>
            )}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
