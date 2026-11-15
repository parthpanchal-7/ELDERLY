import React from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Calendar,
  Pill,
  Clock,
  CheckSquare,
  Users,
  Bell,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Volume2,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  profileId?: string;
  readAloudText?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  profileId,
  readAloudText,
}) => {
  const { user } = useAuth();
  const { speak, t } = useTheme();

  const elderlyLinks = [
    { to: '/dashboard', label: t('navToday'), icon: Clock },
    { to: '/medications', label: t('navMedications'), icon: Pill },
    { to: '/appointments', label: t('navAppointments'), icon: Calendar },
    { to: '/routines', label: t('navRoutines'), icon: CheckSquare },
    { to: '/care-circle', label: t('navCareCircle'), icon: Users },
    { to: '/notifications', label: t('navAlerts'), icon: Bell },
    { to: '/profile', label: t('navMyHealth'), icon: UserCheck },
  ];

  const familyLinks = [
    { to: '/family', label: t('navOverview'), icon: Users },
    { to: '/family/adherence', label: t('navAdherence'), icon: TrendingUp },
    { to: '/family/alerts', label: t('navCareAlerts'), icon: AlertTriangle },
  ];

  const caregiverLinks = [
    { to: '/caregiver', label: t('navAssignedPatients'), icon: Users },
    { to: '/caregiver/tasks', label: t('navTaskQueue'), icon: ClipboardList },
    { to: '/caregiver/audit', label: t('navAuditTrail'), icon: CheckSquare },
  ];

  let currentNav = elderlyLinks;
  if (user?.primaryRole === 'family_member') currentNav = familyLinks;
  if (user?.primaryRole === 'caregiver') currentNav = caregiverLinks;

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      <Navbar profileId={profileId} />

      {/* Role Navigation Bar */}
      <div className="bg-white border-b-2 border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2">
            <nav className="flex space-x-2 sm:space-x-4 min-w-max" aria-label="Dashboard Navigation">
              {currentNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard' || item.to === '/family' || item.to === '/caregiver'}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-3 rounded-2xl text-lg font-bold transition-all min-h-[48px] ${
                        isActive
                          ? 'bg-teal text-white shadow-sm'
                          : 'text-navy hover:bg-soft-mint hover:text-teal'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Read Aloud Button for Accessibility */}
            {readAloudText && (
              <button
                onClick={() => speak(readAloudText)}
                className="hidden lg:flex items-center space-x-2 px-4 py-2.5 bg-soft-mint text-teal font-extrabold rounded-2xl hover:bg-teal hover:text-white transition-colors border-2 border-teal/20 min-h-[44px]"
                title="Read today's schedule aloud"
              >
                <Volume2 className="w-5 h-5" />
                <span>{t('voiceReadout')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
