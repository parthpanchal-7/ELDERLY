import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { Heart, Lock, Mail, Users, Stethoscope, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      redirectUser(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, role: string) => {
    setError('');
    setIsLoading(true);
    try {
      const user = await login(demoEmail, 'Password123!');
      redirectUser(user);
    } catch (err: any) {
      // If user hasn't seeded yet, fall back to Google demo auth
      try {
        const user = await loginWithGoogle({
          email: demoEmail,
          name: demoEmail.includes('ramesh') ? 'Ramesh Sharma' : demoEmail.includes('priya') ? 'Priya Sharma' : 'Nurse Sunita',
          role,
        });
        redirectUser(user);
      } catch (e: any) {
        setError('Demo sign in failed. Ensure backend is running and database is seeded.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUser = (user: any) => {
    if (!user.hasCompletedOnboarding) {
      navigate('/onboarding/role');
    } else if (user.primaryRole === 'profile_owner') {
      navigate('/dashboard');
    } else if (user.primaryRole === 'family_member') {
      navigate('/family');
    } else if (user.primaryRole === 'caregiver') {
      navigate('/caregiver');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal flex items-center justify-center text-white shadow-sm">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <span className="text-3xl font-black italic tracking-tight text-navy">SaathiCare</span>
        </Link>
        <h2 className="text-3xl font-bold italic text-navy">Welcome back</h2>
        <p className="mt-2 text-base text-stone-600">
          Sign in to your care circle or choose a quick demo account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl">
          {/* Quick Demo Selector for Evaluators */}
          <div className="mb-6 pb-6 border-b-2 border-stone-100">
            <p className="text-xs font-black uppercase tracking-wider text-teal mb-3">
              ⚡ Evaluator 1-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('ramesh@saathicare.com', 'profile_owner')}
                className="p-2 rounded-xl bg-teal/10 hover:bg-teal hover:text-white text-navy font-bold text-xs flex flex-col items-center justify-center transition-colors border border-teal/20"
              >
                <Heart className="w-4 h-4 mb-1" />
                <span>Elderly (Ramesh)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('priya@saathicare.com', 'family_member')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-accent hover:text-white text-navy font-bold text-xs flex flex-col items-center justify-center transition-colors border border-accent/20"
              >
                <Users className="w-4 h-4 mb-1" />
                <span>Family (Priya)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('sunita@saathicare.com', 'caregiver')}
                className="p-2 rounded-xl bg-soft-mint hover:bg-teal hover:text-white text-navy font-bold text-xs flex flex-col items-center justify-center transition-colors border border-teal/20"
              >
                <Stethoscope className="w-4 h-4 mb-1" />
                <span>Caregiver (Sunita)</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="font-semibold text-teal hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-base text-stone-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-teal hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
