from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, time
import hashlib
import hmac
import secrets
from typing import Dict, List, Optional, Set


class ProfileAccessError(PermissionError):
    """Raised when an invalid passcode is used for profile access."""


@dataclass(frozen=True)
class EmailMessage:
    to: str
    subject: str
    body: str


class EmailNotifier:
    """Email abstraction to support integrations and testing."""

    def __init__(self) -> None:
        self.outbox: List[EmailMessage] = []

    def send(self, message: EmailMessage) -> None:
        self.outbox.append(message)


@dataclass
class Medication:
    name: str
    dosage: str
    schedule_times: List[time]
    reminder_emails: List[str]
    adherence_log: Dict[str, str] = field(default_factory=dict)


@dataclass
class Appointment:
    title: str
    starts_at: datetime
    location: str
    reminder_emails: List[str]


@dataclass
class ElderProfile:
    elder_id: str
    elder_name: str
    members: Dict[str, str] = field(default_factory=dict)  # email -> role
    medications: List[Medication] = field(default_factory=list)
    appointments: List[Appointment] = field(default_factory=list)
    _passcode_hash: bytes = field(default=b"", repr=False)
    _salt: bytes = field(default=b"", repr=False)
    _sent_reminders: Set[str] = field(default_factory=set, repr=False)

    def set_passcode(self, passcode: str) -> None:
        if len(passcode) < 4:
            raise ValueError("Passcode must be at least 4 characters long")
        self._salt = secrets.token_bytes(16)
        self._passcode_hash = hashlib.pbkdf2_hmac(
            "sha256", passcode.encode("utf-8"), self._salt, 200_000
        )

    def verify_passcode(self, passcode: str) -> bool:
        if not self._salt or not self._passcode_hash:
            return False
        computed = hashlib.pbkdf2_hmac(
            "sha256", passcode.encode("utf-8"), self._salt, 200_000
        )
        return hmac.compare_digest(self._passcode_hash, computed)

    def assert_access(self, passcode: str) -> None:
        if not self.verify_passcode(passcode):
            raise ProfileAccessError("Invalid passcode")

    def add_member(self, email: str, role: str, passcode: str) -> None:
        self.assert_access(passcode)
        if role not in {"elder", "caretaker", "family"}:
            raise ValueError("Role must be elder, caretaker, or family")
        self.members[email] = role

    def add_medication(self, medication: Medication, passcode: str) -> None:
        self.assert_access(passcode)
        self.medications.append(medication)

    def add_appointment(self, appointment: Appointment, passcode: str) -> None:
        self.assert_access(passcode)
        self.appointments.append(appointment)

    def record_medication_status(
        self, medication_name: str, scheduled_at: datetime, status: str, passcode: str
    ) -> None:
        self.assert_access(passcode)
        if status not in {"taken", "missed"}:
            raise ValueError("status must be taken or missed")
        for medication in self.medications:
            if medication.name == medication_name:
                medication.adherence_log[scheduled_at.isoformat()] = status
                return
        raise ValueError(f"Medication not found: {medication_name}")


class HealthcarePlatform:
    """Shared healthcare coordination platform for elders and care circles."""

    def __init__(self, notifier: Optional[EmailNotifier] = None) -> None:
        self._profiles: Dict[str, ElderProfile] = {}
        self._notifier = notifier or EmailNotifier()

    @property
    def notifier(self) -> EmailNotifier:
        return self._notifier

    def create_profile(self, elder_id: str, elder_name: str, passcode: str) -> ElderProfile:
        if elder_id in self._profiles:
            raise ValueError(f"Profile already exists: {elder_id}")
        profile = ElderProfile(elder_id=elder_id, elder_name=elder_name)
        profile.set_passcode(passcode)
        profile.members[f"{elder_id}@elder.local"] = "elder"
        self._profiles[elder_id] = profile
        return profile

    def get_profile(self, elder_id: str, passcode: str) -> ElderProfile:
        profile = self._profiles.get(elder_id)
        if profile is None:
            raise ValueError(f"Unknown elder profile: {elder_id}")
        profile.assert_access(passcode)
        return profile

    def process_reminders(
        self,
        now: datetime,
        dose_upcoming_window: timedelta = timedelta(minutes=30),
        dose_missed_after: timedelta = timedelta(minutes=60),
        appointment_window: timedelta = timedelta(hours=24),
    ) -> List[EmailMessage]:
        reminders: List[EmailMessage] = []
        for profile in self._profiles.values():
            reminders.extend(
                self._build_medication_reminders(
                    profile, now, dose_upcoming_window, dose_missed_after
                )
            )
            reminders.extend(self._build_appointment_reminders(profile, now, appointment_window))

        for reminder in reminders:
            self._notifier.send(reminder)
        return reminders

    def _build_medication_reminders(
        self,
        profile: ElderProfile,
        now: datetime,
        dose_upcoming_window: timedelta,
        dose_missed_after: timedelta,
    ) -> List[EmailMessage]:
        reminders: List[EmailMessage] = []
        today = now.date()

        for med in profile.medications:
            for dose_time in med.schedule_times:
                scheduled_at = datetime.combine(today, dose_time)
                key = f"{profile.elder_id}:med:{med.name}:{scheduled_at.isoformat()}"
                status = med.adherence_log.get(scheduled_at.isoformat())

                if status is None and now <= scheduled_at <= now + dose_upcoming_window:
                    reminder_id = key + ":upcoming"
                    if reminder_id not in profile._sent_reminders:
                        reminders.extend(
                            self._messages_for_recipients(
                                med.reminder_emails,
                                f"Upcoming medication dose for {profile.elder_name}",
                                (
                                    f"{profile.elder_name} should take {med.name} ({med.dosage}) "
                                    f"at {scheduled_at.strftime('%H:%M')}."
                                ),
                            )
                        )
                        profile._sent_reminders.add(reminder_id)

                if status is None and now > scheduled_at + dose_missed_after:
                    reminder_id = key + ":missed"
                    if reminder_id not in profile._sent_reminders:
                        reminders.extend(
                            self._messages_for_recipients(
                                med.reminder_emails,
                                f"Missed medication alert for {profile.elder_name}",
                                (
                                    f"{profile.elder_name} may have missed {med.name} scheduled at "
                                    f"{scheduled_at.strftime('%H:%M')}. Please check in."
                                ),
                            )
                        )
                        profile._sent_reminders.add(reminder_id)
        return reminders

    def _build_appointment_reminders(
        self,
        profile: ElderProfile,
        now: datetime,
        appointment_window: timedelta,
    ) -> List[EmailMessage]:
        reminders: List[EmailMessage] = []
        for appointment in profile.appointments:
            if now <= appointment.starts_at <= now + appointment_window:
                reminder_id = (
                    f"{profile.elder_id}:appt:{appointment.title}:{appointment.starts_at.isoformat()}"
                )
                if reminder_id in profile._sent_reminders:
                    continue
                reminders.extend(
                    self._messages_for_recipients(
                        appointment.reminder_emails,
                        f"Upcoming appointment for {profile.elder_name}",
                        (
                            f"{profile.elder_name} has '{appointment.title}' at "
                            f"{appointment.starts_at.strftime('%Y-%m-%d %H:%M')} ({appointment.location})."
                        ),
                    )
                )
                profile._sent_reminders.add(reminder_id)
        return reminders

    @staticmethod
    def _messages_for_recipients(
        recipients: List[str], subject: str, body: str
    ) -> List[EmailMessage]:
        return [EmailMessage(to=recipient, subject=subject, body=body) for recipient in recipients]
