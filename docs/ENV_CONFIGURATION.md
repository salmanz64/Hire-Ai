# Environment Configuration Guide

This guide explains how to configure all environment variables for the HR AI Agent system.

## Overview

The system uses environment variables to manage sensitive configuration data such as API keys, credentials, and application settings. These are stored in a `.env` file in the backend directory.

## Quick Setup

1. Copy the example file:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` with your actual values

3. Never commit `.env` to version control

## Environment Variables Reference

### Required Variables

#### OPENAI_API_KEY
**Description**: API key for OpenAI GPT-4 model

**How to Get**:
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Format**:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Usage**:
- Used by `ResumeAnalyzer` service
- Required for resume analysis and candidate matching
- Uses GPT-4-turbo-preview model

---

#### GOOGLE_CALENDAR_CREDENTIALS_PATH
**Description**: Path to Google OAuth credentials JSON file

**How to Get**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Desktop app" or "Web application"
6. Download the JSON file
7. Save it as `backend/config/google_credentials.json`

**Format**:
```env
GOOGLE_CALENDAR_CREDENTIALS_PATH=backend/config/google_credentials.json
```

**Usage**:
- Used by `CalendarScheduler` service
- Required for Google Calendar integration
- Enables OAuth2 authentication

**Notes**:
- First run will open browser for authorization
- Token will be saved automatically to `token.json`

---

### Optional Variables

#### ANTHROPIC_API_KEY
**Description**: API key for Anthropic Claude (alternative to OpenAI)

**How to Get**:
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account
3. Generate an API key

**Format**:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Usage**:
- Optional alternative to OpenAI
- Can be used for different LLM models

---

#### GOOGLE_CALENDAR_TOKEN_PATH
**Description**: Path to store OAuth token

**Format**:
```env
GOOGLE_CALENDAR_TOKEN_PATH=backend/config/token.json
```

**Usage**:
- Auto-generated after first authorization
- Stores OAuth refresh token
- Created automatically by the system

---

#### GOOGLE_CALENDAR_ID
**Description**: Google Calendar ID to schedule events on

**Format**:
```env
GOOGLE_CALENDAR_ID=primary
```

**Usage**:
- Default: `primary` (your main calendar)
- Can be set to specific calendar ID
- Format: `{calendarId}@group.calendar.google.com`

---

#### APP_HOST
**Description**: Host address for the FastAPI server

**Format**:
```env
APP_HOST=0.0.0.0
```

**Usage**:
- `0.0.0.0` for all interfaces
- `localhost` for local only
- `127.0.0.1` for local only

---

#### APP_PORT
**Description**: Port number for the FastAPI server

**Format**:
```env
APP_PORT=8000
```

**Usage**:
- Default: 8000
- Change if port is already in use
- Must be different from frontend port (3000)

---

#### CORS_ORIGINS
**Description**: Allowed origins for CORS (Cross-Origin Resource Sharing)

**Format**:
```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Usage**:
- Comma-separated list of allowed origins
- Required for frontend-backend communication
- Add production domain when deploying

---

#### INTERVIEW_DURATION_MINUTES
**Description**: Default duration for interview slots

**Format**:
```env
INTERVIEW_DURATION_MINUTES=60
```

**Usage**:
- Default: 60 minutes
- Can be adjusted based on interview length
- Affects calendar slot finding

---

#### INTERVIEW_DAYS_TO_SCHEDULE
**Description**: Number of days ahead to search for available slots

**Format**:
```env
INTERVIEW_DAYS_TO_SCHEDULE=14
```

**Usage**:
- Default: 14 days
- Affects `find_available_slots()` method
- Adjust based on hiring timeline

---

#### MAX_CANDIDATES_TO_SCHEDULE
**Description**: Maximum number of candidates to schedule in one batch

**Format**:
```env
MAX_CANDIDATES_TO_SCHEDULE=10
```

**Usage**:
- Default: 10 candidates
- Limits API calls and calendar events
- Adjust based on team capacity

---

#### SMTP_SERVER
**Description**: SMTP server for sending emails

**Format**:
```env
SMTP_SERVER=smtp.gmail.com
```

**Usage**:
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- Custom: Your SMTP server address

---

#### SMTP_PORT
**Description**: SMTP server port

**Format**:
```env
SMTP_PORT=587
```

**Usage**:
- 587: TLS (STARTTLS)
- 465: SSL
- 25: Non-encrypted (not recommended)

---

#### SMTP_USERNAME
**Description**: SMTP username (usually email address)

**Format**:
```env
SMTP_USERNAME=your_email@gmail.com
```

**Usage**:
- Required for email sending
- Usually same as FROM_EMAIL

---

#### SMTP_PASSWORD
**Description**: SMTP password or app-specific password

**Format**:
```env
SMTP_PASSWORD=your_app_password_here
```

**Usage**:
- **Gmail**: Use App Password, not regular password
  - Go to Google Account → Security → 2-Step Verification
  - App passwords → Generate → Copy password
- **Other providers**: Use account password

---

#### FROM_EMAIL
**Description**: Sender email address for notifications

**Format**:
```env
FROM_EMAIL=hr@yourcompany.com
```

**Usage**:
- Email address shown as sender
- Should match SMTP username for delivery

---

#### FROM_NAME
**Description**: Sender name for email notifications

**Format**:
```env
FROM_NAME=HR Team
```

**Usage**:
- Display name in email "From" field
- Can be company name or team name

---

## Configuration Examples

### Development Environment
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
GOOGLE_CALENDAR_CREDENTIALS_PATH=backend/config/google_credentials.json
GOOGLE_CALENDAR_TOKEN_PATH=backend/config/token.json
GOOGLE_CALENDAR_ID=primary
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=http://localhost:3000
INTERVIEW_DURATION_MINUTES=60
INTERVIEW_DAYS_TO_SCHEDULE=14
MAX_CANDIDATES_TO_SCHEDULE=10
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=dev@gmail.com
SMTP_PASSWORD=app_password_here
FROM_EMAIL=hr@dev-company.com
FROM_NAME=HR Team
```

### Production Environment
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
GOOGLE_CALENDAR_CREDENTIALS_PATH=/app/config/google_credentials.json
GOOGLE_CALENDAR_TOKEN_PATH=/app/config/token.json
GOOGLE_CALENDAR_ID=hr@yourcompany.com
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=https://hr.yourcompany.com,https://www.yourcompany.com
INTERVIEW_DURATION_MINUTES=45
INTERVIEW_DAYS_TO_SCHEDULE=21
MAX_CANDIDATES_TO_SCHEDULE=15
SMTP_SERVER=smtp.yourcompany.com
SMTP_PORT=587
SMTP_USERNAME=hr@yourcompany.com
SMTP_PASSWORD=production_password
FROM_EMAIL=hr@yourcompany.com
FROM_NAME=Your Company HR
```

---

## Security Best Practices

1. **Never commit `.env` files**
   - Add `.env` to `.gitignore`
   - Use `.env.example` as template

2. **Use strong passwords**
   - Use app-specific passwords for email
   - Generate random API keys when possible

3. **Rotate credentials regularly**
   - Update API keys periodically
   - Change passwords on schedule

4. **Restrict API access**
   - Use environment-specific API keys
   - Limit API scopes where possible

5. **Secure storage in production**
   - Use secret management services (AWS Secrets Manager, etc.)
   - Encrypt sensitive data at rest
   - Use secure key distribution

---

## Troubleshooting

### "OPENAI_API_KEY not found"
- Ensure `.env` file exists in backend directory
- Check that API key is set correctly
- Restart the backend after changes

### "Google credentials file not found"
- Download OAuth credentials JSON
- Save to `backend/config/google_credentials.json`
- Check path in `.env` matches actual location

### "SMTP authentication failed"
- Verify SMTP username and password
- For Gmail, use App Password (not regular password)
- Check SMTP server and port settings

### "CORS origin not allowed"
- Add frontend URL to `CORS_ORIGINS`
- Ensure no trailing slashes
- Restart backend after changes

### "Calendar authorization failed"
- First run will open browser for authorization
- Ensure you have internet connection
- Check that Calendar API is enabled in Google Cloud Console

---

## Testing Configuration

### Test Backend Configuration
```bash
cd backend
python -c "from app.config.settings import settings; print('✓ Configuration loaded')"
```

### Test OpenAI API
```bash
python -c "import openai; client = openai.OpenAI(); print('✓ OpenAI API connected')"
```

### Test Google Calendar
Run the backend and check logs for authentication success

### Test Email
```bash
python -c "
import smtplib
smtplib.SMTP('smtp.gmail.com', 587).starttls()
print('✓ SMTP server reachable')
"
```

---

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)
- [FastAPI Settings](https://fastapi.tiangolo.com/tutorial/settings/)
- [Python-dotenv](https://pypi.org/project/python-dotenv/)
