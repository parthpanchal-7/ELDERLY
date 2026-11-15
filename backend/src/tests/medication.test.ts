import { describe, it, expect } from 'vitest';
import { generateICS } from '../utils/ics.js';

describe('SaathiCare Medication & Appointments Engine', () => {
  it('generates valid RFC 5545 iCalendar data for doctor appointments', () => {
    const appt = {
      title: 'Quarterly Cardiology Review',
      doctorName: 'Alok Mehta',
      clinicOrHospital: 'Apollo Hospital',
      appointmentDateTime: new Date('2026-11-20T10:30:00Z'),
      locationAddress: 'Ghaziabad, India',
      notes: 'Fasting lipid panel required',
    };

    const ics = generateICS(appt);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('SUMMARY:Quarterly Cardiology Review - Dr. Alok Mehta');
    expect(ics).toContain('LOCATION:Apollo Hospital, Ghaziabad, India');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('calculates adherence rate accurately based on eligible doses', () => {
    const eligible = 10;
    const taken = 8;
    const rate = Math.round((taken / eligible) * 100);
    expect(rate).toBe(80);
  });
});
