import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../config/api';
import { useTenantTheme } from '../hooks/useTenantTheme';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Mail,
  ShieldCheck,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  IdCard,
} from 'lucide-react';

export default function ForgotPassword() {
  const { branding, subdomain } = useTenantTheme();
  const isBranded = Boolean(subdomain && branding);

  const [email, setEmail] = useState('');
  const [institutionalId, setInstitutionalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !institutionalId.trim()) {
      toast.error('Please enter both your registered email and institutional ID');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/auth/forgot-password', {
        email: email.trim(),
        institutionalId: institutionalId.trim(),
      });
    } catch {
      // Intentionally suppress error details to prevent user enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        'If those details match our records, a secure recovery link has been sent to your registered email.',
        { duration: 6000 }
      );
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
            Dual-Factor Identity Recovery
          </p>
        </div>

        {/* Recovery Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          {!submitted ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Forgot your password?</h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Enter your registered institutional email and canonical student/employee ID to verify your identity.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Registered Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Registered Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@institution.edu or staff@institution.edu"
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 text-slate-900 rounded-xl text-sm"
                  />
                </div>

                {/* Institutional ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-slate-400" /> Institutional ID (Admission No. / Employee ID)
                  </label>
                  <Input
                    type="text"
                    value={institutionalId}
                    onChange={(e) => setInstitutionalId(e.target.value)}
                    placeholder="e.g. ENR-2026-001, EMP-1042, or Roll No."
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 text-slate-900 rounded-xl text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    Your canonical identifier assigned by the academic registrar or human resources.
                  </p>
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
                        Verifying Dual-Factor Identity...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Send Recovery Link
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            /* Post-Submission Confirmation Screen */
            <div className="text-center py-4 space-y-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white shadow-lg animate-in zoom-in-75"
                style={{ backgroundColor: primaryColor }}
              >
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Check Your Email</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                If those credentials match an active account in our registry, a cryptographically signed recovery link has been dispatched.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security Guarantee
                </p>
                <p className="text-[11px] text-slate-500">
                  The recovery link expires in <strong>15 minutes</strong> and will be automatically invalidated once consumed.
                </p>
              </div>
            </div>
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

