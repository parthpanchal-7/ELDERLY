import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Input, Select, Spinner } from '@/components/ui';
import { User, Heart, Shield, Download, Plus, Activity, FileText, Upload, Trash2, ExternalLink } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'vitals' | 'documents' | 'export'>('personal');

  // New vital observation form state
  const [obsType, setObsType] = useState('blood_pressure');
  const [obsValue, setObsValue] = useState('');
  const [obsSecondary, setObsSecondary] = useState('');
  const [obsContext, setObsContext] = useState('');
  const [isAddingObs, setIsAddingObs] = useState(false);

  // New document upload form state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('prescription');
  const [docNotes, setDocNotes] = useState('');
  const [docFileData, setDocFileData] = useState<string>('');
  const [docFileName, setDocFileName] = useState('');
  const [docMimeType, setDocMimeType] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const fetchProfileAndData = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/profiles');
      const activeProf = profRes.data.careProfiles?.[0];
      if (!activeProf) {
        setLoading(false);
        return;
      }
      setProfile(activeProf);

      const [obsRes, docRes] = await Promise.all([
        api.get(`/observations/${activeProf._id}/observations`),
        api.get(`/documents/${activeProf._id}/documents`).catch(() => ({ data: { documents: [] } })),
      ]);

      setObservations(obsRes.data.observations || []);
      setDocuments(docRes.data.documents || []);
    } catch (err) {
      console.error('Failed fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsAddingObs(true);

    try {
      await api.post(`/observations/${profile._id}/observations`, {
        type: obsType,
        value: Number(obsValue),
        secondaryValue: obsType === 'blood_pressure' && obsSecondary ? Number(obsSecondary) : undefined,
        userEnteredContext: obsContext,
      });

      setObsValue('');
      setObsSecondary('');
      setObsContext('');
      await fetchProfileAndData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record health observation.');
    } finally {
      setIsAddingObs(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    setDocFileName(file.name);
    setDocMimeType(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = () => {
      setDocFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!docFileData) {
      alert('Please select a file to upload.');
      return;
    }

    setIsUploadingDoc(true);
    try {
      await api.post(`/documents/${profile._id}/documents`, {
        title: docTitle || docFileName,
        type: docType,
        fileData: docFileData,
        fileName: docFileName,
        mimeType: docMimeType,
        notes: docNotes,
      });

      setDocTitle('');
      setDocNotes('');
      setDocFileData('');
      setDocFileName('');
      await fetchProfileAndData();
      alert('Medical document uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/detail/${id}`);
      await fetchProfileAndData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete document.');
    }
  };

  const handleExportData = async () => {
    if (!profile) return;
    try {
      const res = await api.get(`/profiles/${profile._id}/export`);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `saathicare-health-export-${profile.fullName.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export profile data.');
    }
  };

  return (
    <DashboardLayout profileId={profile?._id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black italic text-navy">Health Profile & Medical Vault</h1>
          <p className="text-stone-600 text-lg">
            Complete clinical profile, recorded vital signs, medical document uploads, and patient data export.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b-2 border-stone-200 overflow-x-auto space-x-4">
          {[
            { id: 'personal', label: 'Personal & Doctor' },
            { id: 'medical', label: 'Conditions & Allergies' },
            { id: 'vitals', label: 'Health Observations (Vitals)' },
            { id: 'documents', label: 'Medical Documents' },
            { id: 'export', label: 'Data Export & Consent' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-lg font-bold transition-all border-b-4 whitespace-nowrap -mb-0.5 ${
                activeTab === tab.id ? 'border-teal text-teal' : 'border-transparent text-stone-500 hover:text-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div>
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <Card className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold italic text-navy mb-4">Patient Demographics</h3>
                    <div className="space-y-3 text-base">
                      <p><strong className="text-stone-600">Full Name:</strong> {profile?.fullName}</p>
                      <p><strong className="text-stone-600">Date of Birth:</strong> {new Date(profile?.dateOfBirth).toLocaleDateString()}</p>
                      <p><strong className="text-stone-600">Gender:</strong> {profile?.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).replace('_', ' ')) : 'Not specified'}</p>
                      <p><strong className="text-stone-600">Blood Group:</strong> {profile?.bloodGroup || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold italic text-navy mb-4">Primary Physician</h3>
                    <div className="space-y-3 text-base">
                      <p><strong className="text-stone-600">Doctor:</strong> {profile?.primaryPhysician || 'Not specified'}</p>
                      <p><strong className="text-stone-600">Phone:</strong> {profile?.primaryPhysicianPhone || 'Not specified'}</p>
                      <p><strong className="text-stone-600">Email:</strong> {profile?.primaryPhysicianEmail || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Medical Tab */}
            {activeTab === 'medical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-xl font-bold italic text-navy mb-3">Chronic Conditions</h3>
                  {profile?.chronicConditions?.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2 text-stone-700">
                      {profile.chronicConditions.map((cond: string, idx: number) => (
                        <li key={idx} className="text-lg font-medium">{cond}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-stone-500">No chronic conditions listed.</p>
                  )}
                </Card>

                <Card>
                  <h3 className="text-xl font-bold italic text-navy mb-3">Known Allergies</h3>
                  {profile?.allergies?.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2 text-stone-700">
                      {profile.allergies.map((allergy: string, idx: number) => (
                        <li key={idx} className="text-lg font-medium text-amber-700">{allergy}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-stone-500">No known allergies recorded.</p>
                  )}
                </Card>
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div className="space-y-6">
                <Card className="border-2 border-teal/30">
                  <h3 className="text-xl font-bold italic text-navy mb-4 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-teal" /> Log Vital Sign Observation
                  </h3>
                  <form onSubmit={handleAddObservation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <Select
                      label="Vital Type"
                      value={obsType}
                      onChange={(e) => setObsType(e.target.value)}
                      options={[
                        { value: 'blood_pressure', label: 'Blood Pressure (mmHg)' },
                        { value: 'blood_sugar', label: 'Blood Glucose (mg/dL)' },
                        { value: 'pulse', label: 'Pulse / Heart Rate (bpm)' },
                        { value: 'weight', label: 'Body Weight (kg)' },
                        { value: 'temperature', label: 'Body Temperature (°F)' },
                        { value: 'spo2', label: 'Oxygen Saturation (%)' },
                      ]}
                    />

                    <Input
                      label={obsType === 'blood_pressure' ? 'Systolic Value' : 'Measurement Value'}
                      type="number"
                      value={obsValue}
                      onChange={(e) => setObsValue(e.target.value)}
                      required
                    />

                    {obsType === 'blood_pressure' && (
                      <Input
                        label="Diastolic Value"
                        type="number"
                        value={obsSecondary}
                        onChange={(e) => setObsSecondary(e.target.value)}
                        required
                      />
                    )}

                    <Input
                      label="Context / Note"
                      placeholder="e.g. Fasting, after breakfast"
                      value={obsContext}
                      onChange={(e) => setObsContext(e.target.value)}
                    />

                    <div className="sm:col-span-2 lg:col-span-4">
                      <Button type="submit" variant="primary" size="md" isLoading={isAddingObs}>
                        <Plus className="w-5 h-5 mr-1" /> Record Observation
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* History Table */}
                <Card>
                  <h3 className="text-xl font-bold italic text-navy mb-4">Observation History</h3>
                  {observations.length === 0 ? (
                    <p className="text-stone-500 py-6 text-center">No health observations logged yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-500 text-sm">
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Measurement</th>
                            <th className="p-3">Context</th>
                            <th className="p-3">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {observations.map((obs) => (
                            <tr key={obs._id} className="hover:bg-stone-50">
                              <td className="p-3 font-semibold text-navy">
                                {new Date(obs.observedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </td>
                              <td className="p-3 capitalize">{obs.type.replace('_', ' ')}</td>
                              <td className="p-3 font-bold text-teal text-lg">
                                {obs.value}
                                {obs.secondaryValue ? ` / ${obs.secondaryValue}` : ''} {obs.unit}
                              </td>
                              <td className="p-3 text-stone-600">{obs.userEnteredContext || '—'}</td>
                              <td className="p-3 text-stone-500">{obs.recordedBy?.displayName || 'Self'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Medical Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <Card className="border-2 border-teal/30">
                  <h3 className="text-xl font-bold italic text-navy mb-4 flex items-center">
                    <Upload className="w-6 h-6 mr-2 text-teal" /> Upload Medical Record / Document
                  </h3>
                  <form onSubmit={handleUploadDocument} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Document Title"
                        placeholder="e.g. Dr. Sharma Prescription, Blood Test Report"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        required
                      />

                      <Select
                        label="Document Category"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        options={[
                          { value: 'prescription', label: 'Prescription' },
                          { value: 'lab_report', label: 'Lab / Diagnostic Report' },
                          { value: 'discharge_summary', label: 'Discharge Summary' },
                          { value: 'imaging', label: 'Scan / X-Ray / MRI' },
                          { value: 'insurance', label: 'Health Insurance Policy' },
                          { value: 'other', label: 'Other Medical Record' },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-sm font-bold text-navy mb-1">Select File (Image or PDF, max 10MB)</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="w-full text-sm text-stone-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-teal file:text-white hover:file:bg-teal/90 cursor-pointer"
                          required
                        />
                        {docFileName && (
                          <p className="text-xs text-teal mt-1 font-semibold">Selected: {docFileName}</p>
                        )}
                      </div>

                      <Input
                        label="Notes / Doctor Remarks (Optional)"
                        placeholder="e.g. Follow-up after 15 days"
                        value={docNotes}
                        onChange={(e) => setDocNotes(e.target.value)}
                      />
                    </div>

                    <div>
                      <Button type="submit" variant="primary" size="md" isLoading={isUploadingDoc}>
                        <Upload className="w-5 h-5 mr-1" /> Upload & Save Document
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Uploaded Documents List */}
                <Card>
                  <h3 className="text-xl font-bold italic text-navy mb-4">Saved Documents ({documents.length})</h3>
                  {documents.length === 0 ? (
                    <p className="text-stone-500 py-8 text-center">No medical records or prescriptions uploaded yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <div key={doc._id} className="p-4 rounded-2xl border-2 border-stone-200 bg-white flex flex-col justify-between space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-teal/15 text-teal flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-bold text-navy truncate">{doc.title}</h4>
                              <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                                {doc.type.replace('_', ' ')} • {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                              {doc.notes && <p className="text-sm text-stone-600 mt-1">{doc.notes}</p>}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                            <a
                              href={doc.fileUrl}
                              download={doc.fileName || `${doc.title}.dat`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sm font-bold text-teal hover:underline"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" /> View / Download
                            </a>

                            <button
                              onClick={() => handleDeleteDocument(doc._id)}
                              className="text-stone-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Export & Consent Tab */}
            {activeTab === 'export' && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold italic text-navy mb-2">Export Complete Patient Healthcare Records</h3>
                  <p className="text-stone-600 text-base leading-relaxed mb-6">
                    In compliance with patient data sovereignty and interoperability, you can download a full cryptographic JSON archive
                    of all your medication prescriptions, adherence history, doctor visits, vital observations, and care circle audit trails.
                  </p>

                  <Button onClick={handleExportData} variant="primary" size="lg">
                    <Download className="w-6 h-6 mr-2" /> Download Complete Health Record (JSON)
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
