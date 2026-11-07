import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building2, LayoutDashboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { setTenantStatus, tenantId } = useAuthStore();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get('session_id') || 'cs_test_session';
  const paramTenantId = searchParams.get('tenant_id') || tenantId || 'apex-univ-demo';

  useEffect(() => {
    // 1. Immediately transition local auth store to ACTIVE status
    setTenantStatus('ACTIVE');

    // 2. Invalidate all tenant queries to trigger fresh server hydration
    queryClient.invalidateQueries();

    // 3. Countdown timer to automatically redirect user back to Dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, queryClient, setTenantStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 text-slate-100">
      <div className="w-full max-w-lg">
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl text-slate-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mx-auto mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Subscription Activated
            </div>

            <CardTitle className="text-2xl font-extrabold text-white tracking-tight">
              Payment Successful!
            </CardTitle>

            <CardDescription className="text-slate-400 text-sm mt-1">
              Thank you for subscribing. Your institutional partition has been upgraded to ACTIVE status.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-2.5 text-xs text-slate-300 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Tenant Partition:
                </span>
                <span className="text-indigo-300 font-semibold">{paramTenantId}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-500">Stripe Session:</span>
                <span className="text-slate-400 truncate max-w-[200px]">{sessionId}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Account Status:
                </span>
                <span className="text-emerald-400 font-bold uppercase">ACTIVE (Paid)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              All feature locks, quota limits, and grace period banners have been automatically cleared.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to ERP Dashboard ({countdown}s) <ArrowRight className="w-4 h-4" />
            </Button>

            <Link to="/dashboard/billing" className="text-xs text-slate-400 hover:text-slate-300 text-center">
              View Billing Details
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
