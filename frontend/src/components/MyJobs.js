import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

const MyJobs = () => {
  const navigate = useNavigate();
  const { jobs, currentPlan, activeJobCount, canCreateJob, addJob, updateJobStatus, getJobUsagePercentage } = useSubscription();
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');

  const jobUsage = getJobUsagePercentage();

  const handleCreateJob = () => {
    if (!canCreateJob()) {
      navigate('/billing');
      return;
    }

    if (!newJobTitle.trim()) return;

    const newJob = addJob({ title: newJobTitle });
    if (newJob) {
      setNewJobTitle('');
      setShowNewJobModal(false);
      navigate(`/app?job=${newJob.id}`);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      active: 'badge-success',
      closed: 'badge-secondary',
      paused: 'badge-warning'
    };
    return classes[status] || 'badge-secondary';
  };

  const handleJobClick = (jobId) => {
    navigate(`/app?job=${jobId}`);
  };

  return (
    <div className="my-jobs">
      <div className="page-header">
        <h1 className="page-title">My Jobs</h1>
        <p className="page-subtitle">Manage your job postings and track candidates</p>
      </div>

      <div className="jobs-header">
        <div className="jobs-stats">
          <div className="jobs-stat">
            <span className="stat-number">{jobs.length}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
          <div className="jobs-stat">
            <span className="stat-number">{jobs.filter(j => j.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="jobs-stat">
            <span className="stat-number">{jobs.filter(j => j.status === 'closed').length}</span>
            <span className="stat-label">Closed</span>
          </div>
        </div>
        <button 
          className="button-primary button-lg"
          onClick={() => canCreateJob() ? setShowNewJobModal(true) : navigate('/billing')}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20, marginRight: 8 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Job
        </button>
      </div>

      {!canCreateJob() && (
        <div className="alert alert-warning">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <div className="alert-title">Job Limit Reached</div>
            <div className="alert-message">
              You've reached your limit of {currentPlan.jobLimit} active jobs. 
              <button className="button-link" onClick={() => navigate('/billing')} style={{ marginLeft: 8 }}>
                Upgrade to create more jobs
              </button>
            </div>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>📋</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900)' }}>
            No Jobs Yet
          </h2>
          <p style={{ fontSize: 16, color: 'var(--gray-600)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            Create your first job posting to start finding the perfect candidates with AI-powered resume screening.
          </p>
          <button className="button-primary button-lg" onClick={() => setShowNewJobModal(true)}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20, marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Job
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card" onClick={() => handleJobClick(job.id)}>
              <div className="job-card-header">
                <h3 className="job-card-title">{job.title}</h3>
                <span className={`badge ${getStatusBadge(job.status)}`}>
                  {job.status}
                </span>
              </div>
              <div className="job-card-body">
                <div className="job-card-stat">
                  <div className="job-card-stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="job-card-stat-content">
                    <div className="job-card-stat-value">{job.candidates}</div>
                    <div className="job-card-stat-label">Candidates</div>
                  </div>
                </div>
                <div className="job-card-stat">
                  <div className="job-card-stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="job-card-stat-content">
                    <div className="job-card-stat-value">{new Date(job.date).toLocaleDateString()}</div>
                    <div className="job-card-stat-label">Created</div>
                  </div>
                </div>
              </div>
              <div className="job-card-footer">
                {job.status === 'active' ? (
                  <button 
                    className="button-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateJobStatus(job.id, 'closed');
                    }}
                  >
                    Close Job
                  </button>
                ) : (
                  <button 
                    className="button-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateJobStatus(job.id, 'active');
                    }}
                  >
                    Reopen Job
                  </button>
                )}
                <button className="button-primary">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewJobModal && (
        <div className="modal-overlay" onClick={() => setShowNewJobModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Job</h2>
              <button className="modal-close" onClick={() => setShowNewJobModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Senior Frontend Developer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                />
              </div>
              <div className="alert alert-info">
                <div className="alert-icon">ℹ️</div>
                <div className="alert-content">
                  <div className="alert-title">Job Limit</div>
                  <div className="alert-message">
                    You have {currentPlan.jobLimit - activeJobCount} job slots remaining on your {currentPlan.name} plan.
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowNewJobModal(false)}>
                Cancel
              </button>
              <button 
                className="button-primary" 
                onClick={handleCreateJob}
                disabled={!newJobTitle.trim()}
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
