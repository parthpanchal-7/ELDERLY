import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Spinner } from '@/components/ui';
import { ShieldCheck, Clock, UserCheck } from 'lucide-react';

export default function AuditPage() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true);
        const res = await api.get('/profiles');
        const activeProf = res.data.careProfiles?.[0];
        if (!activeProf) {
          setLoading(false);
          return;
        }
        setProfile(activeProf);

        const auditRes = await api.get(`/audit-logs/${activeProf._id}/audit-logs`);
        setLogs(auditRes.data.auditLogs || []);
      } catch (err) {
        console.error('Failed fetching audit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, []);

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Care Activity Audit Trail</h1>
          <p className="text-stone-600 text-lg">
            Immutable timeline of medication confirmations, care circle changes, and data access.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            {logs.length === 0 ? (
              <p className="text-stone-500 text-center py-8">No audit logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-canvas border-b border-stone-200 text-navy font-bold">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Entity</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-stone-50">
                        <td className="p-3 font-medium">
                          {new Date(log.timestamp).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3 font-bold text-teal">{log.action}</td>
                        <td className="p-3 text-stone-700">{log.targetEntity}</td>
                        <td className="p-3 font-medium text-navy">
                          {log.actor?.displayName || 'System'} ({log.actor?.primaryRole || 'System'})
                        </td>
                        <td className="p-3 text-stone-500 font-mono text-xs">{log.ipAddress || '127.0.0.1'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
