import { Router, Response } from 'express';
import { CareProfile, CareCircleMembership, AuditLog, Medication, Appointment, HealthObservation, EmergencyContact } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';

const router = Router();

// POST /profiles - Create care profile
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      allergies,
      chronicConditions,
      primaryPhysician,
      primaryPhysicianPhone,
      emergencyContacts,
      bio,
    } = req.body;

    if (!fullName || !dateOfBirth) {
      return res.status(400).json({ error: 'Full name and date of birth are required.' });
    }

    const filteredContacts = (emergencyContacts || []).filter((c: any) => c && (c.name || c.phone));

    const careProfile = new CareProfile({
      owner: req.user._id,
      fullName: fullName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender: gender || 'prefer_not_to_say',
      bloodGroup,
      allergies: Array.isArray(allergies) ? allergies : typeof allergies === 'string' ? allergies.split(',').map((a: string) => a.trim()).filter(Boolean) : [],
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : typeof chronicConditions === 'string' ? chronicConditions.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
      primaryPhysician,
      primaryPhysicianPhone,
      emergencyContacts: filteredContacts,
      bio,
      hasCompletedOnboarding: true,
    });

    await careProfile.save();

    // Mark user onboarding complete
    req.user.hasCompletedOnboarding = true;
    await req.user.save();

    await AuditLog.create({
      careProfile: careProfile._id,
      actor: req.user._id,
      action: 'CREATE',
      targetEntity: 'CareProfile',
      targetEntityId: careProfile._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ careProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create care profile' });
  }
});

// GET /profiles - Get all care profiles accessible by current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Owned profiles
    const ownedProfiles = await CareProfile.find({ owner: req.user._id }).populate('owner', 'displayName email phone');

    // 2. Profiles where user is care circle member
    const memberships = await CareCircleMembership.find({
      user: req.user._id,
      status: 'active',
    }).populate({
      path: 'careProfile',
      populate: { path: 'owner', select: 'displayName email phone' },
    });

    const memberProfiles = memberships
      .map((m) => m.careProfile)
      .filter((p) => p !== null && p !== undefined);

    const allProfiles = [...ownedProfiles, ...memberProfiles];
    // Deduplicate by _id
    const seen = new Set();
    const unique = allProfiles.filter((p: any) => {
      const id = p._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.json({ careProfiles: unique });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch care profiles' });
  }
});

// GET /profiles/:id - Get specific profile
router.get('/:id', authenticate, requireProfileAccess('canViewMedications'), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await CareProfile.findById(req.params.id).populate('owner', 'displayName email phone');
    res.json({ careProfile: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch care profile' });
  }
});

// PUT /profiles/:id - Update profile (owner only)
router.put('/:id', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    if (req.careProfile.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the profile owner can update core profile details.' });
    }

    const allowedUpdates = [
      'fullName',
      'dateOfBirth',
      'gender',
      'bloodGroup',
      'allergies',
      'chronicConditions',
      'primaryPhysician',
      'primaryPhysicianPhone',
      'emergencyContacts',
      'bio',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.careProfile[field] = req.body[field];
      }
    });

    await req.careProfile.save();

    await AuditLog.create({
      careProfile: req.careProfile._id,
      actor: req.user._id,
      action: 'UPDATE',
      targetEntity: 'CareProfile',
      targetEntityId: req.careProfile._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ careProfile: req.careProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update care profile' });
  }
});

// GET /profiles/:id/export - Patient data export (owner only or permitted)
router.get('/:id/export', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const profileId = req.params.id;
    const [profile, medications, appointments, observations, careCircle] = await Promise.all([
      CareProfile.findById(profileId),
      Medication.find({ careProfile: profileId }),
      Appointment.find({ careProfile: profileId }),
      HealthObservation.find({ careProfile: profileId }),
      CareCircleMembership.find({ careProfile: profileId, status: 'active' }).populate('user', 'displayName email phone'),
    ]);

    await AuditLog.create({
      careProfile: profileId,
      actor: req.user._id,
      action: 'EXPORT',
      targetEntity: 'CareProfile',
      targetEntityId: profileId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      exportedAt: new Date(),
      careProfile: profile,
      medications,
      appointments,
      healthObservations: observations,
      careCircleMembers: careCircle,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Export failed' });
  }
});

export default router;
