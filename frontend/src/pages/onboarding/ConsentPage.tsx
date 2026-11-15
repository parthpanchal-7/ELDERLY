import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';

export default function ConsentPage() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleConsent = () => {
    if (agreed) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        <Card className="shadow-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-soft-mint text-teal flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black italic text-navy">Care Consent & Data Privacy</h1>
          </div>

          <div className="space-y-4 text-stone-700 text-sm leading-relaxed mb-6 bg-stone-50 p-5 rounded-2xl border border-stone-200 max-h-64 overflow-y-auto">
            <p>
              <strong>1. Data Ownership:</strong> As a user of SaathiCare, you retain complete ownership of your personal health data. You have the right to revoke any care circle member's access at any moment.
            </p>
            <p>
              <strong>2. Care Escalations:</strong> If you miss scheduled doses beyond the configured grace period (30 minutes), automated reminders and alerts will be sent to your designated care circle contacts.
            </p>
            <p>
              <strong>3. Not Medical Advice:</strong> SaathiCare provides schedules, reminders, and adherence logs. It does not provide automated clinical diagnosis or replace emergency services. In a medical emergency, call 112 immediately.
            </p>
          </div>

          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors mb-6">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded text-teal focus:ring-teal border-stone-300"
            />
            <span className="text-sm font-semibold text-navy">
              I understand and grant consent for my care reminders and designated care circle access.
            </span>
          </label>

          <Button
            onClick={handleConsent}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!agreed}
          >
            Agree & Enter Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
