import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-navy flex flex-col">
      <nav className="bg-white border-b-2 border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal flex items-center justify-center text-white shadow-sm">
              <Heart className="w-7 h-7 fill-white" />
            </div>
            <span className="text-2xl font-black italic tracking-tight text-navy">SaathiCare</span>
          </Link>
          <Link to="/login" className="font-bold text-teal hover:underline text-lg">
            Back to App
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black italic text-navy mb-4">Privacy, Consent & Security Architecture</h1>
        <p className="text-xl text-stone-600 mb-8">
          SaathiCare is engineered around the fundamental premise that older adults retain sovereignty over their medical records.
        </p>

        <div className="space-y-8 bg-white p-8 rounded-3xl border-2 border-stone-200 shadow-sm leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold italic text-teal flex items-center mb-3">
              <Lock className="w-6 h-6 mr-2" /> 1. Explicit Consent & Zero Silent Access
            </h2>
            <p className="text-stone-700 text-lg">
              No caregiver or family member can view health records, prescriptions, or observations without explicit consent granted by the profile owner.
              Invitations require both authenticated accounts and a short-lived 6-digit passcode. Passcodes expire within 24 hours and lock after 5 failed attempts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold italic text-teal flex items-center mb-3">
              <ShieldCheck className="w-6 h-6 mr-2" /> 2. Granular Role-Based Permissions
            </h2>
            <p className="text-stone-700 text-lg">
              Family members default to read-only access for medications and adherence trends. Only authorized proxies or caregivers explicitly given
              <code> canConfirmDoses </code> or <code> canEditMedications </code> can log administration actions on behalf of the patient.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold italic text-teal flex items-center mb-3">
              <Eye className="w-6 h-6 mr-2" /> 3. Immutable Audit Trails
            </h2>
            <p className="text-stone-700 text-lg">
              Every data access, invitation acceptance, dose confirmation, and record export is appended to an immutable audit log storing the actor identity,
              timestamp, and IP address. The patient can review audit logs at any time from their settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold italic text-teal flex items-center mb-3">
              <FileText className="w-6 h-6 mr-2" /> 4. Health Data & AI Disclaimers
            </h2>
            <p className="text-stone-700 text-lg">
              SaathiCare provides schedule reminders, inventory estimations, and adherence summaries. It does not provide medical diagnosis, clinical risk prediction,
              or autonomous prescription adjustments. Charts are descriptive summaries and never substitute for licensed medical advice.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
