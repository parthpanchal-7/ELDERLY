import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Modal, Input, Spinner } from '@/components/ui';
import { Calendar, Plus, MapPin, Download, CheckCircle2, Clock } from 'lucide-react';

export default function AppointmentsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [clinicOrHospital, setClinicOrHospital] = useState('Apollo Hospital');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const apptRes = await api.get(`/appointments/${activeProf._id}/appointments`);
      setAppointments(apptRes.data.appointments || []);
    } catch (err) {
      console.error('Failed fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

    try {
      await api.post(`/appointments/${profile._id}/appointments`, {
        title,
        doctorName,
        specialty,
        clinicOrHospital,
        locationAddress,
        appointmentDateTime,
        notes,
      });

      setIsModalOpen(false);
      setTitle('');
      setDoctorName('');
      await fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadICS = (appointmentId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.open(`${apiUrl}/api/appointments/detail/${appointmentId}/ics`, '_blank');
  };

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Doctor Appointments</h1>
            <p className="text-stone-600 text-lg">
              Keep track of clinical visits, tests, and export reminders to your digital calendar.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
            <Plus className="w-5 h-5 mr-1" /> Add Appointment
          </Button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : appointments.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-12 h-12 text-teal mx-auto mb-3" />
            <h3 className="text-2xl font-bold italic text-navy">No scheduled appointments</h3>
            <p className="text-stone-600 text-base mt-1 mb-6">
              Add upcoming clinic or hospital visits to receive alerts before departure.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
              <Plus className="w-5 h-5 mr-1" /> Schedule Appointment
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => {
              const dt = new Date(appt.appointmentDateTime);
              const isPast = dt < new Date();

              return (
                <Card key={appt._id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-teal bg-soft-mint px-3 py-1 rounded-full">
                        {appt.specialty || 'General Care'}
                      </span>
                      <span className={`text-xs font-bold ${isPast ? 'text-stone-400' : 'text-accent'}`}>
                        {isPast ? 'Completed / Past' : 'Upcoming'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold italic text-navy">{appt.title}</h3>
                    <p className="text-base font-bold text-stone-700 mt-1">Dr. {appt.doctorName}</p>

                    <div className="mt-4 p-4 rounded-2xl bg-canvas border border-stone-200 space-y-2 text-sm">
                      <p className="flex items-center font-bold text-navy">
                        <Clock className="w-4 h-4 mr-2 text-teal" />
                        {dt.toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="flex items-center text-stone-600">
                        <MapPin className="w-4 h-4 mr-2 text-teal flex-shrink-0" />
                        {appt.clinicOrHospital}
                        {appt.locationAddress ? ` • ${appt.locationAddress}` : ''}
                      </p>
                      {appt.notes && (
                        <p className="text-stone-500 italic pt-1 border-t border-stone-200">
                          Notes: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
                    <button
                      onClick={() => downloadICS(appt._id)}
                      className="inline-flex items-center text-sm font-bold text-teal hover:underline"
                    >
                      <Download className="w-4 h-4 mr-1" /> Export .ics (Calendar)
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Doctor Appointment" maxWidth="md">
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <Input
            label="Appointment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quarterly Cardiology Review & ECG"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Doctor Name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. Alok Mehta"
              required
            />
            <Input
              label="Medical Specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Cardiology"
            />
          </div>

          <Input
            label="Clinic / Hospital Name"
            value={clinicOrHospital}
            onChange={(e) => setClinicOrHospital(e.target.value)}
            placeholder="Apollo Hospital Indirapuram"
            required
          />

          <Input
            label="Date & Time"
            type="datetime-local"
            value={appointmentDateTime}
            onChange={(e) => setAppointmentDateTime(e.target.value)}
            required
          />

          <Input
            label="Address / Location Details"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Plot 1, Ahinsa Khand 2, Ghaziabad"
          />

          <Input
            label="Special Preparation Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fast for 8 hours prior to blood test"
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={() => setIsModalOpen(false)} variant="ghost" size="md" type="button">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Save Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
