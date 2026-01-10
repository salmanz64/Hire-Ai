# HR AI Agent - Architecture Documentation

## System Overview

The HR AI Agent is a modular, autonomous system designed to streamline the recruitment process by automating resume screening, candidate evaluation, interview scheduling, and communication. The system leverages AI/LLM technologies to make intelligent decisions about candidate fit.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Job Input    │  │ Resume Upload│  │ Candidate    │      │
│  │ Component    │  │ Component   │  │ Review Panel │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                API Routers                            │   │
│  │  - /process-resumes                                 │   │
│  │  - /select-candidates                               │   │
│  │  - /send-confirmations                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌─────────────────────────────▼─────────────────────────┐   │
│  │              HR Agent Orchestrator                   │   │
│  │  Coordinates all services and manages workflow       │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Resume     │  │ LLM        │  │ Candidate   │         │
│  │ Parser     │  │ Analyzer   │  │ Ranker     │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│  ┌────────────┐  ┌────────────┐                         │
│  │ Calendar   │  │ Email      │                         │
│  │ Scheduler  │  │ Service    │                         │
│  └────────────┘  └────────────┘                         │
└─────────────────────────────────────────────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
    ┌─────────┐      ┌──────────┐        ┌──────────┐
    │  Files  │      │ OpenAI   │        │ Google   │
    │ Storage │      │   API    │        │ Calendar │
    └─────────┘      └──────────┘        │   API    │
                                         └──────────┘
```

## Component Breakdown

### 1. Frontend (React)

**Purpose**: User interface for HR professionals

**Components**:
- **JobDescriptionInput**: Collects job requirements
- **ResumeUpload**: Handles file uploads (drag & drop)
- **CandidateReview**: Displays ranked candidates with analysis
- **InterviewScheduler**: Shows scheduled interviews and email drafts

**State Management**:
- Job description data
- Uploaded resume files
- Processing results
- Selected candidates
- Interview schedule

**API Integration**:
- Axios for HTTP requests
- FormData for file uploads
- RESTful API communication

### 2. Backend (FastAPI)

**Purpose**: API server and business logic

**Key Modules**:

#### API Routers (`app/routers/`)
- `hr_router.py`: Main API endpoints
  - POST `/process-resumes`: Process uploaded resumes
  - POST `/select-candidates`: Schedule interviews
  - POST `/send-confirmations`: Send emails
  - GET `/available-slots`: Get calendar availability

#### Data Models (`app/models/`)
- `schemas.py`: Pydantic models for data validation
  - JobDescription
  - Candidate
  - InterviewSchedule
  - EmailDraft

#### Services (`app/services/`)

**Resume Parser Service**
```python
class ResumeParser:
    - extract_text_from_pdf()
    - validate_resume()
```
- Uses pdfplumber and PyPDF2
- Falls back between parsers for reliability
- Validates resume content quality

**Resume Analyzer Service**
```python
class ResumeAnalyzer:
    - analyze_resume()
    - extract_contact_info()
```
- Integrates with OpenAI GPT-4
- Extracts candidate information
- Scores skill, experience, and overall fit
- Generates AI summaries and reasoning

**Candidate Ranker Service**
```python
class CandidateRanker:
    - rank_candidates()
    - select_top_candidates()
    - categorize_candidates()
    - generate_ranking_summary()
```
- Sorts by multiple criteria
- Categorizes into tiers (top, mid, low)
- Provides summary statistics

**Calendar Scheduler Service**
```python
class CalendarScheduler:
    - authenticate()
    - find_available_slots()
    - schedule_interview()
    - schedule_multiple_interviews()
```
- Google OAuth2 authentication
- Finds available time slots
- Creates calendar events with Meet links
- Handles reminders and notifications

**Email Service**
```python
class EmailDraftService:
    - draft_interview_confirmation()
    - draft_rejection_email()
    - draft_shortlist_email()
    - send_email()
```
- Generates personalized email templates
- SMTP email sending
- Preview functionality

#### HR Agent Orchestrator (`app/agents/`)

```python
class HRAgent:
    - process_resumes()
    - select_and_schedule_interviews()
    - send_confirmations()
    - get_available_slots()
```
- Main workflow coordinator
- Integrates all services
- Manages state and error handling

## Workflow Flow

### Phase 1: Job Description & Resume Upload

```
1. HR enters job description (title, requirements, skills)
   ↓
2. HR uploads PDF resumes (batch supported)
   ↓
3. Frontend sends FormData to /api/v1/process-resumes
```

### Phase 2: Resume Processing & Analysis

```
4. Backend saves uploaded files
   ↓
5. ResumeParser extracts text from each PDF
   ↓
6. ResumeAnalyzer (GPT-4) analyzes each resume:
   - Extracts name, email, phone
   - Scores skill match (0-100)
   - Scores experience match (0-100)
   - Calculates overall score
   - Identifies matched/missing skills
   - Generates AI summary
   - Provides match reasoning
   ↓
7. CandidateRanker sorts candidates by score
   ↓
8. Returns ranked list to frontend
```

### Phase 3: Candidate Selection

```
9. Frontend displays candidates with scores and summaries
   ↓
10. HR reviews and selects candidates for interviews
    ↓
11. Frontend sends selected IDs to /api/v1/select-candidates
```

### Phase 4: Interview Scheduling

```
12. HRAgent orchestrates scheduling:
    ↓
13. CalendarScheduler authenticates with Google
    ↓
14. Finds available time slots
    ↓
15. Creates calendar events for each candidate:
    - Adds event to Google Calendar
    - Generates Google Meet link
    - Sets reminders
    ↓
16. EmailService drafts confirmation emails:
    - Personalized for each candidate
    - Includes date, time, and Meet link
    ↓
17. Returns scheduled interviews and email drafts to frontend
```

### Phase 5: Email Confirmation

```
18. Frontend displays interview schedule and email previews
    ↓
19. HR reviews and clicks "Send Confirmations"
    ↓
20. EmailService sends emails via SMTP
    ↓
21. Returns success/failure status
```

## Data Flow

### Input Data

**Job Description**:
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for...",
  "requirements": ["5+ years experience", "Python", "AWS"],
  "skills": ["Python", "JavaScript", "React", "Docker"],
  "experience_level": "senior"
}
```

**Resume Files**:
- PDF format
- Batch upload supported
- Text extraction required

### Intermediate Data

**Analysis Result** (per candidate):
```json
{
  "candidate_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "overall_score": 85,
  "skill_score": 90,
  "experience_score": 80,
  "matched_skills": ["Python", "JavaScript", "React"],
  "missing_skills": ["Docker"],
  "years_of_experience": "7",
  "summary": "John is a strong candidate...",
  "match_reasoning": "Excellent match on skills...",
  "strengths": ["Strong technical skills", "Leadership"],
  "areas_for_improvement": ["Docker experience"]
}
```

### Output Data

**Scheduled Interview**:
```json
{
  "candidate_id": "uuid",
  "candidate_name": "John Doe",
  "candidate_email": "john@example.com",
  "interview_date": "2024-01-10T10:00:00Z",
  "interview_link": "https://meet.google.com/xxx"
}
```

**Email Draft**:
```json
{
  "to_email": "john@example.com",
  "to_name": "John Doe",
  "subject": "Interview Confirmation...",
  "body": "Dear John Doe..."
}
```

## Integration Points

### OpenAI GPT-4 API
- **Purpose**: Resume analysis and matching
- **Endpoint**: `chat.completions.create`
- **Model**: `gpt-4-turbo-preview`
- **Output**: JSON with candidate analysis

### Google Calendar API
- **Purpose**: Interview scheduling
- **Authentication**: OAuth2
- **Endpoints**:
  - Events: `insert`, `list`
  - ConferenceData: Google Meet integration
- **Features**: Reminders, attendees, time zones

### SMTP Email
- **Purpose**: Sending confirmations
- **Protocol**: SMTP
- **Providers**: Gmail, Outlook, custom SMTP
- **Features**: HTML support, attachments

## Error Handling

### Resume Parsing Errors
- Fallback between pdfplumber and PyPDF2
- Skip invalid resumes
- Log errors with details

### LLM API Errors
- Retry logic for transient failures
- Default analysis if LLM unavailable
- Rate limiting handling

### Calendar API Errors
- OAuth token refresh
- Retry on network issues
- Graceful degradation

### Email Errors
- Queue failed emails for retry
- Log delivery failures
- Alert HR on failures

## Security Considerations

1. **API Keys**: Stored in environment variables, never committed
2. **File Uploads**: Validation, size limits, virus scanning (future)
3. **OAuth**: Secure token storage, automatic refresh
4. **Input Validation**: Pydantic models, type checking
5. **CORS**: Configured for trusted origins only
6. **Rate Limiting**: To be implemented for production

## Scalability

### Current Design
- Single-server deployment
- In-memory state (no database)
- Sequential processing

### Future Enhancements
- Database for persistence (PostgreSQL/MongoDB)
- Async processing with Celery/Redis
- Horizontal scaling with Kubernetes
- CDN for frontend assets
- Load balancing for API servers

## Performance Optimization

1. **LLM Caching**: Cache similar resume analyses
2. **Async I/O**: Non-blocking operations
3. **Batch Processing**: Process multiple resumes concurrently
4. **Lazy Loading**: Load candidate details on demand
5. **Database Indexing**: For candidate queries (future)

## Monitoring & Logging

- Structured logging with Python `logging`
- Log levels: INFO, WARNING, ERROR
- Key events logged:
  - Resume processing start/end
  - LLM API calls
  - Calendar operations
  - Email sends
  - Errors and exceptions

## Testing Strategy

### Unit Tests
- Individual service methods
- Data model validation
- Utility functions

### Integration Tests
- API endpoints
- Service interactions
- External API mocks

### E2E Tests
- Complete user workflows
- Frontend to backend flows

## Deployment Considerations

### Development
- Backend: `uvicorn` with hot reload
- Frontend: `react-scripts start`
- CORS enabled for localhost

### Production
- Backend: Gunicorn/Uvicorn workers
- Frontend: Built static files served by Nginx
- Environment-specific configurations
- HTTPS/TLS enabled
- Database for persistence
- Redis for caching (optional)
