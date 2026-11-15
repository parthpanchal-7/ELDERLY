import { Router, Response } from 'express';
import { DoseOccurrence, DoseEvent, Medication, CareCircleMembership, CareProfile, Notification, AuditLog } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';
import { sendEmail, buildEscalationEmail } from '../utils/email.js';

const router = Router();

// GET /profiles/:profileId/doses
router.get('/:profileId/doses', authenticate, requireProfileAccess('canViewMedications'), async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, days } = req.query;
    const filter: any = { careProfile: req.params.profileId };

    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      filter.scheduledTime = { $gte: startOfDay, $lte: endOfDay };
    } else if (days) {
      const numDays = parseInt(days as string, 10) || 7;
      const start = new Date();
      start.setDate(start.getDate() - numDays);
      filter.scheduledTime = { $gte: start };
    }

    if (status) {
      filter.status = status;
    }

    // Auto-update 'scheduled' to 'due' or 'unconfirmed' based on time
    const now = new Date();
    await DoseOccurrence.updateMany(
      {
        careProfile: req.params.profileId,
        status: 'scheduled',
        scheduledTime: { $lte: now },
      },
      { $set: { status: 'due' } }
    );

    const doses = await DoseOccurrence.find(filter)
      .populate('medication', 'name strength unit instructions mealContext form color shape currentInventory refillThreshold')
      .populate('takenBy', 'displayName primaryRole')
      .sort({ scheduledTime: 1 });

    res.json({ doses });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch doses' });
  }
});

// POST /doses/:id/confirm (Mark as taken)
router.post('/:id/confirm', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dose = await DoseOccurrence.findById(req.params.id).populate('medication');
    if (!dose) {
      return res.status(404).json({ error: 'Dose not found' });
    }

    if (dose.status === 'taken') {
      return res.status(400).json({ error: 'This dose has already been confirmed as taken.' });
    }

    const takenAt = req.body.takenAt ? new Date(req.body.takenAt) : new Date();

    dose.status = 'taken';
    dose.takenAt = takenAt;
    dose.takenBy = req.user._id;
    dose.notes = req.body.notes || dose.notes;
    await dose.save();

    // Decrement inventory on Medication
    const med = await Medication.findById(dose.medication);
    if (med && typeof med.currentInventory === 'number' && med.currentInventory > 0) {
      med.currentInventory -= 1;
      await med.save();

      // Trigger low-stock refill notification if under threshold
      if (med.refillThreshold && med.currentInventory <= med.refillThreshold) {
        await Notification.create({
          careProfile: dose.careProfile,
          recipientUser: req.user._id,
          title: `Refill Alert: ${med.name}`,
          message: `Inventory for ${med.name} is running low (${med.currentInventory} remaining). Please arrange a refill.`,
          type: 'refill_alert',
          channel: 'in_app',
          relatedEntityId: med._id,
          relatedEntityType: 'medication',
        });
      }
    }

    // Record immutable DoseEvent
    await DoseEvent.create({
      doseOccurrence: dose._id,
      medication: dose.medication._id,
      careProfile: dose.careProfile,
      actor: req.user._id,
      action: 'confirm_taken',
      notes: req.body.notes,
      timestamp: takenAt,
    });

    await AuditLog.create({
      careProfile: dose.careProfile,
      actor: req.user._id,
      action: 'CONFIRM_DOSE',
      targetEntity: 'DoseOccurrence',
      targetEntityId: dose._id.toString(),
      details: { medicationId: dose.medication._id, takenAt },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Dose recorded as taken', dose });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to confirm dose' });
  }
});

// POST /doses/:id/skip
router.post('/:id/skip', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dose = await DoseOccurrence.findById(req.params.id);
    if (!dose) {
      return res.status(404).json({ error: 'Dose not found' });
    }

    dose.status = 'skipped';
    dose.skippedAt = new Date();
    dose.skippedBy = req.user._id;
    dose.skipReason = req.body.reason || 'Skipped by user';
    await dose.save();

    await DoseEvent.create({
      doseOccurrence: dose._id,
      medication: dose.medication,
      careProfile: dose.careProfile,
      actor: req.user._id,
      action: 'skip',
      notes: req.body.reason,
    });

    await AuditLog.create({
      careProfile: dose.careProfile,
      actor: req.user._id,
      action: 'SKIP_DOSE',
      targetEntity: 'DoseOccurrence',
      targetEntityId: dose._id.toString(),
      details: { reason: req.body.reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Dose recorded as skipped', dose });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to skip dose' });
  }
});

// POST /doses/:id/snooze
router.post('/:id/snooze', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dose = await DoseOccurrence.findById(req.params.id);
    if (!dose) {
      return res.status(404).json({ error: 'Dose not found' });
    }

    const minutes = parseInt(req.body.minutes || '15', 10);
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);

    dose.status = 'snoozed';
    dose.snoozedUntil = snoozedUntil;
    await dose.save();

    await DoseEvent.create({
      doseOccurrence: dose._id,
      medication: dose.medication,
      careProfile: dose.careProfile,
      actor: req.user._id,
      action: 'snooze',
      notes: `Snoozed for ${minutes} minutes`,
    });

    await AuditLog.create({
      careProfile: dose.careProfile,
      actor: req.user._id,
      action: 'SNOOZE_DOSE',
      targetEntity: 'DoseOccurrence',
      targetEntityId: dose._id.toString(),
      details: { minutes, snoozedUntil },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: `Dose snoozed for ${minutes} minutes`, dose });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to snooze dose' });
  }
});

// POST /profiles/:profileId/doses/escalation-check
// Proactive Care Assurance Loop: Checks doses overdue > 30 mins, notifies Care Circle
router.post('/:profileId/doses/escalation-check', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const profileId = req.params.profileId;
    const profile = await CareProfile.findById(profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const gracePeriodMs = 30 * 60 * 1000; // 30 minutes grace period
    const overdueCutoff = new Date(Date.now() - gracePeriodMs);

    const overdueDoses = await DoseOccurrence.find({
      careProfile: profileId,
      status: { $in: ['scheduled', 'due', 'snoozed'] },
      scheduledTime: { $lte: overdueCutoff },
      escalatedAt: { $exists: false },
    }).populate('medication');

    const escalationsSent = [];

    // Find care circle members who want escalation alerts
    const members = await CareCircleMembership.find({
      careProfile: profileId,
      status: 'active',
      'permissions.canReceiveEscalations': true,
    }).populate('user');

    for (const dose of overdueDoses) {
      dose.status = 'unconfirmed';
      dose.escalatedAt = new Date();
      await dose.save();

      const med: any = dose.medication;
      const scheduledStr = new Date(dose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      for (const m of members) {
        const user: any = m.user;
        if (!user) continue;

        // Create in-app notification
        await Notification.create({
          careProfile: profileId,
          recipientUser: user._id,
          title: `Overdue Dose Alert: ${med.name}`,
          message: `${profile.fullName} has an unconfirmed dose of ${med.name} (${scheduledStr}). Please check in.`,
          type: 'dose_escalation',
          channel: 'in_app',
          relatedEntityId: dose._id,
          relatedEntityType: 'dose',
        });

        // Send Email escalation if email present
        if (user.email) {
          const emailContent = buildEscalationEmail(profile.fullName, user.displayName, med.name, scheduledStr);
          await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
          });
        }
      }

      escalationsSent.push({
        doseId: dose._id,
        medicationName: med.name,
        scheduledTime: dose.scheduledTime,
      });
    }

    res.json({
      message: `Escalation check complete. Processed ${escalationsSent.length} overdue doses.`,
      escalationsSent,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed running escalation check' });
  }
});

export default router;
