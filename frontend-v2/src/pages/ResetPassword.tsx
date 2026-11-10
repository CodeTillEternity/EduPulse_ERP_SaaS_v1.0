import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../config/api';
import { useTenantTheme } from '../hooks/useTenantTheme';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Loader2,
  LogIn,
} from 'lucide-react';

export default function ResetPassword() {
  const { branding, subdomain } = useTenantTheme();
  const isBranded = Boolean(subdomain && branding);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      toast.error('Cryptographic reset token is missing from the URL.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/auth/reset-password', {
        token: token.trim(),
        newPassword: newPassword,
      });

      setSuccess(true);
      toast.success('Your password has been securely updated. You may now sign in.');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Unable to reset password. The link may be expired, invalid, or already consumed.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = isBranded && branding?.primaryColorHex ? branding.primaryColorHex : '#4f46e5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background blur */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Branding Header */}
        <div className="text-center mb-6">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.institutionName || 'Institution Logo'}
              className="h-14 mx-auto mb-3 object-contain drop-shadow-md"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-xl"
              style={{ backgroundColor: primaryColor }}
            >
              <Building2 className="w-7 h-7" />
            </div>
          )}
          <h1 className="text-2xl font-black text-white tracking-tight">
            {branding?.institutionName || 'EduPulse Institutional ERP'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Cryptographic Password Reset
          </p>
        </div>

        {/* Reset Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          {!token ? (
            /* Missing Token State */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-600 shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Missing Reset Token</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                No cryptographic token was detected in your URL. Password reset links expire after 15 minutes and can only be used once.
              </p>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center justify-center w-full h-11 text-white font-bold rounded-xl text-sm shadow-md transition-all hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Request New Recovery Link
                </Link>
              </div>
            </div>
          ) : success ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white shadow-lg animate-in zoom-in-75"
                style={{ backgroundColor: primaryColor }}
              >
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Password Reset Complete</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your account password has been updated securely. You can now authenticate with your new credentials.
              </p>
              <div className="pt-3">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-11 text-white font-bold rounded-xl text-sm shadow-md transition-all hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In with New Password
                </Button>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Create New Password</h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Enter your new password below. Ensure it contains at least 8 characters.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 text-slate-900 rounded-xl text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your new password"
                      required
                      minLength={8}
                      className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 text-slate-900 rounded-xl text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-white font-bold rounded-xl text-sm shadow-md transition-all hover:opacity-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Return to Sign In */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

