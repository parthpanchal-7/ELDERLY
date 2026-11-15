export function generateICS(appointment: {
  title: string;
  doctorName: string;
  clinicOrHospital: string;
  appointmentDateTime: Date;
  locationAddress?: string;
  notes?: string;
}): string {
  const dt = new Date(appointment.appointmentDateTime);
  const end = new Date(dt.getTime() + 45 * 60 * 1000); // 45 minutes duration

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SaathiCare//Appointments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:saathicare-appt-${dt.getTime()}@saathicare.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(dt)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${appointment.title} - Dr. ${appointment.doctorName}`,
    `DESCRIPTION:${(appointment.notes || '').replace(/\n/g, '\\n')} (Doctor: ${appointment.doctorName})`,
    `LOCATION:${appointment.clinicOrHospital}${appointment.locationAddress ? ', ' + appointment.locationAddress : ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
