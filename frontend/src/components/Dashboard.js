import React from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentPlan, jobs, resumesProcessedThisMonth, getResumeUsagePercentage, getJobUsagePercentage, canCreateJob, totalCandidates } = useSubscription();

  const resumeUsage = getResumeUsagePercentage();
  const jobUsage = getJobUsagePercentage();

  const activeJobs = jobs.filter(job => job.status === 'active').length;

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'var(--success)';
    if (percentage < 80) return 'var(--warning)';
    return 'var(--danger)';
  };

  const handleCreateJob = () => {
    if (!canCreateJob()) {
      navigate('/billing');
      return;
    }
    navigate('/app');
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's an overview of your hiring activity.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Jobs</div>
            <div className="stat-value">{activeJobs}</div>
            <div className="stat-trend">This month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Candidates</div>
            <div className="stat-value">{totalCandidates}</div>
            <div className="stat-trend">Across all jobs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Resumes Processed</div>
            <div className="stat-value">{resumesProcessedThisMonth}</div>
            <div className="stat-trend">This month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Plan</div>
            <div className="stat-value">{currentPlan.name}</div>
            <div className="stat-trend" style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/billing')}>
              Upgrade →
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Usage Overview</h2>
          </div>
          <div className="usage-overview">
            <div className="usage-item">
              <div className="usage-header">
                <span className="usage-label">Resumes Processed</span>
                <span className="usage-value">{currentPlan.resumeLimit === Infinity ? 'Unlimited' : `${resumesProcessedThisMonth}/${currentPlan.resumeLimit}`}</span>
              </div>
              {currentPlan.resumeLimit !== Infinity && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${resumeUsage}%`, backgroundColor: getUsageColor(resumeUsage) }}
                  ></div>
                </div>
              )}
            </div>

            <div className="usage-item">
              <div className="usage-header">
                <span className="usage-label">Active Jobs</span>
                <span className="usage-value">{currentPlan.jobLimit === Infinity ? 'Unlimited' : `${activeJobs}/${currentPlan.jobLimit}`}</span>
              </div>
              {currentPlan.jobLimit !== Infinity && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${jobUsage}%`, backgroundColor: getUsageColor(jobUsage) }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Jobs</h2>
            <button className="button-ghost" onClick={() => navigate('/app/jobs')}>
              View All
            </button>
          </div>
          <div className="jobs-list">
            {jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="job-item">
                <div className="job-info">
                  <div className="job-title">{job.title}</div>
                  <div className="job-meta">
                    <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                      {job.status}
                    </span>
                    <span className="job-date">{new Date(job.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="job-candidates">
                  <span className="candidate-count">{job.candidates}</span>
                  <span className="candidate-label">candidates</span>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p>No jobs yet</p>
                <button className="button-primary" onClick={handleCreateJob}>
                  Create Your First Job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button className="action-card" onClick={handleCreateJob}>
            <div className="action-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="action-content">
              <div className="action-title">Create Job</div>
              <div className="action-description">Start a new hiring process</div>
            </div>
          </button>

          <button className="action-card" onClick={() => navigate('/app/jobs')}>
            <div className="action-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="action-content">
              <div className="action-title">View Jobs</div>
              <div className="action-description">Manage your job postings</div>
            </div>
          </button>

          <button className="action-card" onClick={() => navigate('/billing')}>
            <div className="action-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 24, height: 24 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="action-content">
              <div className="action-title">Manage Billing</div>
              <div className="action-description">Upgrade your plan</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
