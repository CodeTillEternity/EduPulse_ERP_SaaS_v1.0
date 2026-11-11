import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentProfile from './pages/StudentProfile';
import DepartmentsList from './pages/DepartmentsList';
import Attendance from './pages/Attendance';
import FinanceDashboard from './pages/FinanceDashboard';
import InstitutionsList from './pages/InstitutionsList';
import CampusesList from './pages/CampusesList';
import GuardiansList from './pages/GuardiansList';
import AdminUsersList from './pages/AdminUsersList';
import Admissions from './pages/Admissions';
import Academics from './pages/Academics';
import FacultySections from './pages/FacultySections';
import PublicAdmissions from './pages/PublicAdmissions';
import RegisterInstitution from './pages/RegisterInstitution';
import RegistrationSuccess from './pages/RegistrationSuccess';
import SubscriptionLockout from './pages/SubscriptionLockout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SaaSTenantDashboard from './pages/SaaSTenantDashboard';
import TenantBillingSettings from './pages/TenantBillingSettings';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import BillingDashboard from './pages/BillingDashboard';
import EnrollStudent from './pages/Admissions/EnrollStudent';
import SaaSBillingDashboard from './pages/Billing/BillingDashboard';
import CheckoutSuccess from './pages/Billing/CheckoutSuccess';
import CheckoutCancel from './pages/Billing/CheckoutCancel';
import CourseManager from './pages/Academic/CourseManager';
import ExamManager from './pages/Academic/ExamManager';
import TranscriptViewer from './pages/Academic/TranscriptViewer';
import TimetableManager from './pages/Operations/TimetableManager';
import AttendanceTracker from './pages/Operations/AttendanceTracker';
import LibraryManager from './pages/Operations/LibraryManager';
import TransportManager from './pages/Operations/TransportManager';
import FeeManager from './pages/Finance/FeeManager';
import StudentLedger from './pages/Finance/StudentLedger';
import LeaveManager from './pages/HR/LeaveManager';
import PayrollDashboard from './pages/HR/PayrollDashboard';
import LandingPage from './pages/LandingPage';
import OnboardingFlow from './pages/OnboardingFlow';
import StudentPortalLayout from './layouts/StudentPortalLayout';
import StudentDashboard from './pages/Portal/StudentDashboard';
import FeeCenter from './pages/Portal/FeeCenter';
import StudentFeeLedger from './pages/Portal/StudentFeeLedger';
import VirtualClassroom from './components/classroom/VirtualClassroom';
import AcademicMaterialView from './components/materials/AcademicMaterialView';
import { ProfileRedirect } from './components/ProfileRedirect';
import Layout from './components/Layout';
import { GlobalSearch } from './components/GlobalSearch';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import { Button } from './components/ui/button';
import { useTenantTheme } from './hooks/useTenantTheme';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">Something went wrong.</h1>
            <p className="text-slate-600">The application encountered an unexpected error.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: ReactNode, allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  if (isAuthenticated) {
    if (user?.role === 'STUDENT') {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function DashboardRoute() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'STUDENT') {
    return <Navigate to="/portal" replace />;
  }
  return <Dashboard />;
}

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center space-y-4">
    <h1 className="text-4xl font-bold text-slate-900">404 - Page Not Found</h1>
    <p className="text-slate-600">The page you are looking for doesn't exist or has been moved.</p>
    <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
  </div>
);

const Forbidden = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center space-y-4">
    <h1 className="text-4xl font-bold text-slate-900">403 - Access Denied</h1>
    <p className="text-slate-600">You do not have permission to access this page.</p>
    <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useTenantTheme();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <GlobalSearch />
          <Routes>
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<RegisterInstitution />} />
            <Route path="/register-success" element={<RegistrationSuccess />} />
            <Route path="/onboard" element={<OnboardingFlow />} />
            <Route path="/subscription-lockout" element={<SubscriptionLockout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/admissions" element={<PublicAdmissions />} />
            <Route path="/admissions/enroll" element={<EnrollStudent />} />
            <Route path="/academic/courses" element={<CourseManager />} />
            <Route path="/academic/course-manager" element={<CourseManager />} />
            <Route path="/academic/exams" element={<ExamManager />} />
            <Route path="/academic/transcripts" element={<TranscriptViewer />} />
            <Route path="/academic/classroom" element={<VirtualClassroom />} />
            <Route path="/academic/materials" element={<AcademicMaterialView />} />
            <Route path="/operations/timetable" element={<TimetableManager />} />
            <Route path="/operations/attendance" element={<AttendanceTracker />} />
            <Route path="/operations/library" element={<LibraryManager />} />
            <Route path="/operations/transport" element={<TransportManager />} />
            <Route path="/finance/fees" element={<FeeManager />} />
            <Route path="/finance/ledger" element={<StudentLedger />} />
            <Route path="/finance/tuition-collection" element={<StudentFeeLedger />} />
            <Route path="/hr/leaves" element={<LeaveManager />} />
            <Route path="/hr/payroll" element={<PayrollDashboard />} />
            <Route path="/billing" element={<SaaSBillingDashboard />} />
            <Route path="/billing/success" element={<CheckoutSuccess />} />
            <Route path="/billing/cancel" element={<CheckoutCancel />} />
            <Route path="/403" element={<Forbidden />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardRoute />} />
              <Route path="profile" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE']}><ProfileRedirect /></RoleProtectedRoute>} />
              <Route path="students" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE']}><StudentsList /></RoleProtectedRoute>} />
              <Route path="students/:id" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE']}><StudentProfile /></RoleProtectedRoute>} />
              <Route path="departments" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><DepartmentsList /></RoleProtectedRoute>} />
              <Route path="attendance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT']}><Attendance /></RoleProtectedRoute>} />
              <Route path="operations/timetable" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><TimetableManager /></RoleProtectedRoute>} />
              <Route path="operations/attendance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><AttendanceTracker /></RoleProtectedRoute>} />
              <Route path="operations/library" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN', 'FACULTY']}><LibraryManager /></RoleProtectedRoute>} />
              <Route path="operations/transport" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TRANSPORT_MANAGER', 'FACULTY']}><TransportManager /></RoleProtectedRoute>} />
              <Route path="finance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT', 'PARENT']}><FinanceDashboard /></RoleProtectedRoute>} />
              <Route path="finance/fees" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FINANCE_MANAGER']}><FeeManager /></RoleProtectedRoute>} />
              <Route path="finance/structures" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FINANCE_MANAGER']}><FeeManager /></RoleProtectedRoute>} />
              <Route path="finance/ledger" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FINANCE_MANAGER']}><StudentLedger /></RoleProtectedRoute>} />
              <Route path="hr/leaves" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'HR_MANAGER']}><LeaveManager /></RoleProtectedRoute>} />
              <Route path="hr/payroll" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HR_MANAGER']}><PayrollDashboard /></RoleProtectedRoute>} />
              <Route path="institutions" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><InstitutionsList /></RoleProtectedRoute>} />
              <Route path="campuses" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><CampusesList /></RoleProtectedRoute>} />
              <Route path="admissions" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Admissions /></RoleProtectedRoute>} />
              <Route path="academics" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><Academics /></RoleProtectedRoute>} />
              <Route path="academic/exams" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY']}><ExamManager /></RoleProtectedRoute>} />
              <Route path="academic/transcripts" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'STUDENT']}><TranscriptViewer /></RoleProtectedRoute>} />
              <Route path="sections" element={<RoleProtectedRoute allowedRoles={['FACULTY']}><FacultySections /></RoleProtectedRoute>} />
              <Route path="guardians" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><GuardiansList /></RoleProtectedRoute>} />
              <Route path="admin/users" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><AdminUsersList /></RoleProtectedRoute>} />
              <Route path="billing" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><BillingDashboard /></RoleProtectedRoute>} />
              <Route path="billing/settings" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><TenantBillingSettings /></RoleProtectedRoute>} />
              <Route path="super-admin" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminDashboard /></RoleProtectedRoute>} />
              <Route path="saas-admin" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><SaaSTenantDashboard /></RoleProtectedRoute>} />
            </Route>
            <Route
              path="/billing/settings"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <Layout />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<TenantBillingSettings />} />
            </Route>
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'ADMIN']}>
                    <StudentPortalLayout />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="schedule" element={<TimetableManager />} />
              <Route path="classroom" element={<VirtualClassroom />} />
              <Route path="materials" element={<AcademicMaterialView />} />
              <Route path="academics" element={<TranscriptViewer />} />
              <Route path="fees" element={<FeeCenter />} />
              <Route path="fee-ledger" element={<StudentFeeLedger />} />
            </Route>
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <Layout />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperAdminDashboard />} />
            </Route>
            <Route
              path="/saas-admin"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <Layout />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<SaaSTenantDashboard />} />
            </Route>
            <Route path="/" element={<LandingPage />} />
            <Route path="/www" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
        <HotToaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '12px',
              borderRadius: '8px',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;