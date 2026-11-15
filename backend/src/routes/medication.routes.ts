import { Router, Response } from 'express';
import { Medication, DoseOccurrence, AuditLog } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';

const router = Router();

// Helper to generate dose occurrences for the next 7 days
export async function scheduleDosesForMedication(medication: any, daysAhead: number = 7) {
  const times = medication.scheduleTimes || ['08:00'];
  const startDate = new Date(medication.startDate || Date.now());
  startDate.setHours(0, 0, 0, 0);

  const endDate = medication.endDate ? new Date(medication.endDate) : new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  endDate.setHours(23, 59, 59, 999);

  const occurrencesToCreate = [];

  for (let d = 0; d < daysAhead; d++) {
    const curDate = new Date();
    curDate.setDate(curDate.getDate() + d);

    // If specific days of week configured
    if (medication.daysOfWeek && medication.daysOfWeek.length > 0) {
      if (!medication.daysOfWeek.includes(curDate.getDay())) {
        continue;
      }
    }

    for (const timeStr of times) {
      const [h, m] = timeStr.split(':').map(Number);
      const scheduledTime = new Date(curDate);
      scheduledTime.setHours(h, m, 0, 0);

      // Don't schedule before start date or past end date
      if (scheduledTime < startDate || scheduledTime > endDate) {
        continue;
      }

      occurrencesToCreate.push({
        careProfile: medication.careProfile,
        medication: medication._id,
        scheduledTime,
        status: 'scheduled',
      });
    }
  }

  for (const occ of occurrencesToCreate) {
    try {
      await DoseOccurrence.findOneAndUpdate(
        { medication: occ.medication, scheduledTime: occ.scheduledTime },
        { $setOnInsert: occ },
        { upsert: true }
      );
    } catch (e) {
      // Ignore unique duplicate key errors
    }
  }
}

// GET /profiles/:profileId/medications
router.get('/:profileId/medications', authenticate, requireProfileAccess('canViewMedications'), async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const filter: any = { careProfile: req.params.profileId };
    if (status) {
      filter.status = status;
    }

    const medications = await Medication.find(filter).sort({ createdAt: -1 });
    res.json({ medications });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch medications' });
  }
});

// POST /profiles/:profileId/medications
router.post('/:profileId/medications', authenticate, requireProfileAccess('canEditMedications'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      genericName,
      brandName,
      strength,
      unit,
      form,
      color,
      shape,
      instructions,
      mealContext,
      frequency,
      scheduleTimes,
      daysOfWeek,
      startDate,
      endDate,
      prescribingDoctor,
      prescriptionNumber,
      currentInventory,
      refillThreshold,
      notes,
    } = req.body;

    if (!name || !strength || !unit || !scheduleTimes || scheduleTimes.length === 0) {
      return res.status(400).json({ error: 'Name, strength, unit, and schedule times are required.' });
    }

    const medication = new Medication({
      careProfile: req.params.profileId,
      name,
      genericName,
      brandName,
      strength,
      unit,
      form: form || 'tablet',
      color,
      shape,
      instructions: instructions || 'Take with water',
      mealContext: mealContext || 'no_restriction',
      frequency: frequency || 'daily',
      scheduleTimes,
      daysOfWeek,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      prescribingDoctor,
      prescriptionNumber,
      currentInventory: currentInventory ?? 30,
      refillThreshold: refillThreshold ?? 5,
      notes,
    });

    await medication.save();

    // Automatically generate scheduled doses for next 7 days
    await scheduleDosesForMedication(medication, 7);

    await AuditLog.create({
      careProfile: req.params.profileId,
      actor: req.user._id,
      action: 'CREATE',
      targetEntity: 'Medication',
      targetEntityId: medication._id.toString(),
      details: { name, strength, unit },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ medication });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create medication' });
  }
});

// GET /medications/:id
router.get('/detail/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ medication });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch medication' });
  }
});

// PUT /medications/:id
router.put('/detail/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    const fields = [
      'name',
      'genericName',
      'brandName',
      'strength',
      'unit',
      'form',
      'color',
      'shape',
      'instructions',
      'mealContext',
      'frequency',
      'scheduleTimes',
      'daysOfWeek',
      'startDate',
      'endDate',
      'prescribingDoctor',
      'currentInventory',
      'refillThreshold',
      'status',
      'notes',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (medication as any)[f] = req.body[f];
      }
    });

    await medication.save();

    // Reschedule
    if (medication.status === 'active') {
      await scheduleDosesForMedication(medication, 7);
    }

    await AuditLog.create({
      careProfile: medication.careProfile,
      actor: req.user._id,
      action: 'UPDATE',
      targetEntity: 'Medication',
      targetEntityId: medication._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ medication });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update medication' });
  }
});

// DELETE /medications/:id (discontinue)
router.delete('/detail/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    medication.status = 'discontinued';
    medication.discontinuedAt = new Date();
    medication.discontinueReason = req.body.reason || 'Discontinued by care provider';
    await medication.save();

    // Remove future unconfirmed doses
    await DoseOccurrence.deleteMany({
      medication: medication._id,
      scheduledTime: { $gt: new Date() },
      status: 'scheduled',
    });

    await AuditLog.create({
      careProfile: medication.careProfile,
      actor: req.user._id,
      action: 'DELETE',
      targetEntity: 'Medication',
      targetEntityId: medication._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Medication discontinued and future scheduled doses removed.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to discontinue medication' });
  }
});

export default router;
