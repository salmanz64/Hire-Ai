# HR AI Agent

An intelligent, autonomous HR agent that screens job applicants from resumes, ranks candidates, schedules interviews, and sends confirmation emails.

## Features

- **Resume Processing**: Parse PDF resumes and extract relevant information
- **AI-Powered Analysis**: Use LLM (OpenAI GPT-4) to analyze resumes and match against job descriptions
- **Candidate Ranking**: Automatically rank candidates based on skills, experience, and overall fit
- **Interview Scheduling**: Integrate with Google Calendar to schedule interviews with automatic Google Meet links
- **Email Automation**: Draft and send personalized interview confirmation emails
- **Modern UI**: Clean, intuitive React-based frontend interface

## Architecture Overview

The system consists of three main components:

1. **Backend (Python/FastAPI)**: API server handling resume processing, LLM integration, and calendar/email services
2. **Frontend (React)**: User interface for job description input, resume upload, and candidate review
3. **AI Agent**: Orchestrates the entire workflow from resume analysis to interview scheduling

## Technology Stack

### Backend
- **Python 3.9+**
- **FastAPI**: Modern, fast web framework
- **OpenAI GPT-4**: Resume analysis and matching
- **pdfplumber/PyPDF2**: PDF resume parsing
- **Google Calendar API**: Interview scheduling
- **SMTP**: Email sending (optional)

### Frontend
- **React 18**: UI framework
- **Axios**: HTTP client
- **CSS3**: Custom styling

## Project Structure

```
hr-ai-agent/
├── backend/
│   ├── app/
│   │   ├── agents/          # Main agent orchestrator
│   │   ├── config/          # Configuration settings
│   │   ├── models/          # Pydantic data models
│   │   ├── routers/         # API endpoints
│   │   ├── services/         # Business logic (parsing, LLM, calendar, email)
│   │   ├── utils/           # Utility functions
│   │   └── main.py          # FastAPI application entry point
│   ├── uploads/             # Uploaded resumes storage
│   ├── requirements.txt     # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/        # API service layer
│   │   ├── App.js          # Main application component
│   │   ├── index.js        # React entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Node dependencies
└── docs/                  # Documentation
```

## Setup Instructions

### Prerequisites

1. **Python 3.9+** installed
2. **Node.js 16+** and **npm** installed
3. **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))
4. **Google Cloud Project** with Calendar API enabled
5. **Google OAuth credentials** (client_secret.json)

### Step 1: Clone and Setup Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On Mac/Linux
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
```

5. Edit `.env` file with your credentials:
```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
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
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=hr@yourcompany.com
FROM_NAME=HR Team
```

### Step 2: Setup Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Choose "Desktop app" or "Web application"
6. Download the JSON file and save it as `backend/config/google_credentials.json`
7. First time running the app, you'll be prompted to authorize via browser

### Step 3: Setup Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

### Step 4: Run the Application

**Start Backend (Terminal 1):**
```bash
cd backend
# Activate virtual environment if not already active
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`
API documentation available at `http://localhost:8000/docs`

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage Guide

### 1. Enter Job Description

- Fill in job title, description, requirements, and skills
- Specify experience level (entry, mid, senior, lead)
- Click "Next: Upload Resumes"

### 2. Upload Resumes

- Drag and drop PDF resumes or click to browse
- Supports batch upload of multiple resumes
- Review uploaded files and remove if needed
- Click "Process Resumes" to start analysis

### 3. Review Candidates

- View ranked candidates with scores (0-100)
- Read AI-generated summaries for each candidate
- See matched skills and experience level
- Click "Select" on candidates you want to interview
- Click "Schedule Interviews" when ready

### 4. Schedule Interviews

- System automatically schedules interviews in sequence
- Google Calendar events are created with Google Meet links
- Email confirmation drafts are generated
- Click "Send Confirmations" to notify candidates

## API Endpoints

### POST `/api/v1/process-resumes`
Process uploaded resumes against job description
- **Request**: FormData with job details and PDF files
- **Response**: Ranked candidates with analysis results

### POST `/api/v1/select-candidates`
Schedule interviews for selected candidates
- **Request**: Job ID, candidate IDs, and job title
- **Response**: Scheduled interviews and email drafts

### POST `/api/v1/send-confirmations`
Send interview confirmation emails
- **Request**: Array of email drafts
- **Response**: Sent/failed email counts

### GET `/api/v1/available-slots`
Get available interview slots
- **Params**: start_date, end_date, duration_minutes
- **Response**: List of available datetime slots

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Required |
| `GOOGLE_CALENDAR_ID` | Google Calendar ID | primary |
| `INTERVIEW_DURATION_MINUTES` | Interview slot duration | 60 |
| `MAX_CANDIDATES_TO_SCHEDULE` | Max candidates per batch | 10 |
| `SMTP_SERVER` | Email server | smtp.gmail.com |

### Scoring Criteria

Candidates are scored based on:
- **Skill Match (40%)**: Alignment with required skills
- **Experience Match (30%)**: Relevance and level of experience
- **Overall Fit (30%)**: Qualifications, achievements, and potential

## Troubleshooting

### Google Calendar Authentication Issues
- Ensure OAuth consent screen is configured
- Make sure Calendar API is enabled
- Check that credentials file path is correct
- Run the app and complete the browser authorization flow

### Resume Parsing Errors
- Ensure resumes are in PDF format
- Check that PDF files are not password protected
- Verify text can be extracted from PDF (not scanned images)

### LLM API Errors
- Verify OpenAI API key is valid
- Check API quota and billing
- Ensure internet connectivity

### Email Sending Issues
- Verify SMTP credentials are correct
- For Gmail, use App Password (not regular password)
- Check firewall settings for SMTP ports
- Verify sender email is allowed by SMTP provider

## Development

### Adding New Features

1. **Backend**: Add new services in `backend/app/services/`
2. **API Endpoints**: Add routes in `backend/app/routers/`
3. **Frontend**: Create components in `frontend/src/components/`
4. **Agent Logic**: Extend `backend/app/agents/hr_agent.py`

### Testing

```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

## Security Considerations

- Never commit `.env` files or API keys to version control
- Use environment variables for all sensitive data
- Implement rate limiting for API endpoints
- Validate all file uploads
- Sanitize user inputs to prevent injection attacks
- Use HTTPS in production

## Performance Optimization

- Implement caching for LLM responses
- Use async operations for better concurrency
- Add database persistence for candidates
- Implement pagination for large candidate lists
- Add retry logic for external API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## License

This project is provided as-is for educational and commercial use.

## Support

For issues, questions, or contributions, please create an issue in the repository.
