import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  Bell,
  Clock,
  Users,
  Calendar,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-navy flex flex-col">
      {/* Top Banner Navigation */}
      <nav className="bg-white border-b-2 border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal flex items-center justify-center text-white shadow-sm">
              <Heart className="w-7 h-7 fill-white" />
            </div>
            <div>
              <span className="text-2xl font-black italic tracking-tight text-navy">SaathiCare</span>
              <span className="hidden sm:block text-xs font-bold text-teal">Care that feels close to home</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login" className="px-5 py-2.5 font-bold text-lg text-navy hover:text-teal transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-soft-mint text-teal text-sm font-bold border border-teal/20 mb-6">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Smart Interconnected Healthcare for Older Adults
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic text-navy tracking-tight leading-tight mb-6">
              Care that feels <span className="text-teal underline decoration-accent decoration-wavy decoration-2">close to home.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-stone-700 leading-relaxed mb-8">
              Empowering older adults with simple daily routines, medication schedules, and proactive Care Assurance.
              Families stay informed with privacy-first passcodes, while caregivers coordinate with clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-xl">
                  Start Free Care Circle <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-xl">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Demo Preview Card */}
          <div className="bg-white rounded-3xl p-8 border-4 border-teal/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-stone-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-soft-mint flex items-center justify-center text-teal font-black">
                  SC
                </div>
                <div>
                  <h3 className="text-xl font-bold italic text-navy">Care Profile Overview</h3>
                  <p className="text-xs font-semibold text-stone-500">Connected to Family & Dedicated Caregiver</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
                Active Tracking
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-accent/40 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-accent uppercase tracking-wider">Next Dose Due</p>
                  <p className="text-xl font-black text-navy mt-1">Prescribed Medication</p>
                  <p className="text-sm text-stone-600">Scheduled Routine • With Meal</p>
                </div>
                <Button variant="primary" size="md">
                  Mark Taken
                </Button>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Upcoming Doctor Visit</p>
                  <p className="text-lg font-bold text-navy mt-1">Specialist Consultation</p>
                  <p className="text-xs text-stone-500">Scheduled Health Checkup • Medical Clinic</p>
                </div>
                <span className="text-teal font-extrabold text-sm">Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Roles Section */}
      <section className="py-16 bg-white border-y-2 border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black italic text-navy mb-4">
              Built with purpose for every member of the care circle
            </h2>
            <p className="text-xl text-stone-600">
              Each user enjoys a dedicated experience designed to eliminate anxiety and foster dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Elderly Card */}
            <div className="p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-teal/15 text-teal flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic text-navy mb-3">Older Adult (Profile Owner)</h3>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  Huge 48px+ buttons, high-contrast text, voice readout, and full control over who has access to your medical records.
                </p>
              </div>
              <Link to="/signup" className="font-bold text-lg text-teal flex items-center hover:underline">
                Explore Elderly Mode <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {/* Family Card */}
            <div className="p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-accent flex items-center justify-center mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic text-navy mb-3">Family Member</h3>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  Real-time adherence trends, overdue dose escalation alerts, appointment synchronization, and peace of mind from anywhere.
                </p>
              </div>
              <Link to="/signup" className="font-bold text-lg text-teal flex items-center hover:underline">
                Explore Family Mode <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {/* Caregiver Card */}
            <div className="p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-soft-mint text-teal flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic text-navy mb-3">Professional Caregiver</h3>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  Patient task queue, medication administration logging with audit trails, vital observation recording, and escalation queues.
                </p>
              </div>
              <Link to="/signup" className="font-bold text-lg text-teal flex items-center hover:underline">
                Explore Caregiver Mode <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black italic text-navy mb-4">
            Six Innovations Going Beyond Basic Reminders
          </h2>
          <p className="text-xl text-stone-600">
            A closed-loop safety architecture protecting elderly health outcomes without algorithmic over-reach.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <CheckCircle2 className="w-6 h-6 text-teal mr-2" /> Care Assurance Loop
            </h4>
            <p className="text-stone-600 text-base">
              Schedule → Remind → Confirm → Escalate → Respond. If a dose is overdue past 30 minutes, authorized family receives automated notifications.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Lock className="w-6 h-6 text-teal mr-2" /> One-Time Passcode Circle
            </h4>
            <p className="text-stone-600 text-base">
              Inviting family requires an authenticated account AND a short-lived 24h bcrypt-hashed passcode with 5-attempt rate limiting.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Bell className="w-6 h-6 text-teal mr-2" /> Smart Refill Watch
            </h4>
            <p className="text-stone-600 text-base">
              Automatically decrements physical inventory on confirmed doses and alerts family well before medication supplies run dry.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Smartphone className="w-6 h-6 text-teal mr-2" /> Accessibility Companion
            </h4>
            <p className="text-stone-600 text-base">
              Atkinson Hyperlegible bold italic typography, 48px touch targets, browser speech synthesis read-aloud, and Hindi/English readiness.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Calendar className="w-6 h-6 text-teal mr-2" /> Doctor Appointments & .ics
            </h4>
            <p className="text-stone-600 text-base">
              Synchronize doctor visits, clinic maps, notes, and 1-click export to Google Calendar and Apple iCal with RFC 5545 format.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <ShieldCheck className="w-6 h-6 text-teal mr-2" /> Immutable Audit Provenance
            </h4>
            <p className="text-stone-600 text-base">
              Every dose confirmation, caregiver note, and record access is cryptographically audited with timestamp, actor, and IP footprint.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-teal fill-teal" />
              <span className="text-2xl font-black italic">SaathiCare</span>
            </div>
            <p className="text-stone-300 text-sm mt-1">Care that feels close to home.</p>
          </div>
          <div className="flex space-x-6 text-sm font-semibold">
            <Link to="/privacy" className="hover:text-teal transition-colors">Privacy & Security</Link>
            <Link to="/login" className="hover:text-teal transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-teal transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
