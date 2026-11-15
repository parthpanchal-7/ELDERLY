import { Router, Response } from 'express';
import { HealthObservation, AuditLog } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';

const router = Router();

// GET /profiles/:profileId/observations
router.get('/:profileId/observations', authenticate, requireProfileAccess('canViewObservations'), async (req: AuthRequest, res: Response) => {
  try {
    const { type, limit } = req.query;
    const filter: any = { careProfile: req.params.profileId };
    if (type) {
      filter.type = type;
    }

    const observations = await HealthObservation.find(filter)
      .populate('recordedBy', 'displayName primaryRole')
      .sort({ observedAt: -1 })
      .limit(parseInt(limit as string, 10) || 50);

    res.json({ observations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch observations' });
  }
});

// POST /profiles/:profileId/observations
router.post('/:profileId/observations', authenticate, requireProfileAccess('canAddObservations'), async (req: AuthRequest, res: Response) => {
  try {
    const { type, value, secondaryValue, unit, notes, userEnteredContext, observedAt } = req.body;

    if (!type || value === undefined || !unit) {
      return res.status(400).json({ error: 'Type, value, and unit are required.' });
    }

    const observation = new HealthObservation({
      careProfile: req.params.profileId,
      recordedBy: req.user._id,
      type,
      value: Number(value),
      secondaryValue: secondaryValue !== undefined ? Number(secondaryValue) : undefined,
      unit,
      notes,
      userEnteredContext,
      observedAt: observedAt ? new Date(observedAt) : new Date(),
    });

    await observation.save();

    await AuditLog.create({
      careProfile: req.params.profileId,
      actor: req.user._id,
      action: 'CREATE',
      targetEntity: 'HealthObservation',
      targetEntityId: observation._id.toString(),
      details: { type, value, unit },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ observation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record observation' });
  }
});

export default router;
