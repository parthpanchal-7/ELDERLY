import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function LandingPage() {
  const { textSize, cycleTextSize, highContrast, toggleHighContrast, language, toggleLanguage, t } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black italic tracking-tight text-navy">SaathiCare</span>
              <span className="hidden sm:block text-xs font-bold text-teal">{t('brandTagline')}</span>
            </div>
          </Link>

          {/* Desktop Controls (md and up) */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
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

            <Link to="/login" className="px-3 sm:px-4 py-2.5 font-bold text-base text-navy hover:text-teal transition-colors">
              {t('signIn')}
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="md">
                {t('getStarted')}
              </Button>
            </Link>
          </div>

          {/* Mobile Right Controls (<md) */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Quick Language Toggle on Mobile Header */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-2 rounded-xl border-2 border-teal/40 hover:border-teal text-teal font-extrabold text-xs min-h-[44px] flex items-center space-x-1 bg-soft-mint/30"
              title="Switch Language"
              aria-label="Switch Language"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>

            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2.5 rounded-xl border-2 border-stone-300 hover:border-teal text-navy min-h-[44px] min-w-[44px] flex items-center justify-center bg-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-teal" /> : <Menu className="w-6 h-6 text-navy" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-stone-200 bg-white px-4 py-6 space-y-4 shadow-xl">
            {/* Call to Actions */}
            <div className="flex flex-col space-y-2.5">
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" size="lg" className="w-full text-lg justify-center">
                  {t('getStarted')}
                </Button>
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="lg" className="w-full text-lg justify-center">
                  {t('signIn')}
                </Button>
              </Link>
            </div>

            {/* Accessibility Section in Mobile Menu */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-stone-500">
                {t('language')} & Accessibility
              </p>

              {/* Text Size Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-stone-200">
                <span className="font-bold text-sm text-navy">{t('textSize')}</span>
                <button
                  onClick={cycleTextSize}
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 font-extrabold text-sm text-teal min-h-[38px]"
                >
                  Aa ({getTextSizeLabel()})
                </button>
              </div>

              {/* High Contrast Mode */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-stone-200">
                <span className="font-bold text-sm text-navy">{t('highContrast')}</span>
                <button
                  onClick={toggleHighContrast}
                  className={`px-3 py-1.5 rounded-lg border font-extrabold text-xs min-h-[38px] ${
                    highContrast
                      ? 'bg-navy text-white border-white'
                      : 'bg-white border-stone-300 text-stone-700'
                  }`}
                >
                  {highContrast ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Language Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-stone-200">
                <span className="font-bold text-sm text-navy">{t('language')}</span>
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 rounded-lg bg-teal text-white font-extrabold text-xs min-h-[38px] flex items-center space-x-1"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-10 sm:py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-soft-mint text-teal text-xs sm:text-sm font-bold border border-teal/20 mb-4 sm:mb-6">
              <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{t('heroBadge')}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black italic text-navy tracking-tight leading-tight mb-4 sm:mb-6">
              {t('heroTitlePrefix')} <span className="text-teal underline decoration-accent decoration-wavy decoration-2">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-stone-700 leading-relaxed mb-6 sm:mb-8">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg sm:text-xl justify-center">
                  {t('startCareCircle')} <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg sm:text-xl justify-center">
                  {t('signInDashboard')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Demo Preview Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 sm:border-4 border-teal/30 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-stone-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-soft-mint flex items-center justify-center text-teal font-black flex-shrink-0">
                  SC
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold italic text-navy">{t('previewTitle')}</h3>
                  <p className="text-xs font-semibold text-stone-500">{t('previewSubtitle')}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold flex-shrink-0">
                {t('activeTracking')}
              </span>
            </div>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border-2 border-accent/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-accent uppercase tracking-wider">{t('nextDoseDue')}</p>
                  <p className="text-lg sm:text-xl font-black text-navy mt-0.5">{t('prescribedMed')}</p>
                  <p className="text-xs sm:text-sm text-stone-600">{t('scheduledWithMeal')}</p>
                </div>
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  {t('markTakenBtn')}
                </Button>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-wider">{t('upcomingDoctorVisit')}</p>
                  <p className="text-base sm:text-lg font-bold text-navy mt-0.5">{t('specialistConsultation')}</p>
                  <p className="text-xs text-stone-500">{t('clinicCheckupDesc')}</p>
                </div>
                <span className="text-teal font-extrabold text-sm self-start sm:self-center">{t('synchronized')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Roles Section */}
      <section className="py-12 sm:py-16 bg-white border-y-2 border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black italic text-navy mb-3 sm:mb-4">
              {t('rolesTitle')}
            </h2>
            <p className="text-base sm:text-xl text-stone-600">
              {t('rolesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Elderly Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal/15 text-teal flex items-center justify-center mb-5 sm:mb-6">
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black italic text-navy mb-2 sm:mb-3">{t('roleElderlyTitle')}</h3>
                <p className="text-base sm:text-lg text-stone-600 mb-6 leading-relaxed">
                  {t('roleElderlyDesc')}
                </p>
              </div>
              <Link to="/signup" className="font-bold text-base sm:text-lg text-teal flex items-center hover:underline">
                {t('exploreElderly')} <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {/* Family Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 text-accent flex items-center justify-center mb-5 sm:mb-6">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black italic text-navy mb-2 sm:mb-3">{t('roleFamilyTitle')}</h3>
                <p className="text-base sm:text-lg text-stone-600 mb-6 leading-relaxed">
                  {t('roleFamilyDesc')}
                </p>
              </div>
              <Link to="/signup" className="font-bold text-base sm:text-lg text-teal flex items-center hover:underline">
                {t('exploreFamily')} <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {/* Caregiver Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-canvas border-2 border-stone-300 hover:border-teal transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-soft-mint text-teal flex items-center justify-center mb-5 sm:mb-6">
                  <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black italic text-navy mb-2 sm:mb-3">{t('roleCaregiverTitle')}</h3>
                <p className="text-base sm:text-lg text-stone-600 mb-6 leading-relaxed">
                  {t('roleCaregiverDesc')}
                </p>
              </div>
              <Link to="/signup" className="font-bold text-base sm:text-lg text-teal flex items-center hover:underline">
                {t('exploreCaregiver')} <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-black italic text-navy mb-3 sm:mb-4">
            {t('innovationsTitle')}
          </h2>
          <p className="text-base sm:text-xl text-stone-600">
            {t('innovationsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-lg sm:text-xl font-bold italic text-navy mb-2 flex items-center">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal mr-2 flex-shrink-0" /> {t('inno1Title')}
            </h4>
            <p className="text-stone-600 text-sm sm:text-base">
              {t('inno1Desc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-lg sm:text-xl font-bold italic text-navy mb-2 flex items-center">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-teal mr-2 flex-shrink-0" /> {t('inno2Title')}
            </h4>
            <p className="text-stone-600 text-sm sm:text-base">
              {t('inno2Desc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-lg sm:text-xl font-bold italic text-navy mb-2 flex items-center">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-teal mr-2 flex-shrink-0" /> {t('inno3Title')}
            </h4>
            <p className="text-stone-600 text-sm sm:text-base">
              {t('inno3Desc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-lg sm:text-xl font-bold italic text-navy mb-2 flex items-center">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-teal mr-2 flex-shrink-0" /> {t('inno4Title')}
            </h4>
            <p className="text-stone-600 text-sm sm:text-base">
              {t('inno4Desc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-lg sm:text-xl font-bold italic text-navy mb-2 flex items-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-teal mr-2 flex-shrink-0" /> {t('inno5Title')}
            </h4>
            <p className="text-stone-600 text-sm sm:text-base">
              {t('inno5Desc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-stone-200">
            <h4 className="text-lg sm:text-xl font-bold italic text-navy mb-2 flex items-center">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-teal mr-2 flex-shrink-0" /> {t('inno6Title')}
            </h4>
            <p className="text-stone-600 text-sm sm:text-base">
              {t('inno6Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 sm:py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Heart className="w-6 h-6 text-teal fill-teal" />
              <span className="text-xl sm:text-2xl font-black italic">{t('brandName')}</span>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm mt-1">{t('brandTagline')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:space-x-6 text-xs sm:text-sm font-semibold">
            <Link to="/privacy" className="hover:text-teal transition-colors">{t('privacyAndSecurity')}</Link>
            <Link to="/login" className="hover:text-teal transition-colors">{t('signIn')}</Link>
            <Link to="/signup" className="hover:text-teal transition-colors">{t('register')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
