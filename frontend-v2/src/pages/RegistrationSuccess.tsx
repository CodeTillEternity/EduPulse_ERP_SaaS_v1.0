import { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  LogIn 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface RegistrationSuccessLocationState {
  tenantId?: string;
  institutionName?: string;
  adminEmail?: string;
  trialEndDate?: string;
  status?: string;
}

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const state = (location.state as RegistrationSuccessLocationState) || {};
  const query = new URLSearchParams(location.search);

  const tenantId = state.tenantId || query.get('tenantId') || 'apex-univ-demo';
  const institutionName = state.institutionName || query.get('institutionName') || 'Your Institution';
  const adminEmail = state.adminEmail || query.get('adminEmail') || 'admin@institution.edu';

  // Default to 14 days from today if not provided
  const trialEndDateRaw = state.trialEndDate || query.get('trialEndDate');
  const formattedTrialDate = useMemo(() => {
    try {
      const date = trialEndDateRaw ? new Date(trialEndDateRaw) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '14 days from registration';
    }
  }, [trialEndDateRaw]);

  const copyTenantId = () => {
    navigator.clipboard.writeText(tenantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Congratulations!
          </h1>
          <p className="mt-2 text-base text-slate-400">
            <span className="text-white font-medium">{institutionName}</span> has been provisioned successfully.
          </p>
        </div>

        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl text-slate-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-600" />
          
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center gap-1.5 mx-auto px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              SaaS Partition Active
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              14-Day Free Trial Activated
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Your institution is initialized with dedicated multi-tenant isolation and administrative roles.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {/* Trial Window Highlight */}
            <div className="rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Trial End Date</div>
                  <div className="text-sm font-semibold text-white">{formattedTrialDate}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            </div>

            {/* Tenant Partition Details */}
            <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" /> Institution
                </span>
                <span className="font-medium text-slate-200">{institutionName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" /> Admin Email
                </span>
                <span className="font-mono text-xs text-indigo-300">{adminEmail}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Tenant Identifier</span>
                  <span className="font-mono text-xs text-slate-300 font-semibold">{tenantId}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyTenantId}
                  className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 h-8 px-2.5 text-xs flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy ID
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-slate-400 text-center space-y-1">
              <p>You can now sign in using your administrator credentials.</p>
              <p className="text-slate-500">Need help onboarding your faculty or students? Visit our documentation anytime.</p>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6 flex flex-col gap-3">
            <Button
              onClick={() => navigate('/login?tab=erp')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Proceed to Login <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-300 text-center">
              Return to EduPulse Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
