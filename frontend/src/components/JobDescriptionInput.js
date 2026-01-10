import React from 'react';

const JobDescriptionInput = ({ jobData, onChange, onNext }) => {
  const handleChange = (field) => (e) => {
    onChange({
      ...jobData,
      [field]: e.target.value,
    });
  };

  const isValid = jobData.jobTitle && jobData.jobDescription && jobData.requirements && jobData.skills;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Job Details</h2>
        <div className="badge badge-info">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Step 1 of 4
        </div>
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label>Job Title</label>
          <span className="badge badge-warning">Required</span>
        </div>
        <input
          type="text"
          value={jobData.jobTitle}
          onChange={handleChange('jobTitle')}
          placeholder="e.g., Senior Software Engineer"
          required
        />
        <p className="input-hint">Enter the exact job title as it will appear in postings</p>
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label>Job Description</label>
          <span className="badge badge-warning">Required</span>
        </div>
        <textarea
          value={jobData.jobDescription}
          onChange={handleChange('jobDescription')}
          placeholder="Describe the role, key responsibilities, team structure, and what makes this opportunity exciting..."
          required
        />
        <p className="input-hint">Be specific about day-to-day responsibilities and team culture</p>
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label>Requirements</label>
          <span className="badge badge-warning">Required</span>
        </div>
        <textarea
          value={jobData.requirements}
          onChange={handleChange('requirements')}
          placeholder="Enter requirements separated by commas (e.g., 5+ years experience, Python, AWS, Degree in Computer Science)"
          required
        />
        <p className="input-hint">Include education, years of experience, certifications, and other must-haves</p>
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label>Required Skills</label>
          <span className="badge badge-warning">Required</span>
        </div>
        <textarea
          value={jobData.skills}
          onChange={handleChange('skills')}
          placeholder="Enter required skills separated by commas (e.g., Python, JavaScript, React, Docker, AWS, CI/CD)"
          required
        />
        <p className="input-hint">List technical skills, frameworks, tools, and languages needed for this role</p>
      </div>

      <div className="form-group">
        <label>Experience Level</label>
        <select value={jobData.experienceLevel} onChange={handleChange('experienceLevel')}>
          <option value="entry">Entry Level (0-2 years)</option>
          <option value="mid">Mid-Level (2-5 years)</option>
          <option value="senior">Senior (5-10 years)</option>
          <option value="lead">Lead/Principal (10+ years)</option>
        </select>
        <p className="input-hint">Helps AI evaluate candidates based on appropriate experience expectations</p>
      </div>

      <div className="button-group">
        <button className="button-lg button-primary" onClick={onNext} disabled={!isValid}>
          Continue to Upload
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
