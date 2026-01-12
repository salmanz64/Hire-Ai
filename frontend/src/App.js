import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import BillingPage from './components/BillingPage';
import Dashboard from './components/Dashboard';
import MyJobs from './components/MyJobs';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResumeUpload from './components/ResumeUpload';
import CandidateReview from './components/CandidateReview';
import InterviewScheduler from './components/InterviewScheduler';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from './contexts/SubscriptionContext';
import ProtectedRoute from './components/ProtectedRoute';
import { processResumes, selectCandidates, sendConfirmations } from './services/api';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <SubscriptionProvider>
                  <BillingPage />
                </SubscriptionProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <SubscriptionProvider>
                  <AppLayout />
                </SubscriptionProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/*" 
            element={
              <ProtectedRoute>
                <SubscriptionProvider>
                  <AppLayout />
                </SubscriptionProvider>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addJob, incrementResumeCount, fetchJobs, canCreateJob } = useSubscription();
  const [view, setView] = React.useState('dashboard');
  const [jobId, setJobId] = React.useState(null);
  
  const [step, setStep] = React.useState(1);
  const [jobData, setJobData] = React.useState({
    jobTitle: '',
    jobDescription: '',
    requirements: '',
    skills: '',
    experienceLevel: 'mid',
  });
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [processingResult, setProcessingResult] = React.useState(null);
  const [selectedCandidates, setSelectedCandidates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [interviewSchedule, setInterviewSchedule] = React.useState(null);
  const [emailResult, setEmailResult] = React.useState(null);

  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/app/jobs') {
      setView('jobs');
      setStep(0);
    } else if (path === '/app/dashboard') {
      setView('dashboard');
      setStep(0);
    } else if (path === '/app') {
      if (!canCreateJob()) {
        navigate('/billing');
        return;
      }
      setView('wizard');
      setStep(1);
    }
  }, [location.pathname, canCreateJob, navigate]);

  const handleJobDataChange = (data) => {
    setJobData(data);
  };

  const handleFilesChange = (files) => {
    setUploadedFiles(files);
  };

  const handleProcessResumes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processResumes(jobData, uploadedFiles);
      setProcessingResult(result);
      setStep(3);
    } catch (err) {
      setError('Failed to process resumes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelection = (candidateId) => {
    setSelectedCandidates((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      return [...prev, candidateId];
    });
  };

  const handleScheduleInterviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const scheduleResult = await selectCandidates(
        processingResult.job_id,
        selectedCandidates,
        processingResult.candidates,
        jobData.jobTitle
      );
      setInterviewSchedule(scheduleResult);
      setStep(4);
    } catch (err) {
      setError('Failed to schedule interviews. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConfirmations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await sendConfirmations(interviewSchedule.email_drafts);
      
      const newJob = await addJob({
        title: jobData.jobTitle,
        description: jobData.jobDescription,
        requirements: jobData.requirements,
        skills: jobData.skills,
        experience_level: jobData.experienceLevel,
        candidates_count: selectedCandidates.length,
        resumes_processed: uploadedFiles.length
      });
      
      if (newJob) {
        setJobId(newJob.id);
        await incrementResumeCount(uploadedFiles.length);
      }
      
      setEmailResult(result);
      setStep(5);
    } catch (err) {
      setError('Failed to send confirmations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setStep(1);
    setView('wizard');
    setJobData({
      jobTitle: '',
      jobDescription: '',
      requirements: '',
      skills: '',
      experienceLevel: 'mid',
    });
    setUploadedFiles([]);
    setProcessingResult(null);
    setSelectedCandidates([]);
    setInterviewSchedule(null);
    setEmailResult(null);
    setJobId(null);
    setError(null);
    await fetchJobs();
  };

  const handleStartNewJob = async () => {
    if (!canCreateJob()) {
      navigate('/billing');
      return;
    }
    await handleReset();
    navigate('/app');
  };

  const handleNewJobClick = async () => {
    if (!canCreateJob()) {
      navigate('/billing');
      return;
    }
    navigate('/app');
  };

  const handleViewJobs = async () => {
    await handleReset();
    navigate('/app/jobs');
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Create Job Posting';
      case 2: return 'Upload Resumes';
      case 3: return 'Review Candidates';
      case 4: return 'Schedule Interviews';
      case 5: return 'All Done!';
      default: return 'HR AI Agent';
    }
  };

  return (
    <div className="App">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">HR</div>
            <div className="logo-text">HireAI</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('/app/dashboard')}>
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h3" />
            </svg>
            Dashboard
          </div>
          <div className={`nav-item ${view === 'jobs' ? 'active' : ''}`} onClick={() => navigate('/app/jobs')}>
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            My Jobs
          </div>
          <div className="nav-divider"></div>
          <div className={`nav-item ${step === 1 ? 'active' : ''}`} onClick={handleNewJobClick}>
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            New Job
          </div>
          <div className="nav-item" onClick={() => navigate('/billing')}>
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Billing
          </div>
          <div className="nav-item" style={{ marginTop: 'auto' }} onClick={async () => {
            await logout();
            navigate('/');
          }}>
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4-4H3" />
            </svg>
            Sign Out
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.full_name?.split(' ')?.map(n => n[0])?.join('')?.substring(0, 2)?.toUpperCase() || 'HR'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.full_name || 'User'}</div>
              <div className="user-role">{user?.plan || 'free'} Plan</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search candidates, jobs..."
            />
          </div>
          <div className="top-bar-actions">
            <button className="action-btn" onClick={handleReset} style={{ display: view === 'wizard' ? 'flex' : 'none' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </header>

        <div className="content-area">
          {view === 'dashboard' && <Dashboard />}
          
          {view === 'jobs' && <MyJobs />}
          
          {view === 'wizard' && (
            <>
              <div className="page-header">
                <h1 className="page-title">{getStepTitle()}</h1>
                <p className="page-subtitle">
                  {step === 1 && 'Define role and requirements to start finding perfect candidate'}
                  {step === 2 && 'Upload resumes for AI-powered analysis and ranking'}
                  {step === 3 && 'Review AI-ranked candidates and select best matches for interviews'}
                  {step === 4 && 'Schedule interviews and send confirmation emails to selected candidates'}
                  {step === 5 && 'All interviews have been scheduled and confirmations sent!'}
                </p>
              </div>

              <div className="wizard-progress-bar">
                <div className="progress-steps">
                  <div className={`progress-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}></div>
                  <div className={`progress-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}></div>
                  <div className={`progress-step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}></div>
                  <div className={`progress-step ${step >= 4 ? 'completed' : ''} ${step === 4 ? 'active' : ''}`}></div>
                  <div className={`progress-step ${step >= 5 ? 'completed' : ''} ${step === 5 ? 'active' : ''}`}></div>
                </div>
                <div className="step-indicators">
                  <div className={`step-indicator ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    Job Details
                  </div>
                  <div className={`step-indicator ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    Upload
                  </div>
                  <div className={`step-indicator ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                    <div className="step-number">3</div>
                    Review
                  </div>
                  <div className={`step-indicator ${step === 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
                    <div className="step-number">4</div>
                    Schedule
                  </div>
                  <div className={`step-indicator ${step === 5 ? 'active' : ''} ${step > 5 ? 'completed' : ''}`}>
                    <div className="step-number">✓</div>
                    Done
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <div className="alert-title">Error</div>
                    <div className="alert-message">{error}</div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <JobDescriptionInput
                  jobData={jobData}
                  onChange={handleJobDataChange}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <ResumeUpload
                  files={uploadedFiles}
                  onFilesChange={handleFilesChange}
                  onProcess={handleProcessResumes}
                  loading={loading}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && processingResult && (
                <CandidateReview
                  candidates={processingResult.candidates}
                  summary={processingResult.summary}
                  selectedCandidates={selectedCandidates}
                  onCandidateToggle={handleCandidateSelection}
                  onSchedule={handleScheduleInterviews}
                  loading={loading}
                  onBack={() => setStep(2)}
                  onReset={handleReset}
                />
              )}

              {step === 4 && interviewSchedule && (
                <InterviewScheduler
                  scheduledInterviews={interviewSchedule.scheduled_interviews}
                  emailDrafts={interviewSchedule.email_drafts}
                  onSendConfirmations={handleSendConfirmations}
                  loading={loading}
                  onReset={handleReset}
                />
              )}

              {step === 5 && emailResult && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                  <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
                  <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900)' }}>
                    All Done!
                  </h2>
                  <p style={{ fontSize: 18, color: 'var(--gray-600)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
                    Successfully scheduled {interviewSchedule?.scheduled_interviews?.length || 0} interview{interviewSchedule?.scheduled_interviews?.length !== 1 ? 's' : ''} and sent {emailResult.sent_count} confirmation email{emailResult.sent_count !== 1 ? 's' : ''}!
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 40, maxWidth: 800, margin: '0 auto 40px' }}>
                    <div style={{ padding: 24, background: 'var(--success-light)', borderRadius: 12 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)' }}>{interviewSchedule?.scheduled_interviews?.length || 0}</div>
                      <div style={{ color: 'var(--gray-600)', marginTop: 4 }}>Interviews Scheduled</div>
                    </div>
                    <div style={{ padding: 24, background: 'var(--primary-light)', borderRadius: 12 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{emailResult.sent_count}</div>
                      <div style={{ color: 'var(--gray-600)', marginTop: 4 }}>Emails Sent</div>
                    </div>
                    <div style={{ padding: 24, background: 'var(--warning-light)', borderRadius: 12 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--warning)' }}>{selectedCandidates.length}</div>
                      <div style={{ color: 'var(--gray-600)', marginTop: 4 }}>Candidates Selected</div>
                    </div>
                  </div>

                  {emailResult.failed_count > 0 && (
                    <div className="alert alert-warning" style={{ maxWidth: 600, margin: '0 auto 32px', textAlign: 'left' }}>
                      <div className="alert-icon">⚠️</div>
                      <div className="alert-content">
                        <div className="alert-title">{emailResult.failed_count} Email{emailResult.failed_count !== 1 ? 's' : ''} Failed</div>
                        <div className="alert-message">Failed to send to: {emailResult.failed_emails.join(', ')}</div>
                      </div>
                    </div>
                  )}

                  <div className="button-group" style={{ justifyContent: 'center', gap: 16 }}>
                    <button className="button-secondary button-lg" onClick={() => window.open('https://calendar.google.com', '_blank')}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Open Google Calendar
                    </button>
                    <button className="button-secondary button-lg" onClick={handleViewJobs}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      View Jobs
                    </button>
                    <button className="button-primary button-lg" onClick={handleStartNewJob}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Start New Job
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
