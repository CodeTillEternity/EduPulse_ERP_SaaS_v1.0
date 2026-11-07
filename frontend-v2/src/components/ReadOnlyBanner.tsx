import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface ReadOnlyBannerProps {
  onUpgradeClick?: () => void;
}

export default function ReadOnlyBanner({ onUpgradeClick }: ReadOnlyBannerProps) {
  const { tenantStatus, tenantId } = useAuthStore();

  // Only render if tenant is in READ_ONLY_GRACE period
  if (tenantStatus !== 'READ_ONLY_GRACE') {
    return null;
  }

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/dashboard/billing';
    }
  };

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium border-b border-amber-700/40"
    >
      <div className="flex items-center gap-2.5 max-w-4xl mx-auto sm:mx-0">
        <span className="p-1 rounded-full bg-amber-900/20 text-slate-950 shrink-0">
          <AlertTriangle className="w-4 h-4 text-slate-950" />
        </span>
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="font-bold text-slate-950">
            Your trial has expired. Your account is in read-only mode.
          </span>
          <span className="text-amber-950 text-xs hidden md:inline">
            Mutating actions (creates, updates, and deletes) are blocked until a subscription is activated.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button
          type="button"
          onClick={handleUpgrade}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-950 text-amber-300 hover:bg-slate-900 font-semibold text-xs transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Upgrade Plan <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
