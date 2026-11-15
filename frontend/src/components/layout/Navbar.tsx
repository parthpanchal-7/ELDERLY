import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { Heart, LogOut, VolumeX, Eye, Languages } from 'lucide-react';

export const Navbar: React.FC<{ profileId?: string }> = ({ profileId }) => {
  const { user, logout } = useAuth();
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
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-teal flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <div>
            <span className="text-2xl font-black italic tracking-tight text-navy">SaathiCare</span>
            <span className="hidden sm:block text-xs font-semibold text-teal tracking-wide">
              {t('brandTagline')}
            </span>
          </div>
        </Link>

        {/* Accessibility & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
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
              {language === 'en' ? 'English (EN)' : 'हिंदी (HI)'}
            </span>
          </button>

          {/* Notifications */}
          {user && <NotificationBell profileId={profileId} />}

          {/* User Profile & Sign Out */}
          {user ? (
            <div className="flex items-center space-x-2 border-l-2 border-stone-200 pl-3">
              <span className="hidden md:block font-bold text-navy text-base">
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
      </div>
    </header>
  );
};
