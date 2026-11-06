import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, User, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useRegisterTenant } from '../hooks/useRegisterTenant';
import { toast } from 'sonner';

export interface RegisterInstitutionFormData {
  institutionName: string;
  adminEmail: string;
  adminName: string;
  adminPassword?: string;
}

interface RegisterInstitutionProps {
  onSubmit?: (data: RegisterInstitutionFormData) => void;
  isLoading?: boolean;
}

export default function RegisterInstitution({ onSubmit, isLoading }: RegisterInstitutionProps) {
  const navigate = useNavigate();
  const registerMutation = useRegisterTenant();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInstitutionFormData>({
    defaultValues: {
      institutionName: '',
      adminEmail: '',
      adminName: '',
      adminPassword: '',
    },
  });

  const loading = isLoading ?? registerMutation.isPending;

  const handleFormSubmit = async (data: RegisterInstitutionFormData) => {
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    try {
      const response = await registerMutation.mutateAsync(data);
      toast.success(response.message || 'Tenant partition provisioned successfully!');
      navigate('/register-success', { state: response });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to register institution';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
          <Building2 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          EduPulse ERP <span className="text-indigo-400">SaaS</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Start your 14-day full-featured institutional trial in seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl text-slate-100">
          <CardHeader className="space-y-1 pb-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Register New Institution
              </CardTitle>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> 14-Day Free Trial
              </span>
            </div>
            <CardDescription className="text-slate-400 text-sm">
              Enter your school or university information to automatically provision your isolated tenant partition.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
              {/* Institution Name */}
              <div className="space-y-1.5">
                <label htmlFor="institutionName" className="block text-sm font-medium text-slate-200">
                  Institution Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <Input
                    id="institutionName"
                    type="text"
                    placeholder="e.g. Apex Global University"
                    className="pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                    {...register('institutionName', {
                      required: 'Institution name is required',
                      minLength: { value: 3, message: 'Must be at least 3 characters' },
                    })}
                  />
                </div>
                {errors.institutionName && (
                  <p className="text-xs text-rose-400 font-medium">{errors.institutionName.message}</p>
                )}
              </div>

              {/* Admin Name */}
              <div className="space-y-1.5">
                <label htmlFor="adminName" className="block text-sm font-medium text-slate-200">
                  Administrator Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="adminName"
                    type="text"
                    placeholder="e.g. Dr. Jane Doe"
                    className="pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                    {...register('adminName', {
                      required: 'Administrator name is required',
                      minLength: { value: 2, message: 'Must be at least 2 characters' },
                    })}
                  />
                </div>
                {errors.adminName && (
                  <p className="text-xs text-rose-400 font-medium">{errors.adminName.message}</p>
                )}
              </div>

              {/* Admin Email */}
              <div className="space-y-1.5">
                <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-200">
                  Administrator Official Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@institution.edu"
                    className="pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                    {...register('adminEmail', {
                      required: 'Official email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address format',
                      },
                    })}
                  />
                </div>
                {errors.adminEmail && (
                  <p className="text-xs text-rose-400 font-medium">{errors.adminEmail.message}</p>
                )}
              </div>

              {/* Optional Admin Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="adminPassword" block text-sm font-medium text-slate-200>
                    Initial Admin Password <span className="text-xs text-slate-400 font-normal">(optional)</span>
                  </label>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Leave blank to auto-generate"
                    className="pl-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                    {...register('adminPassword', {
                      minLength: { value: 6, message: 'Password must be at least 6 characters if provided' },
                    })}
                  />
                </div>
                {errors.adminPassword && (
                  <p className="text-xs text-rose-400 font-medium">{errors.adminPassword.message}</p>
                )}
              </div>

              {/* Feature Highlights */}
              <div className="rounded-lg bg-indigo-950/40 border border-indigo-800/40 p-3.5 space-y-2 text-xs text-indigo-300">
                <div className="flex items-center gap-2 font-medium text-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Included in your 14-day trial:
                </div>
                <ul className="grid grid-cols-2 gap-2 text-slate-400 pl-6 list-disc">
                  <li>Automatic tenant partitioning</li>
                  <li>Institution Admin privileges</li>
                  <li>Academic & Student modules</li>
                  <li>Starter storage & plan quota</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>Provisioning Tenant Partition...</>
                ) : (
                  <>
                    Complete Registration <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-400">
                Already registered?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4">
                  Log in to your tenant
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
