import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

const ResumeUpload = ({ files, onFilesChange, onProcess, loading, onBack }) => {
  const { currentPlan, resumesProcessedThisMonth } = useSubscription();
  const remainingResumes = currentPlan.resumeLimit === Infinity 
    ? 'Unlimited' 
    : Math.max(0, currentPlan.resumeLimit - resumesProcessedThisMonth);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type === 'application/pdf'
      );
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).filter(file => 
        file.type === 'application/pdf'
      );
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upload Resumes</h2>
          <div className="badge badge-info">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Step 2 of 4
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{files.length}</div>
            <div className="stat-label">Resumes Uploaded</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{remainingResumes}</div>
            <div className="stat-label">Remaining This Month</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)}MB</div>
            <div className="stat-label">Total Size</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">PDF</div>
            <div className="stat-label">Format Only</div>
          </div>
        </div>

        <div
          className={`file-upload ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="resume-upload"
            multiple
            accept=".pdf"
            onChange={handleChange}
          />
          <label htmlFor="resume-upload">
            <div className="file-upload-icon">📄</div>
            <div className="file-upload-title">
              Drag and drop resumes here
            </div>
            <div className="file-upload-subtitle">
              or click to browse files (PDF only, max 10MB each)
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            <h3 className="file-list-title">
              Uploaded Resumes ({files.length})
            </h3>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <div>
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <div className="file-actions">
                  <button
                    className="button-danger button-ghost"
                    onClick={() => handleRemoveFile(index)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 16, height: 16 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentPlan.resumeLimit !== Infinity && files.length > remainingResumes && (
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <div className="alert-title">Limit Exceeded</div>
              <div className="alert-message">
                You only have {remainingResumes} resume processing{remainingResumes !== 1 ? 's' : ''} remaining this month. Please remove {files.length - remainingResumes} file{files.length - remainingResumes !== 1 ? 's' : ''} or upgrade to continue.
              </div>
            </div>
          </div>
        )}

        <div className="button-group">
          <button className="button-secondary button-lg" onClick={onBack}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
          <button
            className="button-primary button-lg"
            onClick={onProcess}
            disabled={files.length === 0 || loading}
            style={{ flex: 1 }}
          >
            {loading ? (
              <>
                <svg className="spinner" style={{ width: 20, height: 20, margin: 0 }} fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Resumes...
              </>
            ) : (
              <>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Process Resumes with AI
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <div className="loading-text">AI is analyzing resumes...</div>
            <div className="loading-subtitle">This may take a moment depending on the number of resumes</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
