import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function VerifyPasscodePage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/care-circles/invitations/verify-accept', {
        passcode: passcode.trim(),
      });

      updateUser({ hasCompletedOnboarding: true });

      const role = res.data.membership.role;
      if (role === 'caregiver') {
        navigate('/caregiver');
      } else {
        navigate('/family');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Invalid or expired passcode. Please verify with the profile owner.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-teal text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black italic text-navy">Enter Care Passcode</h1>
          <p className="text-base text-stone-600 mt-2">
            Please enter the 6-digit invitation passcode provided by the care profile owner.
          </p>
        </div>

        <Card className="shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="passcode-input" className="block text-center text-sm font-bold uppercase tracking-wider text-stone-600 mb-2">
                6-Digit Authorization Code
              </label>
              <input
                id="passcode-input"
                type="text"
                maxLength={6}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-4xl font-mono font-black tracking-[0.5em] py-4 rounded-2xl border-3 border-stone-300 focus:border-teal focus:ring-4 focus:ring-teal/20 text-navy bg-white min-h-[64px]"
                required
                autoFocus
              />
              <p className="text-xs text-center text-stone-500 mt-2">
                Passcodes expire after 24 hours. Limit 5 attempts.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              disabled={passcode.length < 6}
            >
              Verify & Join Care Circle <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/onboarding/role')}
              className="text-stone-500 text-sm font-semibold hover:underline"
            >
              ← Choose a different role
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
