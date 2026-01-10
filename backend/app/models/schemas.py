"""
Data models for the HR AI Agent application.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class JobDescription(BaseModel):
    title: str
    description: str
    requirements: List[str]
    skills: List[str]
    experience_level: Optional[str] = "mid"


class Resume(BaseModel):
    id: str
    filename: str
    content: str
    upload_date: datetime


class Candidate(BaseModel):
    id: str
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    resume_id: str
    score: float = Field(ge=0, le=100)
    summary: str
    skills: List[str]
    experience: str
    match_reasoning: str
    interview_date: Optional[datetime] = None
    interview_link: Optional[str] = None


class CandidateAnalysis(BaseModel):
    candidate: Candidate
    job_match_score: float
    skill_match_score: float
    experience_match_score: float


class InterviewSchedule(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_email: str
    interview_date: datetime
    interview_link: str


class EmailDraft(BaseModel):
    to_email: str
    to_name: str
    subject: str
    body: str
    interview_date: datetime
    interview_link: str


class InterviewRequest(BaseModel):
    job_id: str
    candidate_ids: List[str]
    preferred_dates: List[datetime]
    interview_duration: int = 60


class ProcessingResponse(BaseModel):
    job_id: str
    total_resumes: int
    processed_resumes: int
    candidates: List[Candidate]
    status: str
