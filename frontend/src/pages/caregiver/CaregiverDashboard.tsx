import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { Stethoscope, CheckCircle2, Clock, Users, ArrowRight, ClipboardList, ShieldCheck } from 'lucide-react';

export default function CaregiverDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [dueDoses, setDueDoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [administering, setAdministering] = useState<string | null>(null);

  const fetchCaregiverData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profiles');
      const list = res.data.careProfiles || [];
      setProfiles(list);

      const target = list[0];
      if (target) {
        setSelectedProfile(target);
        const todayStr = new Date().toISOString().split('T')[0];
        const dosesRes = await api.get(`/doses/${target._id}/doses?date=${todayStr}`);
        setDueDoses(dosesRes.data.doses || []);
      }
    } catch (err) {
      console.error('Failed fetching caregiver data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregiverData();
  }, []);

  const handleAdminister = async (doseId: string) => {
    setAdministering(doseId);
    try {
      await api.post(`/doses/${doseId}/confirm`, {
        notes: 'Administered by authorized home care nurse / caregiver',
      });
      await fetchCaregiverData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record administration.');
    } finally {
      setAdministering(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4 text-xl font-bold italic text-navy">Loading Caregiver Console...</p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingDoses = dueDoses.filter((d) => d.status !== 'taken');

  return (
    <DashboardLayout profileId={selectedProfile?._id}>
      <div className="space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-teal bg-soft-mint px-3 py-1 rounded-full">
              Caregiver Administration Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy mt-2">
              Patient: {selectedProfile?.fullName || 'Assigned Patient'}
            </h1>
            <p className="text-stone-600 text-base mt-1">
              Authorized to administer medications, log vitals, and coordinate appointments.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/caregiver/tasks">
              <Button variant="primary" size="md">
                <ClipboardList className="w-5 h-5 mr-1" /> View Full Task Queue
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal/15 text-teal flex items-center justify-center flex-shrink-0">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500 uppercase">Pending Administrations</p>
              <h3 className="text-3xl font-black text-navy mt-1">
                {pendingDoses.length} <span className="text-sm font-normal text-stone-500">remaining today</span>
              </h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500 uppercase">Confirmed Given</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">
                {dueDoses.filter((d) => d.status === 'taken').length}
              </h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-soft-mint text-teal flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500 uppercase">Audit Logging</p>
              <h3 className="text-xl font-bold text-teal mt-1">
                Active & Enforced
              </h3>
            </div>
          </Card>
        </div>

        {/* Administration Task List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold italic text-navy flex items-center">
              <Stethoscope className="w-6 h-6 mr-2 text-teal" /> Medication Administration Schedule
            </h2>
            <span className="text-xs font-semibold text-stone-500">
              All administration events record your caregiver ID in the audit trail.
            </span>
          </div>

          <div className="space-y-4">
            {dueDoses.length === 0 ? (
              <p className="text-stone-500 text-center py-8">No medication tasks for today.</p>
            ) : (
              dueDoses.map((dose) => {
                const isTaken = dose.status === 'taken';
                return (
                  <div
                    key={dose._id}
                    className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isTaken ? 'bg-emerald-50/40 border-emerald-200' : 'bg-canvas border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-black text-teal">
                          {new Date(dose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Badge status={dose.status} />
                      </div>
                      <h4 className="text-xl font-bold text-navy">{dose.medication?.name}</h4>
                      <p className="text-sm text-stone-600">
                        {dose.medication?.strength} {dose.medication?.unit} • {dose.medication?.instructions}
                      </p>
                      {isTaken && (
                        <p className="text-xs text-emerald-800 font-semibold mt-1">
                          ✓ Confirmed taken by {dose.takenBy?.displayName || 'User'}
                        </p>
                      )}
                    </div>

                    {!isTaken && (
                      <Button
                        onClick={() => handleAdminister(dose._id)}
                        variant="primary"
                        size="md"
                        isLoading={administering === dose._id}
                      >
                        Confirm Given
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
