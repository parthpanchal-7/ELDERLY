# ELDERLY

Smart, collaborative elderly healthcare management platform focused on medication adherence,
appointment tracking, and family/caretaker visibility.

## What this implementation provides

- Passcode-protected elderly healthcare profiles
- Shared access for elderly, caretakers, and family members
- Medication schedule management and adherence tracking (`taken`/`missed`)
- Appointment management with proactive reminders
- Email reminder engine for:
  - upcoming medication doses
  - missed medication alerts
  - upcoming appointments

## Quick usage

```python
from datetime import datetime, time
from elderly_platform import HealthcarePlatform, Medication

platform = HealthcarePlatform()
profile = platform.create_profile("elder-1", "Nirmala", "2468")
profile.add_member("care@example.com", "caretaker", "2468")

profile.add_medication(
    Medication(
        name="Amlodipine",
        dosage="5mg",
        schedule_times=[time(9, 0)],
        reminder_emails=["care@example.com"],
    ),
    "2468",
)

messages = platform.process_reminders(datetime(2026, 1, 1, 8, 45))
```

## Running tests

```bash
python -m unittest discover -s tests -p "test_*.py"
```
