"""
Resume parsing service for extracting text from PDF resumes.
"""
import pdfplumber
import PyPDF2
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class ResumeParser:
    """Service to parse and extract text from PDF resumes."""

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Optional[str]:
        """
        Extract text from a PDF file.

        Args:
            file_path: Path to the PDF file

        Returns:
            Extracted text as string, or None if extraction fails
        """
        try:
            # Try pdfplumber first (better text extraction)
            text = ResumeParser._extract_with_pdfplumber(file_path)
            if text and len(text.strip()) > 100:
                return text

            # Fallback to PyPDF2
            text = ResumeParser._extract_with_pypdf2(file_path)
            if text and len(text.strip()) > 100:
                return text

            logger.warning(f"Failed to extract sufficient text from {file_path}")
            return None

        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
            return None

    @staticmethod
    def _extract_with_pdfplumber(file_path: str) -> str:
        """Extract text using pdfplumber."""
        text_parts = []
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        except Exception as e:
            logger.error(f"Error with pdfplumber: {str(e)}")
            return ""

    @staticmethod
    def _extract_with_pypdf2(file_path: str) -> str:
        """Extract text using PyPDF2."""
        text_parts = []
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text_parts.append(page.extract_text())
            return "\n".join(text_parts)
        except Exception as e:
            logger.error(f"Error with PyPDF2: {str(e)}")
            return ""

    @staticmethod
    def validate_resume(text: str) -> bool:
        """
        Validate if extracted text looks like a resume.

        Args:
            text: Extracted text from PDF

        Returns:
            True if text appears to be a valid resume
        """
        if not text or len(text.strip()) < 100:
            return False

        # Check for common resume keywords
        resume_keywords = [
            'experience', 'education', 'skills', 'work', 'resume',
            'curriculum vitae', 'employment', 'university', 'college',
            'degree', 'certification', 'project', 'professional'
        ]

        text_lower = text.lower()
        keyword_count = sum(1 for keyword in resume_keywords if keyword in text_lower)

        # If we find at least 2 keywords, it's likely a resume
        return keyword_count >= 2
