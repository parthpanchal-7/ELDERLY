import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react';

export default function TaskQueuePage() {
  const [profile, setProfile] = useState<any>(null);
  const [doses, setDoses] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/profiles');
        const activeProf = res.data.careProfiles?.[0];
        if (!activeProf) {
          setLoading(false);
          return;
        }
        setProfile(activeProf);

        const todayStr = new Date().toISOString().split('T')[0];
        const [dosesRes, routinesRes] = await Promise.all([
          api.get(`/doses/${activeProf._id}/doses?date=${todayStr}`),
          api.get(`/routines/${activeProf._id}/routines`),
        ]);

        setDoses(dosesRes.data.doses || []);
        setRoutines(routinesRes.data.routines || []);
      } catch (err) {
        console.error('Failed fetching task queue:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Caregiver Task Queue</h1>
          <p className="text-stone-600 text-lg">
            Complete checklist of medications, vital sign checks, and wellness routines for today.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-2xl font-bold italic text-navy mb-4">Medication Tasks</h2>
              <div className="space-y-3">
                {doses.map((d) => (
                  <div key={d._id} className="p-4 rounded-xl bg-canvas border border-stone-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-navy">{d.medication?.name}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(d.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {d.medication?.instructions}
                      </p>
                    </div>
                    <Badge status={d.status} />
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold italic text-navy mb-4">Routine Health Checks</h2>
              <div className="space-y-3">
                {routines.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl bg-canvas border border-stone-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-navy">{r.title}</p>
                      <p className="text-xs text-stone-500">{r.description}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${r.todayCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                      {r.todayCompleted ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
