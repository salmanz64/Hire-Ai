from typing import Dict, Optional
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class EmailDraftService:
    def __init__(self, smtp_config: Optional[Dict] = None):
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
        try:
            formatted_date = interview_date.strftime("%B %d, %Y at %I:%M %p UTC")
            subject = f"Interview Confirmation: {job_title} Position - {company_name}"

            body = f"""Dear {candidate_name},

We are pleased to inform you that you have been selected for an interview for the {job_title} position at {company_name}.

Interview Details:
- Date: {formatted_date}
- Duration: 60 minutes
- Meeting Link: {interview_link}

Please click on the meeting link to join the interview at the scheduled time. We recommend joining 5-10 minutes early.

Before the interview, please:
1. Test your microphone and camera
2. Ensure you have a stable internet connection
3. Have a copy of your resume available
4. Prepare any questions you may have

If you need to reschedule, please reply to this email.

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
        except Exception:
            return {
                "to_email": candidate_email,
                "to_name": candidate_name,
                "subject": "Interview Confirmation",
                "body": "Error generating email content"
            }

    def send_email(self, email_data: Dict[str, str], from_email: str, from_name: str) -> bool:
        if not self.smtp_config:
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

            return True
        except Exception:
            return False

