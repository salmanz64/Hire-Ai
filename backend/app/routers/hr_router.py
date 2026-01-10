"""
HR router with all API endpoints.
"""
import logging
import os
import shutil
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from ..models.schemas import JobDescription, Candidate, InterviewSchedule, ProcessingResponse
from ..agents.hr_agent import HRAgent
from ..config.settings import settings

logger = logging.getLogger(__name__)

# Initialize HR Agent
hr_agent = HRAgent()

# Create router instance
router = APIRouter()

# Upload directory
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Import needed for Form
from fastapi import Form

class ProcessJobRequest(BaseModel):
    job_description: JobDescription
    resume_ids: List[str]


class ScheduleInterviewsRequest(BaseModel):
    job_id: str
    candidate_ids: List[str]
    candidates: List[Candidate]
    job_title: str
    start_date: Optional[datetime] = None


@router.post("/process-resumes", response_model=ProcessingResponse)
async def process_resumes(
    job_title: str = Form(...),
    job_description: str = Form(...),
    requirements: str = Form(...),
    skills: str = Form(...),
    experience_level: str = Form("mid"),
    resumes: List[UploadFile] = File(...)
):
    """
    Process uploaded resumes and analyze against job description.
    """
    try:
        # Parse job description
        job_desc = JobDescription(
            title=job_title,
            description=job_description,
            requirements=[r.strip() for r in requirements.split(',')],
            skills=[s.strip() for s in skills.split(',')],
            experience_level=experience_level
        )

        # Save uploaded files
        resume_paths = []
        for resume in resumes:
            file_path = os.path.join(UPLOAD_DIR, resume.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(resume.file, buffer)
            resume_paths.append(file_path)

        # Process resumes
        result = await hr_agent.process_resumes(resume_paths, job_desc)

        return ProcessingResponse(**result)

    except Exception as e:
        logger.error(f"Error processing resumes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/select-candidates")
async def select_candidates(request: ScheduleInterviewsRequest):
    """
    Select top candidates and schedule interviews.
    """
    try:
        result = await hr_agent.select_and_schedule_interviews(
            job_id=request.job_id,
            candidate_ids=request.candidate_ids,
            candidates=request.candidates,
            job_title=request.job_title,
            start_date=request.start_date
        )

        return result

    except Exception as e:
        logger.error(f"Error selecting candidates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-confirmations")
async def send_confirmations(email_drafts: List[dict]):
    """
    Send interview confirmation emails.
    """
    try:
        result = await hr_agent.send_confirmations(email_drafts)
        return result

    except Exception as e:
        logger.error(f"Error sending confirmations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available-slots")
async def get_available_slots(
    start_date: datetime,
    end_date: datetime,
    duration_minutes: int = 60
):
    """
    Get available interview slots.
    """
    try:
        slots = hr_agent.get_available_slots(
            start_date=start_date,
            end_date=end_date,
            duration_minutes=duration_minutes
        )

        return {
            "slots": [slot.isoformat() for slot in slots],
            "count": len(slots)
        }

    except Exception as e:
        logger.error(f"Error getting available slots: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rank-candidates")
async def rank_candidates(candidates: List[Candidate]):
    """
    Rank candidates based on their scores.
    """
    try:
        from ..services.candidate_ranker import CandidateRanker

        ranker = CandidateRanker()
        ranked = ranker.rank_candidates([c.dict() for c in candidates])

        return {
            "ranked_candidates": ranked,
            "summary": ranker.generate_ranking_summary(ranked)
        }

    except Exception as e:
        logger.error(f"Error ranking candidates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/draft-email")
async def draft_email(
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    interview_date: datetime = Form(...),
    interview_link: str = Form(...),
    job_title: str = Form("")
):
    """
    Draft an interview confirmation email.
    """
    try:
        from ..services.email_service import EmailDraftService

        email_service = EmailDraftService()
        draft = email_service.draft_interview_confirmation(
            candidate_name=candidate_name,
            candidate_email=candidate_email,
            interview_date=interview_date,
            interview_link=interview_link,
            job_title=job_title
        )

        return draft

    except Exception as e:
        logger.error(f"Error drafting email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
