import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100">
      <div className="w-full max-w-md">
        <Card className="bg-slate-900 border-slate-800 shadow-2xl text-slate-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-500 to-rose-600" />

          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto mb-3 shadow-lg shadow-amber-950/40">
              <XCircle className="w-9 h-9" />
            </div>

            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Checkout Cancelled
            </CardTitle>

            <CardDescription className="text-slate-400 text-sm mt-1">
              Your payment was cancelled. No charges were made to your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                You can return to the plans page at any time to upgrade your institutional partition or change your billing cycle.
              </p>
              <p className="text-slate-500">
                If you encountered an issue with your payment method or need an enterprise purchase order, our support team is ready to assist.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 pt-2 pb-6">
            <Button
              onClick={() => navigate('/dashboard/billing')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Return to Plans & Billing
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
