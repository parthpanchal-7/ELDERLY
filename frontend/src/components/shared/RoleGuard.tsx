import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.hasCompletedOnboarding && !window.location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding/role" replace />;
  }

  if (!allowedRoles.includes(user.primaryRole)) {
    // Redirect to correct dashboard based on their role
    if (user.primaryRole === 'profile_owner') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.primaryRole === 'family_member') {
      return <Navigate to="/family" replace />;
    } else if (user.primaryRole === 'caregiver') {
      return <Navigate to="/caregiver" replace />;
    }
  }

  return <Outlet />;
};
