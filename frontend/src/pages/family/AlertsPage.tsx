import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Spinner, Badge } from '@/components/ui';
import { AlertTriangle, Clock, Pill } from 'lucide-react';

export default function AlertsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const profRes = await api.get('/profiles');
        const activeProf = profRes.data.careProfiles?.[0];
        if (!activeProf) {
          setLoading(false);
          return;
        }
        setProfile(activeProf);

        const res = await api.get(`/notifications/${activeProf._id}/notifications`);
        // Filter alerts
        const list = res.data.notifications || [];
        setAlerts(list.filter((n: any) => n.type.includes('escalation') || n.type.includes('missed') || n.type.includes('alert')));
      } catch (err) {
        console.error('Failed fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Care Circle Escalations & Alerts</h1>
          <p className="text-stone-600 text-lg">
            Proactive alerts triggered when scheduled doses are unconfirmed past the grace period.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : alerts.length === 0 ? (
          <Card className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-teal mx-auto mb-3" />
            <h3 className="text-2xl font-bold italic text-navy">Zero active alerts</h3>
            <p className="text-stone-600 text-base mt-1">
              All scheduled doses for your loved one have been confirmed or are on schedule.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="p-5 rounded-2xl bg-white border-2 border-accent/40 shadow-sm flex items-start space-x-4"
              >
                <div className="p-3 bg-amber-50 text-accent rounded-xl mt-1 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold italic text-navy">{alert.title}</h3>
                  <p className="text-stone-700 text-base mt-1">{alert.message}</p>
                  <p className="text-xs text-stone-500 mt-2">
                    Logged at {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Channel: {alert.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
