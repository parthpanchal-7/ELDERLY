import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { Heart, LogOut, Volume2, VolumeX, Eye, Languages } from 'lucide-react';

export const Navbar: React.FC<{ profileId?: string }> = ({ profileId }) => {
  const { user, logout } = useAuth();
  const { textSize, setTextSize, highContrast, setHighContrast, language, setLanguage, isSpeaking, stopSpeaking } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const cycleTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
    else setTextSize('normal');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
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
              {language === 'hi' ? 'घर जैसा अपनापन' : 'Care that feels close to home'}
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
              <span>Stop Voice</span>
            </button>
          )}

          {/* Text Size Accessibility Toggle */}
          <button
            onClick={cycleTextSize}
            className="px-3 py-2 rounded-xl border-2 border-stone-300 hover:border-teal text-navy font-bold text-sm min-h-[44px] flex items-center space-x-1"
            title="Adjust text size (Normal / Large / Extra Large)"
          >
            <span>Aa</span>
            <span className="text-xs text-teal font-extrabold uppercase">({textSize})</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2.5 rounded-xl border-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
              highContrast ? 'bg-navy text-white border-navy' : 'border-stone-300 text-stone-600 hover:border-navy'
            }`}
            title="Toggle High Contrast Mode"
            aria-label="Toggle high contrast"
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Language Toggle (EN / HI) */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-xl border-2 border-stone-300 hover:border-teal text-navy font-bold text-sm min-h-[44px] flex items-center space-x-1"
            title="Switch Language"
          >
            <Languages className="w-4 h-4 text-teal" />
            <span className="uppercase">{language}</span>
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
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-teal text-white font-bold rounded-xl hover:bg-teal/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
