import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { Heart, LogOut, VolumeX, Eye, Languages, Menu, X, User } from 'lucide-react';

export const Navbar: React.FC<{ profileId?: string }> = ({ profileId }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    textSize,
    cycleTextSize,
    highContrast,
    toggleHighContrast,
    language,
    toggleLanguage,
    t,
    isSpeaking,
    stopSpeaking,
  } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getTextSizeLabel = () => {
    if (textSize === 'normal') return 'Normal';
    if (textSize === 'large') return 'Large';
    return 'X-Large';
  };

  return (
    <header className="bg-white border-b-2 border-stone-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black italic tracking-tight text-navy">SaathiCare</span>
            <span className="hidden sm:block text-xs font-semibold text-teal tracking-wide">
              {t('brandTagline')}
            </span>
          </div>
        </Link>

        {/* Desktop Accessibility & Action Controls (md and up) */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
          {/* Readout stop button if currently speaking */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-3 py-2 bg-accent text-white rounded-xl text-sm font-bold flex items-center space-x-1 animate-pulse"
              title="Stop voice readout"
            >
              <VolumeX className="w-5 h-5" />
              <span>{t('stopVoice')}</span>
            </button>
          )}

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

          {/* Language Toggle (EN / HI) */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-xl border-2 border-stone-300 hover:border-teal text-navy font-bold text-sm min-h-[44px] flex items-center space-x-1.5 transition-all bg-white"
            title="Switch Language (English / हिंदी)"
            aria-label={`Switch Language, current language is ${language === 'en' ? 'English' : 'Hindi'}`}
          >
            <Languages className="w-4 h-4 text-teal" />
            <span className="font-extrabold uppercase text-teal">
              {language === 'en' ? 'हिंदी (HI)' : 'English (EN)'}
            </span>
          </button>

          {/* Notifications */}
          {user && <NotificationBell profileId={profileId} />}

          {/* User Profile & Sign Out */}
          {user ? (
            <div className="flex items-center space-x-2 border-l-2 border-stone-200 pl-3">
              <span className="hidden lg:block font-bold text-navy text-base">
                {user.displayName}
              </span>
              <button
                onClick={handleLogout}
                className="p-2.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={t('signOut')}
                aria-label={t('signOut')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-teal text-white font-bold rounded-xl hover:bg-teal/90 transition-colors"
            >
              {t('signIn')}
            </Link>
          )}
        </div>

        {/* Mobile Action Controls (<md) */}
        <div className="flex md:hidden items-center space-x-2">
          {user && <NotificationBell profileId={profileId} />}

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2.5 rounded-xl border-2 border-stone-300 hover:border-teal text-navy min-h-[44px] min-w-[44px] flex items-center justify-center bg-white"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-teal" /> : <Menu className="w-6 h-6 text-navy" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-stone-200 bg-white px-4 py-5 space-y-4 shadow-xl">
          {user && (
            <div className="flex items-center space-x-3 pb-3 border-b border-stone-200">
              <div className="w-10 h-10 rounded-full bg-soft-mint flex items-center justify-center text-teal font-black">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy text-base truncate">{user.displayName}</p>
                <p className="text-xs text-teal font-extrabold uppercase">{user.primaryRole?.replace('_', ' ')}</p>
              </div>
            </div>
          )}

          {/* Speaking Alert */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="w-full py-2.5 px-4 bg-accent text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2"
            >
              <VolumeX className="w-5 h-5" />
              <span>{t('stopVoice')}</span>
            </button>
          )}

          {/* Mobile Accessibility Controls */}
          <div className="space-y-2.5">
            <p className="text-xs font-black uppercase tracking-wider text-stone-500">
              {t('language')} & Accessibility
            </p>

            {/* Text size */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-stone-200">
              <span className="font-bold text-sm text-navy">{t('textSize')}</span>
              <button
                onClick={cycleTextSize}
                className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 font-extrabold text-sm text-teal min-h-[38px]"
              >
                Aa ({getTextSizeLabel()})
              </button>
            </div>

            {/* High Contrast */}
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

            {/* Language */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-stone-200">
              <span className="font-bold text-sm text-navy">{t('language')}</span>
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-lg bg-teal text-white font-extrabold text-xs min-h-[38px] flex items-center space-x-1"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'हिंदी (Hindi)' : 'English'}</span>
              </button>
            </div>
          </div>

          {/* User Sign Out */}
          {user ? (
            <div className="pt-3 border-t border-stone-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 px-4 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl flex items-center justify-center space-x-2 border border-red-200 min-h-[48px]"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 text-center bg-teal text-white font-bold rounded-xl"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
