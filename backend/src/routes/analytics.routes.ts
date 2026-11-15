import { Router, Response } from 'express';
import { DoseOccurrence, Medication } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';

const router = Router();

// GET /profiles/:profileId/analytics/adherence
router.get('/:profileId/analytics/adherence', authenticate, requireProfileAccess('canViewMedications'), async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const doses = await DoseOccurrence.find({
      careProfile: req.params.profileId,
      scheduledTime: { $gte: startDate, $lte: new Date() },
    }).populate('medication', 'name');

    let totalEligible = 0;
    let totalTaken = 0;
    let totalSkipped = 0;
    let totalMissed = 0;

    const dailyBreakdown: Record<string, { date: string; taken: number; skipped: number; missed: number; total: number; rate: number }> = {};

    doses.forEach((d) => {
      const dateKey = new Date(d.scheduledTime).toISOString().split('T')[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { date: dateKey, taken: 0, skipped: 0, missed: 0, total: 0, rate: 0 };
      }

      dailyBreakdown[dateKey].total += 1;
      totalEligible += 1;

      if (d.status === 'taken') {
        dailyBreakdown[dateKey].taken += 1;
        totalTaken += 1;
      } else if (d.status === 'skipped') {
        dailyBreakdown[dateKey].skipped += 1;
        totalSkipped += 1;
      } else if (d.status === 'missed' || d.status === 'unconfirmed') {
        dailyBreakdown[dateKey].missed += 1;
        totalMissed += 1;
      }
    });

    Object.values(dailyBreakdown).forEach((day) => {
      day.rate = day.total > 0 ? Math.round((day.taken / day.total) * 100) : 0;
    });

    const overallRate = totalEligible > 0 ? Math.round((totalTaken / totalEligible) * 100) : 100;

    res.json({
      disclaimer: 'Descriptive summary for care tracking only. Not medical diagnosis or clinical advice.',
      periodDays: days,
      summary: {
        totalEligible,
        totalTaken,
        totalSkipped,
        totalMissed,
        overallRate,
      },
      dailyTrends: Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to calculate adherence' });
  }
});

// GET /profiles/:profileId/analytics/refill-watch
router.get('/:profileId/analytics/refill-watch', authenticate, requireProfileAccess('canViewMedications'), async (req: AuthRequest, res: Response) => {
  try {
    const medications = await Medication.find({
      careProfile: req.params.profileId,
      status: 'active',
    });

    const refillItems = medications.map((m) => {
      const inventory = m.currentInventory ?? 30;
      const threshold = m.refillThreshold ?? 5;
      const dailyDoses = m.scheduleTimes?.length || 1;
      const estimatedDaysRemaining = Math.max(0, Math.floor(inventory / Math.max(1, dailyDoses)));

      return {
        medicationId: m._id,
        name: m.name,
        strength: m.strength,
        unit: m.unit,
        currentInventory: inventory,
        refillThreshold: threshold,
        estimatedDaysRemaining,
        isLowStock: inventory <= threshold,
      };
    });

    res.json({
      disclaimer: 'Estimated supply based on recorded dosages. Verify physical inventory.',
      refillItems,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch refill watch' });
  }
});

export default router;
