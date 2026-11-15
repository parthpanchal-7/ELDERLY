import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Modal, Input, Select, Spinner } from '@/components/ui';
import { Pill, Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function MedicationsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New medication form state
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [unit, setUnit] = useState('mg');
  const [form, setForm] = useState('tablet');
  const [frequency, setFrequency] = useState('daily');
  const [time1, setTime1] = useState('09:00');
  const [time2, setTime2] = useState('21:00');
  const [mealContext, setMealContext] = useState('no_restriction');
  const [instructions, setInstructions] = useState('');
  const [currentInventory, setCurrentInventory] = useState('');
  const [refillThreshold, setRefillThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const medRes = await api.get(`/medications/${activeProf._id}/medications`);
      setMedications(medRes.data.medications || []);
    } catch (err) {
      console.error('Failed fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

    try {
      const scheduleTimes = frequency === 'twice_daily' ? [time1, time2] : [time1];

      await api.post(`/medications/${profile._id}/medications`, {
        name,
        strength,
        unit,
        form,
        frequency,
        scheduleTimes,
        mealContext,
        instructions,
        currentInventory: parseInt(currentInventory, 10) || 30,
        refillThreshold: parseInt(refillThreshold, 10) || 5,
      });

      setIsModalOpen(false);
      // Reset form
      setName('');
      setStrength('');
      await fetchMedications();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add medication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscontinue = async (medId: string) => {
    if (!confirm('Are you sure you want to discontinue this medication? Future scheduled doses will be removed.')) {
      return;
    }
    try {
      await api.delete(`/medications/detail/${medId}`);
      await fetchMedications();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to discontinue medication.');
    }
  };

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Medication Schedules</h1>
            <p className="text-stone-600 text-lg">
              Manage your active prescriptions, dosage times, and refill thresholds.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
            <Plus className="w-5 h-5 mr-1" /> Add Medication
          </Button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : medications.length === 0 ? (
          <Card className="text-center py-12">
            <Pill className="w-12 h-12 text-teal mx-auto mb-3" />
            <h3 className="text-2xl font-bold italic text-navy">No medications configured</h3>
            <p className="text-stone-600 text-base mt-1 mb-6">
              Add your first prescription to start receiving timely reminders.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
              <Plus className="w-5 h-5 mr-1" /> Add First Medication
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => {
              const isLowStock =
                typeof med.currentInventory === 'number' &&
                med.refillThreshold &&
                med.currentInventory <= med.refillThreshold;

              return (
                <Card
                  key={med._id}
                  variant={isLowStock ? 'warning' : 'default'}
                  className="flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge status={med.status} />
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {med.frequency?.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold italic text-navy">{med.name}</h3>
                    <p className="text-base font-bold text-teal mt-0.5">
                      {med.strength} {med.unit} • {med.form}
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-canvas border border-stone-200 text-sm space-y-1">
                      <p>
                        <strong>Times:</strong> {med.scheduleTimes?.join(', ')}
                      </p>
                      <p>
                        <strong>Instructions:</strong> {med.instructions}
                      </p>
                      <p>
                        <strong>Context:</strong> {med.mealContext?.replace('_', ' ')}
                      </p>
                    </div>

                    {/* Refill Inventory Alert */}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-stone-600 font-medium">Inventory Remaining:</span>
                      <span
                        className={`font-black text-base ${
                          isLowStock ? 'text-accent font-extrabold flex items-center' : 'text-navy'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="w-4 h-4 mr-1 text-accent" />}
                        {med.currentInventory ?? 'N/A'} doses
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center">
                    <span className="text-xs text-stone-500">
                      Doctor: {med.prescribingDoctor || 'Primary Care'}
                    </span>
                    {med.status === 'active' && (
                      <button
                        onClick={() => handleDiscontinue(med._id)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Discontinue
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Medication" maxWidth="lg">
        <form onSubmit={handleCreateMedication} className="space-y-4">
          <Input
            label="Medication Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Medication Name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Strength / Dose"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder="e.g. 5"
              required
            />
            <Select
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={[
                { value: 'mg', label: 'mg (milligrams)' },
                { value: 'ml', label: 'ml (milliliters)' },
                { value: 'mcg', label: 'mcg (micrograms)' },
                { value: 'tablets', label: 'tablets' },
                { value: 'drops', label: 'drops' },
                { value: 'puffs', label: 'puffs' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Dosage Form"
              value={form}
              onChange={(e) => setForm(e.target.value)}
              options={[
                { value: 'tablet', label: 'Tablet' },
                { value: 'capsule', label: 'Capsule' },
                { value: 'syrup', label: 'Liquid Syrup' },
                { value: 'drops', label: 'Eye/Ear Drops' },
                { value: 'inhaler', label: 'Inhaler' },
                { value: 'injection', label: 'Injection' },
              ]}
            />
            <Select
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={[
                { value: 'daily', label: 'Once Daily' },
                { value: 'twice_daily', label: 'Twice Daily' },
                { value: 'as_needed', label: 'As Needed (SOS)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dose Time 1"
              type="time"
              value={time1}
              onChange={(e) => setTime1(e.target.value)}
              required
            />
            {frequency === 'twice_daily' && (
              <Input
                label="Dose Time 2"
                type="time"
                value={time2}
                onChange={(e) => setTime2(e.target.value)}
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Meal Timing Context"
              value={mealContext}
              onChange={(e) => setMealContext(e.target.value)}
              options={[
                { value: 'after_meal', label: 'After Meal' },
                { value: 'before_meal', label: 'Before Meal' },
                { value: 'with_meal', label: 'With Meal' },
                { value: 'empty_stomach', label: 'Empty Stomach' },
                { value: 'no_restriction', label: 'No Restriction' },
              ]}
            />
            <Input
              label="Special Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with a full glass of water"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Inventory (Doses in pack)"
              type="number"
              value={currentInventory}
              onChange={(e) => setCurrentInventory(e.target.value)}
              required
            />
            <Input
              label="Refill Alert Threshold"
              type="number"
              value={refillThreshold}
              onChange={(e) => setRefillThreshold(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={() => setIsModalOpen(false)} variant="ghost" size="md" type="button">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Save Medication
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
