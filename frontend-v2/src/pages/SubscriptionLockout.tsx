import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Database, 
  Headphones, 
  LogOut, 
  Clock, 
  FileWarning 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function SubscriptionLockout() {
  const navigate = useNavigate();
  const { tenantId, tenantStatus, logout, user } = useAuthStore();

  const isPendingDeletion = tenantStatus === 'PENDING_DELETION';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100">
      <div className="w-full max-w-xl">
        <Card className="bg-slate-900 border-rose-900/60 shadow-2xl shadow-rose-950/40 text-slate-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-500 via-rose-600 to-red-700" />

          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto mb-3 shadow-lg shadow-rose-950/50">
              {isPendingDeletion ? (
                <AlertOctagon className="w-8 h-8 text-rose-500 animate-pulse" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 mx-auto mb-2">
              <Clock className="w-3.5 h-3.5" />
              Account Status: {tenantStatus || 'SUSPENDED'}
            </div>

            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              {isPendingDeletion
                ? 'Tenant Partition Scheduled for Deletion'
                : 'Institution Subscription Suspended'}
            </CardTitle>

            <CardDescription className="text-slate-400 text-sm mt-1">
              {isPendingDeletion
                ? 'Your institution has exceeded all retention windows and is queued for permanent purging.'
                : 'Access to this institution has been suspended due to an expired subscription.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Status Information Box */}
            <div className="rounded-lg bg-rose-950/30 border border-rose-800/40 p-4 space-y-2 text-xs text-rose-200">
              <div className="font-semibold flex items-center gap-2 text-rose-300">
                <FileWarning className="w-4 h-4" />
                Administrative Lockout Notice
              </div>
              <p className="text-slate-300 leading-relaxed">
                All read and write API endpoints for this partition have been sealed by the SaaS control plane.
                ERP navigation, academic records, and transactional tools are locked.
              </p>
            </div>

            {/* Retention Assurance */}
            <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Data Preservation Status
              </div>
              <p className="text-slate-400 leading-relaxed">
                {isPendingDeletion
                  ? 'Your database records are in the final deletion queue. Immediate contact with support is required to halt automated archival purging.'
                  : 'Your institution records, academic histories, and financial data are securely retained in PostgreSQL storage. Reactivating your plan will immediately restore full platform access.'}
              </p>

              <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">Tenant Reference:</span>
                <span className="text-slate-300 font-medium">{tenantId || user?.tenantId || 'Unknown'}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 pt-2 pb-6">
            <Button
              onClick={() => window.open('mailto:support@edupulse.io?subject=Reactivate%20Tenant%20' + (tenantId || ''), '_blank')}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" /> Contact Platform Support to Reactivate
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
