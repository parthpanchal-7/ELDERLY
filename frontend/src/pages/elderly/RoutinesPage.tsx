import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Modal, Input, Select, Spinner } from '@/components/ui';
import { CheckSquare, Plus, CheckCircle2, Droplets, Activity, Utensils, Heart } from 'lucide-react';

export default function RoutinesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hydration');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const res = await api.get(`/routines/${activeProf._id}/routines`);
      setRoutines(res.data.routines || []);
    } catch (err) {
      console.error('Failed fetching routines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

    try {
      await api.post(`/routines/${profile._id}/routines`, {
        title,
        description,
        category,
        scheduleTimes: [time],
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      await fetchRoutines();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add routine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (routineId: string) => {
    try {
      await api.post(`/routines/complete/${routineId}`);
      await fetchRoutines();
    } catch (err) {
      console.error('Failed to complete routine:', err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'hydration':
        return <Droplets className="w-6 h-6 text-sky-600" />;
      case 'exercise':
        return <Activity className="w-6 h-6 text-emerald-600" />;
      case 'nutrition':
        return <Utensils className="w-6 h-6 text-amber-600" />;
      default:
        return <Heart className="w-6 h-6 text-teal" />;
    }
  };

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Daily Wellness Routines</h1>
            <p className="text-stone-600 text-lg">
              Hydration, gentle walks, and daily wellness habits supporting medication efficacy.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
            <Plus className="w-5 h-5 mr-1" /> Add Routine
          </Button>
        </div>

        {/* Clinical Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-stone-700">
          <strong>Notice:</strong> Wellness reminders are supportive habits and do not constitute prescribed medical treatment. Consult your physician for medical care plans.
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => {
              const isDone = routine.todayCompleted;
              return (
                <Card
                  key={routine._id}
                  variant={isDone ? 'mint' : 'default'}
                  className="flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white shadow-sm border border-stone-200">
                        {getCategoryIcon(routine.category)}
                      </div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {routine.scheduleTimes?.join(', ')}
                      </span>
                    </div>

                    <h3 className={`text-2xl font-bold italic ${isDone ? 'text-teal line-through' : 'text-navy'}`}>
                      {routine.title}
                    </h3>
                    <p className="text-stone-600 text-sm mt-2">{routine.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200">
                    <Button
                      onClick={() => !isDone && handleComplete(routine._id)}
                      disabled={isDone}
                      variant={isDone ? 'secondary' : 'primary'}
                      size="md"
                      className="w-full"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {isDone ? 'Completed for Today' : 'Mark Completed'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Routine Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Wellness Routine">
        <form onSubmit={handleCreateRoutine} className="space-y-4">
          <Input
            label="Routine Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Hydration (Warm Water)"
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'hydration', label: 'Hydration (Water, Fluids)' },
              { value: 'exercise', label: 'Exercise & Walking' },
              { value: 'vital_check', label: 'Vital Health Check' },
              { value: 'nutrition', label: 'Nutrition & Meals' },
              { value: 'sleep', label: 'Rest & Sleep' },
            ]}
          />

          <Input
            label="Target Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <Input
            label="Description / Instructions"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Drink 2 full glasses of warm water"
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={() => setIsModalOpen(false)} variant="ghost" size="md" type="button">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Save Routine
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
