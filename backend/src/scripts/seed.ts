import { connectDB } from '../config/db.js';
import {
  User,
  CareProfile,
  CareCircleMembership,
  Medication,
  DoseOccurrence,
  DoseEvent,
  Appointment,
  Routine,
  RoutineCompletion,
  HealthObservation,
  EmergencyContact,
  MedicalDocument,
  Notification,
  NotificationPreference,
  AuditLog,
  Invitation,
} from '../models/index.js';

export async function clearDemoData() {
  console.log('[DB Clean] Connecting to database to remove all demo and prefill data...');
  await connectDB();

  // Remove all hardcoded demo accounts and associated data
  const demoEmails = [
    'ramesh@saathicare.com',
    'priya@saathicare.com',
    'sunita@saathicare.com',
    'demo.google@saathicare.com',
  ];

  const demoUsers = await User.find({ email: { $in: demoEmails } });
  const demoUserIds = demoUsers.map((u) => u._id);

  const demoProfiles = await CareProfile.find({
    $or: [{ owner: { $in: demoUserIds } }, { fullName: 'Ramesh Sharma' }],
  });
  const demoProfileIds = demoProfiles.map((p) => p._id);

  console.log(`[DB Clean] Found ${demoUsers.length} demo users and ${demoProfiles.length} demo care profiles.`);

  await Promise.all([
    User.deleteMany({ _id: { $in: demoUserIds } }),
    CareProfile.deleteMany({ _id: { $in: demoProfileIds } }),
    CareCircleMembership.deleteMany({
      $or: [{ careProfile: { $in: demoProfileIds } }, { user: { $in: demoUserIds } }],
    }),
    Invitation.deleteMany({ careProfile: { $in: demoProfileIds } }),
    Medication.deleteMany({ careProfile: { $in: demoProfileIds } }),
    DoseOccurrence.deleteMany({ careProfile: { $in: demoProfileIds } }),
    DoseEvent.deleteMany({ careProfile: { $in: demoProfileIds } }),
    Appointment.deleteMany({ careProfile: { $in: demoProfileIds } }),
    Routine.deleteMany({ careProfile: { $in: demoProfileIds } }),
    RoutineCompletion.deleteMany({ careProfile: { $in: demoProfileIds } }),
    HealthObservation.deleteMany({ careProfile: { $in: demoProfileIds } }),
    EmergencyContact.deleteMany({ careProfile: { $in: demoProfileIds } }),
    MedicalDocument.deleteMany({ careProfile: { $in: demoProfileIds } }),
    Notification.deleteMany({
      $or: [{ careProfile: { $in: demoProfileIds } }, { recipientUser: { $in: demoUserIds } }],
    }),
    NotificationPreference.deleteMany({
      $or: [{ careProfile: { $in: demoProfileIds } }, { user: { $in: demoUserIds } }],
    }),
    AuditLog.deleteMany({
      $or: [{ careProfile: { $in: demoProfileIds } }, { actor: { $in: demoUserIds } }],
    }),
  ]);

  console.log('[DB Clean] Successfully cleared all hardcoded demo data from MongoDB.');
  console.log('[DB Clean] The database is now completely clean and ready for real user registrations.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  clearDemoData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[DB Clean Error]:', err.message);
      process.exit(1);
    });
}
