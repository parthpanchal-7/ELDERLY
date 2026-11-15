import { Router, Response } from 'express';
import { Appointment, AuditLog } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';
import { generateICS } from '../utils/ics.js';

const router = Router();

// GET /profiles/:profileId/appointments
router.get('/:profileId/appointments', authenticate, requireProfileAccess('canViewAppointments'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { careProfile: req.params.profileId };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter).sort({ appointmentDateTime: 1 });
    res.json({ appointments });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch appointments' });
  }
});

// POST /profiles/:profileId/appointments
router.post('/:profileId/appointments', authenticate, requireProfileAccess('canEditAppointments'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      doctorName,
      specialty,
      clinicOrHospital,
      locationAddress,
      appointmentDateTime,
      notes,
      reminderMinutesBefore,
    } = req.body;

    if (!title || !doctorName || !clinicOrHospital || !appointmentDateTime) {
      return res.status(400).json({ error: 'Title, doctor name, clinic/hospital, and datetime are required.' });
    }

    const appointment = new Appointment({
      careProfile: req.params.profileId,
      title,
      doctorName,
      specialty,
      clinicOrHospital,
      locationAddress,
      appointmentDateTime: new Date(appointmentDateTime),
      notes,
      reminderMinutesBefore: reminderMinutesBefore || [1440, 60],
    });

    await appointment.save();

    await AuditLog.create({
      careProfile: req.params.profileId,
      actor: req.user._id,
      action: 'CREATE',
      targetEntity: 'Appointment',
      targetEntityId: appointment._id.toString(),
      details: { title, doctorName, appointmentDateTime },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ appointment });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create appointment' });
  }
});

// PUT /appointments/detail/:id
router.put('/detail/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const fields = [
      'title',
      'doctorName',
      'specialty',
      'clinicOrHospital',
      'locationAddress',
      'appointmentDateTime',
      'status',
      'notes',
      'reminderMinutesBefore',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        if (f === 'appointmentDateTime') {
          (appointment as any)[f] = new Date(req.body[f]);
        } else {
          (appointment as any)[f] = req.body[f];
        }
      }
    });

    if (req.body.status === 'completed') {
      appointment.completedAt = new Date();
    } else if (req.body.status === 'cancelled') {
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
    }

    await appointment.save();

    await AuditLog.create({
      careProfile: appointment.careProfile,
      actor: req.user._id,
      action: 'UPDATE',
      targetEntity: 'Appointment',
      targetEntityId: appointment._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ appointment });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update appointment' });
  }
});

// GET /appointments/detail/:id/ics - iCalendar export
router.get('/detail/:id/ics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const icsContent = generateICS({
      title: appointment.title,
      doctorName: appointment.doctorName,
      clinicOrHospital: appointment.clinicOrHospital,
      appointmentDateTime: appointment.appointmentDateTime,
      locationAddress: appointment.locationAddress,
      notes: appointment.notes,
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="appointment-${appointment._id}.ics"`);
    res.send(icsContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate calendar file' });
  }
});

export default router;
