"""
HR router with all API endpoints.
"""
import logging
import os
import shutil
import sys
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.schemas import JobDescription, Candidate, InterviewSchedule, ProcessingResponse
from ..agents.hr_agent import HRAgent
from ..config.settings import settings
from ..models.database import get_db, User, Job, Candidate as CandidateModel, Usage
from ..services.auth_service import AuthService

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


class CreateJobRequest(BaseModel):
    title: str
    description: str
    requirements: str
    skills: str
    experience_level: str


async def get_current_user_optional(request: Request, db: AsyncSession = Depends(get_db)):
    """Get current authenticated user from token (optional)."""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        payload = AuthService.decode_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except:
        return None


@router.get("/jobs")
async def get_jobs(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """Get all jobs for the current user."""
    try:
        sys.stdout.flush()
        print(f"\n>>> GET /api/v1/jobs - current_user: {current_user.email if current_user else None}", flush=True)
        
        if not current_user:
            print("    No user authenticated, returning empty list", flush=True)
            return []
            
        print(f"    Fetching jobs for user_id: {current_user.id}", flush=True)
        result = await db.execute(
            select(Job).where(Job.user_id == current_user.id).order_by(Job.created_at.desc())
        )
        jobs = result.scalars().all()
        
        print(f"    Found {len(jobs)} jobs", flush=True)
        
        jobs_list = []
        for job in jobs:
            candidates_result = await db.execute(
                select(CandidateModel).where(CandidateModel.job_id == job.id)
            )
            candidates = candidates_result.scalars().all()
            
            jobs_list.append({
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "requirements": job.requirements,
                "skills": job.skills,
                "experience_level": job.experience_level,
                "is_active": bool(job.is_active),
                "created_at": job.created_at.isoformat(),
                "candidates": [
                    {
                        "id": c.id,
                        "name": c.name,
                        "email": c.email,
                        "score": c.score,
                        "is_selected": bool(c.is_selected)
                    }
                    for c in candidates
                ]
            })
        
        return jobs_list
    except Exception as e:
        print(f"    ERROR: {str(e)}", flush=True)
        logger.error(f"Error fetching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")


@router.post("/jobs")
async def create_job(job_data: CreateJobRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """Create a new job."""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        new_job = Job(
            user_id=current_user.id,
            title=job_data.title,
            description=job_data.description,
            requirements=job_data.requirements,
            skills=job_data.skills,
            experience_level=job_data.experience_level,
            is_active=True
        )
        
        db.add(new_job)
        await db.commit()
        await db.refresh(new_job)
        
        return {
            "id": new_job.id,
            "title": new_job.title,
            "description": new_job.description,
            "requirements": new_job.requirements,
            "skills": new_job.skills,
            "experience_level": new_job.experience_level,
            "is_active": bool(new_job.is_active),
            "created_at": new_job.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating job: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create job")


@router.patch("/jobs/{job_id}")
async def update_job(job_id: str, is_active: bool = Form(...), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """Update job status."""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        result = await db.execute(
            select(Job).where(Job.id == job_id, Job.user_id == current_user.id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        setattr(job, 'is_active', is_active)
        await db.commit()
        
        return {"id": job.id, "is_active": bool(job.is_active)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating job: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update job")


@router.get("/usage")
async def get_usage(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """Get usage statistics for the current user."""
    try:
        sys.stdout.flush()
        print(f"\n>>> GET /api/v1/usage - current_user: {current_user.email if current_user else None}", flush=True)
        
        if not current_user:
            print("    No user authenticated, returning zeros", flush=True)
            return {
                "resumes_processed": 0,
                "job_postings": 0,
                "api_calls": 0
            }
            
        current_month = datetime.now().strftime("%Y-%m")
        print(f"    Fetching usage for user_id: {current_user.id}, month: {current_month}", flush=True)
        
        result = await db.execute(
            select(Usage).where(Usage.user_id == current_user.id, Usage.month == current_month)
        )
        usage = result.scalar_one_or_none()
        
        if not usage:
            print("    No usage record found, returning zeros", flush=True)
            return {
                "resumes_processed": 0,
                "job_postings": 0,
                "api_calls": 0
            }
        
        result_data = {
            "resumes_processed": usage.resumes_processed,
            "job_postings": usage.job_postings,
            "api_calls": usage.api_calls
        }
        print(f"    Usage data: {result_data}", flush=True)
        return result_data
    except Exception as e:
        print(f"    ERROR: {str(e)}", flush=True)
        logger.error(f"Error fetching usage: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch usage")


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
            if resume.filename:
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
