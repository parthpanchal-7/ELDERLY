import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { Bell, Send, CheckCircle2, AlertTriangle, Clock, Pill } from 'lucide-react';

export default function NotificationsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchNotifs = async () => {
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
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleSendTestNotification = async () => {
    if (!profile) return;
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await api.post('/notifications/test', {
        careProfileId: profile._id,
        channel: 'email',
      });

      setTestResult(
        res.data.emailSent
          ? '✅ Real test email sent successfully via Resend to your registered email address!'
          : 'ℹ️ Test notification logged in-app and dispatched to development email console sink.'
      );
      await fetchNotifs();
    } catch (err: any) {
      setTestResult('Failed to dispatch test notification: ' + err.message);
    } finally {
      setTestSending(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'dose_escalation':
      case 'dose_missed':
        return <AlertTriangle className="w-5 h-5 text-accent" />;
      case 'refill_alert':
        return <Pill className="w-5 h-5 text-teal" />;
      default:
        return <Bell className="w-5 h-5 text-teal" />;
    }
  };

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Notifications & Care Alerts</h1>
            <p className="text-stone-600 text-lg">
              Audit log of all dose reminders, family escalations, and refill warnings.
            </p>
          </div>
          <Button onClick={handleSendTestNotification} variant="primary" size="md" isLoading={testSending}>
            <Send className="w-5 h-5 mr-1" /> Send Test Email / Alert
          </Button>
        </div>

        {testResult && (
          <div className="p-4 rounded-2xl bg-white border-2 border-teal shadow-sm text-base font-bold text-navy animate-fade-in">
            {testResult}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-12 h-12 text-teal mx-auto mb-3" />
            <h3 className="text-2xl font-bold italic text-navy">No alerts logged yet</h3>
            <p className="text-stone-600 text-base mt-1">
              Dose reminders, refill warnings, and care escalations will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-5 rounded-2xl bg-white border-2 transition-all flex items-start justify-between space-x-4 ${
                  n.status !== 'read' ? 'border-teal/40 bg-soft-mint/20' : 'border-stone-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-canvas border border-stone-200 mt-1 flex-shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold italic text-navy">{n.title}</h4>
                    <p className="text-stone-700 text-base mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-stone-500 mt-2 font-medium">
                      Channel: <span className="font-bold uppercase text-teal">{n.channel}</span> • Status:{' '}
                      <span className="font-bold text-navy">{n.status}</span> •{' '}
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {n.status !== 'read' && (
                  <span className="h-3 w-3 rounded-full bg-teal flex-shrink-0 mt-2" title="Unread" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
