import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button, Input, Select, Card } from '@/components/ui';
import { Users, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export default function InviteCareCirclePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileId = location.state?.profileId;

  const [role, setRole] = useState<'family_member' | 'caregiver'>('family_member');
  const [relationship, setRelationship] = useState('Daughter');
  const [email, setEmail] = useState('');
  const [passcodeData, setPasscodeData] = useState<{ passcode: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      navigate('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(`/care-circles/${profileId}/invitations`, {
        role,
        relationshipToOwner: relationship,
        inviteeEmail: email || undefined,
      });

      setPasscodeData({
        passcode: res.data.passcode,
        expiresAt: res.data.expiresAt,
      });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (passcodeData) {
      navigator.clipboard.writeText(passcodeData.passcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-sm font-black uppercase tracking-wider text-teal">Step 3 of 3</span>
          <h1 className="text-3xl font-black italic text-navy mt-1">Invite Your Care Circle</h1>
          <p className="text-base text-stone-600">
            Generate a short-lived 6-digit passcode to grant secure, authorized access to trusted family or nurses.
          </p>
        </div>

        <Card className="shadow-lg">
          {passcodeData ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-soft-mint text-teal flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold italic text-navy mb-2">Invitation Code Created!</h2>
              <p className="text-stone-600 text-sm mb-6">
                Share this one-time passcode with your {role === 'caregiver' ? 'caregiver' : 'family member'}.
              </p>

              <div className="p-6 rounded-3xl bg-canvas border-2 border-dashed border-teal/40 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">6-Digit Passcode</span>
                <div className="text-4xl font-black tracking-widest text-navy mt-1 font-mono">
                  {passcodeData.passcode}
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Expires in 24 hours • Limit 5 attempts
                </p>
              </div>

              <div className="flex gap-3 mb-6">
                <Button onClick={copyToClipboard} variant="outline" size="md" className="flex-1">
                  {copied ? <Check className="w-5 h-5 mr-2 text-teal" /> : <Copy className="w-5 h-5 mr-2" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Passcode'}
                </Button>
              </div>

              <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg" className="w-full">
                Go to Today's Dashboard <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <Select
                label="Role to Grant"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                options={[
                  { value: 'family_member', label: 'Family Member (View adherence, receive alerts)' },
                  { value: 'caregiver', label: 'Professional Caregiver (Can confirm doses & manage logs)' },
                ]}
              />

              <Input
                label="Relationship to You"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Daughter, Son, Home Nurse"
                required
              />

              <Input
                label="Their Email Address (Optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="relative@example.com (sends automatic email)"
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                  Generate Secure Passcode
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-stone-500 font-semibold text-sm hover:underline"
                >
                  I'll do this later, go to my dashboard →
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
