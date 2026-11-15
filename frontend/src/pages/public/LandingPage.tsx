import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
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
  Eye,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function LandingPage() {
  const { textSize, cycleTextSize, highContrast, toggleHighContrast, language, toggleLanguage, t } = useTheme();

  const getTextSizeLabel = () => {
    if (textSize === 'normal') return 'Normal';
    if (textSize === 'large') return 'Large';
    return 'X-Large';
  };

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
              <span className="hidden sm:block text-xs font-bold text-teal">{t('brandTagline')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Text Size Accessibility Toggle */}
            <button
              onClick={cycleTextSize}
              className="px-3 py-2 rounded-xl border-2 border-stone-300 hover:border-teal text-navy font-bold text-sm min-h-[44px] flex items-center space-x-1.5 transition-all bg-white"
              title="Adjust text size (Normal / Large / Extra Large)"
              aria-label={`Adjust text size, current size is ${textSize}`}
            >
              <span className="text-base font-black">Aa</span>
              <span className="text-xs text-teal font-extrabold uppercase">({getTextSizeLabel()})</span>
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`px-3 py-2 rounded-xl border-2 transition-all min-h-[44px] flex items-center space-x-1.5 font-bold text-sm ${
                highContrast
                  ? 'bg-navy text-white border-white ring-2 ring-yellow-400'
                  : 'bg-white border-stone-300 text-stone-700 hover:border-navy'
              }`}
              title="Toggle High Contrast Mode (WCAG AAA)"
              aria-label="Toggle high contrast mode"
              aria-pressed={highContrast}
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs font-black uppercase">
                {highContrast ? 'Contrast ON' : 'Contrast'}
              </span>
            </button>

            {/* Language Toggle (English / हिंदी) */}
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-2 rounded-xl border-2 border-teal/40 hover:border-teal text-navy font-bold text-sm min-h-[44px] flex items-center space-x-2 transition-all bg-soft-mint/40 hover:bg-soft-mint"
              title="Switch Language / भाषा बदलें (English / हिंदी)"
              aria-label={`Switch Language, current language is ${language === 'en' ? 'English' : 'Hindi'}`}
            >
              <Languages className="w-5 h-5 text-teal" />
              <span className="font-extrabold text-sm text-teal">
                {language === 'en' ? 'हिंदी' : 'English'}
              </span>
            </button>

            <Link to="/login" className="px-3 sm:px-5 py-2.5 font-bold text-base sm:text-lg text-navy hover:text-teal transition-colors">
              {t('signIn')}
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="md">
                {t('getStarted')}
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
              {t('heroBadge')}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic text-navy tracking-tight leading-tight mb-6">
              {t('heroTitlePrefix')} <span className="text-teal underline decoration-accent decoration-wavy decoration-2">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-stone-700 leading-relaxed mb-8">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-xl">
                  {t('startCareCircle')} <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-xl">
                  {t('signInDashboard')}
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
                  <h3 className="text-xl font-bold italic text-navy">{t('previewTitle')}</h3>
                  <p className="text-xs font-semibold text-stone-500">{t('previewSubtitle')}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
                {t('activeTracking')}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-accent/40 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-accent uppercase tracking-wider">{t('nextDoseDue')}</p>
                  <p className="text-xl font-black text-navy mt-1">{t('prescribedMed')}</p>
                  <p className="text-sm text-stone-600">{t('scheduledWithMeal')}</p>
                </div>
                <Button variant="primary" size="md">
                  {t('markTakenBtn')}
                </Button>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">{t('upcomingDoctorVisit')}</p>
                  <p className="text-lg font-bold text-navy mt-1">{t('specialistConsultation')}</p>
                  <p className="text-xs text-stone-500">{t('clinicCheckupDesc')}</p>
                </div>
                <span className="text-teal font-extrabold text-sm">{t('synchronized')}</span>
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
              {t('rolesTitle')}
            </h2>
            <p className="text-xl text-stone-600">
              {t('rolesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Elderly Card */}
            <div className="p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-teal/15 text-teal flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic text-navy mb-3">{t('roleElderlyTitle')}</h3>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  {t('roleElderlyDesc')}
                </p>
              </div>
              <Link to="/signup" className="font-bold text-lg text-teal flex items-center hover:underline">
                {t('exploreElderly')} <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {/* Family Card */}
            <div className="p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-accent flex items-center justify-center mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic text-navy mb-3">{t('roleFamilyTitle')}</h3>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  {t('roleFamilyDesc')}
                </p>
              </div>
              <Link to="/signup" className="font-bold text-lg text-teal flex items-center hover:underline">
                {t('exploreFamily')} <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {/* Caregiver Card */}
            <div className="p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-soft-mint text-teal flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic text-navy mb-3">{t('roleCaregiverTitle')}</h3>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  {t('roleCaregiverDesc')}
                </p>
              </div>
              <Link to="/signup" className="font-bold text-lg text-teal flex items-center hover:underline">
                {t('exploreCaregiver')} <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black italic text-navy mb-4">
            {t('innovationsTitle')}
          </h2>
          <p className="text-xl text-stone-600">
            {t('innovationsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <CheckCircle2 className="w-6 h-6 text-teal mr-2" /> {t('inno1Title')}
            </h4>
            <p className="text-stone-600 text-base">
              {t('inno1Desc')}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Lock className="w-6 h-6 text-teal mr-2" /> {t('inno2Title')}
            </h4>
            <p className="text-stone-600 text-base">
              {t('inno2Desc')}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Bell className="w-6 h-6 text-teal mr-2" /> {t('inno3Title')}
            </h4>
            <p className="text-stone-600 text-base">
              {t('inno3Desc')}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Smartphone className="w-6 h-6 text-teal mr-2" /> {t('inno4Title')}
            </h4>
            <p className="text-stone-600 text-base">
              {t('inno4Desc')}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <Calendar className="w-6 h-6 text-teal mr-2" /> {t('inno5Title')}
            </h4>
            <p className="text-stone-600 text-base">
              {t('inno5Desc')}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-xl font-bold italic text-navy mb-2 flex items-center">
              <ShieldCheck className="w-6 h-6 text-teal mr-2" /> {t('inno6Title')}
            </h4>
            <p className="text-stone-600 text-base">
              {t('inno6Desc')}
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
              <span className="text-2xl font-black italic">{t('brandName')}</span>
            </div>
            <p className="text-stone-300 text-sm mt-1">{t('brandTagline')}</p>
          </div>
          <div className="flex space-x-6 text-sm font-semibold">
            <Link to="/privacy" className="hover:text-teal transition-colors">{t('privacyAndSecurity')}</Link>
            <Link to="/login" className="hover:text-teal transition-colors">{t('signIn')}</Link>
            <Link to="/signup" className="hover:text-teal transition-colors">{t('register')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
