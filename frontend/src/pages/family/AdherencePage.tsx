import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Spinner } from '@/components/ui';
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export default function AdherencePage() {
  const [profile, setProfile] = useState<any>(null);
  const [adherenceData, setAdherenceData] = useState<any>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const fetchAdherence = async (selectedDays: number) => {
    try {
      setLoading(true);
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const res = await api.get(`/analytics/${activeProf._id}/analytics/adherence?days=${selectedDays}`);
      setAdherenceData(res.data);
    } catch (err) {
      console.error('Failed fetching adherence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdherence(days);
  }, [days]);

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Adherence Analytics</h1>
            <p className="text-stone-600 text-lg">
              Descriptive medication adherence trends and historical confirmation rates.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-sm font-bold min-h-[44px] border-2 transition-all ${
                  days === d
                    ? 'bg-teal text-white border-teal shadow-sm'
                    : 'bg-white text-navy border-stone-300 hover:border-teal'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Mandatory Regulatory / Healthcare Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-stone-700 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <p>
            <strong>Disclaimer:</strong> {adherenceData?.disclaimer || 'Descriptive summary for care tracking only. Not medical diagnosis, prediction, or clinical advice.'}
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="text-center p-5">
                <p className="text-xs font-bold text-stone-500 uppercase">Total Eligible</p>
                <p className="text-3xl font-black text-navy mt-1">
                  {adherenceData?.summary?.totalEligible ?? 0}
                </p>
              </Card>

              <Card className="text-center p-5">
                <p className="text-xs font-bold text-stone-500 uppercase">Confirmed Taken</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  {adherenceData?.summary?.totalTaken ?? 0}
                </p>
              </Card>

              <Card className="text-center p-5">
                <p className="text-xs font-bold text-stone-500 uppercase">Skipped / Paused</p>
                <p className="text-3xl font-black text-stone-600 mt-1">
                  {adherenceData?.summary?.totalSkipped ?? 0}
                </p>
              </Card>

              <Card className="text-center p-5">
                <p className="text-xs font-bold text-stone-500 uppercase">Overall Adherence</p>
                <p className="text-3xl font-black text-teal mt-1">
                  {adherenceData?.summary?.overallRate ?? 100}%
                </p>
              </Card>
            </div>

            {/* Daily Trend Chart (Recharts) */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold italic text-navy mb-6">Daily Adherence Rate (%)</h2>
              <div className="h-72 w-full">
                {adherenceData?.dailyTrends?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-stone-400">
                    No data recorded for this period yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={adherenceData?.dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" unit="%" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#147D75"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#147D75' }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
