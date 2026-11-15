import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Select, Card } from '@/components/ui';
import { Heart, ArrowRight, AlertCircle } from 'lucide-react';

export default function CreateProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [primaryPhysician, setPrimaryPhysician] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/profiles', {
        fullName,
        dateOfBirth,
        gender,
        bloodGroup,
        chronicConditions: chronicConditions.split(',').map((c) => c.trim()).filter(Boolean),
        allergies: allergies.split(',').map((a) => a.trim()).filter(Boolean),
        primaryPhysician,
        emergencyContacts: [
          {
            name: emergencyName,
            relationship: 'Primary Contact',
            phone: emergencyPhone,
            isPrimary: true,
          },
        ],
      });

      updateUser({ hasCompletedOnboarding: true });
      navigate('/onboarding/care-circle', { state: { profileId: res.data.careProfile._id } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create care profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-sm font-black uppercase tracking-wider text-teal">Step 2 of 3</span>
          <h1 className="text-3xl font-black italic text-navy mt-1">Set Up Your Health Profile</h1>
          <p className="text-base text-stone-600">
            This creates your personal medical profile. You retain full control over who sees this data.
          </p>
        </div>

        <Card className="shadow-lg">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Legal Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />

              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  { value: '', label: 'Select gender (optional)' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                ]}
              />

              <Select
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                options={[
                  { value: '', label: 'Select blood group (optional)' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'Unknown', label: 'Unknown' },
                ]}
              />
            </div>

            <Input
              label="Known Allergies (comma separated)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Peanuts"
            />

            <Input
              label="Chronic Health Conditions (comma separated)"
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="e.g. Hypertension, Diabetes Type 2"
            />

            <Input
              label="Primary Doctor / Physician Name"
              value={primaryPhysician}
              onChange={(e) => setPrimaryPhysician(e.target.value)}
              placeholder="Physician Name"
            />

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-accent/20">
              <h3 className="text-base font-bold text-navy mb-3">Primary Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Name & Relation"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Family Contact Name"
                  required
                />
                <Input
                  label="Emergency Phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Emergency Phone Number"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={isLoading}>
              Save Profile & Continue <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
