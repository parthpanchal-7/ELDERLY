import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Input, Select, Spinner } from '@/components/ui';
import { User, Heart, Shield, Download, Plus, Activity } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'vitals' | 'export'>('personal');

  // New vital observation form state
  const [obsType, setObsType] = useState('blood_pressure');
  const [obsValue, setObsValue] = useState('');
  const [obsSecondary, setObsSecondary] = useState('');
  const [obsContext, setObsContext] = useState('');
  const [isAddingObs, setIsAddingObs] = useState(false);

  const fetchProfileAndVitals = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const obsRes = await api.get(`/observations/${activeProf._id}/observations`);
      setObservations(obsRes.data.observations || []);
    } catch (err) {
      console.error('Failed fetching profile/vitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndVitals();
  }, []);

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsAddingObs(true);

    try {
      await api.post(`/observations/${profile._id}/observations`, {
        type: obsType,
        value: Number(obsValue),
        secondaryValue: obsType === 'blood_pressure' ? Number(obsSecondary) : undefined,
        unit: obsType === 'blood_pressure' ? 'mmHg' : obsType === 'blood_sugar' ? 'mg/dL' : 'kg',
        userEnteredContext: obsContext,
      });

      setObsContext('');
      await fetchProfileAndVitals();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record health observation.');
    } finally {
      setIsAddingObs(false);
    }
  };

  const handleExportData = async () => {
    if (!profile) return;
    try {
      const res = await api.get(`/profiles/${profile._id}/export`);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `saathicare-health-export-${profile.fullName.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export profile data.');
    }
  };

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Health Profile & Vitals</h1>
          <p className="text-stone-600 text-lg">
            Complete clinical profile, recorded vital signs, and patient data export.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b-2 border-stone-200 overflow-x-auto space-x-4">
          {[
            { id: 'personal', label: 'Personal & Doctor' },
            { id: 'medical', label: 'Conditions & Allergies' },
            { id: 'vitals', label: 'Health Observations (Vitals)' },
            { id: 'export', label: 'Data Export & Consent' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-lg font-bold transition-all border-b-4 whitespace-nowrap -mb-0.5 ${
                activeTab === tab.id ? 'border-teal text-teal' : 'border-transparent text-stone-500 hover:text-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div>
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <Card className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold italic text-navy mb-4">Patient Demographics</h3>
                    <div className="space-y-3 text-base">
                      <p><strong className="text-stone-600">Full Name:</strong> {profile?.fullName}</p>
                      <p><strong className="text-stone-600">Date of Birth:</strong> {new Date(profile?.dateOfBirth).toLocaleDateString()}</p>
                      <p><strong className="text-stone-600">Gender:</strong> {profile?.gender || 'Not specified'}</p>
                      <p><strong className="text-stone-600">Blood Group:</strong> {profile?.bloodGroup || 'B+'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold italic text-navy mb-4">Primary Physician</h3>
                    <div className="space-y-3 text-base">
                      <p><strong className="text-stone-600">Doctor:</strong> {profile?.primaryPhysician || 'Not specified'}</p>
                      <p><strong className="text-stone-600">Phone:</strong> {profile?.primaryPhysicianPhone || 'Not specified'}</p>
                      <p><strong className="text-stone-600">Email:</strong> {profile?.primaryPhysicianEmail || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200">
                  <h3 className="text-xl font-bold italic text-navy mb-4">Primary Emergency Contacts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile?.emergencyContacts?.map((c: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-accent/20">
                        <p className="font-bold text-navy text-lg">{c.name}</p>
                        <p className="text-sm text-stone-600">{c.relationship}</p>
                        <p className="text-base font-black text-accent mt-2">{c.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Medical Tab */}
            {activeTab === 'medical' && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold italic text-navy mb-3">Diagnosed Chronic Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.chronicConditions?.map((cond: string, idx: number) => (
                      <span key={idx} className="px-4 py-2 rounded-xl bg-canvas border-2 border-stone-300 font-bold text-navy text-base">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200">
                  <h3 className="text-xl font-bold italic text-navy mb-3">Known Substance / Drug Allergies</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.allergies?.map((allergy: string, idx: number) => (
                      <span key={idx} className="px-4 py-2 rounded-xl bg-red-50 border-2 border-red-200 font-bold text-red-800 text-base">
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div className="space-y-6">
                {/* Form to log new vital reading */}
                <Card>
                  <h3 className="text-xl font-bold italic text-navy mb-4">Log Health Observation (Vital Sign)</h3>
                  <form onSubmit={handleAddObservation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <Select
                      label="Observation Type"
                      value={obsType}
                      onChange={(e) => setObsType(e.target.value)}
                      options={[
                        { value: 'blood_pressure', label: 'Blood Pressure (Systolic/Diastolic)' },
                        { value: 'blood_sugar', label: 'Blood Sugar (Glucose)' },
                        { value: 'weight', label: 'Body Weight' },
                        { value: 'heart_rate', label: 'Heart Rate (Pulse)' },
                      ]}
                    />

                    <Input
                      label={obsType === 'blood_pressure' ? 'Systolic (mmHg)' : 'Value'}
                      type="number"
                      value={obsValue}
                      onChange={(e) => setObsValue(e.target.value)}
                      required
                    />

                    {obsType === 'blood_pressure' && (
                      <Input
                        label="Diastolic (mmHg)"
                        type="number"
                        value={obsSecondary}
                        onChange={(e) => setObsSecondary(e.target.value)}
                        required
                      />
                    )}

                    <Input
                      label="User Context"
                      value={obsContext}
                      onChange={(e) => setObsContext(e.target.value)}
                      placeholder="e.g. Fasting, Before Dinner"
                    />

                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
                      <Button type="submit" variant="primary" size="md" isLoading={isAddingObs}>
                        <Plus className="w-5 h-5 mr-1" /> Log Vital Reading
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Vitals History Table */}
                <Card>
                  <h3 className="text-xl font-bold italic text-navy mb-4">Recorded Observations History</h3>
                  {observations.length === 0 ? (
                    <p className="text-stone-500 text-center py-6">No observations recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-canvas border-b border-stone-200 text-navy font-bold">
                          <tr>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Reading</th>
                            <th className="p-3">Context</th>
                            <th className="p-3">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {observations.map((obs) => (
                            <tr key={obs._id} className="hover:bg-stone-50">
                              <td className="p-3 font-medium">
                                {new Date(obs.observedAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="p-3 font-bold uppercase text-teal text-xs">
                                {obs.type.replace('_', ' ')}
                              </td>
                              <td className="p-3 font-black text-navy text-base">
                                {obs.value}
                                {obs.secondaryValue ? ` / ${obs.secondaryValue}` : ''} {obs.unit}
                              </td>
                              <td className="p-3 text-stone-600">{obs.userEnteredContext || '—'}</td>
                              <td className="p-3 text-stone-500">{obs.recordedBy?.displayName || 'Self'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Export & Consent Tab */}
            {activeTab === 'export' && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold italic text-navy mb-2">Export Complete Patient Healthcare Records</h3>
                  <p className="text-stone-600 text-base leading-relaxed mb-6">
                    In compliance with patient data sovereignty and interoperability, you can download a full cryptographic JSON archive
                    of all your medication prescriptions, adherence history, doctor visits, vital observations, and care circle audit trails.
                  </p>

                  <Button onClick={handleExportData} variant="primary" size="lg">
                    <Download className="w-6 h-6 mr-2" /> Download Complete Health Record (JSON)
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
