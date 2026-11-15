from datetime import datetime, time, timedelta
import unittest

from elderly_platform import Appointment, HealthcarePlatform, Medication, ProfileAccessError


class HealthcarePlatformTests(unittest.TestCase):
    def setUp(self) -> None:
        self.platform = HealthcarePlatform()
        self.profile = self.platform.create_profile("elder-1", "Nirmala", "2468")

    def test_passcode_protects_profile_access(self) -> None:
        with self.assertRaises(ProfileAccessError):
            self.platform.get_profile("elder-1", "wrong")

        profile = self.platform.get_profile("elder-1", "2468")
        self.assertEqual(profile.elder_name, "Nirmala")

    def test_shared_members_can_be_added_with_valid_role(self) -> None:
        self.profile.add_member("care@example.com", "caretaker", "2468")
        self.profile.add_member("family@example.com", "family", "2468")

        self.assertEqual(self.profile.members["care@example.com"], "caretaker")
        self.assertEqual(self.profile.members["family@example.com"], "family")

    def test_upcoming_and_missed_medication_reminders(self) -> None:
        medication = Medication(
            name="Amlodipine",
            dosage="5mg",
            schedule_times=[time(9, 0), time(20, 0)],
            reminder_emails=["care@example.com"],
        )
        self.profile.add_medication(medication, "2468")

        reminders = self.platform.process_reminders(datetime(2026, 1, 1, 8, 40))
        self.assertEqual(len(reminders), 1)
        self.assertIn("Upcoming medication dose", reminders[0].subject)

        reminders_again = self.platform.process_reminders(datetime(2026, 1, 1, 8, 45))
        self.assertEqual(len(reminders_again), 0)

        missed_reminders = self.platform.process_reminders(datetime(2026, 1, 1, 10, 5))
        self.assertEqual(len(missed_reminders), 1)
        self.assertIn("Missed medication alert", missed_reminders[0].subject)

    def test_recording_taken_dose_prevents_missed_alert(self) -> None:
        medication = Medication(
            name="Metformin",
            dosage="500mg",
            schedule_times=[time(9, 0)],
            reminder_emails=["care@example.com"],
        )
        self.profile.add_medication(medication, "2468")

        scheduled = datetime(2026, 1, 1, 9, 0)
        self.profile.record_medication_status("Metformin", scheduled, "taken", "2468")

        missed_reminders = self.platform.process_reminders(datetime(2026, 1, 1, 11, 0))
        self.assertEqual(missed_reminders, [])

    def test_appointment_reminder_sent_once(self) -> None:
        appointment = Appointment(
            title="Cardiology Follow-up",
            starts_at=datetime(2026, 1, 2, 10, 0),
            location="City Hospital",
            reminder_emails=["care@example.com", "family@example.com"],
        )
        self.profile.add_appointment(appointment, "2468")

        reminders = self.platform.process_reminders(
            datetime(2026, 1, 1, 12, 0), appointment_window=timedelta(hours=24)
        )
        self.assertEqual(len(reminders), 2)

        reminders_again = self.platform.process_reminders(
            datetime(2026, 1, 1, 13, 0), appointment_window=timedelta(hours=24)
        )
        self.assertEqual(reminders_again, [])


if __name__ == "__main__":
    unittest.main()
