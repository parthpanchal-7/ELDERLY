import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense, lazy } from 'react';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ui';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { Spinner } from '@/components/ui';

// Public pages
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage'));
const SignupPage = lazy(() => import('@/pages/public/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage'));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'));

// Onboarding pages
const RoleSelectionPage = lazy(() => import('@/pages/onboarding/RoleSelectionPage'));
const CreateProfilePage = lazy(() => import('@/pages/onboarding/CreateProfilePage'));
const InviteCareCirclePage = lazy(() => import('@/pages/onboarding/InviteCareCirclePage'));
const VerifyPasscodePage = lazy(() => import('@/pages/onboarding/VerifyPasscodePage'));
const ConsentPage = lazy(() => import('@/pages/onboarding/ConsentPage'));

// Elderly dashboard pages
const TodayDashboard = lazy(() => import('@/pages/elderly/TodayDashboard'));
const MedicationsPage = lazy(() => import('@/pages/elderly/MedicationsPage'));
const AppointmentsPage = lazy(() => import('@/pages/elderly/AppointmentsPage'));
const RoutinesPage = lazy(() => import('@/pages/elderly/RoutinesPage'));
const CareCirclePage = lazy(() => import('@/pages/elderly/CareCirclePage'));
const NotificationsPage = lazy(() => import('@/pages/elderly/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/elderly/ProfilePage'));

// Family dashboard pages
const FamilyDashboard = lazy(() => import('@/pages/family/FamilyDashboard'));
const AdherencePage = lazy(() => import('@/pages/family/AdherencePage'));
const AlertsPage = lazy(() => import('@/pages/family/AlertsPage'));

// Caregiver dashboard pages
const CaregiverDashboard = lazy(() => import('@/pages/caregiver/CaregiverDashboard'));
const TaskQueuePage = lazy(() => import('@/pages/caregiver/TaskQueuePage'));
const AuditPage = lazy(() => import('@/pages/caregiver/AuditPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <Spinner size="lg" aria-label="Loading page..." />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />

                  {/* Onboarding routes (requires auth, no role yet) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/onboarding/role" element={<RoleSelectionPage />} />
                    <Route path="/onboarding/profile" element={<CreateProfilePage />} />
                    <Route path="/onboarding/care-circle" element={<InviteCareCirclePage />} />
                    <Route path="/onboarding/verify-passcode" element={<VerifyPasscodePage />} />
                    <Route path="/onboarding/consent" element={<ConsentPage />} />
                  </Route>

                  {/* Elderly adult routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<RoleGuard allowedRoles={['profile_owner']} />}>
                      <Route path="/dashboard" element={<TodayDashboard />} />
                      <Route path="/medications" element={<MedicationsPage />} />
                      <Route path="/appointments" element={<AppointmentsPage />} />
                      <Route path="/routines" element={<RoutinesPage />} />
                      <Route path="/care-circle" element={<CareCirclePage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                  </Route>

                  {/* Family member routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<RoleGuard allowedRoles={['family_member']} />}>
                      <Route path="/family" element={<FamilyDashboard />} />
                      <Route path="/family/adherence" element={<AdherencePage />} />
                      <Route path="/family/alerts" element={<AlertsPage />} />
                    </Route>
                  </Route>

                  {/* Caregiver routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<RoleGuard allowedRoles={['caregiver']} />}>
                      <Route path="/caregiver" element={<CaregiverDashboard />} />
                      <Route path="/caregiver/tasks" element={<TaskQueuePage />} />
                      <Route path="/caregiver/audit" element={<AuditPage />} />
                    </Route>
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
