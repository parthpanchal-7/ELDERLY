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
  HealthObservation,
  EmergencyContact,
  Notification,
  AuditLog,
} from '../models/index.js';
import { hashPassword } from '../utils/crypto.js';
import { scheduleDosesForMedication } from '../routes/medication.routes.js';

export async function seedDatabase() {
  console.log('[Seed] Starting SaathiCare synthetic demo data seeding...');
  await connectDB();

  // Clear existing demo data
  await Promise.all([
    User.deleteMany({ email: { $in: ['ramesh@saathicare.com', 'priya@saathicare.com', 'sunita@saathicare.com'] } }),
    CareProfile.deleteMany({ fullName: 'Ramesh Sharma' }),
  ]);

  const defaultPasswordHash = await hashPassword('Password123!');

  // 1. Create Elderly Profile Owner
  const rameshUser = await User.create({
    displayName: 'Ramesh Sharma',
    email: 'ramesh@saathicare.com',
    passwordHash: defaultPasswordHash,
    phone: '+919876543210',
    primaryRole: 'profile_owner',
    isEmailVerified: true,
    isPhoneVerified: true,
    preferredLanguage: 'en',
    timezone: 'Asia/Kolkata',
    hasCompletedOnboarding: true,
  });

  // 2. Create CareProfile
  const rameshProfile = await CareProfile.create({
    owner: rameshUser._id,
    fullName: 'Ramesh Sharma',
    dateOfBirth: new Date('1952-04-12'),
    gender: 'male',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
    primaryPhysician: 'Dr. Alok Mehta',
    primaryPhysicianPhone: '+919811122233',
    primaryPhysicianEmail: 'dr.mehta@apollohospitals.demo',
    bio: 'Retired school headmaster. Loves morning walks and classical music.',
    emergencyContacts: [
      {
        name: 'Priya Sharma',
        relationship: 'Daughter',
        phone: '+919876543211',
        isPrimary: true,
      },
      {
        name: 'Apollo Hospital Emergency',
        relationship: 'Preferred Hospital',
        phone: '1066',
        isPrimary: false,
      },
    ],
    hasCompletedOnboarding: true,
  });

  // 3. Create Family Member
  const priyaUser = await User.create({
    displayName: 'Priya Sharma',
    email: 'priya@saathicare.com',
    passwordHash: defaultPasswordHash,
    phone: '+919876543211',
    primaryRole: 'family_member',
    isEmailVerified: true,
    hasCompletedOnboarding: true,
  });

  await CareCircleMembership.create({
    careProfile: rameshProfile._id,
    user: priyaUser._id,
    role: 'family_member',
    relationshipToOwner: 'Daughter',
    permissions: {
      canViewMedications: true,
      canConfirmDoses: true,
      canEditMedications: false,
      canViewAppointments: true,
      canEditAppointments: true,
      canViewObservations: true,
      canAddObservations: false,
      canViewDocuments: true,
      canUploadDocuments: true,
      canReceiveEscalations: true,
      canManageCareCircle: true,
      canExportData: true,
    },
    status: 'active',
    acceptedAt: new Date(),
  });

  // 4. Create Caregiver
  const sunitaUser = await User.create({
    displayName: 'Nurse Sunita Rao',
    email: 'sunita@saathicare.com',
    passwordHash: defaultPasswordHash,
    phone: '+919876543212',
    primaryRole: 'caregiver',
    isEmailVerified: true,
    hasCompletedOnboarding: true,
  });

  await CareCircleMembership.create({
    careProfile: rameshProfile._id,
    user: sunitaUser._id,
    role: 'caregiver',
    relationshipToOwner: 'Home Care Nurse',
    permissions: {
      canViewMedications: true,
      canConfirmDoses: true,
      canEditMedications: true,
      canViewAppointments: true,
      canEditAppointments: true,
      canViewObservations: true,
      canAddObservations: true,
      canViewDocuments: true,
      canUploadDocuments: true,
      canReceiveEscalations: true,
      canManageCareCircle: false,
      canExportData: false,
    },
    status: 'active',
    acceptedAt: new Date(),
  });

  // 5. Create Medications
  const med1 = await Medication.create({
    careProfile: rameshProfile._id,
    name: 'Amlodipine Besylate',
    genericName: 'Amlodipine',
    brandName: 'Norvasc',
    strength: '5',
    unit: 'mg',
    form: 'tablet',
    color: '#F0F4F8',
    shape: 'Round white pill',
    instructions: 'Take 1 tablet every morning with a glass of water.',
    mealContext: 'after_meal',
    frequency: 'daily',
    scheduleTimes: ['08:00'],
    startDate: new Date('2024-01-01'),
    prescribingDoctor: 'Dr. Alok Mehta',
    currentInventory: 24,
    refillThreshold: 5,
    notes: 'Prescribed for blood pressure management.',
  });

  const med2 = await Medication.create({
    careProfile: rameshProfile._id,
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin',
    brandName: 'Glucophage',
    strength: '500',
    unit: 'mg',
    form: 'tablet',
    color: '#FFFFFF',
    shape: 'Oval white scored',
    instructions: 'Take with breakfast and dinner to minimize GI discomfort.',
    mealContext: 'with_meal',
    frequency: 'twice_daily',
    scheduleTimes: ['08:00', '20:00'],
    startDate: new Date('2024-01-01'),
    prescribingDoctor: 'Dr. Alok Mehta',
    currentInventory: 4, // Below threshold to trigger Refill Watch!
    refillThreshold: 6,
    notes: 'Monitor blood sugar before taking.',
  });

  const med3 = await Medication.create({
    careProfile: rameshProfile._id,
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin',
    brandName: 'Lipitor',
    strength: '10',
    unit: 'mg',
    form: 'tablet',
    color: '#FFF9E6',
    shape: 'Elliptical white',
    instructions: 'Take at bedtime.',
    mealContext: 'no_restriction',
    frequency: 'daily',
    scheduleTimes: ['21:00'],
    startDate: new Date('2024-01-01'),
    prescribingDoctor: 'Dr. Alok Mehta',
    currentInventory: 18,
    refillThreshold: 5,
  });

  // Schedule doses for all 3 medications
  await Promise.all([
    scheduleDosesForMedication(med1, 7),
    scheduleDosesForMedication(med2, 7),
    scheduleDosesForMedication(med3, 7),
  ]);

  // Adjust today's doses to provide realistic dashboard states:
  const todayMorning = new Date();
  todayMorning.setHours(8, 0, 0, 0);

  // Set morning Amlodipine to 'taken'
  await DoseOccurrence.findOneAndUpdate(
    { medication: med1._id, scheduledTime: todayMorning },
    { $set: { status: 'taken', takenAt: new Date(todayMorning.getTime() + 15 * 60 * 1000), takenBy: rameshUser._id } }
  );

  // Set morning Metformin to 'due'
  await DoseOccurrence.findOneAndUpdate(
    { medication: med2._id, scheduledTime: todayMorning },
    { $set: { status: 'due' } }
  );

  // 6. Create Appointments
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);
  nextWeek.setHours(10, 30, 0, 0);

  await Appointment.create({
    careProfile: rameshProfile._id,
    title: 'Quarterly Cardiology Review & ECG',
    doctorName: 'Alok Mehta',
    specialty: 'Cardiology',
    clinicOrHospital: 'Apollo Hospital Indirapuram',
    locationAddress: 'Plot 1, Ahinsa Khand 2, Indirapuram, Ghaziabad',
    appointmentDateTime: nextWeek,
    notes: 'Fast for 8 hours prior to lipid panel blood test.',
    reminderMinutesBefore: [1440, 120, 60],
  });

  // 7. Create Routines
  await Routine.create([
    {
      careProfile: rameshProfile._id,
      title: 'Morning Hydration (Warm Water)',
      description: 'Drink 2 full glasses of warm water right after waking up.',
      category: 'hydration',
      scheduleTimes: ['06:30'],
      isActive: true,
    },
    {
      careProfile: rameshProfile._id,
      title: 'Post-Breakfast Garden Walk',
      description: 'Gentle 20-minute stroll in the community park.',
      category: 'exercise',
      scheduleTimes: ['08:45'],
      isActive: true,
    },
    {
      careProfile: rameshProfile._id,
      title: 'Evening Blood Pressure Check',
      description: 'Rest for 5 minutes before recording cuff reading.',
      category: 'vital_check',
      scheduleTimes: ['18:00'],
      isActive: true,
    },
  ]);

  // 8. Health Observations
  const obsDates = [3, 2, 1, 0];
  for (const daysAgo of obsDates) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);

    await HealthObservation.create({
      careProfile: rameshProfile._id,
      recordedBy: rameshUser._id,
      type: 'blood_pressure',
      value: 126 - daysAgo * 2,
      secondaryValue: 82 - daysAgo,
      unit: 'mmHg',
      userEnteredContext: 'Morning reading before breakfast',
      observedAt: d,
    });

    await HealthObservation.create({
      careProfile: rameshProfile._id,
      recordedBy: rameshUser._id,
      type: 'blood_sugar',
      value: 118 + daysAgo * 3,
      unit: 'mg/dL',
      userEnteredContext: 'Fasting blood glucose',
      observedAt: d,
    });
  }

  // 9. Initial Notifications
  await Notification.create([
    {
      careProfile: rameshProfile._id,
      recipientUser: rameshUser._id,
      title: 'Care Assurance: Morning Metformin Due',
      message: 'It is time for your Metformin 500mg with breakfast.',
      type: 'dose_due',
      channel: 'in_app',
      status: 'delivered',
      relatedEntityId: med2._id,
      relatedEntityType: 'medication',
    },
    {
      careProfile: rameshProfile._id,
      recipientUser: priyaUser._id,
      title: 'Smart Refill Alert',
      message: 'Metformin inventory for Ramesh Sharma is at 4 tablets (below 6-day threshold). Refill recommended.',
      type: 'refill_alert',
      channel: 'in_app',
      status: 'delivered',
      relatedEntityId: med2._id,
      relatedEntityType: 'medication',
    },
  ]);

  // 10. Audit Log
  await AuditLog.create({
    careProfile: rameshProfile._id,
    actor: rameshUser._id,
    action: 'CREATE',
    targetEntity: 'CareProfile',
    targetEntityId: rameshProfile._id.toString(),
    details: { note: 'Initial profile setup' },
  });

  console.log('[Seed] Seeding completed successfully!');
  console.log('Demo Credentials:');
  console.log('1. Elderly Owner:   ramesh@saathicare.com  / Password123!');
  console.log('2. Family Member:   priya@saathicare.com   / Password123!');
  console.log('3. Caregiver:       sunita@saathicare.com  / Password123!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}
