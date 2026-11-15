import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { Users, Heart, Pill, Calendar, AlertTriangle, TrendingUp, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function FamilyDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [doses, setDoses] = useState<any[]>([]);
  const [adherence, setAdherence] = useState<any>(null);
  const [refills, setRefills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profiles');
      const list = res.data.careProfiles || [];
      setProfiles(list);

      const target = list[0];
      if (target) {
        setSelectedProfile(target);
        const todayStr = new Date().toISOString().split('T')[0];

        const [dosesRes, adhRes, refillRes] = await Promise.all([
          api.get(`/doses/${target._id}/doses?date=${todayStr}`),
          api.get(`/analytics/${target._id}/analytics/adherence?days=7`),
          api.get(`/analytics/${target._id}/analytics/refill-watch`),
        ]);

        setDoses(dosesRes.data.doses || []);
        setAdherence(adhRes.data);
        setRefills(refillRes.data.refillItems || []);
      }
    } catch (err) {
      console.error('Failed fetching family dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4 text-xl font-bold italic text-navy">Loading Care Circle Overview...</p>
        </div>
      </DashboardLayout>
    );
  }

  const takenCount = doses.filter((d) => d.status === 'taken').length;
  const totalToday = doses.length;

  return (
    <DashboardLayout profileId={selectedProfile?._id}>
      <div className="space-y-8">
        {/* Family Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-teal bg-soft-mint px-3 py-1 rounded-full">
              Family Care View
            </span>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy mt-2">
              Monitoring: {selectedProfile?.fullName || 'Loved One'}
            </h1>
            <p className="text-stone-600 text-base mt-1">
              Active Care Circle Member • Permission-Gated Health Overview
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/family/adherence">
              <Button variant="outline" size="md">
                <TrendingUp className="w-5 h-5 mr-1" /> View Full Trends
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal/15 text-teal flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500 uppercase">Today's Doses</p>
              <h3 className="text-3xl font-black text-navy mt-1">
                {takenCount} / {totalToday} <span className="text-sm font-normal text-stone-500">taken</span>
              </h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-soft-mint text-teal flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500 uppercase">7-Day Adherence</p>
              <h3 className="text-3xl font-black text-navy mt-1">
                {adherence?.summary?.overallRate ?? 100}%
              </h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-accent flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500 uppercase">Low Stock Alerts</p>
              <h3 className="text-3xl font-black text-navy mt-1">
                {refills.filter((r) => r.isLowStock).length}{' '}
                <span className="text-sm font-normal text-stone-500">medications</span>
              </h3>
            </div>
          </Card>
        </div>

        {/* 2-Column Section: Today's Status & Smart Refill Watch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule for Parent */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold italic text-navy flex items-center">
                <Pill className="w-6 h-6 mr-2 text-teal" /> Today's Doses for {selectedProfile?.fullName}
              </h2>
            </div>

            <div className="space-y-3">
              {doses.length === 0 ? (
                <p className="text-stone-500 text-center py-6">No doses scheduled today.</p>
              ) : (
                doses.map((dose) => (
                  <div key={dose._id} className="p-4 rounded-xl bg-canvas border border-stone-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-navy text-lg">{dose.medication?.name}</p>
                      <p className="text-xs text-stone-500">
                        Scheduled for {new Date(dose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge status={dose.status} />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Smart Refill Watch */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold italic text-navy flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-accent" /> Smart Refill Watch
              </h2>
            </div>

            <div className="space-y-3">
              {refills.length === 0 ? (
                <p className="text-stone-500 text-center py-6">No medications tracked.</p>
              ) : (
                refills.map((refill) => (
                  <div
                    key={refill.medicationId}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                      refill.isLowStock ? 'bg-amber-50/70 border-accent/40' : 'bg-canvas border-stone-200'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-navy text-lg">{refill.name}</p>
                      <p className="text-xs text-stone-600 font-medium">
                        {refill.strength} {refill.unit} • Threshold: {refill.refillThreshold} doses
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${refill.isLowStock ? 'text-accent' : 'text-teal'}`}>
                        {refill.currentInventory} left
                      </p>
                      <p className="text-xs text-stone-500 font-semibold">
                        ~{refill.estimatedDaysRemaining} days supply
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
