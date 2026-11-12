import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../config/api';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarCheck, Wallet, 
  Store, ShieldAlert, UserCheck, 
  Menu, X, LogOut, ChevronDown, UserCircle, Bell,
  Check, KeyRound, CreditCard, Search, Video, BookOpen, Receipt,
  Maximize2, PhoneOff, Copy
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChangePasswordModal } from '../ChangePasswordModal';
import ReadOnlyBanner from '../ReadOnlyBanner';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useVideo } from '../../context/VideoContext';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    activeSession,
    leaveSession
  } = useVideo();

  const isExactClassroomRoute = location.pathname === '/dashboard/classroom';
  const isTestEnv = typeof (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'undefined'
    && (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); toast.success('Connection restored.'); };
    const handleOffline = () => { setIsOnline(false); toast.error('You are currently offline.'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ unreadCount: number }>('/api/v1/notifications/unread-count');
        return res.data;
      } catch {
        return { unreadCount: 0 };
      }
    },
    refetchInterval: 15000,
  });

  const { data: notifications = [], isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/api/v1/notifications');
      return res.data;
    },
    enabled: isNotificationsOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.patch(`/api/v1/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch('/api/v1/notifications/mark-all-read');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleLogout = () => {
    const isApplicant = user?.role === 'APPLICANT';
    logout();
    if (isApplicant) {
      navigate('/login?tab=applicant');
    } else {
      navigate('/login');
    }
  };

  const NavItem = ({ path, icon: Icon, label, disabled = false }: { path: string, icon: React.ElementType, label: string, disabled?: boolean }) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    
    if (disabled) {
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-md text-slate-400 cursor-not-allowed opacity-75">
          <div className="flex items-center space-x-3">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        </div>
      );
    }

    return (
      <Link 
        onClick={() => setIsMobileMenuOpen(false)} 
        to={path} 
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-md transition-colors",
          isActive 
            ? "bg-primary/10 text-primary font-semibold" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
        )}
      >
        <div className="flex items-center space-x-3">
          <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-500")} />
          <span className="text-sm">{label}</span>
        </div>
      </Link>
    );
  };

  const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</div>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  );

  const role = user?.role || '';

  const renderSidebarContent = () => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return (
          <>
            <NavGroup title="Admin Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>

            <NavGroup title="Operations">
              <NavItem path="/dashboard/students" icon={Users} label="Students Directory" />
              <NavItem path="/dashboard/admissions" icon={UserCheck} label="Admissions" />
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Attendance Oversight" />
            </NavGroup>

            <NavGroup title="Academics">
              <NavItem path="/dashboard/departments" icon={Store} label="Programs & Departments" />
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="Course Catalog" />
              <NavItem path="/dashboard/classroom" icon={Video} label="Virtual Classroom" />
              <NavItem path="/dashboard/materials" icon={BookOpen} label="Faculty Notes (Notion)" />
            </NavGroup>

            <NavGroup title="Finance">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
              <NavItem path="/dashboard/tuition-collection" icon={Receipt} label="Tuition Ledger" />
            </NavGroup>

            <NavGroup title="System Setup">
              <NavItem path="/dashboard/billing" icon={CreditCard} label="Billing & Plans" />
              {role === 'SUPER_ADMIN' && (
                <NavItem path="/dashboard/billing/settings" icon={CreditCard} label="Billing Settings" />
              )}
              <NavItem path="/dashboard/admin/users" icon={ShieldAlert} label="Access Control" />
              {role === 'SUPER_ADMIN' && (
                <NavItem path="/super-admin" icon={ShieldAlert} label="SaaS Tenant Registry" />
              )}
            </NavGroup>
          </>
        );

      case 'FACULTY':
        return (
          <>
            <NavGroup title="Faculty Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Academics">
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="My Timetable" />
              <NavItem path="/dashboard/sections" icon={Users} label="My Sections" />
              <NavItem path="/dashboard/classroom" icon={Video} label="Virtual Classroom" />
              <NavItem path="/dashboard/materials" icon={BookOpen} label="Faculty Notes (Notion)" />
            </NavGroup>
          </>
        );

      case 'STUDENT':
        return (
          <>
            <NavGroup title="Student Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem path="/dashboard/classroom" icon={Video} label="Virtual Classroom" />
              <NavItem path="/dashboard/materials" icon={BookOpen} label="Faculty Notes (Notion)" />
              <NavItem path="/dashboard/tuition-collection" icon={Receipt} label="Tuition Ledger" />
            </NavGroup>
          </>
        );

      case 'PARENT':
        return (
          <>
            <NavGroup title="Parent Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem path="/dashboard/tuition-collection" icon={Receipt} label="Tuition Ledger" />
            </NavGroup>
          </>
        );

      case 'FINANCE':
        return (
          <>
            <NavGroup title="Finance Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
              <NavItem path="/dashboard/tuition-collection" icon={Receipt} label="Tuition Ledger" />
            </NavGroup>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ReadOnlyBanner />
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-slate-200 shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                EP
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">EduPulse</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* Mobile menu sheet */}
        {isMobileMenuOpen && (
          <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 md:hidden flex flex-col shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  EP
                </div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">EduPulse</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-500 hover:text-slate-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {renderSidebarContent()}
            </div>
          </aside>
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-slate-600 hover:text-slate-900 p-1 rounded-md"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors bg-slate-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search modules, students...</span>
                <kbd className="ml-2 font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
              </button>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {!isOnline && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                  Offline Mode
                </span>
              )}

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadData && unreadData.unreadCount > 0 ? (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                  ) : null}
                </button>

                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</span>
                        {unreadData && unreadData.unreadCount > 0 && (
                          <button
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {isLoadingNotifs ? (
                          <div className="p-4 text-xs text-center text-slate-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-xs text-center text-slate-400">No new notifications</div>
                        ) : (
                          notifications.map((n: any) => (
                            <div key={n.id} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                              </div>
                              {!n.read && (
                                <button
                                  onClick={() => markReadMutation.mutate(n.id)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 shrink-0 p-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <UserCircle className="w-6 h-6 text-slate-600" />
                  <span className="text-xs font-semibold hidden sm:inline-block">{user?.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.username}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{role.toLowerCase().replace('_', ' ')}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsChangePasswordOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <ChangePasswordModal 
                isOpen={isChangePasswordOpen} 
                onClose={() => setIsChangePasswordOpen(false)} 
              />
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col min-h-0">
            {/* If activeSession exists AND location.pathname === '/dashboard/classroom': Render Jitsi to fill the main content area (w-full h-full flex-1) */}
            {activeSession && isExactClassroomRoute ? (
              <div
                data-testid="jitsi-full-classroom"
                className="w-full h-full flex-1 flex flex-col bg-slate-950 min-h-[640px] relative"
              >
                {/* Minimal Top Session Control Header */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-white shrink-0">
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide truncate">
                      {activeSession.courseCode}: {activeSession.title || activeSession.courseName || 'Live Lecture'}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400 font-mono truncate">{activeSession.roomName}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`https://meet.jit.si/${activeSession.roomName}`);
                        toast.success('Lecture link copied to clipboard');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        leaveSession();
                        toast.info('Left virtual classroom session');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>Leave Classroom</span>
                    </button>
                  </div>
                </div>

                {/* Jitsi Meeting Frame */}
                <div className="w-full flex-1 relative bg-slate-950">
                  {isTestEnv ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2">
                      <span>Full Classroom Jitsi Session: {activeSession.roomName}</span>
                      <button
                        onClick={() => leaveSession()}
                        data-testid="jitsi-hangup-btn"
                        className="text-rose-400 underline"
                      >
                        Hangup
                      </button>
                    </div>
                  ) : (
                    <JitsiMeeting
                      domain="meet.jit.si"
                      roomName={activeSession.roomName}
                      onReadyToClose={() => {
                        leaveSession();
                        toast.info('Left virtual classroom session');
                      }}
                      configOverwrite={{
                        prejoinPageEnabled: false,
                        startWithAudioMuted: true,
                        startWithVideoMuted: true
                      }}
                      interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_BRAND_WATERMARK: false,
                        DEFAULT_BACKGROUND: '#020617'
                      }}
                      userInfo={{
                        displayName: user?.username || 'EduPulse User',
                        email: user?.email || 'user@edupulse.edu'
                      }}
                      getIFrameRef={(iframeRef) => {
                        if (iframeRef) {
                          iframeRef.style.height = '100%';
                          iframeRef.style.width = '100%';
                          iframeRef.style.border = '0';
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Normal Route Content */
              <Outlet />
            )}

            {/* If activeSession exists AND location.pathname !== '/dashboard/classroom': Render Jitsi as a floating Picture-in-Picture window */}
            {activeSession && !isExactClassroomRoute && (
              <div
                data-testid="jitsi-persistent-container"
                className="fixed bottom-6 right-6 w-[480px] h-[320px] rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-800 bg-slate-950 flex flex-col"
              >
                {/* Floating PiP Top Header */}
                <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-2 flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {activeSession.courseCode} — {activeSession.title || activeSession.courseName || 'Live Session'}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                      PiP
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => navigate('/dashboard/classroom')}
                      title="Expand to Full Classroom View"
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        leaveSession();
                        toast.info('Left virtual classroom session');
                      }}
                      title="Leave Session"
                      className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/50 transition-colors"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* PiP Jitsi Video Portal */}
                <div className="w-full flex-1 relative bg-slate-950">
                  {isTestEnv ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2">
                      <span>PiP Jitsi Session: {activeSession.roomName}</span>
                      <button
                        onClick={() => leaveSession()}
                        data-testid="jitsi-hangup-btn"
                        className="text-rose-400 underline"
                      >
                        Hangup
                      </button>
                    </div>
                  ) : (
                    <JitsiMeeting
                      domain="meet.jit.si"
                      roomName={activeSession.roomName}
                      onReadyToClose={() => {
                        leaveSession();
                        toast.info('Left virtual classroom session');
                      }}
                      configOverwrite={{
                        prejoinPageEnabled: false,
                        startWithAudioMuted: true,
                        startWithVideoMuted: true
                      }}
                      interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_BRAND_WATERMARK: false,
                        DEFAULT_BACKGROUND: '#020617'
                      }}
                      userInfo={{
                        displayName: user?.username || 'EduPulse User',
                        email: user?.email || 'user@edupulse.edu'
                      }}
                      getIFrameRef={(iframeRef) => {
                        if (iframeRef) {
                          iframeRef.style.height = '100%';
                          iframeRef.style.width = '100%';
                          iframeRef.style.border = '0';
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
