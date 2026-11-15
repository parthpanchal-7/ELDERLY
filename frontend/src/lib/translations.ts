export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Brand
    brandName: 'SaathiCare',
    brandTagline: 'Care that feels close to home',

    // Navigation
    navToday: 'Today',
    navMedications: 'Medications',
    navAppointments: 'Appointments',
    navRoutines: 'Routines',
    navCareCircle: 'Care Circle',
    navAlerts: 'Alerts',
    navMyHealth: 'My Health',
    navOverview: 'Overview',
    navAdherence: 'Adherence Trends',
    navCareAlerts: 'Care Alerts',
    navAssignedPatients: 'Assigned Patients',
    navTaskQueue: 'Task Queue',
    navAuditTrail: 'Audit Trail',
    signIn: 'Sign In',
    signOut: 'Sign Out',

    // Accessibility Controls
    textSize: 'Text Size',
    highContrast: 'High Contrast',
    voiceReadout: 'Voice Readout',
    stopVoice: 'Stop Voice',
    language: 'Language',
    refresh: 'Refresh',

    // Elderly Dashboard
    greeting: 'Namaste',
    todayIs: 'Today is',
    priorityAction: 'Priority Action • Next Due Dose',
    markAsTaken: 'Mark as Taken',
    snooze15m: 'Snooze 15m',
    skipDose: 'Skip Dose...',
    instructions: 'Instructions',
    scheduledTime: 'Scheduled Time',
    allDosesCompleted: 'All scheduled doses for today have been completed!',
    greatJob: 'Wonderful job keeping up with your health today.',
    upcomingAppointments: 'Upcoming Doctor Appointments',
    noUpcomingAppointments: 'No appointments scheduled for today.',
    dailyRoutines: 'Daily Care Routines',
    noRoutines: 'No routines scheduled for today.',
    completed: 'Completed',
    markDone: 'Mark Done',
    emergencyContacts: 'Emergency Contacts & Help',
    ambulanceCall: 'Emergency Ambulance (108 / 112)',
    careCircleContacts: 'Trusted Care Circle Members',
    noContactsYet: 'No care circle contacts added yet.',

    // Status badges
    statusScheduled: 'Scheduled',
    statusDue: 'Due Now',
    statusTaken: 'Taken',
    statusSkipped: 'Skipped',
    statusUnconfirmed: 'Overdue / Unconfirmed',
    statusMissed: 'Missed',
  },
  hi: {
    // Brand
    brandName: 'साथीकेयर',
    brandTagline: 'घर जैसा अपनापन',

    // Navigation
    navToday: 'आज का कार्यक्रम',
    navMedications: 'दवाइयां',
    navAppointments: 'अपॉइंटमेंट',
    navRoutines: 'दिनचर्या',
    navCareCircle: 'देखभाल दायरा',
    navAlerts: 'सूचनाएं',
    navMyHealth: 'मेरी सेहत',
    navOverview: 'अवलोकन',
    navAdherence: 'दवा अनुपालन',
    navCareAlerts: 'केयर अलर्ट्स',
    navAssignedPatients: 'मरीज सूची',
    navTaskQueue: 'कार्य सूची',
    navAuditTrail: 'ऑडिट लॉग',
    signIn: 'साइन इन',
    signOut: 'लॉग आउट',

    // Accessibility Controls
    textSize: 'अक्षर आकार',
    highContrast: 'हाई कंट्रास्ट',
    voiceReadout: 'बोलकर सुनाएं',
    stopVoice: 'आवाज बंद करें',
    language: 'भाषा',
    refresh: 'ताज़ा करें',

    // Elderly Dashboard
    greeting: 'नमस्ते',
    todayIs: 'आज की तारीख',
    priorityAction: 'प्राथमिक कार्य • अगली दवा खुराक',
    markAsTaken: 'दवा ले ली ✓',
    snooze15m: '15 मिनट बाद',
    skipDose: 'छोड़ें...',
    instructions: 'निर्देश',
    scheduledTime: 'निर्धारित समय',
    allDosesCompleted: 'आज की सभी निर्धारित दवाइयां पूरी हो चुकी हैं!',
    greatJob: 'आज अपनी सेहत का पूरा ध्यान रखने के लिए बहुत अच्छा!',
    upcomingAppointments: 'आगामी डॉक्टर अपॉइंटमेंट',
    noUpcomingAppointments: 'आज कोई अपॉइंटमेंट नहीं है।',
    dailyRoutines: 'दैनिक दिनचर्या व आदतें',
    noRoutines: 'आज कोई दिनचर्या निर्धारित नहीं है।',
    completed: 'पूर्ण',
    markDone: 'पूरा किया',
    emergencyContacts: 'आपातकालीन संपर्क व सहायता',
    ambulanceCall: 'आपातकालीन एम्बुलेंस (108 / 112)',
    careCircleContacts: 'विश्वस्त देखभाल सदस्य',
    noContactsYet: 'अभी कोई देखभाल सदस्य नहीं जोड़ा गया है।',

    // Status badges
    statusScheduled: 'निर्धारित',
    statusDue: 'लेने का समय',
    statusTaken: 'ले ली गई',
    statusSkipped: 'छोड़ दी',
    statusUnconfirmed: 'देर / अपुष्ट',
    statusMissed: 'छूट गई',
  },
};

export type TranslationKey = keyof typeof translations['en'];
