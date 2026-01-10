"""
LLM-based resume analysis and matching service.
"""
import json
import logging
from typing import Dict, List, Optional
from groq import Groq
import re

logger = logging.getLogger(__name__)


class ResumeAnalyzer:
    """Service to analyze resumes and match against job descriptions using LLM."""

    def __init__(self, api_key: str):
        """Initialize the Groq client."""
        self.client = Groq(api_key=api_key)

    def analyze_resume(self, resume_text: str, job_description: Dict) -> Dict:
        """
        Analyze a resume against a job description.

        Args:
            resume_text: Extracted text from resume
            job_description: Job description dict with title, requirements, skills

        Returns:
            Analysis results including score, summary, skills, etc.
        """
        try:
            prompt = self._build_analysis_prompt(resume_text, job_description)
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR professional with deep knowledge in resume analysis and candidate evaluation. Provide accurate, objective, and detailed assessments."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            if not content:
                logger.error("LLM returned empty content")
                return self._get_default_analysis()
            
            result = json.loads(content)
            return self._normalize_analysis_result(result)

        except Exception as e:
            logger.error(f"Error analyzing resume: {str(e)}")
            return self._get_default_analysis()

    def _build_analysis_prompt(self, resume_text: str, job_description: Dict) -> str:
        """Build the prompt for LLM analysis."""
        prompt = f"""
Analyze the following resume against the job description and provide a detailed assessment.

JOB DESCRIPTION:
Title: {job_description.get('title', 'N/A')}
Description: {job_description.get('description', 'N/A')}
Requirements: {', '.join(job_description.get('requirements', []))}
Required Skills: {', '.join(job_description.get('skills', []))}
Experience Level: {job_description.get('experience_level', 'mid')}

RESUME TEXT:
{resume_text[:4000]}

Please provide a JSON response with the following structure:
{{
    "candidate_name": "Extract the candidate's full name",
    "email": "Extract the email address",
    "phone": "Extract phone number",
    "overall_score": 0-100 score indicating overall match,
    "skill_score": 0-100 score for skill match,
    "experience_score": 0-100 score for experience match,
    "matched_skills": ["list of matched skills from the job requirements"],
    "missing_skills": ["list of missing skills from job requirements"],
    "years_of_experience": "estimated years of relevant experience",
    "summary": "3-4 sentence summary of the candidate's qualifications and fit",
    "match_reasoning": "Detailed explanation of why this candidate is a good match or not",
    "strengths": ["list of key strengths"],
    "areas_for_improvement": ["list of areas where the candidate could improve"]
}}
"""
        return prompt

    def _normalize_analysis_result(self, result: Dict) -> Dict:
        """Normalize and validate the analysis result."""
        return {
            "candidate_name": result.get("candidate_name", "Unknown"),
            "email": result.get("email", ""),
            "phone": result.get("phone", ""),
            "overall_score": min(100, max(0, int(result.get("overall_score", 50)))),
            "skill_score": min(100, max(0, int(result.get("skill_score", 50)))),
            "experience_score": min(100, max(0, int(result.get("experience_score", 50)))),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "years_of_experience": result.get("years_of_experience", "Unknown"),
            "summary": result.get("summary", "No summary available"),
            "match_reasoning": result.get("match_reasoning", ""),
            "strengths": result.get("strengths", []),
            "areas_for_improvement": result.get("areas_for_improvement", [])
        }

    def _get_default_analysis(self) -> Dict:
        """Return default analysis if LLM fails."""
        return {
            "candidate_name": "Unknown",
            "email": "",
            "phone": "",
            "overall_score": 0,
            "skill_score": 0,
            "experience_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "years_of_experience": "Unknown",
            "summary": "Analysis failed",
            "match_reasoning": "Unable to analyze this resume due to an error",
            "strengths": [],
            "areas_for_improvement": []
        }

    def extract_contact_info(self, resume_text: str) -> Dict[str, str]:
        """
        Extract contact information from resume text using regex patterns.

        Args:
            resume_text: Resume text

        Returns:
            Dict with name, email, and phone
        """
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, resume_text)
        email = emails[0] if emails else ""

        # Extract phone (US format)
        phone_pattern = r'(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, resume_text)
        phone = [p[0] + p[1] for p in phones if p[0] or p[1]][0][:15] if phones else ""

        # Extract name (simplified - typically first line or capitalized words)
        lines = resume_text.split('\n')
        name = lines[0].strip() if lines else ""

        return {
            "email": email,
            "phone": phone,
            "name": name
        }
