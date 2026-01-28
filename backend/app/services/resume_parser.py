import pdfplumber
import PyPDF2
from typing import Optional


class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Optional[str]:
        try:
            text = ResumeParser._extract_with_pdfplumber(file_path)
            if text and len(text.strip()) > 100:
                return text

            text = ResumeParser._extract_with_pypdf2(file_path)
            if text and len(text.strip()) > 100:
                return text
            return None
        except Exception:
            return None

    @staticmethod
    def _extract_with_pdfplumber(file_path: str) -> str:
        text_parts = []
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        except Exception:
            return ""

    @staticmethod
    def _extract_with_pypdf2(file_path: str) -> str:
        text_parts = []
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text_parts.append(page.extract_text())
            return "\n".join(text_parts)
        except Exception:
            return ""

    @staticmethod
    def validate_resume(text: str) -> bool:
        if not text or len(text.strip()) < 100:
            return False

        resume_keywords = [
            'experience', 'education', 'skills', 'work', 'resume',
            'curriculum vitae', 'employment', 'university', 'college',
            'degree', 'certification', 'project', 'professional'
        ]

        text_lower = text.lower()
        keyword_count = sum(1 for keyword in resume_keywords if keyword in text_lower)
        return keyword_count >= 2
