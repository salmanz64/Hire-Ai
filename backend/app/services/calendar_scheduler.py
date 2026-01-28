from typing import List, Optional
from datetime import datetime, timedelta
import os

try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    Credentials = None
    build = None
    HttpError = Exception

SCOPES = ['https://www.googleapis.com/auth/calendar']


class CalendarScheduler:
    def __init__(self, credentials_path: str, token_path: str = None, calendar_id: str = 'primary'):
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.calendar_id = calendar_id
        self.service = None

    def authenticate(self) -> bool:
        if not build:
            return False

        try:
            if not os.path.exists(self.credentials_path):
                return False

            creds = Credentials.from_service_account_file(
                self.credentials_path,
                scopes=SCOPES
            )
            self.service = build('calendar', 'v3', credentials=creds)
            return True
        except Exception:
            return False

    def find_available_slots(
        self,
        start_date: datetime,
        end_date: datetime,
        duration_minutes: int = 60,
        working_hours: tuple = (9, 17)
    ) -> List[datetime]:
        if not self.service:
            if not self.authenticate():
                return []

        try:
            available_slots = []
            current_date = start_date

            while current_date <= end_date:
                if current_date.weekday() < 5:
                    for hour in range(working_hours[0], working_hours[1]):
                        slot_start = current_date.replace(
                            hour=hour, minute=0, second=0, microsecond=0
                        )
                        slot_end = slot_start + timedelta(minutes=duration_minutes)

                        if self._is_slot_free(slot_start, slot_end):
                            available_slots.append(slot_start)

                current_date += timedelta(days=1)

            return available_slots
        except Exception:
            return []

    def _is_slot_free(self, start_time: datetime, end_time: datetime) -> bool:
        try:
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=start_time.isoformat(),
                timeMax=end_time.isoformat(),
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])
            return len(events) == 0
        except Exception:
            return False

    def schedule_interview(
        self,
        candidate_name: str,
        candidate_email: str,
        interview_date: datetime,
        duration_minutes: int = 60,
        job_title: str = "Interview",
        description: str = ""
    ) -> Optional[str]:
        if not self.service:
            if not self.authenticate():
                return None

        try:
            start_time = interview_date
            end_time = interview_date + timedelta(minutes=duration_minutes)

            event = {
                'summary': f'Interview: {candidate_name} - {job_title}',
                'description': f'{description or "Interview for " + job_title + " position"}\nCandidate Email: {candidate_email}',
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': 60},
                    ],
                },
            }

            event = self.service.events().insert(
                calendarId=self.calendar_id,
                body=event
            ).execute()

            event_link = event.get('htmlLink', '')
            return event_link
        except HttpError:
            return None
        except Exception:
            return None

    def schedule_multiple_interviews(
        self,
        candidates: List[dict],
        job_title: str,
        start_date: datetime,
        duration_minutes: int = 60
    ) -> List[dict]:
        scheduled = []
        current_date = start_date

        for candidate in candidates:
            interview_link = self.schedule_interview(
                candidate_name=candidate.get('name', 'Unknown'),
                candidate_email=candidate.get('email', ''),
                interview_date=current_date,
                duration_minutes=duration_minutes,
                job_title=job_title,
                description=candidate.get('summary', '')
            )

            if interview_link:
                scheduled.append({
                    'candidate_id': candidate.get('id'),
                    'candidate_name': candidate.get('name'),
                    'candidate_email': candidate.get('email'),
                    'interview_date': current_date.isoformat(),
                    'interview_link': interview_link
                })
                current_date += timedelta(hours=1)

        return scheduled

    def cancel_interview(self, event_id: str) -> bool:
        if not self.service:
            if not self.authenticate():
                return False

        try:
            self.service.events().delete(
                calendarId=self.calendar_id,
                eventId=event_id
            ).execute()
            return True
        except Exception:
            return False
