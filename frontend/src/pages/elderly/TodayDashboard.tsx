import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Modal, Spinner } from '@/components/ui';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Calendar,
  CheckSquare,
  PhoneCall,
  Volume2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function TodayDashboard() {
  const { user } = useAuth();
  const { speak } = useTheme();

  const [profile, setProfile] = useState<any>(null);
  const [doses, setDoses] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Skip dose modal state
  const [skipModalDoseId, setSkipModalDoseId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch care profiles accessible by current user
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const todayStr = new Date().toISOString().split('T')[0];

      // Fetch today's doses, routines, and appointments in parallel
      const [dosesRes, routinesRes, apptsRes] = await Promise.all([
        api.get(`/doses/${activeProf._id}/doses?date=${todayStr}`),
        api.get(`/routines/${activeProf._id}/routines`),
        api.get(`/appointments/${activeProf._id}/appointments?status=scheduled`),
      ]);

      setDoses(dosesRes.data.doses || []);
      setRoutines(routinesRes.data.routines || []);
      setAppointments(apptsRes.data.appointments || []);
    } catch (err) {
      console.error('Failed fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmDose = async (doseId: string) => {
    setActionLoading(doseId);
    try {
      await api.post(`/doses/${doseId}/confirm`);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record dose as taken.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSnoozeDose = async (doseId: string, minutes: number = 15) => {
    setActionLoading(doseId);
    try {
      await api.post(`/doses/${doseId}/snooze`, { minutes });
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to snooze reminder.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkipDose = async () => {
    if (!skipModalDoseId) return;
    setActionLoading(skipModalDoseId);
    try {
      await api.post(`/doses/${skipModalDoseId}/skip`, { reason: skipReason });
      setSkipModalDoseId(null);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record skip.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteRoutine = async (routineId: string) => {
    try {
      await api.post(`/routines/complete/${routineId}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed completing routine:', err);
    }
  };

  // Find the next upcoming dose or overdue dose
  const nextDose = doses.find((d) => d.status === 'due' || d.status === 'scheduled' || d.status === 'unconfirmed');

  // Text for Speech Synthesis Read Aloud
  const readAloudSummary = profile
    ? `Namaste ${profile.fullName}. Today is ${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}. You have ${
        doses.filter((d) => d.status !== 'taken').length
      } medication doses remaining today. ${
        nextDose ? `Your next medication is ${nextDose.medication?.name} scheduled for ${new Date(nextDose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : 'All medications are up to date!'
      } ${appointments.length > 0 ? `You also have an upcoming appointment with Dr. ${appointments[0].doctorName}.` : ''}`
    : '';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4 text-xl font-bold italic text-navy">Loading today's care schedule...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profileId={profile?._id} readAloudText={readAloudSummary}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 shadow-sm">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy">
              Namaste, {profile?.fullName || user?.displayName} 🙏
            </h1>
            <p className="text-stone-600 text-lg mt-1 font-medium">
              Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => speak(readAloudSummary)}
              className="px-5 py-3 rounded-2xl bg-soft-mint text-teal font-extrabold text-base hover:bg-teal hover:text-white transition-all flex items-center space-x-2 border-2 border-teal/20 min-h-[48px]"
            >
              <Volume2 className="w-5 h-5" />
              <span>Voice Readout</span>
            </button>
            <button
              onClick={fetchDashboardData}
              className="p-3 rounded-2xl border-2 border-stone-300 text-stone-600 hover:border-teal hover:text-teal transition-all min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Refresh schedule"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Priority Action: Next Medication Dose */}
        {nextDose ? (
          <Card
            variant={nextDose.status === 'unconfirmed' ? 'warning' : 'highlight'}
            className="p-8 border-4 ring-8 ring-teal/10"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-teal bg-soft-mint px-3 py-1 rounded-full border border-teal/20">
                ⭐ Priority Action • Next Due Dose
              </span>
              <Badge status={nextDose.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal/15 text-teal flex items-center justify-center">
                    <Pill className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black italic text-navy">
                      {nextDose.medication?.name}
                    </h2>
                    <p className="text-lg font-bold text-teal">
                      {nextDose.medication?.strength} {nextDose.medication?.unit} • {nextDose.medication?.form}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-canvas border border-stone-200">
                  <p className="text-stone-700 text-lg font-medium">
                    <strong>Instructions:</strong> {nextDose.medication?.instructions || 'Take with water'}
                  </p>
                  <p className="text-stone-500 text-base mt-1">
                    Scheduled Time:{' '}
                    <strong>
                      {new Date(nextDose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>{' '}
                    ({nextDose.medication?.mealContext?.replace('_', ' ') || 'no meal restriction'})
                  </p>
                </div>
              </div>

              {/* Huge 48px+ Elderly Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => handleConfirmDose(nextDose._id)}
                  variant="primary"
                  size="xl"
                  className="w-full text-2xl shadow-lg"
                  isLoading={actionLoading === nextDose._id}
                >
                  <CheckCircle2 className="w-7 h-7 mr-2" /> Mark as Taken
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSnoozeDose(nextDose._id, 15)}
                    variant="secondary"
                    size="md"
                    className="w-full text-base"
                    disabled={actionLoading === nextDose._id}
                  >
                    <Clock className="w-4 h-4 mr-1" /> Snooze 15m
                  </Button>
                  <Button
                    onClick={() => setSkipModalDoseId(nextDose._id)}
                    variant="outline"
                    size="md"
                    className="w-full text-base text-stone-600 border-stone-300 hover:text-red-600 hover:border-red-400"
                    disabled={actionLoading === nextDose._id}
                  >
                    Skip Dose...
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center bg-soft-mint/50 border-2 border-teal/30">
            <CheckCircle2 className="w-16 h-16 text-teal mx-auto mb-3" />
            <h2 className="text-3xl font-black italic text-navy">All caught up for now!</h2>
            <p className="text-stone-600 text-lg mt-1">
              You have taken all your scheduled medications for this moment. Wonderful job maintaining your routine.
            </p>
          </Card>
        )}

        {/* 2-Column Section: Today's Full Schedule & Wellness Routines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Medications List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black italic text-navy flex items-center">
                <Pill className="w-6 h-6 mr-2 text-teal" /> Today's Medications ({doses.length})
              </h2>
            </div>

            <div className="space-y-3">
              {doses.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border text-center text-stone-500">
                  No medications scheduled for today.
                </div>
              ) : (
                doses.map((dose) => {
                  const isTaken = dose.status === 'taken';
                  return (
                    <div
                      key={dose._id}
                      className={`p-5 rounded-2xl bg-white border-2 transition-all flex items-center justify-between ${
                        isTaken ? 'border-emerald-200 bg-emerald-50/30 opacity-80' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-teal/15 text-teal'
                          }`}
                        >
                          {new Date(dose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-navy">{dose.medication?.name}</p>
                          <p className="text-xs text-stone-500">
                            {dose.medication?.strength} {dose.medication?.unit} • {dose.medication?.instructions}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge status={dose.status} />
                        {!isTaken && (
                          <Button
                            onClick={() => handleConfirmDose(dose._id)}
                            variant="primary"
                            size="sm"
                            isLoading={actionLoading === dose._id}
                          >
                            Take
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Routines & Care Checklist */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black italic text-navy flex items-center">
              <CheckSquare className="w-6 h-6 mr-2 text-teal" /> Daily Health Routines
            </h2>

            <div className="space-y-3">
              {routines.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border text-center text-stone-500">
                  No daily routines added yet.
                </div>
              ) : (
                routines.map((routine) => {
                  const isDone = routine.todayCompleted;
                  return (
                    <div
                      key={routine._id}
                      className={`p-5 rounded-2xl bg-white border-2 transition-all flex items-center justify-between ${
                        isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-stone-200'
                      }`}
                    >
                      <div>
                        <p className={`text-lg font-bold ${isDone ? 'line-through text-stone-500' : 'text-navy'}`}>
                          {routine.title}
                        </p>
                        <p className="text-xs text-stone-500">{routine.description}</p>
                      </div>

                      <button
                        onClick={() => !isDone && handleCompleteRoutine(routine._id)}
                        disabled={isDone}
                        className={`px-4 py-2 rounded-xl font-bold text-sm min-h-[44px] flex items-center space-x-1 ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-soft-mint text-teal hover:bg-teal hover:text-white transition-colors'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isDone ? 'Done' : 'Mark Done'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Emergency Assistance Banner */}
        <div className="p-6 rounded-3xl bg-amber-50 border-3 border-accent flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic text-navy">Emergency Assistance Contacts</h3>
              <p className="text-stone-700 text-base">
                Primary: {profile?.emergencyContacts?.[0]?.name || 'Priya Sharma'} (
                <a href={`tel:${profile?.emergencyContacts?.[0]?.phone}`} className="font-bold underline text-accent">
                  {profile?.emergencyContacts?.[0]?.phone || '+91 98765 43211'}
                </a>
                ) • India Emergency: 112
              </p>
            </div>
          </div>
          <a
            href={`tel:${profile?.emergencyContacts?.[0]?.phone || '112'}`}
            className="px-6 py-3 bg-accent text-white font-extrabold rounded-2xl text-lg hover:bg-accent/90 shadow-md min-h-[48px] flex items-center justify-center whitespace-nowrap"
          >
            Call Primary Contact
          </a>
        </div>
      </div>

      {/* Skip Dose Reason Modal */}
      <Modal
        isOpen={!!skipModalDoseId}
        onClose={() => setSkipModalDoseId(null)}
        title="Reason for Skipping Dose"
      >
        <div className="space-y-4">
          <p className="text-stone-600 text-base">
            Please record why you are skipping this dose. This information is transparently logged in your care timeline so your family and doctor can stay informed.
          </p>
          <div className="space-y-2">
            {[
              'Feeling nauseous / unwell',
              'Already took it earlier',
              'Doctor advised temporary pause',
              'Medication out of stock',
              'Other reason',
            ].map((reason) => (
              <label
                key={reason}
                className="flex items-center space-x-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="skipReason"
                  checked={skipReason === reason}
                  onChange={() => setSkipReason(reason)}
                  className="w-4 h-4 text-teal"
                />
                <span className="font-semibold text-navy">{reason}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={() => setSkipModalDoseId(null)} variant="ghost" size="md">
              Cancel
            </Button>
            <Button onClick={handleSkipDose} variant="danger" size="md" isLoading={actionLoading === skipModalDoseId}>
              Confirm Skip
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
