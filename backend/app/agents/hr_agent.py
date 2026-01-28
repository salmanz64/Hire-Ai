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


class HRAgent:
    def __init__(self):
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
        job_id = str(uuid.uuid4())
        analyses = []

        for resume_file in resume_files:
            try:
                resume_text = self.resume_parser.extract_text_from_pdf(resume_file)

                if not resume_text or not self.resume_parser.validate_resume(resume_text):
                    continue

                analysis = self.resume_analyzer.analyze_resume(
                    resume_text,
                    job_description.dict()
                )

                analysis['resume_id'] = str(uuid.uuid4())
                analysis['candidate_id'] = str(uuid.uuid4())
                analysis['filename'] = resume_file.split('\\')[-1]
                analysis['job_id'] = job_id

                analyses.append(analysis)
            except Exception:
                continue

        ranked_analyses = self.candidate_ranker.rank_candidates(analyses)

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
        if not start_date:
            start_date = datetime.now() + timedelta(days=1)

        selected_candidates = [
            c for c in candidates if c.id in candidate_ids
        ]

        if not selected_candidates:
            return {
                'scheduled_interviews': [],
                'email_drafts': [],
                'status': 'failed'
            }

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
            except Exception:
                continue

        return {
            'scheduled_interviews': scheduled,
            'email_drafts': email_drafts,
            'status': 'completed'
        }

    async def send_confirmations(self, email_drafts: List[Dict]) -> Dict:
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
            except Exception:
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
        return self.calendar_scheduler.find_available_slots(
            start_date=start_date,
            end_date=end_date,
            duration_minutes=duration_minutes
        )
