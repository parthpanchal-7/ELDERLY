import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import { Heart, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        <h2 className="text-3xl font-bold italic text-navy">Reset your password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-soft-mint text-teal flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold italic text-navy mb-2">Check your email</h3>
              <p className="text-stone-600 text-base mb-6">
                If an account exists for {email}, a password recovery link has been dispatched.
              </p>
              <Link to="/login">
                <Button variant="outline" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-stone-600 text-base">
                Enter your registered email address and we will send you secure recovery instructions.
              </p>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Send Recovery Link
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-sm font-bold text-teal hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
