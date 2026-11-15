import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Modal, Input, Select, Spinner } from '@/components/ui';
import { Users, UserPlus, ShieldAlert, KeyRound, Copy, Check, Trash2 } from 'lucide-react';

export default function CareCirclePage() {
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite form
  const [role, setRole] = useState<'family_member' | 'caregiver'>('family_member');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [newPasscode, setNewPasscode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCareCircle = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const [membersRes, invitesRes] = await Promise.all([
        api.get(`/care-circles/${activeProf._id}/members`),
        api.get(`/care-circles/${activeProf._id}/invitations`),
      ]);

      setMembers(membersRes.data.members || []);
      setInvitations(invitesRes.data.invitations || []);
    } catch (err) {
      console.error('Failed fetching care circle:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareCircle();
  }, []);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

    try {
      const res = await api.post(`/care-circles/${profile._id}/invitations`, {
        role,
        relationshipToOwner: relationship,
        inviteeEmail: email || undefined,
      });

      setNewPasscode(res.data.passcode);
      await fetchCareCircle();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed generating invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to revoke care circle access for ${memberName}? Their access will be immediately cut off.`)) {
      return;
    }

    try {
      await api.delete(`/care-circles/${profile._id}/members/${memberId}`);
      await fetchCareCircle();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke member.');
    }
  };

  const copyCode = () => {
    if (newPasscode) {
      navigator.clipboard.writeText(newPasscode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Care Circle & Permissions</h1>
            <p className="text-stone-600 text-lg">
              Authorized family members and caregivers granted access to your healthcare records.
            </p>
          </div>
          <Button onClick={() => { setIsInviteModalOpen(true); setNewPasscode(null); }} variant="primary" size="md">
            <UserPlus className="w-5 h-5 mr-1" /> Invite New Member
          </Button>
        </div>

        {/* Security Box */}
        <div className="p-5 rounded-2xl bg-white border-2 border-stone-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-soft-mint text-teal rounded-xl flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-sm text-stone-700 leading-relaxed">
            <p className="font-bold text-navy text-base">Your Privacy Guarantee</p>
            <p>
              Only individuals with an authenticated SaathiCare account and a valid 6-digit passcode can view your profile.
              Passcodes expire in 24 hours. You can revoke any member's access at any time below.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic text-navy">Active Care Circle Members ({members.length})</h2>

            {members.length === 0 ? (
              <Card className="text-center py-10">
                <Users className="w-12 h-12 text-teal mx-auto mb-2" />
                <p className="text-stone-600 text-base">No active members yet. Generate an invitation passcode above.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {members.map((m) => (
                  <Card key={m._id} className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-soft-mint text-teal border border-teal/20">
                          {m.role === 'caregiver' ? 'Caregiver / Nurse' : 'Family Member'}
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          Joined {new Date(m.acceptedAt || m.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold italic text-navy">{m.user?.displayName}</h3>
                      <p className="text-sm font-semibold text-stone-600">Relation: {m.relationshipToOwner}</p>
                      <p className="text-xs text-stone-500 mt-1">{m.user?.email} • {m.user?.phone}</p>

                      <div className="mt-4 pt-3 border-t border-stone-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Granted Permissions</p>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          {m.permissions?.canViewMedications && (
                            <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700">View Meds</span>
                          )}
                          {m.permissions?.canConfirmDoses && (
                            <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-800">Confirm Doses</span>
                          )}
                          {m.permissions?.canViewAppointments && (
                            <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700">Appointments</span>
                          )}
                          {m.permissions?.canReceiveEscalations && (
                            <span className="px-2 py-0.5 bg-amber-100 rounded text-amber-800">Escalation Alerts</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
                      <Button
                        onClick={() => handleRevoke(m._id, m.user?.displayName)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Revoke Access
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <h3 className="text-xl font-bold italic text-navy mb-4">Pending Passcode Invitations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {invitations.map((inv) => (
                    <div key={inv._id} className="p-4 rounded-2xl bg-white border-2 border-dashed border-stone-300 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-navy text-base">{inv.relationshipToOwner} ({inv.role})</p>
                        <p className="text-xs text-stone-500">
                          {inv.inviteeEmail || 'Passcode shared manually'} • Expires {new Date(inv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Generate Care Passcode">
        {newPasscode ? (
          <div className="text-center py-4 space-y-4">
            <KeyRound className="w-12 h-12 text-teal mx-auto" />
            <h3 className="text-xl font-bold italic text-navy">Passcode Ready to Share!</h3>
            <p className="text-sm text-stone-600">
              Provide this code to your {role === 'caregiver' ? 'caregiver' : 'family member'}. They can enter it on their onboarding screen.
            </p>

            <div className="p-5 rounded-2xl bg-canvas border-2 border-dashed border-teal/40">
              <div className="text-4xl font-mono font-black tracking-[0.4em] text-navy">
                {newPasscode}
              </div>
              <p className="text-xs text-stone-500 mt-2">Valid for 24 hours</p>
            </div>

            <Button onClick={copyCode} variant="primary" size="md" className="w-full">
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? 'Copied to Clipboard!' : 'Copy 6-Digit Passcode'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <Select
              label="Select Role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              options={[
                { value: 'family_member', label: 'Family Member (View adherence, receive alerts)' },
                { value: 'caregiver', label: 'Professional Caregiver (Can confirm doses & log observations)' },
              ]}
            />

            <Input
              label="Relationship to You"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Son, Daughter, Nurse"
              required
            />

            <Input
              label="Invitee Email (Optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="relative@example.com (dispatches email reminder)"
            />

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button onClick={() => setIsInviteModalOpen(false)} variant="ghost" size="md" type="button">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Generate Passcode
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
