import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card, Select } from '@/components/ui';
import { Heart, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [primaryRole, setPrimaryRole] = useState<'profile_owner' | 'family_member' | 'caregiver'>('profile_owner');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await register({
        displayName,
        email,
        phone,
        password,
        primaryRole,
      });

      if (user.primaryRole === 'profile_owner') {
        navigate('/onboarding/profile');
      } else {
        navigate('/onboarding/verify-passcode');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
        <h2 className="text-3xl font-bold italic text-navy">Create your account</h2>
        <p className="mt-2 text-base text-stone-600">
          Join or create a trusted care circle in moments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Full Name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <Input
              label="Phone Number (for SMS reminders)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
            />

            <Select
              label="Your Primary Role"
              value={primaryRole}
              onChange={(e) => setPrimaryRole(e.target.value as any)}
              options={[
                { value: 'profile_owner', label: 'Older Adult (Managing my health)' },
                { value: 'family_member', label: 'Family Member (Son, Daughter, Relative)' },
                { value: 'caregiver', label: 'Professional Caregiver / Nurse' },
              ]}
              required
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
              Continue to Setup
            </Button>
          </form>

          <div className="mt-6 text-center text-base text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
