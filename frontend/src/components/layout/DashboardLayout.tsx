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
  const { speak } = useTheme();

  const elderlyLinks = [
    { to: '/dashboard', label: 'Today', icon: Clock },
    { to: '/medications', label: 'Medications', icon: Pill },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/routines', label: 'Routines', icon: CheckSquare },
    { to: '/care-circle', label: 'Care Circle', icon: Users },
    { to: '/notifications', label: 'Alerts', icon: Bell },
    { to: '/profile', label: 'My Health', icon: UserCheck },
  ];

  const familyLinks = [
    { to: '/family', label: 'Overview', icon: Users },
    { to: '/family/adherence', label: 'Adherence Trends', icon: TrendingUp },
    { to: '/family/alerts', label: 'Care Alerts', icon: AlertTriangle },
  ];

  const caregiverLinks = [
    { to: '/caregiver', label: 'Assigned Patients', icon: Users },
    { to: '/caregiver/tasks', label: 'Task Queue', icon: ClipboardList },
    { to: '/caregiver/audit', label: 'Audit Trail', icon: CheckSquare },
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
                <span>Read Aloud</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Accessible Footer */}
      <footer className="bg-navy text-white/80 py-8 border-t-4 border-teal mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
          <div>
            <p className="text-xl font-bold italic text-white">SaathiCare</p>
            <p className="text-sm text-white/70">Care that feels close to home. Designed for dignity, security, and family trust.</p>
          </div>
          <div className="text-xs text-white/60">
            <p>Emergency Services (India): 112 | Senior Citizen Helpline: 14567</p>
            <p className="mt-1">All health records encrypted and permission-gated.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
