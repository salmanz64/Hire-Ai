import json
from typing import Dict, List, Optional
from groq import Groq
import re


class ResumeAnalyzer:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)

    def analyze_resume(self, resume_text: str, job_description: Dict) -> Dict:
        try:
            prompt = self._build_analysis_prompt(resume_text, job_description)
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an HR professional. Analyze the resume and job description. Provide accurate assessment."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            if not content:
                return self._get_default_analysis()
            
            result = json.loads(content)
            return self._normalize_analysis_result(result)
        except Exception:
            return self._get_default_analysis()

    def _build_analysis_prompt(self, resume_text: str, job_description: Dict) -> str:
        prompt = f"""
Analyze the resume against the job description.

JOB DESCRIPTION:
Title: {job_description.get('title', 'N/A')}
Description: {job_description.get('description', 'N/A')}
Requirements: {', '.join(job_description.get('requirements', []))}
Required Skills: {', '.join(job_description.get('skills', []))}
Experience Level: {job_description.get('experience_level', 'mid')}

RESUME TEXT:
{resume_text[:4000]}

Provide a JSON response with:
{{
    "candidate_name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "overall_score": 0-100,
    "skill_score": 0-100,
    "experience_score": 0-100,
    "matched_skills": ["matched skills"],
    "missing_skills": ["missing skills"],
    "years_of_experience": "estimated years",
    "summary": "3-4 sentence summary",
    "match_reasoning": "Detailed explanation",
    "strengths": ["key strengths"],
    "areas_for_improvement": ["areas to improve"]
}}
"""
        return prompt

    def _normalize_analysis_result(self, result: Dict) -> Dict:
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
            "match_reasoning": "Unable to analyze",
            "strengths": [],
            "areas_for_improvement": []
        }

    def extract_contact_info(self, resume_text: str) -> Dict[str, str]:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, resume_text)
        email = emails[0] if emails else ""

        phone_pattern = r'(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, resume_text)
        phone = [p[0] + p[1] for p in phones if p[0] or p[1]][0][:15] if phones else ""

        lines = resume_text.split('\n')
        name = lines[0].strip() if lines else ""

        return {
            "email": email,
            "phone": phone,
            "name": name
        }
