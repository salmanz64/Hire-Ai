"""
Main HR Agent workflow orchestrator.
"""
import logging
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from ..models.schemas import Candidate, JobDescription, InterviewSchedule, EmailDraft
from ..services.resume_parser import ResumeParser
from ..services.resume_analyzer import ResumeAnalyzer
from ..services.candidate_ranker import CandidateRanker
from ..services.calendar_scheduler import CalendarScheduler
from ..services.email_service import EmailDraftService
from ..config.settings import settings

logger = logging.getLogger(__name__)


class HRAgent:
    """Main HR Agent that orchestrates the entire workflow."""

    def __init__(self):
        """Initialize the HR Agent with all required services."""
        self.resume_parser = ResumeParser()
        self.resume_analyzer = ResumeAnalyzer(api_key=settings.groq_api_key)
        self.candidate_ranker = CandidateRanker()
        self.calendar_scheduler = CalendarScheduler(
            credentials_path=settings.google_calendar_credentials_path,
            calendar_id=settings.google_calendar_id
        )
        self.email_service = EmailDraftService(
            smtp_config={
                'smtp_server': settings.smtp_server,
                'smtp_port': settings.smtp_port,
                'smtp_username': settings.smtp_username,
                'smtp_password': settings.smtp_password
            }
        )

    async def process_resumes(
        self,
        resume_files: List[str],
        job_description: JobDescription
    ) -> Dict:
        """
        Process uploaded resumes and analyze against job description.

        Args:
            resume_files: List of paths to resume PDF files
            job_description: Job description to match against

        Returns:
            Dict with job_id, candidates, and summary
        """
        job_id = str(uuid.uuid4())
        analyses = []

        logger.info(f"Starting resume processing for job {job_id}")

        for resume_file in resume_files:
            try:
                # Parse resume
                resume_text = self.resume_parser.extract_text_from_pdf(resume_file)

                if not resume_text or not self.resume_parser.validate_resume(resume_text):
                    logger.warning(f"Skipping invalid resume: {resume_file}")
                    continue

                # Analyze resume
                analysis = self.resume_analyzer.analyze_resume(
                    resume_text,
                    job_description.dict()
                )

                # Add metadata
                analysis['resume_id'] = str(uuid.uuid4())
                analysis['candidate_id'] = str(uuid.uuid4())
                analysis['filename'] = resume_file.split('\\')[-1]
                analysis['job_id'] = job_id

                analyses.append(analysis)
                logger.info(f"Analyzed resume: {analysis.get('candidate_name', 'Unknown')}")

            except Exception as e:
                logger.error(f"Error processing resume {resume_file}: {str(e)}")
                continue

        # Rank candidates
        ranked_analyses = self.candidate_ranker.rank_candidates(analyses)

        # Convert to Candidate objects
        candidates = [
            Candidate(
                id=analysis['candidate_id'],
                name=analysis['candidate_name'],
                email=analysis.get('email', ''),
                phone=analysis.get('phone', ''),
                resume_id=analysis['resume_id'],
                score=analysis['overall_score'],
                summary=analysis['summary'],
                skills=analysis.get('matched_skills', []),
                experience=analysis.get('years_of_experience', ''),
                match_reasoning=analysis['match_reasoning']
            )
            for analysis in ranked_analyses
        ]

        summary = self.candidate_ranker.generate_ranking_summary(ranked_analyses)

        return {
            'job_id': job_id,
            'total_resumes': len(resume_files),
            'processed_resumes': len(candidates),
            'candidates': [candidate.dict() for candidate in candidates],
            'summary': summary,
            'status': 'completed'
        }

    async def select_and_schedule_interviews(
        self,
        job_id: str,
        candidate_ids: List[str],
        candidates: List[Candidate],
        job_title: str,
        start_date: Optional[datetime] = None
    ) -> Dict:
        """
        Select top candidates and schedule interviews.

        Args:
            job_id: Job ID
            candidate_ids: IDs of candidates to schedule
            candidates: List of all candidates
            job_title: Title of the position
            start_date: Date to start scheduling from

        Returns:
            Dict with scheduled interviews and email drafts
        """
        if not start_date:
            start_date = datetime.now() + timedelta(days=1)

        selected_candidates = [
            c for c in candidates if c.id in candidate_ids
        ]

        if not selected_candidates:
            logger.warning("No candidates selected for interview")
            return {
                'scheduled_interviews': [],
                'email_drafts': [],
                'status': 'failed'
            }

        logger.info(f"Scheduling interviews for {len(selected_candidates)} candidates")

        # Schedule interviews
        scheduled = []
        email_drafts = []

        for candidate in selected_candidates:
            try:
                interview_date = start_date + timedelta(hours=len(scheduled))
                interview_link = self.calendar_scheduler.schedule_interview(
                    candidate_name=candidate.name,
                    candidate_email=candidate.email or 'no-email@example.com',
                    interview_date=interview_date,
                    duration_minutes=settings.interview_duration_minutes,
                    job_title=job_title,
                    description=candidate.summary
                )

                if interview_link:
                    # Draft confirmation email
                    email_draft = self.email_service.draft_interview_confirmation(
                        candidate_name=candidate.name,
                        candidate_email=candidate.email or 'no-email@example.com',
                        interview_date=interview_date,
                        interview_link=interview_link,
                        job_title=job_title
                    )

                    scheduled.append({
                        'candidate_id': candidate.id,
                        'candidate_name': candidate.name,
                        'candidate_email': candidate.email,
                        'interview_date': interview_date.isoformat(),
                        'interview_link': interview_link
                    })

                    email_drafts.append(email_draft)

            except Exception as e:
                logger.error(f"Error scheduling interview for {candidate.name}: {str(e)}")
                continue

        return {
            'scheduled_interviews': scheduled,
            'email_drafts': email_drafts,
            'status': 'completed'
        }

    async def send_confirmations(self, email_drafts: List[Dict]) -> Dict:
        """
        Send interview confirmation emails.

        Args:
            email_drafts: List of email draft dicts

        Returns:
            Dict with sent and failed emails
        """
        sent = []
        failed = []

        for draft in email_drafts:
            try:
                success = self.email_service.send_email(
                    email_data=draft,
                    from_email=settings.from_email,
                    from_name=settings.from_name
                )

                if success:
                    sent.append(draft['to_email'])
                else:
                    failed.append(draft['to_email'])

            except Exception as e:
                logger.error(f"Error sending email to {draft['to_email']}: {str(e)}")
                failed.append(draft['to_email'])

        return {
            'sent_count': len(sent),
            'failed_count': len(failed),
            'sent_emails': sent,
            'failed_emails': failed,
            'status': 'completed'
        }

    def get_available_slots(
        self,
        start_date: datetime,
        end_date: datetime,
        duration_minutes: int = 60
    ) -> List[datetime]:
        """
        Get available interview slots.

        Args:
            start_date: Start date
            end_date: End date
            duration_minutes: Duration of interview

        Returns:
            List of available datetime slots
        """
        return self.calendar_scheduler.find_available_slots(
            start_date=start_date,
            end_date=end_date,
            duration_minutes=duration_minutes
        )
