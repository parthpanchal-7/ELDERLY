import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@/components/ui';
import { Heart, Users, Stethoscope, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types';

export default function RoleSelectionPage() {
  const { user, updateUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.primaryRole || 'profile_owner');
  const navigate = useNavigate();

  const handleContinue = () => {
    updateUser({ primaryRole: selectedRole });
    if (selectedRole === 'profile_owner') {
      navigate('/onboarding/profile');
    } else {
      navigate('/onboarding/verify-passcode');
    }
  };

  const roles = [
    {
      id: 'profile_owner' as UserRole,
      title: 'I am an Older Adult',
      tagline: 'Profile Owner',
      desc: 'Set up your medications, appointments, daily wellness routines, and invite family or caregivers to your circle.',
      icon: Heart,
      color: 'teal',
    },
    {
      id: 'family_member' as UserRole,
      title: 'I am a Family Member',
      tagline: 'Son, Daughter, Relative',
      desc: 'Join a loved one’s care circle using an invitation passcode to stay updated on doses, appointments, and care alerts.',
      icon: Users,
      color: 'accent',
    },
    {
      id: 'caregiver' as UserRole,
      title: 'I am a Caregiver',
      tagline: 'Nurse or Professional Aide',
      desc: 'Coordinate assigned patient visits, log medication administrations, and document vital health observations.',
      icon: Stethoscope,
      color: 'navy',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-sm font-black uppercase tracking-wider text-teal">Step 1 of 3</span>
          <h1 className="text-3xl sm:text-4xl font-black italic text-navy mt-2">
            How will you be using SaathiCare?
          </h1>
          <p className="text-lg text-stone-600 mt-2">
            Select your role to personalize your dashboard and privacy controls.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`p-6 rounded-3xl border-3 cursor-pointer transition-all flex items-start space-x-5 min-h-[96px] ${
                  isSelected
                    ? 'border-teal bg-white shadow-md ring-4 ring-teal/20'
                    : 'border-stone-200 bg-white/70 hover:border-stone-300'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-teal text-white' : 'bg-soft-mint text-teal'
                  }`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold italic text-navy">{r.title}</h3>
                    <span className="text-xs font-black uppercase tracking-wider text-stone-400">
                      {r.tagline}
                    </span>
                  </div>
                  <p className="text-stone-600 text-base mt-2 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleContinue} variant="primary" size="lg" className="w-full sm:w-auto">
            Continue to Next Step <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
