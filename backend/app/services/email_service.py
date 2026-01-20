"""
Email confirmation drafting service.
"""
import logging
from typing import Dict, Optional
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


class EmailDraftService:
    """Service to draft and send interview confirmation emails."""

    def __init__(self, smtp_config: Optional[Dict] = None):
        """
        Initialize the email service.

        Args:
            smtp_config: Dict with smtp_server, smtp_port, smtp_username, smtp_password
        """
        self.smtp_config = smtp_config or {}

    def draft_interview_confirmation(
        self,
        candidate_name: str,
        candidate_email: str,
        interview_date: datetime,
        interview_link: str,
        job_title: str = "",
        company_name: str = "Our Company"
    ) -> Dict[str, str]:
        """
        Draft an interview confirmation email.

        Args:
            candidate_name: Name of the candidate
            candidate_email: Email of the candidate
            interview_date: Date and time of the interview
            interview_link: Link to the interview (Google Meet/Zoom)
            job_title: Title of the position
            company_name: Name of the company

        Returns:
            Dict with subject and body of the email
        """
        try:
            formatted_date = interview_date.strftime("%B %d, %Y at %I:%M %p UTC")

            subject = f"Interview Confirmation: {job_title} Position - {company_name}"

            body = f"""Dear {candidate_name},

We are pleased to inform you that you have been selected for an interview for the {job_title} position at {company_name}.

Interview Details:
- Date: {formatted_date}
- Duration: 60 minutes
- Meeting Link: {interview_link}

Please click on the meeting link to join the interview at the scheduled time. We recommend joining 5-10 minutes early to ensure you have time to set up your technology.

Before the interview, please:
1. Test your microphone and camera
2. Ensure you have a stable internet connection
3. Have a copy of your resume available
4. Prepare any questions you may have about the role or our company

If you need to reschedule or have any questions, please reply to this email as soon as possible.

We look forward to speaking with you!

Best regards,
HR Team
{company_name}
"""

            return {
                "to_email": candidate_email,
                "to_name": candidate_name,
                "subject": subject,
                "body": body
            }

        except Exception as e:
            logger.error(f"Error drafting email: {str(e)}")
            return {
                "to_email": candidate_email,
                "to_name": candidate_name,
                "subject": "Interview Confirmation",
                "body": "Error generating email content"
            }

    def send_email(self, email_data: Dict[str, str], from_email: str, from_name: str) -> bool:
        """
        Send an email using SMTP.

        Args:
            email_data: Dict with to_email, to_name, subject, body
            from_email: Sender email address
            from_name: Sender name

        Returns:
            True if successful, False otherwise
        """
        if not self.smtp_config:
            logger.warning("SMTP not configured, skipping email send")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = f"{from_name} <{from_email}>"
            msg['To'] = email_data['to_email']
            msg['Subject'] = email_data['subject']

            msg.attach(MIMEText(email_data['body'], 'plain'))

            with smtplib.SMTP(
                self.smtp_config.get('smtp_server'),
                self.smtp_config.get('smtp_port', 587)
            ) as server:
                server.starttls()
                server.login(
                    self.smtp_config.get('smtp_username'),
                    self.smtp_config.get('smtp_password')
                )
                server.send_message(msg)

            logger.info(f"Email sent to {email_data['to_email']}")
            return True

        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

