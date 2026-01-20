import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.full_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('=== Starting registration ===');
      console.log('Form data:', formData);
      
      const result = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        company_name: formData.company_name || undefined,
        confirm_password: formData.confirmPassword
      });
      console.log('Registration successful, navigating to dashboard...', result);
      navigate('/app/dashboard');
    } catch (err) {
      console.error('=== Registration failed ===', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code
      });
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'var(--danger)';
    if (passwordStrength <= 3) return 'var(--warning)';
    if (passwordStrength <= 4) return 'var(--info)';
    return 'var(--success)';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">HR</div>
            <div className="logo-text">HireAI</div>
          </div>
          <h1>Create Account</h1>
          <p>Start your AI-powered hiring journey</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <div className="alert-message">{error}</div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="full_name"
              className="form-input"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Name (Optional)</label>
            <input
              type="text"
              name="company_name"
              className="form-input"
              placeholder="Your Company"
              value={formData.company_name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={8}
            />
            {formData.password && (
              <div className="password-strength">
                <div 
                  className="strength-bar" 
                  style={{ 
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: getStrengthColor()
                  }}
                />
                <span style={{ color: getStrengthColor(), fontSize: '12px', marginLeft: '8px' }}>
                  {getStrengthText()}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          <button 
            type="submit" 
            className="button-primary button-lg" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" style={{ width: 20, height: 20, margin: 0 }} fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zm3 8h3" />
                </svg>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              className="button-link" 
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
