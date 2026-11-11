import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  Award,
  CreditCard,
  Video,
  BookOpen,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function StudentPortalLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    {
      name: 'Dashboard',
      path: '/portal',
      exact: true,
      icon: LayoutDashboard,
      description: 'Overview, timetable, and alerts'
    },
    {
      name: 'My Schedule',
      path: '/portal/schedule',
      icon: Calendar,
      description: 'Weekly timetable & classes'
    },
    {
      name: 'Virtual Classroom',
      path: '/portal/classroom',
      icon: Video,
      description: 'Native in-app WebRTC lectures'
    },
    {
      name: 'Faculty Notes',
      path: '/portal/materials',
      icon: BookOpen,
      description: 'Native Notion workspace sync'
    },
    {
      name: 'Academics / Grades',
      path: '/portal/academics',
      icon: Award,
      description: 'Transcript, exams & GPA'
    },
    {
      name: 'Fee Center',
      path: '/portal/fees',
      icon: CreditCard,
      description: 'Invoices & online fee payment'
    },
    {
      name: 'Fee Ledger (B2C)',
      path: '/portal/fee-ledger',
      icon: CreditCard,
      description: 'In-app Razorpay tuition collection'
    }
  ];

  const isLinkActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding / Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/portal" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      EduPulse
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      Student Portal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    Institutional ERP • Self-Service
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.path, item.exact);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150',
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Profile Snapshot & Logout (Desktop) */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-indigo-200/60 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-xs">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-800 leading-tight">
                    {user?.username || 'Student'}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {user?.role || 'STUDENT'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/60 transition-colors cursor-pointer"
                title="Sign out of student portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Hamburger Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{user?.username || 'Student'}</div>
                  <div className="text-xs text-slate-500">{user?.role || 'STUDENT'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-md bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.path, item.exact);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      )
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">EduPulse SaaS ERP</span>
            <span>•</span>
            <span>Institutional Student Portal</span>
          </div>
          <div>
            <span>Protected under multi-tenant role authorization</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
