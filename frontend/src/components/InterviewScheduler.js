import React from 'react';

const InterviewScheduler = ({
  scheduledInterviews,
  emailDrafts,
  onSendConfirmations,
  loading,
  onReset
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 28, height: 28, marginRight: 12, verticalAlign: 'middle', color: 'var(--success)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Interviews Scheduled Successfully!
            </h2>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {scheduledInterviews.length} interview{scheduledInterviews.length !== 1 ? 's have' : ' has'} been scheduled
            </p>
          </div>
          <div className="badge badge-success">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Step 4 of 4
          </div>
        </div>

        <div className="alert alert-success">
          <div className="alert-icon">✅</div>
          <div className="alert-content">
            <div className="alert-title">Ready to send confirmations</div>
            <div className="alert-message">
              Interviews will be added to your Google Calendar with Google Meet links automatically
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '20px', fontSize: 18, fontWeight: 600 }}>Scheduled Interviews</h3>

        {scheduledInterviews.map((interview, index) => (
          <div key={index}>
            <div className="interview-details">
              <div className="interview-detail-row">
                <span className="interview-detail-label">Candidate:</span>
                <span className="interview-detail-value" style={{ fontWeight: 600 }}>
                  {interview.candidate_name}
                </span>
              </div>
              <div className="interview-detail-row">
                <span className="interview-detail-label">Date & Time:</span>
                <span className="interview-detail-value">{formatDate(interview.interview_date)}</span>
              </div>
              <div className="interview-detail-row">
                <span className="interview-detail-label">Email:</span>
                <span className="interview-detail-value">{interview.candidate_email}</span>
              </div>
              <div className="interview-detail-row">
                <span className="interview-detail-label">Meeting Link:</span>
                <a
                  href={interview.interview_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--primary)', 
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {interview.interview_link}
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}

        {emailDrafts && emailDrafts.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>Email Confirmation Drafts</h3>
            <p style={{ marginBottom: 16, color: 'var(--gray-600)', fontSize: 14 }}>
              Preview the confirmation emails that will be sent to candidates:
            </p>

            {emailDrafts.map((draft, index) => (
              <div key={index} className="email-preview">
                <div className="email-preview-header">
                  <div className="email-preview-subject">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18, marginRight: 8, verticalAlign: 'middle' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {draft.subject}
                  </div>
                  <div className="email-preview-to">
                    To: <strong>{draft.to_name}</strong> &lt;{draft.to_email}&gt;
                  </div>
                </div>
                <div className="email-preview-body">{draft.body}</div>
              </div>
            ))}
          </div>
        )}

        <div className="button-group" style={{ marginTop: 40 }}>
          <button className="button-secondary button-lg" onClick={onReset}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Start New Job
          </button>
          <button
            className="button-success button-lg"
            onClick={onSendConfirmations}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? (
              <>
                <svg className="spinner" style={{ width: 20, height: 20, margin: 0 }} fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Emails...
              </>
            ) : (
              <>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Confirmations to {emailDrafts?.length || 0} Candidate{emailDrafts?.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="loading" style={{ marginTop: 24 }}>
            <div className="spinner"></div>
            <div className="loading-text">Sending confirmation emails...</div>
            <div className="loading-subtitle">This may take a moment depending on the number of emails</div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">What's Next?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--gray-900)' }}>Check Your Calendar</h4>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
              Interview events have been added to your Google Calendar with Google Meet links
            </p>
          </div>
          <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--gray-900)' }}>Prepare Questions</h4>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
              Review each candidate's profile and prepare interview questions tailored to their skills
            </p>
          </div>
          <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--gray-900)' }}>Share with Team</h4>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
              Forward meeting links to interviewers and coordinate who will conduct each interview
            </p>
          </div>
          <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--gray-900)' }}>Provide Feedback</h4>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
              After interviews, provide feedback to help improve future candidate matching accuracy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;
