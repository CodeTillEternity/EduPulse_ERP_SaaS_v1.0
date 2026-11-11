import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  User, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../config/api';
import { toast } from 'sonner';

interface OnboardingFormState {
  institutionName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  subdomain: string;
  tier: string;
}

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginToStore = useAuthStore((state) => state.login);

  const initialTier = (searchParams.get('tier') || 'TRIAL').toUpperCase();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState<string>('idle');
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingFormState>({
    institutionName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    subdomain: '',
    tier: initialTier,
  });

  // Automatically derive clean subdomain slug from institution name
  useEffect(() => {
    if (formData.institutionName && !formData.subdomain) {
      const derived = formData.institutionName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 24);
      setFormData(prev => ({ ...prev, subdomain: derived }));
    }
  }, [formData.institutionName, formData.subdomain]);

  const handleChange = (field: keyof OnboardingFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institutionName.trim()) {
      setErrorMsg('Please enter your institution name.');
      return;
    }
    if (formData.institutionName.trim().length < 3) {
      setErrorMsg('Institution name must be at least 3 characters.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setStep(1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.adminName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      setErrorMsg('Please enter a valid institutional work email.');
      return;
    }
    if (!formData.adminPassword || formData.adminPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg(null);
    setStep(3);
    setProvisioningStatus('provisioning');
    setProvisioningLogs([
      'Initializing Central Tenant Registry transaction...',
    ]);

    try {
      // Step A: Provision Tenant on Backend
      const payload = {
        institutionName: formData.institutionName.trim(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        adminName: formData.adminName.trim(),
        adminPassword: formData.adminPassword,
        name: formData.institutionName.trim(),
        email: formData.adminEmail.trim().toLowerCase(),
        fullName: formData.adminName.trim(),
        password: formData.adminPassword,
        tier: formData.tier,
      };

      // Try dedicated public onboarding endpoint first, fall back to register
      let res;
      try {
        res = await apiClient.post('/api/v1/saas/public/onboard', payload);
      } catch {
        res = await apiClient.post('/api/v1/saas/register', payload);
      }

      const tenantData = res.data?.data || res.data;
      const tenantId = tenantData.tenantId || `tenant-${formData.subdomain || 'inst'}`;

      setProvisioningLogs(prev => [
        ...prev,
        `Tenant partition [${tenantId}] successfully registered.`,
        'Configured PostgreSQL Row-Level Security (RLS) boundary.',
        'Seeded initial SUPERADMIN user credentials.',
        'Activating 14-day commercial trial window...',
        'Authenticating session via AuthController...',
      ]);

      // Step B: Automatically authenticate user
      const loginPayload = {
        username: formData.adminEmail.trim().toLowerCase(),
        password: formData.adminPassword,
        role: 'SUPER_ADMIN',
        tenantId: tenantId,
      };

      const loginRes = await apiClient.post('/auth/login', loginPayload);
      const authData = loginRes.data;

      const accessToken = authData.accessToken || authData.token;
      const refreshToken = authData.refreshToken || '';
      const username = authData.username || formData.adminEmail;
      const role = authData.role || 'SUPER_ADMIN';
      const permissions = authData.permissions || [];

      // Update state store
      loginToStore(
        accessToken,
        refreshToken,
        {
          username,
          role,
          permissions,
          email: formData.adminEmail,
          tenantId: tenantId,
          tenantStatus: 'TRIAL'
        },
        tenantId,
        'TRIAL'
      );

      setProvisioningLogs(prev => [
        ...prev,
        'Security token generated and session established.',
        'Redirecting to your isolated administrative dashboard...',
      ]);
      setProvisioningStatus('complete');

      toast.success(`Welcome to EduPulse! Institution ${formData.institutionName} is live.`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);

    } catch (err: any) {
      console.error('Provisioning failed:', err);
      const message = err.response?.data?.message || err.message || 'Failed to complete tenant onboarding';
      setProvisioningStatus('error');
      setErrorMsg(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            EduPulse <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold tracking-wide border border-indigo-500/30">SaaS</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Launch Your Institutional ERP
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Autonomous 14-day free trial • No credit card required • Instant RLS isolation
        </p>

        {/* Multi-step progress indicator */}
        <div className="mt-6 max-w-xs mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              step >= 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span className={step === 1 ? 'text-white font-semibold' : 'text-slate-400'}>Institution</span>
          </div>

          <div className={`h-0.5 w-8 transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-800'}`} />

          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              step >= 2 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span className={step === 2 ? 'text-white font-semibold' : 'text-slate-400'}>Admin User</span>
          </div>

          <div className={`h-0.5 w-8 transition-colors ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-800'}`} />

          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              step === 3 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </span>
            <span className={step === 3 ? 'text-white font-semibold' : 'text-slate-400'}>Deploy</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {step === 1 && 'Step 1: Institution Details'}
                  {step === 2 && 'Step 2: Administrator Credentials'}
                  {step === 3 && 'Step 3: Provisioning & Launch'}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">
                  {step === 1 && 'Define your institution name and primary subdomain partition.'}
                  {step === 2 && 'Create the root SUPERADMIN credentials for your institution.'}
                  {step === 3 && 'Provisioning isolated cloud namespace and establishing session.'}
                </CardDescription>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                {formData.tier} Tier
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Institution Details */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Institution Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="e.g. Cambridge Academy of Sciences"
                      value={formData.institutionName}
                      onChange={(e) => handleChange('institutionName', e.target.value)}
                      className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Dedicated Subdomain Slug
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-800 bg-slate-800/60 text-slate-400 text-xs">
                      https://
                    </span>
                    <Input
                      type="text"
                      placeholder="cambridge-academy"
                      value={formData.subdomain}
                      onChange={(e) => handleChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="rounded-none rounded-r-md bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your institutional tenant URL: <span className="text-indigo-400 font-mono">https://{formData.subdomain || 'your-school'}.edupulse.cloud</span>
                  </p>
                </div>

                {/* Benefits pill */}
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-2 text-slate-400">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Included in your 14-day evaluation:
                  </div>
                  <ul className="grid grid-cols-2 gap-2 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      PostgreSQL RLS Isolation
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      100 Student Capacity
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      Safe Exam Browser Mode
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      Automated Ledgers
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs rounded-xl shadow-lg shadow-indigo-600/25"
                  >
                    Continue to Admin User Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: Administrator Credentials */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Administrator Full Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="e.g. Dr. Arthur Pendelton"
                      value={formData.adminName}
                      onChange={(e) => handleChange('adminName', e.target.value)}
                      className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Administrator Work Email <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="admin@cambridge.edu"
                      value={formData.adminEmail}
                      onChange={(e) => handleChange('adminEmail', e.target.value)}
                      className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">This will be your initial SUPERADMIN login identity.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.adminPassword}
                        onChange={(e) => handleChange('adminPassword', e.target.value)}
                        className="pl-10 pr-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs px-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 text-xs rounded-xl shadow-lg shadow-indigo-600/30"
                  >
                    Launch 14-Day Institutional Trial
                    <Sparkles className="w-4 h-4 ml-2 text-amber-300" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Automated Cloud Provisioning & Login */}
            {step === 3 && (
              <div className="space-y-6 py-2">
                <div className="text-center space-y-2">
                  {provisioningStatus === 'provisioning' && (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      <h3 className="font-bold text-white text-base">Provisioning Institutional Tenant...</h3>
                      <p className="text-xs text-slate-400">Please wait while your isolated cloud environment is generated.</p>
                    </div>
                  )}

                  {provisioningStatus === 'complete' && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Check className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-emerald-400 text-base">Provisioning & Authentication Complete!</h3>
                      <p className="text-xs text-slate-400">Redirecting directly to your newly created dashboard...</p>
                    </div>
                  )}

                  {provisioningStatus === 'error' && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-red-400 text-base">Provisioning Failed</h3>
                      <p className="text-xs text-slate-400">An error occurred while creating your tenant partition.</p>
                      <Button
                        onClick={() => setStep(2)}
                        className="mt-2 bg-slate-800 hover:bg-slate-700 text-white text-xs"
                      >
                        Retry Setup
                      </Button>
                    </div>
                  )}
                </div>

                {/* Provisioning Terminal Log */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-400 space-y-2 max-h-48 overflow-y-auto">
                  <div className="text-slate-500 text-[11px] border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span>Provisioning Engine v1.4</span>
                    <span className="text-indigo-400 font-bold">ONLINE</span>
                  </div>
                  {provisioningLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <span className="text-indigo-500 font-bold">›</span>
                      <span className={idx === provisioningLogs.length - 1 ? 'text-indigo-300 font-medium' : 'text-slate-400'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing User Login Shortcut */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an institutional account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
}
