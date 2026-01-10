"""
Google Calendar integration service for scheduling interviews.
"""
import logging
from typing import List, Optional
from datetime import datetime, timedelta
import os
import json

try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    Credentials = None
    build = None
    HttpError = Exception

logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/calendar']


class CalendarScheduler:
    """Service to schedule interviews using Google Calendar API."""

    def __init__(self, credentials_path: str, token_path: str = None, calendar_id: str = 'primary'):
        """
        Initialize the calendar scheduler.

        Args:
            credentials_path: Path to Google Service Account JSON file
            token_path: Not used for Service Account (kept for compatibility)
            calendar_id: Google Calendar ID (default: 'primary')
        """
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.calendar_id = calendar_id
        self.service = None

    def authenticate(self) -> bool:
        """
        Authenticate with Google Calendar API using Service Account.

        Returns:
            True if authentication successful, False otherwise
        """
        if not build:
            logger.error("Google API libraries not installed")
            return False

        try:
            if not os.path.exists(self.credentials_path):
                logger.error(f"Credentials file not found: {self.credentials_path}")
                return False

            creds = Credentials.from_service_account_file(
                self.credentials_path,
                scopes=SCOPES
            )
            self.service = build('calendar', 'v3', credentials=creds)
            logger.info("Successfully authenticated with Google Calendar using Service Account")
            return True

        except Exception as e:
            logger.error(f"Error authenticating with Google Calendar: {str(e)}")
            return False

    def find_available_slots(
        self,
        start_date: datetime,
        end_date: datetime,
        duration_minutes: int = 60,
        working_hours: tuple = (9, 17)
    ) -> List[datetime]:
        """
        Find available time slots for interviews.

        Args:
            start_date: Start date to search from
            end_date: End date to search until
            duration_minutes: Duration of each interview slot
            working_hours: Tuple of (start_hour, end_hour) for working hours

        Returns:
            List of available datetime slots
        """
        if not self.service:
            if not self.authenticate():
                return []

        try:
            available_slots = []
            current_date = start_date

            while current_date <= end_date:
                if current_date.weekday() < 5:  # Monday to Friday
                    for hour in range(working_hours[0], working_hours[1]):
                        slot_start = current_date.replace(
                            hour=hour, minute=0, second=0, microsecond=0
                        )
                        slot_end = slot_start + timedelta(minutes=duration_minutes)

                        if self._is_slot_free(slot_start, slot_end):
                            available_slots.append(slot_start)

                current_date += timedelta(days=1)

            logger.info(f"Found {len(available_slots)} available slots")
            return available_slots

        except Exception as e:
            logger.error(f"Error finding available slots: {str(e)}")
            return []

    def _is_slot_free(self, start_time: datetime, end_time: datetime) -> bool:
        """
        Check if a time slot is free (no existing events).

        Args:
            start_time: Start of the slot
            end_time: End of the slot

        Returns:
            True if slot is free, False otherwise
        """
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

        except Exception as e:
            logger.error(f"Error checking slot availability: {str(e)}")
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
        """
        Schedule an interview on Google Calendar.

        Args:
            candidate_name: Name of the candidate
            candidate_email: Email of the candidate
            interview_date: Date and time of the interview
            duration_minutes: Duration in minutes
            job_title: Title of the job
            description: Description for the event

        Returns:
            Event link if successful, None otherwise
        """
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
                        {'method': 'popup', 'minutes': 60},  # 1 hour before
                    ],
                },
            }

            event = self.service.events().insert(
                calendarId=self.calendar_id,
                body=event
            ).execute()

            event_link = event.get('htmlLink', '')

            logger.info(f"Scheduled interview for {candidate_name} at {interview_date}")
            return event_link

        except HttpError as e:
            logger.error(f"Google Calendar API error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error scheduling interview: {str(e)}")
            return None

    def schedule_multiple_interviews(
        self,
        candidates: List[dict],
        job_title: str,
        start_date: datetime,
        duration_minutes: int = 60
    ) -> List[dict]:
        """
        Schedule interviews for multiple candidates.

        Args:
            candidates: List of candidate dicts with name, email, etc.
            job_title: Title of the job
            start_date: Date to start scheduling from
            duration_minutes: Duration of each interview

        Returns:
            List of scheduled interviews with links
        """
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
        """
        Cancel an interview event.

        Args:
            event_id: ID of the event to cancel

        Returns:
            True if successful, False otherwise
        """
        if not self.service:
            if not self.authenticate():
                return False

        try:
            self.service.events().delete(
                calendarId=self.calendar_id,
                eventId=event_id
            ).execute()
            logger.info(f"Cancelled interview event {event_id}")
            return True

        except Exception as e:
            logger.error(f"Error cancelling interview: {str(e)}")
            return False
