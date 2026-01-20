import React from 'react';

const CandidateReview = ({
  candidates,
  summary,
  selectedCandidates,
  onCandidateToggle,
  onSchedule,
  loading,
  onBack,
  onReset
}) => {
  return (
    <div>
      <div className="summary-box">
        <div className="summary-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analysis Summary
        </div>
        <div className="summary-content">{summary}</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Candidates</h2>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {candidates.length} candidates ranked by AI match score
            </p>
          </div>
          <div className="card-actions">
            <div className="badge badge-info" style={{ marginRight: 12 }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14, marginRight: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Step 3 of 4
            </div>
            <div className="badge badge-success">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14, marginRight: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {selectedCandidates.length} Selected
            </div>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No candidates found</div>
            <div className="empty-state-subtitle">
              Please try uploading different resumes or check your job requirements
            </div>
          </div>
        ) : (
          <div className="candidate-grid">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={`candidate-card ${selectedCandidates.includes(candidate.id) ? 'selected' : ''}`}
                onClick={() => onCandidateToggle(candidate.id)}
              >
                <div className="candidate-rank">#{index + 1}</div>

                <div className="candidate-header">
                  <div className="candidate-avatar">
                    {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                  </div>
                  <div>
                    <div className="candidate-name">{candidate.name || 'Unknown Candidate'}</div>
                    <div className="candidate-email">{candidate.email || 'No email provided'}</div>
                  </div>
                </div>

                <div>
                  <div className="candidate-score-label">Match Score</div>
                  <div className="candidate-score">{candidate.score}%</div>
                </div>

                <div className="candidate-section">
                  <div className="candidate-section-title">Summary</div>
                  <div className="candidate-summary">{candidate.summary}</div>
                </div>

                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="candidate-section">
                    <div className="candidate-section-title">
                      Skills ({candidate.skills.length})
                    </div>
                    <div className="candidate-skills">
                      {candidate.skills.slice(0, 6).map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 6 && (
                        <span className="skill-tag">
                          +{candidate.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {candidate.experience && (
                  <div className="candidate-section">
                    <div className="candidate-section-title">Experience</div>
                    <div style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
                      {candidate.experience}
                    </div>
                  </div>
                )}

                <div className="match-reasoning">
                  <strong>Why this candidate:</strong>
                  <div style={{ marginTop: '8px', lineHeight: '1.6' }}>
                    {candidate.match_reasoning}
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    className="button-lg"
                    style={{
                      width: '100%',
                      backgroundColor: selectedCandidates.includes(candidate.id) ? 'var(--success)' : 'var(--primary)'
                    }}
                  >
                    {selectedCandidates.includes(candidate.id) ? (
                      <>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected for Interview
                      </>
                    ) : (
                      <>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Select for Interview
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="button-group" style={{ marginTop: 32 }}>
          <button className="button-secondary button-lg" onClick={onBack}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
          <button
            className="button-primary button-lg"
            onClick={onSchedule}
            disabled={selectedCandidates.length === 0 || loading}
            style={{ flex: 1 }}
          >
            {loading ? (
              <>
                <svg className="spinner" style={{ width: 20, height: 20, margin: 0 }} fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scheduling Interviews...
              </>
            ) : (
              <>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule {selectedCandidates.length} Interview{selectedCandidates.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="loading" style={{ marginTop: 24 }}>
            <div className="spinner"></div>
            <div className="loading-text">Scheduling interviews with Google Calendar...</div>
            <div className="loading-subtitle">Creating calendar events and generating meeting links</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateReview;
